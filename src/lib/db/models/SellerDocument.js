// lib/db/models/SellerDocument.js
import mongoose from "mongoose";

const SellerDocumentSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Document details
    documentType: {
      type: String,
      enum: [
        // Identity Documents
        "government_id",
        "passport",
        "drivers_license",
        "national_id",

        // Business Documents
        "business_registration",
        "trade_license",
        "certificate_of_incorporation",
        "partnership_deed",
        "gst_certificate",
        "vat_registration",

        // Address Proof
        "utility_bill",
        "bank_statement",
        "rental_agreement",

        // Tax Documents
        "pan_card",
        "tax_id",
        "w8_ben_form",
        "state_tax_id",

        // Bank Documents
        "cancelled_cheque",
        "bank_account_proof",

        // Additional
        "certificate_of_good_standing",
        "trademark_certificate",
        "product_certification",
        "other",
      ],
      required: true,
    },

    documentName: {
      type: String,
      required: true,
    },

    // File information
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: String,
    fileSize: Number,
    fileType: String,

    // Verification status
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "expired",
        "resubmission_required",
      ],
      default: "pending",
    },

    // Review details
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String,

    // Document validity
    issueDate: Date,
    expiryDate: Date,
    documentNumber: String,

    // Resubmission tracking
    isResubmission: {
      type: Boolean,
      default: false,
    },
    originalDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerDocument",
    },
    resubmissionCount: {
      type: Number,
      default: 0,
    },

    // Admin requests
    adminRequested: {
      type: Boolean,
      default: false,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestReason: String,
    requestedAt: Date,

    // Metadata
    notes: String,
    isRequired: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SellerDocumentSchema.index({ sellerId: 1, documentType: 1 });
SellerDocumentSchema.index({ sellerId: 1, status: 1 });
SellerDocumentSchema.index({ status: 1, createdAt: -1 });

// Virtual for days until expiry
SellerDocumentSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to approve document
SellerDocumentSchema.methods.approve = function (adminId, notes = "") {
  this.status = "approved";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Method to reject document
SellerDocumentSchema.methods.reject = function (adminId, reason) {
  this.status = "rejected";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to request resubmission
SellerDocumentSchema.methods.requestResubmission = function (adminId, reason) {
  this.status = "resubmission_required";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static method to get seller verification status
SellerDocumentSchema.statics.getVerificationStatus = async function (sellerId) {
  const documents = await this.find({ sellerId });

  const requiredDocs = documents.filter((d) => d.isRequired);
  const approvedDocs = documents.filter((d) => d.status === "approved");
  const pendingDocs = documents.filter(
    (d) => d.status === "pending" || d.status === "under_review"
  );
  const rejectedDocs = documents.filter(
    (d) => d.status === "rejected" || d.status === "resubmission_required"
  );

  const totalRequired = requiredDocs.length;
  const totalApproved = approvedDocs.filter((d) => d.isRequired).length;

  let verificationStatus = "incomplete";
  if (totalRequired > 0 && totalApproved === totalRequired) {
    verificationStatus = "verified";
  } else if (rejectedDocs.length > 0) {
    verificationStatus = "action_required";
  } else if (pendingDocs.length > 0) {
    verificationStatus = "pending_review";
  }

  return {
    status: verificationStatus,
    total: documents.length,
    required: totalRequired,
    approved: totalApproved,
    pending: pendingDocs.length,
    rejected: rejectedDocs.length,
    completionPercentage:
      totalRequired > 0 ? Math.round((totalApproved / totalRequired) * 100) : 0,
  };
};

// Static method to check expiring documents
SellerDocumentSchema.statics.getExpiringDocuments = async function (
  sellerId,
  daysThreshold = 30
) {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);

  return this.find({
    sellerId,
    status: "approved",
    expiryDate: {
      $gte: today,
      $lte: thresholdDate,
    },
  });
};

export default mongoose.models.SellerDocument ||
  mongoose.model("SellerDocument", SellerDocumentSchema);
