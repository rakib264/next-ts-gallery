#!/usr/bin/env node

/**
 * Test Simple Email
 * 
 * Tests sending email directly through our resend service
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('📧 Testing Simple Email...\n');

async function testSimpleEmail() {
  try {
    console.log('🔧 Testing Direct Resend Service Import...');
    
    // Try to import the resend service (this might fail)
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('✅ Resend service imported successfully');
    
    // Test basic email sending
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL ? 
        `TSR Gallery <${process.env.FROM_EMAIL}>` : 
        'TSR Gallery <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com'],
      subject: '🧪 Simple Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3949AB;">✅ Simple Email Test</h2>
          <p>This is a basic email test to verify our email configuration.</p>
          <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration:</h3>
            <p><strong>From:</strong> ${process.env.FROM_EMAIL || 'onboarding@resend.dev'}</p>
            <p><strong>To:</strong> ${process.env.ADMIN_EMAIL}</p>
            <p><strong>API Key:</strong> ${process.env.RESEND_API_KEY ? 'Set' : 'Missing'}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
          <p>If you receive this email, the basic email functionality is working.</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Email ID: ${result.data?.id}`);
    console.log(`   From: ${process.env.FROM_EMAIL || 'onboarding@resend.dev'}`);
    console.log(`   To: ${process.env.ADMIN_EMAIL}`);
    console.log('   💌 Check your inbox!');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSimpleEmail();
