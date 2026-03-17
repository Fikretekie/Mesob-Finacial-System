/**
 * Mesob Financial System - Stripe Customer Portal Session Handler
 * 
 * This Lambda function creates a Stripe Customer Portal session
 * allowing users to manage their payment methods, view invoices, and cancel subscriptions.
 * 
 * API Endpoint: POST /MesobFinancialSystem/create-portal-session
 * 
 * Required Environment Variables:
 * - STRIPE_SECRET_KEY_PRODUCTION
 * - STRIPE_SECRET_KEY_STAGING
 * - PRODUCTION_APP_URL (e.g., https://app.mesobfinancial.com)
 * - STAGING_APP_URL (e.g., https://staging.mesobfinancial.com)
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Determine environment from Lambda function name or environment variable
const ENV = process.env.ENV || 'staging'; // 'staging' or 'production'

// Stripe configuration
const STRIPE_SECRET_KEY = ENV === 'production' 
  ? process.env.STRIPE_SECRET_KEY_PRODUCTION 
  : process.env.STRIPE_SECRET_KEY_STAGING;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

// App URLs for return after portal session
const APP_URL = ENV === 'production'
  ? process.env.PRODUCTION_APP_URL || 'https://app.mesobfinancial.com'
  : process.env.STAGING_APP_URL || 'https://staging.mesobfinancial.com';

// DynamoDB table name
const USERS_TABLE = ENV === 'production' ? 'MesobUsers' : 'MesobUsersStaging';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Get user from DynamoDB by userId
 */
async function getUserFromDB(userId) {
  const params = {
    TableName: USERS_TABLE,
    Key: { id: userId }
  };
  
  const result = await dynamoDB.get(params).promise();
  return result.Item;
}

/**
 * Create Stripe Customer Portal Session
 * 
 * The Customer Portal allows users to:
 * - Update payment methods
 * - View billing history and invoices
 * - Cancel subscription
 * - Download receipts
 */
async function createCustomerPortalSession(event, headers) {
  try {
    console.log('Creating customer portal session...');
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { userId } = body;
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'userId is required',
          message: 'Please provide a valid userId'
        })
      };
    }
    
    // Get user from database
    const user = await getUserFromDB(userId);
    
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'User not found',
          message: 'No user found with the provided userId'
        })
      };
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'No Stripe customer found',
          message: 'User does not have a Stripe customer ID. Please contact support.'
        })
      };
    }
    
    console.log(`Creating portal session for customer: ${user.stripeCustomerId}`);
    
    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/customer/profile?tab=2`, // Return to Payment Management tab
    });
    
    console.log(`Portal session created: ${session.id}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id,
        message: 'Customer portal session created successfully'
      })
    };
    
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Failed to create customer portal session',
        details: ENV === 'staging' ? error.stack : undefined
      })
    };
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const routeKey = `${method} ${path}`;
  
  console.log(`Route: ${routeKey}`);
  
  // Handle OPTIONS for CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }
  
  // Route to appropriate handler
  switch (routeKey) {
    case 'POST /MesobFinancialSystem/create-portal-session':
      return await createCustomerPortalSession(event, headers);
    
    default:
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Not Found',
          message: `Route ${routeKey} not found`,
          availableRoutes: [
            'POST /MesobFinancialSystem/create-portal-session'
          ]
        })
      };
  }
};
