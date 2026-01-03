import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, sparse: true },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest orders
    },

    // Guest order fields
    isGuestOrder: { type: Boolean, default: false },
    guestEmail: { type: String, required: false },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        images: [String],
        sku: String,
        hsn: String,
        weight: { type: Number, default: 0.5 },
        status: {
          type: String,
          enum: [
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
          ],
          default: "confirmed",
        },
      },
    ],

    pricing: {
      subtotal: Number,
      tax: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: Number,
    },

    shippingAddress: {
      name: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "ready_for_pickup",
        "pickup",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },

    notes: [
      {
        text: String,
        addedBy: String, // 'customer', 'seller', 'admin'
        addedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: false }, // Internal notes not visible to customer
      },
    ],

    tags: [String], // For organization: 'urgent', 'priority', 'gift', etc.

    documents: {
      packingSlip: String, // URL or path to packing slip PDF
      invoice: String, // URL or path to invoice PDF
      shippingLabel: String, // URL or path to shipping label
    },

    payment: {
      method: {
        type: String,
        enum: ["cod", "online", "card", "upi", "wallet"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
      couponCode: String,

      // Razorpay specific fields
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,

      // Payment details
      paymentDetails: {
        email: String,
        contact: String,
        method: String,
        bank: String,
        wallet: String,
        vpa: String,
        cardId: String,
      },

      // Refund tracking
      refunds: [
        {
          refundId: String,
          amount: Number,
          status: String,
          reason: String,
          createdAt: Date,
          processedAt: Date,
          failedAt: Date,
        },
      ],

      failureReason: String,
    },

    shipping: {
      trackingId: String,
      carrier: String,
      shippedAt: Date,
      estimatedDelivery: Date,
      deliveredAt: Date,
    },

    shiprocket: {
      orderId: String,
      shipmentId: String,
      awbCode: String,
      courierName: String,
      courierId: Number,
      pickupScheduledDate: Date,
      pickupTokenNumber: String,
      label: String,
      manifest: String,
      invoice: String,
      status: String,
      currentStatus: String,
      etd: Date,
    },

    pickup: {
      sellerMarked: { type: Boolean, default: false },
      sellerMarkedAt: Date,
      adminAssigned: { type: Boolean, default: false },
      adminAssignedAt: Date,
      adminAssignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      scheduled: { type: Boolean, default: false },
      scheduledDate: Date,
      pickedUp: { type: Boolean, default: false },
      pickedUpAt: Date,
      address: {
        name: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
      },
    },

    deliveryTracking: [
      {
        status: String,
        statusCode: String,
        activity: String,
        location: String,
        timestamp: Date,
        instructions: String,
      },
    ],

    timeline: [
      {
        status: String,
        description: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    cancellation: {
      reason: String,
      cancelledBy: String,
      cancelledAt: Date,
    },

    returnRequest: {
      reason: String,
      title: String,
      description: String,
      images: [String],
      status: {
        type: String,
        enum: [
          "requested",
          "approved",
          "rejected",
          "received",
          "quality_passed",
          "quality_failed",
          "refunded",
        ],
        default: "requested",
      },
      requestedAt: Date,
      resolvedAt: Date,
      refundAmount: Number,
      qualityCheck: {
        checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        checkedAt: Date,
        condition: {
          type: String,
          enum: ["new", "damaged", "used", "missing_parts", "wrong_item"],
        },
        comments: String,
        evidence: [String],
      },
    },

    dimensions: {
      length: { type: Number, default: 10 },
      breadth: { type: Number, default: 10 },
      height: { type: Number, default: 10 },
      weight: { type: Number, default: 0.5 },
    },
  },
  { timestamps: true }
);

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", OrderSchema);
