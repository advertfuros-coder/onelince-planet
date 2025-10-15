// import axios from 'axios';

// class ShiprocketService {
//   constructor() {
//     this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
//     this.email = "genforgestudio@gmail.com";
//     this.password = "l4$85TzOjczTw@@f";
//     this.token = null;
//     this.tokenExpiry = null;
//   }

//   async authenticate() {
//     try {
//       if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
//         return this.token;
//       }

//       console.log('🔄 Authenticating with Shiprocket...');

//       const response = await axios.post(`${this.baseURL}/auth/login`, {
//         email: this.email,
//         password: this.password
//       });

//       this.token = response.data.token;
//       this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
      
//       console.log('✅ Shiprocket authentication successful');
//       return this.token;

//     } catch (error) {
//       console.error('❌ Shiprocket authentication error:', error.response?.data || error.message);
//       throw new Error('Failed to authenticate with Shiprocket');
//     }
//   }

//   async createOrder(orderData) {
//     try {
//       const token = await this.authenticate();

//       console.log('📦 Creating Shiprocket order for:', orderData.orderNumber);

//       const payload = {
//         order_id: orderData.orderNumber,
//         order_date: new Date(orderData.createdAt).toISOString().split('T')[0],
//         pickup_location: 'Primary',
//         channel_id: '',
//         comment: orderData.comment || '',
//         billing_customer_name: orderData.shippingAddress.name,
//         billing_last_name: '',
//         billing_address: orderData.shippingAddress.addressLine1,
//         billing_address_2: orderData.shippingAddress.addressLine2 || '',
//         billing_city: orderData.shippingAddress.city,
//         billing_pincode: orderData.shippingAddress.pincode,
//         billing_state: orderData.shippingAddress.state,
//         billing_country: orderData.shippingAddress.country || 'India',
//         billing_email: orderData.shippingAddress.email,
//         billing_phone: orderData.shippingAddress.phone,
//         shipping_is_billing: true,
//         order_items: orderData.items.map(item => ({
//           name: item.name,
//           sku: item.sku || `SKU-${item.product}`,
//           units: item.quantity,
//           selling_price: item.price,
//           discount: 0,
//           tax: 0,
//           hsn: item.hsn || ''
//         })),
//         payment_method: orderData.payment.method === 'cod' ? 'COD' : 'Prepaid',
//         shipping_charges: orderData.pricing.shipping || 0,
//         giftwrap_charges: 0,
//         transaction_charges: 0,
//         total_discount: orderData.pricing.discount || 0,
//         sub_total: orderData.pricing.subtotal,
//         length: orderData.dimensions?.length || 10,
//         breadth: orderData.dimensions?.breadth || 10,
//         height: orderData.dimensions?.height || 10,
//         weight: orderData.dimensions?.weight || 0.5
//       };

//       const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, payload, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('✅ Shiprocket order created:', response.data.order_id);

//       return {
//         success: true,
//         orderId: response.data.order_id,
//         shipmentId: response.data.shipment_id,
//         status: response.data.status,
//         statusCode: response.data.status_code
//       };

//     } catch (error) {
//       console.error('❌ Shiprocket create order error:', error.response?.data || error.message);
//       return {
//         success: false,
//         error: error.response?.data?.message || 'Failed to create Shiprocket order'
//       };
//     }
//   }

//   async getAvailableCouriers(shipmentId) {
//     try {
//       const token = await this.authenticate();

//       console.log('🚚 Fetching available couriers for shipment:', shipmentId);

//       const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
//         params: { shipment_id: shipmentId },
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const couriers = response.data.data.available_courier_companies || [];
//       console.log(`✅ Found ${couriers.length} available couriers`);

//       return {
//         success: true,
//         couriers: couriers.map(c => ({
//           courier_company_id: c.courier_company_id,
//           courier_name: c.courier_name,
//           rate: c.rate,
//           estimated_delivery_days: c.estimated_delivery_days,
//           etd: c.etd
//         }))
//       };

//     } catch (error) {
//       console.error('❌ Get couriers error:', error.response?.data || error.message);
//       return {
//         success: false,
//         error: 'Failed to get available couriers'
//       };
//     }
//   }

//   async assignCourierAndGenerateAWB(shipmentId, courierId) {
//     try {
//       const token = await this.authenticate();

//       console.log('📋 Assigning courier and generating AWB...');

//       const response = await axios.post(
//         `${this.baseURL}/courier/assign/awb`,
//         {
//           shipment_id: shipmentId,
//           courier_id: courierId
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       console.log('✅ AWB generated:', response.data.awb_assign_status);

//       return {
//         success: true,
//         awbCode: response.data.response.data.awb_code,
//         courierId: response.data.response.data.courier_company_id,
//         courierName: response.data.response.data.courier_name,
//         pickupScheduledDate: response.data.response.data.pickup_scheduled_date,
//         label: response.data.response.data.label_url,
//         manifest: response.data.response.data.manifest_url
//       };

