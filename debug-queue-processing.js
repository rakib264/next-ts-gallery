#!/usr/bin/env node

/**
 * Debug Queue Processing
 * 
 * Creates a test job and processes it to see exact errors
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('🔍 Debugging Queue Processing...\n');

async function debugQueueProcessing() {
  try {
    // Test: Create a simple order to trigger the queue
    console.log('📦 Creating Test Order...');
    console.log('=========================');
    
    const testOrderData = {
      items: [
        {
          productId: 'test-product-123',
          name: 'Test Product',
          price: 1000,
          quantity: 1,
          image: 'test-image.jpg'
        }
      ],
      shippingAddress: {
        name: 'Test Customer',
        email: 'redwan.rakib267@gmail.com',
        phone: '+8801234567890',
        address: 'Test Address',
        city: 'Dhaka',
        postalCode: '1000'
      },
      paymentMethod: 'cod',
      deliveryType: 'home_delivery',
      total: 1000
    };

    const orderResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.log('❌ Order creation failed:', orderResponse.status, errorText);
      return;
    }

    const orderResult = await orderResponse.json();
    console.log('✅ Test order created:', orderResult.orderNumber);
    console.log('');

    // Wait a moment for jobs to be queued
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check queue stats before processing
    console.log('📊 Queue Stats Before Processing:');
    console.log('=================================');
    const statsResponse = await fetch('http://localhost:3000/api/processQueue?action=stats');
    const beforeStats = await statsResponse.json();
    console.log('Pending:', beforeStats.stats.pending);
    console.log('Failed:', beforeStats.stats.failed);
    console.log('');

    // Process the queue with detailed logging
    console.log('⚙️ Processing Queue...');
    console.log('======================');
    
    const processResponse = await fetch('http://localhost:3000/api/processQueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ debug: true })
    });

    const processResult = await processResponse.json();
    console.log('Processing Result:', JSON.stringify(processResult, null, 2));
    console.log('');

    // Check queue stats after processing
    console.log('📊 Queue Stats After Processing:');
    console.log('================================');
    const afterStatsResponse = await fetch('http://localhost:3000/api/processQueue?action=stats');
    const afterStats = await afterStatsResponse.json();
    console.log('Pending:', afterStats.stats.pending);
    console.log('Failed:', afterStats.stats.failed);
    console.log('');

    // Check failed jobs if any
    if (afterStats.stats.failed > 0) {
      console.log('❌ Checking Failed Jobs:');
      console.log('========================');
      
      const failedJobsResponse = await fetch('http://localhost:3000/api/processQueue?action=failed');
      const failedJobs = await failedJobsResponse.json();
      console.log('Failed Jobs:', JSON.stringify(failedJobs, null, 2));
    }

    // Summary
    console.log('🎯 Debug Summary:');
    console.log('=================');
    console.log(`✅ Order Created: ${orderResult.orderNumber}`);
    console.log(`📝 Jobs Queued: ${beforeStats.stats.pending}`);
    console.log(`✅ Jobs Processed: ${processResult.totalProcessed || 0}`);
    console.log(`❌ Jobs Failed: ${processResult.totalFailed || 0}`);
    
    if (processResult.totalProcessed > 0) {
      console.log('🎉 SUCCESS: Jobs processed successfully!');
      console.log('💌 Check your email for order confirmation and admin notification.');
    } else {
      console.log('⚠️  No jobs were processed successfully.');
      console.log('🔍 Check your Next.js server console for detailed error messages.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugQueueProcessing();
