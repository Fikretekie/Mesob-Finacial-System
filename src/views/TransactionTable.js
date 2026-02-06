import React from "react";
import { useState } from "react";
import { BsTrashFill, BsReceipt } from "react-icons/bs";
import "./TransactionTable.css";
import colors from "variables/colors";
import { useTranslation } from "react-i18next";
const TransactionTable = ({
  items = [],
  handleDelete,
  handleReceiptClick,
  disabled,
  scheduleCount,
  userSubscription,
}) => {
  const { t } = useTranslation();
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
      <table className="transaction-table">
        <thead>
          <tr>
            <th>{t('financialReport.date')}</th>
            <th>{t('financialReport.srNo')}</th>
            <th>{t('financialReport.transaction')}</th>
            <th>{t('financialReport.debit')}</th>
            <th>{t('financialReport.credit')}</th>
            <th>{t('financialReport.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction, index) => (
            <tr key={transaction.id || index}>
              {/* Date */}
              <td style={{ color: "#ffffff" }}>{formatDate(transaction.createdAt)}</td>

              {/* Serial Number */}
              <td style={{ color: "#ffffff" }}>{sortedTransactions.length - index}</td>

              {/* Transaction Purpose and Type */}
              <td style={{ color: "#ffffff" }}>
                {transaction.transactionType === "Receive" ? (
                  <>
                    {/* Transaction type first for Receive */}
                    <div style={{ fontWeight: "bold" }}>{t('financialReport.receive')}</div>
                    {/* Purpose below */}
                    <div>{transaction.transactionPurpose}</div>
                  </>
                ) : (
                  <>
                    {/* Purpose first for other cases */}
                    <div>
                      {transaction.transactionPurpose}
                     {transaction.transactionType === "Payable" ? " " 
                     + t('financialReport.expense') : ""}
                    </div>
                    {/* Transaction type below */}
                    <div style={{ fontWeight: "bold" }}>
                {transaction.transactionType === "Pay"
                  ? t('financialReport.pay')
                  : transaction.transactionType === "Payable"
                  ? t('financialReport.payable')
                  : transaction.transactionType === "New_Item"
                  ? t('financialReport.pay')
                  : transaction.transactionType}
              </div>
                  </>
                )}
              </td>

             
              {/* Debit Column */}
              <td className="debit">
                {transaction.transactionType === "Receive" && (
                  <>
                    <div className="debit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", marginBottom: "4px", boxSizing: "border-box" }}>
                      $
                      {parseFloat(transaction.transactionAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                    <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                  </>
                )}
                {transaction.transactionType === "Payable" && (
                  <>
                    <div className="debit-value" style={{ backgroundColor: "#a7565d", color: "#000000", fontWeight: "bold", padding: "4px 8px", marginBottom: "4px", boxSizing: "border-box" }}>
                      $
                      {parseFloat(transaction.originalAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                    <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                  </>
                )}
                {["Pay", "New_Item"].includes(transaction.transactionType) && (
                  <>
                    <div className="debit-value" style={{ backgroundColor: "#a7565d", color: "#000000", fontWeight: "bold", padding: "4px 8px", marginBottom: "4px", boxSizing: "border-box" }}>
                      $
                      {parseFloat(transaction.transactionAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                    <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                  </>
                )}
              </td>

              {/* Credit Column */}
              <td className="credit">
                {transaction.transactionType === "Receive" && (
                  <>
                    <div style={{ color: "#ffffff", fontSize: "14px", marginBottom: "4px" }}>-</div>
                    <div className="credit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>
                      $
                      {parseFloat(transaction.transactionAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </>
                )}
                {transaction.transactionType === "Payable" && (
                  <>
                    <div style={{ color: "#ffffff", fontSize: "14px", marginBottom: "4px" }}>-</div>
                    <div className="credit-value" style={{ backgroundColor: "#c7ae4f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>
                      $
                      {parseFloat(transaction.originalAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </>
                )}
                {["Pay", "New_Item"].includes(transaction.transactionType) && (
                  <>
                    <div style={{ color: "#ffffff", fontSize: "14px", marginBottom: "4px" }}>-</div>
                    <div className="credit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>
                      $
                      {parseFloat(transaction.transactionAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </>
                )}
              </td>
              {/* Actions */}
              <td style={{ verticalAlign: "middle" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
