// hooks/useFinancialData.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared hook used by both Dashboard and MesobFinancial2.
// Handles: fetching user profile + transactions, building revenues/expenses
// maps, and exposing all calculate* functions.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem";

const useFinancialData = ({ userId: propUserId = null, autoFetch = true } = {}) => {
  // ── Raw data ───────────────────────────────────────────────────────────────
  const [items, setItems]                           = useState([]);
  const [revenues, setRevenues]                     = useState({});
  const [expenses, setExpenses]                     = useState({});
  const [accountsPayable, setAccountsPayable]       = useState({});
  const [companyName, setCompanyName]               = useState("");
  const [initialBalance, setInitialBalance]         = useState(0);
  const [initialvalueableItems, setValuableItems]   = useState(0);
  const [initialoutstandingDebt, setOutstandingDebt]= useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState(
    localStorage.getItem("businessType") || ""
  );

  // ── Loading flags ──────────────────────────────────────────────────────────
  const [loadingTransactions, setLoadingTransactions]         = useState(false);
  const [loadingUserInitialBalance, setLoadingUserInitialBalance] = useState(false);

  // ── Filter state (optional — callers may manage their own or pass overrides) ─
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [searchTerm, setSearchTerm]               = useState("");
  const [searchedDates, setSearchedDates]         = useState(null);

  // ── Resolve which userId to use ────────────────────────────────────────────
  const resolveUserId = () => propUserId || localStorage.getItem("userId");

  // ── Fetch user profile ─────────────────────────────────────────────────────
  const fetchUserInitialBalance = useCallback(async (uid = null) => {
    setLoadingUserInitialBalance(true);
    try {
      const targetUserId = uid || resolveUserId();
      const response = await axios.get(`${API}/Users/${targetUserId}`);

      if (response.data?.user) {
        const user = response.data.user;

        if (user.businessType) {
          setSelectedBusinessType(user.businessType);
          localStorage.setItem("businessType", user.businessType);
        }
        if (user.cashBalance)    setInitialBalance(parseFloat(user.cashBalance));
        if (user.valueableItems) setValuableItems(parseFloat(user.valueableItems));
        if (user.outstandingDebt) setOutstandingDebt(parseFloat(user.outstandingDebt));
        if (typeof user.companyName === "string") setCompanyName(user.companyName);
      }
    } catch (error) {
      console.error("useFinancialData: error fetching user profile", error);
    } finally {
      setLoadingUserInitialBalance(false);
    }
  }, [propUserId]);

  // ── Filter helper ──────────────────────────────────────────────────────────
  const filterItemsByTimeRange = useCallback((rawItems, range, term = "") => {
    if (!range || !range.from || !range.to) {
      return rawItems.filter((item) =>
        item.transactionPurpose?.toLowerCase().includes(term.toLowerCase())
      );
    }

    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);

    return rawItems.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate >= fromDate &&
        itemDate <= toDate &&
        item.transactionPurpose?.toLowerCase().includes(term.toLowerCase())
      );
    });
  }, []);

  // ── Get currently filtered items ───────────────────────────────────────────
  const getFilteredItems = useCallback(() => {
    return filterItemsByTimeRange(items, selectedTimeRange, searchTerm);
  }, [items, selectedTimeRange, searchTerm, filterItemsByTimeRange]);

  // ── Build revenues / expenses maps ────────────────────────────────────────
  const buildFinancials = useCallback((transactions) => {
    const newRevenues      = {};
    const newExpenses      = {};
    const newAccountsPayable = {};

    const filtered = filterItemsByTimeRange(transactions, selectedTimeRange, searchTerm);

    filtered.forEach((transaction) => {
      const amount  = parseFloat(transaction.transactionAmount) || 0;
      const purpose = transaction.transactionPurpose;

      if (transaction.transactionType === "Receive") {
        newRevenues[purpose] = (newRevenues[purpose] || 0) + amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "Payable"
      ) {
        if (
          transaction.payableId !== "outstanding-debt" &&
          !purpose.includes("Outstanding Debt")
        ) {
          newExpenses[purpose] = (newExpenses[purpose] || 0) + amount;
        }
        if (transaction.transactionType === "Payable") {
          newAccountsPayable[purpose] = (newAccountsPayable[purpose] || 0) + amount;
        }
      }
    });

    setRevenues(newRevenues);
    setExpenses(newExpenses);
    setAccountsPayable(newAccountsPayable);
  }, [selectedTimeRange, searchTerm, filterItemsByTimeRange]);

  // ── Fetch transactions ─────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (uid = null) => {
    setLoadingTransactions(true);
    try {
      const targetUserId = uid || resolveUserId();
      const response = await axios.get(`${API}/Transaction?userId=${targetUserId}`);

      if (response.data) {
        // Mirror MesobFinancial2's installment mapping
        const mapped = response.data.map((transaction) => {
          if (transaction.installmentPlan) {
            return {
              ...transaction,
              status:
                transaction.installmentPlan.remainingAmount > 0
                  ? "Partially Paid"
                  : "Paid",
              paidAmount:      transaction.installmentPlan.paidAmount,
              remainingAmount: transaction.installmentPlan.remainingAmount,
            };
          }
          return transaction;
        });

        setItems(mapped);
        buildFinancials(mapped);
      }
    } catch (error) {
      console.error("useFinancialData: error fetching transactions", error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [propUserId, buildFinancials]);

  // ── Recalculate financials whenever filter/search changes ─────────────────
  useEffect(() => {
    if (items.length > 0) {
      buildFinancials(items);
    }
  }, [items, selectedTimeRange, searchTerm]);

  // ── Auto-fetch on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoFetch) return;
    const load = async () => {
      await fetchUserInitialBalance();
      await fetchTransactions();
    };
    load();
  }, [autoFetch]);

  // ══════════════════════════════════════════════════════════════════════════
  // Calculate functions — identical logic to MesobFinancial2
  // All use getFilteredItems() so date/search filters are respected.
  // ══════════════════════════════════════════════════════════════════════════

  const calculateTotalCash = useCallback(() => {
    const filtered = getFilteredItems();

    const totalReceived = filtered.reduce((sum, v) =>
      v.transactionType === "Receive" ? sum + parseFloat(v.transactionAmount || 0) : sum, 0);

    const newItemReceived = filtered.reduce((sum, v) =>
      v.transactionType === "New_Item" ? sum + parseFloat(v.transactionAmount || 0) : sum, 0);

    const totalPaid = filtered.reduce((sum, v) =>
      v.transactionType === "Pay" ? sum + parseFloat(v.transactionAmount || 0) : sum, 0);

    return (initialBalance + totalReceived - totalPaid - newItemReceived).toFixed(2);
  }, [getFilteredItems, initialBalance]);

  const calculateTotalRevenue = useCallback(() => {
    const filtered = getFilteredItems();
    return filtered
      .reduce((sum, v) =>
        v.transactionType === "Receive" ? sum + parseFloat(v.transactionAmount || 0) : sum, 0)
      .toFixed(2);
  }, [getFilteredItems]);

  const calculateTotalExpenses = useCallback(() => {
    const filtered = getFilteredItems();
    return filtered
      .reduce((sum, v) => {
        if (
          (v.transactionType === "Pay" ||
            (v.transactionType === "Payable" && v.status !== "Paid")) &&
          v.payableId !== "outstanding-debt" &&
          !v.transactionPurpose.includes("Outstanding Debt")
        ) {
          return sum + parseFloat(v.transactionAmount || 0);
        }
        return sum;
      }, 0)
      .toFixed(2);
  }, [getFilteredItems]);

  const calculateTotalPayable = useCallback(() => {
    const filtered = getFilteredItems();

    const totalPayable = filtered.reduce((sum, v) =>
      v.transactionType === "Payable" && v.status !== "Paid"
        ? sum + parseFloat(v.transactionAmount || 0)
        : sum, 0);

    // Use full `items` (not filtered) for complete outstanding debt payment history
    const outstandingDebtPayments = items.reduce((sum, v) =>
      v.payableId === "outstanding-debt" && v.transactionType === "Pay"
        ? sum + parseFloat(v.transactionAmount || 0)
        : sum, 0);

    const remainingOutstandingDebt = Math.max(0, initialoutstandingDebt - outstandingDebtPayments);
    return (totalPayable + remainingOutstandingDebt).toFixed(2);
  }, [getFilteredItems, items, initialoutstandingDebt]);

  const calculateTotalInventory = useCallback(() => {
    const filtered = getFilteredItems();
    const newItemsTotal = filtered.reduce((sum, v) =>
      v.transactionType === "New_Item" && v.subType === "New_Item"
        ? sum + parseFloat(v.transactionAmount || 0)
        : sum, 0);

    return (newItemsTotal + (initialvalueableItems || 0)).toFixed(2);
  }, [getFilteredItems, initialvalueableItems]);

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // ── Data ────────────────────────────────────────────────────────────────
    items,
    setItems,
    revenues,
    expenses,
    accountsPayable,
    companyName,
    initialBalance,
    initialvalueableItems,
    initialoutstandingDebt,
    selectedBusinessType,

    // ── Loading ──────────────────────────────────────────────────────────────
    loadingTransactions,
    loadingUserInitialBalance,

    // ── Filter state (use in your page if you want shared filter management) ─
    selectedTimeRange,
    setSelectedTimeRange,
    searchTerm,
    setSearchTerm,
    searchedDates,
    setSearchedDates,

    // ── Actions ──────────────────────────────────────────────────────────────
    fetchTransactions,
    fetchUserInitialBalance,
    filterItemsByTimeRange,
    getFilteredItems,

    // ── Calculate functions ───────────────────────────────────────────────────
    calculateTotalCash,
    calculateTotalRevenue,
    calculateTotalExpenses,
    calculateTotalPayable,
    calculateTotalInventory,
  };
};

export default useFinancialData;