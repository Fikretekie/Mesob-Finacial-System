import React from "react";
import { useState } from "react";
import { BsTrashFill, BsReceipt } from "react-icons/bs";
import "./TransactionTable.css";
import colors from "variables/colors";

const TransactionTable = ({
  items = [],
  handleDelete,
  handleReceiptClick,
  disabled,
  scheduleCount,
  userSubscription,
}) => {
  const isFeatureEnabled = () => {
    return userSubscription || scheduleCount < 4;
  };
  const filteredItems = items.filter(
    (item) => item.transactionPurpose !== "Initial Cash Balance"
  );
  const [trialEndDate, setTrialEndDate] = useState(null);
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
  const isTrialActive = () => {
    return new Date() < trialEndDate && scheduleCount < 4;
  };
  return (
    <div className="table-container">
      <table className="transaction-table" >
        <thead >
          <tr>
            <th>Date</th>
            <th>Sr. No</th>
            <th>Transaction</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction, index) => (
            <tr key={transaction.id || index}>
              {/* Date */}
              <td>{formatDate(transaction.createdAt)}</td>

              {/* Serial Number */}
              <td>{sortedTransactions.length - index}</td>

              {/* Transaction Purpose and Type */}
              <td>
                {transaction.transactionType === "Receive" ? (
                  <>
                    {/* Transaction type first for Receive */}
                    <div style={{ fontWeight: "bold" }}>Receive [Cash]</div>
                    {/* Purpose below */}
                    <div>{transaction.transactionPurpose}</div>
                  </>
                ) : (
                  <>
                    {/* Purpose first for other cases */}
                    <div>
                      {transaction.transactionPurpose}
                      {transaction.transactionType === "Payable"
                        ? " [Expense]"
                        : ""}
                    </div>
                    {/* Transaction type below */}
                    <div style={{ fontWeight: "bold" }}>
                      {transaction.transactionType === "Pay"
                        ? "Pay [Cash]"
                        : transaction.transactionType === "Payable"
                          ? "Payable "
                          : transaction.transactionType === "New_Item"
                            ? "Pay [Cash]"
                            : transaction.transactionType}
                    </div>
                  </>
                )}
              </td>

              {/* Debit Column */}
              <td className="debit" >
                {transaction.transactionType === "Receive" && (
                  <>
                    <div style={{ backgroundColor: colors.cash }}>
                      ${transaction.transactionAmount}
                    </div>
                    <div style={{ color: "white" }}>.</div>
                  </>
                )}
                {transaction.transactionType === "Payable" && (
                  <>
                    <div style={{ backgroundColor: colors.expense }}>
                      ${transaction.originalAmount}
                    </div>
                    <div style={{ color: "white" }}>-</div>
                  </>
                )}
                {["Pay", "New_Item"].includes(transaction.transactionType) && (
                  <>
                    <div style={{ backgroundColor: colors.expense }}>
                      ${transaction.transactionAmount}
                    </div>
                    <div style={{ color: "white" }}>.</div>
                  </>
                )}
              </td>

              {/* Credit Column */}
              <td className="credit">
                {transaction.transactionType === "Receive" && (
                  <>
                    <div style={{ color: "white" }}>.</div>
                    <div style={{ backgroundColor: colors.revenue }}>
                      ${transaction.transactionAmount}
                    </div>
                  </>
                )}
                {transaction.transactionType === "Payable" && (
                  <>
                    <div style={{ color: "white" }}>.</div>
                    <div style={{ backgroundColor: colors.payable }}>
                      ${transaction.originalAmount}
                    </div>
                  </>
                )}
                {["Pay", "New_Item"].includes(transaction.transactionType) && (
                  <>
                    <div style={{ color: "white" }}>.</div>
                    <div style={{ backgroundColor: colors.cash }}>
                      ${transaction.transactionAmount}
                    </div>
                  </>
                )}
              </td>

              {/* Actions */}
              <td>
                <div style={{ display: "flex", gap: "10px" }}>
                  {/* Delete Button */}
                  <BsTrashFill
                    className="delete-btn"
                    onClick={() =>
                      isFeatureEnabled() && handleDelete(transaction)
                    }
                    style={{
                      cursor: isFeatureEnabled() ? "pointer" : "not-allowed",
                      color: isFeatureEnabled() ? "#e10d05" : "#ccc",
                      opacity: isFeatureEnabled() ? 1 : 0.5,
                    }}
                  />

                  {/* Receipt Button */}
                  {transaction.receiptUrl && (
                    <BsReceipt
                      className="receipt-btn"
                      onClick={() =>
                        isFeatureEnabled() &&
                        handleReceiptClick(transaction.receiptUrl)
                      }
                      style={{
                        cursor: isFeatureEnabled() ? "pointer" : "not-allowed",
                        color: isFeatureEnabled() ? "#007bff" : "#ccc",
                        opacity: isFeatureEnabled() ? 1 : 0.5,
                      }}
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
