import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
} from "reactstrap";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from 'html2canvas';
import ReactApexChart from "react-apexcharts";

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
  const [cashOnHandOptions, setCashOnHandOptions] = useState(null);
  const [revenueOptions, setRevenueOptions] = useState(null);
  const [payableOptions, setPayableOptions] = useState(null);
  const [expensesOptions, setExpensesOptions] = useState(null);

  useEffect(() => {
    if (!items) return;

    let cashOnHand = initialBalance;
    let revenue = 0;
    let payable = initialoutstandingDebt;
    let expenses = 0;
    let newItem = 0;

    const dailyData = {
      Initial: {
        date: "Initial Balance",
        cashOnHand: initialBalance,
        revenue: 0,
        payable: initialoutstandingDebt,
        expenses: 0,
        newItem: 0,
        paidPayables: 0,
      },
    };

    const sortedItems = [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sortedItems.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount);
      const date = new Date(transaction.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          cashOnHand: cashOnHand,
          revenue: 0,
          payable: payable,
          expenses: 0,
          newItem: 0,
          paidPayables: 0,
        };
      }

      if (transaction.transactionType === "Receive") {
        cashOnHand += amount;
        revenue += amount;
        dailyData[dateKey].revenue += amount;
      } else if (transaction.transactionType === "Pay") {
        expenses += amount;
        cashOnHand -= amount;
        dailyData[dateKey].expenses += amount;

        if (transaction.subType === "New_Item") {
          newItem += amount;
          dailyData[dateKey].newItem += amount;
        }

        if (transaction.payableId) {
          payable -= amount;
          dailyData[dateKey].paidPayables += amount;
        }
      } else if (transaction.transactionType === "Payable" && (transaction.status === "Payable" || transaction.status === "Partially Paid")) {
        payable += amount;
      }

      dailyData[dateKey].payable = payable;
      dailyData[dateKey].cashOnHand = cashOnHand;
    });

    const sortedDailyData = Object.values(dailyData).sort((a, b) => {
      if (a.date === "Initial Balance") return -1;
      if (b.date === "Initial Balance") return 1;
      return new Date(a.date) - new Date(b.date);
    });

    const formatDateLabel = (dateStr) => {
      if (dateStr === "Initial Balance") return "Initial";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getChartOptions = (title, data, labels, color) => {
      return {
        chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: false } },
        title: { text: title, align: "left", style: { fontSize: "12px", color: "#333" } },
        series: [{ name: title, data }],
        xaxis: { categories: labels, labels: { show: false } },
        yaxis: { labels: { show: false } },
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "solid", opacity: 0.3 },
        colors: [color],
        markers: { size: 0 },
        grid: { show: false },
        tooltip: { enabled: false },
        dataLabels: { enabled: false },
        legend: { show: false },
      };
    };

    setCashOnHandOptions(getChartOptions(
      "CASH FLOW TREND",
      sortedDailyData.map((item) => item.cashOnHand),
      sortedDailyData.map((item) => formatDateLabel(item.date)),
      "#41926f"
    ));

    setRevenueOptions(getChartOptions(
      "REVENUE GROWTH",
      sortedDailyData.map((item) => item.revenue),
      sortedDailyData.map((item) => formatDateLabel(item.date)),
      "#2b427d"
    ));

    setPayableOptions(getChartOptions(
      "TOTAL PAYABLE",
      sortedDailyData.map((item) => item.payable),
      sortedDailyData.map((item) => formatDateLabel(item.date)),
      "#c7ae4f"
    ));

    setExpensesOptions(getChartOptions(
      "TOTAL EXPENSES",
      sortedDailyData.map((item) => item.expenses),
      sortedDailyData.map((item) => formatDateLabel(item.date)),
      "#a7565d"
    ));

  }, [items, initialBalance, initialoutstandingDebt]);

  const captureChartAsImage = async (chartElementId) => {
    try {
      const chartElement = document.querySelector(`#${chartElementId}`);
      if (!chartElement) {
        console.warn(`Chart element #${chartElementId} not found`);
        return null;
      }

      // Longer wait to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 3000));

      const canvas = await html2canvas(chartElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: chartElement.scrollWidth,
        height: chartElement.scrollHeight,
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error capturing chart ${chartElementId}:`, error);
      return null;
    }
  };

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
    doc.setFillColor(16, 25, 38);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${companyName || "Company"} - FINANCIAL EXECUTIVE REPORT`, pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(getDateRange(), pageWidth / 2, 32, { align: "center" });
  };

  const addFooter = (doc, pageWidth, pageHeight, pageNum, totalPages, isSecondPage = false) => {
    const footerY = pageHeight - 20;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY - 10, pageWidth, 25, "F");
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & RESPONSIBILITY", 15, footerY - 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const termsText = "The user is fully responsible for the accuracy and completeness of information entered into the system. Mesob Financial is not responsible for inaccuracies in user-input data.";
    doc.text(termsText, 15, footerY, { maxWidth: pageWidth - 30 });
    
    const footerLineY = pageHeight - 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, footerLineY - 2, pageWidth - 15, footerLineY - 2);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    
    if (isSecondPage) {
      doc.text(`Verification ID: ${generateVerificationId()}`, 15, footerLineY);
    } else {
      doc.text("Financial Reporting Systems", 15, footerLineY);
    }
    
    doc.text(`${companyName || "Company"} | Confidential`, pageWidth / 2, footerLineY, { align: "center" });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, footerLineY, { align: "right" });
  };

  const generateDashboardPage = async (doc, pageWidth, pageHeight, chartImages = {}) => {
    addHeader(doc, pageWidth);
    
    let yPos = 50;
    
    const totalCash = parseFloat(calculateTotalCash().replace(/,/g, "")) || 0;
    const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
    const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
    const totalPayable = parseFloat(calculateTotalPayable()) || 0;
    
    // Summary cards - 4 boxes in one row with FIXED ALIGNMENT
    const totalWidth = pageWidth - 30;
    const gap = 5;
    const boxWidth = (totalWidth - (3 * gap)) / 4;
    const boxHeight = 35;
    const startX = 15;
    
    const summaryData = [
      { label: "CASH ON HAND", value: totalCash, color: [65, 146, 111] },
      { label: "TOTAL REVENUE", value: totalRevenue, color: [43, 66, 125] },
      { label: "TOTAL EXPENSES", value: totalExpenses, color: [167, 86, 93] },
      { label: "TOTAL PAYABLE", value: totalPayable, color: [199, 174, 79] },
    ];
    
    summaryData.forEach((item, index) => {
      const boxX = startX + index * (boxWidth + gap);
      
      // White background with rounded corners
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, "F");
      
      // FIXED: Bottom border - full width, positioned at the very bottom, edge to edge
      doc.setFillColor(...item.color);
      doc.rect(boxX, yPos + boxHeight - 2, boxWidth, 2, "F");
      
      // Very subtle outer border
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.2);
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, "S");
      
      // FIXED: Label positioning - more space from top
      doc.setTextColor(130, 130, 130);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, boxX + boxWidth / 2, yPos + 13, { align: "center" });
      
      // FIXED: Value positioning - centered vertically with proper spacing
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`$${formatCurrency(item.value)}`, boxX + boxWidth / 2, yPos + 24, { align: "center" });
    });

    yPos += boxHeight + 15;

    // Charts section
    const chartWidth = (pageWidth - 45) / 2;
    const chartHeight = 60;
    const chartGap = 10;

    const { cashFlowImg, revenueImg, payableImg, expensesImg } = chartImages;

    // Row 1: Cash Flow & Revenue
    if (cashFlowImg) {
      doc.addImage(cashFlowImg, 'PNG', 15, yPos, chartWidth, chartHeight);
    } else {
      doc.setFillColor(245, 250, 245);
      doc.roundedRect(15, yPos, chartWidth, chartHeight, 2, 2, "F");
      doc.setDrawColor(220, 230, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, yPos, chartWidth, chartHeight, 2, 2, "S");
      doc.setTextColor(150, 180, 150);
      doc.setFontSize(10);
      doc.text("CASH FLOW TREND", 15 + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    }

    if (revenueImg) {
      doc.addImage(revenueImg, 'PNG', 30 + chartWidth, yPos, chartWidth, chartHeight);
    } else {
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(30 + chartWidth, yPos, chartWidth, chartHeight, 2, 2, "F");
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.2);
      doc.roundedRect(30 + chartWidth, yPos, chartWidth, chartHeight, 2, 2, "S");
      doc.setTextColor(150, 150, 180);
      doc.setFontSize(10);
      doc.text("REVENUE GROWTH", 30 + chartWidth + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    }

    yPos += chartHeight + chartGap;

    // Row 2: Payable & Expenses
    if (payableImg) {
      doc.addImage(payableImg, 'PNG', 15, yPos, chartWidth, chartHeight);
    } else {
      doc.setFillColor(250, 245, 245);
      doc.roundedRect(15, yPos, chartWidth, chartHeight, 2, 2, "F");
      doc.setDrawColor(230, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, yPos, chartWidth, chartHeight, 2, 2, "S");
      doc.setTextColor(180, 150, 150);
      doc.setFontSize(10);
      doc.text("TOTAL PAYABLE", 15 + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    }

    if (expensesImg) {
      doc.addImage(expensesImg, 'PNG', 30 + chartWidth, yPos, chartWidth, chartHeight);
    } else {
      doc.setFillColor(250, 245, 245);
      doc.roundedRect(30 + chartWidth, yPos, chartWidth, chartHeight, 2, 2, "F");
      doc.setDrawColor(230, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(30 + chartWidth, yPos, chartWidth, chartHeight, 2, 2, "S");
      doc.setTextColor(180, 150, 150);
      doc.setFontSize(10);
      doc.text("TOTAL EXPENSES", 30 + chartWidth + chartWidth / 2, yPos + chartHeight / 2, { align: "center" });
    }
    
   yPos += chartHeight + 10;
    
    addFooter(doc, pageWidth, pageHeight, 1, 3, false);
    
    // NEW PAGE FOR STATEMENT SUMMARY
    doc.addPage();
    
    // Header for Statement Summary Page
    doc.setFillColor(16, 25, 38);
    doc.rect(0, 0, pageWidth, 25, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL SUMMARY", pageWidth / 2, 12, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(getDateRange(), pageWidth / 2, 20, { align: "center" });
    
    let summaryYPos = 40;
    
    // STATEMENT SUMMARY Section
    // Blue header bar with left accent
    doc.setFillColor(43, 66, 125);
    doc.rect(15, summaryYPos, pageWidth - 30, 8, "F");
    
    // Left accent bar
    doc.setFillColor(66, 133, 244);
    doc.rect(15, summaryYPos, 3, 8, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT SUMMARY", 23, summaryYPos + 5.5);
    
    summaryYPos += 13;
    
    // 2-column layout for summary
    const leftColX = 20;
    const rightColX = pageWidth / 2 + 10;
    const labelWidth = (pageWidth / 2) - 25;
    
    // const totalCash = parseFloat(calculateTotalCash().replace(/,/g, "")) || 0;
    // const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
    // const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
    // const totalPayable = parseFloat(calculateTotalPayable()) || 0;
    
    // Left column - Cash on Hand
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL CASH ON HAND", leftColX, summaryYPos);
    
    doc.setTextColor(65, 146, 111);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`$${formatCurrency(totalCash)}`, leftColX + labelWidth, summaryYPos, { align: "right" });
    
    // Right column - Gross Revenue
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("GROSS REVENUE", rightColX, summaryYPos);
    
    doc.setTextColor(43, 66, 125);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`$${formatCurrency(totalRevenue)}`, pageWidth - 20, summaryYPos, { align: "right" });
    
    summaryYPos += 10;
    
    // Left column - Total Payable
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL PAYABLE (UNPAID)", leftColX, summaryYPos);
    
    doc.setTextColor(199, 174, 79);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`$${formatCurrency(totalPayable)}`, leftColX + labelWidth, summaryYPos, { align: "right" });
    
    // Right column - Total Expense
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL EXPENSE", rightColX, summaryYPos);
    
    doc.setTextColor(167, 86, 93);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`$${formatCurrency(totalExpenses)}`, pageWidth - 20, summaryYPos, { align: "right" });
    
    addFooter(doc, pageWidth, pageHeight, 2, 3, false);
  };

  const generateFinancialReportPage = (doc, pageWidth, pageHeight) => {
    doc.addPage();
    
    doc.setFillColor(16, 25, 38);
    doc.rect(0, 0, pageWidth, 25, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL AUDIT DETAIL", pageWidth / 2, 12, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("INTERNAL LEDGER | VERIFIED", pageWidth / 2, 20, { align: "center" });
    
    let yPos = 35;
    
    const totalCash = parseFloat(calculateTotalCash().replace(/,/g, "")) || 0;
    const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
    const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
    const totalPayable = parseFloat(calculateTotalPayable()) || 0;
    const totalInventory = parseFloat(calculateTotalInventory()) || 0;
    const netIncome = totalRevenue - totalExpenses;
    const ownerEquity = totalCash - totalPayable;
    
    // Balance Sheet
    doc.setDrawColor(66, 133, 244);
    doc.setLineWidth(3);
    doc.line(15, yPos, 15, yPos + 8);
    
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BALANCE SHEET DETAILS", 21, yPos + 6);
    
    yPos += 10;
    
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
      theme: "plain",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: "bold",
        fontSize: 9,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 30) * 0.6 },
        1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        if (data.row.index === 2 && data.section === "body") {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [245, 245, 245];
        }
        if (data.row.index === 1 && data.section === "body" && data.column.index === 1) {
          data.cell.styles.textColor = [167, 86, 93];
        }
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Income Statement
    doc.setDrawColor(66, 133, 244);
    doc.setLineWidth(3);
    doc.line(15, yPos, 15, yPos + 8);
    
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INCOME STATEMENT SUMMARY", 21, yPos + 6);
    
    yPos += 10;
    
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
      theme: "plain",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [60, 60, 60],
        fontStyle: "bold",
        fontSize: 9,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - 30) * 0.6 },
        1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        if (data.section === "body") {
          const cellText = data.cell.text[0] || "";
          if (cellText === "Revenue" || cellText === "Expenses") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [33, 33, 33];
          } else if (cellText === "NET INCOME") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.textColor = [33, 33, 33];
          } else if (cellText.startsWith("    ")) {
            data.cell.styles.textColor = [100, 100, 100];
            data.cell.styles.font = "times";
            data.cell.styles.fontStyle = "italic";
          }
          
          if (data.column.index === 1 && cellText.startsWith("$") && 
              data.row.index > 0 && data.row.index < incomeStatementData.length - 2) {
            const categoryText = incomeStatementData[data.row.index][0];
            if (categoryText.startsWith("    ")) {
              data.cell.styles.font = "times";
              data.cell.styles.fontStyle = "italic";
            }
          }
          
          if (data.row.index === incomeStatementData.length - 2 && data.column.index === 1) {
            data.cell.styles.textColor = [65, 146, 111];
          }
        }
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page for journal entries
    if (yPos > pageHeight - 100) {
      doc.addPage();
      doc.setFillColor(16, 25, 38);
      doc.rect(0, 0, pageWidth, 25, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("FINANCIAL AUDIT DETAIL (CONTINUED)", pageWidth / 2, 12, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("INTERNAL LEDGER | VERIFIED", pageWidth / 2, 20, { align: "center" });
      
      yPos = 35;
    }
    
    // FIXED: Journal Entries with page break handling
    doc.setDrawColor(66, 133, 244);
    doc.setLineWidth(3);
    doc.line(15, yPos, 15, yPos + 8);
    
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED JOURNAL ENTRIES", 21, yPos + 6);
    
    yPos += 10;
    
    const filteredItems = (items || [])
      .filter((item) => item.transactionPurpose !== "Initial Cash Balance")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
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
      const startPage = doc.internal.getNumberOfPages();
      
      autoTable(doc, {
        startY: yPos,
        head: [journalData[0]],
        body: journalData.slice(1),
        theme: "plain",
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [60, 60, 60],
          fontStyle: "bold",
          fontSize: 8,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: (pageWidth - 30) - 125 },
          2: { cellWidth: 45, halign: "right" },
          3: { cellWidth: 45, halign: "right" },
        },
        margin: { left: 15, right: 15, bottom: 30 },
        didParseCell: function(data) {
          if (data.section === "body") {
            if (data.column.index === 2 && data.cell.text[0] !== "-") {
              data.cell.styles.textColor = [65, 146, 111];
            }
            if (data.column.index === 3 && data.cell.text[0] !== "-") {
              data.cell.styles.textColor = [199, 174, 79];
            }
          }
        }
      });
      
      // Add footers to all pages
      const endPage = doc.internal.getNumberOfPages();
