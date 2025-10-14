import axios from 'axios';

class ShiprocketService {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  // Authenticate
  async authenticate() {
    try {
      // Return existing token if still valid
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      console.log('🔄 Authenticating with Shiprocket...');

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      this.token = response.data.token;
      // Token valid for 10 days, refresh after 9 days
      this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
      
      console.log('✅ Shiprocket authentication successful');
      return this.token;

    } catch (error) {
      console.error('❌ Shiprocket authentication error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket. Check credentials.');
    }
  }

  // Create Order
  async createOrder(orderData) {
    try {
      const token = await this.authenticate();

      console.log('📦 Creating Shiprocket order for:', orderData.orderNumber);

      const payload = {
        order_id: orderData.orderNumber,
        order_date: new Date(orderData.createdAt).toISOString().split('T')[0],
        pickup_location: 'Primary',
        channel_id: '',
        comment: orderData.comment || '',
        billing_customer_name: orderData.shippingAddress.name,
        billing_last_name: '',
        billing_address: orderData.shippingAddress.addressLine1,
        billing_address_2: orderData.shippingAddress.addressLine2 || '',
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.pincode,
        billing_state: orderData.shippingAddress.state,
        billing_country: orderData.shippingAddress.country || 'India',
        billing_email: orderData.shippingAddress.email,
        billing_phone: orderData.shippingAddress.phone,
        shipping_is_billing: true,
        order_items: orderData.items.map(item => ({
          name: item.name,
          sku: item.sku || `SKU-${item.product}`,
          units: item.quantity,
          selling_price: item.price,
          discount: 0,
          tax: 0,
          hsn: item.hsn || ''
        })),
        payment_method: orderData.payment.method === 'cod' ? 'COD' : 'Prepaid',
        shipping_charges: orderData.pricing.shipping || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: orderData.pricing.discount || 0,
        sub_total: orderData.pricing.subtotal,
        length: orderData.dimensions?.length || 10,
        breadth: orderData.dimensions?.breadth || 10,
        height: orderData.dimensions?.height || 10,
        weight: orderData.dimensions?.weight || 0.5
      };

      console.log('📤 Sending to Shiprocket...');

      const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Shiprocket order created:', response.data.order_id);

      return {
        success: true,
        orderId: response.data.order_id,
        shipmentId: response.data.shipment_id,
        status: response.data.status,
        statusCode: response.data.status_code
      };

    } catch (error) {
      console.error('❌ Shiprocket create order error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create Shiprocket order');
    }
  }

  // Get Available Couriers
  async getAvailableCouriers(shipmentId) {
    try {
      const token = await this.authenticate();

      console.log('🚚 Fetching available couriers for shipment:', shipmentId);

      const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
        params: {
          shipment_id: shipmentId
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const couriers = response.data.data.available_courier_companies || [];
      console.log(`✅ Found ${couriers.length} available couriers`);

      return {
        success: true,
        couriers: couriers
      };

    } catch (error) {
      console.error('❌ Get couriers error:', error.response?.data || error.message);
      throw new Error('Failed to get available couriers');
    }
  }

  // Assign Courier and Generate AWB
  async assignCourierAndGenerateAWB(shipmentId, courierId) {
    try {
      const token = await this.authenticate();

      console.log('📋 Assigning courier and generating AWB...');

      const response = await axios.post(
        `${this.baseURL}/courier/assign/awb`,
        {
          shipment_id: shipmentId,
          courier_id: courierId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ AWB generated:', response.data.response.data.awb_code);

      return {
        success: true,
        awbCode: response.data.response.data.awb_code,
        courierName: response.data.response.data.courier_name,
        courierId: response.data.response.data.courier_company_id,
        awbAssignedDate: response.data.response.data.assigned_date_time
      };

    } catch (error) {
      console.error('❌ Assign courier error:', error.response?.data || error.message);
      throw new Error('Failed to assign courier');
    }
  }

  // Request Pickup
  async requestPickup(shipmentIds) {
    try {
      const token = await this.authenticate();

      console.log('📞 Requesting pickup...');

      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Pickup scheduled:', response.data.pickup_scheduled_date);

      return {
        success: true,
        pickupScheduledDate: response.data.pickup_scheduled_date,
        pickupTokenNumber: response.data.pickup_token_number,
        status: response.data.response?.data?.status || 'scheduled'
      };

    } catch (error) {
      console.error('❌ Request pickup error:', error.response?.data || error.message);
      throw new Error('Failed to request pickup');
    }
  }

  // Track Shipment
  async trackShipment(shipmentId) {
    try {
      const token = await this.authenticate();

      console.log('📍 Tracking shipment:', shipmentId);

      const response = await axios.get(
        `${this.baseURL}/courier/track/shipment/${shipmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        tracking: response.data.tracking_data
      };

    } catch (error) {
      console.error('❌ Track shipment error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  // Track AWB
  async trackAWB(awbCode) {
    try {
      const token = await this.authenticate();

      console.log('📍 Tracking AWB:', awbCode);

      const response = await axios.get(
        `${this.baseURL}/courier/track/awb/${awbCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        tracking: response.data.tracking_data
      };

    } catch (error) {
      console.error('❌ Track AWB error:', error.response?.data || error.message);
      throw new Error('Failed to track AWB');
    }
  }

  // Generate Label
  async generateLabel(shipmentIds) {
    try {
      const token = await this.authenticate();

      console.log('🏷️  Generating shipping label...');

      const response = await axios.post(
        `${this.baseURL}/courier/generate/label`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Label generated:', response.data.label_url);

      return {
        success: true,
        labelUrl: response.data.label_url,
        labelCreated: response.data.label_created
      };

    } catch (error) {
      console.error('❌ Generate label error:', error.response?.data || error.message);
      throw new Error('Failed to generate label');
    }
  }

  // Generate Manifest
  async generateManifest(shipmentIds) {
    try {
      const token = await this.authenticate();

      console.log('📄 Generating manifest...');

      const response = await axios.post(
        `${this.baseURL}/manifests/generate`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Manifest generated:', response.data.manifest_url);

      return {
        success: true,
        manifestUrl: response.data.manifest_url,
        status: response.data.status
      };

    } catch (error) {
      console.error('❌ Generate manifest error:', error.response?.data || error.message);
      throw new Error('Failed to generate manifest');
    }
  }

  // Cancel Shipment
  async cancelShipment(awbCodes) {
    try {
      const token = await this.authenticate();

      console.log('❌ Cancelling shipment...');

      const response = await axios.post(
        `${this.baseURL}/orders/cancel/shipment/awbs`,
        {
          awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Shipment cancelled');

      return {
        success: true,
        message: response.data.message
      };

    } catch (error) {
      console.error('❌ Cancel shipment error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }
}

export default new ShiprocketService();
