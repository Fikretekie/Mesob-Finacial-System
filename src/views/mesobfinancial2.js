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
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import TransactionTable from "./TransactionTable";
import { AddExpenseButton } from "components/AddExpenseButton";
import IncomeStatement from "components/IncomeStatement";
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
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [showInstallmentInput, setShowInstallmentInput] = useState(false);
  const [paymentOption, setPaymentOption] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const dispatch = useDispatch();
  const selectedUser = useSelector((state) => state.selectedUser);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const firstLoadRef = useRef(true);
  const hasShownNotifyRef = useRef(false);

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
  const getBusinessPurposes = (type) => {
    if (type === "Other") {
      return {
        income: manualIncomePurposes,
        expenses: manualExpensePurposes,
        payables: manualPayablePurposes,
      };
    } else if (businessTypes[type]) {
      return businessTypes[type];
    } else {
      return {
        income: [],
        expenses: [],
        payables: [],
      };
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
        "Please select a transaction and enter an installment amount",
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
        `Installment amount cannot exceed the remaining amount of $${remainingAmount}`,
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
      notify("tr", "Installment payment recorded successfully", "success");

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
      notify("tr", "No receipt available for this transaction", "warning");
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
        "Failed to upload receipt. Please try another file.",
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
      notify("tr", "Error fetching users", "danger");
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
      notify("tr", "Please fill in all fields", "warning");
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
        transactionPurpose: `${transactionPurpose}${manualPurpose ? ` ${manualPurpose}` : ""
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
            ? "New item purchase recorded successfully"
            : "Transaction added successfully";
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

    console.log("Original file:", {
      name: receipt.name,
      type: receipt.type,
      sizeMB: (receipt.size / (1024 * 1024)).toFixed(2) + " MB",
    });

    let fileToUpload = receipt;

    if (receipt.size > maxFileSize && receipt.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 4.0,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        notify("tr", "Compressing large image before upload...", "info");
        console.log("Compressing image...");

        const compressedFile = await imageCompression(receipt, options);

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
        return;
      }
    } else if (receipt.size > maxFileSize) {
      notify(
        "tr",
        "File larger than 4.9 MB and cannot be compressed.",
        "danger"
      );
      return;
    }

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

    const fileContent = await toBase64(fileToUpload);

    console.log(
      "Base64 size (approx MB):",
      ((fileContent.length * 3) / 4 / (1024 * 1024)).toFixed(2)
    );

    const payload = {
      fileName: fileToUpload.name,
      fileType: fileToUpload.type,
      fileContent,
      userId: localStorage.getItem("userId"),
    };

    console.log(
      "Payload size (MB):",
      (JSON.stringify(payload).length / (1024 * 1024)).toFixed(2)
    );

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

  // const handleUpdateTransaction = async (transaction) => {
  //   console.log("Transaction ID:", transaction.id);
  //   let Url = "";
  //   if (receipt) {
  //     Url = await uploadReceipt();
  //   }
  //   const paidAmount =
  //     paymentOption === "full"
  //       ? parseFloat(transaction.transactionAmount)
  //       : parseFloat(remainingAmount);

  //   setIsUpdatingTransaction(true);
  //   try {
  //     if (transaction.id !== "outstanding-debt") {
  //       if (paidAmount > remainingAmount && paymentOption !== "full") {
  //         notify(
  //           "tr",
  //           `Payment amount cannot exceed the remaining amount of $${remainingAmount}`,
  //           "warning"
  //         );
  //         return;
  //       }

  //       const updatedTransaction = {
  //         ...transaction,
  //         receiptUrl: Url || transaction.receiptUrl,
  //         status:
  //           paymentOption === "full" ||
  //           (paymentOption === "partial" &&
  //             remainingAmount === transaction.transactionAmount)
  //             ? "Paid"
  //             : "Partially Paid",
  //         updatedAt: new Date().toISOString(),
  //         paidAmount: (transaction.paidAmount || 0) + paidAmount,
  //         transactionAmount:
  //           parseFloat(transaction.transactionAmount) -
  //           parseFloat(remainingAmount),
  //         remainingAmount: paidAmount,
  //       };

  //       const response = await fetch(
  //         `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transaction.id}`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(updatedTransaction),
  //         }
  //       );

  //       if (response.status !== 200) {
  //         throw new Error("Failed to update the transaction");
  //       }
  //     } else {
  //       setIsUpdatingTransaction(true);
  //       let userid = localStorage.getItem("userId");
  //       const response = await axios.put(
  //         `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userid}`,
  //         {
  //           outstandingDebt:
  //             paymentOption === "full"
  //               ? parseFloat(transaction.transactionAmount) -
  //                 parseFloat(transaction.transactionAmount)
  //               : parseFloat(transaction.transactionAmount) -
  //                 parseFloat(remainingAmount),
  //         }
  //       );

  //       if (response.status !== 200) {
  //         throw new Error("Failed to update outstanding debt");
  //       }
  //     }

  //     const newPaidTransaction = {
  //       userId: localStorage.getItem("userId"),
  //       transactionType: "Pay",
  //       transactionPurpose:
  //         transaction.id === "outstanding-debt"
  //           ? "Payment for Outstanding Debt"
  //           : paymentOption === "full"
  //           ? `Full Payment for ${transaction.transactionPurpose}`
  //           : `Partial Payment for ${transaction.transactionPurpose}`,
  //       transactionAmount: paidAmount,
  //       receiptUrl: Url || "",
  //       payableId: transaction.id,
  //       createdAt: new Date().toISOString(),
  //     };

  //     const response2 = await axios.post(
  //       "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
  //       newPaidTransaction
  //     );

  //     if (response2.status === 200) {
  //       notify("tr", "Payment recorded successfully", "success");
  //       fetchTransactions();
  //       fetchUserInitialBalance();
  //     } else {
  //       throw new Error("Failed to add the payment record");
  //     }
  //   } catch (error) {
  //     console.error("Error updating transaction:", error);
  //     notify("tr", `Error recording payment: ${error.message}`, "danger");
  //   } finally {
  //     setIsUpdatingTransaction(false);
  //     setSelectedUnpaidTransaction(null);
  //     setPaymentOption(null);
  //     setShowAddTransaction(false);
  //     setTransactionAmount("");
  //     setRemainingAmount(0);
  //   }
  // };
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
        if (paidAmount > remainingAmount && paymentOption !== "full") {
          notify(
            "tr",
            `Payment amount cannot exceed the remaining amount of $${remainingAmount}`,
            "warning"
          );
          return;
        }

        // Calculate new remaining amount for the payable
        const newRemainingAmount =
          parseFloat(transaction.transactionAmount) - paidAmount;

        const updatedTransaction = {
          ...transaction,
          receiptUrl: Url || transaction.receiptUrl,
          status: newRemainingAmount <= 0 ? "Paid" : "Partially Paid",
          updatedAt: new Date().toISOString(),
          paidAmount: (transaction.paidAmount || 0) + paidAmount,
          transactionAmount: newRemainingAmount, // This is the remaining unpaid amount
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
        setIsUpdatingTransaction(true);
        let userid = localStorage.getItem("userId");
        const newDebt =
          paymentOption === "full"
            ? 0
            : parseFloat(transaction.transactionAmount) -
            parseFloat(remainingAmount);

        const response = await axios.put(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userid}`,
          {
            outstandingDebt: newDebt,
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to update outstanding debt");
        }
      }

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
        notify("tr", "Payment recorded successfully", "success");
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
      notify("tr", "Error fetching initial balance", "danger");
    } finally {
      setLoadingUserInitialBalance(false);
    }
  };

  useEffect(() => {
    console.log("Selected Business Type: ????", selectedBusinessType);
    const purposes = getBusinessPurposes(selectedBusinessType);
    console.log("Business Purposes:", purposes);
    setIncomePurposes(purposes.income || []);
    setExpensePurposes(purposes.expenses || []);
    setPayablePurposes(purposes.payables || []);
  }, [selectedBusinessType]);

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
        newExpenses[purpose] = (newExpenses[purpose] || 0) + amount;
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
        if (
          value.transactionType === "Pay" ||
          (value.transactionType === "Payable" && value.status !== "Paid")
        ) {
          return sum + parseFloat(value.transactionAmount || 0);
        }
        return sum;
      }, 0)
      .toFixed(2);
  };

  const calculateTotalPayables = () => {
    return Object.values(items)
      .reduce((sum, value) => {
        if (
          value.transactionType === "Payable" &&
          (value.status === "Unpaid" || value.status === "Payable")
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

    const totalReceived = filteredItems.reduce((sum, value) => {
      if (value.transactionType === "Payable" && value.status !== "Paid") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const outstandingDebtAmount = initialoutstandingDebt || 0;
    return (totalReceived + outstandingDebtAmount).toFixed(2);
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

        const outstandingDebt = initialoutstandingDebt || 0;
        if (outstandingDebt > 0) {
          unpaidOrPartiallyPaid.push({
            id: "outstanding-debt",
            transactionType: "Payable",
            transactionPurpose: "Initial Outstanding Debt",
            transactionAmount: outstandingDebt,
            remainingAmount: outstandingDebt,
            createdAt: new Date().toISOString(),
          });
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
    if (window.confirm("Are you sure you want to delete this record?")) {
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
    let userId = localStorage.getItem("userId");
    const userResponse = await axios.get(
      `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
    );
    const currentOutstandingDebt = userResponse.data.user.outstandingDebt || 0;

    const updatedOutstandingDebt =
      parseFloat(currentOutstandingDebt) +
      parseFloat(transaction.transactionAmount);

    await axios.put(
      `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`,
      { outstandingDebt: updatedOutstandingDebt }
    );
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
      notify("tr", "Error deleting records", "danger");
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
        notify("tr", "CSV saved to S3 successfully!", "success");
        return true;
      } else {
        notify("tr", "Failed to save CSV to S3.", "danger");
        return false;
      }
    } catch (error) {
      console.error("Error uploading CSV to S3:", error);
      notify("tr", "Error saving CSV to S3", "danger");
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

  const RunButtons = ({ onSelectRange, onClearFilters }) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleRun = () => {
      if (fromDate && toDate) {
        onSelectRange({ from: fromDate, to: toDate });
        setSearchedDates({ from: fromDate, to: toDate });
      } else {
        notify("tr", "Please select both From and To dates", "warning");
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
          alignItems: "center",
          justifyContent: "flex-start",
          flexWrap: "wrap", // Wraps content on small screens
          gap: "10px",
        }}
      >
        <div
          className="clander"
          style={{
            display: "flex",
            alignItems: "center",

            gap: "10px",
          }}
        >
          <FormGroup
            style={{ flex: "1 1 auto", minWidth: "150px", maxWidth: "250px" }}
          >
            <Label for="fromDate">From</Label>
            <Input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup
            style={{ flex: "1 1 auto", minWidth: "150px", maxWidth: "250px" }}
          >
            <Label for="toDate">To</Label>
            <Input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FormGroup>
        </div>
        <div
          className="buttonn"
          style={{
            display: "flex",

            gap: "10px",
          }}
        >
          <Button
            color="primary"
            onClick={handleRun}
            disabled={
              userRole === 1
                ? false
                : !userSubscription && (!isTrialActive() || scheduleCount >= 4)
            }
            style={{ height: "38px" }}
          >
            Run
          </Button>
          <Button
            color="secondary"
            onClick={handleClear}
            disabled={
              userRole === 1
                ? false
                : !userSubscription && (!isTrialActive() || scheduleCount >= 4)
            }
            style={{ height: "38px" }}
          >
            Clear Filters
          </Button>
          <Button
            color="danger"
            onClick={handleDeleteAllRecords}
            disabled={
              userRole === 1
                ? false
                : !userSubscription && (!isTrialActive() || scheduleCount >= 4)
            }
            style={{ height: "38px" }}
          >
            Close
          </Button>
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
  return (
    <>
      <Helmet>
        <title>Mesob Financial - Mesob Finance</title>
      </Helmet>

      <PanelHeader
        size="sm"
        content={
          <div>
            <h3
              style={{
                color: "white",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              {companyName}
            </h3>

            {/* <CSVReports /> */}
          </div>
        }
      />

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
                    Select User
                  </CardTitle>
                </CardHeader>
                <CardBody style={{ paddingBottom: "5px" }}>
                  <FormGroup style={{ marginBottom: "0" }}>
                    <Label>Select User to View:</Label>
                    <Select
                      options={userOptions}
                      value={
                        userOptions.find(
                          (option) => option.value === selectedUserId
                        ) || null
                      }
                      onChange={handleUserSelect}
                      placeholder="Search or select a user..."
                      isClearable
                      isSearchable
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: "38px",
                          height: "38px",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                          padding: "0 6px",
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0px",
                        }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: "38px",
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

      <div className="content" style={{ paddingTop: "0" }}>
        {/* Transactions Table Section - First */}
        <Container fluid style={{ paddingInline: 0 }}>
          <Row>
            <Col xs={12} style={{ paddingLeft: "1px", paddingRight: "1px" }}>
              <Card>
                <CardHeader
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingInline: 20,
                  }}
                >
                  {/* Left Section: RunButtons + Search */}
                  <div className="searchbtn">
                    <RunButtons
                      onSelectRange={handleSelectRange}
                      onClearFilters={handleClearFilters}
                    />

                    {/* Search */}
                    <div>
                      {showSearchInput ? (
                        <div className="relative w-64 ">
                          <Input
                            type="text"
                            placeholder="Search Journal Entries"
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
                              if (searchTerm.trim() === "") {
                                setShowSearchInput(false);
                              }
                            }}
                            className="pl-10"
                          />
                          <button
                            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                            onClick={() => {
                              setSearchTerm("");
                              setShowSearchInput(false);
                            }}
                          >
                            <FaTimesCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <Search
                          className="text-gray-500 cursor-pointer"
                          size={18}
                          onClick={() => setShowSearchInput(true)}
                        />
                      )}
                    </div>

                    {/* Right Section: Add Transaction + Subscription Info */}
                    <div
                      className="addtransction"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "50px",
                      }}
                    >
                      {userRole !== 0 && (
                        <Button
                          color="primary"
                          onClick={() => setShowAddTransaction(true)}
                          disabled={
                            userRole === 1
                              ? false
                              : !userSubscription && !isTrialActive()
                          } // Enable for role 1 even if not subscribed/trial
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ marginRight: "5px" }}
                          />
                          Add Transaction
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
              <Card style={{ marginBottom: "5px", height: "480px" }}>
                <CardHeader>
                  <CardTitle style={{ fontWeight: 600 }} tag="h4">
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "visible",
                    height: "400px",
                  }}
                >
                  <div>
                    <div>
                      <span
                        style={{
                          marginRight: "10px",
                          marginBottom: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        Total Cash on hand ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.cash,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalCash()}
                      </span>
                    </div>

                    <div
                      style={{
                        marginBottom: "10px",
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Total Payable (Unpaid) ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.payable,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalPayable()}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: "bold" }}>Payable:</span>
                      {Object.entries(expenses)
                        .filter(([purpose, amount]) => {
                          return items.some(
                            (item) =>
                              item.transactionPurpose === purpose &&
                              item.transactionType === "Payable" &&
                              item.status !== "Paid"
                          );
                        })
                        .map(([purpose, amount]) => (
                          <div
                            key={purpose}
                            style={{
                              marginLeft: "20px",
                              marginBottom: "5px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ marginRight: "10px" }}>
                              {purpose} ={" "}
                            </span>
                            <span
                              style={{
                                backgroundColor: colors.payable,
                                padding: "2px 5px",
                              }}
                            >
                              ${amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Revenue ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.revenue,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalRevenue()}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Total Expense ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.expense,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalExpenses(true)}
                      </span>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <span style={{ fontWeight: "bold" }}>Expenses:</span>
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
                                marginLeft: "20px",
                                marginBottom: "5px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ marginRight: "10px" }}>
                                {purpose} ={" "}
                              </span>
                              <span
                                style={{
                                  backgroundColor: isPaid
                                    ? colors.payable
                                    : colors.expense,
                                  padding: "2px 5px",
                                }}
                              >
                                ${totalAmount.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card style={{ height: "480px" }}>
                <CardHeader>
                  <CardTitle tag="h4" style={{ fontWeight: 600 }}>
                    Income Statement
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    height: "380px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "15px",
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
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Revenue</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        {Object.entries(revenues).map(([purpose, amount]) => (
                          <tr key={`revenue-${purpose}`}>
                            <td
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                              }}
                            >
                              {purpose}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#fff",
                                padding: "8px",
                                border: "1px solid #ddd",
                                textAlign: "right",
                              }}
                            >
                              ${amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total Revenue</strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.revenue,
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalRevenue()}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Expenses</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
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
                                    border: "1px solid #ddd",
                                  }}
                                >
                                  {purpose}
                                </td>
                                <td
                                  style={{
                                    backgroundColor: "#fff",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    textAlign: "right",
                                  }}
                                >
                                  ${totalAmount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total Expenses</strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalExpenses()}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>
                              {parseFloat(calculateTotalRevenue()) -
                                parseFloat(calculateTotalExpenses()) <
                                0
                                ? "Net Loss"
                                : "Net Income"}
                            </strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: "#90EE90",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toFixed(2)}
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
              <Card style={{ marginBottom: "5px", height: "480px" }}>
                <CardHeader>
                  <CardTitle style={{ fontWeight: 600 }} tag="h4">
                    Journal Entry
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    height: "380px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "10px",
                  }}
                >
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
                </CardBody>
              </Card>

              <Card style={{ height: "480px" }}>
                <CardHeader>
                  <CardTitle tag="h4" style={{ fontWeight: 600 }}>
                    Balance Sheet
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    height: "380px",
                    overflowX: "hidden",
                    padding: "15px",
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
                              border: "1px solid #ddd",
                            }}
                          >
                            <strong>Asset</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <strong>Amount</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <strong>Amount</strong>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Cash
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.cash,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            ${calculateTotalCash()}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Inventory
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            ${calculateTotalInventory()}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Liability</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Payable{" "}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            ${calculateTotalPayable()}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Equity</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Beginning Equity</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              initialBalance +
                              initialvalueableItems -
                              initialoutstandingDebt
                            ).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Retained earnings / Net income
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{
                              backgroundColor: colors.revenue,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toFixed(2)}
                          </td>
                        </tr>
                        {/* <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total</strong>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toFixed(2)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              initialBalance +
                              initialvalueableItems +
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toFixed(2)}
                          </td>
                        </tr> */}
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total</strong>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toFixed(2)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
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
                            ).toFixed(2)}
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
              <Card style={{ marginBottom: "5px" }}>
                <CardHeader>
                  <CardTitle style={{ fontWeight: 600 }} tag="h4">
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardBody style={{ overflowY: "auto", overflowX: "visible" }}>
                  <div>
                    <div>
                      <span
                        style={{
                          marginRight: "10px",
                          marginBottom: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        Total Cash on hand ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.cash,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalCash()}
                      </span>
                    </div>

                    <div
                      style={{
                        marginBottom: "10px",
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Total Payable (Unpaid) ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.payable,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalPayable()}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: "bold" }}>Payable:</span>
                      {Object.entries(expenses)
                        .filter(([purpose, amount]) => {
                          return items.some(
                            (item) =>
                              item.transactionPurpose === purpose &&
                              item.transactionType === "Payable" &&
                              item.status !== "Paid"
                          );
                        })
                        .map(([purpose, amount]) => (
                          <div
                            key={purpose}
                            style={{
                              marginLeft: "20px",
                              marginBottom: "5px",
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span style={{ marginRight: "10px" }}>
                              {purpose} ={" "}
                            </span>
                            <span
                              style={{
                                backgroundColor: colors.payable,
                                padding: "2px 5px",
                              }}
                            >
                              ${amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Revenue ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.revenue,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalRevenue()}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                        Total Expense ={" "}
                      </span>
                      <span
                        style={{
                          backgroundColor: colors.expense,
                          padding: "5px 10px",
                        }}
                      >
                        ${calculateTotalExpenses(true)}
                      </span>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <span style={{ fontWeight: "bold" }}>Expenses:</span>
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
                                marginLeft: "20px",
                                marginBottom: "5px",
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ marginRight: "10px" }}>
                                {purpose} ={" "}
                              </span>
                              <span
                                style={{
                                  backgroundColor: isPaid
                                    ? colors.payable
                                    : colors.expense,
                                  padding: "2px 5px",
                                }}
                              >
                                ${totalAmount.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
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
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px" }}>
                <CardHeader>
                  <CardTitle tag="h4" style={{ fontWeight: 600 }}>
                    Income Statement
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "15px",
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
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Revenue</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        {Object.entries(revenues).map(([purpose, amount]) => (
                          <tr key={`revenue-${purpose}`}>
                            <td
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                              }}
                            >
                              {purpose}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#fff",
                                padding: "8px",
                                border: "1px solid #ddd",
                                textAlign: "right",
                              }}
                            >
                              ${amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total Revenue</strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.revenue,
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalRevenue()}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Expenses</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
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
                                    border: "1px solid #ddd",
                                  }}
                                >
                                  {purpose}
                                </td>
                                <td
                                  style={{
                                    backgroundColor: "#fff",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    textAlign: "right",
                                  }}
                                >
                                  ${totalAmount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total Expenses</strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalExpenses()}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>
                              {parseFloat(calculateTotalRevenue()) -
                                parseFloat(calculateTotalExpenses()) <
                                0
                                ? "Net Loss"
                                : "Net Income"}
                            </strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: "#90EE90",
                              fontWeight: "bold",
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>

              <Card style={{ marginBottom: "5px" }}>
                <CardHeader>
                  <CardTitle tag="h4" style={{ fontWeight: 600 }}>
                    Balance Sheet
                  </CardTitle>
                </CardHeader>
                <CardBody
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "15px",
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
                              border: "1px solid #ddd",
                            }}
                          >
                            <strong>Asset</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <strong>Amount</strong>
                          </td>
                          <td
                            style={{
                              width: "30%",
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <strong>Amount</strong>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Cash
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.cash,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            ${calculateTotalCash()}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>

                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Inventory
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            ${calculateTotalInventory()}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Liability</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Payable{" "}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            ${calculateTotalPayable()}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Equity</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Beginning Equity</strong>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              initialBalance +
                              initialvalueableItems -
                              initialoutstandingDebt
                            ).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            Retained earnings / Net income
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          ></td>
                          <td
                            style={{
                              backgroundColor: colors.revenue,
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalRevenue()) -
                              parseFloat(calculateTotalExpenses())
                            ).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <strong>Total</strong>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
                            }}
                          >
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toFixed(2)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "8px",
                              border: "1px solid #ddd",
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
                            ).toFixed(2)}
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
        <Modal
          isOpen={showDeleteConfirmation}
          toggle={() => setShowDeleteConfirmation(false)}
        >
          <ModalHeader toggle={() => setShowDeleteConfirmation(false)}>
            Confirm Delete
          </ModalHeader>
          <ModalBody>
            Are you sure you want to delete all records? This action cannot be
            undone.
            <div className="modal-footer">
              <Button
                color="danger"
                onClick={() => {
                  confirmDeleteandsave();
                }}
              >
                Save and Delete All
              </Button>
              <Button
                color="secondary"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </Button>
              <Button color="danger" onClick={confirmDelete}>
                Delete All
              </Button>
            </div>
          </ModalBody>
        </Modal>

        <Modal
          isOpen={showAddTransaction}
          toggle={() => {
            resetForm();
            setShowAddTransaction(false);
          }}
        >
          <ModalHeader
            toggle={() => {
              resetForm();
              setShowAddTransaction(false);
            }}
          >
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Type:</Label>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  color={
                    transactionType === "receive" ? "primary" : "secondary"
                  }
                  onClick={() => {
                    setTransactionType("receive");
                    setPaymentMode(null);
                  }}
                >
                  Receive Cash
                </Button>
                <Button
                  color={transactionType === "pay" ? "primary" : "secondary"}
                  onClick={() => {
                    setTransactionType("pay");
                    setPaymentMode(null);
                  }}
                >
                  Pay Cash
                </Button>
                <Button
                  color={
                    transactionType === "Payable" ? "primary" : "secondary"
                  }
                  onClick={() => {
                    setTransactionType("Payable");
                    setPaymentMode(null);
                  }}
                >
                  Haven't Yet Paid
                </Button>
              </div>
            </FormGroup>
            {/* Show action buttons for Pay Cash */}
            {transactionType === "pay" && (
              <FormGroup>
                <Label>Select Action:</Label>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <Button
                    color="primary"
                    onClick={() => {
                      setsubType("Recorded");
                      setPaymentMode("recorded");
                    }}
                  >
                    Recorded Earlier as Payable
                  </Button>

                  <Button
                    color="primary"
                    onClick={() => {
                      setsubType("Expense");
                      setPaymentMode("new");
                    }}
                  >
                    New Expense
                  </Button>
                  <Button
                    color="warning"
                    onClick={() => {
                      setsubType("New_Item");
                      setPaymentMode("boughtItem");
                    }}
                  >
                    Bought a New Item
                  </Button>
                </div>
              </FormGroup>
            )}
            {/* Show dropdown for recorded payment mode under Pay Cash */}
            {selectedBusinessType === "Other" && (
              <div className="manual-purpose-management">
                <h4>Manage Custom Purposes</h4>
                <Input
                  type="text"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="Enter new purpose"
                />
                <Input
                  type="select"
                  value={purposeType}
                  onChange={(e) => setPurposeType(e.target.value)}
                >
                  <option value="income">Income Purpose</option>
                  <option value="expense">Expense Purpose</option>
                  <option value="payable">Payable Purpose</option>
                </Input>
                <Button onClick={handleAddPurpose}>Add Purpose</Button>
              </div>
            )}

            {transactionType === "pay" && paymentMode === "recorded" && (
              <>
                {/* <FormGroup>
                  <Label>Select Unpaid Transaction:</Label>
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
                      // handlePayableSelection(selected);
                    }}
                  >
                    <option value="">Select transaction</option>
                    {unpaidTransactions
                      .filter((t) => t.status !== "Paid")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.transactionPurpose} - ${t.transactionAmount}
                        </option>
                      ))}
                  </Input>

                </FormGroup> */}
                <FormGroup>
                  <Label>Select Unpaid Transaction:</Label>
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
                    <option value="">Select transaction</option>
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
                    <legend>Payment Option:</legend>
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="radio"
                          name="paymentOption"
                          value="full"
                          checked={paymentOption === "full"}
                          onChange={() => setPaymentOption("full")}
                        />{" "}
                        Full Payment
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
                        Partial Payment
                      </Label>
                    </FormGroup>
                  </FormGroup>
                )}

                {/* {selectedUnpaidTransaction && paymentOption === "partial" && (
                  <FormGroup>
                    <Label>Partial Payment Amount:</Label>
                    <Input
                      type="number"
                      value={remainingAmount}
                      onChange={(e) => setRemainingAmount(e.target.value)}
                      max={selectedUnpaidTransaction.transactionAmount}
                    />
                  </FormGroup>
                )} */}
                {selectedUnpaidTransaction && paymentOption === "partial" && (
                  <FormGroup>
                    <Label>Partial Payment Amount:</Label>
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
                  <Label>Item Description:</Label>
                  <Input
                    type="select"
                    value={isManual}
                    onChange={(e) => setIsManual(e.target.value)}
                  >
                    <option value="">Select Option</option>
                    <option value="manual">Enter Manually</option>
                  </Input>

                  {/* Show text input when "Enter Manually" is selected */}
                  {/* {isManual == "manual" && (
                    <Input
                      type="text"
                      placeholder="Enter item description"
                      value={manualPurpose === "manual" ? "" : manualPurpose}
                      onChange={(e) => setManualPurpose(e.target.value)}
                      className="mt-2"
                    />
                  )} */}

                  {/* ----------  NEW VALIDATION FOR MANUAL DESCRIPTION ---------- */}
                  {isManual === "manual" && (
                    <FormGroup className="mt-2">
                      <Input
                        type="text"
                        placeholder="Enter item description"
                        value={manualPurpose}
                        onChange={(e) => {
                          setManualPurpose(e.target.value);
                          // clear the error when the user starts typing
                          setFormErrors({ ...formErrors, manualPurpose: "" });
                        }}
                        invalid={!!formErrors.manualPurpose}
                      />
                      {formErrors.manualPurpose && (
                        <div className="text-danger" style={{ fontSize: "0.875rem" }}>
                          {formErrors.manualPurpose}
                        </div>
                      )}
                    </FormGroup>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Amount ($):</Label>
                  <Input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </FormGroup>
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
                {/* <Button
                  color="success"
                  onClick={handleAddTransaction}
                  disabled={isAddingTransaction}
                >
                  {isAddingTransaction ? <Spinner size="sm" /> : "Save"}
                </Button> */}
                <Button
                  color="success"
                  onClick={handleAddTransaction}
                  disabled={
                    isAddingTransaction ||
                    (isManual === "manual" && !manualPurpose.trim())
                  }
                >
                  {isAddingTransaction ? <Spinner size="sm" /> : "Save"}
                </Button>
              </>
            )}
            {/* Show regular form fields for other cases */}
            {(transactionType === "receive" ||
              (transactionType === "pay" && paymentMode === "new") ||
              transactionType === "Payable") && (
                <>
                  <FormGroup>
                    <Label>Purpose:</Label>

                    <Input
                      type="select"
                      value={transactionPurpose}
                      onChange={(e) => setTransactionPurpose(e.target.value)}
                    >
                      <option value="">Select purpose</option>
                      {transactionType === "receive" && (
                        <>
                          {incomePurposes.map((purpose, index) => (
                            <option key={index} value={purpose}>
                              {purpose}
                            </option>
                          ))}
                          <option value="manual">Enter Manually</option>
                        </>
                      )}
                      {transactionType === "pay" && paymentMode === "new" && (
                        <>
                          {expensePurposes.map((purpose, index) => (
                            <option key={index} value={purpose}>
                              {purpose}
                            </option>
                          ))}
                          <option value="manual">Enter Manually</option>
                        </>
                      )}
                      {transactionType === "Payable" && (
                        <>
                          {payablePurposes.map((purpose, index) => (
                            <option key={index} value={purpose}>
                              {purpose}
                            </option>
                          ))}
                          <option value="manual">Enter Manually</option>
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
                    <Label>Amount ($):</Label>
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
                    {isAddingTransaction ? <Spinner size="sm" /> : "Save"}
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
            Receipt Preview
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
            Installment Payment for{" "}
            {selectedUnpaidTransaction?.transactionPurpose}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Select Payment Type:</Label>
              <div>
                <Button color="primary" onClick={handleFullPayment}>
                  Pay Full Amount ($
                  {selectedUnpaidTransaction?.transactionAmount})
                </Button>
                <Button
                  color="primary"
                  onClick={() => setShowInstallmentInput(true)}
                >
                  Pay Installment
                </Button>
              </div>
            </FormGroup>
            {showInstallmentInput && (
              <FormGroup>
                <Label>Installment Amount:</Label>
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
              Pay
            </Button>
            <Button
              color="secondary"
              onClick={() => setShowInstallmentModal(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default MesobFinancial2;
