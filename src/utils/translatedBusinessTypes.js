import i18n from '../i18n';

/**
 * Get translated business type purposes
 * @param {string} businessType - The business type key (e.g., "Trucking", "Cafe")
 * @returns {Object} - Object with income, expenses, and payables arrays
 */
export const getTranslatedBusinessPurposes = (businessType) => {
  const t = i18n.t.bind(i18n);
  
  const businessTypeMapping = {
    "Trucking": {
      income: [
        t('businessTypes.income.freightIncome'),
        t('businessTypes.income.leaseIncome'),
        t('businessTypes.income.fuelSurcharge')
      ],
      expenses: [
        t('businessTypes.expenses.fuel'),
        t('businessTypes.expenses.truckRepairs'),
        t('businessTypes.expenses.driverSalaries'),
        t('businessTypes.expenses.insurance'),
        t('businessTypes.expenses.tollCharges'),
        t('businessTypes.expenses.loanPayment'),
        t('businessTypes.expenses.accountsPayable')
      ],
      payables: [
        t('businessTypes.payables.providerPayments'),
        t('businessTypes.payables.freightCosts'),
        t('businessTypes.payables.wages'),
        t('businessTypes.payables.utilitiesExpense'),
        t('businessTypes.payables.taxesExpense'),
        t('businessTypes.payables.rentExpense'),
        t('businessTypes.payables.insuranceExpense')
      ]
    },
    "RIDESHARE DRIVERS/PARTNERS": {
      income: [
        t('businessTypes.income.farePassengers'),
        t('businessTypes.income.bonuses'),
        t('businessTypes.income.delivery')
      ],
      expenses: [
        t('businessTypes.expenses.vehicleMaintenance'),
        t('businessTypes.expenses.fuel'),
        t('businessTypes.expenses.carInsurance'),
        t('businessTypes.expenses.vehicleDepreciation'),
        t('businessTypes.expenses.rideshareFees'),
        t('businessTypes.expenses.taxes'),
        t('businessTypes.expenses.loanPayments'),
        t('businessTypes.expenses.miscellaneous')
      ],
      payables: [
        t('businessTypes.payables.providerPayments'),
        t('businessTypes.payables.fuelCosts'),
        t('businessTypes.payables.vehicleMaintenanceExpense'),
        t('businessTypes.payables.insuranceExpense'),
        t('businessTypes.payables.oilChanges'),
        t('businessTypes.payables.taxesExpense'),
        t('businessTypes.payables.rentExpense'),
        t('businessTypes.payables.miscExpense')
      ]
    },
    "Individual/Households": {
      income: [
        t('businessTypes.income.salary'),
        t('businessTypes.income.commission'),
        t('businessTypes.income.selfEmployment'),
        t('businessTypes.income.investment'),
        t('businessTypes.income.rental'),
        t('businessTypes.income.government'),
        t('businessTypes.income.pension'),
        t('businessTypes.income.alimony'),
        t('businessTypes.income.otherIncome')
      ],
      expenses: [
        t('businessTypes.expenses.housing'),
        t('businessTypes.expenses.transportation'),
        t('businessTypes.expenses.foodGroceries'),
        t('businessTypes.expenses.healthcare'),
        t('businessTypes.expenses.debtPayments'),
        t('businessTypes.expenses.savingsInvestments'),
        t('businessTypes.expenses.entertainment'),
        t('businessTypes.expenses.childcare'),
        t('businessTypes.expenses.insurance'),
        t('businessTypes.expenses.taxes'),
        t('businessTypes.expenses.miscellaneous')
      ],
      payables: [
        t('businessTypes.payables.bills'),
        t('businessTypes.payables.rentExpense'),
        t('businessTypes.payables.utilitiesExpense'),
        t('businessTypes.payables.insuranceExpense'),
        t('businessTypes.payables.taxesExpense'),
        t('businessTypes.payables.miscExpense')
      ]
    },
    "Groceries": {
      income: [
        t('businessTypes.income.grossSales'),
        t('businessTypes.income.deliveryFees'),
        t('businessTypes.income.rental'),
        t('businessTypes.income.serviceFees')
      ],
      expenses: [
        t('businessTypes.expenses.cogs'),
        t('businessTypes.expenses.laborCosts'),
        t('businessTypes.expenses.rentLease'),
        t('businessTypes.expenses.utilities'),
        t('businessTypes.expenses.insurance'),
        t('businessTypes.expenses.marketingAdvertising'),
        t('businessTypes.expenses.supplies'),
        t('businessTypes.expenses.maintenanceRepairs'),
        t('businessTypes.expenses.licensingPermits'),
        t('businessTypes.expenses.shippingDelivery'),
        t('businessTypes.expenses.depreciation'),
        t('businessTypes.expenses.bankFees'),
        t('businessTypes.expenses.professionalServices'),
        t('businessTypes.expenses.miscellaneous')
      ],
      payables: [
        t('businessTypes.payables.providerPayments'),
        t('businessTypes.payables.inventoryPurchases'),
        t('businessTypes.payables.inventoryAdjustments'),
        t('businessTypes.payables.utilitiesExpense'),
        t('businessTypes.payables.insuranceExpense'),
        t('businessTypes.payables.rentExpense'),
        t('businessTypes.payables.miscExpense')
      ]
    },
    "Cafe": {
      income: [
        t('businessTypes.income.foodSales'),
        t('businessTypes.income.beverageSales'),
        t('businessTypes.income.dessertSales'),
        t('businessTypes.income.takeoutSales'),
        t('businessTypes.income.catering'),
        t('businessTypes.income.giftCards'),
        t('businessTypes.income.otherIncome')
      ],
      expenses: [
        t('businessTypes.expenses.foodCosts'),
        t('businessTypes.expenses.beverageCosts'),
        t('businessTypes.expenses.packaging'),
        t('businessTypes.expenses.preparationSupplies'),
        t('businessTypes.expenses.laborCosts'),
        t('businessTypes.expenses.rentLease'),
        t('businessTypes.expenses.utilities'),
        t('businessTypes.expenses.insurance'),
        t('businessTypes.expenses.marketingAdvertising'),
        t('businessTypes.expenses.cleaningMaintenance'),
        t('businessTypes.expenses.licensingPermits'),
        t('businessTypes.expenses.professionalServices'),
        t('businessTypes.expenses.equipmentSupplies'),
        t('businessTypes.expenses.creditCardFees'),
        t('businessTypes.expenses.deliveryCosts'),
        t('businessTypes.expenses.depreciation'),
        t('businessTypes.expenses.interest'),
        t('businessTypes.expenses.badDebt'),
        t('businessTypes.expenses.bankFees'),
        t('businessTypes.expenses.miscellaneous')
      ],
      payables: [
        t('businessTypes.payables.providerPayments'),
        t('businessTypes.payables.foodCostsExpense'),
        t('businessTypes.payables.beverageCostsExpense'),
        t('businessTypes.payables.rentExpense'),
        t('businessTypes.payables.utilitiesExpense'),
        t('businessTypes.payables.insuranceExpense'),
        t('businessTypes.payables.miscExpense')
      ]
    },
    "Cleaning Services": {
      income: [
        t('businessTypes.income.residentialCleaning'),
        t('businessTypes.income.deepCleaning'),
        t('businessTypes.income.moveInOut'),
        t('businessTypes.income.commercialCleaning'),
        t('businessTypes.income.airbnbTurnover')
      ],
      expenses: [
        t('businessTypes.expenses.cleaningSupplies'),
        t('businessTypes.expenses.employeeWages'),
        t('businessTypes.expenses.fuelTransportation'),
        t('businessTypes.expenses.uniforms'),
        t('businessTypes.expenses.advertising'),
        t('businessTypes.expenses.equipmentMaintenance'),
        t('businessTypes.expenses.liabilityInsurance')
      ],
      payables: [
        t('businessTypes.payables.suppliesExpense'),
        t('businessTypes.payables.wages'),
        t('businessTypes.payables.fuelExpense'),
        t('businessTypes.payables.insuranceExpense'),
        t('businessTypes.payables.advertisingExpense'),
        t('businessTypes.payables.uniformsExpense'),
        t('businessTypes.payables.equipmentMaintenanceExpense')
      ]
    },
    "⁠Beauty & Grooming": {
      income: [
        t('businessTypes.income.haircuts'),
        t('businessTypes.income.hairColoring'),
        t('businessTypes.income.beardTrims'),
        t('businessTypes.income.manicures'),
        t('businessTypes.income.productRetail'),
        t('businessTypes.income.specialPackages')
      ],
      expenses: [
        t('businessTypes.expenses.beautyProducts'),
        t('businessTypes.expenses.toolsEquipment'),
        t('businessTypes.expenses.rentUtilities'),
        t('businessTypes.expenses.wagesBooth'),
        t('businessTypes.expenses.salonSoftware'),
        t('businessTypes.expenses.sterilization'),
        t('businessTypes.expenses.laundry'),
        t('businessTypes.expenses.licenses')
      ],
      payables: [
        t('businessTypes.payables.productSupplies'),
        t('businessTypes.payables.rentExpense'),
        t('businessTypes.payables.utilitiesExpense'),
        t('businessTypes.payables.wages'),
        t('businessTypes.payables.softwareSubscriptionsExpense'),
        t('businessTypes.payables.licensesExpense'),
        t('businessTypes.payables.laundryCleaning')
      ]
    },
    "E-commerce Sellers": {
      income: [
        t('businessTypes.income.onlineProductSales'),
        t('businessTypes.income.bulkOrders'),
        t('businessTypes.income.customOrders'),
        t('businessTypes.income.subscriptionBoxes'),
        t('businessTypes.income.affiliateIncome'),
        t('businessTypes.income.digitalProducts')
      ],
      expenses: [
        t('businessTypes.expenses.productSourcing'),
        t('businessTypes.expenses.packagingShipping'),
        t('businessTypes.expenses.platformFees'),
        t('businessTypes.expenses.transactionFees'),
        t('businessTypes.expenses.onlineAdvertising'),
        t('businessTypes.expenses.webHosting'),
        t('businessTypes.expenses.softwareSubscriptions'),
        t('businessTypes.expenses.warehouseRental')
      ],
      payables: [
        t('businessTypes.payables.inventoryPurchases'),
        t('businessTypes.payables.shippingMaterials'),
        t('businessTypes.payables.advertisingExpense'),
        t('businessTypes.payables.softwarePlatformFees'),
        t('businessTypes.payables.warehouseRentExpense')
      ]
    },
    "Construction Trades": {
      income: [
        t('businessTypes.income.serviceCalls'),
        t('businessTypes.income.repairInstallation'),
        t('businessTypes.income.remodeling'),
        t('businessTypes.income.emergencyCalls'),
        t('businessTypes.income.subcontracting'),
        t('businessTypes.income.consulting')
      ],
      expenses: [
        t('businessTypes.expenses.constructionTools'),
        t('businessTypes.expenses.constructionMaterials'),
        t('businessTypes.expenses.subcontractorWages'),
        t('businessTypes.expenses.vehicleFuel'),
        t('businessTypes.expenses.businessInsurance'),
        t('businessTypes.expenses.permitsCosts'),
        t('businessTypes.expenses.safetyTraining')
      ],
      payables: [
        t('businessTypes.payables.toolsMaterials'),
        t('businessTypes.payables.subcontractorPayments'),
        t('businessTypes.payables.fuelExpense'),
        t('businessTypes.payables.insuranceExpense'),
        t('businessTypes.payables.permitsExpense'),
        t('businessTypes.payables.trainingCosts')
      ]
    },
    "Content Creator": {
      income: [
        t('businessTypes.income.adRevenue'),
        t('businessTypes.income.sponsorship'),
        t('businessTypes.income.affiliateCommissions'),
        t('businessTypes.income.merchandiseSales'),
        t('businessTypes.income.digitalProductSales'),
        t('businessTypes.income.clientWork'),
        t('businessTypes.income.tips')
      ],
      expenses: [
        t('businessTypes.expenses.equipmentPurchases'),
        t('businessTypes.expenses.softwareSubs'),
        t('businessTypes.expenses.internetUtilities'),
        t('businessTypes.expenses.officeRent'),
        t('businessTypes.expenses.marketingPromotion'),
        t('businessTypes.expenses.travelLodging'),
        t('businessTypes.expenses.contractors')
      ],
      payables: [
        t('businessTypes.payables.outstandingInvoices'),
        t('businessTypes.payables.scheduledPayments'),
        t('businessTypes.payables.equipmentLeases')
      ]
    },
    "Other": {
      income: [],
      expenses: [],
      payables: []
    }
  };

  return businessTypeMapping[businessType] || { income: [], expenses: [], payables: [] };
};
/** Supported languages for purpose reverse-lookup (label in any lang → key) */
const PURPOSE_LANGS = ['en', 'am', 'ti', 'ar', 'es', 'fr', 'so'];

