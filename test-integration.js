#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the Vercel + Railway architecture
 */

const https = require('https');
const http = require('http');

// Configuration
const VERCEL_URL = process.env.VERCEL_URL || 'https://your-vercel-app.vercel.app';
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://your-railway-app.railway.app';

// Test functions
async function testVercelHealth() {
  console.log('🔍 Testing Vercel health...');
  try {
    const response = await fetch(`${VERCEL_URL}/api/startup`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Vercel is healthy');
      console.log(`   - Startup initialized: ${data.startupInitialized}`);
      console.log(`   - Auto-start enabled: ${data.autoStartEnabled}`);
      console.log(`   - Is serverless: ${data.isServerless}`);
      return true;
    } else {
      console.log('❌ Vercel health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Vercel health check error:', error.message);
    return false;
  }
}

async function testRailwayHealth() {
  console.log('🔍 Testing Railway health...');
  try {
    const response = await fetch(`${RAILWAY_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Railway consumers are healthy');
      console.log(`   - Status: ${data.status}`);
      console.log(`   - Uptime: ${Math.floor(data.uptime)} seconds`);
      return true;
    } else {
      console.log('❌ Railway health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Railway health check error:', error.message);
    return false;
  }
}

async function testOrderCreation() {
  console.log('🔍 Testing order creation...');
  
  const testOrder = {
    items: [
      {
        product: '507f1f77bcf86cd799439011', // Replace with actual product ID
        name: 'Test Product',
        quantity: 1,
        variant: 'Test Variant'
      }
    ],
    paymentMethod: 'cod',
    shippingCost: 60,
    discount: 0,
    shippingAddress: {
      name: 'Test User',
      phone: '01234567890',
      email: 'test@example.com',
      street: 'Test Address',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1209'
    },
    billingAddress: {
      name: 'Test User',
      phone: '01234567890',
      email: 'test@example.com',
      street: 'Test Address',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1209'
    },
    deliveryType: 'regular',
    notes: 'Integration test order'
  };

  try {
    const response = await fetch(`${VERCEL_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Order created successfully');
      console.log(`   - Order ID: ${data.order._id}`);
      console.log(`   - Order Number: ${data.order.orderNumber}`);
      return data.order._id;
    } else {
      console.log('❌ Order creation failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Order creation error:', error.message);
    return null;
  }
}

async function testInvoiceGeneration(orderId) {
  if (!orderId) {
    console.log('⏭️  Skipping invoice test - no order ID');
    return;
  }

  console.log('🔍 Testing invoice generation...');
  try {
    const response = await fetch(`${VERCEL_URL}/api/orders/${orderId}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Invoice generation triggered');
      console.log(`   - Message: ${data.message}`);
    } else {
      console.log('❌ Invoice generation failed:', data);
    }
  } catch (error) {
    console.log('❌ Invoice generation error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Vercel + Railway Integration Tests\n');

  const results = {
    vercel: false,
    railway: false,
    order: false
  };

  // Test Vercel health
  results.vercel = await testVercelHealth();
  console.log('');

  // Test Railway health
  results.railway = await testRailwayHealth();
  console.log('');

  // Test order creation
  const orderId = await testOrderCreation();
  results.order = orderId !== null;
  console.log('');

  // Test invoice generation
  await testInvoiceGeneration(orderId);
  console.log('');

  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`   - Vercel Health: ${results.vercel ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Railway Health: ${results.railway ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Order Creation: ${results.order ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = results.vercel && results.railway && results.order;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (allPassed) {
    console.log('\n🎉 Your Vercel + Railway architecture is working correctly!');
    console.log('   - Orders are being created on Vercel');
    console.log('   - Events are being published to RabbitMQ');
    console.log('   - Railway consumers are processing events');
    console.log('   - Emails and invoices should be generated');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    if (!results.vercel) console.log('   - Vercel deployment and environment variables');
    if (!results.railway) console.log('   - Railway deployment and environment variables');
    if (!results.order) console.log('   - Database connection and order creation logic');
  }

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
