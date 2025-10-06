import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Table,
  Spinner,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import IncomeStatement from "components/IncomeStatement";
import BalanceSheet from "components/BalanceSheet";
import "react-notification-alert/dist/animate.css";

const MesobFinancial = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [manualPurpose, setManualPurpose] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const notificationAlertRef = useRef(null);

  const userId = "user123";

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      );
      const data = await response.json();
      if (response.ok) {
        updateJournalEntries(data);
      } else {
        throw new Error(data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      notify("tr", "Error fetching transactions", "danger");
    } finally {
      setLoading(false);
    }
  };

  const updateJournalEntries = (transactions) => {
    const entries = transactions
      .sort(
        (a, b) =>
          new Date(a.createdAt || Date.now()) -
          new Date(b.createdAt || Date.now())
      )
      .map((transaction, index) => ({
        id: transaction.id,
        userId: transaction.userId,
        date: transaction.createdAt
          ? new Date(transaction.createdAt).toISOString().split("T")[0]
          : "N/A",
        srNumber: index + 1,
        transaction: transaction.transactionPurpose,
        debit:
          transaction.transactionType === "Pay"
            ? transaction.transactionAmount
            : "-",
        credit:
          transaction.transactionType === "Receive"
            ? transaction.transactionAmount
            : "-",
        type: transaction.transactionType,
      }));
    setJournalEntries(entries);
  };

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
    if (!transactionType || !transactionPurpose || !transactionAmount) {
      notify("tr", "Please fill in all fields", "warning");
      return;
    }

    setIsAddingTransaction(true);
    const newTransaction = {
      userId,
      transactionType: transactionType === "receive" ? "Receive" : "Pay",
      transactionPurpose:
        transactionPurpose === "manual" ? manualPurpose : transactionPurpose,
      transactionAmount: parseFloat(transactionAmount),
    };

    try {
      const response = await fetch(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTransaction),
        }
      );

      if (response.ok) {
        notify("tr", "Transaction added successfully", "success");
        resetForm();
        fetchTransactions();
      } else {
        const data = await response.json();
        notify("tr", data.message || "Failed to add transaction", "danger");
      }
    } catch (error) {
      notify("tr", "Error adding transaction", "danger");
    } finally {
      setIsAddingTransaction(false);
      setShowAddTransaction(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction?.id) {
      notify("tr", "Transaction ID is required", "warning");
      return;
    }

    setIsUpdatingTransaction(true);
    const updatedTransaction = {
      userId: editingTransaction.userId,
      id: editingTransaction.id,
      transactionType: transactionType === "receive" ? "Receive" : "Pay",
      transactionPurpose:
        transactionPurpose === "manual" ? manualPurpose : transactionPurpose,
      transactionAmount: parseFloat(transactionAmount),
      createdAt: editingTransaction.createdAt || new Date().toISOString(),
    };

    try {
      const response = await fetch(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${editingTransaction.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTransaction),
        }
      );

      if (response.ok) {
        notify("tr", "Transaction updated successfully", "success");
        resetForm();
        fetchTransactions();
      } else {
        const data = await response.json();
        notify("tr", data.message || "Failed to update transaction", "danger");
      }
    } catch (error) {
      notify("tr", "Error updating transaction", "danger");
    } finally {
      setIsUpdatingTransaction(false);
      setShowAddTransaction(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    setIsDeletingTransaction(true);
    try {
      const response = await fetch(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transactionId}`,
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

  const resetForm = () => {
    setTransactionType("");
    setTransactionPurpose("");
    setTransactionAmount("");
    setManualPurpose("");
    setEditingTransaction(null);
  };

  return (
    <>
      <Helmet>
        <title>Mesob Financial - Mesob Store</title>
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

      <div className="content">
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
                  <Button
                    color="primary"
                    onClick={() => setShowAddTransaction(true)}
                  // disabled={userRole === 1}
                  >
                    Add Transaction
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle tag="h4">Journal Entry</CardTitle>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                    <p>Loading transactions...</p>
                  </div>
                ) : (
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Sr. Number</th>
                        <th>Transaction</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journalEntries.map((entry, index) => (
                        <tr key={index}>
                          <td>{entry.date}</td>
                          <td>{entry.srNumber}</td>
                          <td>{entry.transaction}</td>
                          <td>{entry.debit}</td>
                          <td>{entry.credit}</td>
                          <td>
                            <Button
                              color="warning"
                              size="sm"
                              style={{ marginRight: "10px" }}
                              onClick={() => {
                                setEditingTransaction(entry);
                                setTransactionType(
                                  entry.debit !== "-" ? "pay" : "receive"
                                );
                                setTransactionPurpose(entry.transaction);
                                setTransactionAmount(
                                  entry.debit !== "-"
                                    ? entry.debit
                                    : entry.credit
                                );
                                setShowAddTransaction(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteTransaction(entry.id)}
                              disabled={isDeletingTransaction}
                            >
                              {isDeletingTransaction ? (
                                <Spinner size="sm" />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Income Statement</CardTitle>
              </CardHeader>
              <CardBody>
                <IncomeStatement items={journalEntries} />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Balance Sheet</CardTitle>
              </CardHeader>
              <CardBody>
                <BalanceSheet items={journalEntries} />
              </CardBody>
            </Card>
          </Col>
        </Row>

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
                  onClick={() => setTransactionType("receive")}
                >
                  Receive Cash
                </Button>
                <Button
                  color={transactionType === "pay" ? "primary" : "secondary"}
                  onClick={() => setTransactionType("pay")}
                >
                  Pay Cash
                </Button>
              </div>
            </FormGroup>

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
                    <option value="Accounts Receivable Payment">
                      Accounts Receivable Payment
                    </option>
                    <option value="Other Income">Other Income</option>
                    <option value="manual">Enter Manually</option>
                  </>
                )}
                {transactionType === "pay" && (
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
                    <option value="Accounts Payable">Accounts Payable</option>
                    <option value="Other Expense">Other Expense</option>
                    <option value="manual">Enter Manually</option>
                  </>
                )}
              </Input>
              {transactionPurpose === "manual" && (
                <Input
                  type="text"
                  placeholder="Enter purpose manually"
                  value={manualPurpose}
                  onChange={(e) => setManualPurpose(e.target.value)}
                  style={{ marginTop: "10px" }}
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

            <Button
              color="success"
              onClick={
                editingTransaction
                  ? handleUpdateTransaction
                  : handleAddTransaction
              }
              disabled={isAddingTransaction || isUpdatingTransaction}
            >
              {editingTransaction ? (
                isUpdatingTransaction ? (
                  <Spinner size="sm" />
                ) : (
                  "Update"
                )
              ) : isAddingTransaction ? (
                <Spinner size="sm" />
              ) : (
                "Save"
              )}
            </Button>
          </ModalBody>
        </Modal>
      </div>
    </>
  );
};

export default MesobFinancial;
