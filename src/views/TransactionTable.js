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

  // Build journal rows: expand Receive sale_inventory (4 lines) and sale_fixed (3 lines) into multiple rows
  const journalRows = [];
  sortedTransactions.forEach((transaction, index) => {
    const srNo = sortedTransactions.length - index;
    if (transaction.transactionType === "Receive" && transaction.subType === "sale_inventory") {
      const amt = parseFloat(transaction.transactionAmount) || 0;
      const cost = parseFloat(transaction.originalAmount) || 0;
      const name = transaction.transactionPurpose || transaction.assetName || "";
      journalRows.push({ transaction, srNo, line: "cash_dr", label: t('financialReport.cash'), debit: amt, credit: 0, isFirst: true });
      journalRows.push({ transaction, srNo, line: "cogs_dr", label: t('financialReport.cogs'), debit: cost, credit: 0, isFirst: false });
      journalRows.push({ transaction, srNo, line: "revenue_cr", label: t('financialReport.revenue'), debit: 0, credit: amt, isFirst: false });
      journalRows.push({ transaction, srNo, line: "inventory_cr", label: `${t('financialReport.inventory')} (${name})`, debit: 0, credit: cost, isFirst: false });
    } else if (transaction.transactionType === "Receive" && transaction.subType === "sale_fixed") {
      const amt = parseFloat(transaction.transactionAmount) || 0;
      const cost = parseFloat(transaction.originalAmount) || 0;
      const name = transaction.transactionPurpose || transaction.assetName || "";
      const gain = Math.max(0, amt - cost);
      const loss = Math.max(0, cost - amt);
      journalRows.push({ transaction, srNo, line: "cash_dr", label: t('financialReport.cash'), debit: amt, credit: 0, isFirst: true });
      journalRows.push({ transaction, srNo, line: "asset_cr", label: `${name}`, debit: 0, credit: cost, isFirst: false });
      if (gain > 0) {
        journalRows.push({ transaction, srNo, line: "gain_cr", label: t('financialReport.gainOnSale'), debit: 0, credit: gain, isFirst: false });
      } else if (loss > 0) {
        journalRows.push({ transaction, srNo, line: "loss_dr", label: t('financialReport.lossOnSale'), debit: loss, credit: 0, isFirst: false });
      }
    } else {
      journalRows.push({ transaction, srNo, line: "single", label: null, debit: null, credit: null, isFirst: true });
    }
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
          {journalRows.map((row, idx) => {
            const { transaction, srNo, line, label, debit, credit, isFirst } = row;
            if (line === "single") {
              return (
                <tr key={`${transaction.id || idx}-single`}>
                  <td style={{ color: "#ffffff" }}>{formatDate(transaction.createdAt)}</td>
                  <td style={{ color: "#ffffff" }}>{srNo}</td>
                  <td style={{ color: "#ffffff" }}>
                    {transaction.transactionType === "Receive" ? (
                      <>
                        <div style={{ fontWeight: "bold" }}>{t('financialReport.receive')}</div>
                        <div>{transaction.transactionPurpose}</div>
                      </>
                    ) : (
                      <>
                        <div>
                          {transaction.transactionPurpose}
                          {transaction.transactionType === "Payable" ? " " + t('financialReport.expense') : ""}
                        </div>
                        <div style={{ fontWeight: "bold" }}>
                          {transaction.transactionType === "Pay" ? t('financialReport.pay') : transaction.transactionType === "Payable" ? t('financialReport.payable') : transaction.transactionType === "New_Item" ? t('financialReport.pay') : transaction.transactionType}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="debit">
                    {transaction.transactionType === "Receive" && (
                      <>
                        <div className="debit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", marginBottom: "4px", boxSizing: "border-box" }}>
                          $ {parseFloat(transaction.transactionAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                      </>
                    )}
                    {transaction.transactionType === "Payable" && (
                      <>
                        <div className="debit-value" style={{ backgroundColor: "#a7565d", color: "#000000", fontWeight: "bold", padding: "4px 8px", marginBottom: "4px", boxSizing: "border-box" }}>
                          $ {parseFloat(transaction.originalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                      </>
                    )}
                    {["Pay", "New_Item"].includes(transaction.transactionType) && (
                      <>
                        <div className="debit-value" style={{ backgroundColor: "#a7565d", color: "#000000", fontWeight: "bold", padding: "4px 8px", marginBottom: "4px", boxSizing: "border-box" }}>
                          $ {parseFloat(transaction.transactionAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                      </>
                    )}
                  </td>
                  <td className="credit">
                    {transaction.transactionType === "Receive" && (
                      <>
                        <div style={{ color: "#ffffff", fontSize: "14px", marginBottom: "4px" }}>-</div>
                        <div className="credit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>
                          $ {parseFloat(transaction.transactionAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </>
                    )}
                    {transaction.transactionType === "Payable" && (
                      <>
                        <div style={{ color: "#ffffff", fontSize: "14px", marginBottom: "4px" }}>-</div>
                        <div className="credit-value" style={{ backgroundColor: "#c7ae4f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>
                          $ {parseFloat(transaction.originalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </>
                    )}
                    {["Pay", "New_Item"].includes(transaction.transactionType) && (
                      <>
                        <div style={{ color: "#ffffff", fontSize: "14px", marginBottom: "4px" }}>-</div>
                        <div className="credit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>
                          $ {parseFloat(transaction.transactionAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </>
                    )}
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <BsTrashFill className="delete-btn" onClick={() => isFeatureEnabled() && handleDelete(transaction)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#e10d05" : "#ccc", opacity: isFeatureEnabled() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center" }} />
                      {transaction.receiptUrl && <BsReceipt className="receipt-btn" onClick={() => isFeatureEnabled() && handleReceiptClick(transaction.receiptUrl)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#007bff" : "#ccc", opacity: isFeatureEnabled() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center" }} />}
                    </div>
                  </td>
                </tr>
              );
            }
            const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return (
              <tr key={`${transaction.id || "t"}-${line}-${idx}`}>
                <td style={{ color: "#ffffff" }}>{isFirst ? formatDate(transaction.createdAt) : ""}</td>
                <td style={{ color: "#ffffff" }}>{isFirst ? srNo : ""}</td>
                <td style={{ color: "#ffffff" }}>
                  {isFirst ? <><div style={{ fontWeight: "bold" }}>{t('financialReport.receive')}</div><div>{transaction.transactionPurpose}</div></> : null}
                  <div style={{ marginLeft: isFirst ? 0 : "8px" }}>{label}</div>
                </td>
                <td className="debit">
                  {debit > 0 ? (
                    <div className="debit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>${fmt(debit)}</div>
                  ) : (
                    <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                  )}
                </td>
                <td className="credit">
                  {credit > 0 ? (
                    <div className="credit-value" style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 8px", boxSizing: "border-box" }}>${fmt(credit)}</div>
                  ) : (
                    <div style={{ color: "#ffffff", fontSize: "14px" }}>-</div>
                  )}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  {isFirst ? (
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <BsTrashFill className="delete-btn" onClick={() => isFeatureEnabled() && handleDelete(transaction)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#e10d05" : "#ccc", opacity: isFeatureEnabled() ? 1 : 0.5 }} />
                      {transaction.receiptUrl && <BsReceipt className="receipt-btn" onClick={() => isFeatureEnabled() && handleReceiptClick(transaction.receiptUrl)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#007bff" : "#ccc" }} />}
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
