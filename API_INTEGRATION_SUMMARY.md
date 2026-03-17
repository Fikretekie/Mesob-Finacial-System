# API Integration Summary - Payment Method Management

## Quick Reference

### Frontend Changes Made ✅

1. **`src/config/api.js`**
   - Added `CREATE_PORTAL_SESSION: "create-portal-session"` route

2. **`src/views/UserPage.js`**
   - Implemented `handleUpdatePaymentMethod()` function
   - Added loading state to "Update Payment Method" button
   - Calls backend API to create portal session
   - Redirects user to Stripe Customer Portal

---

## Backend API Endpoints to Deploy

### 1. Create Portal Session

**Endpoint**: `POST /MesobFinancialSystem/create-portal-session`

**Request**:
```json
{
  "userId": "c4381428-50b1-708d-cd23-f7fc99528d50"
}
```

**Response**:
```json
{
  "url": "https://billing.stripe.com/p/session/test_YWNjdF8x...",
  "sessionId": "bps_1234567890",
  "message": "Customer portal session created successfully"
}
```

**Lambda File**: `backend-lambda-portal-session.js`

---

### 2. Stripe Webhook Handler

**Endpoint**: `POST /MesobFinancialSystem/stripe-webhook`

**Headers Required**:
- `stripe-signature`: Webhook signature from Stripe

**Events Handled**:
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed (sends warning email)
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `payment_method.updated` - Payment method changed

**Lambda File**: `backend-lambda-stripe-webhook.js`

---

## User Flow: Update Payment Method

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User in Payment Management Tab                          │
│    Clicks "Update Payment Method" button                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend (UserPage.js)                                  │
│    - Shows loading spinner                                 │
│    - Calls: POST /create-portal-session                    │
│    - Body: { userId }                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend Lambda (portal-session.js)                      │
│    - Gets user from DynamoDB                               │
│    - Retrieves stripeCustomerId                            │
│    - Creates Stripe portal session                         │
│    - Returns portal URL                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend Redirects                                       │
│    window.location.href = portal.url                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Stripe Customer Portal (Stripe's Hosted Page)           │
│    - User sees their subscription details                  │
│    - User can update payment method                        │
│    - User can view invoices                                │
│    - User can cancel subscription                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. User Updates Card                                        │
│    - Enters new card details                               │
│    - Clicks "Update"                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Stripe Processes Update                                  │
│    - Validates new card                                    │
│    - Sets as default payment method                        │
│    - Sends webhook: payment_method.updated                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Backend Webhook Handler (stripe-webhook.js)             │
│    - Receives webhook event                                │
│    - Verifies signature                                    │
│    - Updates user record (optional)                        │
│    - Sends confirmation email                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. User Redirected Back                                     │
│    Returns to: /customer/profile?tab=2                     │
│    Sees updated payment method                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Payment Failure Handling

### Timeline

**Day 0** (April 17): Billing date
- Stripe attempts charge on old card
- ❌ Payment fails
- Webhook sent: `invoice.payment_failed`
- Email sent: "Update your payment method"
- User still has access ✅

**Day 3** (April 20): First retry
- Stripe automatically retries
- If succeeds: ✅ All good
- If fails: ❌ Another email sent

**Day 5** (April 22): Second retry
- Stripe automatically retries
- If succeeds: ✅ All good
- If fails: ❌ Warning email sent

**Day 7** (April 24): Final retry
- Stripe automatically retries
- If succeeds: ✅ All good
- If fails: ❌ Subscription cancelled
  - Webhook: `customer.subscription.deleted`
  - User loses access
  - Final email sent

### User Actions During This Period

User can update payment method anytime:
1. Go to Payment Management tab
2. Click "Update Payment Method"
3. Enter new card in Stripe portal
4. Next retry will use new card ✅

---

## Key Features

### ✅ Secure
- No card data touches your servers
- PCI DSS compliant automatically
- Stripe handles all security

### ✅ Automatic Retries
- Stripe handles retry logic
- Smart retry schedule (days 3, 5, 7)
- Automatic emails to user

### ✅ Grace Period
- User has 7 days to fix payment
- Access continues during retry period
- Multiple chances to update card

### ✅ User-Friendly
- Professional Stripe UI
- Mobile responsive
- Multiple languages supported
- Invoice history included

---

## Environment Variables Checklist

### Lambda: Portal Session
- [ ] `ENV` (staging/production)
- [ ] `STRIPE_SECRET_KEY_PRODUCTION`
- [ ] `STRIPE_SECRET_KEY_STAGING`
- [ ] `PRODUCTION_APP_URL`
- [ ] `STAGING_APP_URL`

### Lambda: Webhook Handler
- [ ] `ENV` (staging/production)
- [ ] `STRIPE_SECRET_KEY_PRODUCTION`
- [ ] `STRIPE_SECRET_KEY_STAGING`
- [ ] `STRIPE_WEBHOOK_SECRET_PRODUCTION`
- [ ] `STRIPE_WEBHOOK_SECRET_STAGING`
- [ ] `SES_EMAIL_SOURCE`

---

## Testing Checklist

### Staging Environment
- [ ] Deploy Lambda functions
- [ ] Add API Gateway routes
- [ ] Configure Stripe test webhooks
- [ ] Test portal session creation
- [ ] Test payment method update
- [ ] Test webhook events with Stripe CLI
- [ ] Verify emails are sent
- [ ] Test failed payment scenario

### Production Environment
- [ ] Deploy Lambda functions
- [ ] Add API Gateway routes
- [ ] Configure Stripe live webhooks
- [ ] Test with real subscription
- [ ] Monitor CloudWatch logs
- [ ] Verify email delivery

---

## Monitoring

### CloudWatch Logs
- Portal session Lambda: `/aws/lambda/mesob-create-portal-session-{env}`
- Webhook Lambda: `/aws/lambda/mesob-stripe-webhook-{env}`

### Key Metrics to Monitor
- Portal session creation success rate
- Webhook processing time
- Failed payment rate
- Email delivery rate
- Subscription cancellation rate

---

## FAQ

**Q: What if user's card expires?**
A: Stripe automatically attempts to charge. If it fails, the payment failure flow kicks in (retries + emails).

**Q: Can user update payment method mid-month?**
A: Yes! They can update anytime. The new card will be used for the next billing cycle. No immediate charge.

**Q: What if user updates card during retry period?**
A: Perfect! The next retry will use the new card and should succeed.

**Q: Do we charge the user when they update their card?**
A: No. Only the regular monthly billing cycle charges the card.

**Q: How long does portal session last?**
A: Stripe portal sessions expire after 24 hours if not used.

---

## Support Resources

- **Stripe Customer Portal Docs**: https://stripe.com/docs/billing/subscriptions/customer-portal
- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks
- **AWS Lambda Docs**: https://docs.aws.amazon.com/lambda/
- **AWS SES Docs**: https://docs.aws.amazon.com/ses/
