# Quick Setup Guide - Payment Method Management

## 🚀 Quick Start (5 Steps)

### Step 1: Deploy Lambda Functions (5 minutes)

#### Portal Session Lambda
1. Go to AWS Lambda Console
2. Create new function: `mesob-create-portal-session-staging`
3. Runtime: Node.js 18.x
4. Copy code from `backend-lambda-portal-session.js`
5. Add environment variables:
   ```
   ENV=staging
   STRIPE_SECRET_KEY_STAGING=sk_test_your_key
   STAGING_APP_URL=https://staging.mesobfinancial.com
   ```
6. Add `stripe` package (use Lambda Layer or zip with node_modules)
7. Set timeout to 30 seconds

#### Webhook Lambda
1. Create new function: `mesob-stripe-webhook-staging`
2. Runtime: Node.js 18.x
3. Copy code from `backend-lambda-stripe-webhook.js`
4. Add environment variables:
   ```
   ENV=staging
   STRIPE_SECRET_KEY_STAGING=sk_test_your_key
   STRIPE_WEBHOOK_SECRET_STAGING=whsec_your_secret
   SES_EMAIL_SOURCE=noreply@mesobfinancial.com
   ```
5. Add `stripe` package
6. Set timeout to 60 seconds

---

### Step 2: Configure API Gateway (3 minutes)

Add these routes to your existing API Gateway:

```
POST /MesobFinancialSystem/create-portal-session
  → Lambda: mesob-create-portal-session-staging
  → CORS: Enabled

POST /MesobFinancialSystem/stripe-webhook
  → Lambda: mesob-stripe-webhook-staging
  → CORS: Enabled
  → Binary Media Types: */*
```

Deploy API Gateway changes.

---

### Step 3: Configure Stripe (2 minutes)

#### Enable Customer Portal
1. Go to: https://dashboard.stripe.com/test/settings/billing/portal
2. Click "Activate test link"
3. Enable:
   - ✅ Update payment methods
   - ✅ Cancel subscriptions
   - ✅ View invoices

#### Add Webhook
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-api-gateway-url/staging/MesobFinancialSystem/stripe-webhook`
4. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_method.updated`
5. Copy webhook signing secret (starts with `whsec_`)
6. Add to Lambda environment variable: `STRIPE_WEBHOOK_SECRET_STAGING`

---

### Step 4: Test It (2 minutes)

1. Go to your app: `/customer/profile`
2. Click "Payment Management" tab
3. Click "Update Payment Method" button
4. Should redirect to Stripe Customer Portal
5. Try updating payment method
6. Should redirect back to your app

---

### Step 5: Verify Webhooks (1 minute)

Use Stripe CLI:
```bash
# Install Stripe CLI if needed
brew install stripe/stripe-cli/stripe

# Test webhook
stripe trigger invoice.payment_failed
```

Check Lambda CloudWatch logs to verify webhook was received.

---

## ✅ What's Working Now

### Frontend
- ✅ "Update Payment Method" button functional
- ✅ Loading state while creating portal session
- ✅ Error handling
- ✅ Redirects to Stripe Customer Portal
- ✅ Returns to Payment Management tab after update

### Backend (Once Deployed)
- ✅ Creates secure portal sessions
- ✅ Handles payment failures automatically
- ✅ Sends email notifications
- ✅ Updates user subscription status
- ✅ Manages payment retries

---

## 🎯 Key Benefits

### For Users
- Update card anytime without losing access
- Professional, secure payment interface
- View all invoices in one place
- Manage subscription easily
- Email notifications for payment issues

### For You
- No PCI compliance burden
- No card data on your servers
- Automatic retry logic
- Built-in security
- Minimal code to maintain

---

## 📊 What Happens in Different Scenarios

### Scenario 1: User Updates Card Mid-Month
```
March 17: Paid $29.99 with Card A ✅
March 25: User updates to Card B
April 17: Next billing charges Card B ✅
```
**Result**: Seamless transition, no double charge

---

### Scenario 2: Card Expires
```
April 17: Stripe attempts charge on expired card
          ❌ Fails
          📧 Email: "Update your payment method"
          User still has access ✅

April 18: User updates to new card via portal
          ✅ New card saved

April 20: Stripe retries with new card
          ✅ Payment succeeds
          📧 Email: "Payment successful"
```
**Result**: No service interruption

---

### Scenario 3: Payment Fails, User Doesn't Update
```
Day 0:  Charge fails → Email sent → Access continues
Day 3:  Retry fails → Email sent → Access continues
Day 5:  Retry fails → Email sent → Access continues
Day 7:  Final retry fails → Subscription cancelled → Access lost
        📧 Email: "Subscription cancelled"
```
**Result**: User had 7 days to fix, automatic cancellation

---

## 🔧 Required IAM Permissions

### Portal Session Lambda
```json
{
  "DynamoDB": ["GetItem", "Query"],
  "CloudWatch": ["CreateLogGroup", "CreateLogStream", "PutLogEvents"]
}
```

### Webhook Lambda
```json
{
  "DynamoDB": ["GetItem", "Query", "UpdateItem"],
  "SES": ["SendEmail", "SendRawEmail"],
  "CloudWatch": ["CreateLogGroup", "CreateLogStream", "PutLogEvents"]
}
```

---

## 🧪 Testing Commands

### Test Portal Creation
```bash
curl -X POST https://your-api-url/staging/MesobFinancialSystem/create-portal-session \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

### Test Webhooks (Stripe CLI)
```bash
# Listen to webhooks
stripe listen --forward-to https://your-api-url/staging/MesobFinancialSystem/stripe-webhook

# Trigger events
stripe trigger invoice.payment_failed
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.updated
```

---

## 📝 Deployment Checklist

### Staging
- [ ] Deploy portal session Lambda
- [ ] Deploy webhook Lambda
- [ ] Add API Gateway routes
- [ ] Configure Stripe test webhooks
- [ ] Test portal creation
- [ ] Test payment method update
- [ ] Verify webhook events
- [ ] Check email delivery

### Production
- [ ] Deploy portal session Lambda (production)
- [ ] Deploy webhook Lambda (production)
- [ ] Update API Gateway routes
- [ ] Configure Stripe live webhooks
- [ ] Test with real subscription
- [ ] Monitor CloudWatch logs
- [ ] Set up alerts for failures

---

## 🆘 Troubleshooting

### "Failed to create portal session"
→ Check CloudWatch logs for Lambda errors
→ Verify user has `stripeCustomerId` in database
→ Verify Stripe API key is correct

### Webhooks not working
→ Verify webhook URL is correct in Stripe dashboard
→ Check `stripe-signature` header is passed through API Gateway
→ Verify webhook secret matches

### Emails not sending
→ Verify SES email is verified
→ Check if in SES sandbox (only verified emails work)
→ Request production access for SES

---

## 📞 Support

- **Stripe Support**: https://support.stripe.com
- **AWS Support**: https://console.aws.amazon.com/support/
- **Documentation**: See `BACKEND_DEPLOYMENT_GUIDE.md` for detailed info

---

## 💰 Cost

**Monthly cost for 100 active users**:
- Lambda executions: ~$0.50
- API Gateway: ~$3.50
- SES emails: ~$0.10
- **Total**: ~$4.10/month

**Stripe fees**: No additional fees for Customer Portal or webhooks
