// import React, { useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { Nav, Modal, ModalHeader, ModalBody, Button, Input } from "reactstrap";
// import PerfectScrollbar from "perfect-scrollbar";
// import { useTranslation } from "react-i18next";

// const logo = "/logo2.png";

// var ps;

// function Sidebar(props) {
//   const sidebar = React.useRef();
//   const location = useLocation();
//   const { t } = useTranslation();

//   // Step 1: show the Data Management warning panel
//   const [showWarning, setShowWarning] = useState(false);
//   // Step 2: show the RESET confirmation modal
//   const [showResetModal, setShowResetModal] = useState(false);
//   const [resetConfirmText, setResetConfirmText] = useState("");

//   const activeRoute = (routeName) => {
//     return location.pathname.indexOf(routeName) > -1 ? "active" : "";
//   };

//   React.useEffect(() => {
//     if (navigator.platform.indexOf("Win") > -1) {
//       ps = new PerfectScrollbar(sidebar.current, {
//         suppressScrollX: true,
//         suppressScrollY: false,
//       });
//     }
//     return function cleanup() {
//       if (navigator.platform.indexOf("Win") > -1) {
//         ps.destroy();
//       }
//     };
//   });

//   const handleCloseClick = () => {
//     setShowWarning(true);
//   };

//   const handleOpenResetModal = () => {
//     setResetConfirmText("");
//     setShowResetModal(true);
//   };

//  const handleConfirmReset = () => {
//   if (resetConfirmText === "RESET") {
//     window.dispatchEvent(new Event("mesob:downloadReport")); // ← download first
//     window.dispatchEvent(new Event("mesob:resetAllTransactions")); // ← then reset
//     setShowResetModal(false);
//     setShowWarning(false);
//     setResetConfirmText("");
//   }
// };

//   const handleDownloadReport = () => {
//     window.dispatchEvent(new Event("mesob:downloadReport"));
//   };

//   return (
//     <>
//       <div className="sidebar" data-color={props.backgroundColor}>
//         <div className="logo" style={{ backgroundColor: "#101926" }}>
//           <a
//             href="#"
//             className="simple-text logo-mini"
//             style={{
//               width: "100%",
//               float: "none",
//               margin: "0",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <div className="logo-img">
//               <img src={logo} alt="react-logo" />
//             </div>
//           </a>
//         </div>
//         <div className="sidebar-wrapper" ref={sidebar}>
//           <Nav>
//             {props.routes.map((prop, key) => {
//               if (prop.redirect || prop.invisible) return null;
//               return (
//                 <li
//                   className={
//                     activeRoute(prop.layout + prop.path) +
//                     (prop.pro ? " active active-pro" : "")
//                   }
//                   key={key}
//                 >
//                   <NavLink to={prop.layout + prop.path} className="nav-link">
//                     <i className={"now-ui-icons " + prop.icon} />
//                     <p>{prop.name}</p>
//                   </NavLink>
//                 </li>
//               );
//             })}
//           </Nav>

//          {/* Data Management — always visible */}
//         <div
//           style={{
//             margin: "20px 10px 10px",
//             padding: "15px",
//             backgroundColor: "#0d1a2b",
//             borderRadius: "8px",
//             border: "1px solid #1e3a5f",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               marginBottom: "8px",
//             }}
//           >
//             <span style={{ fontSize: "14px" }}>⚠️</span>
//             <span
//               style={{
//                 color: "#e53e3e",
//                 fontWeight: "bold",
//                 fontSize: "13px",
//               }}
//             >
//               Data Management
//             </span>
//           </div>
//           <p
//             style={{
//               color: "#a0aec0",
//               fontSize: "11px",
//               marginBottom: "12px",
//               lineHeight: "1.4",
//             }}
//           >
//             Reset all accounting records and start fresh. Make sure to
//             download your reports first.
//           </p>
//           <Button
//             onClick={handleOpenResetModal}
//             style={{
//               backgroundColor: "#e53e3e",
//               borderColor: "#e53e3e",
//               color: "#ffffff",
//               width: "100%",
//               fontSize: "12px",
//               padding: "8px",
//               borderRadius: "6px",
//             }}
//           >
//             Reset All Transactions
//           </Button>
//         </div>
//         </div>
//       </div>

