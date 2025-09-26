import jwtMiddleware from "../middlewares/jwtMiddleware.js";
import express from 'express';
import MessageModel from "../models/Message.js";
import ConversationModel from "../models/Conversation.js";

const router = express.Router();

router.get('/', jwtMiddleware, async (req, res) => {
    const reqObject = req as any;
    const userId = reqObject.user.id;
    try {
        const conversations = await ConversationModel.find({members: {$in: [userId]}});
        return res.json({
            success: true,
            message: conversations
        });
    }
    catch(err) {
        return res.json({
            success: false,
            message: 'Database error'
        });
    }
});

router.get('/:conversationId/messages', async (req, res) => {
    const { limit = 10, skip = 0 } = req.query;
    const conversationId = req.params.conversationId;
    try {
        const messages = await MessageModel.find({
            conversationId: conversationId
        })
            .skip(Number(skip))
            .limit(Number(limit))
            .sort({createdAt: -1});
        return res.json({
            success: true,
            message: messages
        });
    }
    catch(err) {
        return res.json({
            success: false,
            message: 'Database error'
        });
    }
});

export default router;