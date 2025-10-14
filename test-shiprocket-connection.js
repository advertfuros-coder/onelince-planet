const axios = require('axios');

async function testShiprocketConnection() {
  console.log('🔄 Testing Shiprocket connection...\n');

  try {
    // Step 1: Login
    console.log('Step 1: Authenticating...');
    const loginResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: 'genforgestudio@gmail.com',
      password: 'l4$85TzOjczTw@@f'
    });

    const token = loginResponse.data.token;
    console.log('✅ Authentication successful!');
    console.log('Token:', token.substring(0, 50) + '...\n');

    // Step 2: Test API - Get Orders
    console.log('Step 2: Testing API - Fetching orders...');
    const ordersResponse = await axios.get('https://apiv2.shiprocket.in/v1/external/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        per_page: 5
      }
    });

    console.log('✅ API working! Total orders:', ordersResponse.data.meta?.pagination?.total || 0);
    console.log('\n🎉 Shiprocket connection test successful!\n');

    // Step 3: Check Pickup Locations
    console.log('Step 3: Checking pickup locations...');
    const pickupResponse = await axios.get('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (pickupResponse.data.data && pickupResponse.data.data.shipping_address) {
      console.log('✅ Pickup locations found:', pickupResponse.data.data.shipping_address.length);
      console.log('\nFirst pickup location:');
      console.log(JSON.stringify(pickupResponse.data.data.shipping_address[0], null, 2));
    } else {
      console.log('⚠️  No pickup locations configured. Please add one in Shiprocket dashboard.');
    }

  } catch (error) {
    console.error('❌ Connection test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testShiprocketConnection();
