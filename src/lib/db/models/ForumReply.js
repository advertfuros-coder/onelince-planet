// lib/db/models/ForumReply.js
import mongoose from "mongoose";

const ForumReplySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reply details
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Threading
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
    },

    // Engagement
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["published", "deleted", "flagged"],
      default: "published",
    },
    isAcceptedAnswer: {
      type: Boolean,
      default: false,
    },

    // Moderation
    flagCount: {
      type: Number,
      default: 0,
    },
    flags: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        reason: String,
        flaggedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
ForumReplySchema.index({ postId: 1, status: 1, createdAt: 1 });
ForumReplySchema.index({ authorId: 1 });

// Virtual for like count
ForumReplySchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Method to add like
ForumReplySchema.methods.addLike = function (userId) {
  const alreadyLiked = this.likes.some(
    (like) => like.userId.toString() === userId.toString(),
  );
  if (!alreadyLiked) {
    this.likes.push({ userId });
  }
  return this.save();
};

// Update parent post reply count
ForumReplySchema.post("save", async function () {
  const ForumPost = mongoose.model("ForumPost");
  await ForumPost.findByIdAndUpdate(this.postId, {
    $inc: { replyCount: 1 },
    lastReplyAt: new Date(),
    lastReplyBy: this.authorId,
  });
});

export default mongoose.models.ForumReply ||
  mongoose.model("ForumReply", ForumReplySchema);
