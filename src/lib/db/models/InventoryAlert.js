// lib/db/models/InventoryAlert.js
import mongoose from "mongoose";

const InventoryAlertSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    // Alert type
    alertType: {
      type: String,
      enum: [
        "low_stock",
        "out_of_stock",
        "overstock",
        "restock_needed",
        "expiring_soon",
      ],
      required: true,
    },

    // Alert details
    currentStock: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    recommendedRestock: Number,

    // Status
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved", "dismissed"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Actions taken
    acknowledgedAt: Date,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    actionTaken: String,

    // Notification
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: Date,
    notificationChannels: [
      {
        type: String,
        enum: ["email", "sms", "push", "in_app"],
      },
    ],

    // Auto-actions
    autoRestockEnabled: {
      type: Boolean,
      default: false,
    },
    autoRestockTriggered: {
      type: Boolean,
      default: false,
    },
    autoRestockOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // Predictive analytics
    prediction: {
      enabled: {
        type: Boolean,
        default: false,
      },
      salesVelocity: Number, // Units per day
      predictedStockOutDays: Number,
      confidence: Number, // 0-100
      lastCalculated: Date,
    },

    // Sales velocity data (for predictions)
    salesHistory: [
      {
        date: Date,
        unitsSold: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes
InventoryAlertSchema.index({ sellerId: 1, status: 1, priority: -1 });
InventoryAlertSchema.index({ productId: 1, alertType: 1, status: 1 });
InventoryAlertSchema.index({ sellerId: 1, createdAt: -1 });

// Method to acknowledge alert
InventoryAlertSchema.methods.acknowledge = function (userId) {
  this.status = "acknowledged";
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = userId;
  return this.save();
};

// Method to resolve alert
InventoryAlertSchema.methods.resolve = function (actionTaken) {
  this.status = "resolved";
  this.resolvedAt = new Date();
  this.actionTaken = actionTaken;
  return this.save();
};

// Method to dismiss alert
InventoryAlertSchema.methods.dismiss = function () {
  this.status = "dismissed";
  return this.save();
};

// Static method to create alert
InventoryAlertSchema.statics.createAlert = async function (alertData) {
  // Check if similar active alert exists
  const existingAlert = await this.findOne({
    sellerId: alertData.sellerId,
    productId: alertData.productId,
    alertType: alertData.alertType,
    status: "active",
  });

  if (existingAlert) {
    // Update existing alert
    existingAlert.currentStock = alertData.currentStock;
    existingAlert.priority = alertData.priority;
    return existingAlert.save();
  }

  // Create new alert
  return this.create(alertData);
};

// Static method to check and create alerts for a product
InventoryAlertSchema.statics.checkProductInventory = async function (
  productId,
  sellerId
) {
  const Product = mongoose.model("Product");
  const product = await Product.findById(productId);

  if (!product) return null;

  const alerts = [];
  const currentStock = product.inventory?.stock || 0;
  const lowStockThreshold = product.inventory?.lowStockThreshold || 10;
  const reorderPoint = product.inventory?.reorderPoint || 20;

  // Out of stock
  if (currentStock === 0) {
    alerts.push(
      await this.createAlert({
        sellerId,
        productId,
        alertType: "out_of_stock",
        currentStock: 0,
        threshold: 0,
        priority: "critical",
        recommendedRestock: reorderPoint,
      })
    );
  }
  // Low stock
  else if (currentStock <= lowStockThreshold) {
    alerts.push(
      await this.createAlert({
        sellerId,
        productId,
        alertType: "low_stock",
        currentStock,
        threshold: lowStockThreshold,
        priority: currentStock <= lowStockThreshold / 2 ? "high" : "medium",
        recommendedRestock: reorderPoint - currentStock,
      })
    );
  }
  // Restock needed
  else if (currentStock <= reorderPoint) {
    alerts.push(
      await this.createAlert({
        sellerId,
        productId,
        alertType: "restock_needed",
        currentStock,
        threshold: reorderPoint,
        priority: "medium",
        recommendedRestock: reorderPoint,
      })
    );
  }

  return alerts.filter(Boolean);
};

// Static method to calculate sales velocity and predict stock out
InventoryAlertSchema.statics.calculatePrediction = async function (
  productId,
  sellerId
) {
  const Order = mongoose.model("Order");
  const Product = mongoose.model("Product");

  // Get sales data from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await Order.find({
    sellerId,
    "items.productId": productId,
    createdAt: { $gte: thirtyDaysAgo },
    status: { $in: ["completed", "delivered"] },
  });

  // Calculate total units sold
  let totalUnitsSold = 0;
  orders.forEach((order) => {
    const item = order.items.find(
      (i) => i.productId.toString() === productId.toString()
    );
    if (item) totalUnitsSold += item.quantity;
  });

  // Calculate sales velocity (units per day)
  const salesVelocity = totalUnitsSold / 30;

  // Get current stock
  const product = await Product.findById(productId);
  const currentStock = product?.inventory?.stock || 0;

  // Predict stock out days
  const predictedStockOutDays =
    salesVelocity > 0 ? Math.floor(currentStock / salesVelocity) : 999;

  // Calculate confidence based on data consistency
  const confidence = Math.min(95, 50 + orders.length * 2); // More orders = higher confidence

  return {
    salesVelocity: Math.round(salesVelocity * 100) / 100,
    predictedStockOutDays,
    confidence,
    currentStock,
    recommendedQuantity: Math.ceil(salesVelocity * 30), // 30 days worth
  };
};

