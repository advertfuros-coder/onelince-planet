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
              options.reason,
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
        "name email phone",
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
        (Date.now() - deliveryDate) / (1000 * 60 * 60 * 24),
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
        "name email phone",
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
          options.pickupDate || "within 2-3 business days",
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
    try {
      const customer = order.customer;
      if (!customer) return; // Skip if no customer data
      await msg91Service.notifyOrderProcessing(order, customer);
    } catch (error) {
      console.error("Notify order processing error:", error);
    }
  }

  async notifyOrderPacked(order) {
    try {
      const customer = order.customer;
      if (!customer) return; // Skip if no customer data
      await msg91Service.notifyOrderPacked(order, customer);
    } catch (error) {
      console.error("Notify order packed error:", error);
    }
  }

  async notifyOrderShipped(order) {
    try {
      const customer = order.customer;
      if (!customer) return; // Skip if no customer data
      await msg91Service.notifyOrderShipped(order, customer);
      await emailService.sendOrderShipped(order, customer);
    } catch (error) {
      console.error("Notify order shipped error:", error);
    }
  }

  async notifyOrderOutForDelivery(order) {
    try {
      const customer = order.customer;
      if (!customer) return; // Skip if no customer data
      await msg91Service.notifyOrderOutForDelivery(order, customer);
    } catch (error) {
      console.error("Notify order out for delivery error:", error);
    }
  }

  async notifyOrderDelivered(order) {
    try {
      const customer = order.customer;
      if (!customer) return; // Skip if no customer data
      await msg91Service.notifyOrderDelivered(order, customer);
      await emailService.sendOrderDelivered(order, customer);
    } catch (error) {
      console.error("Notify order delivered error:", error);
    }
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
      sellerGSTIN: seller.businessInfo?.gstin || "",
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

  /**
   * Generate HTML invoice for customers
   */
  generateInvoiceHtml(order, seller) {
    const deliveryDate = order.shipping?.deliveredAt
      ? new Date(order.shipping.deliveredAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const sellerName =
      seller?.businessInfo?.businessName || seller?.name || "Online Planet";
    const sellerGST = seller?.businessInfo?.gstin || "N/A";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 5px;
        }
        .company-info p {
            color: #666;
            font-size: 14px;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h2 {
            font-size: 32px;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .meta-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
        }
        .meta-box h3 {
            color: #2563eb;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        .meta-box p {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
        }
        .meta-box strong {
            color: #1f2937;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        thead {
            background: #2563eb;
            color: white;
        }
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
            font-size: 14px;
        }
        tbody tr:hover {
            background: #f9fafb;
        }
        .text-right { text-align: right; }
        .totals {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        .totals-table {
            width: 350px;
        }
        .totals-table tr {
            border-bottom: 1px solid #e5e7eb;
        }
        .totals-table td {
            padding: 12px 15px;
        }
        .totals-table .grand-total {
            background: #2563eb;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        @media print {
            body { padding: 0; background: white; }
            .invoice-container { box-shadow: none; }
            .no-print { display: none; }
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .print-button:hover {
            background: #1d4ed8;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>
    
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <h1>${sellerName}</h1>
                <p>Dubai, UAE</p>
                <p>GST: ${sellerGST}</p>
            </div>
            <div class="invoice-title">
                <h2>INVOICE</h2>
                <p style="color: #6b7280; font-size: 14px;">
                    <strong>Invoice #:</strong> ${order.orderNumber}<br>
                    <strong>Date:</strong> ${orderDate}
                </p>
                <div style="margin-top: 10px;">
                    <span class="status-badge">✓ DELIVERED</span>
                </div>
            </div>
        </div>

        <div class="invoice-meta">
            <div class="meta-box">
                <h3>Bill To</h3>
                <p>
                    <strong>${order.shippingAddress.name}</strong><br>
                    ${order.shippingAddress.addressLine1}<br>
                    ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + "<br>" : ""}
                    ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                    ${order.shippingAddress.pincode}<br>
                    Phone: ${order.shippingAddress.phone}
                </p>
            </div>
            <div class="meta-box">
                <h3>Delivery Information</h3>
                <p>
                    <strong>Order Date:</strong> ${orderDate}<br>
                    <strong>Delivery Date:</strong> ${deliveryDate}<br>
                    <strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}<br>
                    <strong>Tracking ID:</strong> ${order.shipping?.trackingId || "N/A"}<br>
                    <strong>Carrier:</strong> ${order.shipping?.carrier || "N/A"}
                </p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items
                  .map(
                    (item) => `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>${item.sku || "N/A"}</td>
                        <td class="text-right">₹${item.price.toLocaleString("en-IN")}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right"><strong>₹${(item.price * item.quantity).toLocaleString("en-IN")}</strong></td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td>Subtotal</td>
                    <td class="text-right"><strong>₹${order.pricing.subtotal.toLocaleString("en-IN")}</strong></td>
                </tr>
                ${
                  order.pricing.shipping > 0
                    ? `
                <tr>
                    <td>Shipping</td>
                    <td class="text-right"><strong>₹${order.pricing.shipping.toLocaleString("en-IN")}</strong></td>
                </tr>
                `
                    : ""
                }
                ${
                  order.pricing.tax > 0
                    ? `
                <tr>
                    <td>Tax (GST)</td>
                    <td class="text-right"><strong>₹${order.pricing.tax.toLocaleString("en-IN")}</strong></td>
                </tr>
                `
                    : ""
                }
                ${
                  order.pricing.discount > 0
                    ? `
                <tr>
                    <td>Discount</td>
                    <td class="text-right" style="color: #10b981;"><strong>-₹${order.pricing.discount.toLocaleString("en-IN")}</strong></td>
                </tr>
                `
                    : ""
                }
                <tr class="grand-total">
                    <td>TOTAL</td>
                    <td class="text-right">₹${order.pricing.total.toLocaleString("en-IN")}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p><strong>Thank you for your purchase!</strong></p>
            <p style="margin-top: 10px;">
                This is a computer-generated invoice and does not require a signature.<br>
                For any queries, please contact us at info@onlineplanet.ae
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

const orderService = new OrderService();
export default orderService;
