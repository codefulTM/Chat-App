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
      members: {
        $all: [userId, toUserId],
      },
    });
    if (!data) {
      data = await ConversationModel.create({
        members: [userId, toUserId],
      });
    }
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

export default router;
