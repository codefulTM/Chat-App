import express from "express";
import MessageModel from "../models/Message.js";
import ConversationModel from "../models/Conversation.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const reqObject = req as any;
  const userId = reqObject.user.id;
  try {
    const conversations = await ConversationModel.find({
      members: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "members",
        model: "User",
      });
    return res.json({
      success: true,
      message: conversations,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Database error",
    });
  }
});

router.get("/:toUserId", async (req, res) => {
  const reqObject = req as any;
  const userId = reqObject.user.id;
  const toUserId = req.params.toUserId;
  try {
    let data = await ConversationModel.findOne({
      $or: [{ members: [userId, toUserId] }, { members: [toUserId, userId] }],
    });
    if (!data) {
      data = await ConversationModel.create({
        members: [userId, toUserId],
      });
    }
    data = await data.populate({
      path: "members",
      model: "User",
    });
    return res.json({
      success: true,
      message: data,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Database error",
    });
  }
});

router.get("/:conversationId/messages", async (req, res) => {
  const { limit = 10, skip = 0 } = req.query;
  const conversationId = req.params.conversationId;
  try {
    const messages = await MessageModel.find({
      conversationId: conversationId,
    })
      .populate({
        path: "sender",
        model: "User",
      })
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    return res.json({
      success: true,
      message: messages,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Database error",
    });
  }
});

// Route to create conversation with Gemini AI
router.post("/gemini", async (req, res) => {
  const reqObject = req as any;
  const userId = reqObject.user.id;

  try {
    // Find the Gemini user
    const UserModel = (await import("../models/User.js")).default;
    const geminiUser = await UserModel.findOne({ username: "gemini" });

    if (!geminiUser) {
      return res.json({
        success: false,
        message: "Gemini AI user not found",
      });
    }

    // Find existing conversation with Gemini
    let conversation = await ConversationModel.findOne({
      members: {
        $all: [userId, geminiUser._id],
        $size: 2,
      },
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await ConversationModel.create({
        members: [userId, geminiUser._id],
      });
    }

    return res.json({
      success: true,
      message: conversation,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Database error",
    });
  }
});

export default router;
