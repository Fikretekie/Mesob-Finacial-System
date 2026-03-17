import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { apiUrl, ROUTES, S3_BUCKET_NAME } from "../config/api";
import { saveAs } from "file-saver";

function UserPage() {
  const [activeTab, setActiveTab] = useState("1");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    companyName: "",
    businessType: "",
    cashBalance: "",
    outstandingDebt: "",
    valueableItems: "",
    role: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editDisabled, setEditDisabled] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showProviderSwitchModal, setShowProviderSwitchModal] = useState(false);
  const [selectedNewProvider, setSelectedNewProvider] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = parseInt(localStorage.getItem("role") || "1");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          apiUrl(`${ROUTES.USERS}/${userId}`)
        );
        console.log("api response", response);
        const user = response.data?.user;
        if (user) {
          // Save both the current and the original copy
          const fullUser = { ...user, id: userId };
          setUserData(fullUser);
          setOriginalData(fullUser);
          // setUserData({ ...user, id: userId });
          setIsCustomer(user.role === 2 || user.role === 1);
        } else {
          setUserData({ id: userId });
          setIsCustomer(false);
          setError("User data not found. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    const fetchSubscription = async () => {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        apiUrl(`${ROUTES.USERS}/${userId}`)
      );
      // Use optional chaining and sensible defaults
      setEditDisabled(
        !res.data?.user?.subscription &&
        (res.data?.user?.scheduleCount ?? 0) >= 4
      );
    };
    fetchSubscription();
  }, []);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (activeTab === "2") {
        setLoadingSubscription(true);
        try {
          const userId = localStorage.getItem("userId");
          const response = await axios.get(
            apiUrl(`${ROUTES.SUBSCRIPTION}/${userId}`)
          );
          console.log("Subscription API response:", response.data);
          const data = response.data?.data;
          if (data && data.isPaid && data.subscriptionId && data.subscriptionDetails) {
            setSubscriptionData(data);
          } else {
            setSubscriptionData(null);
          }
        } catch (error) {
          console.error("Error fetching subscription details:", error);
          setSubscriptionData(null);
        } finally {
          setLoadingSubscription(false);
        }
      }
    };
    fetchSubscriptionDetails();
  }, [activeTab]);

  // Discard changes → restore original data
  const handleDiscard = () => {
    setUserData(originalData);
    setIsEditing(false);
    setHasChanges(false);
    setSuccess(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && hasChanges) {
      try {
        const { id, ...updateFields } = userData;

        console.log("Sending update request for ID:", id);
        console.log("Payload:", updateFields);

        const response = await axios.put(
          apiUrl(`${ROUTES.USERS}/${id}`),
          updateFields
        );

        console.log("Update response:", response.data);
        setIsEditing(false);
        setHasChanges(false);
        setSuccess("Profile updated successfully!");
        setError(null);
      } catch (error) {
        console.error(
          "Error updating user data:",
          error.response?.data || error.message
        );
        setError("Failed to update profile. Please try again.");
        setSuccess(null);
      }
    } else {
      setIsEditing(true);
    }
  };
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const userId = localStorage.getItem("userId");
      await axios.delete(
        apiUrl(`${ROUTES.USERS}/${userId}`)
      );
      localStorage.clear(); // Clear user data
      alert("Account deleted successfully.");
      navigate("/login"); // Redirect to login or homepage
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete account. Please try again.");
    }
  };

  // ——— Data Management (Reset) ———
  const isIOSDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const fetchWithRetry = async (url, options = {}, retries = 2, delayMs = 800) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  };
  const fetchTransactionsForExport = async () => {
    const userId = localStorage.getItem("userId");
    const res = await fetchWithRetry(apiUrl(`${ROUTES.TRANSACTION}?userId=${userId}`));
    const data = await res.json();
    return data || [];
  };
  const generateCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };
  const downloadCSV = (csvData, fileName) => {
    try {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      if (isIOSDevice()) {
        const url = URL.createObjectURL(blob);
        const newTab = window.open(url, "_blank");
        if (!newTab) {
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        saveAs(blob, fileName);
      }
      return true;
    } catch (e) {
      return false;
    }
  };
  const uploadCSVToS3 = async (csvData) => {
    const userId = localStorage.getItem("userId");
    const fileName = `transactions_${new Date().toISOString()}.csv`;
    const s3Key = `backups/${userId}${fileName}`;
    const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));
    const payload = {
      bucketName: S3_BUCKET_NAME,
      key: s3Key,
      filename: fileName,
      userId,
      fileContent: base64CsvData,
      type: "text/csv;charset=utf-8",
    };
    const response = await fetchWithRetry(apiUrl(ROUTES.BACKUP), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  };
  const handleDownloadReport = () => {
    if (location.pathname.includes("financial-report")) {
      window.dispatchEvent(new Event("mesob:downloadReport"));
    } else {
      navigate("/customer/financial-report", { state: { openDownloadModal: true } });
    }
  };
  const handleOpenResetModal = () => {
    setResetConfirmText("");
    setShowResetModal(true);
    fetch(apiUrl(`${ROUTES.TRANSACTION}?userId=ping`)).catch(() => {});
  };
  // Cancel Subscription Functions
  const cancelStripeSubscription = async () => {
    try {
      setCancelLoading(true);
      setError("");
      if (!subscriptionData?.subscriptionId) {
        setError("Subscription ID missing.");
        return;
      }
      await axios.delete(
        apiUrl(`${ROUTES.SUBSCRIPTION}/${subscriptionData.subscriptionId}`)
      );
      setSuccess("Subscription cancelled successfully!");
      setShowCancelModal(false);
      // Refresh subscription data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError("Failed to cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    if (subscriptionData?.paymentType === "STRIPE") {
      cancelStripeSubscription();
    } else if (subscriptionData?.paymentType === "PAYPAL") {
      setError("PayPal cancellation not yet implemented. Please contact support.");
    } else {
      setError("Unable to determine payment type. Please contact support.");
    }
  };

  const handleUpdatePaymentMethod = async () => {
    // Show provider selection modal instead of directly opening portal
    setShowPaymentModal(true);
  };

  const handleSwitchProvider = async (newProvider) => {
    try {
      setSwitchLoading(true);
      setError("");
      const userId = localStorage.getItem("userId");
      
      const response = await axios.post(
        apiUrl(ROUTES.SWITCH_PROVIDER),
        { userId, newProvider }
      );
      
      if (response.data?.success) {
        setSuccess(response.data.message);
        setShowProviderSwitchModal(false);
        setShowPaymentModal(false);
        
        // Refresh subscription data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(response.data?.error || "Failed to schedule provider switch.");
      }
    } catch (error) {
      console.error("Error switching provider:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.details || "Failed to switch payment provider. Please try again.";
      setError(errorMsg);
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleUpdateCurrentProvider = async () => {
    try {
      setLoadingSubscription(true);
      setError("");
      const userId = localStorage.getItem("userId");
      const currentProvider = subscriptionData?.paymentType;
      
      if (currentProvider === "STRIPE") {
        // Create Stripe Customer Portal session
        const response = await axios.post(
          apiUrl(ROUTES.CREATE_PORTAL_SESSION),
          { userId }
        );
        
        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          setError("Failed to create portal session. Please try again.");
          setLoadingSubscription(false);
        }
      } else if (currentProvider === "PAYPAL") {
        // For PayPal, redirect to PayPal management
        setError("PayPal payment method updates must be done through PayPal.com. Please log in to your PayPal account to update your payment method.");
        setLoadingSubscription(false);
      } else {
        setError("Unable to determine payment provider. Please contact support.");
        setLoadingSubscription(false);
      }
    } catch (error) {
      console.error("Error updating payment method:", error);
      setError("Failed to open payment settings. Please try again or contact support.");
      setLoadingSubscription(false);
    }
  };

  const handleConfirmReset = async () => {
    if (resetConfirmText !== "RESET") return;
    try {
      setIsWorking(true);
      const userId = localStorage.getItem("userId");
      const items = await fetchTransactionsForExport();
      if (items.length) {
        const csvData = generateCSV(items);
        const fileName = `transactions_backup_${new Date().toISOString().slice(0, 10)}.csv`;
        try {
          if (isIOSDevice()) {
            downloadCSV(csvData, fileName);
            await new Promise((r) => setTimeout(r, 500));
          } else {
            downloadCSV(csvData, fileName);
          }
        } catch (e) {}
        try {
          await uploadCSVToS3(csvData);
        } catch (e) {}
      }
      try {
        await fetchWithRetry(apiUrl(`${ROUTES.TRANSACTION}/deleteAll?userId=${userId}`), {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } catch (deleteErr) {
        alert(`Reset failed: ${deleteErr?.message || "Unknown error"}`);
        setIsWorking(false);
        return;
      }
      setShowResetModal(false);
      setResetConfirmText("");
      navigate("/customer/financial-report");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      alert(`Reset failed: ${err?.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md="8" style={{ paddingInline: 0 }}>
            <Card style={{ backgroundColor: "#101926", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)" }}>
              <CardHeader style={{ backgroundColor: "#101926" }}>
                <h5 className="title" style={{ color: "#ffffff" }}>Profile</h5>
                <Nav tabs style={{ borderBottom: "1px solid #2d3a4f", marginTop: "12px" }}>
                  <NavItem>
                    <NavLink
                      className={activeTab === "1" ? "active" : ""}
                      onClick={() => setActiveTab("1")}
                      style={{
                        cursor: "pointer",
                        color: activeTab === "1" ? "#22d3ee" : "#94a3b8",
                        borderColor: "#2d3a4f",
                      }}
                    >
                      Personal Information
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "2" ? "active" : ""}
                      onClick={() => setActiveTab("2")}
                      style={{
                        cursor: "pointer",
                        color: activeTab === "2" ? "#22d3ee" : "#94a3b8",
                        borderColor: "#2d3a4f",
                      }}
                    >
                      Payment Management
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "3" ? "active" : ""}
                      onClick={() => setActiveTab("3")}
                      style={{
                        cursor: "pointer",
                        color: activeTab === "3" ? "#22d3ee" : "#94a3b8",
                        borderColor: "#2d3a4f",
                      }}
                    >
                      Data Management
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody style={{ backgroundColor: "#101926" }}>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row >
                    <Col className="pr-1" md="6" >
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Name</label>
                        <Input
                          name="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Email address</label>
                        <Input
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="email"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="6">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Phone</label>
                        <Input
                          name="phone"
                          value={userData.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Company Name</label>
                        <Input
                          name="companyName"
                          value={userData.companyName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Business Type</label>
                        {isEditing ? (
                          <Input
                            type="select"
                            name="businessType"
                            value={userData.businessType || ""}
                            onChange={handleInputChange}
                            style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                          >
                            <option value="">Select Business Type</option>
                            <option value="Trucking">Trucking</option>
                            <option value="RIDESHARE DRIVERS/PARTNERS">
                              RIDESHARE DRIVERS/PARTNERS
                            </option>
                            <option value="Groceries">Groceries</option>
                            <option value="Individual/Households">
                              Individual/Households
                            </option>
                            <option value="Resturant/Cafe">Resturant/Cafe</option>
                            <option value="Cleaning Services">Cleaning Services</option>
                            <option value="Beauty & Grooming">
                              Beauty & Grooming (Salons, Barbershops)
                            </option>
                            <option value="E-commerce Sellers">
                              E-commerce Sellers (Shopify, Amazon, Etsy)
                            </option>
                            <option value="Construction Trades">
                              Construction Trades (Plumbing, Electrical, Painting, etc.)
                            </option>
                            <option value="Content Creator">Content Creator</option>
                            <option value="Other">Other Businesses</option>
                          </Input>
                        ) : (
                          <Input
                            value={userData.businessType || "—"}
                            disabled
                            type="text"
                            placeholder="Not specified"
                            style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                          />
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Cash Balance</label>
                        <Input
                          name="cashBalance"
                          value={userData.cashBalance}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="4">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Outstanding Debt</label>
                        <Input
                          name="outstandingDebt"
                          value={userData.outstandingDebt}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label style={{ color: "#ffffff" }}>Valuable Items</label>
                        <Input
                          name="valueableItems"
                          value={userData.valueableItems}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                          style={{ backgroundColor: "#202a3a", color: "#ffffff", border: "1px solid #3a4555", borderRadius: "4px" }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                 
                  {isCustomer && (
                    <>
                      {/* Save + Discard when editing and there are changes */}
                      {isEditing && hasChanges && (
                        <Row>
                          <Col md="12">
                            <Button color="success" type="submit">
                              Save Changes
                            </Button>
                            <Button
                              color="secondary"
                              className="ml-2"
                              onClick={handleDiscard}
                            >
                              Discard
                            </Button>
                          </Col>
                        </Row>
                      )}

                      {/* Edit button when NOT editing or no changes */}
                      {(!isEditing || !hasChanges) && (
                        <Row>
                          <Col md="12" className="d-flex" style={{ gap: "16px" }}>
                            <Button
                              color="primary"
                              onClick={() => setIsEditing(true)}
                              disabled={editDisabled}
                            >
                              Edit Profile
                            </Button>
                            <Button color="danger" onClick={handleDelete}>
                              Delete Account
                            </Button>
                          </Col>
                        </Row>
                      )}

                      {/* Delete account button when editing */}
                      {isEditing && (
                        <Row className="mt-3">
                          <Col md="12">
                            <Button color="danger" onClick={handleDelete}>
                              Delete Account
                            </Button>
                          </Col>
                        </Row>
                      )}
                    </>
                  )}
                </Form>
                  </TabPane>
                  <TabPane tabId="2">
                    {loadingSubscription ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <p style={{ marginTop: "16px" }}>Loading subscription details...</p>
                      </div>
                    ) : subscriptionData && subscriptionData.isPaid && subscriptionData.subscriptionDetails ? (
                      <div style={{ padding: "20px" }}>
                        {/* Subscription Status Card */}
                        <div style={{
                          backgroundColor: "#0d1a2b",
                          borderRadius: "12px",
                          padding: "24px",
                          marginBottom: "24px",
                          border: "1px solid #1e3a5f",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div>
                            
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{
                                  backgroundColor: subscriptionData.subscriptionDetails.status === "active" ? "#10b981" : "#f59e0b",
                                  color: "#ffffff",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  textTransform: "capitalize"
                                }}>
                                  {subscriptionData.subscriptionDetails.status === "active" ? "✓ Active" : subscriptionData.subscriptionDetails.status}
                                </span>
                                <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                                  {subscriptionData.paymentType || "STRIPE"}
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "32px", fontWeight: "700", color: "#ffffff" }}>
                                ${subscriptionData.subscriptionDetails.amount}
                              </div>
                              <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                                per {subscriptionData.subscriptionDetails.interval}
                              </div>
                            </div>
                          </div>

                          {/* Subscription Details */}
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "16px",
                            marginTop: "24px",
                            paddingTop: "24px",
                            borderTop: "1px solid #1e3a5f"
                          }}>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                                Subscription ID
                              </div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {subscriptionData.subscriptionId}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                                Provider
                              </div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px", textTransform: "capitalize" }}>
                                {subscriptionData.subscriptionDetails.provider || "Stripe"}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                                Next Billing Date
                              </div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px" }}>
                                {new Date(subscriptionData.subscriptionDetails.nextBillingDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                                Billing Cycle
                              </div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px", textTransform: "capitalize" }}>
                                {subscriptionData.subscriptionDetails.interval}ly
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                                Currency
                              </div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px", textTransform: "uppercase" }}>
                                {subscriptionData.subscriptionDetails.currency}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                                Auto-Renewal
                              </div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px" }}>
                                {subscriptionData.subscriptionDetails.cancelAtPeriodEnd ? "Disabled (Canceling)" : "Enabled"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cancellation Notice */}
                        {subscriptionData.subscriptionDetails.cancelAtPeriodEnd && (
                          <div style={{
                            backgroundColor: "#451a03",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "24px",
                            border: "1px solid #f59e0b",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                          }}>
                            <span style={{ fontSize: "24px" }}>⚠️</span>
                            <div>
                              <div style={{ color: "#fbbf24", fontWeight: "600", marginBottom: "4px" }}>
                                Subscription Ending
                              </div>
                              <div style={{ color: "#fcd34d", fontSize: "14px" }}>
                                Your subscription will end on {new Date(subscriptionData.subscriptionDetails.nextBillingDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })}. You can reactivate it anytime before this date.
                              </div>
                            </div>
                          </div>
                        )}
 {/* Invoices Section */}
 {subscriptionData.invoices && subscriptionData.invoices.length > 0 && (
                          <div style={{
                            backgroundColor: "#0d1a2b",
                            borderRadius: "12px",
                            padding: "24px",
                            marginBottom: "24px",
                            border: "1px solid #1e3a5f"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                              <h5 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                                Billing History
                              </h5>
                              <span style={{ color: "#64748b", fontSize: "14px" }}>
                                {subscriptionData.invoiceCount || subscriptionData.invoices.length} {subscriptionData.invoices.length === 1 ? 'Invoice' : 'Invoices'}
                              </span>
                            </div>
                            
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                                    <th style={{ padding: "12px 8px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                                      Invoice
                                    </th>
                                    <th style={{ padding: "12px 8px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                                      Date
                                    </th>
                                    <th style={{ padding: "12px 8px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                                      Amount
                                    </th>
                                    <th style={{ padding: "12px 8px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                                      Status
                                    </th>
                                    <th style={{ padding: "12px 8px", textAlign: "right", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subscriptionData.invoices.map((invoice, index) => (
                                    <tr key={invoice.invoiceId || index} style={{ borderBottom: "1px solid #1e3a5f" }}>
                                      <td style={{ padding: "16px 8px" }}>
                                        <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                                          {invoice.invoiceNumber || invoice.invoiceId}
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                                          {invoice.description || `${invoice.frequency || 'Monthly'} Subscription`}
                                        </div>
                                      </td>
                                      <td style={{ padding: "16px 8px" }}>
                                        <div style={{ color: "#e2e8f0", fontSize: "14px" }}>
                                          {new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                          })}
                                        </div>
                                      </td>
                                      <td style={{ padding: "16px 8px" }}>
                                        <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "500" }}>
                                          ${invoice.amountPaid || invoice.amount}
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                                          {(invoice.currency || 'USD').toUpperCase()}
                                        </div>
                                      </td>
                                      <td style={{ padding: "16px 8px" }}>
                                        <span style={{
                                          backgroundColor: invoice.status === "paid" ? "#10b98120" : invoice.status === "open" ? "#f59e0b20" : "#ef444420",
                                          color: invoice.status === "paid" ? "#10b981" : invoice.status === "open" ? "#f59e0b" : "#ef4444",
                                          padding: "4px 10px",
                                          borderRadius: "12px",
                                          fontSize: "12px",
                                          fontWeight: "600",
                                          textTransform: "capitalize"
                                        }}>
                                          {invoice.status}
                                        </span>
                                      </td>
                                      <td style={{ padding: "16px 8px", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                          {invoice.pdfUrl && (
                                            <a
                                              href={invoice.pdfUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                backgroundColor: "#1e3a5f",
                                                color: "#22d3ee",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                textDecoration: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                transition: "background-color 0.2s"
                                              }}
                                              onMouseEnter={(e) => e.target.style.backgroundColor = "#2d4a6f"}
                                              onMouseLeave={(e) => e.target.style.backgroundColor = "#1e3a5f"}
                                            >
                                              📄 PDF
                                            </a>
                                          )}
                                          {invoice.hostedUrl && (
                                            <a
                                              href={invoice.hostedUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                backgroundColor: "#1e3a5f",
                                                color: "#22d3ee",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                textDecoration: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                transition: "background-color 0.2s"
                                              }}
                                              onMouseEnter={(e) => e.target.style.backgroundColor = "#2d4a6f"}
                                              onMouseLeave={(e) => e.target.style.backgroundColor = "#1e3a5f"}
                                            >
                                              🔗 View
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      

                        {/* Payment Method Card */}
                        <div style={{
                          backgroundColor: "#0d1a2b",
                          borderRadius: "12px",
                          padding: "24px",
                          marginBottom: "24px",
                          border: "1px solid #1e3a5f"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h5 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "600", margin: 0 }}>
                              Payment Method
                            </h5>
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: "#3d83f1",
                                borderColor: "#3d83f1",
                                fontSize: "12px",
                                padding: "6px 16px"
                              }}
                              onClick={handleUpdatePaymentMethod}
                              disabled={loadingSubscription || subscriptionData?.pendingProviderSwitch}
                            >
                              {loadingSubscription ? (
                                <>
                                  <Spinner size="sm" style={{ marginRight: "4px" }} />
                                  Loading...
                                </>
                              ) : (
                                "Manage Payment"
                              )}
                            </Button>
                          </div>
                          
                          {/* Pending Provider Switch Notice */}
                          {subscriptionData?.pendingProviderSwitch && (
                            <div style={{
                              backgroundColor: "#451a03",
                              borderRadius: "8px",
                              padding: "12px",
                              marginBottom: "16px",
                              border: "1px solid #f59e0b",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <span style={{ fontSize: "18px" }}>🔄</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: "#fbbf24", fontWeight: "600", fontSize: "13px", marginBottom: "2px" }}>
                                  Provider Switch Scheduled
                                </div>
                                <div style={{ color: "#fcd34d", fontSize: "12px" }}>
                                  Switching to {subscriptionData.pendingProviderSwitch} on {new Date(subscriptionData.switchScheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              backgroundColor: "#1e3a5f",
                              padding: "12px",
                              borderRadius: "8px",
                              fontSize: "24px"
                            }}>
                              {subscriptionData.paymentType === "STRIPE" ? "💳" : "🅿️"}
                            </div>
                            <div>
                              <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "500" }}>
                                {subscriptionData.paymentType === "STRIPE" ? "Credit/Debit Card (Stripe)" : "PayPal"}
                              </div>
                              <div style={{ color: "#64748b", fontSize: "12px" }}>
                                {subscriptionData.paymentType === "STRIPE" ? "Managed via Stripe" : "Managed via PayPal"}
                              </div>
                            </div>
                          </div>
                        </div>

                       

                        {/* Actions */}
                        <div style={{
                          backgroundColor: "#0d1a2b",
                          borderRadius: "12px",
                          padding: "24px",
                          border: "1px solid #1e3a5f"
                        }}>
                          <h5 style={{ color: "#ffffff", marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>
                            Manage Subscription
                          </h5>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <Button
                              style={{
                                backgroundColor: "#3d83f1",
                                borderColor: "#3d83f1",
                                fontSize: "14px"
                              }}
                              onClick={() => navigate(location.pathname.includes("admin") ? "/admin/subscriptions" : "/customer/subscription")}
                            >
                              View Plans & Pricing
                            </Button>
                            <Button
                              style={{
                                backgroundColor: "#e53e3e",
                                borderColor: "#e53e3e",
                                color: "#ffffff",
                                fontSize: "14px"
                              }}
                              onClick={() => setShowCancelModal(true)}
                              disabled={cancelLoading}
                            >
                              {cancelLoading ? <><Spinner size="sm" /> Cancelling...</> : "Cancel Subscription"}
                            </Button>
                          </div>
                          <p style={{ color: "#64748b", fontSize: "12px", marginTop: "16px", marginBottom: 0 }}>
                            Need help? Contact our support team at info@mesobfinancial.com
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "40px", textAlign: "center" }}>
                        <div style={{
                          backgroundColor: "#0d1a2b",
                          borderRadius: "12px",
                          padding: "40px",
                          border: "1px solid #1e3a5f"
                        }}>
                          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                          <h4 style={{ color: "#ffffff", marginBottom: "12px" }}>No Active Subscription</h4>
                          <p style={{ color: "#94a3b8", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
                            Subscribe to Pro Plan to unlock unlimited transactions, advanced reports, and more features.
                          </p>
                          <Button
                            color="primary"
                            style={{ backgroundColor: "#3d83f1", borderColor: "#3d83f1", fontSize: "14px" }}
                            onClick={() => navigate(location.pathname.includes("admin") ? "/admin/subscriptions" : "/customer/subscription")}
                          >
                            View Plans & Subscribe
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabPane>
                  <TabPane tabId="3">
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "15px",
                        backgroundColor: "#0d1a2b",
                        borderRadius: "8px",
                        border: "1px solid #1e3a5f",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px" }}>⚠️</span>
                        <span style={{ color: "#e53e3e", fontWeight: "bold", fontSize: "13px" }}>
                          Data Management
                        </span>
                      </div>
                      <p style={{ color: "#a0aec0", fontSize: "13px", marginBottom: "12px", lineHeight: "1.4" }}>
                        Reset all accounting records and start fresh. Make sure to download your reports first.
                      </p>
                      <Button
                        onClick={handleOpenResetModal}
                        disabled={isWorking}
                        style={{
                          backgroundColor: "#e53e3e",
                          borderColor: "#e53e3e",
                          color: "#ffffff",
                          fontSize: "12px",
                          padding: "8px 16px",
                          borderRadius: "6px",
                        }}
                      >
                        Reset All Transactions
                      </Button>
                    </div>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal isOpen={showResetModal} toggle={() => { setShowResetModal(false); setResetConfirmText(""); }}>
        <ModalHeader
          toggle={() => { setShowResetModal(false); setResetConfirmText(""); }}
          style={{ backgroundColor: "#1a273a", border: "none" }}
        >
          <span style={{ color: "#e53e3e", fontWeight: "bold" }}>Reset All Transactions</span>
        </ModalHeader>
        <ModalBody style={{ backgroundColor: "#1a273a", color: "#ffffff" }}>
          <p style={{ color: "#ffffff", marginBottom: "12px" }}>
            This will permanently delete <strong>all transactions</strong> and reset your dashboard balances to zero.
          </p>
          <p style={{ color: "#e53e3e", marginBottom: "20px", fontWeight: "500" }}>
            We strongly recommend downloading your financial reports before continuing. This action cannot be undone.
          </p>
          <p style={{ color: "#ffffff", marginBottom: "8px" }}>Type <strong>RESET</strong> to confirm:</p>
          <Input
            type="text"
            placeholder="Type RESET here"
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.target.value)}
            style={{
              backgroundColor: "#0d1a2b",
              color: "#ffffff",
              border: "1px solid #3a4555",
              marginBottom: "20px",
            }}
          />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button
              onClick={handleDownloadReport}
              disabled={isWorking}
              style={{ backgroundColor: "#3d83f1", borderColor: "#3d83f1", color: "#ffffff", flex: "1" }}
            >
              {isWorking ? "Downloading..." : "Download Financial Report"}
            </Button>
            <Button color="secondary" onClick={() => { setShowResetModal(false); setResetConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReset}
              disabled={resetConfirmText !== "RESET" || isWorking}
              style={{
                backgroundColor: resetConfirmText === "RESET" ? "#e53e3e" : "#666",
                borderColor: resetConfirmText === "RESET" ? "#e53e3e" : "#666",
                color: "#ffffff",
              }}
            >
              {isWorking ? "Processing..." : "Confirm Reset"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Cancel Subscription Confirmation Modal */}
      <Modal isOpen={showCancelModal} toggle={() => setShowCancelModal(false)}>
        <ModalHeader
          toggle={() => setShowCancelModal(false)}
          style={{ backgroundColor: "#1a273a", border: "none" }}
        >
          <span style={{ color: "#e53e3e", fontWeight: "bold" }}>Cancel Subscription</span>
        </ModalHeader>
        <ModalBody style={{ backgroundColor: "#1a273a", color: "#ffffff" }}>
          <p style={{ color: "#ffffff", marginBottom: "12px" }}>
            Are you sure you want to cancel your subscription?
          </p>
          <p style={{ color: "#fbbf24", marginBottom: "20px", fontWeight: "500" }}>
            Your subscription will remain active until the end of your current billing period on{" "}
            <strong>
              {subscriptionData?.subscriptionDetails?.nextBillingDate
                ? new Date(subscriptionData.subscriptionDetails.nextBillingDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })
                : "the end of the billing period"}
            </strong>.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            After cancellation, you'll lose access to:
          </p>
          <ul style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>
            <li>Unlimited transactions</li>
            <li>Advanced financial reports</li>
            <li>Balance sheet and income statement</li>
            <li>Receipt management</li>
          </ul>
        </ModalBody>
        <ModalFooter style={{ backgroundColor: "#1a273a", borderTop: "1px solid #2d3a4f" }}>
          <Button
            color="secondary"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelLoading}
            style={{ backgroundColor: "#475569", borderColor: "#475569" }}
          >
            Keep Subscription
          </Button>
          <Button
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
            style={{
              backgroundColor: "#e53e3e",
              borderColor: "#e53e3e",
              color: "#ffffff"
            }}
          >
            {cancelLoading ? (
              <>
                <Spinner size="sm" style={{ marginRight: "8px" }} />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Subscription"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Payment Method Selection Modal */}
      <Modal isOpen={showPaymentModal} toggle={() => setShowPaymentModal(false)}>
        <ModalHeader
          toggle={() => setShowPaymentModal(false)}
          style={{ backgroundColor: "#1a273a", border: "none" }}
        >
          <span style={{ color: "#22d3ee", fontWeight: "bold" }}>Manage Payment Method</span>
        </ModalHeader>
        <ModalBody style={{ backgroundColor: "#1a273a", color: "#ffffff" }}>
          <p style={{ color: "#e2e8f0", marginBottom: "20px", fontSize: "14px" }}>
            Choose an option to manage your payment method:
          </p>
          
          {/* Current Provider Card */}
          <div style={{
            backgroundColor: "#0d1a2b",
            border: "1px solid #1e3a5f",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ fontSize: "24px" }}>
                {subscriptionData?.paymentType === "STRIPE" ? "💳" : "🅿️"}
              </span>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "600" }}>
                  Current Provider: {subscriptionData?.paymentType || "N/A"}
                </div>
                <div style={{ color: "#64748b", fontSize: "12px" }}>
                  {subscriptionData?.paymentType === "STRIPE" ? "Credit/Debit Card" : "PayPal Account"}
                </div>
              </div>
            </div>
            <Button
              block
              style={{
                backgroundColor: "#3d83f1",
                borderColor: "#3d83f1",
                fontSize: "13px",
                padding: "8px"
              }}
              onClick={handleUpdateCurrentProvider}
              disabled={loadingSubscription}
            >
              {loadingSubscription ? (
                <>
                  <Spinner size="sm" style={{ marginRight: "4px" }} />
                  Loading...
                </>
              ) : (
                `Update ${subscriptionData?.paymentType} Details`
              )}
            </Button>
          </div>

          <div style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "12px",
            margin: "16px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#2d3a4f" }}></div>
            <span>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#2d3a4f" }}></div>
          </div>

          {/* Switch Provider Card */}
          <div style={{
            backgroundColor: "#0d1a2b",
            border: "1px solid #1e3a5f",
            borderRadius: "8px",
            padding: "16px"
          }}>
            <div style={{ marginBottom: "12px" }}>
              <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
                Switch Payment Provider
              </div>
              <div style={{ color: "#64748b", fontSize: "12px" }}>
                Change to {subscriptionData?.paymentType === "STRIPE" ? "PayPal" : "Stripe"} at the end of your current billing period
              </div>
            </div>
            <Button
              block
              style={{
                backgroundColor: "#10b981",
                borderColor: "#10b981",
                fontSize: "13px",
                padding: "8px"
              }}
              onClick={() => {
                const newProvider = subscriptionData?.paymentType === "STRIPE" ? "PAYPAL" : "STRIPE";
                setSelectedNewProvider(newProvider);
                setShowPaymentModal(false);
                setShowProviderSwitchModal(true);
              }}
              disabled={subscriptionData?.pendingProviderSwitch}
            >
              {subscriptionData?.pendingProviderSwitch ? (
                "Switch Already Scheduled"
              ) : (
                `Switch to ${subscriptionData?.paymentType === "STRIPE" ? "PayPal" : "Stripe"}`
              )}
            </Button>
          </div>
        </ModalBody>
        <ModalFooter style={{ backgroundColor: "#1a273a", borderTop: "1px solid #2d3a4f" }}>
          <Button
            color="secondary"
            onClick={() => setShowPaymentModal(false)}
            style={{ backgroundColor: "#475569", borderColor: "#475569" }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Provider Switch Confirmation Modal */}
      <Modal isOpen={showProviderSwitchModal} toggle={() => setShowProviderSwitchModal(false)}>
        <ModalHeader
          toggle={() => setShowProviderSwitchModal(false)}
          style={{ backgroundColor: "#1a273a", border: "none" }}
        >
          <span style={{ color: "#10b981", fontWeight: "bold" }}>Switch Payment Provider</span>
        </ModalHeader>
        <ModalBody style={{ backgroundColor: "#1a273a", color: "#ffffff" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "4px" }}>
                  {subscriptionData?.paymentType === "STRIPE" ? "💳" : "🅿️"}
                </div>
                <div style={{ color: "#64748b", fontSize: "12px" }}>
                  {subscriptionData?.paymentType}
                </div>
              </div>
              <div style={{ fontSize: "24px", color: "#64748b" }}>→</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "4px" }}>
                  {selectedNewProvider === "STRIPE" ? "💳" : "🅿️"}
                </div>
                <div style={{ color: "#10b981", fontSize: "12px", fontWeight: "600" }}>
                  {selectedNewProvider}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "#0d1a2b",
            border: "1px solid #1e3a5f",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px"
          }}>
            <h6 style={{ color: "#22d3ee", fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
              How Provider Switching Works:
            </h6>
            <ul style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "0", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>
                Your current <strong>{subscriptionData?.paymentType}</strong> subscription will remain active until{" "}
                <strong>
                  {subscriptionData?.subscriptionDetails?.nextBillingDate
                    ? new Date(subscriptionData.subscriptionDetails.nextBillingDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "the end of the billing period"}
                </strong>
              </li>
              <li style={{ marginBottom: "8px" }}>
                You'll continue to have <strong>full access</strong> during this period
              </li>
              <li style={{ marginBottom: "8px" }}>
                On the end date, your {subscriptionData?.paymentType} subscription will automatically cancel
              </li>
              <li>
                You'll receive an email reminder to set up your <strong>{selectedNewProvider}</strong> subscription
              </li>
            </ul>
          </div>

          <div style={{
            backgroundColor: "#451a03",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px"
          }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fbbf24", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                Important
              </div>
              <div style={{ color: "#fcd34d", fontSize: "12px" }}>
                Make sure to complete your {selectedNewProvider} subscription setup when you receive the reminder email to avoid service interruption.
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter style={{ backgroundColor: "#1a273a", borderTop: "1px solid #2d3a4f" }}>
          <Button
            color="secondary"
            onClick={() => setShowProviderSwitchModal(false)}
            disabled={switchLoading}
            style={{ backgroundColor: "#475569", borderColor: "#475569" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSwitchProvider(selectedNewProvider)}
            disabled={switchLoading}
            style={{
              backgroundColor: "#10b981",
              borderColor: "#10b981",
              color: "#ffffff"
            }}
          >
            {switchLoading ? (
              <>
                <Spinner size="sm" style={{ marginRight: "8px" }} />
                Scheduling...
              </>
            ) : (
              `Confirm Switch to ${selectedNewProvider}`
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default UserPage;
