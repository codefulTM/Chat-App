import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import path from "path";
import fs from "fs";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

import UserModel from "./models/User.js";
import ConversationModel from "./models/Conversation.js";
import MessageModel from "./models/Message.js";

import authRouter from "./routes/auth.js";
import conversationsRouter from "./routes/conversations.js";
import usersRouter from "./routes/users.js";
import jwtMiddleware from "./middlewares/jwtMiddleware.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not set");
}
mongoose.connect(process.env.MONGO_URI);

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// api routes
// Add a new route for file uploads
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success: true,
    fileUrl: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
  });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
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

io.on("connection", async (socket) => {
  // Set the user to online and attach the socket to that user
  const userId = socket.userId;

  const onlineUser = await UserModel.findByIdAndUpdate(userId, {
    isOnline: true,
  });

  // notify all users that the current user is online
  io.emit("user_online", onlineUser);

  if (!onlineMap.has(userId)) {
    onlineMap.set(userId, new Set());
  }
  onlineMap.get(userId).add(socket.id);

  socket.on("private_message", async (payload, ack) => {
    try {
      // payload: { toUserId, conversationId?, content, fileUrl?, fileName?, type? }
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
        fileUrl: payload.fileUrl || "",
        fileName: payload.fileName || "",
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

      // check if the receiver is Gemini AI
      let receiverIsGemini = false;
      let geminiId;
      const user = await UserModel.findById(payload.toUserId);
      if (user?.username === "gemini") {
        receiverIsGemini = true;
        geminiId = user?._id;
      }

      // if the receiver is not AI, send to receiver if online
      if (!receiverIsGemini) {
        if (onlineMap.has(payload.toUserId) && payload.toUserId !== userId) {
          const receiverSockets = onlineMap.get(payload.toUserId);
          for (const socketId of receiverSockets) {
            io.to(socketId).emit("private_message", {
              message,
            });
          }
        }
      }
      // if the receiver is AI, send the message request to gemini API
      // and receive response
      else {
        try {
          // Handle image processing if provided
          let result;

          if (payload.fileUrl && payload.type === "file") {
            // Check if it's an image file
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
              payload.fileName || ""
            );

            if (isImage) {
              // Read the uploaded image file
              const imagePath = path.join(process.cwd(), payload.fileUrl);
              if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                const imageBase64 = imageBuffer.toString("base64");

                // Determine MIME type based on file extension
                const ext = path.extname(payload.fileName || "").toLowerCase();
                const mimeTypes: { [key: string]: string } = {
                  ".jpg": "image/jpeg",
                  ".jpeg": "image/jpeg",
                  ".png": "image/png",
                  ".gif": "image/gif",
                  ".bmp": "image/bmp",
                  ".webp": "image/webp",
                };
                const mimeType = mimeTypes[ext] || "image/jpeg";

                // Create content with image and text
                const imagePart = {
                  inlineData: {
                    data: imageBase64,
                    mimeType: mimeType,
                  },
                };

                const textPart =
                  payload.content ||
                  "What can you see in this image? Please describe it in detail.";

                result = await model.generateContent([textPart, imagePart]);
              } else {
                // Fallback to regular text if image file not found
                result = await model.generateContent(
                  `User sent an image but it couldn't be processed. They said: ${payload.content}`
                );
              }
            } else {
              // Non-image file, handle as regular text with file info
              result = await model.generateContent(
                `${payload.content}\n\nUser sent a file: ${payload.fileName}`
              );
            }
          } else {
            // Regular text message
            result = await model.generateContent(payload.content);
          }

          const response = result.response.text();

          // save the message generated by Gemini
          let message = await MessageModel.create({
            conversationId: payload.conversationId,
            sender: geminiId,
            receiver: userId,
            content: response,
            type: "text",
            fileUrl: "",
            fileName: "",
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
              lastMessage: response,
            }
          );
        } catch (error) {
          console.error("Error with Gemini API:", error);
          // Send error message back to user
          io.to(socket.id).emit("private_message", {
            message: {
              content:
                "Sorry, I encountered an error processing your request. Please try again.",
              sender: { displayName: "Gemini", _id: geminiId },
              type: "text",
            },
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

  socket.on("disconnect", async () => {
    // remove the socket from onlineMap
    const set = onlineMap.get(userId);
    set.delete(socket.id);
    if (set.size === 0) {
      onlineMap.delete(userId);
      const offlineUser = await UserModel.findByIdAndUpdate(userId, {
        isOnline: false,
      });
      io.emit("user_offline", offlineUser);
    }
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log("Server is running on port ", process.env.PORT || 4000);

  // add user gemini if not exist
  UserModel.findOne({ username: "gemini" }).then((user) => {
    if (!user) {
      UserModel.create({
        username: "gemini",
        email: "gemini@chat.com",
        password: "gemini",
        displayName: "Gemini",
        avatarUrl: "https://i.pravatar.cc/150?u=gemini",
      });
    }
  });
});
