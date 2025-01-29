import React, { useState, useEffect } from "react";
import "../assets/css/IncomeStatement.css";

const IncomeStatement = ({ items = [] }) => {
  const [revenues, setRevenues] = useState({});
  const [expenses, setExpenses] = useState({});
  const [accountsPayable, setAccountsPayable] = useState({});

  useEffect(() => {
    if (items && Array.isArray(items) && items.length > 0) {
      calculateFinancials(items);
    } else {
      resetState();
    }
  }, [items]);

  const resetState = () => {
    setRevenues({});
    setExpenses({});
    setAccountsPayable({});
  };

  // In IncomeStatement.js, update the calculateFinancials function:
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
        transaction.transactionType === "NotYetPaid"
      ) {
        const purpose = transaction.transactionPurpose;
        newExpenses[purpose] = (newExpenses[purpose] || 0) + amount;
        if (transaction.transactionType === "NotYetPaid") {
          newAccountsPayable[purpose] =
            (newAccountsPayable[purpose] || 0) + amount;
        }
      }
    });

    setRevenues(newRevenues);
    setExpenses(newExpenses);
    setAccountsPayable(newAccountsPayable);
  };

  // In BalanceSheet.js, update the calculation functions:
  const calculateTotalCash = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return "0.00";

    let cash = 0;
    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        cash += amount;
      } else if (transaction.transactionType === "Pay") {
        cash -= amount;
      }
      // Do not subtract NotYetPaid transactions from cash
    });
    return cash.toFixed(2);
  };

  const calculateNetIncome = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return "0.00";

    let revenue = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        revenue += amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "NotYetPaid"
      ) {
        expenses += amount; // Include both paid and unpaid expenses
      }
    });

    return (revenue - expenses).toFixed(2);
  };

  const calculateTotalCashOnHand = () => {
    return Object.values(revenues)
      .reduce((sum, amount) => sum + amount, 0)
      .toFixed(2);
  };

  const calculateTotalPayable = () => {
    return Object.values(accountsPayable)
      .reduce((sum, amount) => sum + amount, 0)
      .toFixed(2);
  };

  const calculateTotalRevenue = () => {
    return Object.values(revenues)
      .reduce((sum, amount) => sum + amount, 0)
      .toFixed(2);
  };

  const calculateTotalExpenses = () => {
    return (
      Object.values(expenses).reduce((sum, amount) => sum + amount, 0) +
      Object.values(accountsPayable).reduce((sum, amount) => sum + amount, 0)
    ).toFixed(2);
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="income-statement">
        <div style={{ padding: "20px" }}>
          <p>No data available for Income Statement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="income-statement">
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ marginRight: "10px" }}>Total Cash on hand = </span>
          <span style={{ backgroundColor: "#fffd9d", padding: "5px 10px" }}>
            ${calculateTotalCashOnHand()}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <span style={{ marginRight: "10px" }}>
              Total Payable (Unpaid) ={" "}
            </span>
            <span style={{ backgroundColor: "#ff998d", padding: "5px 10px" }}>
              ${calculateTotalPayable()}
            </span>
          </div>
          {Object.entries(accountsPayable).map(([purpose, amount]) => (
            <div key={purpose} style={{ marginLeft: "20px", fontSize: "12px" }}>
              <span>{purpose} = </span>
              <span
                style={{
                  backgroundColor: "#ff998d",
                  padding: "2px 5px",
                  color: "white",
                }}
              >
                ${amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ marginRight: "10px" }}>Revenue = </span>
          <span style={{ backgroundColor: "#ffa6ff", padding: "5px 10px" }}>
            ${calculateTotalRevenue()}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ marginRight: "10px" }}>Total Expense = </span>
          <span style={{ backgroundColor: "#ff998d", padding: "5px 10px" }}>
            ${calculateTotalExpenses()}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "10px" }}>Net Income = </span>
          <span style={{ backgroundColor: "#ffa6ff", padding: "5px 10px" }}>
            $
            {(
              parseFloat(calculateTotalRevenue()) -
              parseFloat(calculateTotalExpenses())
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
