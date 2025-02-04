import React from "react";
import "../assets/css/BalanceSheet.css";

const BalanceSheet = ({ items = [] }) => {
  const calculateTotalCash = () => {
    let cash = initialBalance || 0;

    if (!items || !Array.isArray(items)) {
      return "0.00";
    }

    items.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        cash += amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "Asset"
      ) {
        cash -= amount;
      }
    });

    return cash.toFixed(2);
  };

  const calculateTotalRevenue = () => {
    if (!items || !Array.isArray(items)) return "0.00";

    return items
      .filter((t) => t.transactionType === "Receive")
      .reduce((sum, t) => sum + parseFloat(t.transactionAmount), 0)
      .toFixed(2);
  };

  const calculateAccountsPayable = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return "0.00";

    let payableByType = {
      Utilities: 0,
      PPMOTS: 0,
      Taxes: 0,
      Wages: 0,
    };

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "NotYetPaid") {
        const purpose = transaction.transactionPurpose;
        if (payableByType.hasOwnProperty(purpose)) {
          payableByType[purpose] += amount;
        }
      }
    });

    const total = Object.values(payableByType).reduce(
      (sum, val) => sum + val,
      0
    );
    return {
      total: total.toFixed(2),
      byType: payableByType,
    };
  };

  const calculateTotalExpenses = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return "0.00";

    let paidExpenses = 0;
    let unpaidExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Pay") {
        paidExpenses += amount;
      } else if (transaction.transactionType === "NotYetPaid") {
        unpaidExpenses += amount;
      }
    });

    return (paidExpenses + unpaidExpenses).toFixed(2);
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="balance-sheet-container">
        <h1>Balance Sheet</h1>
        <table className="balance-sheet-table">
          <tbody>
            <tr>
              <td colSpan="3">No data available for Balance Sheet</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const totalCash = calculateTotalCash(items);
  const { total: accountsPayable } = calculateAccountsPayable(items);
  const totalExpenses = calculateTotalExpenses(items);

  return (
    <div className="balance-sheet-container">
      <h1>Balance Sheet</h1>
      <table className="balance-sheet-table">
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
            <td style={{ backgroundColor: "#fffd9d", textAlign: "right" }}>
              ${calculateTotalRevenue()}
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
            <td>Payable to seller</td>
            <td></td>
            <td style={{ backgroundColor: "#ff998d", textAlign: "right" }}>
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
            <td style={{ backgroundColor: "#ffa6ff", textAlign: "right" }}>
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
            <td style={{ textAlign: "right" }}>${calculateTotalRevenue()}</td>
            <td style={{ textAlign: "right" }}>
              $
              {(
                parseFloat(calculateTotalExpenses()) +
                (parseFloat(calculateTotalRevenue()) -
                  parseFloat(calculateTotalExpenses()))
              ).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BalanceSheet;
