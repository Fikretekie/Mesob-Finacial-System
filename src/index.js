import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Amplify } from "aws-amplify";
import userReducer from "./store/userSlice";

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
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_laMPlcB1N",
      userPoolClientId: "ulrla7en4ocu2gfbh9i536fnk",
      loginWith: {
        oauth: {
          domain: "us-east-1lamplcb1n.auth.us-east-1.amazoncognito.com",
          scopes: ["email", "profile", "openid"],
          redirectSignIn: ["http://localhost:3000/"],
          redirectSignOut: ["http://localhost:3000/"],
          responseType: "code",
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/mesonfinancelogin" element={<MesobFinanceLogin />} />
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
        {/* Redirect any unknown routes to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
