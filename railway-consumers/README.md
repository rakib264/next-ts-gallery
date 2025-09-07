# NextEcom RabbitMQ Consumers - Railway Deployment

This directory contains the RabbitMQ consumers that process events from the main NextEcom application deployed on Vercel. The consumers run on Railway and handle:

- Invoice generation and customer email notifications
- Admin order notifications
- Low stock alerts
- Customer registration notifications
- Product creation notifications

## 🚀 Quick Start

### 1. Environment Setup

Before deploying to Railway, ensure you have all required environment variables set:

```bash
# Run the environment validator
npm run validate-env
```

### 2. Local Testing

```bash
# Test RabbitMQ connection and message flow
npm run debug

# Validate environment variables
npm run validate-env

# Run both tests
npm run test-connection
```

### 3. Railway Deployment

1. Connect your Railway account to this repository
2. Create a new Railway project
3. Set all required environment variables in Railway dashboard
4. Deploy the project

## 🔧 Troubleshooting

### Common Issues

#### 1. Consumers Not Starting

**Symptoms:**
- Railway deployment shows as "healthy" but no events are processed
- No admin emails or customer invoices are sent

**Solutions:**
```bash
# Check Railway logs
railway logs

# Validate environment variables
npm run validate-env

# Test RabbitMQ connection
npm run debug
```

#### 2. RabbitMQ Connection Failed

**Symptoms:**
- Error: "Failed to connect to RabbitMQ"
- Error: "RABBITMQ_URL environment variable is not properly configured"

**Solutions:**
1. Verify `RABBITMQ_URL` is set correctly in Railway
2. Ensure RabbitMQ service is running on Railway
3. Check if the URL format is correct: `amqp://username:password@host:port`

#### 3. Email Not Sending

**Symptoms:**
- Events are processed but no emails are sent
- SMTP errors in logs

**Solutions:**
1. Verify SMTP credentials in Railway environment variables
2. Check if email service is properly initialized
3. Ensure `ADMIN_EMAIL` and `FROM_EMAIL` are set correctly

#### 4. Events Not Being Published

**Symptoms:**
- Orders are created but no events appear in RabbitMQ
- Main app shows "RABBITMQ_URL not configured"

**Solutions:**
1. Ensure `RABBITMQ_URL` is set in Vercel environment variables
2. Check if the main app can connect to Railway RabbitMQ
3. Verify network connectivity between Vercel and Railway

### Debug Commands

```bash
# Test RabbitMQ connection and message publishing
npm run debug

# Validate all environment variables
npm run validate-env

# Check Railway deployment status
railway status

# View Railway logs
railway logs --follow
```

## 📋 Required Environment Variables

### Core Configuration
- `NODE_ENV` - Node environment (production/development)
- `RABBITMQ_URL` - RabbitMQ connection URL from Railway
- `DATABASE_URL` - MongoDB connection URL

### Email Configuration
- `SMTP_HOST` - SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (e.g., 587)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password or app password
- `FROM_EMAIL` - From email address for outgoing emails
- `FROM_NAME` - From name for outgoing emails (optional)
- `ADMIN_EMAIL` - Admin email for notifications

### Optional Services
- `CLOUDINARY_CLOUD_NAME` - For file uploads
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `TWILIO_ACCOUNT_SID` - For SMS notifications
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `JWT_SECRET` - JWT secret for token signing

## 🔍 Monitoring

### Health Check
The service provides a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "nextecom-consumers",
  "uptime": 3600
}
```

### Logs
All logs are written to:
- Console (for Railway monitoring)
- `logs/` directory (if running locally)

Log files:
- `rabbitmq-combined.log` - All RabbitMQ events
- `rabbitmq-error.log` - RabbitMQ errors only
- `email-combined.log` - All email events
- `email-error.log` - Email errors only

## 🏗️ Architecture

```
Vercel (Main App) → RabbitMQ (Railway) → Consumers (Railway)
     ↓                    ↓                    ↓
  Order Creation    Message Queue      Event Processing
     ↓                    ↓                    ↓
  Event Publishing   Message Storage   Email Sending
```

## 📞 Support

If you're still experiencing issues:

1. Check Railway logs: `railway logs --follow`
2. Run debug scripts: `npm run debug`
3. Validate environment: `npm run validate-env`
4. Check Vercel logs for event publishing errors
5. Verify RabbitMQ service is running on Railway

## 🔄 Deployment Process

1. **Main App (Vercel):**
   - Set `RABBITMQ_URL` environment variable
   - Deploy to Vercel
   - Verify events are being published

2. **Consumers (Railway):**
   - Set all required environment variables
   - Deploy to Railway
   - Verify consumers are running and processing events

3. **Testing:**
   - Create a test order
   - Check Railway logs for event processing
   - Verify admin and customer emails are sent
