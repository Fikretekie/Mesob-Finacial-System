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
                    <div style={{ padding: "20px", color: "#e2e8f0" }}>
                      <p className="mb-3">Manage your subscription and payment methods.</p>
                      <Button
                        color="primary"
                        style={{ backgroundColor: "#3d83f1", borderColor: "#3d83f1" }}
                        onClick={() => navigate(location.pathname.includes("admin") ? "/admin/subscriptions" : "/customer/subscription")}
                      >
                        Go to Subscribe
                      </Button>
                    </div>
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
    </>
  );
}

export default UserPage;