//     } catch (error) {
//       console.error('❌ Assign courier error:', error.response?.data || error.message);
//       return {
//         success: false,
//         error: 'Failed to assign courier'
//       };
//     }
//   }

//   async schedulePickup(shipmentIds) {
//     try {
//       const token = await this.authenticate();

//       const response = await axios.post(
//         `${this.baseURL}/courier/generate/pickup`,
//         { shipment_id: shipmentIds },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return {
//         success: true,
//         pickupStatus: response.data.pickup_status,
//         responseId: response.data.response_id
//       };

//     } catch (error) {
//       console.error('❌ Schedule pickup error:', error.response?.data || error.message);
//       return {
//         success: false,
//         error: 'Failed to schedule pickup'
//       };
//     }
//   }
// }

// export default new ShiprocketService();



import axios from 'axios';

class ShiprocketService {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = process.env.SHIPROCKET_TOKEN || null; // ✅ Add manual token support
    this.tokenExpiry = null;
  }

  async authenticate() {
    try {
      // If manual token is provided, use it
      if (process.env.SHIPROCKET_TOKEN) {
        console.log('✅ Using manual Shiprocket token from env');
        this.token = process.env.SHIPROCKET_TOKEN;
        this.tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days
        return this.token;
      }

      // Check if current token is still valid
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        console.log('✅ Using cached Shiprocket token');
        return this.token;
      }

      console.log('🔄 Authenticating with Shiprocket...');

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      this.token = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
      
      console.log('✅ Shiprocket authentication successful');
      console.log('💡 Save this token to .env as SHIPROCKET_TOKEN to avoid login limits:');
      console.log(this.token);
      
      return this.token;

    } catch (error) {
      console.error('❌ Shiprocket authentication error:', error.response?.data || error.message);
      
      if (error.response?.data?.message?.includes('Too many failed login attempts')) {
        throw new Error('Shiprocket login limit reached. Please wait 30 minutes or add SHIPROCKET_TOKEN to .env file. Contact support for manual token.');
      }
      
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  async createOrder(orderData) {
    try {
      const token = await this.authenticate();

      console.log('📦 Creating Shiprocket order for:', orderData.orderNumber);

      // Get first seller's pickup address
      const seller = orderData.items[0]?.seller;
      const pickupAddress = seller?.pickupAddress || {};

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

      console.log('📤 Shiprocket payload:', JSON.stringify(payload, null, 2));

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
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create Shiprocket order'
      };
    }
  }

  async getAvailableCouriers(shipmentId) {
    try {
      const token = await this.authenticate();

      console.log('🚚 Fetching available couriers for shipment:', shipmentId);

      const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
        params: { shipment_id: shipmentId },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const couriers = response.data.data.available_courier_companies || [];
      console.log(`✅ Found ${couriers.length} available couriers`);

      return {
        success: true,
        couriers: couriers.map(c => ({
          courier_company_id: c.courier_company_id,
          courier_name: c.courier_name,
          rate: c.rate,
          estimated_delivery_days: c.estimated_delivery_days,
          etd: c.etd
        }))
      };

    } catch (error) {
      console.error('❌ Get couriers error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get available couriers'
      };
    }
  }

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

      console.log('✅ AWB generated:', response.data.awb_assign_status);

      return {
        success: true,
        awbCode: response.data.response.data.awb_code,
        courierId: response.data.response.data.courier_company_id,
        courierName: response.data.response.data.courier_name,
        pickupScheduledDate: response.data.response.data.pickup_scheduled_date,
        label: response.data.response.data.label_url,
        manifest: response.data.response.data.manifest_url
      };

    } catch (error) {
      console.error('❌ Assign courier error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign courier'
      };
    }
  }

  async schedulePickup(shipmentIds) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        { shipment_id: shipmentIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        pickupStatus: response.data.pickup_status,
        responseId: response.data.response_id
      };

    } catch (error) {
      console.error('❌ Schedule pickup error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to schedule pickup'
      };
    }
  }

  async trackShipment(awbCode) {
    try {
      const token = await this.authenticate();

      const response = await axios.get(`${this.baseURL}/courier/track/awb/${awbCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return {
        success: true,
        tracking: response.data.tracking_data
      };

    } catch (error) {
      console.error('❌ Track shipment error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to track shipment'
      };
    }
  }

  // ✅ NEW: Get token manually for testing
  async getManualToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      console.log('✅ Manual token generated:');
      console.log('Add this to your .env.local:');
      console.log(`SHIPROCKET_TOKEN=${response.data.token}`);
      
      return response.data.token;

    } catch (error) {
      console.error('❌ Failed to get manual token:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ShiprocketService();