// Static method to check warehouse-specific inventory
InventoryAlertSchema.statics.checkWarehouseInventory = async function (
  warehouseId,
  sellerId
) {
  const Warehouse = mongoose.model("Warehouse");
  const warehouse = await Warehouse.findById(warehouseId);

  if (!warehouse) return null;

  const alerts = [];

  // Check each product in warehouse
  for (const item of warehouse.inventory) {
    if (item.quantity <= 10) {
      // Low stock threshold
      alerts.push(
        await this.createAlert({
          sellerId,
          productId: item.productId,
          warehouseId,
          alertType: item.quantity === 0 ? "out_of_stock" : "low_stock",
          currentStock: item.quantity,
          threshold: 10,
          priority: item.quantity === 0 ? "critical" : "high",
        })
      );
    }
  }

  return alerts.filter(Boolean);
};

// Static method to trigger auto-restock
InventoryAlertSchema.statics.triggerAutoRestock = async function (alertId) {
  const Supplier = mongoose.model("Supplier");
  const alert = await this.findById(alertId).populate("productId");

  if (!alert || alert.autoRestockTriggered) return null;

  // Find preferred supplier
  const supplier = await Supplier.getPreferredSupplier(
    alert.productId._id,
    alert.sellerId
  );

  if (!supplier || !supplier.autoRestock.enabled) return null;

  const quantity = alert.recommendedRestock || 20;

  // Create restock order based on supplier method
  if (supplier.autoRestock.method === "email") {
    // Send email to supplier
    const { sendEmail } = await import("../utils/emailService.js");
    await sendEmail({
      to: supplier.email,
      subject: `Auto-Restock Order - ${alert.productId.name}`,
      html: `
        <h2>Automatic Restock Order</h2>
        <p><strong>Product:</strong> ${alert.productId.name}</p>
        <p><strong>SKU:</strong> ${alert.productId.sku}</p>
        <p><strong>Quantity Needed:</strong> ${quantity} units</p>
        <p><strong>Urgency:</strong> ${alert.priority}</p>
        <p>Please confirm this order at your earliest convenience.</p>
      `,
    });
  } else if (supplier.autoRestock.method === "api") {
    // Call supplier API (implement based on supplier's API)
    // This is a placeholder
    console.log("API restock would be triggered here");
  }

  // Mark as triggered
  alert.autoRestockTriggered = true;
  await alert.save();

  return { success: true, supplier, quantity };
};

export default mongoose.models.InventoryAlert ||
  mongoose.model("InventoryAlert", InventoryAlertSchema);
