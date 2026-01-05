// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  image: String,
  icon: String, // Icon identifier for UI (e.g., 'Zap', 'Tag', etc.)
  
  // Hierarchical Structure
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    default: 1
  },
  // Full path for easy filtering (e.g., "fashion/men/t-shirts")
  path: {
    type: String,
    required: true,
    index: true
  },
  
  // Business Logic
  commissionRate: {
    type: Number,
    default: 5 // percentage
  },
  requiresApproval: {
    type: Boolean,
    default: false // If true, products in this category need admin approval
  },
  
  // Status & Display
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Metadata
  productCount: {
    type: Number,
    default: 0
  },
  attributeTemplate: [{
    name: String, // e.g., "Warranty Period", "Connectivity"
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect'],
      default: 'text'
    },
    options: [String], // For select/multiselect
    required: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
categorySchema.index({ parentId: 1, isActive: 1 });
categorySchema.index({ level: 1, isActive: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ slug: 1 }, { unique: true });

// Virtual for children (if needed)
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Pre-save middleware to auto-generate path
categorySchema.pre('save', async function(next) {
  if (this.isModified('parentId') || this.isModified('slug')) {
    if (this.parentId) {
      const parent = await mongoose.model('Category').findById(this.parentId);
      if (parent) {
        this.path = `${parent.path}/${this.slug}`;
        this.level = parent.level + 1;
      }
    } else {
      this.path = this.slug;
      this.level = 1;
    }
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
