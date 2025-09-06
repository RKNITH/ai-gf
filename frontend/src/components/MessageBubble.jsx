import React from "react";

export default function MessageBubble({ message }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
            <div className={`${isUser ? "bg-indigo-600 text-white" : "bg-white text-slate-800 border"} max-w-[80%] p-3 rounded-lg shadow-sm`}>
                <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(message.createdAt || Date.now()).toLocaleTimeString()}</div>
            </div>
        </div>
    );
}
