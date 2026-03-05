/**
 * Mesob Financial System – API base URL and route definitions.
 * Use API_BASE_URL + ROUTES.* (or apiUrl helper) for all backend calls.
 */

export const API_BASE_URL =
  `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/staging/MesobFinancialSystem`;

/** Staging / welcome-email (or other staging) API base URL. */
export const STAGING_API_URL =
  "https://axv5d700vg.execute-api.us-east-1.amazonaws.com/staging";

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
