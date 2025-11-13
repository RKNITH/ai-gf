import axios from "axios";
import Conversation from "../models/conversation.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function chat(req, res) {
    try {
        const { sessionId, message } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Invalid message" });
        }
        if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

        // Save user's message to DB
        let conv = await Conversation.findOne({ sessionId });
        if (!conv) {
            conv = new Conversation({ sessionId, messages: [] });
        }
        conv.messages.push({ role: "user", text: message });
        await conv.save();

        // Build prompt for Gemini by summarizing conversation (simple approach: join last N messages)
        const lastMessages = conv.messages.slice(-8).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
        const prompt = `You are a warm, caring conversational partner that plays the role of a girlfriend. Speak naturally, empathetically, and with light playfulness. Keep responses safe, respectful, and consensual. Conversation so far:\n\n${lastMessages}\n\nAssistant:`;

        // Prepare payload for Gemini text generation
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || "512", 10)
            }
        };

        const model = "gemini-2.0-flash";
        const url = `${GEMINI_BASE}/${model}:generateContent`;

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            timeout: 30000
        });

        const aiText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't think of a reply right now.";

        // Save assistant reply
        conv.messages.push({ role: "assistant", text: aiText });
        await conv.save();

        res.json({ reply: aiText });

    } catch (err) {
        console.error("chat error:", err?.response?.data || err.message);
        res.status(500).json({ error: "Server error", detail: err?.response?.data || err.message });
    }
}
