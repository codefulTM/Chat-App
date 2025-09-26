import jwtMiddleware from "../middlewares/jwtMiddleware.js";
import express from 'express';
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

export default router;