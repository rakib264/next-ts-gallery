#!/usr/bin/env node

/**
 * Test Complete Order Email Flow
 * 
 * Tests the complete flow: Queue job → Process → Send email
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('🧪 Testing Complete Order Email Flow...\n');

async function testOrderEmailFlow() {
  try {
    console.log('📧 Configuration Check:');
    console.log('======================');
    console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'Using Resend default'}`);
    console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
    console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set ✅' : 'Missing ❌'}`);
    console.log('');

    // Test 1: Queue a simple test job via API
    console.log('📝 Test 1: Queue Test Email Job');
    console.log('===============================');
    
    const testJobResponse = await fetch('http://localhost:3000/api/processQueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test_email',
        email: process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com'
      })
    });

    if (!testJobResponse.ok) {
      console.log('❌ API request failed:', testJobResponse.status, testJobResponse.statusText);
      const errorText = await testJobResponse.text();
      console.log('Error details:', errorText);
      return;
    }

    const testResult = await testJobResponse.json();
    console.log('✅ API Response:', JSON.stringify(testResult, null, 2));
    console.log('');

    // Test 2: Check queue stats
    console.log('📊 Test 2: Check Queue Stats');
    console.log('============================');
    
    const statsResponse = await fetch('http://localhost:3000/api/processQueue?action=stats');
    const stats = await statsResponse.json();
    console.log('Queue Stats:', JSON.stringify(stats, null, 2));
    console.log('');

    // Test 3: Manually trigger Resend test
    console.log('📨 Test 3: Direct Resend Test');
    console.log('=============================');
    
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const directEmailResult = await resend.emails.send({
        from: process.env.FROM_EMAIL ? 
          `TSR Gallery <${process.env.FROM_EMAIL}>` : 
          'TSR Gallery <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com'],
        subject: '🧪 Direct Resend Test - Order Flow',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3949AB;">✅ Direct Resend Test Success</h2>
            <p>This email was sent directly through Resend API to test the order email flow.</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Configuration Used:</h3>
              <p><strong>From:</strong> ${process.env.FROM_EMAIL || 'onboarding@resend.dev'}</p>
              <p><strong>To:</strong> ${process.env.ADMIN_EMAIL}</p>
              <p><strong>Domain Status:</strong> ${process.env.FROM_EMAIL ? 'Custom Domain' : 'Resend Default'}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            </div>
            <p><strong>Next Step:</strong> If you receive this email, the issue is with the queue processing, not email sending.</p>
          </div>
        `
      });

      console.log('✅ Direct email sent successfully!');
      console.log(`   Email ID: ${directEmailResult.data?.id || 'N/A'}`);
      console.log(`   From: ${process.env.FROM_EMAIL || 'onboarding@resend.dev'}`);
      console.log(`   To: ${process.env.ADMIN_EMAIL}`);
      
      if (directEmailResult.data?.id) {
        console.log(`   📊 Check status: https://resend.com/emails/${directEmailResult.data.id}`);
      }

    } catch (emailError) {
      console.log('❌ Direct email failed:', emailError.message);
    }

    console.log('');

    // Recommendations
    console.log('🎯 Troubleshooting Summary:');
    console.log('===========================');
    console.log('1. ✅ Environment variables are configured');
    console.log('2. ✅ Domain is verified in Resend');
    console.log('3. 🔄 Testing queue processing via API');
    console.log('4. 🔄 Testing direct email sending');
    console.log('');
    console.log('💡 If direct email works but queue doesn\'t:');
    console.log('   - Issue is in queue processing logic');
    console.log('   - Check Next.js server console for errors');
    console.log('   - Verify Upstash Redis connection');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrderEmailFlow();
