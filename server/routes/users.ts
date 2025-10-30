import express from "express";
import UserModel from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const name =
    req.query.name && typeof req.query.name === "string"
      ? req.query.name.trim()
      : "";
  return res.json({
    success: true,
    message: await UserModel.find({
      displayName: { $regex: name, $options: "i" },
    }),
  });
});

router.get("/online", async (req, res) => {
  try {
    const onlineUsers = await UserModel.find({ isOnline: true });
    res.json({
      success: true,
      onlineUsers: onlineUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
