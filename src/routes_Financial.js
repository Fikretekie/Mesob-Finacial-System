import Financial_Dashboard from "views/Financial_Dashboard";
import MileageTracker from "views/MileageTracker";


var dash_FinancialRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "design_app",
    component: <Financial_Dashboard />,
    layout: "/financial",
  },
  {
    path: "/mileage-tracker",
    name: "Mileage Tracker",
    icon: "location_pin",
    component: <MileageTracker />,
    layout: "/financial",
  },

];
export default dash_FinancialRoutes;
