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

  // Fetch transactions directly from API
  const fetchTransactionsForExport = async () => {
    const userId = localStorage.getItem("userId");
    const response = await axios.get(
      `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
    );
    return response.data || [];
  };

  const generateCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  // Detect if device is iOS
  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // iOS-compatible download function
  const downloadCSViOS = (csvData, fileName) => {
    try {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.warn("iOS download failed (non-critical):", error.message);
      return false;
    }
  };

  // Desktop-compatible download function
  const downloadCSVDesktop = (csvData, fileName) => {
    try {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      saveAs(blob, fileName);
      return true;
    } catch (error) {
      console.warn("Desktop download failed (non-critical):", error.message);
      return false;
    }
  };

  // const uploadCSVToS3 = async (csvData) => {
  //   const userId = localStorage.getItem("userId");
  //   const fileName = `transactions_${new Date().toISOString()}.csv`;
  //   const s3Key = `backups/${userId}${fileName}`;
  //   const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));

  //   await axios.post(
  //     "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup",
  //     {
  //       bucketName: "app.mesobfinancial.com",
  //       key: s3Key,
  //       filename: fileName,
  //       userId,
  //       fileContent: base64CsvData,
  //       type: "text/csv;charset=utf-8",
  //     }
  //   );
  // };


  const uploadCSVToS3 = async (csvData) => {
  const userId = localStorage.getItem("userId");
  const deviceType = isIOSDevice() ? "iOS" : "Desktop";
  const fileName = `transactions_${new Date().toISOString()}.csv`;
  const s3Key = `backups/${userId}${fileName}`;
  
  console.log(`[${deviceType}] S3 Upload - Step 1: Starting upload...`);
  console.log(`[${deviceType}] S3 Upload - userId:`, userId);
  console.log(`[${deviceType}] S3 Upload - fileName:`, fileName);
  console.log(`[${deviceType}] S3 Upload - s3Key:`, s3Key);

  try {
    const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));
    console.log(`[${deviceType}] S3 Upload - Step 2: Base64 encoded, length:`, base64CsvData.length);

    const payload = {
      bucketName: "app.mesobfinancial.com",
      key: s3Key,
      filename: fileName,
      userId,
      fileContent: base64CsvData,
      type: "text/csv;charset=utf-8",
    };
    
    console.log(`[${deviceType}] S3 Upload - Step 3: Payload prepared, size:`, JSON.stringify(payload).length, "bytes");

    const config = {
      timeout: deviceType === "iOS" ? 60000 : 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    console.log(`[${deviceType}] S3 Upload - Step 4: Sending POST request...`);
    console.log(`[${deviceType}] S3 Upload - Config:`, JSON.stringify(config));

    const response = await axios.post(
      "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup",
      payload,
      config
    );

    console.log(`[${deviceType}] S3 Upload - Step 5: SUCCESS! Status:`, response.status);
    console.log(`[${deviceType}] S3 Upload - Response data:`, response.data);
    return response.data;

  } catch (error) {
    console.error(`[${deviceType}] S3 Upload - FAILED!`);
    console.error(`[${deviceType}] Error type:`, error.constructor.name);
    console.error(`[${deviceType}] Error message:`, error.message);
    console.error(`[${deviceType}] Error code:`, error.code);
    console.error(`[${deviceType}] HTTP Status:`, error?.response?.status);
    console.error(`[${deviceType}] Response headers:`, error?.response?.headers);
    console.error(`[${deviceType}] Response data:`, error?.response?.data);
    console.error(`[${deviceType}] Request URL:`, error?.config?.url);
    console.error(`[${deviceType}] Request headers:`, error?.config?.headers);
    console.error(`[${deviceType}] Full error object:`, JSON.stringify(error, null, 2));

    // Don't throw - let it fail silently (non-critical)
    throw error;
  }
};
 
  const handleOpenResetModal = () => {
    setResetConfirmText("");
    setShowResetModal(true);
  };

const handleDownloadReport = async () => {
  if (location.pathname.includes("financial-report")) {
    // Already on the page — trigger PDF modal directly
    window.dispatchEvent(new Event("mesob:downloadReport"));
  } else {
    // Navigate to financial-report, then open the modal
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

    // Step 1: Fetch
    const items = await fetchTransactionsForExport();

    // Step 2 & 3: Backup (non-blocking) - SKIP ON iOS IF IT FAILS
    if (items.length) {
      const csvData = generateCSV(items);
      const fileName = `transactions_backup_${new Date().toISOString().slice(0, 10)}.csv`;
      
      try {
        console.log(`[${deviceType}] Step 2-3: Backing up...`);
        if (isIOSDevice()) {
          downloadCSViOS(csvData, fileName);
          // Don't await — iOS file handling is async-heavy
        } else {
          downloadCSVDesktop(csvData, fileName);
        }
      } catch (backupErr) {
        console.warn(`[${deviceType}] Backup FAILED (non-critical):`, backupErr.message);
      }

      // S3 upload separately with better error handling
      try {
        await uploadCSVToS3(csvData);
        console.log(`[${deviceType}] S3 upload successful`);
      } catch (s3Err) {
        console.warn(`[${deviceType}] S3 upload FAILED (non-critical):`, s3Err.message);
      }
    }

    // Step 4: DELETE - CRITICAL
    try {
      console.log(`[${deviceType}] Step 4: Deleting transactions...`);
      
      // Increase timeout for iOS, add error context
      const response = await axios.delete(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`,
        { 
          timeout: isIOSDevice() ? 60000 : 30000, // 60s for iOS
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`[${deviceType}] Step 4 done:`, response.status);
    } catch (deleteErr) {
      const errorMsg = deleteErr?.response?.data?.message || deleteErr?.message;
      const errorStatus = deleteErr?.response?.status || "Unknown";
      
      console.error(`[${deviceType}] Step 4 CRITICAL FAILURE:`, {
        status: errorStatus,
        message: errorMsg,
        code: deleteErr?.code,
        fullError: deleteErr
      });
      
      alert(`Reset failed: ${errorStatus} - ${errorMsg}`);
      setIsWorking(false);
      return;
    }

    // Step 5: Success
    console.log(`[${deviceType}] Reset completed!`);
    setShowResetModal(false);
    setResetConfirmText("");
    navigate("/customer/financial-report");
    setTimeout(() => window.location.reload(), 500);

  } catch (err) {
    console.error("Unexpected error:", err);
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

          {/* Data Management — always visible */}
        
        {userRole != 0 ?   <div
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
          </div> :null }
        
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
          <p style={{ color: "#e53e3e", marginBottom: "20px", fontWeight: "500" }}>
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

export default Sidebar;