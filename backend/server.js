import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not set. Backend chat will fail until you add it to .env");
}

if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI not set. Conversations will not persist until you add it.");
}

if (MONGO_URI) connectDB(MONGO_URI);

app.use("/api", chatRoutes);

app.get("/", (req, res) => res.send({ status: "ok", serverTime: new Date() }));

app.listen(PORT, () => console.log(`🚀 Backend listening on ${PORT}`));
