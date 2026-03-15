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

  // Build journal rows: sale_inventory and sale_fixed are now single rows with stacked values
  const journalRows = [];
  sortedTransactions.forEach((transaction, index) => {
    const srNo = sortedTransactions.length - index;
    if (transaction.transactionType === "Receive" && transaction.subType === "sale_inventory") {
      const amt = parseFloat(transaction.transactionAmount) || 0;
      const cost = parseFloat(transaction.originalAmount) || 0;
      const name = transaction.transactionPurpose || transaction.assetName || "";
      // Single row with all values stacked
      journalRows.push({ 
        transaction, 
        srNo, 
        line: "sale_inventory", 
        saleData: { amt, cost, name },
        isFirst: true 
      });
    } else if (transaction.transactionType === "Receive" && transaction.subType === "sale_fixed") {
      const amt = parseFloat(transaction.transactionAmount) || 0;
      const cost = parseFloat(transaction.originalAmount) || 0;
      const name = transaction.transactionPurpose || transaction.assetName || "";
      const gain = Math.max(0, amt - cost);
      const loss = Math.max(0, cost - amt);
      // Single row with all values stacked
      journalRows.push({ 
        transaction, 
        srNo, 
        line: "sale_fixed", 
        saleData: { amt, cost, name, gain, loss },
        isFirst: true 
      });
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
            const { transaction, srNo, line, saleData } = row;
            const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            // Sale Inventory - single consolidated row
            if (line === "sale_inventory") {
              const { amt, cost, name } = saleData;
              const rowStyle = { height: "32px", display: "flex", alignItems: "center", marginBottom: "4px" };
              return (
                <tr key={`${transaction.id || idx}-sale-inv`}>
                  <td style={{ color: "#ffffff", verticalAlign: "top", paddingTop: "8px" }}>{formatDate(transaction.createdAt)}</td>
                  <td style={{ color: "#ffffff", verticalAlign: "top", paddingTop: "8px" }}>{srNo}</td>
                  <td style={{ color: "#ffffff", verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ ...rowStyle, fontWeight: "bold" }}>{t('financialReport.receive')}</div>
                    <div style={{ ...rowStyle, fontSize: "13px", color: "#aaa" }}>{t('financialReport.expense')} ({t('financialReport.cogs')})</div>
                    <div style={{ ...rowStyle, fontSize: "13px", color: "#aaa" }}>{t('financialReport.revenue')}</div>
                    <div style={{ ...rowStyle, fontSize: "13px", color: "#aaa", marginBottom: 0 }}>{t('financialReport.inventory')} ({name})</div>
                  </td>
                  <td className="debit" style={{ verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ ...rowStyle, justifyContent: "center" }}><span style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(amt)}</span></div>
                    <div style={{ ...rowStyle, justifyContent: "center" }}><span style={{ backgroundColor: "#a7565d", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(cost)}</span></div>
                    <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px" }}>-</div>
                    <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px", marginBottom: 0 }}>-</div>
                  </td>
                  <td className="credit" style={{ verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px" }}>-</div>
                    <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px" }}>-</div>
                    <div style={{ ...rowStyle, justifyContent: "center" }}><span style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(amt)}</span></div>
                    <div style={{ ...rowStyle, justifyContent: "center", marginBottom: 0 }}><span style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(cost)}</span></div>
                  </td>
                  <td style={{ verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <BsTrashFill className="delete-btn" onClick={() => isFeatureEnabled() && handleDelete(transaction)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#e10d05" : "#ccc", opacity: isFeatureEnabled() ? 1 : 0.5 }} />
                      {transaction.receiptUrl && <BsReceipt className="receipt-btn" onClick={() => isFeatureEnabled() && handleReceiptClick(transaction.receiptUrl)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#007bff" : "#ccc" }} />}
                    </div>
                  </td>
                </tr>
              );
            }
            
            // Sale Fixed Asset - single consolidated row
            if (line === "sale_fixed") {
              const { amt, cost, name, gain, loss } = saleData;
              const rowStyle = { height: "32px", display: "flex", alignItems: "center", marginBottom: "4px" };
              return (
                <tr key={`${transaction.id || idx}-sale-fixed`}>
                  <td style={{ color: "#ffffff", verticalAlign: "top", paddingTop: "8px" }}>{formatDate(transaction.createdAt)}</td>
                  <td style={{ color: "#ffffff", verticalAlign: "top", paddingTop: "8px" }}>{srNo}</td>
                  <td style={{ color: "#ffffff", verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ ...rowStyle, fontWeight: "bold" }}>{t('financialReport.receive')}</div>
                    <div style={{ ...rowStyle, fontSize: "13px", color: "#aaa" }}>{name}</div>
                    {gain > 0 && <div style={{ ...rowStyle, fontSize: "13px", color: "#aaa", marginBottom: 0 }}>{t('financialReport.gainOnSale')}</div>}
                    {loss > 0 && <div style={{ ...rowStyle, fontSize: "13px", color: "#aaa", marginBottom: 0 }}>{t('financialReport.lossOnSale')}</div>}
                  </td>
                  <td className="debit" style={{ verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ ...rowStyle, justifyContent: "center" }}><span style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(amt)}</span></div>
                    <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px" }}>-</div>
                    {gain > 0 && <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px", marginBottom: 0 }}>-</div>}
                    {loss > 0 && <div style={{ ...rowStyle, justifyContent: "center", marginBottom: 0 }}><span style={{ backgroundColor: "#a7565d", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(loss)}</span></div>}
                  </td>
                  <td className="credit" style={{ verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px" }}>-</div>
                    <div style={{ ...rowStyle, justifyContent: "center" }}><span style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(cost)}</span></div>
                    {gain > 0 && <div style={{ ...rowStyle, justifyContent: "center", marginBottom: 0 }}><span style={{ backgroundColor: "#41926f", color: "#000000", fontWeight: "bold", padding: "4px 12px",   }}>${fmt(gain)}</span></div>}
                    {loss > 0 && <div style={{ ...rowStyle, justifyContent: "center", color: "#ffffff", fontSize: "14px", marginBottom: 0 }}>-</div>}
                  </td>
                  <td style={{ verticalAlign: "top", paddingTop: "8px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <BsTrashFill className="delete-btn" onClick={() => isFeatureEnabled() && handleDelete(transaction)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#e10d05" : "#ccc", opacity: isFeatureEnabled() ? 1 : 0.5 }} />
                      {transaction.receiptUrl && <BsReceipt className="receipt-btn" onClick={() => isFeatureEnabled() && handleReceiptClick(transaction.receiptUrl)} style={{ cursor: isFeatureEnabled() ? "pointer" : "not-allowed", color: isFeatureEnabled() ? "#007bff" : "#ccc" }} />}
                    </div>
                  </td>
                </tr>
              );
            }
            
            // Regular single-line transactions
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
                          {/* For Payable+New_Item (asset purchase on credit), show "Purchases of (item name)" */}
                          {transaction.transactionType === "Payable" && transaction.subType === "New_Item"
                            ? `${t('financialReport.purchasesOf')} (${transaction.assetName || transaction.transactionPurpose?.replace(/\s*\(Expense\)/gi, "") || "Item"})`
                            : transaction.transactionPurpose}
                          {/* Only add "Expense" label for regular Payable (not New_Item) and if purpose doesn't already contain it */}
                          {transaction.transactionType === "Payable" && 
                           transaction.subType !== "New_Item" && 
                           !transaction.transactionPurpose?.includes("(Expense)") ? " " + t('financialReport.expense') : ""}
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
                          $ {parseFloat(transaction.originalAmount || transaction.transactionAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          $ {parseFloat(transaction.originalAmount || transaction.transactionAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
