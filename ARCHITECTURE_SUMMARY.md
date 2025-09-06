# Vercel + Railway Architecture - Complete Setup

## ✅ What's Fixed

### 1. **Serverless Environment Issues**
- ✅ Fixed Winston logger trying to create `logs` directory in Vercel
- ✅ Created serverless-compatible logger that uses console transport only
- ✅ Made RabbitMQ imports dynamic to prevent initialization issues
- ✅ Orders API now works without 405 errors

### 2. **Event Publishing Architecture**
- ✅ Vercel publishes events to RabbitMQ when orders are created
- ✅ Railway consumers handle all background processing
- ✅ Proper separation of concerns between web app and background tasks

### 3. **Email & Invoice Generation**
- ✅ Admin notifications sent via Railway consumers
- ✅ Customer order confirmation emails sent via Railway consumers
- ✅ Invoice generation handled by Railway consumers
- ✅ Invoice download API created for Vercel

## 🏗️ Architecture Overview

```
┌─────────────────┐    RabbitMQ     ┌─────────────────┐
│                 │   Events        │                 │
│   Vercel App    │ ──────────────► │ Railway Consumers│
│                 │                 │                 │
│ • Order Creation│                 │ • Email Notifications│
│ • User Interface│                 │ • Invoice Generation│
│ • API Routes    │                 │ • Admin Alerts   │
└─────────────────┘                 └─────────────────┘
```

## 📋 Deployment Checklist

### Vercel Environment Variables
```bash
# Required for order creation and event publishing
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Optional (for other features)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Railway Environment Variables
```bash
# Required for consumers
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_connection_string
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
ADMIN_EMAIL=admin@yourdomain.com

# Required for invoice generation
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Deployment Steps

### 1. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set all required environment variables
3. Deploy - Vercel will automatically build and deploy
4. Verify: `https://your-app.vercel.app/api/startup`

### 2. Deploy to Railway
1. Create new Railway project
2. Connect the same repository
3. Set root directory to `railway-consumers/`
4. Set all required environment variables
5. Deploy - Railway will start the consumers
6. Verify: `https://your-railway-app.railway.app/health`

### 3. Test Integration
```bash
# Run the integration test
node test-integration.js
```

## 🔄 Event Flow

### When an Order is Created:

1. **User submits order** → Vercel
2. **Vercel validates & saves order** → Database
3. **Vercel publishes events** → RabbitMQ
   - `NEW_ORDER_CREATION` event
   - `INVOICE_GENERATION` event
4. **Vercel responds to user** → Order created successfully
5. **Railway consumes events** → Background processing
   - Sends admin notification email
   - Generates PDF invoice
   - Sends customer confirmation email with invoice

## 📧 Email Notifications

### Admin Notifications
- **Trigger**: `NEW_ORDER_CREATION` event
- **Content**: Order details, customer info, total amount
- **Recipient**: Admin email (from `ADMIN_EMAIL` env var)

### Customer Notifications
- **Trigger**: `INVOICE_GENERATION` event
- **Content**: Order confirmation, invoice PDF attachment
- **Recipient**: Customer email from order

## 📄 Invoice Generation

### Process
1. Railway consumer receives `INVOICE_GENERATION` event
2. Generates PDF invoice using Puppeteer
3. Uploads to Cloudinary for storage
4. Updates order with invoice path
5. Sends email to customer with invoice attachment

### Download
- **API**: `GET /api/orders/[id]/invoice`
- **Trigger**: `POST /api/orders/[id]/invoice`
- **Access**: Order owner or admin

## 🔍 Monitoring & Debugging

### Vercel Monitoring
- Check function logs in Vercel dashboard
- Monitor for RabbitMQ connection errors
- Verify event publishing success

### Railway Monitoring
- Check application logs in Railway dashboard
- Monitor health endpoint: `/health`
- Verify event consumption and processing

### Common Issues

#### Events not published
- Check `RABBITMQ_URL` in Vercel environment variables
- Verify RabbitMQ connection string is correct
- Check Vercel function logs

#### Events not consumed
- Check Railway deployment is running
- Verify `RABBITMQ_URL` in Railway environment variables
- Check Railway logs for connection errors

#### Emails not sent
- Verify SMTP credentials in Railway
- Check email service logs
- Test SMTP connection

#### Invoices not generated
- Check Cloudinary credentials in Railway
- Verify invoice generation logs
- Check file permissions

## 🎯 Benefits of This Architecture

### Performance
- **Fast Response**: Orders created immediately, background processing doesn't block
- **Scalable**: Vercel auto-scales, Railway can be scaled independently
- **Reliable**: Event-driven architecture with message queuing

### Cost Effective
- **Vercel**: Pay only for function execution time
- **Railway**: Pay only for consumer uptime
- **Efficient**: No unnecessary resource usage

### Maintainable
- **Separation of Concerns**: Web app vs background processing
- **Independent Scaling**: Scale each service based on needs
- **Easy Debugging**: Clear separation of logs and monitoring

## 🔧 Files Created/Modified

### New Files
- `lib/logger.ts` - Serverless-compatible logger
- `app/api/orders/[id]/invoice/route.ts` - Invoice download API
- `VERCEL_RAILWAY_ARCHITECTURE.md` - Detailed deployment guide
- `test-integration.js` - Integration testing script
- `ARCHITECTURE_SUMMARY.md` - This summary

### Modified Files
- All Winston logger configurations updated to use new logger
- `app/api/orders/route.ts` - Updated to publish events when RabbitMQ configured
- `app/api/startup/route.ts` - Added serverless environment handling

## ✅ Ready for Production

Your architecture is now ready for production deployment:

1. **Vercel**: Handles all web requests and order creation
2. **Railway**: Processes all background tasks and notifications
3. **RabbitMQ**: Reliable message queuing between services
4. **Monitoring**: Health checks and logging for both services

The system will automatically:
- Create orders on Vercel
- Send admin notifications via Railway
- Generate invoices via Railway
- Send customer emails via Railway
- Handle invoice downloads via Vercel

All without any manual intervention once deployed!
