// scripts/test-marketing-apis.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let testCouponCode = '';
let testFlashSaleId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${'='.repeat(60)}`);
  log(`Testing: ${testName}`, 'blue');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Login
async function login() {
  logTest('Authentication');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'seller@onlineplanet.ae',
      password: 'Seller@123456'
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess('Login successful');
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.message}`);
    return false;
  }
}

// Test 1: Create Coupon
async function testCreateCoupon() {
  logTest('Create Coupon');
  
  try {
    testCouponCode = `TEST${Date.now()}`;
    
    const response = await axios.post(
      `${API_URL}/coupons`,
      {
        code: testCouponCode,
        type: 'percentage',
        value: 10,
        description: 'Test 10% discount coupon',
        minimumPurchase: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: {
          total: 100,
          perUser: 1
        }
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      logSuccess('Coupon created successfully');
      log(`Code: ${testCouponCode}`, 'yellow');
      log(`Type: ${response.data.coupon.type}`, 'yellow');
      log(`Value: ${response.data.coupon.value}%`, 'yellow');
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: Get Coupons
async function testGetCoupons() {
  logTest('Get Coupons List');
  
  try {
    const response = await axios.get(`${API_URL}/coupons?status=active`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.coupons.length} coupons`);
      log(`Pages: ${response.data.pagination.pages}`, 'yellow');
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Validate Coupon
async function testValidateCoupon() {
  logTest('Validate Coupon');
  
  if (!testCouponCode) {
    log('⚠️  No test coupon created. Skipping.', 'yellow');
    return false;
  }

  try {
    const response = await axios.post(
      `${API_URL}/coupons/validate`,
      {
        code: testCouponCode,
        cartTotal: 1000
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      logSuccess('Coupon validated successfully');
      log(`Discount: ₹${response.data.discount}`, 'yellow');
      log(`Code: ${response.data.coupon.code}`, 'yellow');
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Validate with Insufficient Amount
async function testValidateCouponFailure() {
  logTest('Validate Coupon (Should Fail - Insufficient Amount)');
  
  if (!testCouponCode) {
    log('⚠️  No test coupon created. Skipping.', 'yellow');
    return false;
  }

  try {
    const response = await axios.post(
      `${API_URL}/coupons/validate`,
      {
        code: testCouponCode,
        cartTotal: 300 // Below minimum purchase of 500
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    logError('Should have failed but passed!');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation correctly failed for insufficient amount');
      log(`Message: ${error.response.data.message}`, 'yellow');
      return true;
    }
    logError(`Unexpected error: ${error.message}`);
    return false;
  }
}

// Test 5: Create Flash Sale
async function testCreateFlashSale() {
  logTest('Create Flash Sale');
  
  try {
    const response = await axios.post(
      `${API_URL}/flash-sales`,
      {
        title: 'Test Flash Sale',
        description: 'Limited time offer!',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        featured: true,
        products: [
          {
            productId: '69418dedc46af2717e5131e4',
            originalPrice: 999,
            salePrice: 799,
            discountPercentage: 20,
            stockLimit: 50
          }
        ]
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      testFlashSaleId = response.data.flashSale._id;
      logSuccess('Flash sale created successfully');
      log(`ID: ${testFlashSaleId}`, 'yellow');
      log(`Title: ${response.data.flashSale.title}`, 'yellow');
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Get Flash Sales
async function testGetFlashSales() {
  logTest('Get Flash Sales (Live)');
  
  try {
    const response = await axios.get(`${API_URL}/flash-sales?live=true&featured=true`);

    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.flashSales.length} live flash sales`);
      
      if (response.data.flashSales.length > 0) {
        const sale = response.data.flashSales[0];
        log(`Title: ${sale.title}`, 'yellow');
        log(`Is Live: ${sale.isLive}`, 'yellow');
        log(`Products: ${sale.products.length}`, 'yellow');
      }
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Get Loyalty Program
async function testGetLoyalty() {
  logTest('Get Loyalty Program');
  
  try {
    const response = await axios.get(`${API_URL}/loyalty`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.data.success) {
      logSuccess('Loyalty program retrieved');
      log(`Tier: ${response.data.loyalty.tier}`, 'yellow');
      log(`Available Points: ${response.data.loyalty.points.available}`, 'yellow');
      log(`Total Points: ${response.data.loyalty.points.total}`, 'yellow');
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🎯 Starting Marketing & Promotion API Tests\n', 'blue');
  
  // Check server
  try {
    await axios.get(`${API_URL.replace('/api', '')}/`);
    logSuccess('Server is running');
  } catch (error) {
    logError('Server is not running! Start with: npm run dev');
    process.exit(1);
  }

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    logError('Authentication failed. Cannot proceed.');
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 1000));

  // Run tests
  const results = {
    couponCreate: await testCreateCoupon(),
    couponList: false,
    couponValidate: false,
    couponFailure: false,
    flashSaleCreate: false,
    flashSaleList: false,
    loyalty: false
  };

  await new Promise(r => setTimeout(r, 1000));
  
  if (results.couponCreate) {
    results.couponList = await testGetCoupons();
    await new Promise(r => setTimeout(r, 1000));
    
    results.couponValidate = await testValidateCoupon();
    await new Promise(r => setTimeout(r, 1000));
    
    results.couponFailure = await testValidateCouponFailure();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  results.flashSaleCreate = await testCreateFlashSale();
  await new Promise(r => setTimeout(r, 1000));
  
  results.flashSaleList = await testGetFlashSales();
  await new Promise(r => setTimeout(r, 1000));
  
  results.loyalty = await testGetLoyalty();

  // Summary
  log('\n📊 Test Summary:', 'blue');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  log(`Tests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([test, result]) => {
    log(`  ${result ? '✅' : '❌'} ${test}`, result ? 'green' : 'red');
  });
  
  log('\n✅ All marketing API tests completed!', 'green');
  log('\n🎯 Next: Build UI components', 'yellow');
  log('http://localhost:3000/admin/coupons\n', 'blue');
}

// Run tests
runAllTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
