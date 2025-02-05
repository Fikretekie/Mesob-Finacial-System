import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import TransactionTable from "./TransactionTable";
import { AddExpenseButton } from "components/AddExpenseButton";
import IncomeStatement from "components/IncomeStatement";

const MesobFinancial2 = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const notificationAlertRef = useRef(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchedDates, setSearchedDates] = useState(null);
  const [totalCashOnHand, setTotalCashOnHand] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);
  const [manualPurpose, setManualPurpose] = useState("");
  const [isManual, setIsManual] = useState("");
  const [revenues, setRevenues] = useState({});
  const [expenses, setExpenses] = useState({});
  const [accountsPayable, setAccountsPayable] = useState({});
  const [paymentMode, setPaymentMode] = useState(null);
  const [unpaidTransactions, setUnpaidTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userRole = parseInt(localStorage.getItem("role"));
  const [selectedUnpaidTransaction, setSelectedUnpaidTransaction] =
    useState(null);
  const [initialBalance, setInitialBalance] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const fileInputRef = useRef(null);
  const [subType, setsubType] = useState("");

  const [formErrors, setFormErrors] = useState({});
  // Add receipt handling function
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      try {
        const formData = new FormData();
        formData.append("receipt", file);
        formData.append("userId", localStorage.getItem("userId"));

        notify("tr", "Receipt uploaded successfully", "success");
        setShowAddTransaction(false); // Close the modal
        resetForm(); // Reset the form after successful upload
      } catch (error) {
        console.error("Error uploading receipt:", error);
        notify("tr", "Failed to upload receipt", "danger");
      }
    }
  };

  //fetching users
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
      notify("tr", "Error fetching users", "danger");
    }
  };
  const calculateTotals = (transactions) => {
    let cashOnHand = initialBalance || 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        cashOnHand += amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "Payable"
      ) {
        expenses += amount;
      }
    });

    setTotalCashOnHand(cashOnHand);
    setTotalExpenses(expenses);
  };

  const userId = localStorage.getItem("userId");

  const inventoryValue = items
    .filter(
      (item) => item.subType === "New_Item" && item.transactionType === "Pay"
    )
    .reduce((sum, item) => sum + parseFloat(item.transactionAmount), 0)
    .toFixed(2);

  const valueableItems = localStorage?.getItem("valueableItems");
  const totalInventory = parseInt(inventoryValue) + parseInt(valueableItems);

  const notify = (place, message, type) => {
    notificationAlertRef.current.notificationAlert({
      place,
      message: <div>{message}</div>,
      type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    });
  };

  const handleAddTransaction = async () => {
    const errors = {};

    if (transactionPurpose === "manual" && !manualPurpose.trim()) {
      errors.manualPurpose = "Please enter a purpose manually";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (!transactionType || !transactionAmount) {
      notify("tr", "Please fill in all fields", "warning");
      return;
    }

    setIsAddingTransaction(true);

    try {
      const newTransaction = {
        userId: localStorage.getItem("userId"),
        transactionType:
          transactionType === "receive"
            ? "Receive"
            : transactionType === "Payable"
            ? "Payable"
            : "Pay",

        transactionPurpose:
          transactionPurpose === "manual" ? manualPurpose : transactionPurpose,
        transactionAmount: parseFloat(transactionAmount),
        subType: subType,
        status: transactionType === "Payable" ? "Unpaid" : undefined,
      };

      if (transactionType === "pay" && paymentMode === "boughtItem") {
        const creditTransaction = {
          userId: localStorage.getItem("userId"),
          transactionType: "Pay",
          subType: subType,
          transactionPurpose: manualPurpose || "New_Item",
          transactionAmount: parseFloat(transactionAmount),
        };

        const [creditResponse] = await Promise.all([
          axios.post(
            "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
            creditTransaction
          ),
        ]);

        if (creditResponse.status === 200) {
          notify("tr", "New item purchase recorded successfully", "success");
        }
      } else {
        // Handle regular transaction
        const response = await axios.post(
          "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
          newTransaction
        );

        if (response.status === 200) {
          notify("tr", "Transaction added successfully", "success");
        }
      }

      resetForm();
      fetchTransactions();
      setShowAddTransaction(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      notify("tr", "Error processing transaction", "danger");
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const resetForm = () => {
    setTransactionType("");
    setTransactionPurpose("");
    setTransactionAmount("");
    setManualPurpose("");
    setEditingTransaction(null);
    setReceipt(null);
    setPaymentMode(null);
    setSelectedUnpaidTransaction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const handleUpdateTransaction = async (transaction) => {
    setIsUpdatingTransaction(true);
    try {
      if (transaction.id === "outstanding-debt") {
        // Handle outstanding debt payment
        const response = await axios.put(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`,
          { outstandingDebt: 0 }
        );
        if (response.status === 200) {
          localStorage.setItem("outstandingDebt", "0");
          notify("tr", "Transaction updated to Paid successfully", "success");
          fetchTransactions();
        }
      } else {
        // Handle regular unpaid transaction
        const updatedTransaction = {
          ...transaction,

          status: "Paid",
          updatedAt: new Date().toISOString(),
        };
        const response = await fetch(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transaction.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTransaction),
          }
        );
        if (response.ok) {
          const newTransaction = {
            userId: localStorage.getItem("userId"),
            transactionType: "Pay",
            transactionPurpose,
            transactionAmount: parseFloat(transaction.transactionAmount),
            subType: "Expense",
          };

          const response = await axios.post(
            "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
            newTransaction
          );

          if (response.status === 200) {
            notify("tr", "Transaction updated to Paid successfully", "success");
            fetchTransactions();
          } else {
            notify("tr", "Transaction update failed", "danger");
          }
        }
      }
    } catch (error) {
      notify("tr", "Error updating transaction", "danger");
    } finally {
      setIsUpdatingTransaction(false);
      setSelectedUnpaidTransaction(null);
      setShowAddTransaction(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    setIsDeletingTransaction(true);
    try {
      const response = await fetch(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transactionId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        notify("tr", "Transaction deleted successfully", "success");
        fetchTransactions();
      } else {
        const data = await response.json();
        notify("tr", data.message || "Failed to delete transaction", "danger");
      }
    } catch (error) {
      notify("tr", "Error deleting transaction", "danger");
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  const filterItemsByTimeRange = (items, range) => {
    if (!range || !range.from || !range.to) return items;

    // Parse the datetime strings to Date objects
    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);

    return items.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  };

  const fetchUserInitialBalance = async (uid = null) => {
    try {
      const targetUserId = uid || localStorage.getItem("userId");
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
      );
      if (response.data?.user?.cashBalance) {
        setInitialBalance(parseFloat(response.data.user.cashBalance));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      notify("tr", "Error fetching initial balance", "danger");
    }
  };

  useEffect(() => {
    if (userRole === 0) {
      // Admin role
      fetchUsers();
    } else {
      const initializeData = async () => {
        try {
          await fetchUserInitialBalance();
          await fetchTransactions();
        } catch (error) {
          console.error("Error initializing data:", error);
          notify("tr", "Error loading initial data", "danger");
        }
      };
      initializeData();
    }
  }, [userRole]);

  useEffect(() => {
    if (items && items.length > 0) {
      calculateFinancials(items);
    }
  }, [items]);

  useEffect(() => {
    if (showAddTransaction && transactionType === "pay") {
      fetchUnpaidTransactions();
    }
  }, [showAddTransaction, transactionType]);

  const calculateFinancials = (transactions) => {
    const newRevenues = {};
    const newExpenses = {};
    const newAccountsPayable = {};

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        const purpose = transaction.transactionPurpose;
        newRevenues[purpose] = (newRevenues[purpose] || 0) + amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "Payable"
      ) {
        const purpose = transaction.transactionPurpose;
        newExpenses[purpose] = (newExpenses[purpose] || 0) + amount;
        if (transaction.transactionType === "Payable") {
          newAccountsPayable[purpose] =
            (newAccountsPayable[purpose] || 0) + amount;
        }
      }
    });

    setRevenues(newRevenues);
    setExpenses(newExpenses);
    setAccountsPayable(newAccountsPayable);
  };

  const calculateTotalRevenue = () => {
    const revenueTotal = Object.values(revenues).reduce(
      (sum, amount) => sum + amount,
      0
    );
    const valuableItemsAmount =
      parseFloat(localStorage.getItem("valueableItems")) || 0;
    return revenueTotal.toFixed(2);
  };
  // const calculateTotalExpenses = () => {
  //   let totalexp = 0;
  //   items.map((Value) => {
  //     console.log("Value", Value);

  //     if (Value.subType === "Expense") {
  //       totalexp += parseFloat(Value.transactionAmount || 0);
  //     }
  //   });

  //   return totalexp;

  //   // const regularExpenses = Object.values(expenses).reduce((sum, expense) => {
  //   //   console.log("expenses==>>", expenses);

  //   //   if (expense.subType === "Expense" && expense.transactionType === "Pay") {
  //   //     return sum + parseFloat(expense.transactionAmount || 0);
  //   //   }
  //   //   return sum;
  //   // }, 0);
  //   // return regularExpenses.toFixed(2);
  // };

  const calculateTotalExpenses = () => {
    const totalexp = Object.values(items).reduce((sum, value) => {
      if (value.subType === "Expense" && value.transactionType === "Pay") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    return totalexp.toFixed(2);
  };

  const calculateTotalPayable = () => {
    const unpaidTotal = Object.values(accountsPayable).reduce(
      (sum, amount) => sum + amount,
      0
    );
    const outstandingDebtAmount =
      parseFloat(localStorage.getItem("outstandingDebt")) || 0;
    return (unpaidTotal + outstandingDebtAmount).toFixed(2);
  };

  const fetchTransactions = (uid = null) => {
    setLoading(true);
    const targetUserId = uid || localStorage.getItem("userId");

    axios
      .get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${targetUserId}`
      )
      .then((response) => {
        if (response.data) {
          console.log("transactions daa: ", response.data);
          calculateTotals(response.data);
          setItems(response.data);
        }
      })
      .catch((error) => {
        notify("tr", "Error fetching transactions", "danger");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUnpaidTransactions = () => {
    axios
      .get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      )
      .then((response) => {
        const unpaidOnly = response.data.filter(
          (t) => t.transactionType === "Payable"
        );

        // Add outstanding debt as an unpaid transaction
        const outstandingDebt = parseFloat(
          localStorage.getItem("outstandingDebt")
        );
        if (outstandingDebt > 0) {
          unpaidOnly.push({
            id: "outstanding-debt",
            transactionType: "Payable",
            transactionPurpose: "Initial Outstanding Debt",
            transactionAmount: outstandingDebt,
            createdAt: new Date().toISOString(),
          });
        }

        setUnpaidTransactions(unpaidOnly);
      })
      .catch((error) => {
        console.error("Error fetching unpaid transactions:", error);
        notify("tr", "Error fetching unpaid transactions", "danger");
      });
  };

  const handleSelectRange = (range) => {
    setSelectedTimeRange(range);
  };

  const handleClearFilters = () => {
    setSelectedTimeRange("all");
    setSearchedDates(null);
  };

  const handleAddExpense = (expense) => {
    console.log("New expense:", expense);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setLoading(true);
      axios
        .delete(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            notify("tr", "Record deleted successfully", "success");
            fetchTransactions();
          } else {
            notify("tr", "Failed to delete record", "danger");
          }
        })
        .catch((error) => {
          console.error("Delete error:", error);
          notify(
            "tr",
            error.response?.data?.message || "Failed to delete record",
            "danger"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDeleteAllRecords = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");

    try {
      const response = await axios.delete(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setItems([]);
        setTotalCashOnHand(0);
        setTotalExpenses(0);
        setRevenues({});
        setExpenses({});
        setAccountsPayable({});
        notify("tr", "All records deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting all records:", error);
      notify("tr", "Error deleting records", "danger");
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const RunButtons = ({ onSelectRange, onClearFilters }) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleRun = () => {
      if (fromDate && toDate) {
        onSelectRange({ from: fromDate, to: toDate });
        setSearchedDates({ from: fromDate, to: toDate });
      } else {
        notify("tr", "Please select both From and To dates", "warning");
      }
    };

    const handleClear = () => {
      setFromDate("");
      setToDate("");
      onClearFilters();
    };

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <FormGroup style={{ marginRight: "10px" }}>
          <Label for="fromDate">From</Label>
          <Input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </FormGroup>
        <FormGroup style={{ marginRight: "10px" }}>
          <Label for="toDate">To</Label>
          <Input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </FormGroup>
        <Button
          color="primary"
          onClick={handleRun}
          style={{ marginRight: "10px", height: "38px" }}
        >
          Run
        </Button>
        <Button
          color="secondary"
          onClick={handleClear}
          style={{ marginRight: "10px", height: "38px" }}
        >
          Clear Filters
        </Button>
        <Button
          color="danger"
          onClick={handleDeleteAllRecords}
          style={{ height: "38px" }}
        >
          Close
        </Button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Mesob Financial - Mesob Finance</title>
      </Helmet>

      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Mesob Financial Report</h2>
          </div>
        }
      />

      <NotificationAlert ref={notificationAlertRef} />
      {userRole === 0 && (
        <div
          className="content"
          style={{ marginBottom: "-30px", minHeight: "100px" }}
        >
          <Row style={{ margin: "0" }}>
            <Col xs={12}>
              <Card style={{ marginBottom: "0" }}>
                <CardHeader>
                  <CardTitle tag="h4">Select User</CardTitle>
                </CardHeader>
                <CardBody style={{ paddingBottom: "15px" }}>
                  <FormGroup style={{ marginBottom: "0" }}>
                    <Label>Select User to View:</Label>
                    <Input
                      type="select"
                      value={selectedUserId || ""}
                      onChange={(e) => {
                        const userId = e.target.value;
                        setSelectedUserId(userId);
                        if (userId) {
                          localStorage.setItem("tempUserId", userId);
                          fetchTransactions(userId);
                          fetchUserInitialBalance(userId);
                        }
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

      <div className="content" style={{ paddingTop: "0" }}>
        {/* Transactions Table Section - First */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <CardTitle tag="h4">Transactions</CardTitle>
                  {userRole !== 0 && (
                    <Button
                      color="primary"
                      onClick={() => setShowAddTransaction(true)}
                    >
                      Add Transaction
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 25px",
                  }}
                >
                  <CardTitle tag="h4">Journal Entry</CardTitle>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <RunButtons
                      onSelectRange={handleSelectRange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                  <>
                    {searchedDates && (
                      <div style={{ marginBottom: "15px" }}>
                        <strong>Searched dates:</strong> {searchedDates.from} -{" "}
                        {searchedDates.to}
                      </div>
                    )}
                    <TransactionTable
                      items={filterItemsByTimeRange(items, selectedTimeRange)}
                      selectedTimeRange={selectedTimeRange}
                      handleDelete={handleDelete}
                      handleAddExpense={handleAddExpense}
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Summary Section - Second */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>
                      Total Cash on hand ={" "}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#fffd9d",
                        padding: "5px 10px",
                      }}
                    >
                      ${totalCashOnHand}
                    </span>
                  </div>

                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>
                      Total Payable (Unpaid) ={" "}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#ff998d",
                        padding: "5px 10px",
                      }}
                    >
                      ${calculateTotalPayable()}
                    </span>
                  </div>

                  {Object.entries(accountsPayable).map(([purpose, amount]) => (
                    <div
                      key={purpose}
                      style={{
                        marginLeft: "20px",
                        marginBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "10px" }}>{purpose} = </span>
                      <span
                        style={{
                          backgroundColor: "#ff998d",
                          padding: "2px 5px",
                        }}
                      >
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>Revenue = </span>
                    <span
                      style={{
                        backgroundColor: "#ffa6ff",
                        padding: "5px 10px",
                      }}
                    >
                      ${calculateTotalRevenue()}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "10px" }}>
                      Total Expense ={" "}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#ff998d",
                        padding: "5px 10px",
                      }}
                    >
                      ${calculateTotalExpenses()}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Financial Details Table - Third */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Income Statement</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="statement-table">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Revenue</strong>
                        </td>
                        <td></td>
                      </tr>
                      {Object.entries(revenues).map(([purpose, amount]) => (
                        <tr key={`revenue-${purpose}`}>
                          <td>{purpose}</td>
                          <td style={{ backgroundColor: "#fff" }}>
                            ${amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>
                          <strong>Total Revenue</strong>
                        </td>
                        <td
                          style={{
                            backgroundColor: "#ffa6ff",
                            fontWeight: "bold",
                          }}
                        >
                          ${calculateTotalRevenue()}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Expenses</strong>
                        </td>
                        <td></td>
                      </tr>
                      {Object.entries(expenses).map(([purpose, amount]) => (
                        <tr key={`expense-${purpose}`}>
                          <td>{purpose}</td>
                          <td style={{ backgroundColor: "#fff" }}>
                            ${amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>
                          <strong>Total Expenses</strong>
                        </td>
                        <td style={{ backgroundColor: "#ff998d" }}>
                          ${calculateTotalExpenses()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {/* Balance Sheet Section - Fourth */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Balance Sheet</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="statement-table">
                  <table style={{ width: "100%" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "40%" }}>
                          <strong>Asset</strong>
                        </td>
                        <td style={{ width: "30%", textAlign: "right" }}>
                          <strong>Amount</strong>
                        </td>
                        <td style={{ width: "30%", textAlign: "right" }}>
                          <strong>Amount</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Cash</td>
                        <td
                          style={{
                            backgroundColor: "#fffd9d",
                            textAlign: "right",
                          }}
                        >
                          ${totalCashOnHand}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Inventory</td>
                        <td
                          style={{
                            backgroundColor: "#fffd9d",
                            textAlign: "right",
                          }}
                        >
                          ${totalInventory}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Liability</strong>
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Payable </td>
                        <td></td>
                        <td
                          style={{
                            backgroundColor: "#ff998d",
                            textAlign: "right",
                          }}
                        >
                          ${calculateTotalExpenses()}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Equity</strong>
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Retained earnings / Net income</td>
                        <td></td>
                        <td
                          style={{
                            backgroundColor: "#ffa6ff",
                            textAlign: "right",
                          }}
                        >
                          $
                          {(
                            parseFloat(calculateTotalRevenue()) -
                            parseFloat(calculateTotalExpenses())
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Total</strong>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          $
                          {(
                            parseFloat(calculateTotalRevenue()) +
                            items
                              .filter(
                                (item) => item.transactionType === "Asset"
                              )
                              .reduce(
                                (sum, item) =>
                                  sum + parseFloat(item.transactionAmount),
                                0
                              )
                          ).toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          $
                          {(
                            parseFloat(calculateTotalRevenue()) +
                            items
                              .filter(
                                (item) => item.transactionType === "Asset"
                              )
                              .reduce(
                                (sum, item) =>
                                  sum + parseFloat(item.transactionAmount),
                                0
                              )
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal
          isOpen={showDeleteConfirmation}
          toggle={() => setShowDeleteConfirmation(false)}
        >
          <ModalHeader toggle={() => setShowDeleteConfirmation(false)}>
            Confirm Delete
          </ModalHeader>
          <ModalBody>
            Are you sure you want to delete all records? This action cannot be
            undone.
            <div className="modal-footer">
              <Button
                color="secondary"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </Button>
              <Button color="danger" onClick={confirmDelete}>
                Delete All
              </Button>
            </div>
          </ModalBody>
        </Modal>

        <Modal
          isOpen={showAddTransaction}
          toggle={() => {
            resetForm();
            setShowAddTransaction(false);
          }}
        >
          <ModalHeader
            toggle={() => {
              resetForm();
              setShowAddTransaction(false);
            }}
          >
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Type:</Label>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  color={
                    transactionType === "receive" ? "primary" : "secondary"
                  }
                  onClick={() => {
                    setTransactionType("receive");
                    setPaymentMode(null);
                  }}
                >
                  Receive Cash
                </Button>
                <Button
                  color={transactionType === "pay" ? "primary" : "secondary"}
                  onClick={() => {
                    setTransactionType("pay");
                    setPaymentMode(null);
                  }}
                >
                  Pay Cash
                </Button>
                <Button
                  color={
                    transactionType === "Payable" ? "primary" : "secondary"
                  }
                  onClick={() => {
                    setTransactionType("Payable");
                    setPaymentMode(null);
                  }}
                >
                  Haven't Yet Paid
                </Button>
              </div>
            </FormGroup>

            {/* Show action buttons for Pay Cash */}
            {transactionType === "pay" && (
              <FormGroup>
                <Label>Select Action:</Label>
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
                >
                  <Button
                    color="primary"
                    onClick={() => {
                      setsubType("Recorded");
                      setPaymentMode("recorded");
                    }}
                  >
                    Recorded Earlier as Payable
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setsubType("Expense");
                      setPaymentMode("new");
                    }}
                  >
                    New Expense
                  </Button>
                  <Button
                    color="warning"
                    onClick={() => {
                      setsubType("New_Item");
                      setPaymentMode("boughtItem");
                    }}
                  >
                    Bought a New Item
                  </Button>
                </div>
              </FormGroup>
            )}

            {/* Show dropdown for recorded payment mode under Pay Cash */}
            {transactionType === "pay" && paymentMode === "recorded" && (
              <>
                <FormGroup>
                  <Label>Select Unpaid Transaction:</Label>
                  <Input
                    type="select"
                    value={
                      selectedUnpaidTransaction
                        ? selectedUnpaidTransaction.id
                        : ""
                    }
                    onChange={(e) => {
                      const selected = unpaidTransactions.find(
                        (t) =>
                          t.id ===
                          (e.target.value === "outstanding-debt"
                            ? e.target.value
                            : parseInt(e.target.value))
                      );
                      setSelectedUnpaidTransaction(selected);
                    }}
                  >
                    <option value="">Select transaction</option>
                    {unpaidTransactions
                      .filter((t) => t.status !== "Paid")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.transactionPurpose} - ${t.transactionAmount}
                        </option>
                      ))}
                  </Input>
                </FormGroup>
                {/* <FormGroup>
                  <Label>Receipt:</Label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Button
                      color="info"
                      onClick={() => fileInputRef.current.click()}
                      style={{ marginBottom: "0" }}
                    >
                      {receipt ? "Change Receipt" : "Upload Receipt"}
                    </Button>
                    {receipt && (
                      <span style={{ color: "green" }}>✓ {receipt.name}</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    innerRef={fileInputRef}
                    onChange={handleReceiptUpload}
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                  />
                </FormGroup> */}
                <Button
                  color="success"
                  onClick={() =>
                    handleUpdateTransaction(selectedUnpaidTransaction)
                  }
                  disabled={!selectedUnpaidTransaction || isUpdatingTransaction}
                >
                  {isUpdatingTransaction ? (
                    <Spinner size="sm" />
                  ) : (
                    "Update to Paid"
                  )}
                </Button>
              </>
            )}

            {transactionType === "pay" && paymentMode === "boughtItem" && (
              <>
                <FormGroup>
                  <Label>Item Description:</Label>
                  <Input
                    type="select"
                    value={isManual}
                    onChange={(e) => setIsManual(e.target.value)}
                  >
                    <option value="">Select Option</option>
                    <option value="manual">Enter Manually</option>
                  </Input>

                  {/* Show text input when "Enter Manually" is selected */}
                  {isManual == "manual" && (
                    <Input
                      type="text"
                      placeholder="Enter item description"
                      value={manualPurpose === "manual" ? "" : manualPurpose}
                      onChange={(e) => setManualPurpose(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Amount ($):</Label>
                  <Input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </FormGroup>
                {/* <FormGroup>
                  <Label>Receipt:</Label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Button
                      color="info"
                      onClick={() => fileInputRef.current.click()}
                      style={{ marginBottom: "0" }}
                    >
                      {receipt ? "Change Receipt" : "Upload Receipt"}
                    </Button>
                    {receipt && (
                      <span style={{ color: "green" }}>✓ {receipt.name}</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    innerRef={fileInputRef}
                    onChange={handleReceiptUpload}
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                  />
                </FormGroup> */}
                <Button
                  color="success"
                  onClick={handleAddTransaction}
                  disabled={isAddingTransaction}
                >
                  {isAddingTransaction ? <Spinner size="sm" /> : "Save"}
                </Button>
              </>
            )}

            {/* Show regular form fields for other cases */}
            {(transactionType === "receive" ||
              (transactionType === "pay" && paymentMode === "new") ||
              transactionType === "Payable") && (
              <>
                <FormGroup>
                  <Label>Purpose:</Label>
                  <Input
                    type="select"
                    value={transactionPurpose}
                    onChange={(e) => setTransactionPurpose(e.target.value)}
                  >
                    <option value="">Select purpose</option>
                    {transactionType === "receive" && (
                      <>
                        <option value="Freight Income">Freight Income</option>
                        <option value="Lease Income">Lease Income</option>
                        <option value="Fuel Surcharge Revenue">
                          Fuel Surcharge Revenue
                        </option>
                        <option value="manual">Enter Manually</option>
                      </>
                    )}
                    {transactionType === "pay" && paymentMode === "new" && (
                      <>
                        <option value="Fuel Expense">Fuel Expense</option>
                        <option value="Truck Repairs and Maintenance">
                          Truck Repairs and Maintenance
                        </option>
                        <option value="Driver Salaries/Wages">
                          Driver Salaries/Wages
                        </option>
                        <option value="Insurance Premiums">
                          Insurance Premiums
                        </option>
                        <option value="Toll Charges">Toll Charges</option>
                        <option value="Loan Payment">Loan Payment</option>
                        <option value="Accounts Payable">
                          Accounts Payable
                        </option>
                        <option value="manual">Enter Manually</option>
                      </>
                    )}
                    {transactionType === "Payable" && (
                      <>
                        <option value="PPMOTS">
                          Provider Payments (Expense) / Money Owed to Suppliers
                          (Expense)
                        </option>
                        <option value="FC">Freight Costs (Expense)</option>
                        <option value="Wages">Wages (Expense)</option>
                        <option value="Utilities">Utilities (Expense)</option>
                        <option value="Taxes">Taxes (Expense)</option>
                        <option value="Rent">Rent (Expense)</option>
                        <option value="Insurance">Insurance (Expense)</option>
                        <option value="Other">Other (Expense)</option>
                      </>
                    )}
                  </Input>
                  {transactionPurpose === "manual" && (
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder="Enter purpose manually"
                        value={manualPurpose}
                        onChange={(e) => {
                          setManualPurpose(e.target.value);
                          setFormErrors({ ...formErrors, manualPurpose: "" });
                        }}
                        style={{ marginTop: "10px" }}
                        invalid={!!formErrors.manualPurpose}
                      />
                      {formErrors.manualPurpose && (
                        <div className="text-danger">
                          {formErrors.manualPurpose}
                        </div>
                      )}
                    </FormGroup>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label>Amount ($):</Label>
                  <Input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </FormGroup>
                {transactionType === "pay" && paymentMode === "new" && (
                  <FormGroup>
                    {/* <Label>Receipt:</Label> */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {/* <Button
                        color="info"
                        onClick={() => fileInputRef.current.click()}
                        style={{ marginBottom: "0" }}
                      >
                        {receipt ? "Change Receipt" : "Upload Receipt"}
                      </Button> */}
                      {receipt && (
                        <span style={{ color: "green" }}>✓ {receipt.name}</span>
                      )}
                    </div>
                    <Input
                      type="file"
                      innerRef={fileInputRef}
                      onChange={handleReceiptUpload}
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                    />
                  </FormGroup>
                )}
                <Button
                  color="success"
                  onClick={handleAddTransaction}
                  disabled={isAddingTransaction}
                >
                  {isAddingTransaction ? <Spinner size="sm" /> : "Save"}
                </Button>
              </>
            )}
          </ModalBody>
        </Modal>
      </div>
    </>
  );
};

export default MesobFinancial2;
