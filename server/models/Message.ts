import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversationId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Conversation'},
    sender: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    receiver: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    content: {type: String, required: true},
    type: {type: String, enum: ['text', 'image', 'system'], default: 'text'},
    status: {type: String, enum: ['sent', 'delivered', 'read'], default: 'sent'}
}, {timestamps: true});

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;