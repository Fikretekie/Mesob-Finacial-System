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
} from "reactstrap";
// import { Line } from "react-chartjs-2";
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
import formatDate from "utils/formatDate";
import Select from "react-select"; // Import react-select
import { Helmet } from "react-helmet";
import formatUserId from "utils/formatUID";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// ✅ Correct
import {
  setSelectedUserId,
  clearSelectedUserId,
} from "../store/selectedUserSlice";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
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
  const persistedUserId = localStorage.getItem("selectedUserId");
  console.log("Persisted User ID:", persistedUserId);

  const userRole = parseInt(localStorage.getItem("role"));
  const [selectedUserId, setSelectedUserId] = useState(persistedUserId || null); // ✅ renamed local state variable
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [userSubscription, setUserSubscription] = useState(false);
  const [scheduleCount, setScheduleCount] = useState(0);

  const handleUserSelect = (selectedOption) => {
    if (!selectedOption) {
      setSelectedUserId(null);
      localStorage.removeItem("selectedUserId");
      fetchFinancialData(null); // or fetchFinancialData(userId) for default
      return;
    }
    const userId = selectedOption.value;
    setSelectedUserId(userId);
    localStorage.setItem("selectedUserId", userId);
    fetchFinancialData(userId); // Pass userId directly!
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

  const handleAddTransactionClick = () => {
    // Use navigate to go to the MesobFinancial2 page
    navigate("/customer/financial-report", {
      state: { openTransactionModal: true },
    });
  };

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.email,
  }));

  const getSchedule = async () => {
    try {
      let user_id = localStorage.getItem("userId");

      if (!user_id) {
        console.error("User ID not found in localStorage.");
        return;
      }

      // Retrieve the last schedule count from localStorage (or default to 1)
      let lastScheduleCount =
        parseInt(localStorage.getItem("schedule_count")) || 1;
      let newScheduleCount = lastScheduleCount + 1;

      const params = {
        email: "asifhere121@gmail.com",
        subject: "test",
        message: "testing email for schedule",
        user_id: user_id,
        schedule_type: 1, // Default type
        schedule_count: newScheduleCount,
      };

      const response = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/schedule",
        params
      );

      console.log("Response Data:", response.data);

      // Update schedule count in localStorage
      localStorage.setItem("schedule_count", newScheduleCount);
    } catch (error) {
      console.error(
        "Error fetching schedule:",
        error.response?.data || error.message
      );
    }
  };

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
    return totalCash.toFixed(2);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users"
      );
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getChartOptions = (title, data, labels) => {
    return {
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      title: {
        text: title,
        align: "center",
        style: {
          fontSize: "16px",
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
      },
      yaxis: {
        title: {
          text: "Amount",
        },
        //force nice rounding
        tickAmount: 10,
        min: 0,
        max: Math.max(...data) + Math.max(...data) * 0.1, // Adjust the scaling factor as needed
      },
      stroke: {
        curve: "straight", // Use "straight" for a direct line between points
        width: 2, // Adjust the line thickness as needed
      },
      colors: ["#007BFF"], // Use a blue color, adjust as needed
      markers: {
        size: 5, // Adjust the size of the data point markers
        colors: ["#007BFF"], // Make the markers the same color as the line
      },
      grid: {
        show: true, // Ensure the grid is visible
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"], // alternate grid colors
          opacity: 0.5,
        },
      },
    };
  };
  // Generate chart data
  const revenueChartData = getChartOptions(
    "Revenue",
    monthlySales.map((item) => item.revenue),
    monthlySales.map((item) => item.month)
  );
  const payableChartData = getChartOptions(
    "Total Payable",
    monthlySales.map((item) => item.payable),
    monthlySales.map((item) => item.month)
  );
  const expensesChartData = getChartOptions(
    "Total Expenses",
    monthlySales.map((item) => item.expenses),
    monthlySales.map((item) => item.month)
  );
  const cashOnHandChartData = getChartOptions(
    "Total Cash on Hand",
    monthlySales.map((item) => item.cashOnHand),
    monthlySales.map((item) => item.month)
  );

  const fetchFinancialData = async (uid = null) => {
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

      // Fetch user initial data
      const userResponse = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
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

      // Fetch transactions
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${targetUserId}`
      );
      const transactions = response.data;
      setItems(transactions);

      let cashOnHand = initialCashBalance;
      let expenses = 0;
      let newItem = 0;
      let revenue = 0;
      let payable = outstandingDebt;

      const monthlyData = {
        Initial: {
          month: "Initial Balance",
          cashOnHand: initialCashBalance,
          revenue: 0,
          payable: outstandingDebt,
          expenses: 0,
          newItem: 0,
          paidPayables: 0,
        },
      };

      transactions.forEach((transaction) => {
        const amount = parseFloat(transaction.transactionAmount);
        const date = new Date(transaction.createdAt);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthYear,
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
          monthlyData[monthYear].revenue += amount;
        } else if (transaction.transactionType === "Pay") {
          expenses += amount;
          cashOnHand -= amount;
          monthlyData[monthYear].expenses += amount;

          // Check if this payment is for a payable
          if (transaction.payableId) {
            monthlyData[monthYear].paidPayables += amount;
          }
        } else if (
          transaction.transactionType === "Pay" &&
          transaction.subType === "New_Item"
        ) {
          newItem += amount;
          cashOnHand -= amount;
          monthlyData[monthYear].expenses += amount;
          monthlyData[monthYear].newItem += amount;
        } else if (
          (transaction.transactionType === "Payable" &&
            transaction.status === "Payable") ||
          transaction.status === "Partially Paid"
        ) {
          payable += amount;
          monthlyData[monthYear].payable += amount;
        }

        monthlyData[monthYear].cashOnHand = cashOnHand;
      });

      // Set final totals
      setTotalCashOnHand(cashOnHand); // This will now match with the chart
      setTotalExpenses(expenses);
      settotalRevenue(revenue);
      setTotalPayable(payable);

      // Prepare monthly sales data
      setMonthlySales(
        Object.values(monthlyData).sort(
          (a, b) => new Date(a.month) - new Date(b.month)
        )
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const targetUserId = selectedUserId || localStorage.getItem("userId");
        const userResponse = await axios.get(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
        );
        setCompanyName(userResponse.data?.user?.companyName || "");
      } catch (error) {
        console.error("Error fetching company name:", error);
      }
    };

    fetchCompanyName();
  }, [selectedUserId]);

  useEffect(() => {
    if (userRole === 0) {
      // Admin role
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
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      // Only set subscription if user exists
      if (response.data && response.data.user) {
        setUserSubscription(response.data.user.subscription);
        setScheduleCount(response.data.user.scheduleCount || 1);
      } else {
        setUserSubscription(false); // or null, or a sensible default
        setScheduleCount(1);
      }
    };
    fetchSubscription();
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Mesob Finance </title>
      </Helmet>
      <PanelHeader
        size="sm"
        content={
          <div>
            <h3
              style={{
                color: "white",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              {companyName}
            </h3>
          </div>
        }
      />
      {userRole !== 0 && userRole !== 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <Button
            style={{ marginRight: "4rem" }}
            color="primary"
            onClick={handleAddTransactionClick}
            disabled={!userSubscription && scheduleCount >= 4}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
            Add Transaction
          </Button>
          {/* <Button color="secondary" onClick={getSchedule}>
            Get Schedule
          </Button> */}
        </div>
      )}
      {userRole === 0 && (
        <div
          className="content"
          style={{ marginBottom: "20px", minHeight: "100px" }}
        >
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Select User</CardTitle>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label>Select User to View:</Label>
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
                        control: (provided) => ({
                          ...provided,
                          minHeight: "38px",
                          height: "38px",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                          padding: "0 6px",
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0px",
                        }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: "38px",
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
      <div className="content">
        <Row style={{ marginTop: "28px" }}>
          <Col lg="3" md="6" xs="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-dollar-sign text-success" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">TOTAL CASH ON HAND</p>
                      <CardTitle tag="h3">${calculateTotalCash()}</CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-chart-line text-danger" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">TOTAL EXPENSES</p>
                      <CardTitle tag="h3">
                        $
                        {totalExpenses.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-file-invoice-dollar text-warning" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">TOTAL PAYABLE</p>
                      <CardTitle tag="h3">
                        $
                        {totalPayable.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" xs="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center">
                      <i className="fas fa-file-invoice-dollar text-warning" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Revenue</p>
                      <CardTitle tag="h3">
                        $
                        {totalrevenue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">TOTAL CASH ON HAND Chart</p>
                <h4 className="text-center mb-3"></h4>
                <ReactApexChart
                  options={cashOnHandChartData}
                  series={cashOnHandChartData.series}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">REVENUE Chart</p>
                <h4 className="text-center mb-3"></h4>
                <ReactApexChart
                  options={revenueChartData}
                  series={revenueChartData.series}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">TOTAL PAYABLE Chart</p>
                <h4 className="text-center mb-3"></h4>
                <ReactApexChart
                  options={payableChartData}
                  series={payableChartData.series}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">TOTAL EXPENSES Chart</p>
                <h4 className="text-center mb-3"></h4>
                <ReactApexChart
                  options={expensesChartData}
                  series={expensesChartData.series}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
