#!/usr/bin/env node

/**
 * Debug Email Issue
 * 
 * Helps identify why emails are not being delivered
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('🔍 Debugging Email Delivery Issue...\n');

async function debugEmailIssue() {
  try {
    console.log('📧 Current Configuration:');
    console.log('========================');
    console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'Not set'}`);
    console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'Not set'}`);
    console.log(`FROM_NAME: ${process.env.FROM_NAME || 'Not set'}`);
    console.log('');

    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY is missing. Please check your .env file.');
      return;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Test 1: Check API key validity
    console.log('🔑 Test 1: API Key Validation');
    console.log('==============================');
    try {
      const domains = await resend.domains.list();
      console.log('✅ API Key is valid');
      console.log(`📧 Domains configured: ${domains.data?.length || 0}`);
      
      if (domains.data && domains.data.length > 0) {
        domains.data.forEach(domain => {
          console.log(`   - ${domain.name}: ${domain.status}`);
        });
      } else {
        console.log('⚠️  No domains configured - this might be the issue!');
      }
    } catch (error) {
      console.log('❌ API Key validation failed:', error.message);
      return;
    }

    console.log('');

    // Test 2: Try sending with Resend's default domain
    console.log('📨 Test 2: Send with Resend Default Domain');
    console.log('==========================================');
    
    try {
      const result = await resend.emails.send({
        from: 'TSR Gallery <onboarding@resend.dev>', // Use Resend's default domain
        to: [process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com'],
        subject: '🧪 Test Email - Default Domain',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3949AB;">✅ Email Test with Default Domain</h2>
            <p>This email was sent using Resend's default domain (onboarding@resend.dev).</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Test Details:</h3>
              <p><strong>From:</strong> onboarding@resend.dev</p>
              <p><strong>To:</strong> ${process.env.ADMIN_EMAIL}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            </div>
            <p>If you receive this email, the issue is with your custom domain configuration.</p>
          </div>
        `
      });

      console.log('✅ Email sent with default domain!');
      console.log(`   Email ID: ${result.data?.id || 'N/A'}`);
      console.log(`   From: onboarding@resend.dev`);
      console.log(`   To: ${process.env.ADMIN_EMAIL}`);
      console.log('   💡 Check your inbox in 1-2 minutes');
      
      if (result.data?.id) {
        console.log(`   📊 Check status: https://resend.com/emails/${result.data.id}`);
      }

    } catch (error) {
      console.log('❌ Failed to send with default domain:', error.message);
    }

    console.log('');

    // Test 3: Try sending with your custom domain (if configured)
    console.log('📨 Test 3: Send with Your Domain');
    console.log('=================================');
    
    try {
      const result = await resend.emails.send({
        from: `${process.env.FROM_NAME || 'TSR Gallery'} <${process.env.FROM_EMAIL || 'info.tsrgallery@gmail.com'}>`,
        to: [process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com'],
        subject: '🧪 Test Email - Your Domain',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3949AB;">✅ Email Test with Your Domain</h2>
            <p>This email was sent using your custom domain.</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Test Details:</h3>
              <p><strong>From:</strong> ${process.env.FROM_EMAIL}</p>
              <p><strong>To:</strong> ${process.env.ADMIN_EMAIL}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            </div>
            <p>If you receive this email, your domain is properly configured!</p>
          </div>
        `
      });

      console.log('✅ Email sent with your domain!');
      console.log(`   Email ID: ${result.data?.id || 'N/A'}`);
      console.log(`   From: ${process.env.FROM_EMAIL}`);
      console.log(`   To: ${process.env.ADMIN_EMAIL}`);
      
      if (result.data?.id) {
        console.log(`   📊 Check status: https://resend.com/emails/${result.data.id}`);
      }

    } catch (error) {
      console.log('❌ Failed to send with your domain:', error.message);
      
      if (error.message.includes('domain')) {
        console.log('   💡 Domain not verified - you need to add your domain in Resend dashboard');
      }
    }

    console.log('');

    // Recommendations
    console.log('🎯 Troubleshooting Recommendations:');
    console.log('===================================');
    
    const fromEmailDomain = (process.env.FROM_EMAIL || '').split('@')[1];
    const adminEmailDomain = (process.env.ADMIN_EMAIL || '').split('@')[1];
    
    if (fromEmailDomain === 'gmail.com') {
      console.log('⚠️  Issue Found: You cannot send FROM a Gmail address');
      console.log('   Solution: Change FROM_EMAIL to use your domain or remove it to use Resend default');
      console.log('   Example: FROM_EMAIL=noreply@tsrgallery.com');
    }
    
    console.log('');
    console.log('📋 Quick Fixes:');
    console.log('1. Use Resend default domain (remove FROM_EMAIL from .env)');
    console.log('2. Add your domain in Resend dashboard: https://resend.com/domains');
    console.log('3. Verify domain with DNS records');
    console.log('4. Check spam folder in Gmail');
    console.log('5. Check Resend dashboard: https://resend.com/emails');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugEmailIssue();
