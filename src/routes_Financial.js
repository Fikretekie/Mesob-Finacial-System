import Financial_Dashboard from "views/Financial_Dashboard";


var dash_FinancialRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "design_app",
    component: <Financial_Dashboard />,
    layout: "/financial",
  },

];
export default dash_FinancialRoutes;
