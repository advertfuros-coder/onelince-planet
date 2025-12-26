// lib/services/orderService.js
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import Product from "@/lib/db/models/Product";
import msg91Service from "./msg91";
import emailService from "./emailService";

class OrderService {
  /**
   * Update order status with timeline and notifications
   */
  async updateOrderStatus(orderId, newStatus, options = {}) {
    try {
      const order = await Order.findById(orderId)
        .populate("customer", "name email phone")
        .populate("items.seller", "name email phone businessName");

      if (!order) {
        throw new Error("Order not found");
      }

      const previousStatus = order.status;
      order.status = newStatus;

      // Add to timeline
      order.timeline.push({
        status: newStatus,
        description:
          options.description || `Order status updated to ${newStatus}`,
        timestamp: new Date(),
      });

      // Update specific fields based on status
      switch (newStatus) {
        case "confirmed":
          // Already handled in order creation
          break;

        case "processing":
          // Order is being processed
          await this.notifyOrderProcessing(order);
          break;

        case "packed":
          // Order is packed and ready for pickup
          await this.notifyOrderPacked(order);
          break;

        case "shipped":
          // Update shipping details
          if (options.trackingId)
            order.shipping.trackingId = options.trackingId;
          if (options.carrier) order.shipping.carrier = options.carrier;
          if (options.estimatedDelivery)
            order.shipping.estimatedDelivery = options.estimatedDelivery;
          order.shipping.shippedAt = new Date();

          await this.notifyOrderShipped(order);
          break;

        case "out_for_delivery":
          // Out for delivery
          await this.notifyOrderOutForDelivery(order);
          break;

        case "delivered":
          // Order delivered
          order.shipping.deliveredAt = new Date();
          await this.notifyOrderDelivered(order);
          break;

        case "cancelled":
          // Handle cancellation
          order.cancellation = {
            reason: options.reason || "Cancelled by customer",
            cancelledBy: options.cancelledBy || "customer",
            cancelledAt: new Date(),
          };

          // Restock inventory
          await this.restockInventory(order);

          // Process refund if paid
          if (
            order.payment.status === "paid" &&
            order.payment.method !== "cod"
          ) {
            await this.processRefund(
              order,
              order.pricing.total,
              options.reason
            );
          }

          await this.notifyOrderCancelled(order, options.reason);
          break;

        case "returned":
          // Handle return - will be managed separately
          break;

        case "refunded":
          // Refund processed
          order.payment.status = "refunded";
          break;
      }

      await order.save();

      return { success: true, order };
    } catch (error) {
      console.error("Update order status error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason, cancelledBy = "customer") {
    try {
      const order = await Order.findById(orderId)
        .populate("customer", "name email phone")
        .populate("items.seller", "name email phone businessName");

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if order can be cancelled
      if (["shipped", "out_for_delivery", "delivered"].includes(order.status)) {
        throw new Error("Order cannot be cancelled after shipping");
      }

      return await this.updateOrderStatus(orderId, "cancelled", {
        reason,
        cancelledBy,
        description: `Order cancelled: ${reason}`,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Request return
   */
  async requestReturn(orderId, returnData) {
    try {
      const order = await Order.findById(orderId).populate(
        "customer",
        "name email phone"
      );

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if order is delivered
      if (order.status !== "delivered") {
        throw new Error("Only delivered orders can be returned");
      }

      // Check if within return window (7 days)
      const deliveryDate = order.shipping.deliveredAt;
      const daysSinceDelivery = Math.floor(
        (Date.now() - deliveryDate) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceDelivery > 7) {
        throw new Error("Return window has expired (7 days from delivery)");
      }

      // Update return request
      order.returnRequest = {
        reason: returnData.reason,
        title: returnData.title,
        description: returnData.description,
        images: returnData.images || [],
        status: "requested",
        requestedAt: new Date(),
      };

      order.timeline.push({
        status: "return_requested",
        description: `Return requested: ${returnData.reason}`,
        timestamp: new Date(),
      });

      await order.save();

      // Notify customer and seller
      await msg91Service.notifyReturnRequested(order, order.customer);

      // Notify seller about return request
      const uniqueSellers = [
        ...new Set(order.items.map((item) => item.seller.toString())),
      ];
      for (const sellerId of uniqueSellers) {
        const seller = await User.findById(sellerId);
        if (seller && seller.email) {
          // You can create a seller notification method
          console.log("Notify seller about return:", seller.email);
        }
      }

      return { success: true, order };
    } catch (error) {
      console.error("Request return error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve/Reject return
   */
  async processReturnRequest(orderId, action, options = {}) {
    try {
      const order = await Order.findById(orderId).populate(
        "customer",
        "name email phone"
      );

      if (!order || !order.returnRequest) {
        throw new Error("Return request not found");
      }

      if (action === "approved") {
        order.returnRequest.status = "approved";
        order.returnRequest.resolvedAt = new Date();
        order.status = "returned";

        order.timeline.push({
          status: "return_approved",
          description: "Return request approved",
          timestamp: new Date(),
        });

        // Notify customer about pickup
        await msg91Service.notifyReturnApproved(
          order,
          order.customer,
          options.pickupDate || "within 2-3 business days"
        );

        // Restock inventory
        await this.restockInventory(order);
      } else if (action === "rejected") {
        order.returnRequest.status = "rejected";
        order.returnRequest.resolvedAt = new Date();

        order.timeline.push({
          status: "return_rejected",
          description: `Return request rejected: ${
            options.reason || "Does not meet return criteria"
          }`,
          timestamp: new Date(),
        });
      }

      await order.save();
      return { success: true, order };
    } catch (error) {
      console.error("Process return error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process refund
   */
  async processRefund(order, refundAmount, reason = "") {
    try {
      if (order.payment.method === "cod") {
        // COD orders don't need refund
        return { success: true, message: "COD order - no refund needed" };
      }

      // Update order
      order.returnRequest = order.returnRequest || {};
      order.returnRequest.status = "refunded";
      order.returnRequest.refundAmount = refundAmount;
      order.payment.status = "refunded";

      order.timeline.push({
        status: "refunded",
        description: `Refund of ₹${refundAmount} processed${
          reason ? ": " + reason : ""
        }`,
        timestamp: new Date(),
      });

      await order.save();

      // Notify customer
      const customer = await User.findById(order.customer);
      if (customer) {
        await msg91Service.notifyRefundProcessed(order, customer, refundAmount);
      }

      // Here you would integrate with payment gateway to actually process refund
      // For Razorpay: razorpay.payments.refund(paymentId, { amount: refundAmount * 100 })
      console.log("Process refund via payment gateway:", {
        orderId: order._id,
        amount: refundAmount,
        paymentId: order.payment.transactionId,
      });

      return { success: true, refundAmount };
    } catch (error) {
      console.error("Process refund error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restock inventory when order is cancelled or returned
   */
  async restockInventory(order) {
    try {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.inventory = product.inventory || {};
          product.inventory.stock =
            (product.inventory.stock || 0) + item.quantity;
          await product.save();
          console.log(`Restocked ${item.quantity} units of ${product.name}`);
        }
      }
      return { success: true };
    } catch (error) {
      console.error("Restock inventory error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Edit order (before fulfillment)
   */
  async editOrder(orderId, updates) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      // Only allow editing for pending/confirmed orders
      if (!["pending", "confirmed"].includes(order.status)) {
        throw new Error("Order cannot be edited after processing has started");
      }

      // Update shipping address
      if (updates.shippingAddress) {
        order.shippingAddress = {
          ...order.shippingAddress,
          ...updates.shippingAddress,
        };

        order.timeline.push({
          status: order.status,
          description: "Shipping address updated",
          timestamp: new Date(),
        });
      }

      // Add order notes
      if (updates.notes) {
        order.notes = order.notes || [];
        order.notes.push({
          text: updates.notes,
          addedBy: updates.addedBy || "customer",
          timestamp: new Date(),
        });
      }

      await order.save();
      return { success: true, order };
    } catch (error) {
      console.error("Edit order error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(sellerId, dateRange = {}) {
    try {
      const match = {};

      if (sellerId) {
        match["items.seller"] = sellerId;
      }

      if (dateRange.startDate && dateRange.endDate) {
        match.createdAt = {
          $gte: new Date(dateRange.startDate),
          $lte: new Date(dateRange.endDate),
        };
      }

      const analytics = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$pricing.total" },
            averageOrderValue: { $avg: "$pricing.total" },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
            returnedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "returned"] }, 1, 0] },
            },
          },
        },
      ]);

      const statusBreakdown = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            revenue: { $sum: "$pricing.total" },
          },
        },
      ]);

      return {
        success: true,
        analytics: analytics[0] || {},
        statusBreakdown,
      };
    } catch (error) {
      console.error("Get order analytics error:", error);
      return { success: false, error: error.message };
    }
  }

  // Notification methods
  async notifyOrderProcessing(order) {
    const customer = order.customer;
    await msg91Service.notifyOrderProcessing(order, customer);
  }

  async notifyOrderPacked(order) {
    const customer = order.customer;
    await msg91Service.notifyOrderPacked(order, customer);
  }

  async notifyOrderShipped(order) {
    const customer = order.customer;
    await msg91Service.notifyOrderShipped(order, customer);
    await emailService.sendOrderShipped(order, customer);
  }

  async notifyOrderOutForDelivery(order) {
    const customer = order.customer;
    await msg91Service.notifyOrderOutForDelivery(order, customer);
  }

  async notifyOrderDelivered(order) {
    const customer = order.customer;
    await msg91Service.notifyOrderDelivered(order, customer);
    await emailService.sendOrderDelivered(order, customer);
  }

  async notifyOrderCancelled(order, reason) {
    const customer = order.customer;
    await msg91Service.notifyOrderCancelled(order, customer, reason);
    await emailService.sendOrderCancelled(order, customer, reason);
  }

  /**
   * Generate packing slip
   */
  generatePackingSlip(order) {
    // This would generate a PDF or formatted text
    return {
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleDateString("en-IN"),
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        sku: item.sku,
      })),
      shippingAddress: order.shippingAddress,
    };
  }

  /**
   * Generate GST invoice
   */
  generateGSTInvoice(order, seller) {
    // This would generate a GST-compliant PDF invoice
    return {
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate: new Date().toLocaleDateString("en-IN"),
      sellerGSTIN: seller.gstin || "",
      buyerName: order.shippingAddress.name,
      buyerAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        description: item.name,
        hsn: item.hsn || "",
        quantity: item.quantity,
        rate: item.price,
        taxableValue: item.price * item.quantity,
        cgst: item.price * item.quantity * 0.09, // 9% CGST
        sgst: item.price * item.quantity * 0.09, // 9% SGST
        total: item.price * item.quantity * 1.18,
      })),
      subtotal: order.pricing.subtotal,
      cgst: order.pricing.tax / 2,
      sgst: order.pricing.tax / 2,
      grandTotal: order.pricing.total,
    };
  }
}

const orderService = new OrderService();
export default orderService;