const totalPages = endPage;
for (let i = startPage; i <= endPage; i++) {
  doc.setPage(i);
  addFooter(doc, pageWidth, pageHeight, i, totalPages, true);
}
    }
  };

  // const generateFinancialReportPageStandalone = (doc, pageWidth, pageHeight) => {
  //   doc.setFillColor(16, 25, 38);
  //   doc.rect(0, 0, pageWidth, 25, "F");
    
  //   doc.setTextColor(255, 255, 255);
  //   doc.setFontSize(14);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("FINANCIAL AUDIT DETAIL", pageWidth / 2, 12, { align: "center" });
    
  //   doc.setFontSize(8);
  //   doc.setFont("helvetica", "normal");
  //   doc.text("INTERNAL LEDGER | VERIFIED", pageWidth / 2, 20, { align: "center" });
    
  //   let yPos = 35;
    
  //   const totalCash = parseFloat(calculateTotalCash().replace(/,/g, "")) || 0;
  //   const totalRevenue = parseFloat(calculateTotalRevenue()) || 0;
  //   const totalExpenses = parseFloat(calculateTotalExpenses()) || 0;
  //   const totalPayable = parseFloat(calculateTotalPayable()) || 0;
  //   const totalInventory = parseFloat(calculateTotalInventory()) || 0;
  //   const netIncome = totalRevenue - totalExpenses;
  //   const ownerEquity = totalCash - totalPayable;
    
  //   doc.setDrawColor(66, 133, 244);
  //   doc.setLineWidth(3);
  //   doc.line(15, yPos, 15, yPos + 8);
    
  //   doc.setTextColor(33, 33, 33);
  //   doc.setFontSize(10);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("BALANCE SHEET DETAILS", 21, yPos + 6);
    
  //   yPos += 10;
    
  //   const balanceSheetData = [
  //     ["Account Detail", "Current Value"],
  //     ["Total Assets (Cash & Cash Equivalents)", `$${formatCurrency(totalCash + totalInventory)}`],
  //     ["Current Liabilities (Short-Term Payables)", `($${formatCurrency(totalPayable)})`],
  //     ["TOTAL OWNER EQUITY", `$${formatCurrency(ownerEquity)}`],
  //   ];
    
  //   autoTable(doc, {
  //     startY: yPos,
  //     head: [balanceSheetData[0]],
  //     body: balanceSheetData.slice(1),
  //     theme: "plain",
  //     headStyles: {
  //       fillColor: [240, 240, 240],
  //       textColor: [60, 60, 60],
  //       fontStyle: "bold",
  //       fontSize: 9,
  //       lineColor: [220, 220, 220],
  //       lineWidth: 0.1,
  //     },
  //     styles: {
  //       fontSize: 9,
  //       cellPadding: 3.5,
  //       lineColor: [220, 220, 220],
  //       lineWidth: 0.1,
  //     },
  //     columnStyles: {
  //       0: { cellWidth: (pageWidth - 30) * 0.6 },
  //       1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
  //     },
  //     margin: { left: 15, right: 15 },
  //     didParseCell: function(data) {
  //       if (data.row.index === 2 && data.section === "body") {
  //         data.cell.styles.fontStyle = "bold";
  //         data.cell.styles.fillColor = [245, 245, 245];
  //       }
  //       if (data.row.index === 1 && data.section === "body" && data.column.index === 1) {
  //         data.cell.styles.textColor = [167, 86, 93];
  //       }
  //     },
  //   });
    
  //   yPos = doc.lastAutoTable.finalY + 15;
    
  //   doc.setDrawColor(66, 133, 244);
  //   doc.setLineWidth(3);
  //   doc.line(15, yPos, 15, yPos + 8);
    
  //   doc.setTextColor(33, 33, 33);
  //   doc.setFontSize(10);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("INCOME STATEMENT SUMMARY", 21, yPos + 6);
    
  //   yPos += 10;
    
  //   const incomeStatementData = [["Category", "Amount"]];
    
  //   incomeStatementData.push(["Revenue", `$${formatCurrency(totalRevenue)}`]);
    
  //   if (revenues && Object.keys(revenues).length > 0) {
  //     Object.entries(revenues).forEach(([purpose, amount]) => {
  //       incomeStatementData.push([`    ${purpose}`, `$${formatCurrency(amount)}`]);
  //     });
  //   } else {
  //     incomeStatementData.push(["    Freight Revenue / Manual Sales", `$${formatCurrency(totalRevenue)}`]);
  //   }
    
  //   incomeStatementData.push(["Expenses", `($${formatCurrency(totalExpenses)})`]);
    
  //   if (expenses && Object.keys(expenses).length > 0) {
  //     Object.entries(expenses).forEach(([purpose, amount]) => {
  //       incomeStatementData.push([`    ${purpose}`, `($${formatCurrency(amount)})`]);
  //     });
  //   }
    
  //   incomeStatementData.push(["NET INCOME", `$${formatCurrency(netIncome)}`]);
    
  //   autoTable(doc, {
  //     startY: yPos,
  //     head: [incomeStatementData[0]],
  //     body: incomeStatementData.slice(1),
  //     theme: "plain",
  //     headStyles: {
  //       fillColor: [240, 240, 240],
  //       textColor: [60, 60, 60],
  //       fontStyle: "bold",
  //       fontSize: 9,
  //       lineColor: [220, 220, 220],
  //       lineWidth: 0.1,
  //     },
  //     styles: {
  //       fontSize: 9,
  //       cellPadding: 3,
  //       lineColor: [220, 220, 220],
  //       lineWidth: 0.1,
  //     },
  //     columnStyles: {
  //       0: { cellWidth: (pageWidth - 30) * 0.6 },
  //       1: { cellWidth: (pageWidth - 30) * 0.4, halign: "right" },
  //     },
  //     margin: { left: 15, right: 15 },
  //     didParseCell: function(data) {
  //       if (data.section === "body") {
  //         const cellText = data.cell.text[0] || "";
  //         if (cellText === "Revenue" || cellText === "Expenses") {
  //           data.cell.styles.fontStyle = "bold";
  //           data.cell.styles.textColor = [33, 33, 33];
  //         } else if (cellText === "NET INCOME") {
  //           data.cell.styles.fontStyle = "bold";
  //           data.cell.styles.fillColor = [245, 245, 245];
  //           data.cell.styles.textColor = [33, 33, 33];
  //         } else if (cellText.startsWith("    ")) {
  //           data.cell.styles.textColor = [100, 100, 100];
  //           data.cell.styles.font = "times";
  //           data.cell.styles.fontStyle = "italic";
  //         }
          
  //         if (data.column.index === 1 && cellText.startsWith("$") && 
  //             data.row.index > 0 && data.row.index < incomeStatementData.length - 2) {
  //           const categoryText = incomeStatementData[data.row.index][0];
  //           if (categoryText.startsWith("    ")) {
  //             data.cell.styles.font = "times";
  //             data.cell.styles.fontStyle = "italic";
  //           }
  //         }
          
  //         if (data.row.index === incomeStatementData.length - 2 && data.column.index === 1) {
  //           data.cell.styles.textColor = [65, 146, 111];
  //         }
  //       }
  //     },
  //   });
    
  //   yPos = doc.lastAutoTable.finalY + 15;
    
  //   doc.setDrawColor(66, 133, 244);
  //   doc.setLineWidth(3);
  //   doc.line(15, yPos, 15, yPos + 8);
    
  //   doc.setTextColor(33, 33, 33);
  //   doc.setFontSize(10);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("VERIFIED JOURNAL ENTRIES", 21, yPos + 6);
    
  //   yPos += 10;
    
  //   const filteredItems = (items || [])
  //     .filter((item) => item.transactionPurpose !== "Initial Cash Balance")
  //     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
  //   const journalData = [["Date", "Description", "Debit", "Credit"]];
    
  //   filteredItems.forEach((item) => {
  //     const debit = item.transactionType === "Receive" ? `$${formatCurrency(item.transactionAmount)}` : "-";
  //     const credit = item.transactionType !== "Receive" ? `$${formatCurrency(item.transactionAmount)}` : "-";
  //     const description = item.transactionType === "Receive" 
  //       ? `${item.transactionPurpose || "Income Entry"}`
  //       : `${item.transactionPurpose || "Expense Entry"}`;
      
  //     journalData.push([
  //       formatDate(item.createdAt),
  //       description,
  //       debit,
  //       credit,
  //     ]);
  //   });
    
  //   let currentPage = 1;
    
  //   if (journalData.length > 1) {
  //     autoTable(doc, {
  //       startY: yPos,
  //       head: [journalData[0]],
  //       body: journalData.slice(1),
  //       theme: "plain",
  //       headStyles: {
  //         fillColor: [240, 240, 240],
  //         textColor: [60, 60, 60],
  //         fontStyle: "bold",
  //         fontSize: 8,
  //         lineColor: [220, 220, 220],
  //         lineWidth: 0.1,
  //       },
  //       styles: {
  //         fontSize: 8,
  //         cellPadding: 3,
  //         lineColor: [220, 220, 220],
  //         lineWidth: 0.1,
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 35 },
  //         1: { cellWidth: (pageWidth - 30) - 125 },
  //         2: { cellWidth: 45, halign: "right" },
  //         3: { cellWidth: 45, halign: "right" },
  //       },
  //       margin: { left: 15, right: 15, bottom: 30 },
  //       didParseCell: function(data) {
  //         if (data.section === "body") {
  //           if (data.column.index === 2 && data.cell.text[0] !== "-") {
  //             data.cell.styles.textColor = [65, 146, 111];
  //           }
  //           if (data.column.index === 3 && data.cell.text[0] !== "-") {
  //             data.cell.styles.textColor = [199, 174, 79];
  //           }
  //         }
  //       },
  //       didDrawPage: function(data) {
  //         const totalPagesCount = doc.internal.getNumberOfPages();
  //         if (data.pageNumber > 1) {
  //           addFooter(doc, pageWidth, pageHeight, data.pageNumber, totalPagesCount, true);
  //         }
  //         currentPage = data.pageNumber;
  //       }
  //     });
  //   }
    
  //   // Add footer to the first page
  //   const totalPagesCount = doc.internal.getNumberOfPages();
  //   doc.setPage(1);
  //   addFooter(doc, pageWidth, pageHeight, 1, totalPagesCount, true);
  // };

  