/** Map: English purpose label → i18n key (for translating to PDF language) */
const ENGLISH_TO_PURPOSE_KEY = {
  "Freight Income": "businessTypes.income.freightIncome",
  "Lease Income": "businessTypes.income.leaseIncome",
  "Fuel Surcharge": "businessTypes.income.fuelSurcharge",
  "Fuel Expense": "businessTypes.expenses.fuel",
  "Truck Repairs and Maintenance": "businessTypes.expenses.truckRepairs",
  "Driver Salaries/Wages": "businessTypes.expenses.driverSalaries",
  "Insurance Premiums": "businessTypes.expenses.insurance",
  "Toll Charges": "businessTypes.expenses.tollCharges",
  "Loan Payment": "businessTypes.expenses.loanPayment",
  "Accounts Payable": "businessTypes.expenses.accountsPayable",
  "Fares from Passengers": "businessTypes.income.farePassengers",
  "Bonuses and Incentives": "businessTypes.income.bonuses",
  "Uber Eats or Lyft Delivery": "businessTypes.income.delivery",
  "Vehicle Maintenance and Repairs": "businessTypes.expenses.vehicleMaintenance",
  "Car Insurance": "businessTypes.expenses.carInsurance",
  "Vehicle Depreciation": "businessTypes.expenses.vehicleDepreciation",
  "Rideshare Platform Fees": "businessTypes.expenses.rideshareFees",
  "Taxes": "businessTypes.expenses.taxes",
  "Loan Payments (if applicable)": "businessTypes.expenses.loanPayments",
  "Miscellaneous": "businessTypes.expenses.miscellaneous",
  "Salary/Wages": "businessTypes.income.salary",
  "Bonuses/Commissions": "businessTypes.income.commission",
  "Self-Employment/Side Gigs": "businessTypes.income.selfEmployment",
  "Investment Income": "businessTypes.income.investment",
  "Rental Income": "businessTypes.income.rental",
  "Government Assistance": "businessTypes.income.government",
  "Pension or Retirement Funds": "businessTypes.income.pension",
  "Alimony/Child Support": "businessTypes.income.alimony",
  "Other Income": "businessTypes.income.otherIncome",
  "Housing": "businessTypes.expenses.housing",
  "Transportation": "businessTypes.expenses.transportation",
  "Food and Groceries": "businessTypes.expenses.foodGroceries",
  "Healthcare": "businessTypes.expenses.healthcare",
  "Debt Payments": "businessTypes.expenses.debtPayments",
  "Savings and Investments": "businessTypes.expenses.savingsInvestments",
  "Entertainment and Recreation": "businessTypes.expenses.entertainment",
  "Childcare and Education": "businessTypes.expenses.childcare",
  "Insurance": "businessTypes.expenses.insurance",
  "Gross Sales": "businessTypes.income.grossSales",
  "Delivery Fees": "businessTypes.income.deliveryFees",
  "Service Fees": "businessTypes.income.serviceFees",
  "Cost of Goods Sold (COGS)": "businessTypes.expenses.cogs",
  "Labor Costs": "businessTypes.expenses.laborCosts",
  "Rent/Lease": "businessTypes.expenses.rentLease",
  "Utilities": "businessTypes.expenses.utilities",
  "Marketing and Advertising": "businessTypes.expenses.marketingAdvertising",
  "Supplies": "businessTypes.expenses.supplies",
  "Maintenance and Repairs": "businessTypes.expenses.maintenanceRepairs",
  "Licensing and Permits": "businessTypes.expenses.licensingPermits",
  "Shipping and Delivery": "businessTypes.expenses.shippingDelivery",
  "Depreciation": "businessTypes.expenses.depreciation",
  "Bank Fees and Interest": "businessTypes.expenses.bankFees",
  "Professional Services": "businessTypes.expenses.professionalServices",
  "Food Sales": "businessTypes.income.foodSales",
  "Beverage Sales": "businessTypes.income.beverageSales",
  "Dessert Sales": "businessTypes.income.dessertSales",
  "Takeout Sales": "businessTypes.income.takeoutSales",
  "Catering or Event Revenue": "businessTypes.income.catering",
  "Gift Cards or Vouchers": "businessTypes.income.giftCards",
  "Food Costs": "businessTypes.expenses.foodCosts",
  "Beverage Costs": "businessTypes.expenses.beverageCosts",
  "Packaging": "businessTypes.expenses.packaging",
  "Food Preparation Supplies": "businessTypes.expenses.preparationSupplies",
  "Cleaning and Maintenance": "businessTypes.expenses.cleaningMaintenance",
  "Equipment and Supplies": "businessTypes.expenses.equipmentSupplies",
  "Credit Card Processing Fees": "businessTypes.expenses.creditCardFees",
  "Delivery Costs": "businessTypes.expenses.deliveryCosts",
  "Interest": "businessTypes.expenses.interest",
  "Bad Debt": "businessTypes.expenses.badDebt",
  "Recurring Residential Cleaning Contracts": "businessTypes.income.residentialCleaning",
  "One-Time Deep Cleaning Services": "businessTypes.income.deepCleaning",
  "Move-In/Move-Out Cleaning": "businessTypes.income.moveInOut",
  "Commercial Office Cleaning Contracts": "businessTypes.income.commercialCleaning",
  "Airbnb Turnover Services": "businessTypes.income.airbnbTurnover",
  "Cleaning Supplies (detergents, disinfectants, vacuums)": "businessTypes.expenses.cleaningSupplies",
  "Employee Wages": "businessTypes.expenses.employeeWages",
  "Fuel and Transportation": "businessTypes.expenses.fuelTransportation",
  "Uniforms": "businessTypes.expenses.uniforms",
  "Advertising (flyers, Google/local ads)": "businessTypes.expenses.advertising",
  "Equipment Maintenance and Replacements": "businessTypes.expenses.equipmentMaintenance",
  "Liability Insurance": "businessTypes.expenses.liabilityInsurance",
  "Haircuts and Styling": "businessTypes.income.haircuts",
  "Hair Coloring and Treatments": "businessTypes.income.hairColoring",
  "Beard Trims and Shaves": "businessTypes.income.beardTrims",
  "Manicures and Pedicures": "businessTypes.income.manicures",
  "Product Retail (shampoos, conditioners, gels)": "businessTypes.income.productRetail",
  "Special Packages (weddings, events)": "businessTypes.income.specialPackages",
  "Hair and Beauty Products": "businessTypes.expenses.beautyProducts",
  "Tools and Equipment (clippers, scissors, dryers)": "businessTypes.expenses.toolsEquipment",
  "Rent and Utilities": "businessTypes.expenses.rentUtilities",
  "Employee Wages or Booth Rent": "businessTypes.expenses.wagesBooth",
  "Salon Software (scheduling, POS)": "businessTypes.expenses.salonSoftware",
  "Sterilization Supplies (barbicide, gloves)": "businessTypes.expenses.sterilization",
  "Towel and Laundry Service": "businessTypes.expenses.laundry",
  "Business Licenses and Inspections": "businessTypes.expenses.licenses",
  "Online Product Sales": "businessTypes.income.onlineProductSales",
  "Bulk/Wholesale Orders": "businessTypes.income.bulkOrders",
  "Custom Orders": "businessTypes.income.customOrders",
  "Subscription Boxes": "businessTypes.income.subscriptionBoxes",
  "Affiliate Income": "businessTypes.income.affiliateIncome",
  "Digital Product Sales (e-books, downloads)": "businessTypes.income.digitalProducts",
  "Product Sourcing and Inventory": "businessTypes.expenses.productSourcing",
  "Packaging and Shipping Materials": "businessTypes.expenses.packagingShipping",
  "Platform Fees (Shopify, Amazon seller fees)": "businessTypes.expenses.platformFees",
  "Payment Transaction Fees": "businessTypes.expenses.transactionFees",
  "Online Advertising (Meta, Google, SEO)": "businessTypes.expenses.onlineAdvertising",
  "Web Hosting/Domain": "businessTypes.expenses.webHosting",
  "Software Subscriptions (Canva, QuickBooks)": "businessTypes.expenses.softwareSubscriptions",
  "Warehouse or Storage Rental": "businessTypes.expenses.warehouseRental",
  "Service Calls and Labor Charges": "businessTypes.income.serviceCalls",
  "Repair and Installation Jobs": "businessTypes.income.repairInstallation",
  "Home Improvement and Remodeling Contracts": "businessTypes.income.remodeling",
  "Emergency Calls": "businessTypes.income.emergencyCalls",
  "Subcontracting Projects": "businessTypes.income.subcontracting",
  "Consulting and Design Services": "businessTypes.income.consulting",
  "Tools and Equipment (drills, ladders, PPE)": "businessTypes.expenses.constructionTools",
  "Materials (pipes, wires, paint)": "businessTypes.expenses.constructionMaterials",
  "Subcontractor Wages": "businessTypes.expenses.subcontractorWages",
  "Vehicle Fuel and Maintenance": "businessTypes.expenses.vehicleFuel",
  "Business and Liability Insurance": "businessTypes.expenses.businessInsurance",
  "Permits and Licensing Costs": "businessTypes.expenses.permitsCosts",
  "Workplace Safety Training": "businessTypes.expenses.safetyTraining",
  "Ad Revenue (YouTube, Facebook, etc.)": "businessTypes.income.adRevenue",
  "Sponsorship Deals": "businessTypes.income.sponsorship",
  "Affiliate Commissions": "businessTypes.income.affiliateCommissions",
  "Merchandise Sales": "businessTypes.income.merchandiseSales",
  "Digital Product Sales (e.g., presets, courses)": "businessTypes.income.digitalProductSales",
  "Client Work (if freelancing)": "businessTypes.income.clientWork",
  "Tips or Donations (e.g., Patreon, Ko-fi)": "businessTypes.income.tips",
  "Equipment Purchases or Rentals (cameras, microphones, lights)": "businessTypes.expenses.equipmentPurchases",
  "Software Subscriptions (editing tools, cloud storage)": "businessTypes.expenses.softwareSubs",
  "Internet and Utilities": "businessTypes.expenses.internetUtilities",
  "Office or Studio Rent": "businessTypes.expenses.officeRent",
  "Marketing and Promotion": "businessTypes.expenses.marketingPromotion",
  "Travel and Lodging (for content shoots)": "businessTypes.expenses.travelLodging",
  "Contractors or Freelancers (editors, voice actors, designers)": "businessTypes.expenses.contractors",
  "Supplier Payments (Expense) / Owed to Suppliers (Expense)": "businessTypes.payables.providerPayments",
  "Freight Costs (Expense)": "businessTypes.payables.freightCosts",
  "Wages (Expense)": "businessTypes.payables.wages",
  "Utilities (Expense)": "businessTypes.payables.utilitiesExpense",
  "Taxes (Expense)": "businessTypes.payables.taxesExpense",
  "Rent (Expense)": "businessTypes.payables.rentExpense",
  "Insurance (Expense)": "businessTypes.payables.insuranceExpense",
  "Fuel Costs (Expense)": "businessTypes.payables.fuelCosts",
  "Vehicle Maintenance (Expense)": "businessTypes.payables.vehicleMaintenanceExpense",
  "Oil Changes (Expense)": "businessTypes.payables.oilChanges",
  "Miscellaneous (Expense)": "businessTypes.payables.miscExpense",
  "Bills (Expense)": "businessTypes.payables.bills",
  "Inventory Purchases (Expense)": "businessTypes.payables.inventoryPurchases",
  "Inventory Adjustments (Expense)": "businessTypes.payables.inventoryAdjustments",
  "Food Costs (Expense)": "businessTypes.payables.foodCostsExpense",
  "Beverage Costs (Expense)": "businessTypes.payables.beverageCostsExpense",
  "Supplies (Expense)": "businessTypes.payables.suppliesExpense",
  "Fuel (Expense)": "businessTypes.payables.fuelExpense",
  "Advertising (Expense)": "businessTypes.payables.advertisingExpense",
  "Uniforms (Expense)": "businessTypes.payables.uniformsExpense",
  "Equipment Maintenance (Expense)": "businessTypes.payables.equipmentMaintenanceExpense",
  "Product Supplies (Expense)": "businessTypes.payables.productSupplies",
  "Software Subscriptions (Expense)": "businessTypes.payables.softwareSubscriptionsExpense",
  "Licenses (Expense)": "businessTypes.payables.licensesExpense",
  "Laundry and Cleaning (Expense)": "businessTypes.payables.laundryCleaning",
  "Shipping Materials (Expense)": "businessTypes.payables.shippingMaterials",
  "Software/Platform Fees (Expense)": "businessTypes.payables.softwarePlatformFees",
  "Warehouse Rent (Expense)": "businessTypes.payables.warehouseRentExpense",
  "Tools and Materials (Expense)": "businessTypes.payables.toolsMaterials",
  "Subcontractor Payments (Expense)": "businessTypes.payables.subcontractorPayments",
  "Permits (Expense)": "businessTypes.payables.permitsExpense",
  "Training Costs (Expense)": "businessTypes.payables.trainingCosts",
  "Outstanding Invoices to Suppliers": "businessTypes.payables.outstandingInvoices",
  "Scheduled Payments to Freelancers or Agencies": "businessTypes.payables.scheduledPayments",
  "Equipment Leases": "businessTypes.payables.equipmentLeases",
};

