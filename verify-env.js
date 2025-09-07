#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script helps verify that all required environment variables are properly set
 */

console.log('🔍 Verifying Environment Variables for Deployment...\n');

const requiredVars = {
  // New Queue & Email System
  'UPSTASH_REDIS_REST_URL': 'Upstash Redis URL for queue system',
  'UPSTASH_REDIS_REST_TOKEN': 'Upstash Redis token for queue system', 
  'RESEND_API_KEY': 'Resend API key for email system',
  
  // Email Configuration
  'ADMIN_EMAIL': 'Admin email for notifications',
  'FROM_EMAIL': 'From email address (optional - has default)',
  'FROM_NAME': 'From name (optional - has default)',
  
  // Core Application
  'DATABASE_URL': 'MongoDB connection string',
  'NEXTAUTH_SECRET': 'NextAuth secret key',
  'NEXTAUTH_URL': 'NextAuth URL (should be your Vercel domain)',
};

const optionalVars = {
  'NEXT_PUBLIC_BASE_URL': 'Public base URL',
  'NEXT_PUBLIC_SITE_NAME': 'Site name',
  'NEXT_PUBLIC_SITE_DESCRIPTION': 'Site description',
  'CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name',
  'CLOUDINARY_API_KEY': 'Cloudinary API key',
  'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
};

console.log('✅ REQUIRED Environment Variables:');
console.log('==================================');

let missingRequired = [];
let hasRequired = [];

Object.entries(requiredVars).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: Set`);
    hasRequired.push(key);
  } else {
    console.log(`❌ ${key}: MISSING - ${description}`);
    missingRequired.push(key);
  }
});

console.log('\n📋 OPTIONAL Environment Variables:');
console.log('==================================');

Object.entries(optionalVars).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: Set`);
  } else {
    console.log(`⚠️  ${key}: Not set - ${description}`);
  }
});

console.log('\n🎯 SUMMARY:');
console.log('===========');
console.log(`✅ Required variables set: ${hasRequired.length}/${Object.keys(requiredVars).length}`);
console.log(`❌ Missing required variables: ${missingRequired.length}`);

if (missingRequired.length === 0) {
  console.log('\n🎉 ALL REQUIRED VARIABLES ARE SET!');
  console.log('✅ Your Vercel deployment should work now.');
  console.log('\n💡 Next steps:');
  console.log('1. Check Vercel dashboard for deployment status');
  console.log('2. If still failing, check build logs in Vercel');
  console.log('3. Verify that environment variables are set in the correct Vercel project');
} else {
  console.log('\n🚨 DEPLOYMENT WILL FAIL!');
  console.log('❌ Missing required environment variables in Vercel:');
  missingRequired.forEach(key => {
    console.log(`   - ${key}: ${requiredVars[key]}`);
  });
  console.log('\n💡 To fix:');
  console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('2. Add the missing variables listed above');
  console.log('3. Redeploy your project');
}

console.log('\n🔗 Helpful Links:');
console.log('- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables');
console.log('- Upstash Console: https://console.upstash.com/');
console.log('- Resend Dashboard: https://resend.com/emails');
