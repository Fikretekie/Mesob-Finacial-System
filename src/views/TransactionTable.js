import React from "react";
import { BsTrashFill } from "react-icons/bs";
import "./TransactionTable.css";

const TransactionTable = ({ items = [], handleDelete }) => {
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
            <td>Date</td>
            <td>Sr. Number</td>
            <td>Transaction</td>
            <td>Debit</td>
            <td>Credit</td>
            <td>Actions</td>
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
                  <div style={{ backgroundColor: "rgb(49, 234, 49)" }}>
                    ${transaction.transactionAmount}
                  </div>
                )}
                {transaction.transactionType === "Payable" && (
                  <div style={{ backgroundColor: "orange" }}>
                    {transaction.transactionAmount}
                  </div>
                )}

                {transaction.transactionType === "Pay" && (
                  <>
                    {transaction.subType === "New_Item" ? (
                      <>
                        <div style={{ color: "white" }}>.</div>

                        <div style={{ backgroundColor: "yellow" }}>
                          ${transaction.transactionAmount}
                        </div>
                      </>
                    ) : (
                      <div style={{ backgroundColor: "yellow" }}>
                        ${transaction.transactionAmount}
                      </div>
                    )}
                  </>
                )}
              </td>
              <td className="credit">
                {(transaction.transactionType === "Pay" ||
                  transaction.transactionType === "Payable") && (
                  <>
                    {transaction.subType === "New_Item" ? (
                      <>
                        <div style={{ backgroundColor: "yellow" }}>
                          ${transaction.transactionAmount}
                        </div>
                        <div style={{ color: "white" }}>.</div>
                      </>
                    ) : (
                      <>
                        <div style={{ backgroundColor: "yellow" }}>
                          ${transaction.transactionAmount}
                        </div>
                      </>
                    )}
                  </>
                )}
              </td>
              <td>
                <BsTrashFill
                  className="delete-btn"
                  onClick={() => handleDelete(transaction.id)}
                  style={{ cursor: "pointer", color: "#e10d05" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
