// lib/services/wati.js
import axios from 'axios';

class WATIService {
  constructor() {
    this.apiUrl = process.env.WATI_API_URL;
    this.accessToken = process.env.WATI_ACCESS_TOKEN;
  }

  async sendTextMessage(phoneNumber, message) {
    try {
      // Clean phone number (remove +91 if present)
      const cleanPhone = phoneNumber.replace(/^\+?91/, '');
      
      const response = await axios.post(
        `${this.apiUrl}/api/v1/sendSessionMessage/${cleanPhone}`,
        { messageText: message },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WATI Message Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendOrderConfirmation(phoneNumber, orderDetails) {
    const message = `🎉 Order Confirmed!\n\nOrder #: ${orderDetails.orderNumber}\nTotal: ₹${orderDetails.total}\n\nYour order will be processed soon. Track your order on OnlinePlanet app.\n\nThank you for choosing OnlinePlanet! 🛍️`;
    
    return await this.sendTextMessage(phoneNumber, message);
  }

  async sendSellerOnboarding(phoneNumber, sellerName) {
    const message = `Welcome to OnlinePlanet! 🚀\n\nHi ${sellerName},\n\nYour seller registration has been received. Our team will review your documents within 24-48 hours.\n\nYou'll receive an update once approved.\n\nFor support: Reply to this message`;
    
    return await this.sendTextMessage(phoneNumber, message);
  }
}

export default new WATIService();
