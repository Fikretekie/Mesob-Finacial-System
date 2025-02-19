import React from "react";
import "../assets/css/BalanceSheet.css";

const BalanceSheet = ({
  items = [],
  initialBalance = 0,
  initialvalueableItems = 0,
}) => {
  const calculateTotalCash = () => {
    let cash = initialBalance;

    items.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        cash += amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "New_Item"
      ) {
        cash -= amount;
      }
    });

    return cash.toFixed(2);
  };

  const calculateTotalInventory = () => {
    const newItemsTotal = items.reduce((sum, item) => {
      if (item.transactionType === "New_Item" && item.subType === "New_Item") {
        return sum + parseFloat(item.transactionAmount || 0);
      }
      return sum;
    }, 0);

    return (newItemsTotal + initialvalueableItems).toFixed(2);
  };

  const calculateTotalRevenue = () => {
    return items
      .filter((t) => t.transactionType === "Receive")
      .reduce((sum, t) => sum + parseFloat(t.transactionAmount || 0), 0)
      .toFixed(2);
  };

  const calculateTotalExpenses = () => {
    return items
      .filter(
        (t) => t.transactionType === "Pay" || t.transactionType === "Payable"
      )
      .reduce((sum, t) => sum + parseFloat(t.transactionAmount || 0), 0)
      .toFixed(2);
  };

  const calculateTotalPayable = () => {
    return items
      .filter((t) => t.transactionType === "Payable" && t.status !== "Paid")
      .reduce((sum, t) => sum + parseFloat(t.transactionAmount || 0), 0)
      .toFixed(2);
  };

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
              ${calculateTotalCash()}
            </td>
            <td></td>
          </tr>
          <tr>
            <td>Inventory</td>
            <td style={{ backgroundColor: "#fffd9d", textAlign: "right" }}>
              ${calculateTotalInventory()}
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
            <td style={{ backgroundColor: "#ff998d", textAlign: "right" }}>
              ${calculateTotalPayable()}
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
            <td>
              <strong>Beginning Equity</strong>
            </td>
            <td></td>
            <td>${initialBalance + initialvalueableItems}</td>
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
            <td style={{ textAlign: "right" }}>
              $
              {(
                parseFloat(calculateTotalCash()) +
                parseFloat(calculateTotalInventory())
              ).toFixed(2)}
            </td>
            <td style={{ textAlign: "right" }}>
              $
              {(
                initialBalance +
                initialvalueableItems +
                parseFloat(calculateTotalRevenue()) -
                parseFloat(calculateTotalExpenses())
              ).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BalanceSheet;
