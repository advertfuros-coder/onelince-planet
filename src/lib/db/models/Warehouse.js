// lib/db/models/Warehouse.js
import mongoose from "mongoose";

const WarehouseSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["main", "regional", "fulfillment", "dropship"],
      default: "main",
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      landmark: String,
    },
    contact: {
      name: String,
      phone: String,
      email: String,
    },
    capacity: {
      total: { type: Number, default: 0 }, // in cubic meters or units
      used: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    inventory: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 0,
        },
        reservedQuantity: {
          type: Number,
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      autoRestock: {
        type: Boolean,
        default: false,
      },
      restockThreshold: {
        type: Number,
        default: 10,
      },
      priority: {
        type: Number,
        default: 1, // 1 = highest priority for fulfillment
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    metrics: {
      totalProducts: { type: Number, default: 0 },
      totalStock: { type: Number, default: 0 },
      ordersProcessed: { type: Number, default: 0 },
      averageProcessingTime: { type: Number, default: 0 }, // in hours
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
WarehouseSchema.index({ sellerId: 1, code: 1 });
WarehouseSchema.index({ sellerId: 1, "settings.isActive": 1 });

// Method to update inventory
WarehouseSchema.methods.updateInventory = async function (
  productId,
  quantity,
  operation = "add"
) {
  const inventoryItem = this.inventory.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (inventoryItem) {
    if (operation === "add") {
      inventoryItem.quantity += quantity;
    } else if (operation === "subtract") {
      inventoryItem.quantity = Math.max(0, inventoryItem.quantity - quantity);
    } else if (operation === "set") {
      inventoryItem.quantity = quantity;
    }
    inventoryItem.lastUpdated = new Date();
  } else {
    this.inventory.push({
      productId,
      quantity: Math.max(0, quantity),
      reservedQuantity: 0,
    });
  }

  // Update capacity
  this.capacity.used = this.inventory.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  this.capacity.available = this.capacity.total - this.capacity.used;

  await this.save();
  return this;
};

// Method to reserve inventory
WarehouseSchema.methods.reserveInventory = async function (
  productId,
  quantity
) {
  const inventoryItem = this.inventory.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (
    !inventoryItem ||
    inventoryItem.quantity - inventoryItem.reservedQuantity < quantity
  ) {
    throw new Error("Insufficient inventory");
  }

  inventoryItem.reservedQuantity += quantity;
  await this.save();
  return this;
};

// Method to release reserved inventory
WarehouseSchema.methods.releaseReservation = async function (
  productId,
  quantity
) {
  const inventoryItem = this.inventory.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (inventoryItem) {
    inventoryItem.reservedQuantity = Math.max(
      0,
      inventoryItem.reservedQuantity - quantity
    );
    await this.save();
  }
  return this;
};

// Method to transfer inventory
WarehouseSchema.statics.transferInventory = async function (
  fromWarehouseId,
  toWarehouseId,
  productId,
  quantity
) {
  const fromWarehouse = await this.findById(fromWarehouseId);
  const toWarehouse = await this.findById(toWarehouseId);

  if (!fromWarehouse || !toWarehouse) {
    throw new Error("Warehouse not found");
  }

  await fromWarehouse.updateInventory(productId, quantity, "subtract");
  await toWarehouse.updateInventory(productId, quantity, "add");

  return { from: fromWarehouse, to: toWarehouse };
};

export default mongoose.models.Warehouse ||
  mongoose.model("Warehouse", WarehouseSchema);
