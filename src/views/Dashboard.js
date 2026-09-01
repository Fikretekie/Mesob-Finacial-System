import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Popover,
  PopoverBody,
  Spinner,
} from "reactstrap";
import ReactApexChart from "react-apexcharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { apiUrl, ROUTES } from "../config/api";
import Select from "react-select";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import LanguageSelector from "components/Languageselector/LanguageSelector";
import { faPlus, faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import DownloadReportModal from "components/DownloadReportModal";
import BalanceValue from "components/BalanceValue";
import {
  FINANCIAL_COLORS,
  getBalanceColor,
  getBalanceCardStyle,
} from "utils/financialColors";

const CHART_TOOLBAR_DOWNLOAD_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function computeDashboardMetrics(
  transactions,
  initialCashBalance,
  outstandingDebt,
  dateRange,
  searchQuery
) {
  const q = (searchQuery || "").trim().toLowerCase();
  const matches = (tx) =>
    !q || String(tx.transactionPurpose || "").toLowerCase().includes(q);

  const sortedTransactions = [...(transactions || [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  let fromMs = null;
  let toMs = null;
  if (dateRange?.from && dateRange?.to) {
    const a = new Date(dateRange.from);
    a.setHours(0, 0, 0, 0);
    fromMs = a.getTime();
    const b = new Date(dateRange.to);
    b.setHours(23, 59, 59, 999);
    toMs = b.getTime();
  }

  const filteredForPdf = sortedTransactions.filter((tx) => {
    if (!matches(tx)) return false;
    if (fromMs == null || toMs == null) return true;
    const t = new Date(tx.createdAt).getTime();
    return t >= fromMs && t <= toMs;
  });

  const dateKeyOf = (createdAt) => {
    const date = new Date(createdAt);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  let cashOnHand = initialCashBalance;
  let payable = outstandingDebt;
  let revenue = 0;
  let expenses = 0;
  let newItem = 0;
  const dailyData = {};

  const applyLedgerOnly = (tx) => {
    const amount = parseFloat(tx.transactionAmount) || 0;
    if (tx.transactionType === "Receive") {
      cashOnHand += amount;
    } else if (tx.transactionType === "Pay") {
      cashOnHand -= amount;
      if (tx.payableId) payable -= amount;
    } else if (tx.transactionType === "Pay" && tx.subType === "New_Item") {
      cashOnHand -= amount;
    } else if (tx.transactionType === "New_Item") {
      cashOnHand -= amount;
    } else if (
      tx.transactionType === "Payable" &&
      (tx.status === "Payable" || tx.status === "Partially Paid")
    ) {
      payable += amount;
    }
  };

  const applyTxToDay = (tx, dateKey) => {
    const amount = parseFloat(tx.transactionAmount) || 0;
    const m = matches(tx);

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        cashOnHand,
        revenue: 0,
        payable,
        expenses: 0,
        newItem: 0,
        paidPayables: 0,
      };
    }

    if (tx.transactionType === "Receive") {
      cashOnHand += amount;
      if (m) {
        revenue += amount;
        dailyData[dateKey].revenue += amount;
      }
    } else if (tx.transactionType === "Pay") {
      cashOnHand -= amount;
      if (m) {
        expenses += amount;
        dailyData[dateKey].expenses += amount;
      }
      if (tx.payableId) {
        payable -= amount;
        if (m) dailyData[dateKey].paidPayables += amount;
      }
    } else if (
      tx.transactionType === "Pay" &&
      tx.subType === "New_Item"
    ) {
      newItem += m ? amount : 0;
      cashOnHand -= amount;
      if (m) {
        expenses += amount;
        dailyData[dateKey].expenses += amount;
        dailyData[dateKey].newItem += amount;
      }
    } else if (tx.transactionType === "New_Item") {
      newItem += m ? amount : 0;
      cashOnHand -= amount;
      if (m) {
        expenses += amount;
        dailyData[dateKey].expenses += amount;
        dailyData[dateKey].newItem += amount;
      }
    } else if (
      tx.transactionType === "Payable" &&
      (tx.status === "Payable" || tx.status === "Partially Paid")
    ) {
      payable += amount;
    }

    dailyData[dateKey].payable = payable;
    dailyData[dateKey].cashOnHand = cashOnHand;
  };

  if (fromMs == null || toMs == null) {
    dailyData.Initial = {
      date: "Initial Balance",
      cashOnHand: initialCashBalance,
      revenue: 0,
      payable: outstandingDebt,
      expenses: 0,
      newItem: 0,
      paidPayables: 0,
    };

    sortedTransactions.forEach((tx) => {
      applyTxToDay(tx, dateKeyOf(tx.createdAt));
    });
  } else {
    for (const tx of sortedTransactions) {
      const t = new Date(tx.createdAt).getTime();
      if (t >= fromMs) break;
      applyLedgerOnly(tx);
    }

    dailyData[dateRange.from] = {
      date: dateRange.from,
      cashOnHand,
      payable,
      revenue: 0,
      expenses: 0,
      newItem: 0,
      paidPayables: 0,
    };

    revenue = 0;
    expenses = 0;
    newItem = 0;

    sortedTransactions.forEach((tx) => {
      const t = new Date(tx.createdAt).getTime();
      if (t < fromMs || t > toMs) return;
      applyTxToDay(tx, dateKeyOf(tx.createdAt));
    });

    cashOnHand = initialCashBalance;
    payable = outstandingDebt;
    for (const tx of sortedTransactions) {
      const t = new Date(tx.createdAt).getTime();
      if (t > toMs) break;
      applyLedgerOnly(tx);
    }
  }

  const sortedDailyData = Object.values(dailyData).sort((a, b) => {
    if (a.date === "Initial Balance") return -1;
    if (b.date === "Initial Balance") return 1;
    return new Date(a.date) - new Date(b.date);
  });

  return {
    totalCashOnHand: cashOnHand,
    totalExpenses: expenses,
    totalrevenue: revenue,
    totalPayable: payable,
    monthlySales: sortedDailyData,
    filteredTransactions: filteredForPdf,
  };
}

const SUBSCRIPTION_ROUTE = "/customer/subscription";
const SUBSCRIPTION_UPDATE_HINT = "Subscription update needed";

function Dashboard() {
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalCashOnHand, setTotalCashOnHand] = useState(0);
  const [totalrevenue, settotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialvalueableItems, setvalueableItems] = useState(0);
  const [initialoutstandingDebt, setoutstandingDebt] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [monthlySales, setMonthlySales] = useState([]);
  const [users, setUsers] = useState([]);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [showDownloadReportModal, setShowDownloadReportModal] = useState(false);
  const [loadingFinancialData, setLoadingFinancialData] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCompanyName, setLoadingCompanyName] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const persistedUserId = localStorage.getItem("selectedUserId");
  const userRole = parseInt(localStorage.getItem("role"));
  const { t } = useTranslation();
  const [selectedUserId, setSelectedUserId] = useState(persistedUserId || null);
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [userSubscription, setUserSubscription] = useState(false);
  const [scheduleCount, setScheduleCount] = useState(0);

  const [allTransactions, setAllTransactions] = useState([]);
  const [dashboardDateRange, setDashboardDateRange] = useState(null);
  const [dashboardSearchTerm, setDashboardSearchTerm] = useState("");
  const [dashFromDate, setDashFromDate] = useState("");
  const [dashToDate, setDashToDate] = useState("");
  const [dashShowSearch, setDashShowSearch] = useState(false);

  const dashboardDateRangeRef = useRef(null);
  const dashboardSearchRef = useRef("");
  const totalCashOnHandRef = useRef(0);

  useEffect(() => {
    dashboardDateRangeRef.current = dashboardDateRange;
  }, [dashboardDateRange]);
  useEffect(() => {
    dashboardSearchRef.current = dashboardSearchTerm;
  }, [dashboardSearchTerm]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  // ── Refs so PDF modal always gets fresh values regardless of closure timing ─
  const itemsRef = useRef([]);
  const initialBalanceRef = useRef(0);
  const initialvalueableItemsRef = useRef(0);
  const initialoutstandingDebtRef = useRef(0);
  const totalrevenueRef = useRef(0);
  const totalExpensesRef = useRef(0);
  const totalPayableRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { initialBalanceRef.current = initialBalance; }, [initialBalance]);
  useEffect(() => { initialvalueableItemsRef.current = initialvalueableItems; }, [initialvalueableItems]);
  useEffect(() => { initialoutstandingDebtRef.current = initialoutstandingDebt; }, [initialoutstandingDebt]);
  useEffect(() => { totalrevenueRef.current = totalrevenue; }, [totalrevenue]);
  useEffect(() => { totalExpensesRef.current = totalExpenses; }, [totalExpenses]);
  useEffect(() => { totalPayableRef.current = totalPayable; }, [totalPayable]);

  // Derive revenues/expenses by purpose for PDF report (same shape as financial-report page)
  const { revenues, expenses } = useMemo(() => {
    const rev = {};
    const exp = {};
    const list = Array.isArray(items) ? items : [];
    list.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      const purpose = transaction.transactionPurpose || "";
      if (transaction.transactionType === "Receive") {
        rev[purpose] = (rev[purpose] || 0) + amount;
      } else if (
        (transaction.transactionType === "Pay" || transaction.transactionType === "Payable") &&
        transaction.payableId !== "outstanding-debt" &&
        !String(purpose).includes("Outstanding Debt")
      ) {
        exp[purpose] = (exp[purpose] || 0) + amount;
      }
    });
    return { revenues: rev, expenses: exp };
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileLandscape = isMobile && isLandscape;

  useEffect(() => {
    if (userRole === "0" && !location.pathname.includes("/admin")) {
      navigate("/admin/dashboard", { replace: true });
    } else if (userRole === "2" && !location.pathname.includes("/customer")) {
      navigate("/customer/dashboard", { replace: true });
    }
  }, [userRole, location.pathname, navigate]);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.email,
  }));

  // ── Calculate functions using REFS ─────────────────────────────────────────
  // These are passed as callbacks to DownloadReportModal and called at PDF
  // generation time (not at render time), so they MUST read from refs to avoid
  // stale closure issues. All return plain "0.00" decimal strings — same format
  // as meksova.com2 — so DownloadReportModal's parseFloat() always works.

  const calculateTotalCash = () =>
    (totalCashOnHandRef.current || 0).toFixed(2);

  const calculateTotalRevenue = () => {
    return (totalrevenueRef.current || 0).toFixed(2);
  };

  const calculateTotalExpenses = () => {
    return (totalExpensesRef.current || 0).toFixed(2);
  };

  const calculateTotalPayable = () => {
    return (totalPayableRef.current || 0).toFixed(2);
  };

  const calculateTotalInventory = () => {
    return (initialvalueableItemsRef.current || 0).toFixed(2);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(
        apiUrl(ROUTES.USERS)
      );
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getChartOptions = (title, data, labels, color = "var(--accent-solid)") => {
    return {
      theme: {
        mode: "dark",
      },
      chart: {
        type: "area",
        background: "transparent",
        toolbar: {
          show: true,
          tools: {
            download: CHART_TOOLBAR_DOWNLOAD_ICON,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      series: [
        {
          name: title,
          data: data,
        },
      ],
      xaxis: {
        categories: labels,
        labels: {
          rotate: -45,
          rotateAlways: false,
          style: {
            fontSize: "11px",
            colors: "#ffffff",
          },
        },
        title: {
          text: "Date",
          style: {
            fontSize: "12px",
            fontWeight: 500,
            color: "#ffffff",
          },
        },
      },
      yaxis: {
        title: {
          text: t('dashboard.amount'),
          style: {
            fontSize: "12px",
            fontWeight: 500,
            color: "#ffffff",
          },
        },
        labels: {
          formatter: function (value) {
            if (!value) return "$0";
            return (
              "$" +
              value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            );
          },
          style: {
            colors: "#ffffff",
          },
        },
        tickAmount: 8,
        min: 0,
        max: function (max) {
          return max > 0 ? max * 1.1 : 100;
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
      },
      fill: {
        type: "solid",
        opacity: 0.5,
      },
      colors: [color],
      markers: {
        size: 5,
        colors: [color],
        strokeColors: "#ffffff",
        strokeWidth: 2,
        hover: {
          size: 7,
          sizeOffset: 3,
        },
      },
      grid: {
        show: true,
        borderColor: "var(--accent)",
        strokeDashArray: 3,
        row: {
          colors: ["transparent", "transparent"],
          opacity: 0,
        },
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 10,
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        theme: "dark",
        style: {
          fontSize: "12px",
        },
        y: {
          formatter: function (value) {
            return (
              "$" +
              value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            );
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        labels: {
          colors: "#ffffff",
        },
      },
    };
  };

  const formatDateLabel = (dateStr) => {
    if (dateStr === "Initial Balance") return "Initial";

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const cashOnHandChartData = getChartOptions(
    t('dashboard.totalCashOnHandChart'),
    monthlySales.map((item) => item.cashOnHand),
    monthlySales.map((item) => formatDateLabel(item.date)),
    FINANCIAL_COLORS.positive
  );

  const revenueChartData = getChartOptions(
    t('dashboard.revenueChart'),
    monthlySales.map((item) => item.revenue),
    monthlySales.map((item) => formatDateLabel(item.date)),
    FINANCIAL_COLORS.income
  );

  const payableChartData = getChartOptions(
    t('dashboard.totalPayableChart'),
    monthlySales.map((item) => item.payable),
    monthlySales.map((item) => formatDateLabel(item.date)),
    FINANCIAL_COLORS.payable
  );

  const expensesChartData = getChartOptions(
    t('dashboard.totalExpensesChart'),
    monthlySales.map((item) => item.expenses),
    monthlySales.map((item) => formatDateLabel(item.date)),
    FINANCIAL_COLORS.expense
  );

  const fetchFinancialData = async (uid = null) => {
    setLoadingFinancialData(true);

    try {
      let resolvedUserId;
      if (selectedUserId) {
        resolvedUserId = selectedUserId;
      } else {
        resolvedUserId = uid || localStorage.getItem("userId");
      }

      const userResponse = await axios.get(
        apiUrl(`${ROUTES.USERS}/${resolvedUserId}`)
      );

      const initialCashBalance =
        parseFloat(userResponse.data?.user?.cashBalance) || 0;
      const outstandingDebt =
        parseFloat(userResponse.data?.user?.outstandingDebt) || 0;
      const valuableItems =
        parseFloat(userResponse.data?.user?.valueableItems) || 0;

      setInitialBalance(initialCashBalance);
      setoutstandingDebt(outstandingDebt);
      setvalueableItems(valuableItems);

      // Sync refs immediately so PDF modal callbacks read correct values
      initialBalanceRef.current = initialCashBalance;
      initialoutstandingDebtRef.current = outstandingDebt;
      initialvalueableItemsRef.current = valuableItems;

      const response = await axios.get(
        apiUrl(`${ROUTES.TRANSACTION}?userId=${resolvedUserId}`)
      );
      // Ensure we always have an array (API may return array or { data/transactions: [...] })
      const raw = response.data;
      const transactions = Array.isArray(raw)
        ? raw
        : (raw?.transactions || raw?.data || []);
      setAllTransactions(transactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setLoading(false);
    } finally {
      setLoadingFinancialData(false);
    }
  };

  useEffect(() => {
    const result = computeDashboardMetrics(
      allTransactions,
      initialBalance,
      initialoutstandingDebt,
      dashboardDateRange,
      dashboardSearchTerm
    );
    setTotalCashOnHand(result.totalCashOnHand);
    setTotalExpenses(result.totalExpenses);
    settotalRevenue(result.totalrevenue);
    setTotalPayable(result.totalPayable);
    setMonthlySales(result.monthlySales);
    setItems(result.filteredTransactions);
    itemsRef.current = result.filteredTransactions;
    totalrevenueRef.current = result.totalrevenue;
    totalExpensesRef.current = result.totalExpenses;
    totalPayableRef.current = result.totalPayable;
    totalCashOnHandRef.current = result.totalCashOnHand;
  }, [
    allTransactions,
    dashboardDateRange,
    dashboardSearchTerm,
    initialBalance,
    initialoutstandingDebt,
  ]);

  const isTrialActive = () =>
    trialEndDate && new Date() < trialEndDate && scheduleCount < 4;

  const isSubscriptionGateActive = () =>
    userRole !== 1 && !userSubscription && !isTrialActive();

  const handleAddTransactionClick = () => {
    if (isSubscriptionGateActive()) {
      navigate(SUBSCRIPTION_ROUTE);
      return;
    }
    navigate("/customer/financial-report", {
      state: { openTransactionModal: true },
    });
  };

  const calculatePercentageChange = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) {
      if (currentValue === 0) return { text: "— No change", value: 0, isPositive: null };
      return { text: "+100% vs last month", value: 100, isPositive: true };
    }
    const change = ((currentValue - previousValue) / previousValue) * 100;
    const roundedChange = Math.round(change);
    if (roundedChange === 0) {
      return { text: "— No change", value: 0, isPositive: null };
    }
    const sign = roundedChange > 0 ? "+" : "";
    return {
      text: `${sign}${roundedChange}% vs last month`,
      value: roundedChange,
      isPositive: roundedChange > 0,
    };
  };

  const getPreviousMonthValues = () => {
    if (!monthlySales || monthlySales.length < 2) {
      return { cashOnHand: 0, expenses: 0, payable: 0, revenue: 0 };
    }
    const previousIndex = monthlySales.length - 2;
    const previous = monthlySales[previousIndex];
    return {
      cashOnHand: previous?.cashOnHand || 0,
      expenses: previous?.expenses || 0,
      payable: previous?.payable || 0,
      revenue: previous?.revenue || 0,
    };
  };

  useEffect(() => {
    const fetchCompanyName = async () => {
      setLoadingCompanyName(true);
      try {
        const targetUserId = selectedUserId || localStorage.getItem("userId");
        const userResponse = await axios.get(
          apiUrl(`${ROUTES.USERS}/${targetUserId}`)
        );
        setCompanyName(userResponse.data?.user?.companyName || "");
      } catch (error) {
        console.error("Error fetching company name:", error);
      } finally {
        setLoadingCompanyName(false);
      }
    };
    fetchCompanyName();
  }, [selectedUserId]);

  useEffect(() => {
    if (userRole === 0) {
      fetchUsers();
    } else {
      fetchFinancialData();
    }
  }, [userRole]);

  useEffect(() => {
    fetchUsers().then(() => {
      console.log("Users fetched:", users);
    });
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoadingSubscription(true);
      const userId = localStorage.getItem("userId");
      try {
        const response = await axios.get(
          apiUrl(`${ROUTES.USERS}/${userId}`)
        );
        if (response.data && response.data.user) {
          setUserSubscription(response.data.user.subscription);
          setTrialEndDate(new Date(response.data.user?.trialEndDate));
          setScheduleCount(response.data.user.scheduleCount || 1);
        } else {
          setUserSubscription(false);
          setScheduleCount(1);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setUserSubscription(false);
        setScheduleCount(1);
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchSubscription();
  }, []);

  // When user clicks "Download Report" in the navbar while on dashboard, open this page's modal (with real data)
  useEffect(() => {
    const handleDashboardDownload = () => setShowDownloadReportModal(true);
    window.addEventListener("dashboard:downloadReport", handleDashboardDownload);
    return () => window.removeEventListener("dashboard:downloadReport", handleDashboardDownload);
  }, []);

  const LoadingOverlay = ({ loading, text = "Loading..." }) => {
    if (!loading) return null;
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(16, 25, 38, 0.72)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          borderRadius: "inherit",
        }}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="text-center" style={{ padding: "0.5rem" }}>
          <Spinner
            color="light"
            style={{
              width: "1.85rem",
              height: "1.85rem",
              opacity: 0.95,
            }}
          />
          <p
            className="mt-2 mb-0"
            style={{
              color: "rgba(203, 213, 225, 0.95)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.03em",
            }}
          >
            {text}
          </p>
        </div>
      </div>
    );
  };

  const handleUserSelect = (selectedOption) => {
    setDashboardDateRange(null);
    setDashFromDate("");
    setDashToDate("");
    setDashboardSearchTerm("");
    setDashShowSearch(false);
    if (!selectedOption) {
      setSelectedUserId(null);
      localStorage.removeItem("selectedUserId");
      setAllTransactions([]);
      fetchFinancialData(null);
      return;
    }
    const uid = selectedOption.value;
    setSelectedUserId(uid);
    localStorage.setItem("selectedUserId", uid);
    fetchFinancialData(uid);
  };

  const filterActionsLocked =
    userRole === 1 ? false : !userSubscription && !isTrialActive();
  const dashboardFilterDisabled = userRole === 0 && !selectedUserId;

  const handleDashboardFilterRun = () => {
    if (!dashFromDate || !dashToDate) {
      window.alert(t("financialReport.selectDates"));
      return;
    }
    setDashboardDateRange({ from: dashFromDate, to: dashToDate });
  };

  const handleDashboardClearFilters = () => {
    setDashFromDate("");
    setDashToDate("");
    setDashboardDateRange(null);
    setDashboardSearchTerm("");
    setDashShowSearch(false);
  };

  const showDashboardFilters = userRole !== 0 || selectedUserId;

  useEffect(() => {
    const persistedUserId = localStorage.getItem("selectedUserId");
    if (persistedUserId) {
      setSelectedUserId(persistedUserId);
      fetchFinancialData(persistedUserId);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchFinancialData(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .apexcharts-menu-item { color: #000000 !important; }
      .apexcharts-menu-item:hover { color: #000000 !important; }
      .apexcharts-menu-item:active { color: #000000 !important; }
      .apexcharts-menu-item:focus { color: #000000 !important; }
    `;
    document.head.appendChild(style);
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Meksova </title>
      </Helmet>
      {isMobile ?
        <PanelHeader
          size={isMobileLandscape ? "md" : isMobile ? "sm" : "sm"}
          content={
            <>
              {isMobile && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  display: "flex",
                  marginTop: 70,
                  justifyContent: 'center',
                  paddingLeft: 5,
                  paddingRight: 5,
                  gap: "10px",
                }}>
                  <Button
                    type="button"
                    title={isSubscriptionGateActive() ? SUBSCRIPTION_UPDATE_HINT : undefined}
                    onClick={() => {
                      if (isSubscriptionGateActive()) {
                        navigate(SUBSCRIPTION_ROUTE);
                        return;
                      }
                      setShowDownloadReportModal(true);
                    }}
                    style={{
                      backgroundColor: "var(--accent-solid)",
                      borderColor: "var(--accent-solid)",
                      color: "#ffffff",
                      height: "44px",
                      borderRadius: "10px",
                      width: "45%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      margin: 0,
                      opacity: isSubscriptionGateActive() ? 0.5 : 1,
                    }}
                  >
                    <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
                    {t('financialReport.downloadReport')}
                  </Button>

                  {userRole !== 0 && (
                    <Button
                      type="button"
                      title={isSubscriptionGateActive() ? SUBSCRIPTION_UPDATE_HINT : undefined}
                      onClick={handleAddTransactionClick}
                      style={{
                        backgroundColor: FINANCIAL_COLORS.income,
                        borderColor: FINANCIAL_COLORS.income,
                        color: "#ffffff",
                        height: "44px",
                        borderRadius: "10px",
                        width: "45%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        margin: 0,
                        opacity: isSubscriptionGateActive() ? 0.5 : 1,
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} style={{ marginRight: "8px" }} />
                      {t('dashboard.addTransaction')}
                    </Button>
                  )}
                </div>
              )}
            </>
          }
        />
        : null}
      {userRole === 0 && (
        <div
          className="content "
          style={{
            marginBottom: "5px",
            minHeight: "100px",
            paddingInline: 15,
            marginTop: isMobile ? 8 : 80,
          }}
        >
          <Row style={{ marginTop: isMobile ? 8 : 12 }}>
            <Col xs={12}>
              <Card style={{ backgroundColor: "var(--surface-2)" }}>
                <CardHeader>
                  <CardTitle style={{ marginBottom: 0, color: "#ffffff" }} tag="h4">
                    {t('dashboard.selectUser')}
                  </CardTitle>
                </CardHeader>
                <CardBody style={{ position: "relative" }}>
                  <LoadingOverlay loading={loadingUsers} text="Loading users..." />
                  <FormGroup>
                    <Label>{t('dashboard.selectUserToView')}</Label>
                    <Select
                      options={userOptions}
                      value={userOptions.find((option) => option.value === selectedUserId)}
                      onChange={handleUserSelect}
                      placeholder="Search or select a user..."
                      isClearable
                      isSearchable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: "38px",
                          height: "38px",
                          backgroundColor: "var(--surface-2)",
                          color: "#ffffff",
                          borderColor: state.isFocused ? "#ffffff" : "#ffffff",
                          boxShadow: state.isFocused ? "0 0 0 1px #ffffff" : "none",
                          "&:hover": { borderColor: "var(--accent)" },
                        }),
                        valueContainer: (provided) => ({ ...provided, height: "38px", padding: "0 6px" }),
                        input: (provided) => ({ ...provided, margin: "0px", color: "#ffffff" }),
                        singleValue: (provided) => ({ ...provided, color: "#ffffff" }),
                        placeholder: (provided) => ({ ...provided, color: "#ffffff", opacity: 0.7 }),
                        indicatorsContainer: (provided) => ({ ...provided, height: "38px" }),
                        menu: (provided) => ({ ...provided, backgroundColor: "var(--surface-2)", border: "1px solid #ffffff" }),
                        menuList: (provided) => ({ ...provided, backgroundColor: "var(--surface-2)" }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? "var(--accent-solid)" : state.isFocused ? "var(--surface-1)" : "var(--surface-2)",
                          color: "#ffffff",
                          cursor: "pointer",
                          "&:active": { backgroundColor: "var(--accent-solid)" },
                        }),
                      }}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <div className="content" style={{ position: "relative", marginTop: isMobile ? 0 : 80 }}>
        <LoadingOverlay loading={loadingFinancialData} text="Loading financial data..." />

        {showDashboardFilters && (
          <Row style={{ marginBottom: "8px", marginTop: isMobile ? 8 : 12 }}>
            <Col xs="12">
              <Card style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <CardBody style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "flex-start",
                      flexWrap: isMobile ? "wrap" : "nowrap",
                      gap: "10px",
                      width: "100%",
                      minWidth: 0,
                      ...(isMobile
                        ? {}
                        : {
                          overflowX: "auto",
                          overflowY: "hidden",
                          paddingBottom: "2px",
                          WebkitOverflowScrolling: "touch",
                        }),
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "15px",
                        flexWrap: isMobile ? "wrap" : "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      <FormGroup
                        style={{
                          marginBottom: 0,
                          minWidth: isMobile ? "150px" : "132px",
                          maxWidth: isMobile ? "200px" : "180px",
                          flex: isMobile ? undefined : "0 0 auto",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Label
                          for="dashboardFromDate"
                          style={{
                            color: "#ffffff",
                            marginBottom: "5px",
                            fontSize: "0.875rem",
                            lineHeight: "1.2",
                          }}
                        >
                          {t("financialReport.from")}
                        </Label>
                        <Input
                          type="date"
                          id="dashboardFromDate"
                          value={dashFromDate}
                          onChange={(e) => setDashFromDate(e.target.value)}
                          disabled={dashboardFilterDisabled}
                          readOnly={!dashboardFilterDisabled && filterActionsLocked}
                          title={
                            !dashboardFilterDisabled && filterActionsLocked
                              ? SUBSCRIPTION_UPDATE_HINT
                              : undefined
                          }
                          onClick={() => {
                            if (!dashboardFilterDisabled && filterActionsLocked) {
                              navigate(SUBSCRIPTION_ROUTE);
                            }
                          }}
                          style={{
                            backgroundColor: "var(--surface-3)",
                            color: "#ffffff",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "4px",
                            height: "38px",
                            padding: "6px 12px",
                            width: "100%",
                            opacity:
                              !dashboardFilterDisabled && filterActionsLocked ? 0.5 : 1,
                            cursor:
                              !dashboardFilterDisabled && filterActionsLocked
                                ? "pointer"
                                : undefined,
                          }}
                        />
                      </FormGroup>
                      <FormGroup
                        style={{
                          marginBottom: 0,
                          minWidth: isMobile ? "150px" : "132px",
                          maxWidth: isMobile ? "200px" : "180px",
                          flex: isMobile ? undefined : "0 0 auto",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Label
                          for="dashboardToDate"
                          style={{
                            color: "#ffffff",
                            marginBottom: "5px",
                            fontSize: "0.875rem",
                            lineHeight: "1.2",
                          }}
                        >
                          {t("financialReport.to")}
                        </Label>
                        <Input
                          type="date"
                          id="dashboardToDate"
                          value={dashToDate}
                          onChange={(e) => setDashToDate(e.target.value)}
                          disabled={dashboardFilterDisabled}
                          readOnly={!dashboardFilterDisabled && filterActionsLocked}
                          title={
                            !dashboardFilterDisabled && filterActionsLocked
                              ? SUBSCRIPTION_UPDATE_HINT
                              : undefined
                          }
                          onClick={() => {
                            if (!dashboardFilterDisabled && filterActionsLocked) {
                              navigate(SUBSCRIPTION_ROUTE);
                            }
                          }}
                          style={{
                            backgroundColor: "var(--surface-3)",
                            color: "#ffffff",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "4px",
                            height: "38px",
                            padding: "6px 12px",
                            width: "100%",
                            opacity:
                              !dashboardFilterDisabled && filterActionsLocked ? 0.5 : 1,
                            cursor:
                              !dashboardFilterDisabled && filterActionsLocked
                                ? "pointer"
                                : undefined,
                          }}
                        />
                      </FormGroup>
                    </div>
                    <FormGroup
                      style={{
                        marginBottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        flex: isMobile ? "1 1 100%" : "1 1 0%",
                        minWidth: isMobile ? "100%" : 0,
                        maxWidth: isMobile ? "100%" : "none",
                      }}
                    >
                      <Label
                        aria-hidden
                        style={{
                          visibility: "hidden",
                          color: "#ffffff",
                          marginBottom: "5px",
                          fontSize: "0.875rem",
                          lineHeight: "1.2",
                          userSelect: "none",
                        }}
                      >
                        .
                      </Label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: isMobile ? "wrap" : "nowrap",
                          minHeight: "38px",
                          width: "100%",
                          minWidth: 0,
                        }}
                      >
                        <Button
                          type="button"
                          title={
                            !dashboardFilterDisabled && filterActionsLocked
                              ? SUBSCRIPTION_UPDATE_HINT
                              : undefined
                          }
                          onClick={() => {
                            if (!dashboardFilterDisabled && filterActionsLocked) {
                              navigate(SUBSCRIPTION_ROUTE);
                              return;
                            }
                            handleDashboardFilterRun();
                          }}
                          disabled={dashboardFilterDisabled}
                          style={{
                            height: "38px",
                            flexShrink: 0,
                            backgroundColor: "var(--accent)",
                            borderColor: "var(--accent)",
                            color: "#ffffff",
                            borderRadius: "4px",
                            padding: "0 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity:
                              !dashboardFilterDisabled && filterActionsLocked ? 0.5 : 1,
                          }}
                        >
                          {t("financialReport.run")}
                        </Button>
                        <Button
                          type="button"
                          title={
                            !dashboardFilterDisabled && filterActionsLocked
                              ? SUBSCRIPTION_UPDATE_HINT
                              : undefined
                          }
                          onClick={() => {
                            if (!dashboardFilterDisabled && filterActionsLocked) {
                              navigate(SUBSCRIPTION_ROUTE);
                              return;
                            }
                            handleDashboardClearFilters();
                          }}
                          disabled={dashboardFilterDisabled}
                          style={{
                            height: "38px",
                            flexShrink: 0,
                            backgroundColor: "#888888",
                            borderColor: "#888888",
                            color: "#ffffff",
                            borderRadius: "4px",
                            padding: "0 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity:
                              !dashboardFilterDisabled && filterActionsLocked ? 0.5 : 1,
                          }}
                        >
                          {t("financialReport.clearFilters")}
                        </Button>
                        {dashShowSearch ? (
                          <div
                            style={{
                              position: "relative",
                              flex: isMobile ? "1 1 100%" : "1 1 120px",
                              minWidth: isMobile ? "100%" : "100px",
                              maxWidth: isMobile ? "100%" : "240px",
                            }}
                          >
                            <Input
                              type="text"
                              placeholder={t("financialReport.searchJournal")}
                              value={dashboardSearchTerm}
                              onChange={(e) => setDashboardSearchTerm(e.target.value)}
                              onBlur={() => {
                                if (dashboardSearchTerm.trim() === "") setDashShowSearch(false);
                              }}
                              disabled={dashboardFilterDisabled}
                              style={{
                                height: "38px",
                                width: "100%",
                                borderRadius: "4px",
                                backgroundColor: "var(--surface-3)",
                                color: "#ffffff",
                                border: "1px solid var(--border-strong)",
                                padding: "6px 12px",
                                paddingRight: "35px",
                              }}
                            />
                            <button
                              type="button"
                              aria-label="Close search"
                              onClick={() => {
                                setDashboardSearchTerm("");
                                setDashShowSearch(false);
                              }}
                              style={{
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "#ffffff",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ fontSize: "18px", lineHeight: 1 }}>×</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={t("financialReport.searchJournal")}
                            title={
                              !dashboardFilterDisabled && filterActionsLocked
                                ? SUBSCRIPTION_UPDATE_HINT
                                : undefined
                            }
                            onClick={() => {
                              if (dashboardFilterDisabled) return;
                              if (filterActionsLocked) {
                                navigate(SUBSCRIPTION_ROUTE);
                                return;
                              }
                              setDashShowSearch(true);
                            }}
                            disabled={dashboardFilterDisabled}
                            style={{
                              height: "38px",
                              width: "38px",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "var(--surface-3)",
                              border: "1px solid var(--border-strong)",
                              borderRadius: "4px",
                              color: "#ffffff",
                              cursor: "pointer",
                              opacity:
                                !dashboardFilterDisabled && filterActionsLocked ? 0.5 : 1,
                            }}
                          >
                            <FontAwesomeIcon icon={faSearch} />
                          </button>
                        )}
                      </div>
                    </FormGroup>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        <div className="dash-overview">
          <div>
            <p className="mk-eyebrow">{t("dashboard.financialOverview", "Financial overview")}</p>
            <h2 className="dash-overview__title">{t("dashboard.title", "Dashboard")}</h2>
          </div>
          <span className="dash-overview__meta">
            {t("dashboard.booksCurrent", "Books current")} ·{" "}
            {new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" })}
          </span>
        </div>

        <Row style={{ marginBottom: "5px", marginTop: 0 }}>
          <Col lg="3" md="6" xs="12" style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}>
            <Card
              className="card-stats"
              style={{
                position: "relative",
                ...getBalanceCardStyle(parseFloat(calculateTotalCash())),
              }}
            >
              <LoadingOverlay loading={loadingFinancialData} text="Loading..." />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.cashOnHand')}</p>
                      <CardTitle tag="h3" style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? (
                          <Spinner size="sm" />
                        ) : (
                          <BalanceValue
                            value={parseFloat(calculateTotalCash())}
                            tooltip={t("financialReport.cashDeficitTooltip")}
                            style={{ fontSize: "1.5rem" }}
                          >
                            {`$${parseFloat(calculateTotalCash()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          </BalanceValue>
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: getBalanceColor(parseFloat(calculateTotalCash())), fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(parseFloat(calculateTotalCash()), getPreviousMonthValues().cashOnHand).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-dollar-sign" style={{ color: getBalanceColor(parseFloat(calculateTotalCash())), fontSize: isMobile ? "1.5rem" : "2rem" }} />
                    </div>
                  </Col>
                </Row>
                {!loadingFinancialData && (
                  <div style={{ marginLeft: "-1.25rem", marginRight: "-1.25rem", marginTop: "10px", width: "calc(100% + 2.5rem)" }}>
                    <div
                      style={{
                        width: "98%",
                        height: "3px",
                        backgroundColor: getBalanceColor(parseFloat(calculateTotalCash())),
                        marginBottom: "8px",
                        borderRadius: "2px",
                      }}
                      aria-hidden
                    />
                    <div
                      style={{
                        width: "100%",
                        border: "1px solid var(--teal)",
                        borderRadius: "6px",
                        padding: isMobile ? "6px 1.25rem" : "8px 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      <span style={{ color: "white", fontSize: isMobile ? "0.7rem" : "0.75rem", fontWeight: 600 }}>
                        {t("dashboard.taxEstimation")}
                      </span>
                      <span style={{ color: "white", fontSize: isMobile ? "0.85rem" : "0.95rem", fontWeight: 600 }}>
                        ${(parseFloat(calculateTotalCash()) * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12" style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}>
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "var(--surface-2)", borderBottom: `4px solid ${FINANCIAL_COLORS.expense}`, borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading..." />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.totalExpenses')}</p>
                      <CardTitle tag="h3" style={{ color: FINANCIAL_COLORS.expense, fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? <Spinner size="sm" /> : (
                          `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: FINANCIAL_COLORS.expense, fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(totalExpenses, getPreviousMonthValues().expenses).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-chart-line" style={{ color: FINANCIAL_COLORS.expense, fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12" style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}>
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "var(--surface-2)", borderBottom: `4px solid ${FINANCIAL_COLORS.payable}`, borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading..." />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.totalPayable')}</p>
                      <CardTitle tag="h3" style={{ color: FINANCIAL_COLORS.payable, fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? <Spinner size="sm" /> : (
                          `$${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: FINANCIAL_COLORS.payable, fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(totalPayable, getPreviousMonthValues().payable).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-credit-card" style={{ color: FINANCIAL_COLORS.payable, fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12" style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}>
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "var(--surface-2)", borderBottom: `4px solid ${FINANCIAL_COLORS.income}`, borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading..." />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.revenue')}</p>
                      <CardTitle tag="h3" style={{ color: FINANCIAL_COLORS.income, fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? <Spinner size="sm" /> : (
                          `$${totalrevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: FINANCIAL_COLORS.income, fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(totalrevenue, getPreviousMonthValues().revenue).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-chart-line" style={{ color: FINANCIAL_COLORS.income, fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row style={{ backgroundColor: "var(--surface-2)" }}>
          <Col md={6} style={{ padding: 0, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "var(--surface-2)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading chart..." />
              <CardBody style={{ backgroundColor: "var(--surface-2)", border: "none" }}>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.totalCashOnHandChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="cashFlowChart">
                  <ReactApexChart options={cashOnHandChartData} series={cashOnHandChartData.series} type="area" height={300} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} style={{ paddingInline: 3, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "var(--surface-2)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading chart..." />
              <CardBody style={{ backgroundColor: "var(--surface-2)", border: "none" }}>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.revenueChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="revenueChart">
                  <ReactApexChart options={revenueChartData} series={revenueChartData.series} type="area" height={300} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} style={{ padding: 0, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "var(--surface-2)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading chart..." />
              <CardBody style={{ backgroundColor: "var(--surface-2)", border: "none" }}>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.totalPayableChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="payableChart">
                  <ReactApexChart options={payableChartData} series={payableChartData.series} type="area" height={300} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} style={{ paddingInline: 3, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "var(--surface-2)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay loading={loadingFinancialData} text="Loading chart..." />
              <CardBody style={{ backgroundColor: "var(--surface-2)", border: "none" }}>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.totalExpensesChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="expensesChart">
                  <ReactApexChart options={expensesChartData} series={expensesChartData.series} type="area" height={300} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div >

      {/* ── Download Report Modal ──────────────────────────────────────────── */}
      < DownloadReportModal
        isOpen={showDownloadReportModal}
        toggle={() => setShowDownloadReportModal(false)
        }
        companyName={companyName}
        items={items || []}
        revenues={revenues}
        expenses={expenses}
        initialBalance={initialBalance}
        initialvalueableItems={initialvalueableItems}
        initialoutstandingDebt={initialoutstandingDebt}
        calculateTotalCash={calculateTotalCash}
        calculateTotalRevenue={calculateTotalRevenue}
        calculateTotalExpenses={calculateTotalExpenses}
        calculateTotalPayable={calculateTotalPayable}
        calculateTotalInventory={calculateTotalInventory}
        searchedDates={dashboardDateRange}
        currentLanguage={i18n.language}
      />
    </>
  );
}

export default Dashboard;