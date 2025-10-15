const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function getShiprocketToken() {
  try {
    console.log('🔄 Getting Shiprocket token...');
    console.log('Email:', process.env.SHIPROCKET_EMAIL);

    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });

    console.log('\n✅ Token generated successfully!\n');
    console.log('Add this line to your .env.local file:\n');
    console.log(`SHIPROCKET_TOKEN=${response.data.token}\n`);
    console.log('This token is valid for 10 days.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Too many failed login attempts')) {
      console.log('\n⏰ Please wait 30 minutes before trying again.');
      console.log('Or contact Shiprocket support to reset your account.');
    }
  }
}

getShiprocketToken();
