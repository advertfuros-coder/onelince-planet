// app/api/seller/inventory-alerts/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import InventoryAlert from "@/lib/db/models/InventoryAlert";
import Product from "@/lib/db/models/Product";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all inventory alerts
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const alertType = searchParams.get("alertType");

    let query = { sellerId: decoded.userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (alertType) query.alertType = alertType;

    const alerts = await InventoryAlert.find(query)
      .populate("productId", "name images sku inventory")
      .populate("warehouseId", "name code")
      .sort({ priority: -1, createdAt: -1 })
      .limit(100);

    // Calculate stats
    const stats = {
      total: alerts.length,
      active: alerts.filter((a) => a.status === "active").length,
      critical: alerts.filter((a) => a.priority === "critical").length,
      high: alerts.filter((a) => a.priority === "high").length,
      byType: {
        out_of_stock: alerts.filter((a) => a.alertType === "out_of_stock")
          .length,
        low_stock: alerts.filter((a) => a.alertType === "low_stock").length,
        restock_needed: alerts.filter((a) => a.alertType === "restock_needed")
          .length,
        overstock: alerts.filter((a) => a.alertType === "overstock").length,
      },
    };

    return NextResponse.json({
      success: true,
      alerts,
      stats,
    });
  } catch (error) {
    console.error("Inventory Alerts GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create or update alert, or perform action
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { action, alertId, productId, actionTaken, data } =
      await request.json();

    // Handle different actions
    if (action === "acknowledge" && alertId) {
      const alert = await InventoryAlert.findById(alertId);
      if (!alert || alert.sellerId.toString() !== decoded.userId) {
        return NextResponse.json(
          { success: false, message: "Alert not found" },
          { status: 404 }
        );
      }

      await alert.acknowledge(decoded.userId);
      return NextResponse.json({
        success: true,
        message: "Alert acknowledged",
        alert,
      });
    }

    if (action === "resolve" && alertId) {
      const alert = await InventoryAlert.findById(alertId);
      if (!alert || alert.sellerId.toString() !== decoded.userId) {
        return NextResponse.json(
          { success: false, message: "Alert not found" },
          { status: 404 }
        );
      }

      await alert.resolve(actionTaken);
      return NextResponse.json({
        success: true,
        message: "Alert resolved",
        alert,
      });
    }

    if (action === "dismiss" && alertId) {
      const alert = await InventoryAlert.findById(alertId);
      if (!alert || alert.sellerId.toString() !== decoded.userId) {
        return NextResponse.json(
          { success: false, message: "Alert not found" },
          { status: 404 }
        );
      }

      await alert.dismiss();
      return NextResponse.json({
        success: true,
        message: "Alert dismissed",
        alert,
      });
    }

    if (action === "check_inventory" && productId) {
      // Check inventory for a specific product
      const alerts = await InventoryAlert.checkProductInventory(
        productId,
        decoded.userId
      );
      return NextResponse.json({
        success: true,
        message: "Inventory checked",
        alerts: alerts || [],
      });
    }

    if (action === "check_all") {
      // Check inventory for all products
      const products = await Product.find({
        sellerId: decoded.userId,
        "inventory.trackInventory": true,
      });

      let allAlerts = [];
      for (const product of products) {
        const alerts = await InventoryAlert.checkProductInventory(
          product._id,
          decoded.userId
        );
        if (alerts && alerts.length > 0) {
          allAlerts = [...allAlerts, ...alerts];

          // Send email notification for each new alert
          for (const alert of alerts) {
            if (!alert.notificationSent) {
              try {
                const { sendInventoryAlertEmail } = await import(
                  "@/lib/utils/emailService"
                );
                const User = mongoose.model("User");
                const seller = await User.findById(decoded.userId);
                await sendInventoryAlertEmail(alert, product, seller);

                alert.notificationSent = true;
                alert.notificationSentAt = new Date();
                alert.notificationChannels = ["email"];
                await alert.save();
              } catch (emailError) {
                console.error("Email notification error:", emailError);
              }
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Checked ${products.length} products`,
        alertsCreated: allAlerts.length,
        alerts: allAlerts,
      });
    }

    if (action === "check_warehouse" && data?.warehouseId) {
      // Check warehouse-specific inventory
      const alerts = await InventoryAlert.checkWarehouseInventory(data.warehouseId, decoded.userId)
      return NextResponse.json({
        success: true,
        message: 'Warehouse inventory checked',
        alerts: alerts || []
      })
    }

    if (action === "calculate_prediction" && productId) {
      // Calculate predictive analytics
      const prediction = await InventoryAlert.calculatePrediction(productId, decoded.userId)
      
      // Create predictive alert if stock out is imminent
      if (prediction.predictedStockOutDays <= 7 && prediction.predictedStockOutDays > 0) {
        try {
          const product = await Product.findById(productId)
          const User = mongoose.model('User')
          const seller = await User.findById(decoded.userId)
          
          // Send predictive alert email
          const { sendPredictiveAlertEmail } = await import('@/lib/utils/emailService')
          await sendPredictiveAlertEmail(product, prediction, seller)
        } catch (emailError) {
          console.error('Predictive email error:', emailError)
        }
      }
      
      return NextResponse.json({
        success: true,
        prediction
      })
    }

    if (action === "trigger_auto_restock" && alertId) {
      // Trigger auto-restock
      const result = await InventoryAlert.triggerAutoRestock(alertId)
      
      if (result) {
        try {
          // Send confirmation email
          const alert = await InventoryAlert.findById(alertId).populate('productId')
          const User = mongoose.model('User')
          const seller = await User.findById(decoded.userId)
          const { sendAutoRestockEmail } = await import('@/lib/utils/emailService')
          await sendAutoRestockEmail(alert.productId, result.quantity, result.supplier, seller)
        } catch (emailError) {
          console.error('Auto-restock email error:', emailError)
        }
        
        return NextResponse.json({
          success: true,
          message: 'Auto-restock triggered',
          result
        })
      }
      
      return NextResponse.json({
        success: false,
        message: 'Auto-restock not available for this product'
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Inventory Alerts POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
