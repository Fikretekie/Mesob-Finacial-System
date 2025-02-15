import Dashboard from "views/Dashboard.js";
import Users from "views/Users.js";
import OrderDetails from "views/OrderDetails";
import EditOrder from "views/EditOrder";
import MesobFinancial2 from "views/mesobfinancial2";
import Receipts from "views/Receipts";
import UserPage from "views/UserPage";
import CSVReports from "views/CSVReports";
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
    path: "/order/details/:id",
    name: "Order Details",
    component: <OrderDetails />,
    layout: "/admin",
    invisible: true,
  },
  {
    path: "/order/edit/:id",
    name: "Edit Order",
    component: <EditOrder />,
    layout: "/admin",
    invisible: true,
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
    path: "/order/details/:id",
    name: "Order Details",
    component: <OrderDetails />,
    layout: "/customer",
    invisible: true,
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
];

export { adminRoutes, customerRoutes };
export default adminRoutes;
