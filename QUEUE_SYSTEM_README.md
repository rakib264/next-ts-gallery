# Queue System Migration: RabbitMQ + Nodemailer → Upstash Redis + Resend

This document describes the migration from RabbitMQ + Nodemailer to Upstash Redis + Resend for handling background tasks and email delivery.

## Overview

The new system replaces the complex RabbitMQ + Railway setup with a simpler, more reliable queue system using:

- **Upstash Redis**: Serverless Redis for queue management
- **Resend**: Transactional email service
- **Puppeteer**: PDF invoice generation
- **Vercel Cron**: Automatic queue processing

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │───▶│ Upstash Redis   │───▶│ Queue Processor │
│ (Order, Contact)│    │     Queue       │    │ /api/processQueue│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Job Handlers  │
                                              │ • Email (Resend)│
                                              │ • PDF (Puppeteer)│
                                              │ • Notifications │
                                              └─────────────────┘
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Upstash Redis (Required)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Resend Email (Required)
RESEND_API_KEY=re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn

# Admin Configuration (Required)
ADMIN_EMAIL=admin@tsrgallery.com
```

## Job Types

The system handles these job types:

### 1. Email Jobs (`SEND_EMAIL`)
- Order confirmations
- Invoice emails with PDF attachments
- OTP emails
- Return/exchange notifications

### 2. Invoice Generation (`GENERATE_INVOICE`)
- PDF generation using Puppeteer
- Order details, customer info, itemized billing
- Automatic email delivery to customers

### 3. Admin Notifications
- `NEW_ORDER_NOTIFICATION`: New order alerts
- `NEW_CUSTOMER_NOTIFICATION`: Customer registration alerts
- `NEW_PRODUCT_NOTIFICATION`: Product creation alerts
- `LOW_STOCK_ALERT`: Inventory warnings
- `CONTACT_FORM_NOTIFICATION`: Contact form submissions

## Queue Processing

### Automatic Processing (Vercel Cron)
The queue is processed automatically every minute via Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/processQueue",
      "schedule": "* * * * *"
    }
  ]
}
```

### Manual Processing
You can also process the queue manually:

```bash
# Process queue
curl -X POST https://your-domain.com/api/processQueue

# Get queue statistics
curl https://your-domain.com/api/processQueue?action=stats

# Health check
curl https://your-domain.com/api/processQueue?action=health

# Clear failed jobs
curl https://your-domain.com/api/processQueue?action=clear-failed
```

## Usage Examples

### 1. Order Creation
```typescript
// In your order API route
import queueService, { JobType } from '@/lib/queue';

// Queue admin notification
await queueService.enqueue({
  type: JobType.NEW_ORDER_NOTIFICATION,
  orderId: order._id.toString(),
  orderNumber: order.orderNumber,
  customerEmail: customerEmail,
  total: order.total
});

// Queue invoice generation
await queueService.enqueue({
  type: JobType.GENERATE_INVOICE,
  orderId: order._id.toString(),
  orderData: order.toObject()
});
```

### 2. Contact Form
```typescript
// In your contact API route
import queueService, { JobType } from '@/lib/queue';

await queueService.enqueue({
  type: JobType.CONTACT_FORM_NOTIFICATION,
  name: formData.name,
  email: formData.email,
  subject: formData.subject,
  message: formData.message,
  adminEmail: process.env.ADMIN_EMAIL
});
```

### 3. Low Stock Alerts
```typescript
// In your inventory management
await queueService.enqueue({
  type: JobType.LOW_STOCK_ALERT,
  productId: product._id,
  productName: product.name,
  currentStock: product.quantity,
  threshold: product.lowStockThreshold
});
```

## Email Templates

The Resend service includes responsive email templates for:

- **Order Confirmations**: Professional order summary with branding
- **Invoices**: Clean invoice layout with PDF attachment
- **OTP Emails**: Secure verification code delivery
- **Admin Notifications**: Structured alerts for business events
- **Contact Form**: Customer inquiry forwarding

## Error Handling & Reliability

### Retry Logic
- Failed jobs are automatically retried up to 3 times
- Exponential backoff with 5-second delays
- Failed jobs are moved to a dead letter queue for manual inspection

### Monitoring
- Comprehensive logging with Winston
- Queue statistics available via API
- Health check endpoint for monitoring

### Graceful Degradation
- Order creation doesn't fail if queue is unavailable
- Fallback error messages for users
- Admin alerts for system issues

## Performance & Scalability

### Queue Processing
- Batch processing (10 jobs per batch by default)
- 25-second timeout for Vercel functions
- Automatic scaling with Redis

### Email Delivery
- Resend handles delivery optimization
- Built-in bounce and complaint handling
- Domain authentication for better deliverability

## Migration Benefits

1. **Simplified Architecture**: No more complex RabbitMQ + Railway setup
2. **Better Reliability**: Serverless Redis with 99.9% uptime
3. **Improved Deliverability**: Professional email service with domain authentication
4. **Cost Effective**: Pay-per-use pricing model
5. **Easy Monitoring**: Built-in dashboards and metrics
6. **Vercel Native**: Optimized for serverless deployment

## Troubleshooting

### Common Issues

**Queue not processing:**
- Check Upstash Redis credentials
- Verify Vercel cron is enabled
- Check function logs in Vercel dashboard

**Emails not sending:**
- Verify Resend API key
- Check domain authentication in Resend dashboard
- Review email logs in Resend

**PDF generation failing:**
- Check Puppeteer compatibility with Vercel
- Verify sufficient memory allocation
- Review PDF service logs

### Debug Commands

```bash
# Check queue stats
curl https://your-domain.com/api/processQueue?action=stats

# Process queue manually
curl -X POST https://your-domain.com/api/processQueue

# Clear failed jobs
curl https://your-domain.com/api/processQueue?action=clear-failed
```

## Files Changed

### New Files
- `lib/queue.ts` - Queue service with Upstash Redis
- `lib/resend.ts` - Email service with Resend
- `lib/pdf.ts` - PDF generation service
- `app/api/processQueue/route.ts` - Queue processor endpoint

### Updated Files
- `app/api/orders/route.ts` - Uses new queue system
- `app/api/contact/route.ts` - Uses new queue system
- `vercel.json` - Added cron job configuration
- `package.json` - Added Upstash Redis and Resend dependencies

### Deprecated Files (can be removed)
- `lib/rabbitmq.ts`
- `lib/rabbitmq-simple.ts`
- `lib/email.ts` (old Nodemailer service)
- `lib/consumerService.ts`
- `lib/eventHandlers.ts`
- `lib/startup.ts`
- `railway-consumers/` directory
- All RabbitMQ consumer scripts

## Next Steps

1. **Deploy to Vercel**: The system will work immediately on deployment
2. **Configure Domain**: Set up domain authentication in Resend
3. **Monitor Performance**: Watch queue metrics and email delivery rates
4. **Remove Old Code**: Clean up deprecated RabbitMQ files after testing
5. **Update Documentation**: Update any references to the old system

## Support

For issues or questions:
- Check Vercel function logs
- Review Upstash Redis metrics
- Monitor Resend email delivery dashboard
- Check queue statistics via API endpoints
