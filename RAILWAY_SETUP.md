# Railway Environment Variables Setup Guide

This guide will help you set up all the required environment variables for your Railway deployment.

## 🚀 Quick Setup Steps

### 1. Access Railway Dashboard
1. Go to [Railway.app](https://railway.app)
2. Sign in to your account
3. Navigate to your project

### 2. Add Environment Variables
1. Click on your project
2. Go to the **Variables** tab
3. Click **+ New Variable** for each variable below

## 📋 Required Environment Variables

### Core Configuration
```bash
NODE_ENV=production
RABBITMQ_URL=amqp://username:password@host:port
DATABASE_URL=mongodb://username:password@host:port/database
```

### Email Configuration (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=NextEcom
ADMIN_EMAIL=admin@yourdomain.com
```

### Optional Services
```bash
# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here
```

## 🔧 How to Get These Values

### 1. RABBITMQ_URL
If you're using Railway's RabbitMQ service:
1. Go to your Railway project
2. Click on the RabbitMQ service
3. Go to the **Variables** tab
4. Copy the `RABBITMQ_URL` value
5. Paste it into your consumer service variables

### 2. DATABASE_URL
If you're using Railway's MongoDB service:
1. Go to your Railway project
2. Click on the MongoDB service
3. Go to the **Variables** tab
4. Copy the `DATABASE_URL` value
5. Paste it into your consumer service variables

### 3. SMTP Configuration (Gmail Example)
For Gmail SMTP:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**To get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate app password
4. Use this password for `SMTP_PASS`

### 4. Cloudinary Setup
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up/login to your account
3. Go to Dashboard
4. Copy the values from the "Account Details" section

### 5. Twilio Setup (Optional)
1. Go to [Twilio.com](https://twilio.com)
2. Sign up/login to your account
3. Go to Console Dashboard
4. Copy Account SID and Auth Token
5. Buy a phone number for SMS

## 🎯 Step-by-Step Railway Setup

### Step 1: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Choose the `railway-consumers` folder as the root directory

### Step 2: Add Services
1. **RabbitMQ Service:**
   - Click "+ New" → "Database" → "RabbitMQ"
   - Wait for it to deploy
   - Copy the `RABBITMQ_URL` from Variables tab

2. **MongoDB Service (if not using external):**
   - Click "+ New" → "Database" → "MongoDB"
   - Wait for it to deploy
   - Copy the `DATABASE_URL` from Variables tab

### Step 3: Configure Consumer Service
1. Click on your consumer service
2. Go to **Variables** tab
3. Add all the required variables listed above

### Step 4: Deploy
1. Railway will automatically deploy when you push to your repository
2. Check the **Deployments** tab for build logs
3. Check the **Logs** tab for runtime logs

## 🔍 Verification Steps

### 1. Check Deployment Status
- Go to your Railway project
- Check that all services show "Deployed" status
- Look for any error messages in the logs

### 2. Test Environment Variables
You can run this command locally to test your environment:
```bash
cd railway-consumers
npm run validate-env
```

### 3. Test RabbitMQ Connection
```bash
cd railway-consumers
npm run debug
```

### 4. Check Logs
- Go to Railway dashboard
- Click on your consumer service
- Go to **Logs** tab
- Look for these success messages:
  ```
  ✅ All required environment variables are set
  🔌 Connecting to RabbitMQ...
  ✅ Successfully connected to RabbitMQ
  ✅ Invoice Generation consumer started successfully
  ✅ New Order Creation consumer started successfully
  ```

## 🚨 Common Issues & Solutions

### Issue 1: "RABBITMQ_URL not configured"
**Solution:** Make sure you've added the `RABBITMQ_URL` variable to your consumer service, not just the RabbitMQ service.

### Issue 2: "SMTP configuration is incomplete"
**Solution:** Verify all SMTP variables are set correctly, especially `SMTP_USER` and `SMTP_PASS`.

### Issue 3: "Failed to connect to RabbitMQ"
**Solution:** 
1. Check that RabbitMQ service is running
2. Verify the `RABBITMQ_URL` format is correct
3. Make sure the URL includes username and password

### Issue 4: "Email transporter not initialized"
**Solution:**
1. Check SMTP credentials
2. Verify Gmail App Password is used (not regular password)
3. Ensure 2FA is enabled on Gmail account

## 📞 Support

If you're still having issues:

1. **Check Railway Logs:** Go to your service → Logs tab
2. **Validate Environment:** Run `npm run validate-env`
3. **Test Connection:** Run `npm run debug`
4. **Check Vercel Logs:** Ensure your main app can connect to Railway RabbitMQ

## 🔄 Testing the Complete Flow

1. **Deploy to Railway:** Make sure consumers are running
2. **Deploy to Vercel:** Make sure main app has `RABBITMQ_URL` set
3. **Create Test Order:** Place an order on your website
4. **Check Logs:** Verify events are published and processed
5. **Check Emails:** Verify admin and customer emails are sent

Your RabbitMQ message queue should now work end-to-end! 🎉