/**
 * Find i18n key for a purpose label (may be stored in any language).
 * @param {string} label - Purpose/description as stored (e.g. Amharic, English)
 * @returns {string|null} - i18n key or null
 */
export const getPurposeKeyFromLabel = (label) => {
  if (!label || typeof label !== 'string') return null;
  const trimmed = label.trim();
  if (ENGLISH_TO_PURPOSE_KEY[trimmed]) return ENGLISH_TO_PURPOSE_KEY[trimmed];
  for (const key of Object.values(ENGLISH_TO_PURPOSE_KEY)) {
    for (const lng of PURPOSE_LANGS) {
      try {
        const translated = i18n.t(key, { lng, fallbackLng: 'en' });
        if (translated && String(translated).trim() === trimmed) return key;
      } catch (_) {}
    }
  }
  return null;
};

/**
 * Translate a purpose/description to a target language (e.g. PDF language).
 * If the label matches a known purpose in any language, returns translation for targetLng; otherwise returns original.
 * @param {string} purpose - Purpose as stored in DB (any language)
 * @param {string} targetLng - Target language code (e.g. 'en', 'am', 'ti')
 * @returns {string} - Translated label or original
 */
export const translatePurposeToLanguage = (purpose, targetLng) => {
  if (!purpose || !targetLng) return purpose || '';
  const key = getPurposeKeyFromLabel(purpose);
  if (!key) return purpose;
  const translated = i18n.t(key, { lng: targetLng, fallbackLng: 'en' });
  return (translated && translated !== key) ? translated : purpose;
};

