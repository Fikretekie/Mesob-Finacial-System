/**
 * Mesob Financial System – API base URL and route definitions.
 * Use API_BASE_URL + ROUTES.* (or apiUrl helper) for all backend calls.
 *
 * Env is set at BUILD time (e.g. in GitHub Actions via .env from secrets).
 * No .env on S3 – values are baked into the JS bundle when you run npm run build.
 * Fallback: when env missing, derive from hostname so deployed app still works.
 */

function getEnv() {
  // Prefer hostname on known deployment hosts so login always uses the correct Cognito pool
  if (typeof window !== "undefined" && window.location?.hostname) {
    const h = window.location.hostname;
    if (h === "app.mesobfinancial.com") return "production";
    if (h === "staging.mesobfinancial.com") return "staging";
  }
  const raw = process.env.REACT_APP_ENV;
  if (raw) return String(raw).toLowerCase().trim();
  return process.env.NODE_ENV === "production" ? "production" : "staging";
}

const ENV = getEnv();
export { getEnv };
export const CURRENT_ENV = ENV; // "staging" | "production" for logging

/** Cognito domain for current ENV (for OAuth userInfo URL). */
const COGNITO_DOMAIN =
  ENV === "production"
    ? (process.env.REACT_APP_PRODUCTION_COGNITO_DOMAIN || "us-east-1avaiojcoe.auth.us-east-1.amazoncognito.com")
    : (process.env.REACT_APP_STAGING_COGNITO_DOMAIN || "");
export const COGNITO_USERINFO_URL = COGNITO_DOMAIN
  ? `https://${COGNITO_DOMAIN}/oauth2/userInfo`
  : "";

export const API_BASE_URL =
  `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/${ENV}/MesobFinancialSystem`;

/** Staging / welcome-email (or other staging) API base URL. */
export const STAGING_API_URL =
  `https://axv5d700vg.execute-api.us-east-1.amazonaws.com/${ENV}`;

export const S3_BUCKET_NAME =
  ENV === "production" ? "app.mesobfinancial.com" : "staging.mesobfinancial.com";

/** Base URL for backups/CSV (production: app.mesobfinancial.com, staging: staging.mesobfinancial.com). */
export const BACKUP_BASE_URL = `https://${S3_BUCKET_NAME}`;

/**
 * Normalize S3 receipt URL from virtual-hosted to path-style so it works for preview/download.
 * Handles both app (production) and staging buckets.
 * @param {string} rawUrl - Receipt URL (e.g. https://bucket.s3.amazonaws.com/key)
 * @returns {string} Path-style URL (e.g. https://s3.amazonaws.com/bucket/key)
 */
export function normalizeReceiptUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
  return rawUrl
    .replace(
      "app.mesobfinancial.com.s3.amazonaws.com",
      "s3.amazonaws.com/app.mesobfinancial.com"
    )
    .replace(
      "s3.amazonaws.com/staging.mesobfinancial.com",   // finds broken/old URL
      "staging.mesobfinancial.com.s3.amazonaws.com"    // replaces with correct URL
    )
}

/** Route path segments (no leading slash; append to API_BASE_URL). */
export const ROUTES = {
  USERS: "Users",
  TRANSACTION: "Transaction",
  RECEIPT: "Receipt",
  BACKUP: "backup",
  SUBSCRIPTION: "Subscription",
  /** PayPal subscription cancel / lifecycle (API Gateway resource name). */
  PAYPAL_SUBSCRIPTION: "PaypalSubscription",
  /** Stripe Billing Portal session (update card / Apple Pay / Google Pay, etc.). */
  CREATE_PORTAL_SESSION: "Subscription/PortalSession",
  PRICE: "price",
  EXISTING_USER_CHECK: "existingusercheck",
  CREATE_EVENT: "createevent",
  SIGNIN: "Signin",
  SIGN_UP: "SignUp",
  /** Documents stored in S3 under Document/ prefix. List, upload, get URL. */
  DOCUMENT: "Document",
};

/**
 * Build full API URL from a path (path can include query string).
 * @param {string} path - Path segment, e.g. ROUTES.USERS or `${ROUTES.USERS}/${id}`
 * @returns {string} Full URL
 */
export const apiUrl = (path) =>
  `${API_BASE_URL}/${path.replace(/^\//, "")}`;
