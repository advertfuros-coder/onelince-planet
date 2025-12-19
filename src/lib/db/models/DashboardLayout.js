// lib/db/models/DashboardLayout.js
import mongoose from "mongoose";

const DashboardLayoutSchema = new mongoose.Schema(
  {
    // Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Layout Details
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },

    description: {
      type: String,
      maxlength: 500,
    },

    // Is this the default/active layout?
    isDefault: {
      type: Boolean,
      default: false,
    },

    // Layout Configuration
    // Array of widget positions and configurations
    widgets: [
      {
        // Widget ID (unique in this layout)
        id: {
          type: String,
          required: true,
        },

        // Widget Type (e.g., 'revenue-chart', 'recent-orders', etc.)
        type: {
          type: String,
          required: true,
        },

        // Grid position and size
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
          w: { type: Number, required: true }, // width
          h: { type: Number, required: true }, // height
        },

        // Widget-specific configuration
        config: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],

    // Breakpoint layouts (for responsive)
    breakpoints: {
      lg: { type: mongoose.Schema.Types.Mixed }, // Desktop
      md: { type: mongoose.Schema.Types.Mixed }, // Tablet
      sm: { type: mongoose.Schema.Types.Mixed }, // Mobile
    },

    // Sharing & Templates
    isPublic: {
      type: Boolean,
      default: false,
    },

    isTemplate: {
      type: Boolean,
      default: false,
    },

    // Usage stats
    lastUsed: Date,
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DashboardLayoutSchema.index({ userId: 1, isDefault: 1 });
DashboardLayoutSchema.index({ isTemplate: 1, isPublic: 1 });

// Ensure only one default layout per user
DashboardLayoutSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.models.DashboardLayout ||
  mongoose.model("DashboardLayout", DashboardLayoutSchema);
