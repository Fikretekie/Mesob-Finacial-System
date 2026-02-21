import React, { useEffect, useState, useRef } from "react";
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
import Select from "react-select";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "components/Languageselector/LanguageSelector";
import { faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import DownloadReportModal from "components/DownloadReportModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState();
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

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

  const handleAddTransactionClick = () => {
    navigate("/customer/financial-report", {
      state: { openTransactionModal: true },
    });
  };

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.email,
  }));

  const calculateTotalCash = () => {
    const totalReceived = items?.reduce((sum, item) => {
      return (
        sum +
        (item.transactionType === "Receive" ? item.transactionAmount || 0 : 0)
      );
    }, 0);

    const New_ItemReceived = items?.reduce((sum, item) => {
      return (
        sum +
        (item.transactionType === "New_Item" ? item.transactionAmount || 0 : 0)
      );
    }, 0);

    const totalExpenses = items?.reduce((sum, item) => {
      return (
        sum + (item.transactionType === "Pay" ? item.transactionAmount || 0 : 0)
      );
    }, 0);

    const totalCash =
      initialBalance + totalReceived - totalExpenses - New_ItemReceived;
    return totalCash.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users"
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

  const getChartOptions = (title, data, labels, color = "#007BFF") => {
    return {
      chart: {
        type: "area",
        toolbar: {
          show: true,
          tools: {
            download: true,
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
      title: {
        text: title,
        align: window.innerWidth < 576 ? "left" : "center",
        style: {
          fontSize: "16px",
          fontWeight: 600,
          color: "#ffffff",
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
          style: {
            colors: "#ffffff",
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
        borderColor: "#817646",
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
    "#41926f"
  );

  const revenueChartData = getChartOptions(
    t('dashboard.revenueChart'),
    monthlySales.map((item) => item.revenue),
    monthlySales.map((item) => formatDateLabel(item.date)),
    "#2b427d"
  );

  const payableChartData = getChartOptions(
    t('dashboard.totalPayableChart'),
    monthlySales.map((item) => item.payable),
    monthlySales.map((item) => formatDateLabel(item.date)),
    "#c7ae4f"
  );

  const expensesChartData = getChartOptions(
    t('dashboard.totalExpensesChart'),
    monthlySales.map((item) => item.expenses),
    monthlySales.map((item) => formatDateLabel(item.date)),
    "#a7565d"
  );

  const fetchFinancialData = async (uid = null) => {
    setLoadingFinancialData(true);
    const targetUserId =
      uid ||
      localStorage.getItem("selectedUserId") ||
      localStorage.getItem("userId");
    console.log("Fetching financial data for user:", targetUserId);

    try {
      let targetUserId;
      if (selectedUserId) {
        console.log("Using selectedUserId:", selectedUserId);
        targetUserId = selectedUserId;
      } else {
        targetUserId = uid || localStorage.getItem("userId");
      }

      const userResponse = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
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

      const response = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${targetUserId}`
      );
      const transactions = response.data;
      setItems(transactions);

      let cashOnHand = initialCashBalance;
      let expenses = 0;
      let newItem = 0;
      let revenue = 0;
      let payable = outstandingDebt;

      const dailyData = {
        Initial: {
          date: "Initial Balance",
          cashOnHand: initialCashBalance,
          revenue: 0,
          payable: outstandingDebt,
          expenses: 0,
          newItem: 0,
          paidPayables: 0,
        },
      };

      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      sortedTransactions.forEach((transaction) => {
        const amount = parseFloat(transaction.transactionAmount);
        const date = new Date(transaction.createdAt);
        const dateKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: dateKey,
            cashOnHand: cashOnHand,
            revenue: 0,
            payable: payable,
            expenses: 0,
            newItem: 0,
            paidPayables: 0,
          };
        }

        if (transaction.transactionType === "Receive") {
          cashOnHand += amount;
          revenue += amount;
          dailyData[dateKey].revenue += amount;
        } else if (transaction.transactionType === "Pay") {
          expenses += amount;
          cashOnHand -= amount;
          dailyData[dateKey].expenses += amount;

          if (transaction.payableId) {
            payable -= amount;
            dailyData[dateKey].paidPayables += amount;
          }
        } else if (
          transaction.transactionType === "Pay" &&
          transaction.subType === "New_Item"
        ) {
          newItem += amount;
          cashOnHand -= amount;
          dailyData[dateKey].expenses += amount;
          dailyData[dateKey].newItem += amount;
        } else if (
          transaction.transactionType === "Payable" &&
          (transaction.status === "Payable" ||
            transaction.status === "Partially Paid")
        ) {
          payable += amount;
        }

        dailyData[dateKey].payable = payable;
        dailyData[dateKey].cashOnHand = cashOnHand;
      });

      setTotalCashOnHand(cashOnHand);
      setTotalExpenses(expenses);
      settotalRevenue(revenue);
      setTotalPayable(payable);

      const sortedDailyData = Object.values(dailyData).sort((a, b) => {
        if (a.date === "Initial Balance") return -1;
        if (b.date === "Initial Balance") return 1;
        return new Date(a.date) - new Date(b.date);
      });

      setMonthlySales(sortedDailyData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setLoading(false);
    } finally {
      setLoadingFinancialData(false);
    }
  };

  const isTrialActive = () => {
    return new Date() < trialEndDate && scheduleCount < 4;
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
      return {
        cashOnHand: 0,
        expenses: 0,
        payable: 0,
        revenue: 0,
      };
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
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
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
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
        );
        if (response.data && response.data.user) {
          setUserSubscription(response.data.user.subscription);
          setTrialEndDate(new Date(response.data.user?.trialEndDate));
          console.log("=>>>>>", response.data.user.subscription);
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
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          borderRadius: "inherit",
        }}
      >
        <div className="text-center">
          <Spinner color="primary" />
          <p className="mt-2">{text}</p>
        </div>
      </div>
    );
  };

  const handleUserSelect = (selectedOption) => {
    if (!selectedOption) {
      setSelectedUserId(null);
      localStorage.removeItem("selectedUserId");
      fetchFinancialData(null);
      return;
    }
    const userId = selectedOption.value;
    setSelectedUserId(userId);
    localStorage.setItem("selectedUserId", userId);
    fetchFinancialData(userId);
  };

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
      .apexcharts-menu-item {
        color: #000000 !important;
      }
      .apexcharts-menu-item:hover {
        color: #000000 !important;
      }
      .apexcharts-menu-item:active {
        color: #000000 !important;
      }
      .apexcharts-menu-item:focus {
        color: #000000 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Mesob Finance </title>
      </Helmet>
      <PanelHeader
        size={isMobileLandscape ? "md" : isMobile ? "sm" : "sm"}
        content={
          <>
            {/* Desktop Layout */}
            {!isMobile && (
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                width:'90%',
                alignItems: "center",
                marginTop: isMobileLandscape ? 0 : -45,
                padding: "0 20px",
              }}>
              
                <div style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}>
                  <Button
                    onClick={() => setShowDownloadReportModal(true)}
                    disabled={userRole === 1 ? false : !userSubscription && !isTrialActive()}
                    style={{
                      backgroundColor: "#2b427d",
                      borderColor: "#2b427d",
                      color: "#ffffff",
                      height: "36px",
                      borderRadius: "4px",
                      padding: "0 14px",
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      margin: 0,
                    }}
                  >
                    <FontAwesomeIcon icon={faDownload} style={{ marginRight: "6px" }} />
                    {t('financialReport.downloadReport')}
                  </Button>

                  {userRole !== 0 && (
                    <Button
                      onClick={handleAddTransactionClick}
                      disabled={userRole === 1 ? false : !userSubscription && !isTrialActive()}
                      style={{
                        backgroundColor: "#41926f",
                        borderColor: "#41926f",
                        color: "#ffffff",
                        height: "36px",
                        borderRadius: "4px",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
                      {t('dashboard.addTransaction')}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Layout (portrait + landscape) */}
          {isMobile && (
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            display: "flex",
            marginTop: 60,
            paddingLeft: 16,
            paddingRight: 16,
            gap: "10px",
          }}>
            <Button
              onClick={() => setShowDownloadReportModal(true)}
              disabled={userRole === 1 ? false : !userSubscription && !isTrialActive()}
              style={{
                backgroundColor: "#2b427d",
                borderColor: "#2b427d",
                color: "#ffffff",
                height: "44px",
                borderRadius: "10px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
              {t('financialReport.downloadReport')}
            </Button>

            {userRole !== 0 && (
              <Button
                onClick={handleAddTransactionClick}
                disabled={userRole === 1 ? false : !userSubscription && !isTrialActive()}
                style={{
                  backgroundColor: "#41926f",
                  borderColor: "#41926f",
                  color: "#ffffff",
                  height: "44px",
                  borderRadius: "10px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  margin: 0,
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
      {userRole === 0 && (
        <div
          className="content "
          style={{ marginBottom: "5px", minHeight: "100px", paddingInline: 15 }}
        >
          <Row style={{ marginTop: "34px" }}>
            <Col xs={12}>
              <Card style={{ backgroundColor: "#101926" }}>
                <CardHeader>
                  <CardTitle style={{ marginBottom: 0, color: "#ffffff" }} tag="h4">
                    {t('dashboard.selectUser')}
                  </CardTitle>
                </CardHeader>
                <CardBody style={{ position: "relative" }}>
                  <LoadingOverlay
                    loading={loadingUsers}
                    text="Loading users..."
                  />
                
                  <FormGroup>
                    <Label>{t('dashboard.selectUserToView')}</Label>
                    <Select
                      options={userOptions}
                      value={userOptions.find(
                        (option) => option.value === selectedUserId
                      )}
                      onChange={handleUserSelect}
                      placeholder="Search or select a user..."
                      isClearable
                      isSearchable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: "38px",
                          height: "38px",
                          backgroundColor: "#101926",
                          color: "#ffffff",
                          borderColor: state.isFocused ? "#ffffff" : "#ffffff",
                          boxShadow: state.isFocused ? "0 0 0 1px #ffffff" : "none",
                          "&:hover": {
                            borderColor: "#817646",
                          },
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                          padding: "0 6px",
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0px",
                          color: "#ffffff",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#ffffff",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#ffffff",
                          opacity: 0.7,
                        }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: "#101926",
                          border: "1px solid #ffffff",
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          backgroundColor: "#101926",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#2b427d"
                            : state.isFocused
                              ? "#1a2332"
                              : "#101926",
                          color: "#ffffff",
                          cursor: "pointer",
                          "&:active": {
                            backgroundColor: "#2b427d",
                          },
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

      <div className="content" style={{ position: "relative", marginTop:5 }}>
        <LoadingOverlay
          loading={loadingFinancialData}
          text="Loading financial data..."
        />

        <Row style={{ marginBottom: "5px", backgroundColor: "#101926", marginTop: 22 }}>
          <Col
            lg="3"
            md="6"
            xs="12"
            style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}
          >
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "#101926", borderBottom: "4px solid #41926f", borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading..."
              />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.cashOnHand')}</p>
                      <CardTitle tag="h3" style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? (
                          <Spinner size="sm" />
                        ) : (
                          `$${calculateTotalCash()}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: "#41926f", fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(
                            parseFloat(calculateTotalCash().replace(/,/g, "")),
                            getPreviousMonthValues().cashOnHand
                          ).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-dollar-sign" style={{ color: "#41926f", fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col
            lg="3"
            md="6"
            xs="12"
            style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}
          >
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "#101926", borderBottom: "4px solid #a7565d", borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading..."
              />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.totalExpenses')}</p>
                      <CardTitle tag="h3" style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? (
                          <Spinner size="sm" />
                        ) : (
                          `$${totalExpenses.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: "#a7565d", fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(
                            totalExpenses,
                            getPreviousMonthValues().expenses
                          ).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-chart-line" style={{ color: "#a7565d", fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col
            lg="3"
            md="6"
            xs="12"
            style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}
          >
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "#101926", borderBottom: "4px solid #c7ae4f", borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading..."
              />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.totalPayable')}</p>
                      <CardTitle tag="h3" style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? (
                          <Spinner size="sm" />
                        ) : (
                          `$${totalPayable.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: "#c7ae4f", fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(
                            totalPayable,
                            getPreviousMonthValues().payable
                          ).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-credit-card" style={{ color: "#c7ae4f", fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12" style={{ paddingLeft: "3px", paddingRight: "3px", marginBottom: "4px" }}>
            <Card className="card-stats" style={{ position: "relative", backgroundColor: "#101926", borderBottom: "4px solid #2b427d", borderImage: "none", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading..."
              />
              <CardBody>
                <Row>
                  <Col xs="8">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "#ffffff", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t('dashboard.revenue')}</p>
                      <CardTitle tag="h3" style={{ color: "#ffffff", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {loadingFinancialData ? (
                          <Spinner size="sm" />
                        ) : (
                          `$${totalrevenue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        )}
                      </CardTitle>
                      {!loadingFinancialData && (
                        <p style={{ color: "#2b427d", fontSize: "0.75rem", margin: 0 }}>
                          {calculatePercentageChange(
                            totalrevenue,
                            getPreviousMonthValues().revenue
                          ).text}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col xs="4">
                    <div className="icon-big text-center" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                      <i className="fas fa-chart-line" style={{ color: "#2b427d", fontSize: "2rem" }} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row style={{ backgroundColor: "#101926" }}>
          <Col md={6} style={{ padding: 0, marginBottom: "5px" }}>
            <Card  style={{ position: "relative", backgroundColor: "#101926", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading chart..."
              />
              <CardBody>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.totalCashOnHandChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="cashFlowChart">
                  <ReactApexChart
                    options={cashOnHandChartData}
                    series={cashOnHandChartData.series}
                    type="area"
                    height={300}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} style={{ paddingInline: 3, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "#101926", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading chart..."
              />
              <CardBody>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.revenueChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="revenueChart">
                <ReactApexChart
                  options={revenueChartData}
                  series={revenueChartData.series}
                  type="area"
                  height={300}
                />
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col md={6} style={{ padding: 0, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "#101926", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading chart..."
              />
              <CardBody>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.totalPayableChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="payableChart">
                <ReactApexChart
                  options={payableChartData}
                  series={payableChartData.series}
                  type="area"
                  height={300}
                />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} style={{ paddingInline: 3, marginBottom: "5px" }}>
            <Card style={{ position: "relative", backgroundColor: "#101926", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
              <LoadingOverlay
                loading={loadingFinancialData}
                text="Loading chart..."
              />
              <CardBody>
                <p className="text-center mb-2" style={{ color: "#ffffff" }}>{t('dashboard.totalExpensesChart')}</p>
                <h4 className="text-center mb-3"></h4>
                <div id="expensesChart">
                <ReactApexChart
                  options={expensesChartData}
                  series={expensesChartData.series}
                  type="area"
                  height={300}
                />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      <DownloadReportModal
        isOpen={showDownloadReportModal}
        toggle={() => setShowDownloadReportModal(false)}
        companyName={companyName}
        items={items || []}
        revenues={{}}
        expenses={{}}
        initialBalance={initialBalance}
        initialvalueableItems={initialvalueableItems}
        initialoutstandingDebt={initialoutstandingDebt}
        calculateTotalCash={calculateTotalCash}
        calculateTotalRevenue={() => totalrevenue.toFixed(2)}
        calculateTotalExpenses={() => totalExpenses.toFixed(2)}
        calculateTotalPayable={() => totalPayable.toFixed(2)}
        calculateTotalInventory={() => initialvalueableItems.toFixed(2)}
        searchedDates={null}
      />
    </>
  );
}

export default Dashboard;