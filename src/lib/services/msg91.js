// lib/services/msg91.js
import axios from "axios";

class MSG91Service {
  constructor() {
    this.apiUrl = "https://api.msg91.com/api/v5";
    this.whatsappApiUrl = "https://api.msg91.com/api/v5/whatsapp";
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.MSG91_SENDER_ID || "ONLPLT";
    this.templateIds = {
      orderConfirmation: process.env.MSG91_TEMPLATE_ORDER_CONFIRMATION,
      orderProcessing: process.env.MSG91_TEMPLATE_ORDER_PROCESSING,
      orderPacked: process.env.MSG91_TEMPLATE_ORDER_PACKED,
      orderShipped: process.env.MSG91_TEMPLATE_ORDER_SHIPPED,
      orderOutForDelivery: process.env.MSG91_TEMPLATE_ORDER_OUT_FOR_DELIVERY,
      orderDelivered: process.env.MSG91_TEMPLATE_ORDER_DELIVERED,
      orderCancelled: process.env.MSG91_TEMPLATE_ORDER_CANCELLED,
      returnRequested: process.env.MSG91_TEMPLATE_RETURN_REQUESTED,
      returnApproved: process.env.MSG91_TEMPLATE_RETURN_APPROVED,
      refundProcessed: process.env.MSG91_TEMPLATE_REFUND_PROCESSED,
    };
  }

  /**
   * Send WhatsApp message using MSG91 API
   */
  async sendWhatsAppMessage(phone, templateId, parameters = {}) {
    try {
      // Clean phone number (ensure it has country code)
      const cleanPhone = phone.startsWith("91")
        ? phone
        : `91${phone.replace(/[^0-9]/g, "")}`;

      const payload = {
        integrated_number: this.senderId,
        content_type: "template",
        payload: {
          messaging_product: "whatsapp",
          type: "template",
          template: {
            name: templateId,
            language: {
              code: "en",
              policy: "deterministic",
            },
            ...(Object.keys(parameters).length > 0 && {
              components: [
                {
                  type: "body",
                  parameters: Object.values(parameters).map((value) => ({
                    type: "text",
                    text: String(value),
                  })),
                },
              ],
            }),
          },
        },
      };

      const response = await axios.post(
        `${this.whatsappApiUrl}/whatsapp-outbound-message/`,
        payload,
        {
          headers: {
            authkey: this.authKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("MSG91 WhatsApp sent:", {
        phone: cleanPhone,
        templateId,
        success: true,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "MSG91 WhatsApp Error:",
        error.response?.data || error.message
      );
      // Don't throw error - notifications shouldn't block order processing
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS using MSG91 API
   */
  async sendSMS(phone, message) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, "");

      const response = await axios.get(`${this.apiUrl}/sendSMS`, {
        params: {
          authkey: this.authKey,
          mobiles: `91${cleanPhone}`,
          message: message,
          sender: this.senderId,
          route: "4", // Transactional route
          country: "91",
        },
      });

      console.log("MSG91 SMS sent:", { phone: cleanPhone, success: true });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("MSG91 SMS Error:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Order Confirmation Notification
   */
  async notifyOrderConfirmed(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    // WhatsApp notification
    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderConfirmation || "order_confirmation_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
        order_total: `₹${order.pricing.total.toFixed(2)}`,
        order_date: new Date(order.createdAt).toLocaleDateString("en-IN"),
      }
    );

    // SMS as backup
    const smsMessage = `Dear ${customer.name}, Your order ${order.orderNumber} of ₹${order.pricing.total} has been confirmed. Track at onlineplanet.com - Team Online Planet`;
    await this.sendSMS(phone, smsMessage);
  }

  /**
   * Order Processing Notification
   */
  async notifyOrderProcessing(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderProcessing || "order_processing_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
      }
    );
  }

  /**
   * Order Packed Notification
   */
  async notifyOrderPacked(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderPacked || "order_packed_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
      }
    );
  }

  /**
   * Order Shipped Notification
   */
  async notifyOrderShipped(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderShipped || "order_shipped_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
        tracking_id:
          order.shipping?.trackingId || order.shiprocket?.awbCode || "N/A",
        courier_name:
          order.shipping?.carrier || order.shiprocket?.courierName || "Courier",
      }
    );

    const smsMessage = `Your order ${order.orderNumber} is shipped via ${
      order.shipping?.carrier || "courier"
    }. Track ID: ${order.shipping?.trackingId || "N/A"}. - Online Planet`;
    await this.sendSMS(phone, smsMessage);
  }

  /**
   * Order Out for Delivery Notification
   */
  async notifyOrderOutForDelivery(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderOutForDelivery || "order_out_for_delivery_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
      }
    );

    const smsMessage = `Your order ${order.orderNumber} is out for delivery today. Please be available. - Online Planet`;
    await this.sendSMS(phone, smsMessage);
  }

  /**
   * Order Delivered Notification
   */
  async notifyOrderDelivered(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderDelivered || "order_delivered_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
      }
    );

    const smsMessage = `Your order ${order.orderNumber} has been delivered. Thank you for shopping with Online Planet! Please rate your experience.`;
    await this.sendSMS(phone, smsMessage);
  }

  /**
   * Order Cancelled Notification
   */
  async notifyOrderCancelled(order, customer, reason) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.orderCancelled || "order_cancelled_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
        cancellation_reason: reason || "As per request",
      }
    );

    if (order.payment.status === "paid" && order.payment.method !== "cod") {
      const smsMessage = `Order ${order.orderNumber} cancelled. Refund of ₹${order.pricing.total} will be processed in 5-7 business days. - Online Planet`;
      await this.sendSMS(phone, smsMessage);
    }
  }

  /**
   * Return Request Notification
   */
  async notifyReturnRequested(order, customer) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.returnRequested || "return_requested_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
      }
    );
  }

  /**
   * Return Approved Notification
   */
  async notifyReturnApproved(order, customer, pickupDate) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.returnApproved || "return_approved_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
        pickup_date: pickupDate || "within 2-3 business days",
      }
    );
  }

  /**
   * Refund Processed Notification
   */
  async notifyRefundProcessed(order, customer, refundAmount) {
    const phone = customer.phone || order.shippingAddress.phone;

    await this.sendWhatsAppMessage(
      phone,
      this.templateIds.refundProcessed || "refund_processed_template",
      {
        customer_name: customer.name || order.shippingAddress.name,
        order_number: order.orderNumber,
        refund_amount: `₹${refundAmount.toFixed(2)}`,
      }
    );

    const smsMessage = `Refund of ₹${refundAmount} for order ${order.orderNumber} has been processed. Amount will reflect in 5-7 business days. - Online Planet`;
    await this.sendSMS(phone, smsMessage);
  }

  /**
   * Seller Notification - New Order
   */
  async notifySellerNewOrder(order, seller) {
    if (!seller.phone) return;

    const sellerItems = order.items.filter(
      (item) => item.seller.toString() === seller._id.toString()
    );

    const totalAmount = sellerItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const message = `New Order Alert! 🎉\n\nOrder #${
      order.orderNumber
    }\nItems: ${sellerItems.length}\nAmount: ₹${totalAmount.toFixed(
      2
    )}\n\nLogin to your seller panel to process this order.\n\n- Online Planet`;

    await this.sendSMS(seller.phone, message);
  }
}

const msg91Service = new MSG91Service();
export default msg91Service;
