#!/usr/bin/env node

/**
 * Email System Test
 * 
 * Tests the Resend email system to verify it's working correctly
 * Shows exactly what emails are being sent and their status
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('📧 Testing Email System with Resend...\n');

// Test configuration
const testConfig = {
  // Test emails - change these to your actual emails for testing
  adminEmail: process.env.ADMIN_EMAIL || 'admin@tsrgallery.com',
  testCustomerEmail: 'test-customer@example.com', // This won't actually receive emails
  fromEmail: process.env.FROM_EMAIL || 'noreply@tsrgallery.com',
  resendApiKey: process.env.RESEND_API_KEY
};

console.log('🔧 Test Configuration:');
console.log('======================');
console.log(`Admin Email (where notifications go): ${testConfig.adminEmail}`);
console.log(`From Email (sender address): ${testConfig.fromEmail}`);
console.log(`Resend API Key: ${testConfig.resendApiKey ? 'Set ✅' : 'Missing ❌'}`);
console.log(`Customer Test Email: ${testConfig.testCustomerEmail}`);
console.log('');

async function testEmailSystem() {
  if (!testConfig.resendApiKey) {
    console.log('❌ RESEND_API_KEY not found. Please set it in your environment variables.');
    return;
  }

  try {
    // Import Resend directly to test
    const { Resend } = await import('resend');
    const resend = new Resend(testConfig.resendApiKey);

    console.log('📨 Test 1: Direct Resend API Test');
    console.log('==================================');
    
    try {
      // Test 1: Simple email test
      const result = await resend.emails.send({
        from: `TSR Gallery Test <${testConfig.fromEmail}>`,
        to: [testConfig.adminEmail],
        subject: '🧪 Email System Test - TSR Gallery',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3949AB;">✅ Email System Test Successful!</h2>
            <p>This is a test email from your TSR Gallery queue system.</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Test Details:</h3>
              <p><strong>From:</strong> ${testConfig.fromEmail}</p>
              <p><strong>To:</strong> ${testConfig.adminEmail}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p><strong>System:</strong> Upstash Redis + Resend Queue</p>
            </div>
            <p>If you received this email, your email system is working correctly! 🎉</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              This is an automated test from your Next.js application.
            </p>
          </div>
        `
      });

      console.log('✅ Direct email test successful!');
      console.log(`   Email ID: ${result.data?.id}`);
      console.log(`   From: ${testConfig.fromEmail}`);
      console.log(`   To: ${testConfig.adminEmail}`);
      console.log(`   Status: Sent to Resend successfully`);
      
      // Check if we can get email status
      if (result.data?.id) {
        console.log(`   Check status at: https://resend.com/emails/${result.data.id}`);
      }

    } catch (emailError) {
      console.log('❌ Direct email test failed:');
      console.log(`   Error: ${emailError.message}`);
      
      if (emailError.message.includes('domain')) {
        console.log('   💡 This likely means your domain is not verified yet in Resend');
        console.log('   💡 Try using Resend\'s default domain for testing');
      }
    }

    console.log('');

    // Test 2: Queue system test
    console.log('📨 Test 2: Queue System Test');
    console.log('=============================');
    
    try {
      // Import our queue service
      const queueModule = await import('./lib/queue.js');
      const queueService = queueModule.default;
      const JobType = queueModule.JobType;

      // Test admin notification job
      const jobId = await queueService.enqueue({
        type: JobType.CONTACT_FORM_NOTIFICATION,
        name: 'Test User',
        email: 'test@example.com',
        subject: '🧪 Queue System Test',
        message: 'This is a test message to verify the queue system is working correctly.',
        adminEmail: testConfig.adminEmail
      });

      console.log('✅ Job queued successfully!');
      console.log(`   Job ID: ${jobId}`);
      console.log(`   Type: Contact Form Notification`);
      console.log(`   Admin Email: ${testConfig.adminEmail}`);

      // Get queue stats
      const stats = await queueService.getQueueStats();
      console.log(`   Queue Stats: ${stats.pending} pending, ${stats.failed} failed`);

    } catch (queueError) {
      console.log('❌ Queue system test failed:');
      console.log(`   Error: ${queueError.message}`);
    }

    console.log('');

    // Test 3: Check Resend API status
    console.log('📊 Test 3: Resend API Status Check');
    console.log('===================================');
    
    try {
      // Try to get domains (this will show if API key works)
      const domains = await resend.domains.list();
      
      console.log('✅ Resend API connection successful!');
      console.log(`   Domains configured: ${domains.data?.length || 0}`);
      
      if (domains.data && domains.data.length > 0) {
        domains.data.forEach((domain, index) => {
          console.log(`   ${index + 1}. ${domain.name} - Status: ${domain.status}`);
        });
      } else {
        console.log('   💡 No custom domains configured - using Resend default domain');
      }

    } catch (apiError) {
      console.log('❌ Resend API status check failed:');
      console.log(`   Error: ${apiError.message}`);
      
      if (apiError.message.includes('unauthorized') || apiError.message.includes('invalid')) {
        console.log('   💡 Check your RESEND_API_KEY - it might be incorrect');
      }
    }

    console.log('');

    // Test 4: Environment check
    console.log('🔍 Test 4: Environment Variables Check');
    console.log('======================================');
    
    const envVars = [
      'RESEND_API_KEY',
      'ADMIN_EMAIL', 
      'FROM_EMAIL',
      'FROM_NAME',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: Set`);
      } else {
        console.log(`⚠️  ${varName}: Not set`);
      }
    });

  } catch (error) {
    console.error('❌ Email system test failed:', error.message);
  }

  console.log('');
  console.log('🎯 Email Test Summary:');
  console.log('======================');
  console.log('1. Check your email inbox for the test email');
  console.log('2. Check Resend dashboard at https://resend.com/emails');
  console.log('3. Look for any error messages above');
  console.log('4. If domain not verified, emails will come from onboarding@resend.dev');
  console.log('');
  console.log('📧 To check if emails are being sent to noreply@tsrgallery.com:');
  console.log('   - Emails are sent FROM noreply@tsrgallery.com (not TO it)');
  console.log('   - Admin notifications go TO your ADMIN_EMAIL');
  console.log('   - Customer emails go TO customer\'s actual email');
  console.log('   - Check Resend dashboard for delivery status');
}

// Run the test
testEmailSystem().catch(console.error);
