#!/usr/bin/env node

/**
 * Test Queue Processing
 * 
 * Tests the complete queue flow locally
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('🧪 Testing Queue Processing...\n');

async function testQueueProcessing() {
  try {
    console.log('📧 Environment Check:');
    console.log('====================');
    console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`UPSTASH_REDIS_REST_URL: ${process.env.UPSTASH_REDIS_REST_URL ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`UPSTASH_REDIS_REST_TOKEN: ${process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'Not set (will use default)'}`);
    console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'Not set'}`);
    console.log('');

    // Test 1: Add a simple email job to queue
    console.log('📝 Test 1: Adding Email Job to Queue');
    console.log('===================================');
    
    const queueService = (await import('./lib/queue.ts')).default;
    
    const testJob = {
      type: 'send_email',
      emailType: 'admin_notification',
      to: process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com',
      subject: '🧪 Test Queue Processing',
      message: 'This is a test email to verify queue processing works.',
      priority: 1
    };

    const jobId = await queueService.enqueue(testJob);
    console.log(`✅ Job queued with ID: ${jobId}`);
    console.log('');

    // Test 2: Check queue stats
    console.log('📊 Test 2: Queue Statistics');
    console.log('===========================');
    const stats = await queueService.getQueueStats();
    console.log(`Pending jobs: ${stats.pending}`);
    console.log(`Failed jobs: ${stats.failed}`);
    console.log('');

    // Test 3: Process the job
    console.log('⚙️ Test 3: Processing Jobs');
    console.log('==========================');
    
    const result = await queueService.processJobs();
    console.log(`Processed: ${result.processed}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Processing time: ${result.processingTime}ms`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors occurred:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    console.log('');

    // Test 4: Final stats
    console.log('📊 Test 4: Final Queue Statistics');
    console.log('=================================');
    const finalStats = await queueService.getQueueStats();
    console.log(`Pending jobs: ${finalStats.pending}`);
    console.log(`Failed jobs: ${finalStats.failed}`);
    
    if (result.processed > 0) {
      console.log('\n🎉 SUCCESS: Job processed successfully!');
      console.log('💌 Check your email inbox for the test message.');
    } else {
      console.log('\n⚠️  No jobs were processed. Check the errors above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testQueueProcessing();
