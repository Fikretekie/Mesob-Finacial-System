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
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import TransactionTable from "./TransactionTable";
import { AddExpenseButton } from "components/AddExpenseButton";
import IncomeStatement from "components/IncomeStatement";
import colors from "variables/colors";
import CSVReports from "./CSVReports";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import { FaTimesCircle } from "react-icons/fa";

// import { useReactToPrint } from "react-to-print";
const MesobFinancial2 = () => {
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
  const [accountsPayable, setAccountsPayable] = useState({});
  const [paymentMode, setPaymentMode] = useState(null);
  const [unpaidTransactions, setUnpaidTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
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
  const selectedUser = useSelector((state) => state.selectedUser);
  // const dispatch = useDispatch();
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

    try {
      const response = await fetch(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${selectedUnpaidTransaction.id}`,
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
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
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
    }
  };

  // CSV
  const handleGenerateCSV = () => {
    // Implement CSV generation logic here
    // After generation, navigate to the CSV Reports page
    navigate("/customer/csv");
  };
  // redux select user

  const [financialData, setFinancialData] = useState(null);

  const fetchFinancialData = async (userId) => {
    try {
      console.log(
        "MesobFinancial2: Fetching financial data for user ID",
        userId
      );
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      );
      console.log("MesobFinancial2: Fetched data", response.data);
      setItems(response.data); // Update the state with fetched data
    } catch (error) {
      console.error("MesobFinancial2: Error fetching financial data:", error);
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
    const file = e.target.files[0];
    if (file) {
      const filename = file.name;
      const filetype = file.type;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const filecontent = event.target.result.split(",")[1]; // Remove data:image/jpeg;base64, prefix

        setReceipt(file);

        setfileContent(filecontent);
      };

      reader.readAsDataURL(file);
    }
  };

  //fetching users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users"
      );

      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notify("tr", "Error fetching users", "danger");
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

    // Validate manual purpose if required
    if (transactionPurpose === "manual" && !manualPurpose.trim()) {
      errors.manualPurpose = "Please enter a purpose manually";
    }

    // Check for any validation errors
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Ensure all required fields are filled
    if (!transactionType || !transactionAmount) {
      notify("tr", "Please fill in all fields", "warning");
      return;
    }

    setIsAddingTransaction(true);
    let Url = "";

    // Upload receipt if provided
    if (receipt) {
      Url = await uploadReceipt();
    }

    try {
      console.log("values", transactionPurpose, manualPurpose);
      // Determine transaction type and subtype based on user inputs
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

      // Send the new transaction to the server
      const response = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
        newTransaction
      );

      // Handle success response
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
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const uploadReceipt = async () => {
    try {
      const response = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Receipt",
        {
          fileName: receipt.name,
          fileType: receipt.type,
          fileContent: fileContent,
          userId: localStorage.getItem("userId"),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.url) {
        notify("tr", "Receipt uploaded successfully", "success");

        console.log("reciept upload  url", response.data.url);
        setReceipt(null);
        // Save the receipt URL or handle success
        return response.data.url;
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      notify("tr", "Failed to upload receipt", "danger");
    }
  };

  const handleUpdateTransaction = async (transaction) => {
    console.log("?????????", transaction.id);
    let Url = "";
    if (receipt) {
      Url = await uploadReceipt();
    }
    const paidAmount =
      paymentOption === "full"
        ? parseFloat(transaction.transactionAmount)
        : parseFloat(remainingAmount);
    if (transaction.id !== "outstanding-debt") {
      console.log("jnbjh", paidAmount);

      if (paidAmount > remainingAmount && paymentOption !== "full") {
        notify(
          "tr",
          `Payment amount cannot exceed the remaining amount of $${remainingAmount}`,
          "warning"
        );
        return;
      }

      setIsUpdatingTransaction(true);

      try {
        const updatedTransaction = {
          ...transaction,
          receiptUrl: Url || transaction.receiptUrl,
          status:
            paymentOption === "full"
              ? "Paid"
              : paymentOption === "partial" &&
                remainingAmount === transaction.transactionAmount
                ? "Paid"
                : "Partially Paid",
          updatedAt: new Date().toISOString(),
          paidAmount: (transaction.paidAmount || 0) + paidAmount,
          transactionAmount:
            parseFloat(transaction.transactionAmount) -
            parseFloat(remainingAmount), // Update the transaction amount to the new remaining amount
          remainingAmount: paidAmount,
        };

        console.log("updated amount", updatedTransaction);

        const response = await fetch(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transaction.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTransaction),
          }
        );

        if (response.status === 200) {
          const isFullPayment = paymentOption === "full";
          const newPaidTransaction = {
            userId: localStorage.getItem("userId"),
            transactionType: "Pay",
            transactionPurpose: isFullPayment
              ? `Full Payment for ${transaction.transactionPurpose}`
              : `Partial Payment for ${transaction.transactionPurpose}`,
            transactionAmount: paidAmount,
            receiptUrl: Url || "",
            payableId: transaction.id,
            createdAt: new Date().toISOString(),
          };

          const response2 = await axios.post(
            "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
            newPaidTransaction
          );

          if (response2.status === 200) {
            notify("tr", "Payment recorded successfully", "success");

            fetchTransactions();
            window.location.reload();
          } else {
            throw new Error("Failed to add the payment record");
          }
        } else {
          throw new Error("Failed to update the transaction");
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
    } else {
      const id = localStorage.getItem("userId");
      console.log(">>>>>>>>>>", transaction);

      console.log("Sending update request for ID:", id);
      const response = await axios.put(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${id}`,
        {
          outstandingDebt:
            paymentOption === "full"
              ? parseFloat(transaction.transactionAmount) -
              parseFloat(transaction.transactionAmount)
              : parseFloat(transaction.transactionAmount) -
              parseFloat(remainingAmount),
        }
      );
      console.log("res=>>>", response.status);
      const newPaidTransaction = {
        userId: localStorage.getItem("userId"),
        transactionType: "Pay",
        transactionPurpose: `Partial Payment for ${transaction.transactionPurpose}`,
        transactionAmount: paidAmount, // Use the paid amount for the new transaction
        receiptUrl: Url || "",
        payableId: transaction.id,
        createdAt: new Date().toISOString(),
      };

      const response2 = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction",
        newPaidTransaction
      );

      if (response2.status === 200) {
        notify("tr", "Payment recorded successfully", "success");

        fetchTransactions();
      }
    }
  };

  const filterItemsByTimeRange = (items, range, searchTerm) => {
    if (!range || !range.from || !range.to) {
      return items.filter((item) =>
        item.transactionPurpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);

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
    try {
      const targetUserId = uid || localStorage.getItem("userId");
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${targetUserId}`
      );
      if (response.data?.user?.cashBalance) {
        console.log("Initial balance:", response.data.user.cashBalance);
        setInitialBalance(parseFloat(response.data.user.cashBalance));
      }
      if (response.data?.user?.valueableItems) {
        console.log(
          "Initial valueableItems:",
          response.data.user.valueableItems
        );
        setvalueableItems(parseFloat(response.data.user.valueableItems));
      }
      setcompanyName(response.data.user.companyName);
      if (response.data?.user?.outstandingDebt) {
        console.log(
          "Initial outstandingDebt:",
          response.data.user.outstandingDebt
        );
        setoutstandingDebt(parseFloat(response.data.user.outstandingDebt));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      notify("tr", "Error fetching initial balance", "danger");
    }
  };

  useEffect(() => {
    if (userRole === 0) {
      // Admin role
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
    if (selectedUser?.id) {
      console.log("fetching for redux user");
      fetchTransactions(selectedUser?.id);
      fetchUserInitialBalance(selectedUser?.id);
    }
  }, [selectedUser]);

  const calculateFinancials = (transactions) => {
    const newRevenues = {};
    const newExpenses = {};
    const newAccountsPayable = {};

    transactions.forEach((transaction) => {
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
    const totalReceived = Object.values(items).reduce((sum, value) => {
      if (value.transactionType === "Receive") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    return totalReceived.toFixed(2);
  };

  const calculateTotalInventory = () => {
    const valueableItems = initialvalueableItems || 0;

    const newItemsTotal = items.reduce((sum, item) => {
      if (item.transactionType === "New_Item" && item.subType === "New_Item") {
        return sum + parseFloat(item.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const totalInventory = newItemsTotal + valueableItems;
    return totalInventory.toFixed(2);
  };

  const calculateTotalExpenses = () => {
    return Object.values(items)
      .reduce((sum, value) => {
        if (value.transactionType === "Pay" && value.status === "Paid") {
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
    const totalReceived = Object.values(items).reduce((sum, value) => {
      if (value.transactionType === "Receive") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const New_ItemReceived = Object.values(items).reduce((sum, value) => {
      if (value.transactionType === "New_Item") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const totalExpenses = Object.values(items).reduce((sum, value) => {
      if (value.transactionType === "Pay") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    // console.log("unpaidexp=>", unpaidexp);

    // const totalExpenses = parseFloat(calculateTotalExpenses());
    const totalCash =
      initialBalance + totalReceived - totalExpenses - New_ItemReceived;

    return totalCash.toFixed(2);
  };

  const calculateTotalPayable = () => {
    const totalReceived = Object.values(items).reduce((sum, value) => {
      if (value.transactionType === "Payable" && value.status !== "Paid") {
        return sum + parseFloat(value.transactionAmount || 0);
      }
      return sum;
    }, 0);

    const outstandingDebtAmount = initialoutstandingDebt || 0;

    return (totalReceived + outstandingDebtAmount).toFixed(2);
  };

  const fetchTransactions = (uid = null) => {
    setLoading(true);
    const targetUserId = uid || localStorage.getItem("userId");

    axios
      .get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${targetUserId}`
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
        setLoading(false);
      });
  };

  const fetchUnpaidTransactions = () => {
    axios
      .get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
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
      setLoading(true);
      if (transaction?.payableId === "outstanding-debt") {
        let userId = localStorage.getItem("userId");
        const response = await axios.put(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`,
          {
            outstandingDebt: parseFloat(transaction.transactionAmount),
          }
        );
        console.log("res=>>>", response.status);
        console.log("response=>>>>>>>", response);
      } else {
        const payableItem = items.find(
          (item) => item.id === transaction.payableId
        );
        let updatedTransaction;
        if (payableItem) {
          console.log("payableItem=>>>>--->>>", payableItem);
          console.log(
            ">>>>>>>>>>",
            transactionPurpose,
            transaction.transactionAmount
          );
          updatedTransaction = {
            ...payableItem, // Include all existing properties of the item
            status: "Payable",
            transactionAmount: parseFloat(payableItem.transactionAmount) + parseFloat(transaction.transactionAmount),
            updatedAt: new Date().toISOString(),
          };
        }

        const response = await fetch(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${Number(
            transaction.payableId
          )}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTransaction),
          }
        );
        console.log("response=>>>>>>>", response);
      }

      axios
        .delete(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/${transaction.id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            notify("tr", "Record deleted successfully", "success");
            fetchTransactions();
          } else {
            notify("tr", "Failed to delete record", "danger");
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            // If the transaction is not found, it might have been a paid transaction
            // that was already soft-deleted. In this case, we'll consider it a success.
            notify("tr", "Record deleted successfully", "success");
            fetchTransactions();
          } else {
            console.error("Delete error:", error);
            notify(
              "tr",
              error.response?.data?.message || "Failed to delete record",
              "danger"
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDeleteAllRecords = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");

    try {
      const response = await axios.delete(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
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
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  // CSV Generation function using PapaParse (install it: npm install papaparse)
  const generateCSV = (data) => {
    if (!data || data.length === 0) {
      return ""; // Return empty string if no data
    }

    const csvRows = [];

    // Headers
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    // Rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const cellValue = row[header];
        // Escape commas and quotes in the value
        const escapedValue = String(cellValue).replace(/"/g, '""');
        return `"${escapedValue}"`; // Wrap values in quotes
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

      // Convert the CSV data to a Base64 encoded string
      const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));

      const response = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup",
        {
          bucketName: bucketName,
          key: s3Key,
          filename: fileName,
          userId: userId,
          fileContent: base64CsvData, // Send the Base64 encoded data
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

  const confirmDeleteandsave = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");

    try {
      const csvData = generateCSV(items); // Assuming 'items' holds your transaction data
      // 2. upload CSV data to s3 bucket

      //3. Trigger CSV download
      if (csvData) {
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "transactions.csv");
      }
      const uploadSuccess = await uploadCSVToS3(csvData);
      if (!uploadSuccess) {
        // If S3 upload fails, stop the process
        setLoading(false);
        setShowDeleteConfirmation(false);
        return;
      }
      const response = await axios.delete(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
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
      setLoading(false);
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // Allows buttons to wrap on small screens
            gap: "10px",
          }}
        >
          <Button
            color="primary"
            onClick={handleRun}
            style={{ height: "38px" }}
          >
            Run
          </Button>
          <Button
            color="secondary"
            onClick={handleClear}
            style={{ height: "38px" }}
          >
            Clear Filters
          </Button>
          <Button
            color="danger"
            onClick={handleDeleteAllRecords}
            style={{ height: "38px" }}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };
  const filteredItems = items.filter((item) =>
    item.transactionPurpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          style={{ marginBottom: "-30px", minHeight: "100px" }}
        >
          <Row style={{ margin: "0" }}>
            <Col xs={12}>
              <Card style={{ marginBottom: "0" }}>
                <CardHeader>
                  <CardTitle tag="h4">Select User</CardTitle>
                </CardHeader>
                <CardBody style={{ paddingBottom: "15px" }}>
                  <FormGroup style={{ marginBottom: "0" }}>
                    <Label>Select User to View:</Label>
                    <Input
                      type="select"
                      value={selectedUserId || ""}
                      onChange={(e) => {
                        const userId = e.target.value;
                        setSelectedUserId(userId);
                        if (userId) {
                          console.log("user id: ", userId);
                          localStorage.setItem("tempUserId", userId);
                          fetchTransactions(userId);
                          fetchUserInitialBalance(userId);
                        }
                      }}
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <div className="content" style={{ paddingTop: "0" }}>
        {/* Transactions Table Section - First */}
        <Container fluid>
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <CardTitle tag="h4">Transactions</CardTitle>
                    <div>
                      {userRole !== 0 && (
                        <Button
                          color="primary"
                          onClick={() => setShowAddTransaction(true)}
                        >
                          Add Transaction
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 25px",
                    }}
                  >
                    <CardTitle tag="h4">Journal Entry</CardTitle>
                    <div className="flex items-center gap-4">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <RunButtons
                          onSelectRange={handleSelectRange}
                          onClearFilters={handleClearFilters}
                        />
                        <div
                          className="flex items-center gap-2"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingLeft: "10px",
                          }}
                        >
                          {showSearchInput ? (
                            <div
                              className="relative w-64"
                              style={{ display: "flex", flexDirection: "row" }}
                            >
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
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spinner color="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <>
                      {searchedDates && (
                        <div style={{ marginBottom: "15px" }}>
                          <strong>Searched dates:</strong> {searchedDates.from}{" "}
                          - {searchedDates.to}
                        </div>
                      )}
                      <div className="table-container">
                        <TransactionTable
                          items={filterItemsByTimeRange(
                            items,
                            selectedTimeRange,
                            searchTerm
                          )}
                          selectedTimeRange={selectedTimeRange}
                          handleDelete={handleDelete}
                          handleAddExpense={handleAddExpense}
                          handleReceiptClick={handleReceiptClick}
                        />
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Summary Section - Second */}
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Summary</CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "10px", fontWeight: "bold" }}>
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

                    {/* Payable Section */}
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

                    {/* Expenses Section */}
                    <div style={{ marginTop: "20px" }}>
                      <span style={{ fontWeight: "bold" }}>Expenses:</span>
                      {Object.entries(expenses)
                        .filter(([purpose, amount]) => {
                          return items.some(
                            (item) =>
                              (item.transactionPurpose === purpose &&
                                item.transactionType === "Pay") ||
                              (item.transactionPurpose === purpose &&
                                item.transactionType === "Payable")
                          );
                        })
                        .map(([purpose, amount]) => {
                          const totalAmount = items.reduce((sum, item) => {
                            if (
                              item.transactionPurpose === purpose &&
                              (item.transactionType === "Pay" ||
                                item.transactionType === "Payable")
                            ) {
                              return (
                                sum + parseFloat(item.transactionAmount || 0)
                              );
                            }
                            return sum;
                          }, 0);

                          const isPaid = items.some(
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
            </Col>
          </Row>

          {/* Financial Details Table - Third */}
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Income Statement</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="statement-table">
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <strong>Revenue</strong>
                          </td>
                          <td></td>
                        </tr>
                        {Object.entries(revenues).map(([purpose, amount]) => (
                          <tr key={`revenue-${purpose}`}>
                            <td>{purpose}</td>
                            <td style={{ backgroundColor: "#fff" }}>
                              ${amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td>
                            <strong>Total Revenue</strong>
                          </td>
                          <td
                            style={{
                              backgroundColor: colors.revenue,
                              fontWeight: "bold",
                            }}
                          >
                            ${calculateTotalRevenue()}
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Expenses</strong>
                          </td>
                          <td></td>
                        </tr>
                        {Object.entries(expenses)
                          .filter(([purpose, amount]) => {
                            const item = items.find(
                              (item) =>
                                item.transactionPurpose === purpose &&
                                item.transactionType === "Pay"
                            );
                            return item;
                          })
                          .map(([purpose, amount]) => (
                            <tr key={`expense-${purpose}`}>
                              <td>{purpose}</td>
                              <td style={{ backgroundColor: "#fff" }}>
                                ${amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        <tr>
                          <td>
                            <strong>Total Expenses</strong>
                          </td>
                          <td style={{ backgroundColor: colors.expense }}>
                            ${calculateTotalExpenses()}
                          </td>
                        </tr>

                        <tr>
                          <td>
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
          </Row>

          {/* Balance Sheet Section - Fourth */}
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Balance Sheet</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="statement-table">
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "40%" }}>
                            <strong>Asset</strong>
                          </td>
                          <td style={{ width: "30%", textAlign: "right" }}>
                            <strong>Amount</strong>
                          </td>
                          <td style={{ width: "30%", textAlign: "right" }}>
                            <strong>Amount</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>Cash</td>
                          <td
                            style={{
                              backgroundColor: colors.cash,
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalCash()}
                          </td>
                          <td></td>
                        </tr>

                        <tr>
                          <td>Inventory</td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalInventory()}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Liability</strong>
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Payable </td>
                          <td></td>
                          <td
                            style={{
                              backgroundColor: colors.expense,
                              textAlign: "right",
                            }}
                          >
                            ${calculateTotalPayable()}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Equity</strong>
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Begining Equity</strong>
                          </td>
                          <td></td>
                          <td>{initialBalance + initialvalueableItems}</td>
                        </tr>
                        <tr>
                          <td>Retained earnings / Net income</td>
                          <td></td>
                          <td
                            style={{
                              backgroundColor: colors.revenue,
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
                        <tr>
                          <td>
                            <strong>Total</strong>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            $
                            {(
                              parseFloat(calculateTotalCash()) +
                              parseFloat(calculateTotalInventory())
                            ).toFixed(2)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            $
                            {(
                              initialBalance +
                              initialvalueableItems +
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

                {selectedUnpaidTransaction && paymentOption === "partial" && (
                  <FormGroup>
                    <Label>Partial Payment Amount:</Label>
                    <Input
                      type="number"
                      value={remainingAmount}
                      onChange={(e) => setRemainingAmount(e.target.value)}
                      max={selectedUnpaidTransaction.transactionAmount}
                    />
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
                  disabled={!selectedUnpaidTransaction || isUpdatingTransaction}
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
                  {isManual == "manual" && (
                    <Input
                      type="text"
                      placeholder="Enter item description"
                      value={manualPurpose === "manual" ? "" : manualPurpose}
                      onChange={(e) => setManualPurpose(e.target.value)}
                      className="mt-2"
                    />
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
                <Button
                  color="success"
                  onClick={handleAddTransaction}
                  disabled={isAddingTransaction}
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
                          <option value="Freight Income">Freight Income</option>
                          <option value="Lease Income">Lease Income</option>
                          <option value="Fuel Surcharge Revenue">
                            Fuel Surcharge Revenue
                          </option>
                          <option value="manual">Enter Manually</option>
                        </>
                      )}
                      {transactionType === "pay" && paymentMode === "new" && (
                        <>
                          <option value="Fuel Expense">Fuel Expense</option>
                          <option value="Truck Repairs and Maintenance">
                            Truck Repairs and Maintenance
                          </option>
                          <option value="Driver Salaries/Wages">
                            Driver Salaries/Wages
                          </option>
                          <option value="Insurance Premiums">
                            Insurance Premiums
                          </option>
                          <option value="Toll Charges">Toll Charges</option>
                          <option value="Loan Payment">Loan Payment</option>
                          <option value="Accounts Payable">
                            Accounts Payable
                          </option>
                          <option value="manual">Enter Manually</option>
                        </>
                      )}
                      {transactionType === "Payable" && (
                        <>
                          <option value="PPMOTS">
                            Provider Payments (Expense) / Money Owed to Suppliers
                            (Expense)
                          </option>
                          <option value="FC">Freight Costs (Expense)</option>
                          <option value="Wages">Wages (Expense)</option>
                          <option value="Utilities">Utilities (Expense)</option>
                          <option value="Taxes">Taxes (Expense)</option>
                          <option value="Rent">Rent (Expense)</option>
                          <option value="Insurance">Insurance (Expense)</option>
                          <option value="Other">Other (Expense)</option>
                        </>
                      )}
                    </Input>
                    {transactionPurpose === "manual" && (
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
            {selectedReceipt && (
              <div className="receipt-preview">
                <object
                  data={selectedReceipt.receiptUrl}
                  type="application/pdf"
                  style={{
                    width: "100%",
                    height: "600px",
                  }}
                >
                  <embed
                    src={selectedReceipt.receiptUrl}
                    type="application/pdf"
                    style={{
                      width: "100%",
                      height: "600px",
                    }}
                  />
                </object>
              </div>
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
