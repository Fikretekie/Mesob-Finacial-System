import React from "react";
import { BsTrashFill, BsReceipt } from "react-icons/bs";
import "./TransactionTable.css";

const TransactionTable = ({ items = [], handleDelete, handleReceiptClick }) => {
  const filteredItems = items.filter(
    (item) => item.transactionPurpose !== "Initial Cash Balance"
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const sortedTransactions = [...filteredItems].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="table-container">
      <table className="transaction-table">
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
          {sortedTransactions.map((transaction, index) => (
            <tr key={transaction.id || index}>
              <td>{formatDate(transaction.createdAt)}</td>
              <td>{sortedTransactions.length - index}</td>
              <td>
                <div>
                  {transaction.transactionType === "Payable"
                    ? "Payable [Expense]"
                    : transaction.transactionType === "Receive"
                    ? "Receive [Cash]"
                    : transaction.transactionType === "Pay"
                    ? "Pay [Cash]"
                    : transaction.transactionType}
                </div>
                <div>{transaction.transactionPurpose}</div>
              </td>
              <td className="debit">
                {transaction.transactionType === "Receive" && (
                  <>
                    <div style={{ color: "white" }}>.</div>
                    <div style={{ backgroundColor: "rgb(49, 234, 49)" }}>
                      ${transaction.transactionAmount}
                    </div>
                  </>
                )}
                {transaction.transactionType === "Payable" && (
                  <>
                    <div style={{ color: "white" }}>.</div>
                    <div style={{ backgroundColor: "orange" }}>
                      ${transaction.transactionAmount}
                    </div>
                  </>
                )}
                {transaction.transactionType === "Pay" && (
                  <>
                    <div style={{ color: "white" }}>.</div>
                    <div style={{ backgroundColor: "yellow" }}>
                      ${transaction.transactionAmount}
                    </div>
                  </>
                )}
              </td>
              <td className="credit">
                {transaction.transactionType === "Receive" && (
                  <>
                    <div style={{ backgroundColor: "rgb(49, 234, 49)" }}>
                      ${transaction.transactionAmount}
                    </div>
                    <div style={{ color: "white" }}>.</div>
                  </>
                )}
                {(transaction.transactionType === "Pay" ||
                  transaction.transactionType === "Payable") && (
                  <>
                    <div style={{ backgroundColor: "yellow" }}>
                      ${transaction.transactionAmount}
                    </div>
                    <div style={{ color: "white" }}>.</div>
                  </>
                )}
              </td>
              <td>
                <div style={{ display: "flex", gap: "10px" }}>
                  <BsTrashFill
                    className="delete-btn"
                    onClick={() => handleDelete(transaction.id)}
                    style={{ cursor: "pointer", color: "#e10d05" }}
                  />
                  {transaction.transactionType === "Pay" &&
                    (transaction.subType === "Recorded" ||
                      transaction.subType === "Expense" ||
                      transaction.subType === "New_Item") &&
                    transaction.receiptUrl && (
                      <BsReceipt
                        className="receipt-btn"
                        onClick={() =>
                          handleReceiptClick(transaction.receiptUrl)
                        }
                        style={{ cursor: "pointer", color: "#007bff" }}
                      />
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
