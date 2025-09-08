# Email System Debug Guide

## Overview
This guide helps you debug your email notification system using Upstash Redis + Resend on Vercel.

## Test Endpoints Created

### 1. `/api/test-queue` - Test Upstash Queue Enqueueing
**Purpose**: Verify that jobs can be successfully enqueued to Upstash Redis.

**Usage**:
```bash
curl -X POST https://www.tsrgallery.com/api/test-queue
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Test job enqueued successfully",
  "jobId": "test-1757312828213",
  "queueName": "nextecom_tasks",
  "queueLength": 1
}
```

**What it does**:
- Creates a test email job
- Enqueues it to Upstash Redis
- Returns job details and queue length

### 2. `/api/consume-queue` - Manual Queue Processing
**Purpose**: Manually dequeue and process one job from the queue.

**Usage**:
```bash
curl -X POST https://www.tsrgallery.com/api/consume-queue
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Job processed successfully",
  "jobId": "test-1757312828213",
  "jobType": "send_email",
  "emailResult": {
    "id": "re_abc123",
    "error": null
  },
  "processed": 1
}
```

**What it does**:
- Dequeues one job from Redis
- Processes it (sends email via Resend)
- Returns processing results

### 3. `/api/test-resend` - Direct Resend Testing
**Purpose**: Test Resend API directly, bypassing the queue system.

**Usage**:
```bash
curl -X POST https://www.tsrgallery.com/api/test-resend
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Direct Resend test successful",
  "emailId": "re_abc123",
  "from": "TSR Gallery <noreply@tsrgallery.com>",
  "to": ["info.tsrgallery@gmail.com"]
}
```

**What it does**:
- Directly calls Resend API
- Sends test email to admin
- Returns Resend response

### 4. `/api/worker` - Automated Queue Processing
**Purpose**: Process multiple jobs from the queue (used by cron job).

**Usage**:
```bash
curl -X POST https://www.tsrgallery.com/api/worker
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Worker completed",
  "processed": 3,
  "failed": 0,
  "initialQueueLength": 3,
  "finalQueueLength": 0
}
```

**What it does**:
- Processes up to 10 jobs per run
- Handles retries and failures
- Returns processing statistics

## Debugging Workflow

### Step 1: Test Resend Directly
```bash
curl -X POST https://www.tsrgallery.com/api/test-resend
```
- ✅ **Success**: Resend API is working, check your email
- ❌ **Failure**: Check RESEND_API_KEY, FROM_EMAIL, ADMIN_EMAIL

### Step 2: Test Queue Enqueueing
```bash
curl -X POST https://www.tsrgallery.com/api/test-queue
```
- ✅ **Success**: Upstash Redis is working
- ❌ **Failure**: Check UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

### Step 3: Test Queue Processing
```bash
curl -X POST https://www.tsrgallery.com/api/consume-queue
```
- ✅ **Success**: Queue + Resend integration is working
- ❌ **Failure**: Check the logs for specific error

### Step 4: Test Automated Processing
```bash
curl -X POST https://www.tsrgallery.com/api/worker
```
- ✅ **Success**: Full system is working
- ❌ **Failure**: Check cron job configuration

## Environment Variables Required

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Resend Email
RESEND_API_KEY=re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn
ADMIN_EMAIL=info.tsrgallery@gmail.com
FROM_EMAIL=noreply@tsrgallery.com
FROM_NAME=TSR Gallery
```

## Cron Job Configuration

The system is configured to run the worker every minute:

```json
{
  "crons": [
    {
      "path": "/api/worker",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

## Debug Logs

All endpoints include comprehensive logging:

- 📧 **Email sending**: Logs from/to/subject before sending
- 📧 **Resend response**: Logs success/error after sending
- ❌ **Errors**: Detailed error logging with context
- 📊 **Queue stats**: Queue length and processing statistics

## Common Issues & Solutions

### 1. "RESEND_API_KEY not found"
- **Solution**: Set RESEND_API_KEY in Vercel environment variables

### 2. "Upstash Redis credentials not found"
- **Solution**: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

### 3. "ADMIN_EMAIL not found"
- **Solution**: Set ADMIN_EMAIL in Vercel environment variables

### 4. Jobs enqueued but not processed
- **Solution**: Check if cron job is running, manually test `/api/worker`

### 5. Emails sent but not received
- **Solution**: Check spam folder, verify FROM_EMAIL domain is verified in Resend

## Testing Checklist

- [ ] `/api/test-resend` returns success
- [ ] `/api/test-queue` returns success
- [ ] `/api/consume-queue` returns success
- [ ] `/api/worker` processes jobs successfully
- [ ] Cron job runs every minute (check Vercel logs)
- [ ] Emails are received in inbox (not spam)

## Next Steps

1. **Deploy** the changes to Vercel
2. **Test** each endpoint in order
3. **Check** Vercel function logs for detailed debugging
4. **Verify** emails are received
5. **Monitor** cron job execution in Vercel dashboard

This comprehensive testing system will help you identify exactly where the email system is failing and fix it quickly.
