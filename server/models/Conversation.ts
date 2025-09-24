import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    lastMessage: {type: String},
}, {timestamps: true});

const ConversationModel = mongoose.model('Conversation', ConversationSchema);

export default ConversationModel;