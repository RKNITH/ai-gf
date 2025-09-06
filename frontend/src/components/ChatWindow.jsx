import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import VoiceControls from "./VoiceControls";
import { sendMessage } from "../api/api";
import { FiSend } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function ChatWindow() {
    const [sessionId] = useState(() => {
        // keep one session in localStorage
        const s = localStorage.getItem("mygf_session");
        if (s) return s;
        const id = uuidv4();
        localStorage.setItem("mygf_session", id);
        return id;
    });

    const [messages, setMessages] = useState(() => {
        const raw = localStorage.getItem("mygf_msgs");
        return raw ? JSON.parse(raw) : [];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // voice
    const [voiceSettings, setVoiceSettings] = useState({ voice: null, rate: 1, pitch: 1 });
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utterRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("mygf_msgs", JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        setTimeout(() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
        }, 50);
    }

    async function handleSend() {
        const trimmed = input.trim();
        if (!trimmed) return;
        const userMsg = { role: "user", text: trimmed, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await sendMessage(sessionId, trimmed);
            const aiText = res.reply || "No reply";
            const assistantMsg = { role: "assistant", text: aiText, createdAt: new Date().toISOString() };
            setMessages(prev => [...prev, assistantMsg]);
            // auto speak the reply
            speakText(aiText);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "assistant", text: "Sorry, something went wrong. Try again.", createdAt: new Date().toISOString() }]);
        } finally {
            setLoading(false);
        }
    }

    function speakText(text) {
        if (!("speechSynthesis" in window)) return;
        if (utterRef.current) {
            window.speechSynthesis.cancel();
            utterRef.current = null;
        }
        const utter = new SpeechSynthesisUtterance(text);
        if (voiceSettings.voice) utter.voice = voiceSettings.voice;
        utter.rate = voiceSettings.rate || 1;
        utter.pitch = voiceSettings.pitch || 1;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        utterRef.current = utter;
        window.speechSynthesis.speak(utter);
    }

    function cancelSpeak() {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }

    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="max-w-3xl mx-auto h-screen flex flex-col bg-slate-50">
            <header className="bg-white shadow-sm py-4 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold">GF</div>

                </div>

            </header>

            <main className="flex-1 overflow-hidden flex flex-col">
                <div ref={listRef} className="flex-1 p-4 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 mt-20">Say hi 👋 — start a warm conversation</div>
                    )}
                    <div className="flex flex-col">
                        {messages.map((m, idx) => (
                            <MessageBubble key={idx} message={m} />
                        ))}
                        {loading && (
                            <div className="text-slate-500 text-sm mt-2">Typing...</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border-t p-3">
                    <div className="flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            rows={1}
                            placeholder="Type a message... (Enter to send)"
                            className="flex-1 p-3 rounded-md border resize-none"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="px-4 py-3 rounded-md bg-indigo-600 text-white flex items-center gap-2"
                        >
                            <FiSend />
                            Send
                        </button>
                    </div>
                    <VoiceControls
                        speak={() => {
                            // speak last assistant message
                            const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                            if (lastAssistant) speakText(lastAssistant.text);
                        }}
                        isSpeaking={isSpeaking}
                        cancelSpeak={cancelSpeak}
                        setVoiceSettings={setVoiceSettings}
                    />
                </div>
            </main>
        </div>
    );
}
