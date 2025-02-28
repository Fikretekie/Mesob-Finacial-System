import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";

const Confirm = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationAlertRef = useRef(null);

  useEffect(() => {
    // Retrieve email from location state
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const showNotification = (type, message) => {
    const options = {
      place: "tr",
      message: <div>{message}</div>,
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 5,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      console.log(">>>>>>", isSignUpComplete);
      showNotification("success", "Account confirmed successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error confirming sign up", error);
      showNotification("danger", "Error confirming account. Please try again.");
    }
  };

  const handleResendCode = async () => {
    try {
      const { codeDeliveryDetails } = await resendSignUpCode({
        username: email,
      });
      console.log(">>>>>>>", codeDeliveryDetails);
      showNotification("success", "Code resent successfully");
    } catch (error) {
      console.error("Error resending code", error);
      showNotification("danger", "Failed to resend code. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <NotificationAlert ref={notificationAlertRef} />
      <div style={styles.card}>
        <h2>Confirm Your Account</h2>
        <input
          type="text"
          placeholder="Enter confirmation code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleConfirm}
          style={{
            ...styles.button,
            backgroundColor: isHovered ? "blue" : "#3b82f6",
          }}
          onMouseOver={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Confirm
        </button>
        <button onClick={handleResendCode} style={styles.resendButton}>
          Resend Code
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#fff",
    color: "#000",
  },
  card: {
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
    width: "400px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    color: "#000",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    marginBottom: "10px",
  },
  resendButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #3b82f6",
    backgroundColor: "#fff",
    color: "#3b82f6",
    cursor: "pointer",
  },
};

export default Confirm;
