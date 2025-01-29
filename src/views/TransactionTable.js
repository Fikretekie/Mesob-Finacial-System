import React from "react";
import { BsTrashFill } from "react-icons/bs";
import "./TransactionTable.css";

const TransactionTable = ({
  items = [],
  selectedTimeRange,
  handleDelete,
  handleAddExpense,
}) => {
  // Filter out initial balance transaction
  const filteredItems = items.filter(
    (item) => item.transactionPurpose !== "Initial Cash Balance"
  );

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
            <tr
              key={transaction.id || index}
              className={transaction.type === 1 ? "expense-row" : ""}
            >
              <td>{transaction.createdAt}</td>
              <td>{sortedTransactions.length - index}</td>
              <td>
                <div>
                  {transaction.transactionType}
                  {" [Cash]"}
                </div>
                <div>{transaction.transactionPurpose}</div>
              </td>
              <td className="debit">
                {transaction.transactionType.toLowerCase() === "receive" ? (
                  <div style={{ backgroundColor: "rgb(49, 234, 49)" }}>
                    {transaction.transactionAmount}$
                  </div>
                ) : (
                  transaction.transactionType === "NotYetPaid" && (
                    <div style={{ backgroundColor: "orange" }}>
                      {transaction.transactionAmount}$
                    </div>
                  )
                )}
              </td>
              <td className="credit">
                {(transaction.transactionType.toLowerCase() === "pay" ||
                  transaction.transactionType === "NotYetPaid") && (
                  <div style={{ backgroundColor: "yellow" }}>
                    {transaction.transactionAmount}$
                  </div>
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
