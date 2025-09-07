#!/usr/bin/env node

/**
 * Email Monitoring Script
 * 
 * Monitors email activity and shows what's happening with your email system
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('👀 Email System Monitor\n');

async function monitorEmails() {
  try {
    const { Resend } = await import('resend');
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.log('❌ RESEND_API_KEY not found');
      return;
    }

    const resend = new Resend(resendApiKey);

    console.log('📊 Current Email System Status:');
    console.log('===============================');

    // Check API status
    try {
      const domains = await resend.domains.list();
      console.log('✅ Resend API: Connected');
      console.log(`📧 Configured Domains: ${domains.data?.length || 0}`);
      
      if (domains.data && domains.data.length > 0) {
        domains.data.forEach(domain => {
          const statusIcon = domain.status === 'verified' ? '✅' : '⏳';
          console.log(`   ${statusIcon} ${domain.name} - ${domain.status}`);
        });
      } else {
        console.log('   💡 Using Resend default domain (onboarding@resend.dev)');
      }
    } catch (error) {
      console.log('❌ Resend API: Error -', error.message);
    }

    console.log('');

    // Check recent emails (if API supports it)
    console.log('📧 Recent Email Activity:');
    console.log('=========================');
    
    try {
      // Note: Resend may not have a public API to list recent emails
      // This is more for demonstration of what you'd monitor
      console.log('💡 To check recent emails:');
      console.log('   1. Go to https://resend.com/emails');
      console.log('   2. View your email logs and delivery status');
      console.log('   3. Check for any bounces or failures');
    } catch (error) {
      console.log('⚠️ Could not fetch recent emails:', error.message);
    }

    console.log('');

    // Check queue status
    console.log('🔄 Queue System Status:');
    console.log('=======================');
    
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/processQueue?action=stats`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Queue System: Active');
        console.log(`📊 Pending Jobs: ${data.stats?.pending || 0}`);
        console.log(`❌ Failed Jobs: ${data.stats?.failed || 0}`);
      } else {
        console.log('⚠️ Queue System: Could not connect to local server');
      }
    } catch (error) {
      console.log('⚠️ Queue System: Server not running or not accessible');
    }

    console.log('');

    // Environment status
    console.log('⚙️ Configuration Status:');
    console.log('========================');
    
    const config = {
      'RESEND_API_KEY': process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
      'ADMIN_EMAIL': process.env.ADMIN_EMAIL ? `✅ ${process.env.ADMIN_EMAIL}` : '❌ Missing',
      'FROM_EMAIL': process.env.FROM_EMAIL ? `✅ ${process.env.FROM_EMAIL}` : '⚠️ Using default (noreply@tsrgallery.com)',
      'FROM_NAME': process.env.FROM_NAME ? `✅ ${process.env.FROM_NAME}` : '⚠️ Using default (TSR Gallery)'
    };

    Object.entries(config).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    console.log('');
    console.log('🎯 Quick Actions:');
    console.log('=================');
    console.log('• Test email system: node test-email-system.js');
    console.log('• Process queue manually: curl -X POST http://localhost:3000/api/processQueue');
    console.log('• Check Resend dashboard: https://resend.com/emails');
    console.log('• Monitor queue: curl http://localhost:3000/api/processQueue?action=stats');

  } catch (error) {
    console.error('❌ Monitor error:', error.message);
  }
}

monitorEmails();
