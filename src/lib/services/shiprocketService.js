// lib/services/shiprocketService.js
import axios from "axios";

class ShiprocketService {
  constructor() {
    this.baseURL = "https://apiv2.shiprocket.in/v1/external";
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Get authentication token (cached for 10 days)
   */
  async getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      console.log("🔑 Authenticating with Shiprocket...");

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });

      if (!response.data.token) {
        throw new Error("Authentication failed - no token received");
      }

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + 240 * 60 * 60 * 1000; // 10 days

      console.log("✅ Shiprocket authenticated successfully");
      return this.token;
    } catch (error) {
      console.error(
        "❌ Shiprocket auth error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with Shiprocket");
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();

    try {
      const response = await axios({
        url: `${this.baseURL}${endpoint}`,
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        `Shiprocket API error (${endpoint}):`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Create order in Shiprocket
   */
  async createOrder(orderData) {
    return await this.makeRequest("/orders/create/adhoc", {
      method: "POST",
      data: orderData,
    });
  }

  /**
   * Get courier serviceability
   */
  async getCourierServiceability(
    pickupPincode,
    deliveryPincode,
    weight,
    cod = 0
  ) {
    const params = {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: weight,
      cod: cod,
    };

    return await this.makeRequest("/courier/serviceability", {
      method: "GET",
      params,
    });
  }

  /**
   * Assign AWB to shipment
   */
  async assignAWB(shipmentId, courierId) {
    return await this.makeRequest("/courier/assign/awb", {
      method: "POST",
      data: {
        shipment_id: shipmentId,
        courier_id: courierId,
      },
    });
  }

  /**
   * Generate pickup request
   */
  async generatePickup(shipmentId) {
    return await this.makeRequest("/courier/generate/pickup", {
      method: "POST",
      data: {
        shipment_id: [shipmentId],
      },
    });
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentId) {
    return await this.makeRequest("/courier/generate/label", {
      method: "POST",
      data: {
        shipment_id: [shipmentId],
      },
    });
  }

  /**
   * Track shipment by AWB code
   */
  async trackShipment(awbCode) {
    return await this.makeRequest(`/courier/track/awb/${awbCode}`);
  }

  /**
   * Track shipment by Order ID
   */
  async trackByOrderId(orderId) {
    return await this.makeRequest(`/courier/track?order_id=${orderId}`);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return await this.makeRequest("/orders/cancel", {
      method: "POST",
      data: {
        ids: [orderId],
      },
    });
  }

  /**
   * Generate manifest
   */
  async generateManifest(shipmentId) {
    return await this.makeRequest("/manifests/generate", {
      method: "POST",
      data: {
        shipment_id: [shipmentId],
      },
    });
  }

  /**
   * Print manifest
   */
  async printManifest(orderId) {
    return await this.makeRequest("/manifests/print", {
      method: "POST",
      data: {
        order_ids: [orderId],
      },
    });
  }

  /**
   * Print invoice
   */
  async printInvoice(orderId) {
    return await this.makeRequest("/orders/print/invoice", {
      method: "POST",
      data: {
        ids: [orderId],
      },
    });
  }

  /**
   * Get channel details
   */
  async getChannels() {
    return await this.makeRequest("/channels");
  }

  /**
   * Get all carriers/couriers
   */
  async getCouriers() {
    return await this.makeRequest("/couriers");
  }

  /**
   * Request RTO (Return to Origin)
   */
  async requestRTO(orderId) {
    return await this.makeRequest("/orders/processing/rto", {
      method: "POST",
      data: {
        order_id: orderId,
      },
    });
  }

  /**
   * Get all pickup locations
   */
  async getPickupLocations() {
    return await this.makeRequest("/settings/company/pickup", {
      method: "GET",
    });
  }

  /**
   * Add a new pickup location
   */
  async addPickupLocation(data) {
    return await this.makeRequest("/settings/company/addpickup", {
      method: "POST",
      data: data,
    });
  }
}

const shiprocketService = new ShiprocketService();
export default shiprocketService;
