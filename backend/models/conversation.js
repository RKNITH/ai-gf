import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true }, // you can use a uuid from frontend
    messages: [MessageSchema],
    updatedAt: { type: Date, default: Date.now }
});

ConversationSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