//       {/* STEP 3: Reset All Transactions Modal */}
//       <Modal
//         isOpen={showResetModal}
//         toggle={() => {
//           setShowResetModal(false);
//           setResetConfirmText("");
//         }}
//       >
//         <ModalHeader
//           toggle={() => {
//             setShowResetModal(false);
//             setResetConfirmText("");
//           }}
//           style={{ backgroundColor: "#1a273a", border: "none" }}
//         >
//           <span style={{ color: "#e53e3e", fontWeight: "bold" }}>
//             Reset All Transactions
//           </span>
//         </ModalHeader>
//         <ModalBody style={{ backgroundColor: "#1a273a", color: "#ffffff" }}>
//           <p style={{ color: "#ffffff", marginBottom: "12px" }}>
//             This will permanently delete <strong>all transactions</strong> and
//             reset your dashboard balances to zero.
//           </p>
//           <p
//             style={{
//               color: "#e53e3e",
//               marginBottom: "20px",
//               fontWeight: "500",
//             }}
//           >
//             We strongly recommend downloading your financial reports before
//             continuing. This action cannot be undone.
//           </p>

//           <p style={{ color: "#ffffff", marginBottom: "8px" }}>
//             Type <strong>RESET</strong> to confirm:
//           </p>
//           <Input
//             type="text"
//             placeholder="Type RESET here"
//             value={resetConfirmText}
//             onChange={(e) => setResetConfirmText(e.target.value)}
//             style={{
//               backgroundColor: "#0d1a2b",
//               color: "#ffffff",
//               border: "1px solid #3a4555",
//               marginBottom: "20px",
//             }}
//           />

//           <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
//             <Button
//               onClick={handleDownloadReport}
//               style={{
//                 backgroundColor: "#3d83f1",
//                 borderColor: "#3d83f1",
//                 color: "#ffffff",
//                 flex: "1",
//               }}
//             >
//               Download Financial Report
//             </Button>
//             <Button
//               color="secondary"
//               onClick={() => {
//                 setShowResetModal(false);
//                 setResetConfirmText("");
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleConfirmReset}
//               disabled={resetConfirmText !== "RESET"}
//               style={{
//                 backgroundColor:
//                   resetConfirmText === "RESET" ? "#e53e3e" : "#666",
//                 borderColor:
//                   resetConfirmText === "RESET" ? "#e53e3e" : "#666",
//                 color: "#ffffff",
//               }}
//             >
//               Confirm Reset
//             </Button>
//           </div>
//         </ModalBody>
//       </Modal>
//     </>
//   );
// }

// export default Sidebar;


//Uneeb code 
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

  const uploadCSVToS3 = async (csvData) => {
    const userId = localStorage.getItem("userId");
    const fileName = `transactions_${new Date().toISOString()}.csv`;
    const s3Key = `backups/${userId}${fileName}`;
    const base64CsvData = btoa(unescape(encodeURIComponent(csvData)));

    await axios.post(
      "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup",
      {
        bucketName: "app.mesobfinancial.com",
        key: s3Key,
        filename: fileName,
        userId,
        fileContent: base64CsvData,
        type: "text/csv;charset=utf-8",
      }
    );
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
    const items = await fetchTransactionsForExport();

    // Download CSV backup locally
    if (items.length) {
      const csvData = generateCSV(items);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "transactions_backup.csv");
      await uploadCSVToS3(csvData);
    }

    // Delete all transactions
    await axios.delete(
      `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction/deleteAll?userId=${userId}`
    );

    setShowResetModal(false);
    setResetConfirmText("");
    navigate("/customer/financial-report");
    window.location.reload();
  } catch (err) {
    console.error("Reset failed:", err);
    alert("Reset failed. Please try again.");
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