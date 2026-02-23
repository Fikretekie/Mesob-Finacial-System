import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Container,
  ModalFooter,
} from "reactstrap";
import "./mesobfinancial2.css";
import Select from "react-select";
import heic2any from "heic2any";
import imageCompression from "browser-image-compression";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import TransactionTable from "./TransactionTable";
import { AddExpenseButton } from "components/AddExpenseButton";
import IncomeStatement from "components/IncomeStatement";
import DownloadReportModal from "components/DownloadReportModal";
import colors from "variables/colors";
import { setSelectedUser, clearSelectedUser } from "../store/userSlice";
import CSVReports from "./CSVReports";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { FaTimesCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { businessTypes } from "./BusinessTypes";
import getUserInfo from "utils/Getuser";
import UserSubscriptionInfo from "./Payment/UserSubscriptionInfo";
import { useTranslation } from "react-i18next";
import LanguageSelector from "components/Languageselector/LanguageSelector";
import i18n from "../i18n";
import { getTranslatedBusinessPurposes, translatePurpose } from "utils/translatedBusinessTypes";
const MesobFinancial2 = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const notificationAlertRef = useRef(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchedDates, setSearchedDates] = useState(null);
  const [totalCashOnHand, setTotalCashOnHand] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);
  const [manualPurpose, setManualPurpose] = useState("");
  const [isManual, setIsManual] = useState("");
  const [revenues, setRevenues] = useState({});
  const [expenses, setExpenses] = useState({});
  const [partialPaymentError, setPartialPaymentError] = useState(null);
  const [accountsPayable, setAccountsPayable] = useState({});
  const [paymentMode, setPaymentMode] = useState(null);
  const [unpaidTransactions, setUnpaidTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const userRole = parseInt(localStorage.getItem("role"));
  const [selectedUnpaidTransaction, setSelectedUnpaidTransaction] =
    useState(null);
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialvalueableItems, setvalueableItems] = useState(0);
  const [initialoutstandingDebt, setoutstandingDebt] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const fileInputRef = useRef(null);
  const [subType, setsubType] = useState("");
  const [fileContent, setfileContent] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const [companyName, setcompanyName] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showDownloadReportModal, setShowDownloadReportModal] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [showInstallmentInput, setShowInstallmentInput] = useState(false);
  const [paymentOption, setPaymentOption] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const selectedUser = useSelector((state) => state.selectedUser);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const firstLoadRef = useRef(true);
  const hasShownNotifyRef = useRef(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Loading states for different API calls
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingUnpaidTransactions, setLoadingUnpaidTransactions] =
    useState(false);
  const [loadingUserInitialBalance, setLoadingUserInitialBalance] =
    useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingInstallment, setLoadingInstallment] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDeleteAll, setLoadingDeleteAll] = useState(false);

  // business types
  const [selectedBusinessType, setSelectedBusinessType] = useState(
    localStorage.getItem("businessType") || ""
  );
  const [incomePurposes, setIncomePurposes] = useState([]);
  const [expensePurposes, setExpensePurposes] = useState([]);
  const [payablePurposes, setPayablePurposes] = useState([]);
  const [manualIncomePurposes, setManualIncomePurposes] = useState([]);
  const [manualExpensePurposes, setManualExpensePurposes] = useState([]);
  const [manualPayablePurposes, setManualPayablePurposes] = useState([]);
  const [newPurpose, setNewPurpose] = useState("");
  const [purposeType, setPurposeType] = useState("income");

  // Subscription
  const [userSubscription, setUserSubscription] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [scheduleCount, setScheduleCount] = useState(1);

  // Loading Overlay Component
  const LoadingOverlay = ({ loading, text = "Loading..." }) => {
    if (!loading) return null;

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          borderRadius: "inherit",
        }}
      >
        <div className="text-center">
          <Spinner color="primary" />
          <p className="mt-2">{text}</p>
        </div>
      </div>
    );
  };

  // Add method to save new purposes
  const handleAddPurpose = () => {
    if (newPurpose.trim()) {
      switch (purposeType) {
        case "income":
          setManualIncomePurposes([...manualIncomePurposes, newPurpose]);
          break;
        case "expense":
          setManualExpensePurposes([...manualExpensePurposes, newPurpose]);
          break;
        case "payable":
          setManualPayablePurposes([...manualPayablePurposes, newPurpose]);
          break;
      }
      setNewPurpose("");
    }
  };

  // business type
  // const getBusinessPurposes = (type) => {
  //   if (type === "Other") {
  //     return {
  //       income: manualIncomePurposes,
  //       expenses: manualExpensePurposes,
  //       payables: manualPayablePurposes,
  //     };
  //   } else if (businessTypes[type]) {
  //     return businessTypes[type];
  //   } else {
  //     return {
  //       income: [],
  //       expenses: [],
  //       payables: [],
  //     };
  //   }
  // };
