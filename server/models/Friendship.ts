import mongoose, { Document, Schema } from "mongoose";

export interface IFriendship extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ensure that only one friendship exists between two users
FriendshipSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Middleware to ensure that senderId and receiverId are not the same
FriendshipSchema.pre("save", function (next) {
  if (this.senderId.equals(this.receiverId)) {
    const error = new Error("Sender and receiver cannot be the same person");
    return next(error);
  }
  next();
});

const FriendshipModel = mongoose.model<IFriendship>(
  "Friendship",
  FriendshipSchema
);

export default FriendshipModel;
