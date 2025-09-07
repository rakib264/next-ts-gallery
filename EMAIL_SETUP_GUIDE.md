# Email Setup Guide for Resend

## 📧 Email Configuration Overview

The new queue system uses **Resend** for email delivery. Here's how to configure it properly:

## 🔧 Environment Variables

```bash
# Required - Resend API Key
RESEND_API_KEY=re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn

# Required - Where to send admin notifications
ADMIN_EMAIL=your-real-email@example.com

# Optional - Customize sender details
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME="Your Company Name"
```

## 📨 Email Flow Explanation

### **FROM Address (Sender)**
- **Default**: `noreply@tsrgallery.com`
- **Customizable**: Set `FROM_EMAIL` environment variable
- **Must be**: A domain you've verified in Resend (or use Resend's default)

### **TO Address (Recipient)**
- **Admin notifications**: Go to `ADMIN_EMAIL`
- **Customer emails**: Go to customer's actual email address
- **Can be**: Any valid email address (Gmail, Yahoo, etc.)

## 🚀 Setup Options

### Option 1: Quick Start (Resend's Domain)
**Easiest setup - works immediately**

```bash
RESEND_API_KEY=re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn
ADMIN_EMAIL=your-actual-email@gmail.com  # Your real email
# Don't set FROM_EMAIL - uses Resend's default domain
```

**Result**: 
- Emails sent FROM: `onboarding@resend.dev`
- Emails delivered TO: `your-actual-email@gmail.com`

### Option 2: Your Domain (Recommended)
**Professional setup with your branding**

1. **Add your domain in Resend dashboard**
2. **Add DNS records** to verify domain ownership
3. **Configure environment variables**:

```bash
RESEND_API_KEY=re_GGhRtid5_N8oEbnNjEAQMWunrG3pVsJBn
ADMIN_EMAIL=admin@yourdomain.com        # Where notifications go
FROM_EMAIL=noreply@yourdomain.com       # Your verified domain
FROM_NAME="Your Company Name"
```

**Result**:
- Emails sent FROM: `noreply@yourdomain.com`
- Emails delivered TO: `admin@yourdomain.com`

## 📋 Step-by-Step Setup

### Step 1: Get Resend API Key
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Create an account or login
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `re_`)

### Step 2: Configure Admin Email
Set this to **your actual email** where you want to receive notifications:

```bash
# Examples:
ADMIN_EMAIL=admin@tsrgallery.com      # If this is your real email
ADMIN_EMAIL=redwan@gmail.com          # Your personal email
ADMIN_EMAIL=notifications@company.com  # Company notification email
```

### Step 3: Domain Setup (Optional but Recommended)

#### In Resend Dashboard:
1. Go to "Domains" section
2. Click "Add Domain"
3. Enter your domain (e.g., `tsrgallery.com`)
4. Add the required DNS records to your domain provider

#### DNS Records Example:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: CNAME  
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

### Step 4: Test Configuration
```bash
# Run the environment check
node check-environment.js

# Run the system test
node test-queue-system.js
```

## 🔍 Email Types Sent

### Admin Notifications (TO: ADMIN_EMAIL)
- New order notifications
- Contact form submissions
- Low stock alerts
- Customer registration alerts
- Product creation notifications

### Customer Emails (TO: Customer's Email)
- Order confirmations
- Invoice emails with PDF attachments
- OTP verification codes
- Return/exchange notifications

## 🛠 Troubleshooting

### "Domain not verified" Error
**Solution**: Add your domain in Resend dashboard and complete DNS verification

### "API key invalid" Error
**Solution**: Check your `RESEND_API_KEY` environment variable

### Admin not receiving emails
**Solution**: Check your `ADMIN_EMAIL` is set to your actual email address

### Emails going to spam
**Solution**: 
1. Set up domain authentication (SPF, DKIM records)
2. Use a professional FROM address
3. Avoid spam trigger words in subject lines

## 📊 Monitoring

Check email delivery status in:
- Resend Dashboard → Logs
- Your application logs
- `/api/processQueue?action=stats` - Queue statistics

## 🎯 Example Configuration

For **TSR Gallery**:

```bash
# Production setup
RESEND_API_KEY=re_your_actual_key_here
ADMIN_EMAIL=admin@tsrgallery.com
FROM_EMAIL=noreply@tsrgallery.com  
FROM_NAME="TSR Gallery"

# Development/Testing setup
RESEND_API_KEY=re_your_actual_key_here
ADMIN_EMAIL=your-personal-email@gmail.com
# FROM_EMAIL not set - uses Resend default
```

## ✅ Verification Checklist

- [ ] Resend API key obtained and set
- [ ] Admin email configured (your real email)
- [ ] Domain added and verified in Resend (optional)
- [ ] DNS records added (if using custom domain)
- [ ] Environment variables set in deployment
- [ ] Test emails working via test script

Your email system is now ready to handle all notifications and customer communications! 🚀
