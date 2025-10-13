import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    content: { type: String },
    type: { type: String, enum: ["text", "file", "system"], default: "text" },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
