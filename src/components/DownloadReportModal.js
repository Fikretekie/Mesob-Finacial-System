import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
} from "reactstrap";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DownloadReportModal = ({
  isOpen,
  toggle,
  companyName,
  items,
  revenues,
  expenses,
  initialBalance,
  initialvalueableItems,
  initialoutstandingDebt,
  calculateTotalCash,
  calculateTotalRevenue,
  calculateTotalExpenses,
  calculateTotalPayable,
  calculateTotalInventory,
  searchedDates,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getDateRange = () => {
    if (searchedDates && searchedDates.from && searchedDates.to) {
      const fromDate = new Date(searchedDates.from);
      const toDate = new Date(searchedDates.to);
      return `${fromDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).toUpperCase()} – ${toDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).toUpperCase()}`;
    }
    
    // If no date range, use min and max dates from transactions
    if (items && items.length > 0) {
      const dates = items.map((item) => new Date(item.createdAt));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      return `${minDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).toUpperCase()} – ${maxDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).toUpperCase()}`;
    }
    
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).toUpperCase();
  };

  const generateVerificationId = () => {
    const now = new Date();
    const month = now.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const year = now.getFullYear();
    const companyAbbrev = (companyName || "MF").substring(0, 2).toUpperCase();
    return `${companyAbbrev}-${year}-${month}`;
  };

  const addHeader = (doc, pageWidth) => {
    // Dark header background
    doc.setFillColor(20, 30, 45);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Company name and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${companyName || "Company"} - FINANCIAL EXECUTIVE REPORT`, pageWidth / 2, 15, { align: "center" });

    // Date range
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(getDateRange(), pageWidth / 2, 27, { align: "center" });
  };

  const addFooter = (doc, pageWidth, pageHeight, pageNum, totalPages, isSecondPage = false) => {
    const footerY = pageHeight - 25;
    
    // Terms & Responsibility
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY - 5, pageWidth, 30, "F");
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & RESPONSIBILITY", 15, footerY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const termsText = "The user is fully responsible for the accuracy and completeness of information entered into the system. Mesob Financial is not responsible for inaccuracies in user-input data.";
    doc.text(termsText, 15, footerY + 6, { maxWidth: pageWidth - 30 });
    
    // Footer line
    const footerLineY = pageHeight - 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerLineY - 5, pageWidth - 15, footerLineY - 5);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    
    if (isSecondPage) {
      doc.text(`Verification ID: ${generateVerificationId()}`, 15, footerLineY);
    } else {
      doc.text("Financial Reporting Systems", 15, footerLineY);
    }
    
    doc.text(`${companyName || "Company"} | Confidential`, pageWidth / 2, footerLineY, { align: "center" });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, footerLineY, { align: "right" });
  };

  const generateDashboardPage = (doc, pageWidth, pageHeight) => {
    addHeader(doc, pageWidth);
    
    let yPos = 45;
    
    const totalCash = parseFloat(calculateTotalCash()) || 0;
    const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
    const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
    const totalPayable = parseFloat(calculateTotalPayable()) || 0;
    
    // Summary boxes
    const boxWidth = (pageWidth - 50) / 4;
    const boxHeight = 35;
    const startX = 15;
    
    const summaryData = [
      { label: "CASH ON HAND", value: totalCash, color: [65, 146, 111] },
      { label: "TOTAL REVENUE", value: totalRevenue, color: [43, 66, 125] },
      { label: "TOTAL EXPENSES", value: totalExpenses, color: [167, 86, 93] },
      { label: "TOTAL PAYABLE", value: totalPayable, color: [199, 174, 79] },
    ];
    
    summaryData.forEach((item, index) => {
      const boxX = startX + index * (boxWidth + 5);
      
      // Box background
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, "F");
      
      // Box border
      doc.setDrawColor(...item.color);
      doc.setLineWidth(0.5);
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, "S");
      
      // Label
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, boxX + boxWidth / 2, yPos + 12, { align: "center" });
      
      // Value
      doc.setTextColor(...item.color);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`$${formatCurrency(item.value)}`, boxX + boxWidth / 2, yPos + 26, { align: "center" });
    });
    
    yPos += boxHeight + 20;
    
    // Chart placeholders section
    const chartWidth = (pageWidth - 40) / 2;
    const chartHeight = 50;
    
    // Cash Flow Trend chart placeholder
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, yPos, chartWidth, chartHeight, 3, 3, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(15, yPos, chartWidth, chartHeight, 3, 3, "S");
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("CASH FLOW TREND", 15 + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    
    // Revenue Growth chart placeholder
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(25 + chartWidth, yPos, chartWidth, chartHeight, 3, 3, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25 + chartWidth, yPos, chartWidth, chartHeight, 3, 3, "S");
    doc.text("REVENUE GROWTH", 25 + chartWidth + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    
    yPos += chartHeight + 10;
    
    // Second row of charts
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, yPos, chartWidth, chartHeight, 3, 3, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(15, yPos, chartWidth, chartHeight, 3, 3, "S");
    doc.text("TOTAL PAYABLE", 15 + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(25 + chartWidth, yPos, chartWidth, chartHeight, 3, 3, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25 + chartWidth, yPos, chartWidth, chartHeight, 3, 3, "S");
    doc.text("TOTAL EXPENSES", 25 + chartWidth + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    
    yPos += chartHeight + 15;
    
    // Statement Summary section
    doc.setFillColor(43, 66, 125);
    doc.rect(15, yPos, pageWidth - 30, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT SUMMARY", 20, yPos + 6);
    
    yPos += 12;
    
    // Summary table
    const summaryTableData = [
      ["TOTAL CASH ON HAND", `$${formatCurrency(totalCash)}`],
      ["TOTAL PAYABLE (UNPAID)", `$${formatCurrency(totalPayable)}`],
      ["GROSS REVENUE", `$${formatCurrency(totalRevenue)}`],
      ["TOTAL EXPENSE", `$${formatCurrency(totalExpenses)}`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      body: summaryTableData,
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 30) * 0.6, fontStyle: "bold", textColor: [60, 60, 60] },
        1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        if (data.column.index === 1) {
          if (data.row.index === 0) data.cell.styles.textColor = [65, 146, 111];
          else if (data.row.index === 1) data.cell.styles.textColor = [199, 174, 79];
          else if (data.row.index === 2) data.cell.styles.textColor = [43, 66, 125];
          else if (data.row.index === 3) data.cell.styles.textColor = [167, 86, 93];
        }
      },
    });
    
    addFooter(doc, pageWidth, pageHeight, 1, 2, false);
  };

  const generateFinancialReportPage = (doc, pageWidth, pageHeight) => {
    doc.addPage();
    
    // Header for second page
    doc.setFillColor(20, 30, 45);
    doc.rect(0, 0, pageWidth, 25, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL AUDIT DETAIL", pageWidth / 2, 12, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("INTERNAL LEDGER | VERIFIED", pageWidth / 2, 20, { align: "center" });
    
    let yPos = 35;
    
    const totalCash = parseFloat(calculateTotalCash()) || 0;
    const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
    const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
    const totalPayable = parseFloat(calculateTotalPayable()) || 0;
    const totalInventory = parseFloat(calculateTotalInventory()) || 0;
    const netIncome = totalRevenue - totalExpenses;
    const ownerEquity = totalCash - totalPayable;
    
    // Balance Sheet Details section
    doc.setFillColor(43, 66, 125);
    doc.rect(15, yPos, pageWidth - 30, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BALANCE SHEET DETAILS", 20, yPos + 6);
    
    yPos += 12;
    
    const balanceSheetData = [
      ["Account Detail", "Current Value"],
      ["Total Assets (Cash & Cash Equivalents)", `$${formatCurrency(totalCash + totalInventory)}`],
      ["Current Liabilities (Short-Term Payables)", `($${formatCurrency(totalPayable)})`],
      ["TOTAL OWNER EQUITY", `$${formatCurrency(ownerEquity)}`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [balanceSheetData[0]],
      body: balanceSheetData.slice(1),
      theme: "striped",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 30) * 0.6 },
        1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        if (data.row.index === 2 && data.section === "body") {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 255, 230];
        }
        if (data.row.index === 1 && data.section === "body" && data.column.index === 1) {
          data.cell.styles.textColor = [167, 86, 93];
        }
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Income Statement Summary section
    doc.setFillColor(43, 66, 125);
    doc.rect(15, yPos, pageWidth - 30, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INCOME STATEMENT SUMMARY", 20, yPos + 6);
    
    yPos += 12;
    
    // Build income statement data
    const incomeStatementData = [["Category", "Amount"]];
    
    // Revenue section
    incomeStatementData.push(["Revenue", `$${formatCurrency(totalRevenue)}`]);
    
    // Add revenue breakdown
    if (revenues && Object.keys(revenues).length > 0) {
      Object.entries(revenues).forEach(([purpose, amount]) => {
        incomeStatementData.push([`    ${purpose}`, `$${formatCurrency(amount)}`]);
      });
    } else {
      incomeStatementData.push(["    Freight Revenue / Manual Sales", `$${formatCurrency(totalRevenue)}`]);
    }
    
    // Expenses section
    incomeStatementData.push(["Expenses", `($${formatCurrency(totalExpenses)})`]);
    
    // Add expense breakdown
    if (expenses && Object.keys(expenses).length > 0) {
      Object.entries(expenses).forEach(([purpose, amount]) => {
        incomeStatementData.push([`    ${purpose}`, `($${formatCurrency(amount)})`]);
      });
    }
    
    // Net Income
    incomeStatementData.push(["NET INCOME", `$${formatCurrency(netIncome)}`]);
    
    autoTable(doc, {
      startY: yPos,
      head: [incomeStatementData[0]],
      body: incomeStatementData.slice(1),
      theme: "striped",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 30) * 0.6 },
        1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        if (data.section === "body") {
          const cellText = data.cell.text[0] || "";
          if (cellText === "Revenue") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [43, 66, 125];
          } else if (cellText === "Expenses") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [167, 86, 93];
          } else if (cellText === "NET INCOME") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [230, 255, 230];
            data.cell.styles.textColor = [65, 146, 111];
          } else if (cellText.startsWith("    ")) {
            data.cell.styles.textColor = [100, 100, 100];
          }
        }
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Verified Journal Entries section
    doc.setFillColor(43, 66, 125);
    doc.rect(15, yPos, pageWidth - 30, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED JOURNAL ENTRIES", 20, yPos + 6);
    
    yPos += 12;
    
    // Filter and sort journal entries
    const filteredItems = (items || [])
      .filter((item) => item.transactionPurpose !== "Initial Cash Balance")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10); // Limit to 10 entries for space
    
    const journalData = [["Date", "Description", "Debit", "Credit"]];
    
    filteredItems.forEach((item) => {
      const debit = item.transactionType === "Receive" ? `$${formatCurrency(item.transactionAmount)}` : "-";
      const credit = item.transactionType !== "Receive" ? `$${formatCurrency(item.transactionAmount)}` : "-";
      const description = item.transactionType === "Receive" 
        ? `${item.transactionPurpose || "Income Entry"}`
        : `${item.transactionPurpose || "Expense Entry"}`;
      
      journalData.push([
        formatDate(item.createdAt),
        description,
        debit,
        credit,
      ]);
    });
    
    if (journalData.length > 1) {
      autoTable(doc, {
        startY: yPos,
        head: [journalData[0]],
        body: journalData.slice(1),
        theme: "striped",
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [60, 60, 60],
          fontStyle: "bold",
          fontSize: 8,
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: (pageWidth - 30) - 135 },
          2: { cellWidth: 45, halign: "right" },
          3: { cellWidth: 45, halign: "right" },
        },
        margin: { left: 15, right: 15 },
        didParseCell: function(data) {
          if (data.section === "body") {
            if (data.column.index === 2 && data.cell.text[0] !== "-") {
              data.cell.styles.textColor = [65, 146, 111];
            }
            if (data.column.index === 3 && data.cell.text[0] !== "-") {
              data.cell.styles.textColor = [167, 86, 93];
            }
          }
        },
      });
    }
    
    addFooter(doc, pageWidth, pageHeight, 2, 2, true);
  };

  const generatePDF = (type) => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      if (type === "dashboard" || type === "both") {
        generateDashboardPage(doc, pageWidth, pageHeight);
      }
      
      if (type === "financial" || type === "both") {
        if (type === "both") {
          generateFinancialReportPage(doc, pageWidth, pageHeight);
        } else {
          // Generate only financial report page
          // Header for financial report
          doc.setFillColor(20, 30, 45);
          doc.rect(0, 0, pageWidth, 25, "F");
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("FINANCIAL AUDIT DETAIL", pageWidth / 2, 12, { align: "center" });
          
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text("INTERNAL LEDGER | VERIFIED", pageWidth / 2, 20, { align: "center" });
          
          let yPos = 35;
          
          const totalCash = parseFloat(calculateTotalCash()) || 0;
          const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
          const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
          const totalPayable = parseFloat(calculateTotalPayable()) || 0;
          const totalInventory = parseFloat(calculateTotalInventory()) || 0;
          const netIncome = totalRevenue - totalExpenses;
          const ownerEquity = totalCash - totalPayable;
          
          // Balance Sheet Details section
          doc.setFillColor(43, 66, 125);
          doc.rect(15, yPos, pageWidth - 30, 8, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("BALANCE SHEET DETAILS", 20, yPos + 6);
          
          yPos += 12;
          
          const balanceSheetData = [
            ["Account Detail", "Current Value"],
            ["Total Assets (Cash & Cash Equivalents)", `$${formatCurrency(totalCash + totalInventory)}`],
            ["Current Liabilities (Short-Term Payables)", `($${formatCurrency(totalPayable)})`],
            ["TOTAL OWNER EQUITY", `$${formatCurrency(ownerEquity)}`],
          ];
          
          autoTable(doc, {
            startY: yPos,
            head: [balanceSheetData[0]],
            body: balanceSheetData.slice(1),
            theme: "striped",
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [60, 60, 60],
              fontStyle: "bold",
              fontSize: 9,
            },
            styles: {
              fontSize: 9,
              cellPadding: 4,
            },
            columnStyles: {
              0: { cellWidth: (pageWidth - 30) * 0.6 },
              1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
            },
            margin: { left: 15, right: 15 },
            didParseCell: function(data) {
              if (data.row.index === 2 && data.section === "body") {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.fillColor = [230, 255, 230];
              }
              if (data.row.index === 1 && data.section === "body" && data.column.index === 1) {
                data.cell.styles.textColor = [167, 86, 93];
              }
            },
          });
          
          yPos = doc.lastAutoTable.finalY + 15;
          
          // Income Statement Summary section
          doc.setFillColor(43, 66, 125);
          doc.rect(15, yPos, pageWidth - 30, 8, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("INCOME STATEMENT SUMMARY", 20, yPos + 6);
          
          yPos += 12;
          
          // Build income statement data
          const incomeStatementData = [["Category", "Amount"]];
          
          incomeStatementData.push(["Revenue", `$${formatCurrency(totalRevenue)}`]);
          
          if (revenues && Object.keys(revenues).length > 0) {
            Object.entries(revenues).forEach(([purpose, amount]) => {
              incomeStatementData.push([`    ${purpose}`, `$${formatCurrency(amount)}`]);
            });
          } else {
            incomeStatementData.push(["    Freight Revenue / Manual Sales", `$${formatCurrency(totalRevenue)}`]);
          }
          
          incomeStatementData.push(["Expenses", `($${formatCurrency(totalExpenses)})`]);
          
          if (expenses && Object.keys(expenses).length > 0) {
            Object.entries(expenses).forEach(([purpose, amount]) => {
              incomeStatementData.push([`    ${purpose}`, `($${formatCurrency(amount)})`]);
            });
          }
          
          incomeStatementData.push(["NET INCOME", `$${formatCurrency(netIncome)}`]);
          
          autoTable(doc, {
            startY: yPos,
            head: [incomeStatementData[0]],
            body: incomeStatementData.slice(1),
            theme: "striped",
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [60, 60, 60],
              fontStyle: "bold",
              fontSize: 9,
            },
            styles: {
              fontSize: 9,
              cellPadding: 3,
            },
            columnStyles: {
              0: { cellWidth: (pageWidth - 30) * 0.6 },
              1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
            },
            margin: { left: 15, right: 15 },
            didParseCell: function(data) {
              if (data.section === "body") {
                const cellText = data.cell.text[0] || "";
                if (cellText === "Revenue") {
                  data.cell.styles.fontStyle = "bold";
                  data.cell.styles.textColor = [43, 66, 125];
                } else if (cellText === "Expenses") {
                  data.cell.styles.fontStyle = "bold";
                  data.cell.styles.textColor = [167, 86, 93];
                } else if (cellText === "NET INCOME") {
                  data.cell.styles.fontStyle = "bold";
                  data.cell.styles.fillColor = [230, 255, 230];
                  data.cell.styles.textColor = [65, 146, 111];
                } else if (cellText.startsWith("    ")) {
                  data.cell.styles.textColor = [100, 100, 100];
                }
              }
            },
          });
          
          yPos = doc.lastAutoTable.finalY + 15;
          
          // Verified Journal Entries section
          doc.setFillColor(43, 66, 125);
          doc.rect(15, yPos, pageWidth - 30, 8, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("VERIFIED JOURNAL ENTRIES", 20, yPos + 6);
          
          yPos += 12;
          
          const filteredItems = (items || [])
            .filter((item) => item.transactionPurpose !== "Initial Cash Balance")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
          
          const journalData = [["Date", "Description", "Debit", "Credit"]];
          
          filteredItems.forEach((item) => {
            const debit = item.transactionType === "Receive" ? `$${formatCurrency(item.transactionAmount)}` : "-";
            const credit = item.transactionType !== "Receive" ? `$${formatCurrency(item.transactionAmount)}` : "-";
            const description = item.transactionType === "Receive" 
              ? `${item.transactionPurpose || "Income Entry"}`
              : `${item.transactionPurpose || "Expense Entry"}`;
            
            journalData.push([
              formatDate(item.createdAt),
              description,
              debit,
              credit,
            ]);
          });
          
          if (journalData.length > 1) {
            autoTable(doc, {
              startY: yPos,
              head: [journalData[0]],
              body: journalData.slice(1),
              theme: "striped",
              headStyles: {
                fillColor: [240, 240, 240],
                textColor: [60, 60, 60],
                fontStyle: "bold",
                fontSize: 8,
              },
              styles: {
                fontSize: 8,
                cellPadding: 3,
              },
              columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: (pageWidth - 30) - 135 },
                2: { cellWidth: 45, halign: "right" },
                3: { cellWidth: 45, halign: "right" },
              },
              margin: { left: 15, right: 15 },
              didParseCell: function(data) {
                if (data.section === "body") {
                  if (data.column.index === 2 && data.cell.text[0] !== "-") {
                    data.cell.styles.textColor = [65, 146, 111];
                  }
                  if (data.column.index === 3 && data.cell.text[0] !== "-") {
                    data.cell.styles.textColor = [167, 86, 93];
                  }
                }
              },
            });
          }
          
          addFooter(doc, pageWidth, pageHeight, 1, 1, true);
        }
      }
      
      // Generate filename
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `${(companyName || "Financial").replace(/\s+/g, "_")}_Report_${dateStr}.pdf`;
      
      doc.save(filename);
      toggle();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} style={{ backgroundColor: "#1a273a", color: "#ffffff", borderBottom: "1px solid #3a4555" }}>
        Download Report
      </ModalHeader>
      <ModalBody style={{ backgroundColor: "#1a273a", padding: "25px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Button
            color="primary"
            onClick={() => generatePDF("financial")}
            disabled={isGenerating}
            style={{
              backgroundColor: "#2b427d",
              borderColor: "#2b427d",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "6px",
            }}
          >
            {isGenerating ? <Spinner size="sm" /> : "Download Financial Report"}
          </Button>
          
          <Button
            color="info"
            onClick={() => generatePDF("dashboard")}
            disabled={isGenerating}
            style={{
              backgroundColor: "#3d83f1",
              borderColor: "#3d83f1",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "6px",
            }}
          >
            {isGenerating ? <Spinner size="sm" /> : "Download Dashboard"}
          </Button>
          
          <Button
            color="success"
            onClick={() => generatePDF("both")}
            disabled={isGenerating}
            style={{
              backgroundColor: "#11b981",
              borderColor: "#11b981",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "6px",
            }}
          >
            {isGenerating ? <Spinner size="sm" /> : "Download Both"}
          </Button>
        </div>
        
        <p style={{ 
          color: "#888", 
          fontSize: "12px", 
          marginTop: "20px", 
          textAlign: "center",
          marginBottom: "0"
        }}>
          Reports will be downloaded as PDF files
        </p>
      </ModalBody>
    </Modal>
  );
};

export default DownloadReportModal;
