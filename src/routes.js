import Dashboard from "views/Dashboard.js";
import Users from "views/Users.js";

import Receipts from "views/Receipts";
import UserPage from "views/UserPage";
import CSVReports from "views/CSVReports";
import AdminSubscriptions from "views/Payment/AdminSubscriptions";
import SubscriptionPlans from "views/Payment/SubscriptionPlans";
import MesobFinancial2 from "views/mesobfinancial2";

const userRole = parseInt(localStorage.getItem("role"));
console.log("userRole---=>>>", userRole);

const adminRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "design_app",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/users",
    name: "Users",
    icon: "users_single-02",
    component: <Users />,
    layout: "/admin",
  },
  
  
  {
    path: "/MesobFinancial2",
    name: "Financial Report",
    icon: "business_money-coins",
    component: <MesobFinancial2 />,
    layout: "/admin",
  },
  {
    path: "/profile",
    name: "User Profile",
    icon: "users_single-02",
    component: <UserPage />,
    layout: "/admin",
  },
  {
    path: "/receipts",
    name: "Receipts",
    icon: "files_paper",
    component: <Receipts />,
    layout: "/admin",
  },
  {
    path: "/subscriptions",
    name: "Subscriptions",
    icon: "business_money-coins",
    component: <AdminSubscriptions />,
    layout: "/admin",
  },
];

const customerRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "design_app",
    component: <Dashboard />,
    layout: "/customer",
  },
  {
    path: "/financial-report",
    name: "Financial Report",
    icon: "business_money-coins",
    component: <MesobFinancial2 />,
    layout: "/customer",
  },
  
  {
    path: "/receipts",
    name: "Receipts",
    icon: "files_paper",
    component: <Receipts />,
    layout: "/customer",
  },
  {
    path: "/profile",
    name: "User Profile",
    icon: "users_single-02",
    component: <UserPage />,
    layout: "/customer",
  },
  {
    path: "/csv",
    name: "Backup CSV",
    icon: "files_single-copy-04",
    component: <CSVReports />,
    layout: "/customer",
  },
  ...(userRole !== 1
    ? [
        {
          path: "/subscription",
          name: "Subscribe",
          icon: "business_money-coins",
          component: <SubscriptionPlans />,
          layout: "/customer",
          invisible: userRole === 1,
        },
      ]
    : []),
];

export { adminRoutes, customerRoutes };
export default adminRoutes;
