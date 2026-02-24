import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Nav, Modal, ModalHeader, ModalBody, Button, Input } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { saveAs } from "file-saver";

const logo = "/logo2.png";
var ps;

function Sidebar(props) {
  const userRole = parseInt(localStorage.getItem("role"));

  const sidebar = React.useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });

  // Detect if device is iOS
  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // ✅ Reusable fetch with retry — handles iOS cold-start network errors
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
        console.warn(`[Retry] Attempt ${attempt + 1} failed:`, err.message);
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  };

  // ✅ FIXED: Properly calls fetchWithRetry and returns data
  const fetchTransactionsForExport = async () => {
    const userId = localStorage.getItem("userId");
    const res = await fetchWithRetry(
      `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
    );
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

  // ✅ FIXED: Works on both iOS and Desktop — opens CSV in new tab on iOS (Safari compatible)
  const downloadCSV = (csvData, fileName) => {
    const deviceType = isIOSDevice() ? "iOS" : "Desktop";
    try {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });

      if (isIOSDevice()) {
        // iOS Safari: open in new tab so user can save via share sheet
        const url = URL.createObjectURL(blob);
        const newTab = window.open(url, "_blank");
        if (!newTab) {
          // Fallback if popup blocked — use anchor click
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        console.log(`[${deviceType}] CSV opened in new tab for saving`);
      } else {
        // Desktop: use file-saver
        saveAs(blob, fileName);
        console.log(`[${deviceType}] CSV downloaded via saveAs`);
      }
      return true;
    } catch (error) {
      console.warn(`[${deviceType}] CSV download failed:`, error.message);
      return false;
    }
  };

  // ✅ FIXED: iOS S3 upload is now ENABLED (removed the isIOSDevice block)
  const uploadCSVToS3 = async (csvData) => {
    const userId = localStorage.getItem("userId");
    const deviceType = isIOSDevice() ? "iOS" : "Desktop";
    const fileName = `transactions_${new Date().toISOString()}.csv`;
    const s3Key = `backups/${userId}${fileName}`;

    console.log(`[${deviceType}] S3 Upload - Starting...`);

    try {
      const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));

      const payload = {
        bucketName: "app.mesobfinancial.com",
        key: s3Key,
        filename: fileName,
        userId,
        fileContent: base64CsvData,
        type: "text/csv;charset=utf-8",
      };

      // Use fetchWithRetry for iOS cold-start resilience
      const response = await fetchWithRetry(
        "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log(`[${deviceType}] S3 Upload - SUCCESS!`, data);
      return data;
    } catch (error) {
      console.error(`[${deviceType}] S3 Upload - FAILED:`, error.message);
      throw error;
    }
  };

  const handleOpenResetModal = () => {
    setResetConfirmText("");
    setShowResetModal(true);

    // 🔥 Warm up the connection while user reads the modal
    fetch(
      "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=ping"
    ).catch(() => {}); // silent warm-up — don't care about response
  };

  const handleDownloadReport = async () => {
    if (location.pathname.includes("financial-report")) {
      window.dispatchEvent(new Event("mesob:downloadReport"));
    } else {
      navigate("/customer/financial-report", {
        state: { openDownloadModal: true },
      });
    }
  };

  const handleConfirmReset = async () => {
    if (resetConfirmText !== "RESET") return;

    try {
      setIsWorking(true);
      const userId = localStorage.getItem("userId");
      const deviceType = isIOSDevice() ? "iOS" : "Desktop";

      // Step 1: Fetch transactions
      console.log(`[${deviceType}] Step 1: Fetching transactions...`);
      const items = await fetchTransactionsForExport(); // ✅ FIXED: proper function call
      console.log(`[${deviceType}] Step 1 done: ${items.length} items fetched`);

      // Step 2 & 3: Backup — download CSV + upload to S3
      if (items.length) {
        const csvData = generateCSV(items);
        const fileName = `transactions_backup_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

        // ✅ Download CSV (works on both iOS and Desktop now)
       // Step 2: Download CSV
try {
  console.log(`[${deviceType}] Step 2: Downloading CSV...`);
  if (isIOSDevice()) {
    // ✅ iOS: Fire the download dialog but DON'T await it
    // User can tap Download, View, or close (×) — we proceed regardless
    downloadCSV(csvData, fileName);
    // Small pause to let Safari register the download trigger
    await new Promise((r) => setTimeout(r, 500));
  } else {
    // Desktop: normal silent download
    downloadCSV(csvData, fileName);
  }
} catch (backupErr) {
  console.warn(`[${deviceType}] CSV download FAILED (non-critical):`, backupErr.message);
}

// Step 3: S3 upload (runs for all devices)
try {
  console.log(`[${deviceType}] Step 3: Uploading to S3...`);
  await uploadCSVToS3(csvData);
} catch (s3Err) {
  console.warn(`[${deviceType}] S3 upload FAILED (non-critical):`, s3Err.message);
}

// Step 4: DELETE — runs no matter what the user tapped on the dialog
      } else {
        console.log(`[${deviceType}] No transactions to back up, skipping steps 2-3`);
      }

      // Step 4: DELETE — critical step
      try {
        console.log(`[${deviceType}] Step 4: Deleting all transactions...`);
        const response = await fetchWithRetry(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(`[${deviceType}] Step 4 done: status ${response.status}`);
      } catch (deleteErr) {
        const errorMsg = deleteErr?.message || "Unknown error";
        console.error(`[${deviceType}] Step 4 CRITICAL FAILURE:`, {
          message: errorMsg,
          fullError: deleteErr,
        });
        alert(`Reset failed: ${errorMsg}`);
        setIsWorking(false);
        return;
      }

      // Step 5: Success
      console.log(`[${deviceType}] Reset completed successfully!`);
      setShowResetModal(false);
      setResetConfirmText("");
      navigate("/customer/financial-report");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Unexpected error during reset:", err);
      alert(`Reset failed: ${err?.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <div className="sidebar" data-color={props.backgroundColor}>
        <div className="logo" style={{ backgroundColor: "#101926" }}>
          <a
            href="#"
            className="simple-text logo-mini"
            style={{
              width: "100%",
              float: "none",
              margin: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="logo-img">
              <img src={logo} alt="react-logo" />
            </div>
          </a>
        </div>
        <div className="sidebar-wrapper" ref={sidebar}>
          <Nav>
            {props.routes.map((prop, key) => {
              if (prop.redirect || prop.invisible) return null;
              return (
                <li
                  className={
                    activeRoute(prop.layout + prop.path) +
                    (prop.pro ? " active active-pro" : "")
                  }
                  key={key}
                >
                  <NavLink to={prop.layout + prop.path} className="nav-link">
                    <i className={"now-ui-icons " + prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            })}
          </Nav>

          {userRole != 0 ? (
            <div
              style={{
                margin: "20px 10px 10px",
                padding: "15px",
                backgroundColor: "#0d1a2b",
                borderRadius: "8px",
                border: "1px solid #1e3a5f",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px" }}>⚠️</span>
                <span
                  style={{
                    color: "#e53e3e",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  Data Management
                </span>
              </div>
              <p
                style={{
                  color: "#a0aec0",
                  fontSize: "11px",
                  marginBottom: "12px",
                  lineHeight: "1.4",
                }}
              >
                Reset all accounting records and start fresh. Make sure to
                download your reports first.
              </p>
              <Button
                onClick={handleOpenResetModal}
                disabled={isWorking}
                style={{
                  backgroundColor: "#e53e3e",
                  borderColor: "#e53e3e",
                  color: "#ffffff",
                  width: "100%",
                  fontSize: "12px",
                  padding: "8px",
                  borderRadius: "6px",
                }}
              >
                Reset All Transactions
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Reset Modal */}
      <Modal
        isOpen={showResetModal}
        toggle={() => {
          setShowResetModal(false);
          setResetConfirmText("");
        }}
      >
        <ModalHeader
          toggle={() => {
            setShowResetModal(false);
            setResetConfirmText("");
          }}
          style={{ backgroundColor: "#1a273a", border: "none" }}
        >
          <span style={{ color: "#e53e3e", fontWeight: "bold" }}>
            Reset All Transactions
          </span>
        </ModalHeader>
        <ModalBody style={{ backgroundColor: "#1a273a", color: "#ffffff" }}>
          <p style={{ color: "#ffffff", marginBottom: "12px" }}>
            This will permanently delete <strong>all transactions</strong> and
            reset your dashboard balances to zero.
          </p>
          <p
            style={{
              color: "#e53e3e",
              marginBottom: "20px",
              fontWeight: "500",
            }}
          >
            We strongly recommend downloading your financial reports before
            continuing. This action cannot be undone.
          </p>

          <p style={{ color: "#ffffff", marginBottom: "8px" }}>
            Type <strong>RESET</strong> to confirm:
          </p>
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
              style={{
                backgroundColor: "#3d83f1",
                borderColor: "#3d83f1",
                color: "#ffffff",
                flex: "1",
              }}
            >
              {isWorking ? "Downloading..." : "Download Financial Report"}
            </Button>
            <Button
              color="secondary"
              onClick={() => {
                setShowResetModal(false);
                setResetConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReset}
              disabled={resetConfirmText !== "RESET" || isWorking}
              style={{
                backgroundColor:
                  resetConfirmText === "RESET" ? "#e53e3e" : "#666",
                borderColor:
                  resetConfirmText === "RESET" ? "#e53e3e" : "#666",
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

export default Sidebar;