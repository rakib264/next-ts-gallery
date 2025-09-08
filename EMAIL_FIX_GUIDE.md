# Email System Fix Guide

## Problem
Emails are not being sent in production after order creation or contact form submission. Jobs are being queued successfully but failing during processing.

## Root Cause Analysis
1. **Environment Variables Missing**: The required environment variables for Resend and Upstash Redis are not set in production
2. **Queue Processing Failures**: Jobs are being processed but failing due to missing configuration
3. **Email Service Configuration**: Resend service is not properly configured

## Required Environment Variables

### For Vercel Production Environment:

```bash
# Resend Email Service (Required)
RESEND_API_KEY=re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn

# Admin Email Configuration (Required)
ADMIN_EMAIL=info.tsrgallery@gmail.com

# Email Sender Configuration (Optional - will use Resend defaults if not set)
FROM_EMAIL=noreply@tsrgallery.com
FROM_NAME=TSR Gallery

# Upstash Redis (Required for queue processing)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# NextAuth (Already configured)
NEXTAUTH_URL=https://www.tsrgallery.com
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
```

## Step-by-Step Fix

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables" section
4. Add the following variables:

```
RESEND_API_KEY = re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn
ADMIN_EMAIL = info.tsrgallery@gmail.com
FROM_EMAIL = noreply@tsrgallery.com
FROM_NAME = TSR Gallery
UPSTASH_REDIS_REST_URL = [your_upstash_redis_url]
UPSTASH_REDIS_REST_TOKEN = [your_upstash_redis_token]
```

### Step 2: Verify Resend Configuration

The Resend API key `re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn` should work with:
- **From Address**: `onboarding@resend.dev` (Resend's default domain)
- **To Address**: Any valid email address (Gmail, Yahoo, etc.)

### Step 3: Test Email Functionality

After setting environment variables:

1. **Test Contact Form**: Submit a contact form and check if admin receives email
2. **Test Order Creation**: Create a test order and check if customer and admin receive emails
3. **Check Queue Processing**: Visit `/api/processQueue?action=stats` to see queue status

### Step 4: Monitor Queue Processing

The Vercel cron job runs every minute to process the queue. You can:

1. **Manual Processing**: `POST /api/processQueue`
2. **Check Stats**: `GET /api/processQueue?action=stats`
3. **Health Check**: `GET /api/processQueue?action=health`

## Expected Email Flow

### Order Creation:
1. Order created → Jobs queued in Redis
2. Vercel cron processes queue every minute
3. Three emails sent:
   - **Admin notification** → `info.tsrgallery@gmail.com`
   - **Customer confirmation** → Customer's email
   - **Invoice email** → Customer's email (with PDF attachment)

### Contact Form:
1. Form submitted → Job queued in Redis
2. Vercel cron processes queue
3. **Admin notification** → `info.tsrgallery@gmail.com`

## Troubleshooting

### If emails still don't work:

1. **Check Vercel Logs**: Look for error messages in function logs
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test Resend API**: Use the test endpoint to verify Resend configuration
4. **Check Queue Status**: Monitor queue processing and failed jobs

### Common Issues:

1. **Missing RESEND_API_KEY**: Emails will fail to send
2. **Missing ADMIN_EMAIL**: Admin notifications won't work
3. **Missing Redis credentials**: Queue processing will fail
4. **Invalid email addresses**: Emails will bounce

## Verification Steps

After implementing the fix:

1. ✅ Environment variables set in Vercel
2. ✅ Contact form sends email to admin
3. ✅ Order creation sends emails to customer and admin
4. ✅ Queue processing works without failures
5. ✅ Vercel cron job runs successfully

## Support

If issues persist:
1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test Resend API key independently
4. Monitor queue processing statistics