//   const generatePDF = async (type) => {
//     setIsGenerating(true);
    
//     try {
//       console.log('Starting chart capture...');
//        let chartImages = {};
//        if (type === "dashboard" || type === "both") {
//       // FIXED: Wait longer for charts to render before capturing
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Capture charts
//       const cashFlowImg = await captureChartAsImage('cashFlowChart');
//       const revenueImg = await captureChartAsImage('revenueChart');
//       const payableImg = await captureChartAsImage('payableChart');
//       const expensesImg = await captureChartAsImage('expensesChart');
      
//       console.log('Chart capture complete:', {
//         cashFlow: !!cashFlowImg,
//         revenue: !!revenueImg,
//         payable: !!payableImg,
//         expenses: !!expensesImg
//       });
      
//       chartImages = { cashFlowImg, revenueImg, payableImg, expensesImg };
//     }
      
//       const doc = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "letter",
//       });
      
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
      
//       if (type === "dashboard" || type === "both") {
//         await generateDashboardPage(doc, pageWidth, pageHeight, chartImages);
//       }
      
//      if (type === "financial" || type === "both") {
//   if (type === "both") {
//     generateFinancialReportPage(doc, pageWidth, pageHeight);
//   } else {
//     generateFinancialReportPageStandalone(doc, pageWidth, pageHeight);
//   }
// }
      
