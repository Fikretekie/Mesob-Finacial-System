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
// Create Redux store
const store = configureStore({
  reducer: {
    selectedUser: userReducer,
  },
});

const SubscriptionWithParams = () => {
  const location = useLocation();
  const priceId = location.state?.priceId || "";
  return <SubscriptionPage priceId={priceId} />;
};

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const redirectUri = isLocal
  ? "http://localhost:3000"
  : "https://app.mesobfinancial.com";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_avAIOjCOE",
      userPoolClientId: "6iejj0l52i4qihmmojh88kmvie",
      loginWith: {
        oauth: {
          region: "us-east-1",
          domain: "us-east-1avaiojcoe.auth.us-east-1.amazoncognito.com",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [
            "https://app.mesobfinancial.com/oauth-redirect",
            "http://localhost:3000/oauth-redirect",
          ],
          redirectSignOut: ["https://app.mesobfinancial.com"],
          responseType: "code",
          providers: [
            {
              provider: "Google",
              scopes: ["openid", "email", "profile"],
              clientId:
                "263314305713-jam63sp7k0r9g7n58v0c986ekh8fv689.apps.googleusercontent.com",
            },
            {
              provider: "SignInWithApple",
              clientId: "com.mesob.financial",
            },
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
        <Route path="/subscribe" element={<SubscriptionWithParams />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        {/* Redirect any unknown routes to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
