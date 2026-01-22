// lib/db/models/ForumPost.js
import mongoose from "mongoose";

const ForumPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorType: {
      type: String,
      enum: ["seller", "admin", "moderator"],
      required: true,
    },

    // Post details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: [
        "general",
        "getting_started",
        "marketing",
        "operations",
        "technical",
        "success_stories",
        "questions",
        "announcements",
      ],
      required: true,
    },
    tags: [String],

    // Engagement
    views: {
      type: Number,
      default: 0,
    },
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
      enum: ["published", "draft", "archived", "deleted", "flagged"],
      default: "published",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isLocked: {
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

    // Replies
    replyCount: {
      type: Number,
      default: 0,
    },
    lastReplyAt: Date,
    lastReplyBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // SEO
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Analytics
    analytics: {
      uniqueViews: { type: Number, default: 0 },
      avgReadTime: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
ForumPostSchema.index({ category: 1, status: 1, createdAt: -1 });
ForumPostSchema.index({ authorId: 1, status: 1 });
ForumPostSchema.index({ tags: 1 });
ForumPostSchema.index({ "likes.userId": 1 });

// Virtual for like count
ForumPostSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Method to add like
ForumPostSchema.methods.addLike = function (userId) {
  const alreadyLiked = this.likes.some(
    (like) => like.userId.toString() === userId.toString(),
  );
  if (!alreadyLiked) {
    this.likes.push({ userId });
  }
  return this.save();
};

// Method to remove like
ForumPostSchema.methods.removeLike = function (userId) {
  this.likes = this.likes.filter(
    (like) => like.userId.toString() !== userId.toString(),
  );
  return this.save();
};

// Method to increment views
ForumPostSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Generate slug from title
ForumPostSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now();
  }
  next();
});

export default mongoose.models.ForumPost ||
  mongoose.model("ForumPost", ForumPostSchema);
