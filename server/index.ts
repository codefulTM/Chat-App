import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";

import UserModel from "./models/User.js";
import ConversationModel from "./models/Conversation.js";
import MessageModel from "./models/Message.js";

import authRouter from "./routes/auth.js";
import conversationsRouter from "./routes/conversations.js";
import usersRouter from "./routes/users.js";
import jwtMiddleware from "./middlewares/jwtMiddleware.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not set");
}
mongoose.connect(process.env.MONGO_URI);

// api routes
app.use("/api/auth", authRouter);
app.use("/api/conversations", jwtMiddleware, conversationsRouter);
app.use("/api/users", jwtMiddleware, usersRouter);

// attach socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token.split(" ")[1];
    if (!token) {
      return next(new Error("Authentication error"));
    }
    if (!process.env.JWT_SECRET) {
      return next(new Error("The JWT_SECRET is not found"));
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload === "string" || !payload.id) {
      return next(new Error("Invalid token payload"));
    }
    socket.userId = payload.id;
    return next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

const onlineMap = new Map();

io.on("connection", (socket) => {
  // Set the user to online and attach the socket to that user
  const userId = socket.userId;
  if (!onlineMap.has(userId)) {
    onlineMap.set(userId, new Set());
  }
  onlineMap.get(userId).add(socket.id);

  // notify to every user that the current user is online
  io.emit("user_online", { userId });

  socket.on("private_message", async (payload, ack) => {
    try {
      // payload: { toUserId, conversationId?, content }
      // create a new conversation if there is no conversation id
      if (!payload.conversationId) {
        let conv = await ConversationModel.findOne({
          members: {
            $all: [payload.toUserId, userId],
            $size: 2,
          },
        });
        if (!conv) {
          conv = await ConversationModel.create({
            members: [userId, payload.toUserId],
          });
        }
        payload.conversationId = conv._id;
      }

      // create a new message
      let message = await MessageModel.create({
        conversationId: payload.conversationId,
        sender: userId,
        receiver: payload.toUserId,
        content: payload.content,
        type: payload.type || "text",
      });
      message = await message.populate({
        path: "sender",
        model: "User",
      });

      // send the message information to the sender
      io.to(socket.id).emit("private_message", { message });

      // update the latest message of the conversation
      const conv = await ConversationModel.findByIdAndUpdate(
        payload.conversationId,
        {
          lastMessage: payload.content,
        }
      );

      // send to receiver if online
      if (onlineMap.has(payload.toUserId) && payload.toUserId !== userId) {
        const receiverSockets = onlineMap.get(payload.toUserId);
        for (const socketId of receiverSockets) {
          io.to(socketId).emit("private_message", {
            message,
          });
        }
      }
    } catch (err) {
      if (ack) {
        ack({ ok: false, message: (err as Error).message });
      }
    }
  });

  socket.on("message_read", async (payload) => {
    // update message status
    const message = await MessageModel.findByIdAndUpdate(payload.messageId, {
      status: "read",
    });

    // if the sender is online, notify the sender
    if (onlineMap.has(message?.sender.toString())) {
      const senderSockets = onlineMap.get(message?.sender.toString());
      for (const socketId of senderSockets) {
        io.to(socketId).emit("message_read", {
          messageId: payload.messageId,
          conversationId: payload.conversationId,
        });
      }
    }
  });

  socket.on("typing", (payload) => {
    // notify the receiver that the sender is typing, if the receiver is online
    const receiverId = payload.toUserId;
    const receiverSockets = onlineMap.get(receiverId);
    if (receiverSockets) {
      for (const socketId of receiverSockets) {
        io.to(socketId).emit("typing", {
          sender: userId,
          conversationId: payload.conversationId,
          isTyping: true,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    // remove the socket from onlineMap
    const set = onlineMap.get(userId);
    set.delete(socket.id);
    if (set.size === 0) {
      onlineMap.delete(userId);
    }
    // notify to every user that the current user has been offline
    io.emit("user_offline", { userId });
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log("Server is running on port ", process.env.PORT || 4000);
});
