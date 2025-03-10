export const businessTypes = {
  Trucking: {
    income: ["Freight Income", "Lease Income", "Fuel Surcharge Revenue"],
    expenses: [
      "Fuel Expense",
      "Truck Repairs and Maintenance",
      "Driver Salaries/Wages",
      "Insurance Premiums",
      "Toll Charges",
      "Loan Payment",
      "Accounts Payable",
    ],
    payables: [
      "Provider Payments (Expense) / Money Owed to Suppliers (Expense)",
      "Freight Costs (Expense)",
      "Wages (Expense)",
      "Utilities (Expense)",
      "Taxes (Expense)",
      "Rent (Expense)",
      "Insurance (Expense)",
    ],
  },
  "RIDESHARE DRIVERS/PARTNERS": {
    income: [
      "Fare from Passengers",
      "Bonuses and Incentives",
      "Uber Eats or Lyft Delivery",
    ],
    expenses: [
      "Vehicle Maintenance & Repairs",
      "Fuel",
      "Car Insurance",
      "Vehicle Depreciation",
      "Rideshare Fees",
      "Taxes",
      "Loan Payments (if applicable)",
      "Miscellaneous",
    ],
    payables: [
      "Provider Payments (Expense) / Money Owed to Suppliers (Expense)",
      "Fuel Costs (Expense)",
      "Vehicle Maintenance (Expense)",
      "Insurance (Expense)",
      "Taxes (Expense)",
      "Rent (Expense)",
      "Miscellaneous (Expense)",
    ],
  },
  "Individual/Households": {
    income: [
      "Salary/Wages",
      "Bonuses/Commissions",
      "Self-Employment/Side Hustles",
      "Investment Income",
      "Rental Income",
      "Government Assistance",
      "Pension or Retirement Funds",
      "Alimony/Child Support",
      "Other Income",
    ],
    expenses: [
      "Housing",
      "Transportation",
      "Food & Groceries",
      "Healthcare",
      "Debt Payments",
      "Savings & Investments",
      "Entertainment & Leisure",
      "Childcare & Education",
      "Insurance",
      "Taxes",
      "Miscellaneous",
    ],
    payables: [
      "Bills (Expense)",
      "Rent (Expense)",
      "Utilities (Expense)",
      "Insurance (Expense)",
      "Taxes (Expense)",
      "Debt Payments (Expense)",
      "Miscellaneous (Expense)",
    ],
  },
  Other: {
    income: [], // Manual entry
    expenses: [], // Manual entry
    payables: [], // Manual entry
  },
};