const getBusinessPurposes = (type) => {
  if (type === "Other") {
    return {
      income: manualIncomePurposes,
      expenses: manualExpensePurposes,
      payables: manualPayablePurposes,
    };
  } else {
    // Use translated business purposes instead of static ones
    return getTranslatedBusinessPurposes(type);
  }
};
  // Format users for react-select
  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.email,
  }));

  // installment
  const handlePayableSelection = (transaction) => {
    setSelectedUnpaidTransaction(transaction);
    setShowInstallmentModal(true);
  };

  const handleFullPayment = () => {
    handleUpdateTransaction(selectedUnpaidTransaction);
    setShowInstallmentModal(false);
  };

  const handleInstallmentPayment = async () => {
    if (!selectedUnpaidTransaction || !installmentAmount) {
      notify(
        "tr",
        t("financialReport.noUnpaidSelected"),
        "warning"
      );
      return;
    }

    const remainingAmount =
      selectedUnpaidTransaction.remainingAmount ||
      selectedUnpaidTransaction.transactionAmount;

    if (parseFloat(installmentAmount) > remainingAmount) {
      notify(
        "tr",
        t("financialReport.installmentExceedError", { amount: remainingAmount }),
        "warning"
      );
      return;
    }

    setLoadingInstallment(true);
    try {
      const response = await fetch(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${selectedUnpaidTransaction.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            installmentAmount: parseFloat(installmentAmount),
            status:
              parseFloat(installmentAmount) === remainingAmount
                ? "Paid"
                : "Partially Paid",
            transactionType: "Payable",
            transactionPurpose: selectedUnpaidTransaction.transactionPurpose,
            transactionAmount: selectedUnpaidTransaction.transactionAmount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error(errorData.message || "Failed to update transaction");
      }

      const result = await response.json();
      notify("tr", t("financialReport.paymentRecordedInstallment"), "success");

      // Create a new transaction for the installment payment
      const newPaymentResponse = await fetch(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            transactionType: "Pay",
            transactionPurpose: `Installment for ${selectedUnpaidTransaction.transactionPurpose}`,
            transactionAmount: parseFloat(installmentAmount),
            status: "Paid",
            payableId: selectedUnpaidTransaction.id,
          }),
        }
      );

      if (!newPaymentResponse.ok) {
        const errorData = await newPaymentResponse.json();
        console.error("Error creating new payment transaction:", errorData);
        throw new Error(
          errorData.message || "Failed to create new payment transaction"
        );
      }

      await fetchTransactions();
      setShowInstallmentModal(false);
      setInstallmentAmount("");
      setSelectedUnpaidTransaction(null);
      setShowInstallmentInput(false);
    } catch (error) {
      console.error("Error processing installment payment:", error);
      notify(
        "tr",
        `Error processing installment payment: ${error.message}`,
        "danger"
      );
    } finally {
      setLoadingInstallment(false);
    }
  };

  // CSV
  const handleGenerateCSV = () => {
    navigate("/customer/csv");
  };

  const [financialData, setFinancialData] = useState(null);

  const fetchFinancialData = async (userId) => {
    setLoadingTransactions(true);
    try {
      console.log(
        "MesobFinancial2: Fetching financial data for user ID",
        userId
      );
      const response = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      );
      console.log("MesobFinancial2: Fetched data", response.data);
      setItems(response.data);
    } catch (error) {
      console.error("MesobFinancial2: Error fetching financial data:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Add receipt handling function
  const handleReceiptClick = (receiptUrl) => {
    if (receiptUrl) {
      handlePreview(receiptUrl);
    } else {
      notify("tr", t("financialReport.noReceipt"), "warning");
    }
  };

  const handlePreview = (receiptUrl) => {
    const modifiedUrl = receiptUrl.replace(
      "app.mesobfinancial.com.s3.amazonaws.com",
      "s3.amazonaws.com/app.mesobfinancial.com"
    );
    setSelectedReceipt({ receiptUrl: modifiedUrl });
    setPreviewModal(true);
  };

  const handleReceiptUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    try {
      // Check for HEIC file
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        });

        file = new File([convertedBlob], `${Date.now()}-converted.jpg`, {
          type: "image/jpeg",
        });
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const filecontent = event.target.result.split(",")[1];
        setReceipt(file);
        setfileContent(filecontent);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      notify(
        "tr",
        t("financialReport.uploadFailed"),
        "danger"
      );
    }
  };

  //fetching users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users"
      );

      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notify("tr", t("financialReport.errorFetchingUsers"), "danger");
    } finally {
      setLoadingUsers(false);
    }
  };

  const calculateTotals = (transactions) => {
    let cashOnHand = initialBalance || 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;
      if (transaction.transactionType === "Receive") {
        cashOnHand += amount;
      } else if (["Pay", "Payable"].includes(transaction.transactionType)) {
        expenses += amount;
      }
    });

    setTotalCashOnHand(cashOnHand);
    setTotalExpenses(expenses);
  };

  const userId = localStorage.getItem("userId");

  const notify = (place, message, type) => {
    notificationAlertRef.current.notificationAlert({
      place,
      message: <div>{message}</div>,
      type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    });
  };

  const handleAddTransaction = async () => {
    const errors = {};

    if (transactionPurpose === "manual" && !manualPurpose.trim()) {
      errors.manualPurpose = "Please enter a purpose manually";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!transactionType || !transactionAmount) {
      notify("tr", t("financialReport.fillFields"), "warning");
      return;
    }

    setIsAddingTransaction(true);
    let Url = "";

    if (receipt) {
      Url = await uploadReceipt();
    }

    try {
      console.log("values", transactionPurpose, manualPurpose);
      const newTransaction = {
        userId: localStorage.getItem("userId"),
        transactionType:
          transactionType === "receive"
            ? "Receive"
            : transactionType === "Payable"
            ? "Payable"
            : transactionType === "pay" && paymentMode === "boughtItem"
            ? "New_Item"
            : transactionType === "pay" && paymentMode !== "boughtItem"
            ? "Pay"
            : "New_Item",
        transactionPurpose: `${transactionPurpose}${
          manualPurpose ? ` ${manualPurpose}` : ""
        }`,
        transactionAmount: parseFloat(transactionAmount),
        originalAmount: parseFloat(transactionAmount),
        subType:
          paymentMode === "boughtItem"
            ? "New_Item"
            : paymentMode === "new"
            ? "Expense"
            : subType,
        receiptUrl: Url || "",
        status: transactionType === "Payable" ? "Unpaid" : "Paid",
      };

      const response = await axios.post(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
        newTransaction
      );

      if (response.status === 200) {
        const successMessage =
          transactionType === "pay" && paymentMode === "boughtItem"
            ? t("financialReport.newItemSuccess")
            : t("financialReport.transactionAdded");
        notify("tr", successMessage, "success");
        resetForm();
        fetchTransactions();
        setShowAddTransaction(false);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      notify("tr", "Error processing transaction", "danger");
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const resetForm = () => {
    setTransactionType("");
    setTransactionPurpose("");
    setTransactionAmount("");
    setManualPurpose("");
    setEditingTransaction(null);
    setReceipt(null);
    setPaymentMode(null);
    setRemainingAmount(0);
    setSelectedUnpaidTransaction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  
  const uploadReceipt = async () => {
    if (!receipt) {
      notify("tr", "No receipt selected", "warning");
      return;
    }

    setLoadingReceipt(true);
    const maxFileSize = 4.0 * 1024 * 1024;
    const maxPayloadSize = 4.0 * 1024 * 1024; // Also check payload size

    console.log("Original file:", {
      name: receipt.name,
      type: receipt.type,
      sizeMB: (receipt.size / (1024 * 1024)).toFixed(2) + " MB",
    });
 // Notify user if file is large
 const fileSizeMB = receipt.size / (1024 * 1024);
 if (fileSizeMB > 2.0) {
   notify("tr", "Large file detected. Uploading may take a moment...", "info");
 }
    let fileToUpload = receipt;

    // Helper function to convert WEBP to JPEG (better compression than PNG)
    const convertWebpToSupportedFormat = (webpFile) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            
            // Use JPEG for better compression
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const convertedFile = new File(
                    [blob],
                    webpFile.name.replace(/\.webp$/i, ".jpg"),
                    { type: "image/jpeg" }
                  );
                  console.log("WEBP converted to JPEG:", {
                    originalSize: (webpFile.size / (1024 * 1024)).toFixed(2) + " MB",
                    convertedSize: (convertedFile.size / (1024 * 1024)).toFixed(2) + " MB",
                  });
                  resolve(convertedFile);
                } else {
                  reject(new Error("Failed to convert WEBP to JPEG"));
                }
              },
              "image/jpeg",
              0.85 // Lower quality for better compression
            );
          };
          img.onerror = (err) => {
            console.error("Image load error:", err);
            reject(new Error("Failed to load WEBP image"));
          };
          img.src = e.target.result;
        };
        reader.onerror = (err) => {
          console.error("FileReader error:", err);
          reject(new Error("Failed to read WEBP file"));
        };
        reader.readAsDataURL(webpFile);
      });
    };

    // ALWAYS convert WEBP files first, regardless of size
    if (receipt.type === "image/webp") {
      try {
        notify("tr", "Converting WEBP image...", "info");
        console.log("Converting WEBP file to JPEG...");
        fileToUpload = await convertWebpToSupportedFormat(receipt);
        console.log("Converted file:", {
          name: fileToUpload.name,
          type: fileToUpload.type,
          sizeMB: (fileToUpload.size / (1024 * 1024)).toFixed(2) + " MB",
        });
      } catch (err) {
        console.error("WEBP conversion failed:", err);
        notify(
          "tr",
          "Failed to convert WEBP file. Please try a different format.",
          "danger"
        );
        setLoadingReceipt(false);
        return;
      }
    }

    // Compress if file is still too large
    if (fileToUpload.size > maxFileSize && fileToUpload.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 3.5, // Target 3.5 MB to leave room for payload overhead
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: fileToUpload.type, // Preserve the converted type
        };

        notify("tr", "Compressing large image before upload...", "info");
        console.log("Compressing image...");

        const compressedFile = await imageCompression(fileToUpload, options);

        console.log("Compressed file:", {
          name: compressedFile.name,
          type: compressedFile.type,
          sizeMB: (compressedFile.size / (1024 * 1024)).toFixed(2) + " MB",
        });

        if (compressedFile.size > maxFileSize) {
          notify(
            "tr",
            "The image is still too large after compression. Please upload a smaller file.",
            "danger"
          );
          setLoadingReceipt(false);
          return;
        }

        fileToUpload = compressedFile;
      } catch (err) {
        console.error("Image compression failed:", err);
        notify(
          "tr",
          "Image compression failed. Please upload a smaller file.",
          "danger"
        );
        setLoadingReceipt(false);
        return;
      }
    } else if (fileToUpload.size > maxFileSize) {
      notify(
        "tr",
        "File larger than 4.0 MB and cannot be compressed.",
        "danger"
      );
      setLoadingReceipt(false);
      return;
    }

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

    let fileContent = await toBase64(fileToUpload);

    // Check payload size and compress further if needed
    let payload = {
      fileName: fileToUpload.name,
      fileType: fileToUpload.type,
      fileContent,
      userId: localStorage.getItem("userId"),
    };

    let payloadSize = JSON.stringify(payload).length;
    let payloadSizeMB = payloadSize / (1024 * 1024);

    console.log(
      "Base64 size (approx MB):",
      ((fileContent.length * 3) / 4 / (1024 * 1024)).toFixed(2)
    );

    console.log(
      "Payload size (MB):",
      payloadSizeMB.toFixed(2)
    );

    // If payload is still too large, compress more aggressively
    if (payloadSize > maxPayloadSize && fileToUpload.type.startsWith("image/")) {
      try {
        notify("tr", "Further compressing to meet size limit...", "info");
        const options = {
          maxSizeMB: 2.5, // More aggressive compression
          maxWidthOrHeight: 1600, // Smaller dimensions
          useWebWorker: true,
          fileType: fileToUpload.type,
        };

        const furtherCompressed = await imageCompression(fileToUpload, options);
        fileToUpload = furtherCompressed;
        fileContent = await toBase64(fileToUpload);
        
        payload = {
          fileName: fileToUpload.name,
          fileType: fileToUpload.type,
          fileContent,
          userId: localStorage.getItem("userId"),
        };
        
        payloadSize = JSON.stringify(payload).length;
        payloadSizeMB = payloadSize / (1024 * 1024);
        
        console.log("After further compression:", {
          fileSize: (fileToUpload.size / (1024 * 1024)).toFixed(2) + " MB",
          payloadSize: payloadSizeMB.toFixed(2) + " MB",
        });

        if (payloadSize > maxPayloadSize) {
          notify(
            "tr",
            "File is too large even after compression. Please use a smaller image.",
            "danger"
          );
          setLoadingReceipt(false);
          return;
        }
      } catch (err) {
        console.error("Further compression failed:", err);
        notify(
          "tr",
          "Unable to compress file to required size. Please use a smaller image.",
          "danger"
        );
        setLoadingReceipt(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Receipt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      notify("tr", "Receipt uploaded successfully", "success");
      setReceipt(null);
      return data.url;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      notify(
        "tr",
        `Failed to upload receipt: ${error.message || "Unknown error"}`,
        "danger"
      );
    } finally {
      setLoadingReceipt(false);
    }
  };
  

  const handleUpdateTransaction = async (transaction) => {
    console.log("Transaction ID:", transaction.id);
    let Url = "";
    if (receipt) {
      Url = await uploadReceipt();
    }
    const paidAmount =
      paymentOption === "full"
        ? parseFloat(transaction.transactionAmount)
        : parseFloat(remainingAmount);

    setIsUpdatingTransaction(true);
    try {
      if (transaction.id !== "outstanding-debt") {
        // Handle regular payable transactions
        if (paidAmount > remainingAmount && paymentOption !== "full") {
          notify(
            "tr",
            t("financialReport.paymentExceedError", { remainingAmount }),
            "warning"
          );
          return;
        }

        const newRemainingAmount =
          parseFloat(transaction.transactionAmount) - paidAmount;

        const updatedTransaction = {
          ...transaction,
          receiptUrl: Url || transaction.receiptUrl,
          status: newRemainingAmount <= 0 ? "Paid" : "Partially Paid",
          updatedAt: new Date().toISOString(),
          paidAmount: (transaction.paidAmount || 0) + paidAmount,
          transactionAmount: newRemainingAmount,
          remainingAmount: newRemainingAmount,
        };

        const response = await fetch(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transaction.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTransaction),
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to update the transaction");
        }
      } else {
        // *** FIX: DON'T update user's outstandingDebt field ***
        // The outstanding debt is now calculated dynamically from payments
        console.log(
          "Outstanding debt payment - tracking via transactions only"
        );
      }

      // Create the payment transaction record
      const newPaidTransaction = {
        userId: localStorage.getItem("userId"),
        transactionType: "Pay",
        transactionPurpose:
          transaction.id === "outstanding-debt"
            ? "Payment for Outstanding Debt"
            : paymentOption === "full"
            ? `Full Payment for ${transaction.transactionPurpose}`
            : `Partial Payment for ${transaction.transactionPurpose}`,
        transactionAmount: paidAmount,
        receiptUrl: Url || "",
        payableId: transaction.id,
        createdAt: new Date().toISOString(),
      };

      const response2 = await axios.post(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
        newPaidTransaction
      );

      if (response2.status === 200) {
        notify("tr", t("financialReport.paymentRecorded"), "success");
        fetchTransactions();
        fetchUserInitialBalance();
      } else {
        throw new Error("Failed to add the payment record");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      notify("tr", `Error recording payment: ${error.message}`, "danger");
    } finally {
      setIsUpdatingTransaction(false);
      setSelectedUnpaidTransaction(null);
      setPaymentOption(null);
      setShowAddTransaction(false);
      setTransactionAmount("");
      setRemainingAmount(0);
    }
  };

  const filterItemsByTimeRange = (items, range, searchTerm) => {
    if (!range || !range.from || !range.to) {
      return items.filter((item) =>
        item.transactionPurpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);

    return items.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate >= fromDate &&
        itemDate <= toDate &&
        item.transactionPurpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const fetchUserInitialBalance = async (uid = null) => {
    setLoadingUserInitialBalance(true);
    try {
      const targetUserId = uid || localStorage.getItem("userId");
      const response = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
      );
      if (response.data?.user) {
        if (response.data.user.businessType) {
          const bizType = response.data.user.businessType || "";
          setSelectedBusinessType(bizType);
          localStorage.setItem("businessType", bizType);
        }
        if (response.data.user.cashBalance) {
          setInitialBalance(parseFloat(response.data.user.cashBalance));
        }
        if (response.data.user.valueableItems) {
          setvalueableItems(parseFloat(response.data.user.valueableItems));
        }
        if (typeof response.data.user.companyName === "string") {
          setcompanyName(response.data.user.companyName);
        } else {
          setcompanyName("");
        }
        if (response.data.user.outstandingDebt) {
          setoutstandingDebt(parseFloat(response.data.user.outstandingDebt));
        }
      } else {
        setcompanyName("");
        console.warn("User data not found in user object:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      notify("tr", t("financialReport.errorInitialBalance"), "danger");
    } finally {
      setLoadingUserInitialBalance(false);
    }
  };

  // useEffect(() => {
  //   console.log("Selected Business Type: ????", selectedBusinessType);
  //   const purposes = getBusinessPurposes(selectedBusinessType);
  //   console.log("Business Purposes:", purposes);
  //   setIncomePurposes(purposes.income || []);
  //   setExpensePurposes(purposes.expenses || []);
  //   setPayablePurposes(purposes.payables || []);
  // }, [selectedBusinessType]);
  useEffect(() => {
  console.log("Selected Business Type: ????", selectedBusinessType);
  const purposes = getBusinessPurposes(selectedBusinessType);
  console.log("Business Purposes:", purposes);
  setIncomePurposes(purposes.income || []);
  setExpensePurposes(purposes.expenses || []);
  setPayablePurposes(purposes.payables || []);
}, [selectedBusinessType, i18n.language]); // ← ADD i18n.language dependency

  useEffect(() => {
    const savedIncome = JSON.parse(
      localStorage.getItem("manualIncome") || "[]"
    );
    const savedExpense = JSON.parse(
      localStorage.getItem("manualExpense") || "[]"
    );
    const savedPayable = JSON.parse(
      localStorage.getItem("manualPayable") || "[]"
    );

    setManualIncomePurposes(savedIncome);
    setManualExpensePurposes(savedExpense);
    setManualPayablePurposes(savedPayable);
  }, []);

  useEffect(() => {
    if (selectedBusinessType === "Other") {
      localStorage.setItem(
        "manualIncome",
        JSON.stringify(manualIncomePurposes)
      );
      localStorage.setItem(
        "manualExpense",
        JSON.stringify(manualExpensePurposes)
      );
      localStorage.setItem(
        "manualPayable",
        JSON.stringify(manualPayablePurposes)
      );
    }
  }, [manualIncomePurposes, manualExpensePurposes, manualPayablePurposes]);

  useEffect(() => {
    if (userRole === 0) {
      fetchUsers();
    } else {
      const initializeData = async () => {
        try {
          await fetchUserInitialBalance();
          await fetchTransactions();
        } catch (error) {
          console.error("Error initializing data:", error);
          notify("tr", "Error loading initial data", "danger");
        }
      };
      initializeData();
    }
  }, [userRole]);

  useEffect(() => {
    if (items && items.length > 0) {
      calculateFinancials(items);
    }
  }, [items]);

  useEffect(() => {
    if (showAddTransaction && transactionType === "pay") {
      fetchUnpaidTransactions();
    }
  }, [showAddTransaction, transactionType]);

  useEffect(() => {
    if (location.state?.openTransactionModal) {
      setShowAddTransaction(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Subscriptions
  useEffect(() => {
    const fetchUserSubscriptionData = async () => {
      setLoadingSubscription(true);
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
        );

        if (response.data?.user) {
          const userData = response.data.user;
          setUserSubscription(userData?.subscription || false);
          console.log("subscription=>>> ", userData?.subscription);
          setTrialEndDate(new Date(userData?.trialEndDate));
          console.log("trialEndDate=>>> ", userData?.trialEndDate);
          setScheduleCount(userData?.scheduleCount || 1);
        }
      } catch (error) {
        console.error("Error fetching user subscription data:", error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchUserSubscriptionData();
  }, []);

  const isTrialActive = () => {
    return new Date() < trialEndDate && scheduleCount < 4;
  };

  

  const calculateFinancials = (transactions) => {
    const newRevenues = {};
    const newExpenses = {};
    const newAccountsPayable = {};

    const filteredTransactions = getFilteredItems();

    filteredTransactions.forEach((transaction) => {
      const amount = parseFloat(transaction.transactionAmount) || 0;

      if (transaction.transactionType === "Receive") {
        const purpose = transaction.transactionPurpose;
        newRevenues[purpose] = (newRevenues[purpose] || 0) + amount;
      } else if (
        transaction.transactionType === "Pay" ||
        transaction.transactionType === "Payable"
      ) {
        const purpose = transaction.transactionPurpose;

        // *** FIX: Exclude outstanding debt payments from expenses ***
        if (
          transaction.payableId !== "outstanding-debt" &&
          !purpose.includes("Outstanding Debt")
        ) {
          newExpenses[purpose] = (newExpenses[purpose] || 0) + amount;
        }

        if (transaction.transactionType === "Payable") {
          newAccountsPayable[purpose] =
            (newAccountsPayable[purpose] || 0) + amount;
        }
      }
    });

    setRevenues(newRevenues);
    setExpenses(newExpenses);
    setAccountsPayable(newAccountsPayable);
  };

  const calculateTotalRevenue = () => {
    const filteredItems = getFilteredItems();
    const totalReceived = filteredItems.reduce((sum, value) => {
      if (value.transactionType === "Receive") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);
    return totalReceived.toFixed(2);
  };

  const calculateTotalInventory = () => {
    const valueableItems = initialvalueableItems || 0;
    const filteredItems = getFilteredItems();

    const newItemsTotal = filteredItems.reduce((sum, item) => {
      if (item.transactionType === "New_Item" && item.subType === "New_Item") {
        return sum + parseFloat(item.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const totalInventory = newItemsTotal + valueableItems;
    return totalInventory.toFixed(2);
  };



  const calculateTotalExpenses = () => {
    const filteredItems = getFilteredItems();
    return filteredItems
      .reduce((sum, value) => {
        // *** FIX: Exclude outstanding debt payments ***
        if (
          (value.transactionType === "Pay" ||
            (value.transactionType === "Payable" && value.status !== "Paid")) &&
          value.payableId !== "outstanding-debt" &&
          !value.transactionPurpose.includes("Outstanding Debt")
        ) {
          return sum + parseFloat(value.transactionAmount || 0);
        }
        return sum;
      }, 0)
      .toFixed(2);
  };

  
  const calculateTotalCash = () => {
    const filteredItems = getFilteredItems();

    const totalReceived = filteredItems.reduce((sum, value) => {
      if (value.transactionType === "Receive") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const New_ItemReceived = filteredItems.reduce((sum, value) => {
      if (value.transactionType === "New_Item") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    // Include ALL Pay transactions (including outstanding debt payments)
    const totalExpenses = filteredItems.reduce((sum, value) => {
      if (value.transactionType === "Pay") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const totalCash =
      initialBalance + totalReceived - totalExpenses - New_ItemReceived;
    return totalCash.toFixed(2);
  };

  

  const calculateTotalPayable = () => {
    const filteredItems = getFilteredItems();

    // Count unpaid regular Payables
    const totalPayable = filteredItems.reduce((sum, value) => {
      if (value.transactionType === "Payable" && value.status !== "Paid") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    // *** FIX: Use 'items' instead of 'filteredItems' for complete payment history ***
    const outstandingDebtPayments = items.reduce((sum, value) => {
      if (
        value.payableId === "outstanding-debt" &&
        value.transactionType === "Pay"
      ) {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    // Calculate remaining outstanding debt
    const remainingOutstandingDebt = Math.max(
      0,
      initialoutstandingDebt - outstandingDebtPayments
    );

    return (totalPayable + remainingOutstandingDebt).toFixed(2);
  };

  const fetchTransactions = (uid = null) => {
    setLoadingTransactions(true);
    const targetUserId = uid || localStorage.getItem("userId");

    axios
      .get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${targetUserId}`
      )
      .then((response) => {
        if (response.data) {
          console.log("transactions data: ", response.data);
          const updatedTransactions = response.data.map((transaction) => {
            if (transaction.installmentPlan) {
              return {
                ...transaction,
                status:
                  transaction.installmentPlan.remainingAmount > 0
                    ? "Partially Paid"
                    : "Paid",
                paidAmount: transaction.installmentPlan.paidAmount,
                remainingAmount: transaction.installmentPlan.remainingAmount,
              };
            }
            return transaction;
          });
          calculateTotals(updatedTransactions);
          setItems(updatedTransactions);
        }
      })
      .catch((error) => {
        notify("tr", "Error fetching transactions", "danger");
      })
      .finally(() => {
        setLoadingTransactions(false);
      });
  };

  
  const fetchUnpaidTransactions = () => {
    setLoadingUnpaidTransactions(true);
    axios
      .get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      )
      .then((response) => {
        const unpaidOrPartiallyPaid = response.data
          .filter(
            (t) =>
              t.transactionType === "Payable" &&
              (!t.installmentPlan || t.installmentPlan.remainingAmount > 0)
          )
          .map((transaction) => ({
            ...transaction,
            remainingAmount: transaction.installmentPlan
              ? transaction.installmentPlan.remainingAmount
              : transaction.transactionAmount,
          }));

        // ✅ FIX: Calculate remaining outstanding debt dynamically
        const outstandingDebt = initialoutstandingDebt || 0;

        if (outstandingDebt > 0) {
          // Calculate total payments made toward outstanding debt
          const outstandingDebtPayments = response.data.reduce((sum, t) => {
            if (
              t.payableId === "outstanding-debt" &&
              t.transactionType === "Pay"
            ) {
              return sum + parseFloat(t.transactionAmount || 0);
            }
            return sum;
          }, 0);

          // Calculate remaining outstanding debt
          const remainingOutstandingDebt =
            outstandingDebt - outstandingDebtPayments;

          // Only add to list if there's still debt remaining
          if (remainingOutstandingDebt > 0) {
            unpaidOrPartiallyPaid.push({
              id: "outstanding-debt",
              transactionType: "Payable",
              transactionPurpose: "Initial Outstanding Debt",
              transactionAmount: remainingOutstandingDebt, // ✅ Now shows $900
              remainingAmount: remainingOutstandingDebt, // ✅ Now shows $900
              createdAt: new Date().toISOString(),
            });
          }
        }

        setUnpaidTransactions(unpaidOrPartiallyPaid);
      })
      .catch((error) => {
        console.error("Error fetching unpaid transactions:", error);
        notify("tr", "Error fetching unpaid transactions", "danger");
      })
      .finally(() => {
        setLoadingUnpaidTransactions(false);
      });
  };

  const handleSelectRange = (range) => {
    setSelectedTimeRange(range);
  };

  const handleClearFilters = () => {
    setSelectedTimeRange("all");
    setSearchedDates(null);
  };

  const handleAddExpense = (expense) => {
    console.log("New expense:", expense);
  };

  const handleDelete = async (transaction) => {
    if (window.confirm(t("financialReport.confirmDeleteRecord"))) {
      setLoadingDelete(true);
      try {
        if (transaction?.payableId === "outstanding-debt") {
          await handleOutstandingDebtDeletion(transaction);
        } else if (transaction.payableId) {
          await handlePayableDeletion(transaction);
        }

        const deleteResponse = await axios.delete(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${Number(
            transaction.id
          )}`,
          { headers: { "Content-Type": "application/json" } }
        );

        if (deleteResponse.status === 200) {
          notify("tr", "Record deleted successfully", "success");
          await fetchTransactions();
          await fetchUserInitialBalance();
        } else {
          throw new Error("Failed to delete record");
        }
      } catch (error) {
        console.error("Delete error:", error);
        notify(
          "tr",
          error.response?.data?.message || "Failed to delete record",
          "danger"
        );
      } finally {
        setLoadingDelete(false);
      }
    }
  };


  const handleOutstandingDebtDeletion = async (transaction) => {
    // When deleting an outstanding debt payment, we DON'T need to update the user table
    // because we're calculating it dynamically from transactions
    console.log("Deleting outstanding debt payment - no user update needed");
    // The payment transaction will be deleted, and calculateTotalPayable will reflect the change
  };

  const handlePayableDeletion = async (transaction) => {
    const payableItem = items.find((item) => item.id === transaction.payableId);
    if (payableItem) {
      const updatedTransaction = {
        ...payableItem,
        status: "Payable",
        transactionAmount: (
          parseFloat(payableItem.transactionAmount) +
          parseFloat(transaction.transactionAmount)
        ).toString(),
        updatedAt: new Date().toISOString(),
      };

      await axios.put(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${Number(
          transaction.payableId
        )}`,
        updatedTransaction,
        { headers: { "Content-Type": "application/json" } }
      );
    }
  };

  const handleDeleteAllRecords = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setLoadingDeleteAll(true);
    const userId = localStorage.getItem("userId");

    try {
      const response = await axios.delete(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setItems([]);
        setTotalCashOnHand(0);
        setTotalExpenses(0);
        setRevenues({});
        setExpenses({});
        setAccountsPayable({});
        notify("tr", "All records deleted successfully", "success");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting all records:", error);
      notify("tr", t("financialReport.deleteAllError"), "danger");
    } finally {
      setLoadingDeleteAll(false);
      setShowDeleteConfirmation(false);
    }
  };

  // CSV Generation function
  const generateCSV = (data) => {
    if (!data || data.length === 0) {
      return "";
    }

    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    data.forEach((row) => {
      const values = headers.map((header) => {
        const cellValue = row[header];
        const escapedValue = String(cellValue).replace(/"/g, '""');
        return `"${escapedValue}"`;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const uploadCSVToS3 = async (csvData) => {
    try {
      const userId = localStorage.getItem("userId");
      const fileName = `transactions_${new Date().toISOString()}.csv`;
      const bucketName = "app.mesobfinancial.com";
      const folderPath = "backups/" + userId;
      const s3Key = `${folderPath}${fileName}`;

      const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));

      const response = await axios.post(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup",
        {
          bucketName: bucketName,
          key: s3Key,
          filename: fileName,
          userId: userId,
          fileContent: base64CsvData,
          type: "text/csv;charset=utf-8",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        notify("tr", t("backupCSV.savedSuccess"), "success");
        return true;
      } else {
        notify("tr", t("backupCSV.saveFailed"), "danger");
        return false;
      }
    } catch (error) {
      console.error("Error uploading CSV to S3:", error);
      notify("tr", t("backupCSV.errorSaving"), "danger");
      return false;
    }
  };

  useEffect(() => {
    const persistedUserId = localStorage.getItem("selectedUserId");
    if (userRole !== 0) return;

    if (selectedUserId) {
      hasShownNotifyRef.current = false;
      fetchUserInitialBalance(selectedUserId);
      fetchTransactions(selectedUserId);
      return;
    }
    if (!selectedUserId && persistedUserId) {
      setSelectedUserId(persistedUserId);
      return;
    }
    const timeout = setTimeout(() => {
      firstLoadRef.current = false;

      if (!selectedUserId && !hasShownNotifyRef.current) {
        setLoading(false);
        notify("tr", "Please select a user", "warning");
        hasShownNotifyRef.current = true;
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [userRole, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      hasShownNotifyRef.current = false;
    }
  }, [selectedUserId]);

  // Expose PDF download trigger to window so Sidebar can call it from any page
useEffect(() => {
  window.__mesobOpenDownloadReport = () => {
    setShowDownloadReportModal(true);
  };
  return () => {
    delete window.__mesobOpenDownloadReport;
  };
}, []);

useEffect(() => {
  if (location.state?.openDownloadModal) {
    // Small delay to let the page fully mount
    setTimeout(() => {
      setShowDownloadReportModal(true);
    }, 300);
    navigate(location.pathname, { replace: true }); // clear state
  }
}, [location.state]);
// useEffect(() => {
//     const handleSidebarReset = () => {
//       confirmDeleteandsave(); // saves CSV to S3 + downloads + deletes all
//     };
//     const handleSidebarDownload = () => {
//       downloadCSVOnly(); // just downloads CSV directly, no modal
//     };

//     window.addEventListener("mesob:resetAllTransactions", handleSidebarReset);
//     window.addEventListener("mesob:downloadReport", handleSidebarDownload);

//     return () => {
//       window.removeEventListener("mesob:resetAllTransactions", handleSidebarReset);
//       window.removeEventListener("mesob:downloadReport", handleSidebarDownload);
//     };
  
//   }, [items]);


  useEffect(() => {
  const handleSidebarReset = () => {
    confirmDeleteandsave();
  };
  const handleSidebarDownload = () => {
    setShowDownloadReportModal(true); // ← open PDF modal instead of CSV
  };

  window.addEventListener("mesob:resetAllTransactions", handleSidebarReset);
  window.addEventListener("mesob:downloadReport", handleSidebarDownload);

  return () => {
    window.removeEventListener("mesob:resetAllTransactions", handleSidebarReset);
    window.removeEventListener("mesob:downloadReport", handleSidebarDownload);
  };
}, [items]);
  
  useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  const handleUserSelect = (selectedOption) => {
    if (!selectedOption) {
      setSelectedUserId(null);
      localStorage.removeItem("selectedUserId");
      setItems([]);
      setLoading(false);
      return;
    }
    const userId = selectedOption.value;
    setSelectedUserId(userId);
    localStorage.setItem("selectedUserId", userId);

    const selectedUserData = users.find((user) => user.id === userId);
    if (selectedUserData) {
      dispatch(setSelectedUser(selectedUserData));
      fetchFinancialData(userId);
    }
  };

  const confirmDeleteandsave = async () => {
    setLoadingDeleteAll(true);
    const userId = localStorage.getItem("userId");

    try {
      const csvData = generateCSV(items);
      if (csvData) {
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "transactions.csv");
      }
      const uploadSuccess = await uploadCSVToS3(csvData);
      if (!uploadSuccess) {
        setLoadingDeleteAll(false);
        setShowDeleteConfirmation(false);
        return;
      }
      const response = await axios.delete(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setItems([]);
        setTotalCashOnHand(0);
        setTotalExpenses(0);
        setRevenues({});
        setExpenses({});
        setAccountsPayable({});
        notify("tr", "All records deleted successfully", "success");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting all records:", error);
      notify("tr", "Error deleting records", "danger");
    } finally {
      setLoadingDeleteAll(false);
      setShowDeleteConfirmation(false);
    }
  };
const downloadCSVOnly = () => {
    const csvData = generateCSV(items);
    if (csvData) {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "transactions.csv");
    } else {
      notify("tr", "No transactions to download", "warning");
    }
  };
  const RunButtons = ({ onSelectRange, onClearFilters }) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleRun = () => {
      if (fromDate && toDate) {
        onSelectRange({ from: fromDate, to: toDate });
        setSearchedDates({ from: fromDate, to: toDate });
      } else {
        notify("tr", t("financialReport.selectDates"), "warning");
      }
    };

    const handleClear = () => {
      setFromDate("");
      setToDate("");
      onClearFilters();
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end", 
          justifyContent: "flex-start",
          flexWrap: "wrap",
          gap: "10px",
         
        }}
      >
        <div
          className="clander"
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "15px",
          }}
        >
          <FormGroup
            style={{ 
              marginBottom: 0, 
              minWidth: "150px", 
              maxWidth: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end"
            }}
          >
            <Label 
              for="fromDate" 
              style={{ 
                color: "#ffffff", 
                marginBottom: "5px", 
                fontSize: "0.875rem",
                lineHeight: "1.2"
              }}
            >
         {t('financialReport.from')}
            </Label>
            <Input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ 
                backgroundColor: "#202a3a", 
                color: "#ffffff", 
                border: "1px solid #3a4555",
                borderRadius: "4px",
                height: "38px",
                padding: "6px 12px",
                width: "100%"
              }}
            />
          </FormGroup>
          <FormGroup
            style={{ 
              marginBottom: 0, 
              minWidth: "150px", 
              maxWidth: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end"
            }}
          >
            <Label 
              for="toDate" 
              style={{ 
                color: "#ffffff", 
                marginBottom: "5px", 
                fontSize: "0.875rem",
                lineHeight: "1.2"
              }}
            >
            {t('financialReport.to')}
            </Label>
            <Input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ 
                backgroundColor: "#202a3a", 
                color: "#ffffff", 
                border: "1px solid #3a4555",
                borderRadius: "4px",
                height: "38px",
                padding: "6px 12px",
                width: "100%"
              }}
            />
          </FormGroup>
        </div>
       <div
        className="buttonn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          height: "38px",
          minHeight: "38px",
        }}
      >
        <Button
          onClick={handleRun}
          disabled={userRole === 1 ? false : !userSubscription && (!isTrialActive() || scheduleCount >= 4)}
          style={{ 
            height: "38px", 
            backgroundColor: "#3d83f1", 
            borderColor: "#3d83f1", 
            color: "#ffffff",
            borderRadius: "4px",
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {t('financialReport.run')}
        </Button>
        <Button
          onClick={handleClear}
          disabled={userRole === 1 ? false : !userSubscription && (!isTrialActive() || scheduleCount >= 4)}
          style={{ 
            height: "38px", 
            backgroundColor: "#888888", 
            borderColor: "#888888", 
            color: "#ffffff",
            borderRadius: "4px",
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {t('financialReport.clearFilters')}
        </Button>

        {/* Search moved here - inline with Run/Clear */}
        {showSearchInput ? (
          <div style={{ position: "relative", width: "180px" }}>
            <Input
              type="text"
              placeholder={t("financialReport.searchJournal")}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                if (value.trim() === "") {
                  setSearchTerm("");
                  setShowSearchInput(false);
                }
              }}
              onBlur={() => {
                if (searchTerm.trim() === "") setShowSearchInput(false);
              }}
              style={{ 
                height: "38px", 
                borderRadius: "4px",
                backgroundColor: "#202a3a",
                color: "#ffffff",
                border: "1px solid #3a4555",
                padding: "6px 12px",
                paddingRight: "35px"
              }}
            />
            <button
              style={{
                position: "absolute", right: "8px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", color: "#ffffff", cursor: "pointer",
                padding: "0", display: "flex", alignItems: "center",
              }}
              onClick={() => { setSearchTerm(""); setShowSearchInput(false); }}
            >
              <FaTimesCircle size={18} />
            </button>
          </div>
        ) : (
          <Search
            size={18}
            onClick={() => setShowSearchInput(true)}
            style={{ cursor: "pointer", color: "#ffffff" }}
          />
        )}
      </div>
      </div>
    );
  };
  const getFilteredItems = () => {
    return filterItemsByTimeRange(items, selectedTimeRange, searchTerm);
  };
  useEffect(() => {
    if (items && items.length > 0) {
      calculateFinancials(items);
    }
  }, [items, selectedTimeRange, searchTerm]);

  const isLandscape = window.innerWidth > window.innerHeight;
const isMobileLandscape = isMobile && isLandscape;
  return (
    <>
      <Helmet>
        <title>Mesob Financial - Mesob Finance</title>
      </Helmet>
 
      <NotificationAlert ref={notificationAlertRef} />

      {userRole === 0 && (
        <div
          className="content"
          style={{
            marginBottom: "-30px",
            minHeight: "100px",
            paddingInline: 15,
          }}
        >
          <Row style={{ margin: "0", padding: 0 }}>
            <Col xs={12} style={{ padding: 0 }}>
              <Card style={{ marginBottom: "5px" }}>
                <CardHeader>
                  <CardTitle style={{ marginBottom: 0 }} tag="h4">
         {t('financialReport.selectUser')}
                  </CardTitle>
                </CardHeader>
                <CardBody style={{ paddingBottom: "5px" }}>
                  <FormGroup style={{ marginBottom: "0" }}>
                    <Label>{t('financialReport.selectUserToView')}</Label>
                    <Select
                      options={userOptions}
                      value={
                        userOptions.find(
                          (option) => option.value === selectedUserId
                        ) || null
                      }
                      onChange={handleUserSelect}
               placeholder={t('financialReport.searchUser')}
                      isClearable
                      isSearchable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: "38px",
                          height: "38px",
                          backgroundColor: "#101926",
                          color: "#ffffff",
                          borderColor: state.isFocused ? "#ffffff" : "#ffffff",
                          boxShadow: state.isFocused ? "0 0 0 1px #ffffff" : "none",
                          "&:hover": {
                            borderColor: "#ffffff",
                          },
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                          padding: "0 6px",
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0px",
                          color: "#ffffff",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#ffffff",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#ffffff",
                          opacity: 0.7,
                        }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: "#101926",
                          border: "1px solid #ffffff",
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          backgroundColor: "#101926",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#2b427d"
                            : state.isFocused
                            ? "#1a2332"
                            : "#101926",
                          color: "#ffffff",
                          cursor: "pointer",
                          "&:active": {
                            backgroundColor: "#2b427d",
                          },
                        }),
                      }}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <div className="content" style={{marginTop:80,  paddingTop: "0", backgroundColor: "#1a273a" }}>
        {/* Transactions Table Section - First */}
        <Container fluid style={{ paddingInline: 0 }}>
          <Row>
            <Col xs={12} style={{ paddingLeft: "1px", paddingRight: "1px" }}>
              <Card style={{ backgroundColor: "#1a273a", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)",paddingBottom:8, borderRadius: "8px" }}>
                <CardHeader
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingInline: 20,
                    
                    backgroundColor: "#1a273a",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  {/* Left Section: RunButtons + Search */}
                  <div className="searchbtn" style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                    <RunButtons
                      onSelectRange={handleSelectRange}
                      onClearFilters={handleClearFilters}
                    />

                    {/* Search */}
                
                  </div>

                  {/* Right Section: Add Transaction + Subscription Info */}
                  <div
                    className="addtransction"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                      <Button
                        onClick={() => setShowDownloadReportModal(true)}
                        disabled={
                          userRole === 1
                            ? false
                            : !userSubscription && !isTrialActive()
                        }
                        style={{ 
                          backgroundColor: "#2b427d", 
                          borderColor: "#2b427d", 
                          color: "#ffffff",
                          height: "38px",
                          borderRadius: "4px",
                          padding: "0 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faDownload}
                          style={{ marginRight: "5px" }}
                        />
                      {t('financialReport.downloadReport')}
                      </Button>
                      {userRole !== 0 && (
                        <Button
                          onClick={() => setShowAddTransaction(true)}
                          disabled={
                            userRole === 1
                              ? false
                              : !userSubscription && !isTrialActive()
                          } // Enable for role 1 even if not subscribed/trial
                        style={{ 
                          backgroundColor: "#11b981", 
                          borderColor: "#11b981", 
                          color: "#ffffff",
                          height: "38px",
                          borderRadius: "4px",
                          padding: "0 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ marginRight: "5px" }}
                          />
                {t('financialReport.addTransaction')}
                        </Button>
                      )}
                    
                      {userRole === 2 && (
                        <UserSubscriptionInfo
                          userSubscription={userSubscription}
                          trialEndDate={trialEndDate}
                          scheduleCount={scheduleCount}
                        />
                      )}
                  </div>
                </CardHeader>
              </Card>
            </Col>
          </Row>

          {/* 2x2 Grid Layout for Summary, Journal Entry, Income Statement, Balance Sheet */}

          {/* Desktop View */}
          <Row className="d-none d-md-flex" style={{ marginTop: "3px" }}>
            <Col
              xs={12}
              md={5}
              style={{ paddingLeft: "1px", paddingRight: "1px" }}
            >
              <Card style={{ marginBottom: "5px", height: "480px", backgroundColor: "#1a273a", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5), 0 3px 10px rgba(0, 0, 0, 0.4)", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle style={{ fontWeight: 600, color: "#22d3ee" }} tag="h4">
                {t('financialReport.summary')}
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "visible",
                    height: "400px",
                    backgroundColor: "#1a273a",
                  }}
                >
                  <div>
                    <div
                        style={{
                        backgroundColor: "#1a2332",
                        padding: "12px 15px",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        border: "1px solid #2a3444",
                      }}
                    >
                      <div style={{ marginBottom: "8px", color: "#ffffff", fontWeight: "bold", fontSize: "0.9rem" }}>
                       {t('financialReport.totalCashOnHand')}:
                      </div>
                      <div
                        style={{
                          color: "#41926f",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                      >
                        $
                        {parseFloat(calculateTotalCash()).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#1a2332",
                        padding: "12px 15px",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        border: "1px solid #2a3444",
                      }}
                    >
                      <div style={{ marginBottom: "8px", color: "#ffffff", fontWeight: "bold", fontSize: "0.9rem" }}>
                        {t('financialReport.totalPayable')}
                      </div>
                      <div
                        style={{
                          color: "#a7565d",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                      >
                        $
                        {parseFloat(calculateTotalPayable()).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </div>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <div style={{ fontWeight: "bold", color: "#ffffff", marginBottom: "12px", fontSize: "0.95rem" }}>
                        {t('financialReport.breakdown')}
                      </div>
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>
                            {t('financialReport.revenue')}
                      </span>
                      <span
                        style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                        }}
                      >
                        $
                        {parseFloat(calculateTotalRevenue()).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>
                       {t('financialReport.totalExpense')}
                      </span>
                      <span
                        style={{
                              color: "#a7565d",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                        }}
                      >
                        $
                        {parseFloat(
                          calculateTotalExpenses(true)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                        <div style={{ marginTop: "12px", marginBottom: "12px", borderTop: "1px solid #2a3444", paddingTop: "12px" }}>
                      {Object.entries(expenses)
                        .filter(([purpose, amount]) => {
                          const filteredItems = getFilteredItems();
                          return filteredItems.some(
                            (item) =>
                              item.transactionPurpose === purpose &&
                              (item.transactionType === "Pay" ||
                                (item.transactionType === "Payable" &&
                                  item.status !== "Paid"))
                          );
                        })
                        .map(([purpose, amount]) => {
                          const filteredItems = getFilteredItems();
                          const totalAmount = filteredItems.reduce(
                            (sum, item) => {
                              if (
                                item.transactionPurpose === purpose &&
                                (item.transactionType === "Pay" ||
                                  (item.transactionType === "Payable" &&
                                    item.status !== "Paid"))
                              ) {
                                return (
                                  sum + parseFloat(item.transactionAmount || 0)
                                );
                              }
                              return sum;
                            },
                            0
                          );

                          const isPaid = filteredItems.some(
                            (item) =>
                              item.transactionPurpose === purpose &&
                              item.transactionType === "Payable" &&
                              item.status === "Paid"
                          );

                          return (
                            <div
                              key={purpose}
                              style={{
                                    marginBottom: "8px",
                                display: "flex",
                                    justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                                  <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>
                                  <span style={{ color: "#ffffff", fontSize: "0.9rem", marginLeft:"10px" }}>
                                   {translatePurpose(purpose)}:
                                </span>
                              </span>
                              <span
                                style={{
                                      color: isPaid
                                        ? "#c7ae4f"
                                        : "#a7565d",
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
                                }}
                              >
                                $
                                {totalAmount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px", height: "480px", backgroundColor: "#1a273a", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5), 0 3px 10px rgba(0, 0, 0, 0.4)", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle tag="h4" style={{ fontWeight: 600, color: "#22d3ee"  }}>
                   {t('financialReport.incomeStatement')}
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    height: "380px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "15px",
                    backgroundColor: "#1a273a",
                  }}
                >
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "visible",
                      width: "100%",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        tableLayout: "auto",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                            <strong>{t('financialReport.revenueManualSales')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff", textAlign: "right" }}
                          >
                            ${Object.values(revenues).reduce((sum, amt) => sum + parseFloat(amt || 0), 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#22d3ee", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalRevenue')}</strong>
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              textAlign: "right",
                            }}
                          >
                            $
                            {parseFloat(calculateTotalRevenue()).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                            <strong>{t('financialReport.expenses')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>

                        {Object.entries(expenses)
                          .filter(([purpose, amount]) => {
                            const filteredItems = getFilteredItems();
                            return filteredItems.some(
                              (item) =>
                                item.transactionPurpose === purpose &&
                                (item.transactionType === "Pay" ||
                                  (item.transactionType === "Payable" &&
                                    item.status !== "Paid"))
                            );
                          })
                          .map(([purpose, amount]) => {
                            const filteredItems = getFilteredItems();
                            const totalAmount = filteredItems.reduce(
                              (sum, item) => {
                                if (
                                  item.transactionPurpose === purpose &&
                                  (item.transactionType === "Pay" ||
                                    (item.transactionType === "Payable" &&
                                      item.status !== "Paid"))
                                ) {
                                  return (
                                    sum +
                                    parseFloat(item.transactionAmount || 0)
                                  );
                                }
                                return sum;
                              },
                              0
                            );

                            return (
                              <tr key={`expense-${purpose}`}>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #3a4555",
                                    color: "#ffffff",
                                  }}
                                >
                                  {t('financialReport.expenses')} ({purpose})
                                </td>
                                <td
                                  style={{
                                    color: "#ffffff",
                                    padding: "8px",
                                    border: "1px solid #3a4555",
                                    textAlign: "right",
                                  }}
                                >
                                  $
                                  {totalAmount.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            );
                          })}

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#a7565d", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalExpenses')}</strong>
                          </td>
                          <td
                            style={{
                              color: "#a7565d",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              textAlign: "right",
                            }}
                          >
                            $
                            {parseFloat(
                              calculateTotalExpenses()
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                           <strong>
  {parseFloat(calculateTotalRevenue()) - parseFloat(calculateTotalExpenses()) < 0
    ? t('financialReport.netLoss')
    : t('financialReport.netIncome')}
</strong>
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              textAlign: "right",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col
              xs={12}
              md={7}
              style={{ paddingLeft: "1px", paddingRight: "1px" }}
            >
              <Card style={{ marginBottom: "5px", height: "480px", backgroundColor: "#1a273a", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle style={{ fontWeight: 600, color: "#22d3ee"  }} tag="h4">
              {t('financialReport.journalEntry')}
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    height: "380px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "10px",
                    backgroundColor: "#1a273a",
                  }}
                >
                  {loadingTransactions ? (
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%", minHeight: "300px" }}>
                      <Spinner color="primary" />
                      <p style={{ color: "#ffffff", marginTop: "1rem" }}>{t('financialReport.loadingTransactions')}</p>
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <TransactionTable
                        items={filterItemsByTimeRange(
                          items,
                          selectedTimeRange,
                          searchTerm
                        )}
                        disabled={
                          userRole === 1
                            ? false
                            : !userSubscription && scheduleCount >= 4
                        }
                        selectedTimeRange={selectedTimeRange}
                        handleDelete={handleDelete}
                        handleAddExpense={handleAddExpense}
                        handleReceiptClick={handleReceiptClick}
                        scheduleCount={scheduleCount}
                        userSubscription={userSubscription}
                      />
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px", height: "480px", backgroundColor: "#1a273a", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle tag="h4" style={{ fontWeight: 600, color: "#22d3ee" }}>
              {t('financialReport.balanceSheet')}
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    height: "380px",
                    overflowX: "hidden",
                    padding: "15px",
                    backgroundColor: "#1a273a",
                  }}
                >
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "visible",
                      width: "100%",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        tableLayout: "auto",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: "40%",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              color: "#ffffff",
                            }}
                          >
                            <strong>{t('financialReport.assets')}</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              color: "#ffffff",
                            }}
                          >
                            <strong>{t('financialReport.amount2')}</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              color: "#ffffff",
                            }}
                          >
                            <strong>{t('financialReport.amount2')}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                          {t('financialReport.cash')}
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {parseFloat(calculateTotalCash()).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                          {t('financialReport.inventory')}
                          </td>
                          <td
                            style={{
                              color: "#ffffff",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {parseFloat(
                              calculateTotalInventory()
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#22d3ee", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalAssets')}</strong>
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.liabilitiesEquity')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                      {t('financialReport.payable')}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#c7ae4f",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {parseFloat(calculateTotalPayable()).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                          {t('financialReport.beginningEquity')}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#ffffff",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              initialBalance +
                              initialvalueableItems -
                              initialoutstandingDebt
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                          {t('financialReport.retainedEarnings')}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#41926f",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#22d3ee", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalLiabilitiesEquity')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalPayable()) +
                              (initialBalance + initialvalueableItems - initialoutstandingDebt) +
                              (parseFloat(calculateTotalRevenue()) - parseFloat(calculateTotalExpenses()))
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                       
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555" }}
                          >
                            <strong>{t('common.total')}</strong>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalPayable()) +
                              initialBalance +
                              initialvalueableItems -
                              initialoutstandingDebt +
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Mobile View */}
          <Row className="d-flex d-md-none" style={{ marginTop: "3px" }}>
            <Col xs={12} style={{ paddingLeft: "1px", paddingRight: "1px" }}>
              <Card style={{ marginBottom: "5px", backgroundColor: "#1a273a", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle style={{ fontWeight: 600, color: "#2b427d" }} tag="h4">
                   {t('financialReport.summary')}
                  </CardTitle>
                </CardHeader>
                <CardBody style={{ overflowY: "auto", overflowX: "visible", backgroundColor: "#1a273a" }}>
                  <div>
                    <div
                        style={{
                        backgroundColor: "#1a2332",
                        padding: "12px 15px",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        border: "1px solid #2a3444",
                      }}
                    >
                      <div style={{ marginBottom: "8px", color: "#ffffff", fontWeight: "bold", fontSize: "0.9rem" }}>
                      {t('financialReport.totalCashOnHand')}
                      </div>
                      <div
                        style={{
                          color: "#41926f",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                      >
                        ${calculateTotalCash()}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#1a2332",
                        padding: "12px 15px",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        border: "1px solid #2a3444",
                      }}
                    >
                      <div style={{ marginBottom: "8px", color: "#ffffff", fontWeight: "bold", fontSize: "0.9rem" }}>
                {t('financialReport.totalPayable')}
                      </div>
                      <div
                        style={{
                          color: "#a7565d",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                      >
                        $
                        {parseFloat(calculateTotalPayable()).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </div>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <div style={{ fontWeight: "bold", color: "#ffffff", marginBottom: "12px", fontSize: "0.95rem" }}>
                       {t('financialReport.breakdown')}
                      </div>
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>
                           {t('financialReport.revenue')}
                      </span>
                      <span
                        style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                        }}
                      >
                        $
                        {parseFloat(calculateTotalRevenue()).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>
                     {t('financialReport.totalExpense')}
                      </span>
                      <span
                        style={{
                              color: "#a7565d",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                        }}
                      >
                        $
                        {parseFloat(
                          calculateTotalExpenses(true)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                        <div style={{ marginTop: "12px", marginBottom: "12px", borderTop: "1px solid #2a3444", paddingTop: "12px" }}>
                      {Object.entries(expenses)
                        .filter(([purpose, amount]) => {
                          const filteredItems = getFilteredItems();
                          return filteredItems.some(
                            (item) =>
                              item.transactionPurpose === purpose &&
                              (item.transactionType === "Pay" ||
                                (item.transactionType === "Payable" &&
                                  item.status !== "Paid"))
                          );
                        })
                        .map(([purpose, amount]) => {
                          const filteredItems = getFilteredItems();
                          const totalAmount = filteredItems.reduce(
                            (sum, item) => {
                              if (
                                item.transactionPurpose === purpose &&
                                (item.transactionType === "Pay" ||
                                  (item.transactionType === "Payable" &&
                                    item.status !== "Paid"))
                              ) {
                                return (
                                  sum + parseFloat(item.transactionAmount || 0)
                                );
                              }
                              return sum;
                            },
                            0
                          );

                          const isPaid = filteredItems.some(
                            (item) =>
                              item.transactionPurpose === purpose &&
                              item.transactionType === "Payable" &&
                              item.status === "Paid"
                          );

                          return (
                            <div
                              key={purpose}
                              style={{
                                    marginBottom: "8px",
                                display: "flex",
                                    justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                                  <span style={{ color: "#ffffff", fontSize: "0.9rem" }}>
                                    {purpose}:
                              </span>
                              <span
                                style={{
                                      color: isPaid
                                        ? "#c7ae4f"
                                        : "#a7565d",
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
                                }}
                              >
                                $
                                {totalAmount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px" }}>
                <CardHeader>
                  <CardTitle style={{ fontWeight: 600 }} tag="h4">
                    Journal Entry
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "10px",
                  }}
                >
                  {loadingTransactions ? (
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%", minHeight: "300px" }}>
                      <Spinner color="primary" />
                      <p style={{ color: "#ffffff", marginTop: "1rem" }}>Loading transactions...</p>
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <TransactionTable
                        items={filterItemsByTimeRange(
                          items,
                          selectedTimeRange,
                          searchTerm
                        )}
                        disabled={
                          userRole === 1
                            ? false
                            : !userSubscription && scheduleCount >= 4
                        }
                        selectedTimeRange={selectedTimeRange}
                        handleDelete={handleDelete}
                        handleAddExpense={handleAddExpense}
                        handleReceiptClick={handleReceiptClick}
                        scheduleCount={scheduleCount}
                        userSubscription={userSubscription}
                      />
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px", backgroundColor: "#1a273a", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle tag="h4" style={{ fontWeight: 600, color: "#22d3ee"   }}>
               {t('financialReport.incomeStatement')}
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "15px",
                    backgroundColor: "#1a273a",
                  }}
                >
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "visible",
                      width: "100%",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        tableLayout: "auto",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555" }}
                          >
                            <strong>Revenue</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        {Object.entries(revenues).map(([purpose, amount]) => (
                          <tr key={`revenue-${purpose}`}>
                            <td
                              style={{
                                padding: "8px",
                                border: "1px solid #3a4555",
                              }}
                            >
                              {purpose}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#1a273a",
                                color: "#ffffff",
                                padding: "8px",
                                border: "1px solid #3a4555",
                                textAlign: "right",
                              }}
                            >
                              $
                              {amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#2b427d", fontWeight: "bold" }}
                          >
                            <strong>Total Revenue</strong>
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              textAlign: "right",
                            }}
                          >
                            $
                            {parseFloat(calculateTotalRevenue()).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                            <strong>{t('financialReport.expenses')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>

                        {Object.entries(expenses)
                          .filter(([purpose, amount]) => {
                            const filteredItems = getFilteredItems();
                            return filteredItems.some(
                              (item) =>
                                item.transactionPurpose === purpose &&
                                (item.transactionType === "Pay" ||
                                  (item.transactionType === "Payable" &&
                                    item.status !== "Paid"))
                            );
                          })
                          .map(([purpose, amount]) => {
                            const filteredItems = getFilteredItems();
                            const totalAmount = filteredItems.reduce(
                              (sum, item) => {
                                if (
                                  item.transactionPurpose === purpose &&
                                  (item.transactionType === "Pay" ||
                                    (item.transactionType === "Payable" &&
                                      item.status !== "Paid"))
                                ) {
                                  return (
                                    sum +
                                    parseFloat(item.transactionAmount || 0)
                                  );
                                }
                                return sum;
                              },
                              0
                            );

                            return (
                              <tr key={`expense-${purpose}`}>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #3a4555",
                                    color: "#ffffff",
                                  }}
                                >
                                  {t('financialReport.expenses')} ({purpose})
                                </td>
                                <td
                                  style={{
                                    color: "#ffffff",
                                    padding: "8px",
                                    border: "1px solid #3a4555",
                                    textAlign: "right",
                                  }}
                                >
                                  $
                                  {totalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            );
                          })}

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#a7565d", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalExpenses')}</strong>
                          </td>
                          <td
                            style={{
                              color: "#a7565d",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              textAlign: "right",
                            }}
                          >
                            $
                            {parseFloat(
                              calculateTotalExpenses()
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff", fontWeight: "bold" }}
                          >
                          <strong>
  {parseFloat(calculateTotalRevenue()) - parseFloat(calculateTotalExpenses()) < 0
    ? t('financialReport.netLoss')
    : t('financialReport.netIncome')}
</strong>
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              textAlign: "right",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px", backgroundColor: "#1a273a", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)", borderRadius: "8px" }}>
                <CardHeader style={{ backgroundColor: "#1a273a" }}>
                  <CardTitle tag="h4" style={{ fontWeight: 600, color: "#22d3ee"  }}>
                 {t('financialReport.balanceSheet')}
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "15px",
                    backgroundColor: "#1a273a",
                  }}
                >
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "visible",
                      width: "100%",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        tableLayout: "auto",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: "40%",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              color: "#ffffff",
                            }}
                          >
                            <strong>{t('financialReport.assets')}</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              color: "#ffffff",
                            }}
                          >
                            <strong>{t('financialReport.amount2')}</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                              color: "#ffffff",
                            }}
                          >
                            <strong>{t('financialReport.amount2')}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                            {t('financialReport.cash')}
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {parseFloat(calculateTotalCash()).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                          {t('financialReport.inventory')}
                          </td>
                          <td
                            style={{
                              color: "#ffffff",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {parseFloat(
                              calculateTotalInventory()
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#22d3ee", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalAssets')}</strong>
                          </td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.liabilitiesEquity')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                            {t('financialReport.payable')}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#c7ae4f",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {parseFloat(calculateTotalPayable()).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                           {t('financialReport.beginningEquity')}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#ffffff",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              initialBalance +
                              initialvalueableItems -
                              initialoutstandingDebt
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          >
                           {t('financialReport.retainedEarnings')}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#41926f",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#22d3ee", fontWeight: "bold" }}
                          >
                            <strong>{t('financialReport.totalLiabilitiesEquity')}</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #3a4555", color: "#ffffff" }}
                          ></td>
                          <td
                            style={{
                              color: "#41926f",
                              fontWeight: "bold",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #3a4555",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalPayable()) +
                              (initialBalance + initialvalueableItems - initialoutstandingDebt) +
                              (parseFloat(calculateTotalRevenue()) - parseFloat(calculateTotalExpenses()))
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
        {/* <Modal
          isOpen={showDeleteConfirmation}
          toggle={() => setShowDeleteConfirmation(false)}
        >
          <ModalHeader toggle={() => setShowDeleteConfirmation(false)}>
         {t('financialReport.confirmDelete')}
          </ModalHeader>
          <ModalBody>
           {t('financialReport.confirmDeleteMessage')}
            <div className="modal-footer">
              <Button
                color="danger"
                onClick={() => {
                  confirmDeleteandsave();
                }}
              >
              {t('financialReport.saveAndDeleteAll')}
              </Button>
              <Button
                color="secondary"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button color="danger" onClick={confirmDelete}>
             {t('financialReport.deleteAll')}
              </Button>
            </div>
          </ModalBody>
        </Modal> */}

        <Modal
          isOpen={showAddTransaction}
          toggle={() => {
            resetForm();
            setShowAddTransaction(false);
          }}
          className="add-transaction-modal"
        >
          <ModalHeader
            toggle={() => {
              resetForm();
              setShowAddTransaction(false);
            }}
          >
            {editingTransaction ? t('financialReport.editTransaction') : t('financialReport.addTransaction')}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>{t('financialReport.type')}:</Label>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  color={
                    transactionType === "receive" ? "primary" : "secondary"
                  }
                  className="transaction-type-btn"
                  onClick={() => {
                    setTransactionType("receive");
                    setPaymentMode(null);
                  }}
                >
                 {t('financialReport.receivedCash')}
                </Button>
                <Button
                  color={transactionType === "pay" ? "primary" : "secondary"}
                  className="transaction-type-btn"
                  onClick={() => {
                    setTransactionType("pay");
                    setPaymentMode(null);
                  }}
                >
                {t('financialReport.paidCash')}
                </Button>
                <Button
                  color={
                    transactionType === "Payable" ? "primary" : "secondary"
                  }
                  className="transaction-type-btn"
                  onClick={() => {
                    setTransactionType("Payable");
                    setPaymentMode(null);
                  }}
                >
                  {t('financialReport.haventYetPaid')}
                </Button>
              </div>
            </FormGroup>
            {/* Show action buttons for Pay Cash */}
            {transactionType === "pay" && (
              <FormGroup>
                <Label>{t('financialReport.selectAction')}:</Label>
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <Button
                    color="primary"
                    className="transaction-action-btn"
                    onClick={() => {
                      setsubType("Recorded");
                      setPaymentMode("recorded");
                    }}
                  >
                   {t('financialReport.recordedEarlierAsPayable')}
                  </Button>

                  <Button
                    color="primary"
                    className="transaction-action-btn action-expense"
                    onClick={() => {
                      setsubType("Expense");
                      setPaymentMode("new");
                    }}
                  >
             {t('financialReport.newExpense')}
                  </Button>
                  <Button
                    color="warning"
                    className="transaction-action-btn action-new-item"
                    onClick={() => {
                      setsubType("New_Item");
                      setPaymentMode("boughtItem");
                    }}
                  >
                 {t('financialReport.boughtNewItem')}
                  </Button>
                </div>
              </FormGroup>
            )}
            {/* Show dropdown for recorded payment mode under Pay Cash */}
            {selectedBusinessType === "Other" && (
              <div className="manual-purpose-management">
                <h4>{t('financialReport.manageCustomPurposes')}</h4>
                <Input
                  type="text"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                placeholder={t('financialReport.enterNewPurpose')}
                />
                <Input
                  type="select"
                  value={purposeType}
                  onChange={(e) => setPurposeType(e.target.value)}
                >
                  <option value="income">{t('financialReport.incomePurpose')}</option>
                  <option value="expense">{t('financialReport.expensePurpose')}</option>
                  <option value="payable">{t('financialReport.payablePurpose')}</option>
                </Input>
                <Button onClick={handleAddPurpose}>{t('financialReport.addPurpose')}</Button>
              </div>
            )}

            {transactionType === "pay" && paymentMode === "recorded" && (
              <>
                
                <FormGroup>
                  <Label>{t('financialReport.selectUnpaidTransaction')}:</Label>
                  <Input
                    type="select"
                    value={
                      selectedUnpaidTransaction
                        ? selectedUnpaidTransaction.id
                        : ""
                    }
                    onChange={(e) => {
                      const selected = unpaidTransactions.find(
                        (t) =>
                          t.id ===
                          (e.target.value === "outstanding-debt"
                            ? e.target.value
                            : parseInt(e.target.value))
                      );
                      setSelectedUnpaidTransaction(selected);
                      setPaymentOption(null);
                      setPartialPaymentError(null); // Add this line
                    }}
                  >
                    <option value="">{t('financialReport.selectTransaction')}</option>
                    {unpaidTransactions
                      .filter(
                        (t) => t.status !== "Paid" && t.transactionAmount !== 0
                      )
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.transactionPurpose} - $
                          {t.transactionAmount.toFixed(2)}
                        </option>
                      ))}
                  </Input>
                </FormGroup>

                {selectedUnpaidTransaction && (
                  <FormGroup tag="fieldset">
                    <legend>{t('financialReport.paymentOption')}:</legend>
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="radio"
                          name="paymentOption"
                          value="full"
                          checked={paymentOption === "full"}
                          onChange={() => setPaymentOption("full")}
                        />{" "}
                      {t('financialReport.fullPayment')}
                      </Label>
                    </FormGroup>
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="radio"
                          name="paymentOption"
                          value="partial"
                          checked={paymentOption === "partial"}
                          onChange={() => setPaymentOption("partial")}
                        />{" "}
                    {t('financialReport.partialPayment')}
                      </Label>
                    </FormGroup>
                  </FormGroup>
                )}

               
                {selectedUnpaidTransaction && paymentOption === "partial" && (
                  <FormGroup>
                    <Label>{t('financialReport.partialPaymentAmount')}:</Label>
                    <Input
                      type="number"
                      value={remainingAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setRemainingAmount(e.target.value);

                        // Validate that partial payment is less than total amount
                        if (
                          value >= selectedUnpaidTransaction.transactionAmount
                        ) {
                          setPartialPaymentError(
                            `Partial payment must be less than $${selectedUnpaidTransaction.transactionAmount.toFixed(
                              2
                            )}`
                          );
                        } else if (value <= 0) {
                          setPartialPaymentError(
                            "Amount must be greater than $0"
                          );
                        } else {
                          setPartialPaymentError(null);
                        }
                      }}
                      min="0.01"
                      max={selectedUnpaidTransaction.transactionAmount - 0.01}
                      step="0.01"
                      invalid={!!partialPaymentError}
                    />
                    {partialPaymentError && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {partialPaymentError}
                      </div>
                    )}
                    <small className="text-muted">
                      Maximum: $
                      {(
                        selectedUnpaidTransaction.transactionAmount - 0.01
                      ).toFixed(2)}
                    </small>
                  </FormGroup>
                )}
                {/* Receipts form */}
                <FormGroup>
                  <Label>{t('financialReport.receipt')}:</Label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Button
                      color="info"
                      onClick={() => fileInputRef.current.click()}
                      style={{ marginBottom: "0" }}
                    >
                     {receipt ? t('financialReport.changeReceipt') : t('financialReport.uploadReceipt')}
                    </Button>
                    {receipt && (
                      <span style={{ color: "green" }}>✓ {receipt.name}</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    innerRef={fileInputRef}
                    onChange={handleReceiptUpload}
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                  />
                </FormGroup>
                <Button
                  color="success"
                  onClick={() =>
                    handleUpdateTransaction(selectedUnpaidTransaction)
                  }
                  // disabled={!selectedUnpaidTransaction || isUpdatingTransaction}
                  disabled={
                    paymentOption === "partial" &&
                    (!remainingAmount ||
                      partialPaymentError ||
                      parseFloat(remainingAmount) >=
                        selectedUnpaidTransaction.transactionAmount ||
                      parseFloat(remainingAmount) <= 0)
                  }
                >
                  {isUpdatingTransaction ? (
                    <Spinner size="sm" />
                  ) : (
                    "Update to Paid"
                  )}
                </Button>
              </>
            )}
            {transactionType === "pay" && paymentMode === "boughtItem" && (
              <>
                <FormGroup>
                  <Label>{t('financialReport.itemDescription')}:</Label>
                  <Input
                    type="select"
                    value={isManual}
                    onChange={(e) => setIsManual(e.target.value)}
                  >
                    <option value="">{t('financialReport.selectOption')}</option>
                    <option value="manual">{t('financialReport.enterManually')}</option>
                  </Input>

                 

                  {/* ----------  NEW VALIDATION FOR MANUAL DESCRIPTION ---------- */}
                  {isManual === "manual" && (
                    <FormGroup className="mt-2">
                      <Input
                        type="text"
                       placeholder={t('financialReport.enterItemDescription')}
                        value={manualPurpose}
                        onChange={(e) => {
                          setManualPurpose(e.target.value);
                          // clear the error when the user starts typing
                          setFormErrors({ ...formErrors, manualPurpose: "" });
                        }}
                        invalid={!!formErrors.manualPurpose}
                      />
                      {formErrors.manualPurpose && (
                        <div
                          className="text-danger"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {formErrors.manualPurpose}
                        </div>
                      )}
                    </FormGroup>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>{t('financialReport.amount')}:</Label>
                  <Input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('financialReport.receipt')}:</Label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Button
                      color="info"
                      onClick={() => fileInputRef.current.click()}
                      style={{ marginBottom: "0" }}
                    >
                {receipt ? t('financialReport.changeReceipt') : t('financialReport.uploadReceipt')}
                    </Button>
                    {receipt && (
                      <span style={{ color: "green" }}>✓ {receipt.name}</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    innerRef={fileInputRef}
                    onChange={handleReceiptUpload}
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                  />
                </FormGroup>
               
                <Button
                  color="success"
                  onClick={handleAddTransaction}
                  disabled={
                    isAddingTransaction ||
                    (isManual === "manual" && !manualPurpose.trim())
                  }
                >
                  {isAddingTransaction ? <Spinner size="sm" /> : t('financialReport.save')}
                </Button>
              </>
            )}
            {/* Show regular form fields for other cases */}
            {(transactionType === "receive" ||
              (transactionType === "pay" && paymentMode === "new") ||
              transactionType === "Payable") && (
              <>
                <FormGroup>
                  <Label>{t('financialReport.purpose')}:</Label>

                  <Input
                    type="select"
                    value={transactionPurpose}
                    onChange={(e) => setTransactionPurpose(e.target.value)}
                  >
             <option value="">{t('financialReport.selectPurpose')}</option>
                    {transactionType === "receive" && (
                      <>
                        {incomePurposes.map((purpose, index) => (
                          <option key={index} value={purpose}>
                            {purpose}
                          </option>
                        ))}
                        <option value="manual">{t('financialReport.enterManually')}</option>
                      </>
                    )}
                    {transactionType === "pay" && paymentMode === "new" && (
                      <>
                        {expensePurposes.map((purpose, index) => (
                          <option key={index} value={purpose}>
                            {purpose}
                          </option>
                        ))}
                        <option value="manual">{t('financialReport.enterManually')}</option>
                      </>
                    )}
                    {transactionType === "Payable" && (
                      <>
                        {payablePurposes.map((purpose, index) => (
                          <option key={index} value={purpose}>
                            {purpose}
                          </option>
                        ))}
                        <option value="manual">{t('financialReport.enterManually')}</option>
                      </>
                    )}
                  </Input>
                  {((transactionType === "receive" &&
                    transactionPurpose === "manual") ||
                    (transactionType === "pay" &&
                      paymentMode === "new" &&
                      transactionPurpose === "manual") ||
                    (transactionType === "Payable" &&
                      transactionPurpose === "manual")) && (
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder="Enter purpose manually"
                        value={manualPurpose}
                        onChange={(e) => {
                          setManualPurpose(e.target.value);
                          setFormErrors({ ...formErrors, manualPurpose: "" });
                        }}
                        style={{ marginTop: "10px" }}
                        invalid={!!formErrors.manualPurpose}
                      />
                      {formErrors.manualPurpose && (
                        <div className="text-danger">
                          {formErrors.manualPurpose}
                        </div>
                      )}
                    </FormGroup>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>{t('financialReport.amount')}:</Label>
                  <Input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </FormGroup>
                {transactionType === "pay" && paymentMode === "new" && (
                  <FormGroup>
                    <Label>Receipt:</Label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Button
                        color="info"
                        onClick={() => fileInputRef.current.click()}
                        style={{ marginBottom: "0" }}
                      >
                        {receipt ? "Change Receipt" : "Upload Receipt"}
                      </Button>
                      {receipt && (
                        <span style={{ color: "green" }}>✓ {receipt.name}</span>
                      )}
                    </div>
                    <Input
                      type="file"
                      innerRef={fileInputRef}
                      onChange={handleReceiptUpload}
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                    />
                  </FormGroup>
                )}
                <Button
  color="success"
  onClick={handleAddTransaction}
  disabled={isAddingTransaction}
>
  {isAddingTransaction ? <Spinner size="sm" /> : t('financialReport.save')}
</Button>
              </>
            )}
          </ModalBody>
        </Modal>
        {/* Previe modal */}
        <Modal
          isOpen={previewModal}
          toggle={() => setPreviewModal(false)}
          size="lg"
        >
          <ModalHeader toggle={() => setPreviewModal(false)}>
            {t('receipts.receiptPreview')}
          </ModalHeader>
          <ModalBody>
            {selectedReceipt?.receiptUrl && (
              <>
                {selectedReceipt.receiptUrl.endsWith(".pdf") ? (
                  <object
                    data={selectedReceipt.receiptUrl}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  >
                    <p>
                      Your browser does not support PDFs.{" "}
                      <a
                        href={selectedReceipt.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View PDF
                      </a>
                    </p>
                  </object>
                ) : (
                  <img
                    src={selectedReceipt.receiptUrl}
                    alt="Receipt"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                      objectFit: "contain",
                    }}
                  />
                )}
              </>
            )}
          </ModalBody>
        </Modal>

        <Modal
          isOpen={showInstallmentModal}
          toggle={() => setShowInstallmentModal(false)}
        >
          <ModalHeader toggle={() => setShowInstallmentModal(false)}>
            {t('financialReport.installmentPaymentFor')}{" "}
            {selectedUnpaidTransaction?.transactionPurpose}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>{t('financialReport.selectPaymentType')}:</Label>
              <div>
                <Button color="primary" onClick={handleFullPayment}>
                 {t('financialReport.payFullAmount')} ($
                  {selectedUnpaidTransaction?.transactionAmount})
                </Button>
                <Button
                  color="primary"
                  onClick={() => setShowInstallmentInput(true)}
                >
         {t('financialReport.payInstallment')}
                </Button>
              </div>
            </FormGroup>
            {showInstallmentInput && (
              <FormGroup>
                <Label>{t('financialReport.installmentAmount')}:</Label>
                <Input
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  max={selectedUnpaidTransaction?.transactionAmount}
                />
              </FormGroup>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="success" onClick={handleInstallmentPayment}>
         {t('financialReport.pay2')}
            </Button>
            <Button
              color="secondary"
              onClick={() => setShowInstallmentModal(false)}
            >
          {t('common.cancel')}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Download Report Modal */}
        <DownloadReportModal
          isOpen={showDownloadReportModal}
          toggle={() => setShowDownloadReportModal(false)}
          companyName={companyName}
          items={filterItemsByTimeRange(items, selectedTimeRange, searchTerm)}
          revenues={revenues}
          expenses={expenses}
          initialBalance={initialBalance}
          initialvalueableItems={initialvalueableItems}
          initialoutstandingDebt={initialoutstandingDebt}
          calculateTotalCash={calculateTotalCash}
          calculateTotalRevenue={calculateTotalRevenue}
          calculateTotalExpenses={calculateTotalExpenses}
          calculateTotalPayable={calculateTotalPayable}
          calculateTotalInventory={calculateTotalInventory}
          searchedDates={searchedDates}
        />
      </div>
    </>
  );
};

export default MesobFinancial2;
