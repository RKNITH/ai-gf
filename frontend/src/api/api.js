import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function sendMessage(sessionId, message) {
    const res = await axios.post(`${BACKEND}/api/chat`, { sessionId, message }, { timeout: 60000 });
    return res.data;
}