//       const dateStr = new Date().toISOString().split("T")[0];
//       const filename = `${(companyName || "Financial").replace(/\s+/g, "_")}_Report_${dateStr}.pdf`;
      
//       doc.save(filename);
//       toggle();
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       alert("Error generating PDF. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

const generatePDF = async (type) => {
  setIsGenerating(true);

  try {
    console.log('Starting chart capture...');

    let chartImages = {};

    // Capture charts ONLY when we actually need them (dashboard or both)
    if (type === "dashboard" || type === "both") {
      // Give ApexCharts plenty of time to fully render
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Force a small reflow/repaint before capture (helps html2canvas)
      const forceRepaint = () => {
        const dummy = document.createElement('div');
        document.body.appendChild(dummy);
        document.body.removeChild(dummy);
      };
      forceRepaint();

      const cashFlowImg  = await captureChartAsImage('cashFlowChart');
      const revenueImg   = await captureChartAsImage('revenueChart');
      const payableImg   = await captureChartAsImage('payableChart');
      const expensesImg  = await captureChartAsImage('expensesChart');

      console.log('Chart capture results:', {
        cashFlow: cashFlowImg ? 'captured' : 'failed',
        revenue:  revenueImg  ? 'captured' : 'failed',
        payable:  payableImg  ? 'captured' : 'failed',
        expenses: expensesImg ? 'captured' : 'failed'
      });

      chartImages = { cashFlowImg, revenueImg, payableImg, expensesImg };
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dashboard page (with charts)
    if (type === "dashboard" || type === "both") {
      await generateDashboardPage(doc, pageWidth, pageHeight, chartImages);
    }

    // Financial detail page
    if (type === "financial" || type === "both") {
      if (type === "both") {
        generateFinancialReportPage(doc, pageWidth, pageHeight);
      } else {
        generateFinancialReportPageStandalone(doc, pageWidth, pageHeight);
      }
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `${(companyName || "Financial").replace(/\s+/g, "_")}_Report_${dateStr}.pdf`;

    doc.save(filename);
    toggle();

  } catch (error) {
    console.error("PDF generation error:", error);
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
        {cashOnHandOptions && (
          <div style={{ position: 'absolute', left: '-10000px', width: '500px', height: '300px' }}>
            <div id="cashFlowChart">
              <ReactApexChart options={cashOnHandOptions} series={cashOnHandOptions.series} type="area" height={300} width={500} />
            </div>
          </div>
        )}
        {revenueOptions && (
          <div style={{ position: 'absolute', left: '-10000px', width: '500px', height: '300px' }}>
            <div id="revenueChart">
              <ReactApexChart options={revenueOptions} series={revenueOptions.series} type="area" height={300} width={500} />
            </div>
          </div>
        )}
        {payableOptions && (
          <div style={{ position: 'absolute', left: '-10000px', width: '500px', height: '300px' }}>
            <div id="payableChart">
              <ReactApexChart options={payableOptions} series={payableOptions.series} type="area" height={300} width={500} />
            </div>
          </div>
        )}
        {expensesOptions && (
          <div style={{ position: 'absolute', left: '-10000px', width: '500px', height: '300px' }}>
            <div id="expensesChart">
              <ReactApexChart options={expensesOptions} series={expensesOptions.series} type="area" height={300} width={500} />
            </div>
          </div>
        )}
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