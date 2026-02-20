import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav, Modal, ModalHeader, ModalBody, Button, Input } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";
import { useTranslation } from "react-i18next";

const logo = "/logo2.png";

var ps;

function Sidebar(props) {
  const sidebar = React.useRef();
  const location = useLocation();
  const { t } = useTranslation();

  // Step 1: show the Data Management warning panel
  const [showWarning, setShowWarning] = useState(false);
  // Step 2: show the RESET confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

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

  const handleCloseClick = () => {
    setShowWarning(true);
  };

  const handleOpenResetModal = () => {
    setResetConfirmText("");
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    if (resetConfirmText === "RESET") {
      window.dispatchEvent(new Event("mesob:resetAllTransactions"));
      setShowResetModal(false);
      setShowWarning(false);
      setResetConfirmText("");
    }
  };

  const handleDownloadReport = () => {
    window.dispatchEvent(new Event("mesob:downloadReport"));
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

      {/* STEP 3: Reset All Transactions Modal */}
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
              style={{
                backgroundColor: "#3d83f1",
                borderColor: "#3d83f1",
                color: "#ffffff",
                flex: "1",
              }}
            >
              Download Financial Report
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
              disabled={resetConfirmText !== "RESET"}
              style={{
                backgroundColor:
                  resetConfirmText === "RESET" ? "#e53e3e" : "#666",
                borderColor:
                  resetConfirmText === "RESET" ? "#e53e3e" : "#666",
                color: "#ffffff",
              }}
            >
              Confirm Reset
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}

export default Sidebar;