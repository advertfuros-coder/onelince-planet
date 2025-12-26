// lib/db/models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // Review content
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    comment: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Media
    photos: [
      {
        url: String,
        cloudinaryId: String,
        caption: String,
      },
    ],

    videos: [
      {
        url: String,
        cloudinaryId: String,
        thumbnail: String,
        duration: Number,
        caption: String,
      },
    ],

    // Verification
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // Engagement
    helpful: {
      count: { type: Number, default: 0 },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    notHelpful: {
      count: { type: Number, default: 0 },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    // Seller response
    sellerResponse: {
      comment: String,
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      respondedAt: Date,
    },

    // Moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    moderatedAt: Date,

    moderationNotes: String,

    // Flags
    flags: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },

    // Sentiment analysis (AI)
    sentiment: {
      score: Number, // -1 to 1
      label: { type: String, enum: ["positive", "neutral", "negative"] },
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ verifiedPurchase: 1 });

// Virtual for user info
reviewSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Methods
reviewSchema.methods.markHelpful = function (userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;

    // Remove from not helpful if present
    const notHelpfulIndex = this.notHelpful.users.indexOf(userId);
    if (notHelpfulIndex > -1) {
      this.notHelpful.users.splice(notHelpfulIndex, 1);
      this.notHelpful.count -= 1;
    }
  }
};

reviewSchema.methods.markNotHelpful = function (userId) {
  if (!this.notHelpful.users.includes(userId)) {
    this.notHelpful.users.push(userId);
    this.notHelpful.count += 1;

    // Remove from helpful if present
    const helpfulIndex = this.helpful.users.indexOf(userId);
    if (helpfulIndex > -1) {
      this.helpful.users.splice(helpfulIndex, 1);
      this.helpful.count -= 1;
    }
  }
};

// Static methods
reviewSchema.statics.getProductStats = async function (productId) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats[0].ratingDistribution.forEach((rating) => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      distribution,
    };
  } catch (error) {
    console.error("getProductStats error:", error);
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
};

// Delete cached model
if (mongoose.models.Review) {
  delete mongoose.models.Review;
}

const Review = mongoose.model("Review", reviewSchema);

export default Review;
