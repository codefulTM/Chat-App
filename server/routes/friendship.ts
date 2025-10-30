import FriendshipModel from "../models/Friendship.js";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Get the user id
    const userId = (req as any).user.id;

    // Get a list of friends
    const friends = await FriendshipModel.find({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    }).populate("senderId receiverId");

    // Return the list to the client
    return res.json({ success: true, message: [...friends] });
  } catch (err) {
    return res.json({ success: false, message: "Database error" });
  }
});

/**
 * @route POST /api/friendships/request/:userId
 * @desc Send a friend request to another user
 * @access Private
 */
router.post("/request/:userId", async (req, res) => {
  try {
    const senderId = (req as any).user.id;
    const receiverId = req.params.userId;

    // Check if user is trying to send request to themselves
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    // Check if a friendship already exists
    const existingFriendship = await FriendshipModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({
        success: false,
        message:
          existingFriendship.status === "pending"
            ? "Friend request already sent"
            : "You are already friends with this user",
      });
    }

    // Create new friend request
    const newFriendship = new FriendshipModel({
      senderId,
      receiverId,
      status: "pending",
    });

    await newFriendship.save();

    // Populate user details for response
    await newFriendship.populate("senderId");
    await newFriendship.populate("receiverId");

    return res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      data: newFriendship,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send friend request",
    });
  }
});

/**
 * @route PUT /api/friendships/:friendshipId/accept
 * @desc Accept a friend request
 * @access Private
 */
router.put("/:friendshipId/accept", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const friendshipId = req.params.friendshipId;

    // Find the friend request
    const friendship = await FriendshipModel.findOne({
      _id: friendshipId,
      receiverId: userId, // Only the receiver can accept the request
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or already processed",
      });
    }

    // Update the status to accepted
    friendship.status = "accepted";
    friendship.updatedAt = new Date();
    await friendship.save();

    // Populate user details for response
    await friendship.populate("senderId");
    await friendship.populate("receiverId");

    return res.json({
      success: true,
      message: "Friend request accepted",
      data: friendship,
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
    });
  }
});

/**
 * @route GET /api/friendships/requests
 * @desc Get list of pending friend requests
 * @access Private
 * @returns List of pending friend requests where current user is the receiver
 */
router.get("/requests", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Find all pending friend requests where current user is the receiver
    const requests = await FriendshipModel.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("senderId")
      .sort({ createdAt: -1 }); // Most recent first

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch friend requests",
    });
  }
});

/**
 * @route GET /api/friendships/sent-requests
 * @desc Get list of friend requests sent by the current user
 * @access Private
 * @returns List of pending friend requests sent by the current user
 */
router.get("/sent-requests", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Find all pending friend requests sent by current user
    const sentRequests = await FriendshipModel.find({
      senderId: userId,
      status: "pending"
    })
      .populate("receiverId", "username displayName avatar")
      .sort({ createdAt: -1 }); // Most recent first

    return res.json({
      success: true,
      data: sentRequests,
    });
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent friend requests",
    });
  }
});

/**
 * @route DELETE /api/friendships/unfriend/:friendId
 * @desc Remove a friend
 * @access Private
 */
router.delete("/unfriend/:friendId", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const friendId = req.params.friendId;

    // Find and delete the friendship where both users are involved
    const result = await FriendshipModel.findOneAndDelete({
      $or: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Friendship not found or already removed",
      });
    }

    return res.json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove friend",
    });
  }
});

export default router;
