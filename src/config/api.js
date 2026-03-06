/**
 * Mesob Financial System – API base URL and route definitions.
 * Use API_BASE_URL + ROUTES.* (or apiUrl helper) for all backend calls.
 *
 * Environment: set REACT_APP_ENV in .env (e.g. "staging" or "production").
 * Create React App only exposes variables prefixed with REACT_APP_.
 */

/** REACT_APP_ENV is read from .env at build/start time. Fallback to "staging" if missing. */
const ENV = process.env.REACT_APP_ENV;

console.log("Current environment:", ENV);
export const API_BASE_URL =
  `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/${ENV}/MesobFinancialSystem`;

/** Staging / welcome-email (or other staging) API base URL. */
export const STAGING_API_URL =
  `https://axv5d700vg.execute-api.us-east-1.amazonaws.com/${ENV}`;

export const S3_BUCKET_NAME =
  ENV === "production" ? "app.mesobfinancial.com" : "staging.mesobfinancial.com";

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
  PRICE: "price",
  EXISTING_USER_CHECK: "existingusercheck",
  CREATE_EVENT: "createevent",
  SIGNIN: "Signin",
  SIGN_UP: "SignUp",
};

/**
 * Build full API URL from a path (path can include query string).
 * @param {string} path - Path segment, e.g. ROUTES.USERS or `${ROUTES.USERS}/${id}`
 * @returns {string} Full URL
 */
export const apiUrl = (path) =>
  `${API_BASE_URL}/${path.replace(/^\//, "")}`;
