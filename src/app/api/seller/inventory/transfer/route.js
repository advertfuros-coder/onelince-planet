// app/api/seller/inventory/transfer/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Warehouse from "@/lib/db/models/Warehouse";
import InventoryLog from "@/lib/db/models/InventoryLog";
import { verifyToken } from "@/lib/utils/auth";

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, fromWarehouseId, toWarehouseId, quantity, reason } =
      await request.json();

    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json(
        { success: false, message: "Source and destination must be different" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);

    if (!product || !fromWarehouse || !toWarehouse) {
      return NextResponse.json(
        { success: false, message: "Missing required entities" },
        { status: 404 }
      );
    }

    // Check availability in source
    const inventoryItem = fromWarehouse.inventory.find(
      (item) => item.productId.toString() === productId
    );
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock in source warehouse" },
        { status: 400 }
      );
    }

    const prevStock = product.inventory?.stock || 0;

    // Perform transfer
    await fromWarehouse.updateInventory(productId, quantity, "subtract");
    await toWarehouse.updateInventory(productId, quantity, "add");

    // Total stock shouldn't change in a transfer, but syncing ensures data integrity
    const allWarehouses = await Warehouse.find({ sellerId: decoded.userId });
    let newTotalStock = 0;
    allWarehouses.forEach((wh) => {
      const item = wh.inventory.find(
        (inv) => inv.productId.toString() === productId
      );
      if (item) newTotalStock += item.quantity;
    });

    product.inventory.stock = newTotalStock;
    await product.save();

    // Log the movements
    await InventoryLog.create({
      sellerId: decoded.userId,
      productId,
      warehouseId: fromWarehouseId,
      type: "transfer",
      quantity: -quantity,
      previousStock: prevStock,
      newStock: newTotalStock,
      reason: `Transfer to ${toWarehouse.name}: ${reason}`,
      performedBy: decoded.userId,
      metadata: { direction: "out", peerWarehouse: toWarehouseId },
    });

    await InventoryLog.create({
      sellerId: decoded.userId,
      productId,
      warehouseId: toWarehouseId,
      type: "transfer",
      quantity: quantity,
      previousStock: prevStock,
      newStock: newTotalStock,
      reason: `Transfer from ${fromWarehouse.name}: ${reason}`,
      performedBy: decoded.userId,
      metadata: { direction: "in", peerWarehouse: fromWarehouseId },
    });

    return NextResponse.json({
      success: true,
      message: "Stock successfully transferred across hubs",
      newTotalStock,
    });
  } catch (error) {
    console.error("Transfer POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
