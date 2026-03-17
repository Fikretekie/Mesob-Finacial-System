/**
 * Mesob Financial System - Stripe Webhook Handler
 * 
 * This Lambda function handles Stripe webhook events for subscription management.
 * 
 * API Endpoint: POST /MesobFinancialSystem/stripe-webhook
 * 
 * Required Environment Variables:
 * - STRIPE_SECRET_KEY_PRODUCTION
 * - STRIPE_SECRET_KEY_STAGING
 * - STRIPE_WEBHOOK_SECRET_PRODUCTION
 * - STRIPE_WEBHOOK_SECRET_STAGING
 * - SES_EMAIL_SOURCE (e.g., noreply@mesobfinancial.com)
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: 'us-east-1' });

// Determine environment
const ENV = process.env.ENV || 'staging';

// Stripe configuration
const STRIPE_SECRET_KEY = ENV === 'production' 
  ? process.env.STRIPE_SECRET_KEY_PRODUCTION 
  : process.env.STRIPE_SECRET_KEY_STAGING;

const STRIPE_WEBHOOK_SECRET = ENV === 'production'
  ? process.env.STRIPE_WEBHOOK_SECRET_PRODUCTION
  : process.env.STRIPE_WEBHOOK_SECRET_STAGING;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

// DynamoDB table name
const USERS_TABLE = ENV === 'production' ? 'MesobUsers' : 'MesobUsersStaging';

// Email source
const EMAIL_SOURCE = process.env.SES_EMAIL_SOURCE || 'noreply@mesobfinancial.com';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,stripe-signature',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Get user by Stripe customer ID
 */
async function getUserByStripeCustomerId(stripeCustomerId) {
  const params = {
    TableName: USERS_TABLE,
    IndexName: 'stripeCustomerId-index', // You may need to create this GSI
    KeyConditionExpression: 'stripeCustomerId = :customerId',
    ExpressionAttributeValues: {
      ':customerId': stripeCustomerId
    }
  };
  
  const result = await dynamoDB.query(params).promise();
  return result.Items?.[0];
}

/**
 * Update user in DynamoDB
 */
