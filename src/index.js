import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Amplify } from "aws-amplify";
import userReducer from "./store/userSlice";
import currencyReducer, { setCurrency } from "./store/currencySlice";
import { getUserCurrencyFromIP } from "./utils/currencyUtils";

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/now-ui-dashboard.scss?v1.5.0";
import "assets/css/demo.css";

import AdminLayout from "layouts/Admin.js";
import FinancialLayout from "layouts/financial.js";
import Login from "../src/views/Login";
import MesobFinanceLogin from "views/MesobFinanceLogin";
import SignupPage from "./views/Signup";
import CustomerLayout from "layouts/Customer";
import ForgotPassword from "views/ForgotPassword";
import SubscriptionPlans from "views/Payment/SubscriptionPlans";
import SubscriptionPage from "views/Payment/Subscription";
import Confirm from "views/Confirm";
import OAuthListener from "components/OAuthListener";
import TermsOfUse from "views/Terms";
import CompleteProfile from "views/CompleteProfile";
import "./i18n";
import { getEnv } from "./config/api";

// Create Redux store
const store = configureStore({
  reducer: {
    selectedUser: userReducer,
  },
});

// ENV from getEnv() so deployed app works: hostname fallback when REACT_APP_ENV not in build
const ENV = getEnv();
const isProduction = ENV === "production";

const cognitoUserPoolId = isProduction
  ? (process.env.REACT_APP_PRODUCTION_COGNITO_USER_POOL_ID || "us-east-1_avAIOjCOE")
  : (process.env.REACT_APP_STAGING_COGNITO_USER_POOL_ID || "us-east-1_VpNtAU2i3");
const cognitoClientId = isProduction
  ? (process.env.REACT_APP_PRODUCTION_COGNITO_CLIENT_ID || "6iejj0l52i4qihmmojh88kmvie")
  : process.env.REACT_APP_STAGING_COGNITO_CLIENT_ID;
const cognitoDomain = isProduction
  ? (process.env.REACT_APP_PRODUCTION_COGNITO_DOMAIN || "us-east-1avaiojcoe.auth.us-east-1.amazoncognito.com")
  : process.env.REACT_APP_STAGING_COGNITO_DOMAIN;

const appOrigin = isProduction ? "https://app.mesobfinancial.com" : "https://staging.mesobfinancial.com";
const googleClientId = isProduction
  ? (process.env.REACT_APP_PRODUCTION_GOOGLE_CLIENT_ID || "263314305713-jam63sp7k0r9g7n58v0c986ekh8fv689.apps.googleusercontent.com")
  : (process.env.REACT_APP_STAGING_GOOGLE_CLIENT_ID || "263314305713-9b0q8c6f2h3s1u7l1g5l7h5m3v0n5l.apps.googleusercontent.com");

if (typeof window !== "undefined") {
  console.log("[Auth] Config:", {
    ENV,
    isProduction,
    hostname: window.location?.hostname,
    cognitoUserPoolId,
    cognitoClientId: cognitoClientId ? `${cognitoClientId.slice(0, 8)}...` : "MISSING",
    cognitoDomain: cognitoDomain || "MISSING",
    appOrigin,
  });
  if (!isProduction && (!cognitoClientId || !cognitoDomain)) {
    console.warn("[Auth] Staging Cognito needs REACT_APP_STAGING_COGNITO_CLIENT_ID and REACT_APP_STAGING_COGNITO_DOMAIN in .env (restart dev server after adding).");
  }
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoUserPoolId,
      userPoolClientId: cognitoClientId,
      loginWith: {
        oauth: {
          region: "us-east-1",
          domain: cognitoDomain,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [`${appOrigin}/oauth-redirect`, "http://localhost:3000/oauth-redirect"],
          redirectSignOut: [appOrigin, "http://localhost:3000"],
          responseType: "code",
          providers: [
            { provider: "Google", scopes: ["openid", "email", "profile"], clientId: googleClientId },
            { provider: "SignInWithApple", clientId: isProduction ? "com.mesob.financial" : "com.mesob.financial.staging" },
          ],
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        {/* Route for the Login page */}
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-redirect" element={<OAuthListener />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/mesonfinancelogin" element={<MesobFinanceLogin />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* New Confirm route */}
        <Route path="/confirm" element={<Confirm />} />
        {/* Admin routes */}
        <Route path="/financial/*" element={<FinancialLayout />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/customer/*" element={<CustomerLayout />} />
        {/* Subscription Routes */}
        <Route path="/subscription" element={<SubscriptionPlans />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        {/* Redirect any unknown routes to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
