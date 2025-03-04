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
import { Line } from "react-chartjs-2";
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
import { Helmet } from "react-helmet";
import formatUserId from "utils/formatUID";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { setSelectedUser } from "../store/userSlice";
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
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userRole = parseInt(localStorage.getItem("role"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState("");
  const selectedUser = useSelector((state) => state.selectedUser);

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
  const handleUserSelect = (userId) => {
    const numericUserId = Number(userId); // Convert string to number
    console.log("Selected user ID:", numericUserId);
    if (!numericUserId) {
      console.error("handleUserSelect: userId is undefined or null");
      return;
    }
    const selectedUser = users.find((user) => user.id === numericUserId);
    console.log("Found user:", selectedUser);
    if (selectedUser) {
      dispatch(setSelectedUser(selectedUser));
    } else {
      console.error(`handleUserSelect: No user found with id ${numericUserId}`);
    }
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
  const cashOnHandChartData = {
    labels: ["Total Cash on Hand"],
    datasets: [
      {
        label: "Cash on Hand",
        data: [parseFloat(calculateTotalCash())],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const revenueChartData = {
    labels: monthlySales.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: monthlySales.map((item) => item.revenue),
        fill: false,
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
      },
    ],
  };

  const payableChartData = {
    labels: monthlySales.map((item) => item.month),
    datasets: [
      {
        label: "Payable",
        data: monthlySales.map((item) => item.payable),
        fill: false,
        borderColor: "rgb(255, 159, 64)",
        tension: 0.1,
      },
    ],
  };

  const expensesChartData = {
    labels: monthlySales.map((item) => item.month),
    datasets: [
      {
        label: "Expenses",
        data: monthlySales.map((item) => item.expenses),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const fetchFinancialData = async (uid = null) => {
    try {
      const targetUserId = uid || localStorage.getItem("userId");

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
    if (selectedUserId) {
      fetchFinancialData(selectedUserId);
    }
  }, [selectedUserId]);
  useEffect(() => {
    fetchUsers().then(() => {
      console.log("Users fetched:", users);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Mesob Finance</title>
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
                    <Input
                      type="select"
                      value={selectedUserId || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setSelectedUserId(selectedId);
                        handleUserSelect(selectedId);
                      }}
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <div className="content">
        <Row>
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
                <Line data={cashOnHandChartData} />
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">REVENUE Chart</p>
                <h4 className="text-center mb-3"></h4>
                <Line data={revenueChartData} />
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">TOTAL PAYABLE Chart</p>
                <h4 className="text-center mb-3"></h4>
                <Line data={payableChartData} />
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardBody>
                <p className="text-center mb-2">TOTAL EXPENSES Chart</p>
                <h4 className="text-center mb-3"></h4>
                <Line data={expensesChartData} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