async function updateUser(userId, updates) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  Object.keys(updates).forEach((key, index) => {
    const placeholder = `#attr${index}`;
    const valuePlaceholder = `:val${index}`;
    updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
    expressionAttributeNames[placeholder] = key;
    expressionAttributeValues[valuePlaceholder] = updates[key];
  });
  
  const params = {
    TableName: USERS_TABLE,
    Key: { id: userId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  return await dynamoDB.update(params).promise();
}

/**
 * Send email notification via SES
 */
async function sendEmail({ to, subject, htmlBody, textBody }) {
  const params = {
    Source: EMAIL_SOURCE,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8'
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8'
        }
      }
    }
  };
  
  try {
    await ses.sendEmail(params).promise();
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  
  try {
    const user = await getUserByStripeCustomerId(invoice.customer);
    
    if (user) {
      // Update user payment status
      await updateUser(user.id, {
        isPaid: true,
        subscription: true,
        paymentFailed: false,
        lastPaymentDate: new Date().toISOString()
      });
      
      // Send success email
      await sendEmail({
        to: invoice.customer_email,
        subject: 'Payment Successful - Mesob Financial',
        htmlBody: `
          <h2>Payment Received</h2>
          <p>Thank you for your payment of $${(invoice.amount_paid / 100).toFixed(2)}.</p>
          <p>Your subscription is active and will renew on ${new Date(invoice.period_end * 1000).toLocaleDateString()}.</p>
          <p><a href="${invoice.hosted_invoice_url}">View Invoice</a></p>
        `,
        textBody: `Payment Received\n\nThank you for your payment of $${(invoice.amount_paid / 100).toFixed(2)}.\nYour subscription is active.`
      });
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  
  try {
    const user = await getUserByStripeCustomerId(invoice.customer);
    
    if (user) {
      // Update user payment status
      await updateUser(user.id, {
        paymentFailed: true,
        lastFailedPaymentDate: new Date().toISOString(),
        failedPaymentAttempts: (user.failedPaymentAttempts || 0) + 1
      });
      
      // Send failure notification email
      await sendEmail({
        to: invoice.customer_email,
        subject: '⚠️ Payment Failed - Action Required',
        htmlBody: `
          <h2 style="color: #e53e3e;">Payment Failed</h2>
          <p>We were unable to process your payment of $${(invoice.amount_due / 100).toFixed(2)} for your Mesob Financial subscription.</p>
          
          <h3>What happens next?</h3>
          <p>Stripe will automatically retry your payment:</p>
          <ul>
            <li>First retry: 3 days from now</li>
            <li>Second retry: 5 days from now</li>
            <li>Third retry: 7 days from now</li>
          </ul>
          
          <p style="color: #e53e3e; font-weight: bold;">
            If all payment attempts fail, your subscription will be cancelled and you'll lose access to your account.
          </p>
          
          <h3>Action Required</h3>
          <p>Please update your payment method immediately to avoid service interruption:</p>
          <p><a href="${APP_URL}/customer/profile?tab=2" style="background-color: #3d83f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Update Payment Method</a></p>
          
          <p style="margin-top: 20px; color: #666;">
            If you have questions, please contact us at support@mesobfinancial.com
          </p>
        `,
        textBody: `Payment Failed - Action Required\n\nWe were unable to process your payment of $${(invoice.amount_due / 100).toFixed(2)}.\n\nPlease update your payment method at: ${APP_URL}/customer/profile?tab=2\n\nStripe will retry automatically, but after 4 failed attempts your subscription will be cancelled.`
      });
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  try {
    const user = await getUserByStripeCustomerId(subscription.customer);
    
    if (user) {
      // Update user subscription status
      await updateUser(user.id, {
        subscription: subscription.status === 'active',
        subscriptionStatus: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      });
      
      // If subscription is set to cancel at period end, send notification
      if (subscription.cancel_at_period_end) {
        await sendEmail({
          to: user.email,
          subject: 'Subscription Cancellation Confirmed',
          htmlBody: `
            <h2>Subscription Cancellation</h2>
            <p>Your subscription has been scheduled for cancellation.</p>
            <p>You'll continue to have access until <strong>${new Date(subscription.current_period_end * 1000).toLocaleDateString()}</strong>.</p>
            <p>Changed your mind? You can reactivate your subscription anytime before this date.</p>
            <p><a href="${APP_URL}/customer/profile?tab=2">Manage Subscription</a></p>
          `,
          textBody: `Your subscription will end on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}.`
        });
      }
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  try {
    const user = await getUserByStripeCustomerId(subscription.customer);
    
    if (user) {
      // Update user subscription status
      await updateUser(user.id, {
        subscription: false,
        subscriptionStatus: 'cancelled',
        subscriptionId: null,
        cancelledAt: new Date().toISOString()
      });
      
      // Send cancellation confirmation email
      await sendEmail({
        to: user.email,
        subject: 'Subscription Cancelled - Mesob Financial',
        htmlBody: `
          <h2>Subscription Cancelled</h2>
          <p>Your subscription has been cancelled and is no longer active.</p>
          <p>We're sorry to see you go! If you'd like to resubscribe in the future, you can do so anytime.</p>
          <p><a href="${APP_URL}/customer/subscription">Resubscribe</a></p>
          <p>Thank you for using Mesob Financial!</p>
        `,
        textBody: 'Your subscription has been cancelled. You can resubscribe anytime at mesobfinancial.com'
      });
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

/**
 * Handle payment_method.updated event
 */
async function handlePaymentMethodUpdated(paymentMethod) {
  console.log('Payment method updated:', paymentMethod.id);
  
  try {
    const user = await getUserByStripeCustomerId(paymentMethod.customer);
    
    if (user) {
      // Send confirmation email
      await sendEmail({
        to: user.email,
        subject: 'Payment Method Updated',
        htmlBody: `
          <h2>Payment Method Updated</h2>
          <p>Your payment method has been successfully updated.</p>
          <p>Your next payment will be processed using the new payment method.</p>
          <p>If you didn't make this change, please contact us immediately at support@mesobfinancial.com</p>
        `,
        textBody: 'Your payment method has been updated successfully.'
      });
    }
  } catch (error) {
    console.error('Error handling payment method updated:', error);
  }
}

/**
 * Main webhook handler
 */
async function handleStripeWebhook(event, headers) {
  try {
    const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    
    if (!signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing stripe-signature header' })
      };
    }
    
    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` })
      };
    }
    
    console.log('Webhook event type:', stripeEvent.type);
    
    // Handle different event types
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      
      case 'payment_method.updated':
        await handlePaymentMethodUpdated(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true, eventType: stripeEvent.type })
    };
    
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Webhook event received');
  
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  
  // Handle OPTIONS for CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }
  
  if (method === 'POST') {
    return await handleStripeWebhook(event, headers);
  }
  
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
