// Test script to verify API fixes
// Run this with: node test-api-fixes.js

const BASE_URL = 'https://www.tsrgallery.com'; // Change to your production URL

async function testGeocodeAPI() {
  console.log('Testing Geocode API...');
  try {
    const response = await fetch(`${BASE_URL}/api/address/geocode?postal=1209`);
    const data = await response.json();
    console.log('Geocode API Status:', response.status);
    console.log('Geocode API Response:', data);
    return response.ok;
  } catch (error) {
    console.error('Geocode API Error:', error);
    return false;
  }
}

async function testOrdersAPI() {
  console.log('Testing Orders API...');
  try {
    const testOrder = {
      items: [{
        product: "68b1ab30b9f1bfbdb2e0c966",
        name: "Test Product",
        quantity: 1
      }],
      paymentMethod: "cod",
      shippingCost: 60,
      discount: 0,
      shippingAddress: {
        name: "Test User",
        phone: "01828123264",
        email: "test@example.com",
        street: "Test Street",
        city: "Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        postalCode: "1209"
      },
      billingAddress: {
        name: "Test User",
        phone: "01828123264",
        email: "test@example.com",
        street: "Test Street",
        city: "Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        postalCode: "1209"
      },
      deliveryType: "regular",
      notes: ""
    };

    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });
    
    const data = await response.json();
    console.log('Orders API Status:', response.status);
    console.log('Orders API Response:', data);
    return response.ok;
  } catch (error) {
    console.error('Orders API Error:', error);
    return false;
  }
}

async function testCORS() {
  console.log('Testing CORS...');
  try {
    const response = await fetch(`${BASE_URL}/api/address/geocode?postal=1209`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.tsrgallery.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('CORS Preflight Status:', response.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    });
    return response.ok;
  } catch (error) {
    console.error('CORS Test Error:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  const geocodeTest = await testGeocodeAPI();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const corsTest = await testCORS();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const ordersTest = await testOrdersAPI();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('Test Results:');
  console.log('Geocode API:', geocodeTest ? '✅ PASS' : '❌ FAIL');
  console.log('CORS Test:', corsTest ? '✅ PASS' : '❌ FAIL');
  console.log('Orders API:', ordersTest ? '✅ PASS' : '❌ FAIL');
  
  if (geocodeTest && corsTest && ordersTest) {
    console.log('\n🎉 All tests passed! The fixes should work in production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

runTests().catch(console.error);
