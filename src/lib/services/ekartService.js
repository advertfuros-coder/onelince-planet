// lib/services/ekartService.js
import axios from "axios";

const EKART_BASE_URL = "https://app.elite.ekartlogistics.in";

class EkartService {
  constructor() {
    this.clientId = process.env.EKART_CLIENT_ID;
    this.clientName = process.env.EKART_CLIENT_NAME;
    this.username = process.env.EKART_USERNAME;
    this.password = process.env.EKART_PASSWORD;
    this.env = process.env.EKART_ENV || "production";

    // Business details
    this.sellerName = process.env.EKART_SELLER_NAME;
    this.sellerAddress = process.env.EKART_SELLER_ADDRESS;
    this.gstNumber = process.env.EKART_GST_NUMBER;
    this.pickupLocationName = process.env.EKART_PICKUP_LOCATION_NAME;
    this.returnLocationName = process.env.EKART_RETURN_LOCATION_NAME;

    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token (cached for 24 hours)
   */
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log("🔑 Authenticating with Ekart...");

      const response = await axios.post(
        `${EKART_BASE_URL}/integrations/v2/auth/token/${this.clientId}`,
        {
          username: this.username,
          password: this.password,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      console.log("✅ Ekart authenticated successfully");
      return this.accessToken;
    } catch (error) {
      console.error(
        "❌ Ekart authentication error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with Ekart");
    }
  }

  /**
   * Get authorization headers
   */
  async getHeaders() {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Create shipment
   */
  async createShipment(shipmentData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(
        `${EKART_BASE_URL}/api/v1/package/create`,
        shipmentData,
        { headers }
      );

      console.log("✅ Ekart shipment created:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart create shipment error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Create shipment from order
   * @param {Object} order - The order object
   * @param {Object} [seller] - Optional seller details for pickup location
   */
  async createShipmentFromOrder(order, seller = null) {
    // Determine pickup details (default to env vars, override if seller provided)
    const pickupName = seller?.businessInfo?.businessName || this.pickupLocationName;
    const pickupAddress = seller?.pickupAddress 
      ? `${seller.pickupAddress.addressLine1}, ${seller.pickupAddress.addressLine2 || ''}, ${seller.pickupAddress.city}, ${seller.pickupAddress.state} - ${seller.pickupAddress.pincode}`
      : this.sellerAddress;
    const sellerName = seller?.businessInfo?.businessName || this.sellerName;
    const sellerGst = seller?.businessInfo?.gstNumber || this.gstNumber;

    const shipmentData = {
      client_id: this.clientId,
      client_name: this.clientName,
      seller_name: sellerName,
      seller_gst_number: sellerGst,
      pickup_location: {
        name: pickupName,
        address: pickupAddress,
      },
      return_location: {
        // Typically return location is same as pickup or central warehouse
        // For now using same logic as pickup if seller is provided
        name: seller ? pickupName : this.returnLocationName,
        address: seller ? pickupAddress : this.sellerAddress,
      },
      packages: [
        {
          order_number: order.orderNumber,
          order_date: new Date(order.createdAt).toISOString().split("T")[0],
          payment_mode: order.payment.method === "cod" ? "COD" : "PREPAID",
          amount: order.pricing.total,

          // Consignee details
          consignee_name: order.shippingAddress.name,
          consignee_phone: order.shippingAddress.phone,
          consignee_address: order.shippingAddress.addressLine1,
          consignee_address_2: order.shippingAddress.addressLine2 || "",
          consignee_city: order.shippingAddress.city,
          consignee_state: order.shippingAddress.state,
          consignee_pincode: order.shippingAddress.pincode,
          consignee_country: "India",

          // Package details
          weight: this.calculateWeight(order.items),
          length: 30,
          breadth: 20,
          height: 15,

          // Items
          items: order.items.map((item) => ({
            item_name: item.name,
            item_quantity: item.quantity,
            item_price: item.price,
            item_sku: item.sku || "",
          })),

          // Additional
          invoice_number: order.orderNumber,
          invoice_date: new Date(order.createdAt).toISOString().split("T")[0],
          gstin: this.gstNumber,

          // Customer email (optional)
          consignee_email: order.shippingAddress.email || "",
        },
      ],
    };

    return await this.createShipment(shipmentData);
  }

  /**
   * Calculate total weight from items
   */
  calculateWeight(items) {
    // Default to 1kg if no weight specified
    const totalWeight = items.reduce((acc, item) => {
      const itemWeight = item.weight || 0.5; // Default 500g per item
      return acc + itemWeight * item.quantity;
    }, 0);

    return Math.max(totalWeight, 0.5); // Minimum 500g
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(trackingId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.delete(
        `${EKART_BASE_URL}/api/v1/package/cancel?tracking_id=${trackingId}`,
        { headers }
      );

      console.log("✅ Ekart shipment cancelled:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart cancel shipment error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Track shipment (no auth required)
   */
  async trackShipment(trackingId) {
    try {
      const response = await axios.get(
        `${EKART_BASE_URL}/api/v1/track/${trackingId}`
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart track shipment error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Download shipping label (PDF)
   */
  async downloadLabel(trackingIds, jsonOnly = false) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${EKART_BASE_URL}/api/v1/package/label?json_only=${jsonOnly}`,
        { ids: Array.isArray(trackingIds) ? trackingIds : [trackingIds] },
        {
          headers,
          responseType: jsonOnly ? "json" : "arraybuffer",
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart download label error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Download manifest (PDF)
   */
  async downloadManifest(trackingIds) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${EKART_BASE_URL}/data/v2/generate/manifest`,
        { ids: Array.isArray(trackingIds) ? trackingIds : [trackingIds] },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart download manifest error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Check serviceability for pincode
   */
  async checkServiceability(pincode) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${EKART_BASE_URL}/api/v2/serviceability/${pincode}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart serviceability check error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get shipping rate estimate
   */
  async getEstimate(estimateData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${EKART_BASE_URL}/data/pricing/estimate`,
        estimateData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart estimate error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Add/register address
   */
  async addAddress(addressData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${EKART_BASE_URL}/api/v2/address`,
        addressData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart add address error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get all addresses
   */
  async getAddresses() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${EKART_BASE_URL}/api/v2/addresses`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart get addresses error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Add webhook
   */
  async addWebhook(webhookData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${EKART_BASE_URL}/api/v2/webhook`,
        webhookData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart add webhook error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get all webhooks
   */
  async getWebhooks() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${EKART_BASE_URL}/api/v2/webhook`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(
        "❌ Ekart get webhooks error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

const ekartService = new EkartService();
export default ekartService;