/**
 * Translates a transaction purpose from English to the current language
 * @param {string} purpose - The English purpose string from database
 * @returns {string} - Translated purpose or original if no translation found
 */
export const translatePurpose = (purpose) => {
  const t = i18n.t.bind(i18n);
  
  // If purpose is already custom/manual, return as-is
  if (!purpose) return purpose;
  
  // Map of all English purposes to translation keys
  const purposeToKeyMap = {
    // Trucking - Income
    "Freight Income": t('businessTypes.income.freightIncome'),
    "Lease Income": t('businessTypes.income.leaseIncome'),
    "Fuel Surcharge": t('businessTypes.income.fuelSurcharge'),
    
    // Trucking - Expenses
    "Fuel Expense": t('businessTypes.expenses.fuel'),
    "Truck Repairs and Maintenance": t('businessTypes.expenses.truckRepairs'),
    "Driver Salaries/Wages": t('businessTypes.expenses.driverSalaries'),
    "Insurance Premiums": t('businessTypes.expenses.insurance'),
    "Toll Charges": t('businessTypes.expenses.tollCharges'),
    "Loan Payment": t('businessTypes.expenses.loanPayment'),
    "Accounts Payable": t('businessTypes.expenses.accountsPayable'),
    
    // Rideshare - Income
    "Fares from Passengers": t('businessTypes.income.farePassengers'),
    "Bonuses and Incentives": t('businessTypes.income.bonuses'),
    "Uber Eats or Lyft Delivery": t('businessTypes.income.delivery'),
    
    // Rideshare - Expenses
    "Vehicle Maintenance and Repairs": t('businessTypes.expenses.vehicleMaintenance'),
    "Car Insurance": t('businessTypes.expenses.carInsurance'),
    "Vehicle Depreciation": t('businessTypes.expenses.vehicleDepreciation'),
    "Rideshare Platform Fees": t('businessTypes.expenses.rideshareFees'),
    "Taxes": t('businessTypes.expenses.taxes'),
    "Loan Payments (if applicable)": t('businessTypes.expenses.loanPayments'),
    "Miscellaneous": t('businessTypes.expenses.miscellaneous'),
    
    // Individual/Households - Income
    "Salary/Wages": t('businessTypes.income.salary'),
    "Bonuses/Commissions": t('businessTypes.income.commission'),
    "Self-Employment/Side Gigs": t('businessTypes.income.selfEmployment'),
    "Investment Income": t('businessTypes.income.investment'),
    "Rental Income": t('businessTypes.income.rental'),
    "Government Assistance": t('businessTypes.income.government'),
    "Pension or Retirement Funds": t('businessTypes.income.pension'),
    "Alimony/Child Support": t('businessTypes.income.alimony'),
    "Other Income": t('businessTypes.income.otherIncome'),
    
    // Individual/Households - Expenses
    "Housing": t('businessTypes.expenses.housing'),
    "Transportation": t('businessTypes.expenses.transportation'),
    "Food and Groceries": t('businessTypes.expenses.foodGroceries'),
    "Healthcare": t('businessTypes.expenses.healthcare'),
    "Debt Payments": t('businessTypes.expenses.debtPayments'),
    "Savings and Investments": t('businessTypes.expenses.savingsInvestments'),
    "Entertainment and Recreation": t('businessTypes.expenses.entertainment'),
    "Childcare and Education": t('businessTypes.expenses.childcare'),
    "Insurance": t('businessTypes.expenses.insurance'),
    
    // Groceries - Income
    "Gross Sales": t('businessTypes.income.grossSales'),
    "Delivery Fees": t('businessTypes.income.deliveryFees'),
    "Service Fees": t('businessTypes.income.serviceFees'),
    
    // Groceries - Expenses
    "Cost of Goods Sold (COGS)": t('businessTypes.expenses.cogs'),
    "Labor Costs": t('businessTypes.expenses.laborCosts'),
    "Rent/Lease": t('businessTypes.expenses.rentLease'),
    "Utilities": t('businessTypes.expenses.utilities'),
    "Marketing and Advertising": t('businessTypes.expenses.marketingAdvertising'),
    "Supplies": t('businessTypes.expenses.supplies'),
    "Maintenance and Repairs": t('businessTypes.expenses.maintenanceRepairs'),
    "Licensing and Permits": t('businessTypes.expenses.licensingPermits'),
    "Shipping and Delivery": t('businessTypes.expenses.shippingDelivery'),
    "Depreciation": t('businessTypes.expenses.depreciation'),
    "Bank Fees and Interest": t('businessTypes.expenses.bankFees'),
    "Professional Services": t('businessTypes.expenses.professionalServices'),
    
    // Cafe - Income
    "Food Sales": t('businessTypes.income.foodSales'),
    "Beverage Sales": t('businessTypes.income.beverageSales'),
    "Dessert Sales": t('businessTypes.income.dessertSales'),
    "Takeout Sales": t('businessTypes.income.takeoutSales'),
    "Catering or Event Revenue": t('businessTypes.income.catering'),
    "Gift Cards or Vouchers": t('businessTypes.income.giftCards'),
    
    // Cafe - Expenses
    "Food Costs": t('businessTypes.expenses.foodCosts'),
    "Beverage Costs": t('businessTypes.expenses.beverageCosts'),
    "Packaging": t('businessTypes.expenses.packaging'),
    "Food Preparation Supplies": t('businessTypes.expenses.preparationSupplies'),
    "Cleaning and Maintenance": t('businessTypes.expenses.cleaningMaintenance'),
    "Equipment and Supplies": t('businessTypes.expenses.equipmentSupplies'),
    "Credit Card Processing Fees": t('businessTypes.expenses.creditCardFees'),
    "Delivery Costs": t('businessTypes.expenses.deliveryCosts'),
    "Interest": t('businessTypes.expenses.interest'),
    "Bad Debt": t('businessTypes.expenses.badDebt'),
    
    // Cleaning Services - Income
    "Recurring Residential Cleaning Contracts": t('businessTypes.income.residentialCleaning'),
    "One-Time Deep Cleaning Services": t('businessTypes.income.deepCleaning'),
    "Move-In/Move-Out Cleaning": t('businessTypes.income.moveInOut'),
    "Commercial Office Cleaning Contracts": t('businessTypes.income.commercialCleaning'),
    "Airbnb Turnover Services": t('businessTypes.income.airbnbTurnover'),
    
    // Cleaning Services - Expenses
    "Cleaning Supplies (detergents, disinfectants, vacuums)": t('businessTypes.expenses.cleaningSupplies'),
    "Employee Wages": t('businessTypes.expenses.employeeWages'),
    "Fuel and Transportation": t('businessTypes.expenses.fuelTransportation'),
    "Uniforms": t('businessTypes.expenses.uniforms'),
    "Advertising (flyers, Google/local ads)": t('businessTypes.expenses.advertising'),
    "Equipment Maintenance and Replacements": t('businessTypes.expenses.equipmentMaintenance'),
    "Liability Insurance": t('businessTypes.expenses.liabilityInsurance'),
    
    // Beauty & Grooming - Income
    "Haircuts and Styling": t('businessTypes.income.haircuts'),
    "Hair Coloring and Treatments": t('businessTypes.income.hairColoring'),
    "Beard Trims and Shaves": t('businessTypes.income.beardTrims'),
    "Manicures and Pedicures": t('businessTypes.income.manicures'),
    "Product Retail (shampoos, conditioners, gels)": t('businessTypes.income.productRetail'),
    "Special Packages (weddings, events)": t('businessTypes.income.specialPackages'),
    
    // Beauty & Grooming - Expenses
    "Hair and Beauty Products": t('businessTypes.expenses.beautyProducts'),
    "Tools and Equipment (clippers, scissors, dryers)": t('businessTypes.expenses.toolsEquipment'),
    "Rent and Utilities": t('businessTypes.expenses.rentUtilities'),
    "Employee Wages or Booth Rent": t('businessTypes.expenses.wagesBooth'),
    "Salon Software (scheduling, POS)": t('businessTypes.expenses.salonSoftware'),
    "Sterilization Supplies (barbicide, gloves)": t('businessTypes.expenses.sterilization'),
    "Towel and Laundry Service": t('businessTypes.expenses.laundry'),
    "Business Licenses and Inspections": t('businessTypes.expenses.licenses'),
    
    // E-commerce - Income
    "Online Product Sales": t('businessTypes.income.onlineProductSales'),
    "Bulk/Wholesale Orders": t('businessTypes.income.bulkOrders'),
    "Custom Orders": t('businessTypes.income.customOrders'),
    "Subscription Boxes": t('businessTypes.income.subscriptionBoxes'),
    "Affiliate Income": t('businessTypes.income.affiliateIncome'),
    "Digital Product Sales (e-books, downloads)": t('businessTypes.income.digitalProducts'),
    
    // E-commerce - Expenses
    "Product Sourcing and Inventory": t('businessTypes.expenses.productSourcing'),
    "Packaging and Shipping Materials": t('businessTypes.expenses.packagingShipping'),
    "Platform Fees (Shopify, Amazon seller fees)": t('businessTypes.expenses.platformFees'),
    "Payment Transaction Fees": t('businessTypes.expenses.transactionFees'),
    "Online Advertising (Meta, Google, SEO)": t('businessTypes.expenses.onlineAdvertising'),
    "Web Hosting/Domain": t('businessTypes.expenses.webHosting'),
    "Software Subscriptions (Canva, QuickBooks)": t('businessTypes.expenses.softwareSubscriptions'),
    "Warehouse or Storage Rental": t('businessTypes.expenses.warehouseRental'),
    
    // Construction - Income
    "Service Calls and Labor Charges": t('businessTypes.income.serviceCalls'),
    "Repair and Installation Jobs": t('businessTypes.income.repairInstallation'),
    "Home Improvement and Remodeling Contracts": t('businessTypes.income.remodeling'),
    "Emergency Calls": t('businessTypes.income.emergencyCalls'),
    "Subcontracting Projects": t('businessTypes.income.subcontracting'),
    "Consulting and Design Services": t('businessTypes.income.consulting'),
    
    // Construction - Expenses
    "Tools and Equipment (drills, ladders, PPE)": t('businessTypes.expenses.constructionTools'),
    "Materials (pipes, wires, paint)": t('businessTypes.expenses.constructionMaterials'),
    "Subcontractor Wages": t('businessTypes.expenses.subcontractorWages'),
    "Vehicle Fuel and Maintenance": t('businessTypes.expenses.vehicleFuel'),
    "Business and Liability Insurance": t('businessTypes.expenses.businessInsurance'),
    "Permits and Licensing Costs": t('businessTypes.expenses.permitsCosts'),
    "Workplace Safety Training": t('businessTypes.expenses.safetyTraining'),
    
    // Content Creator - Income
    "Ad Revenue (YouTube, Facebook, etc.)": t('businessTypes.income.adRevenue'),
    "Sponsorship Deals": t('businessTypes.income.sponsorship'),
    "Affiliate Commissions": t('businessTypes.income.affiliateCommissions'),
    "Merchandise Sales": t('businessTypes.income.merchandiseSales'),
    "Digital Product Sales (e.g., presets, courses)": t('businessTypes.income.digitalProductSales'),
    "Client Work (if freelancing)": t('businessTypes.income.clientWork'),
    "Tips or Donations (e.g., Patreon, Ko-fi)": t('businessTypes.income.tips'),
    
    // Content Creator - Expenses
    "Equipment Purchases or Rentals (cameras, microphones, lights)": t('businessTypes.expenses.equipmentPurchases'),
    "Software Subscriptions (editing tools, cloud storage)": t('businessTypes.expenses.softwareSubs'),
    "Internet and Utilities": t('businessTypes.expenses.internetUtilities'),
    "Office or Studio Rent": t('businessTypes.expenses.officeRent'),
    "Marketing and Promotion": t('businessTypes.expenses.marketingPromotion'),
    "Travel and Lodging (for content shoots)": t('businessTypes.expenses.travelLodging'),
    "Contractors or Freelancers (editors, voice actors, designers)": t('businessTypes.expenses.contractors'),
    
    // Payables - All business types
    "Supplier Payments (Expense) / Owed to Suppliers (Expense)": t('businessTypes.payables.providerPayments'),
    "Freight Costs (Expense)": t('businessTypes.payables.freightCosts'),
    "Wages (Expense)": t('businessTypes.payables.wages'),
    "Utilities (Expense)": t('businessTypes.payables.utilitiesExpense'),
    "Taxes (Expense)": t('businessTypes.payables.taxesExpense'),
    "Rent (Expense)": t('businessTypes.payables.rentExpense'),
    "Insurance (Expense)": t('businessTypes.payables.insuranceExpense'),
    "Fuel Costs (Expense)": t('businessTypes.payables.fuelCosts'),
    "Vehicle Maintenance (Expense)": t('businessTypes.payables.vehicleMaintenanceExpense'),
    "Oil Changes (Expense)": t('businessTypes.payables.oilChanges'),
    "Miscellaneous (Expense)": t('businessTypes.payables.miscExpense'),
    "Bills (Expense)": t('businessTypes.payables.bills'),
    "Inventory Purchases (Expense)": t('businessTypes.payables.inventoryPurchases'),
    "Inventory Adjustments (Expense)": t('businessTypes.payables.inventoryAdjustments'),
    "Food Costs (Expense)": t('businessTypes.payables.foodCostsExpense'),
    "Beverage Costs (Expense)": t('businessTypes.payables.beverageCostsExpense'),
    "Supplies (Expense)": t('businessTypes.payables.suppliesExpense'),
    "Fuel (Expense)": t('businessTypes.payables.fuelExpense'),
    "Advertising (Expense)": t('businessTypes.payables.advertisingExpense'),
    "Uniforms (Expense)": t('businessTypes.payables.uniformsExpense'),
    "Equipment Maintenance (Expense)": t('businessTypes.payables.equipmentMaintenanceExpense'),
    "Product Supplies (Expense)": t('businessTypes.payables.productSupplies'),
    "Software Subscriptions (Expense)": t('businessTypes.payables.softwareSubscriptionsExpense'),
    "Licenses (Expense)": t('businessTypes.payables.licensesExpense'),
    "Laundry and Cleaning (Expense)": t('businessTypes.payables.laundryCleaning'),
    "Shipping Materials (Expense)": t('businessTypes.payables.shippingMaterials'),
    "Software/Platform Fees (Expense)": t('businessTypes.payables.softwarePlatformFees'),
    "Warehouse Rent (Expense)": t('businessTypes.payables.warehouseRentExpense'),
    "Tools and Materials (Expense)": t('businessTypes.payables.toolsMaterials'),
    "Subcontractor Payments (Expense)": t('businessTypes.payables.subcontractorPayments'),
    "Permits (Expense)": t('businessTypes.payables.permitsExpense'),
    "Training Costs (Expense)": t('businessTypes.payables.trainingCosts'),
    "Outstanding Invoices to Suppliers": t('businessTypes.payables.outstandingInvoices'),
    "Scheduled Payments to Freelancers or Agencies": t('businessTypes.payables.scheduledPayments'),
    "Equipment Leases": t('businessTypes.payables.equipmentLeases'),
  };
  
  // Return translated purpose if found, otherwise return original
  return purposeToKeyMap[purpose] || purpose;
};
/**
 * Get translated business type name for select dropdown
 */
export const getTranslatedBusinessTypeName = (businessTypeKey) => {
  const t = i18n.t.bind(i18n);
  
  const mapping = {
    "Trucking": t('userProfile.trucking'),
    "RIDESHARE DRIVERS/PARTNERS": t('userProfile.rideshare'),
    "Groceries": t('userProfile.groceries'),
    "Individual/Households": t('userProfile.individual'),
    "Cafe": t('userProfile.restaurant'),
    "Cleaning Services": t('userProfile.cleaning'),
    "⁠Beauty & Grooming": t('userProfile.beauty'),
    "E-commerce Sellers": t('userProfile.ecommerce'),
    "Construction Trades": t('userProfile.construction'),
    "Content Creator": t('userProfile.contentCreator'),
    "Other": t('userProfile.other')
  };

  return mapping[businessTypeKey] || businessTypeKey;
};