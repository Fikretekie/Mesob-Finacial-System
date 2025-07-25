import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { Spinner } from "reactstrap";
import { Helmet } from "react-helmet";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const logo = "/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();
  const notificationAlertRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

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

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword({ username: email });
      setCodeSent(true);
      showNotification("success", "Verification code sent to your email!");
    } catch (error) {
      console.error("Error sending verification code:", error);

      // Check if the error means the email is not found or not verified
      if (error.name === "InvalidParameterException") {
        showNotification(
          "danger",
          "No account found with this email or the email is not verified."
        );
      } else if (error.name === "UserNotFoundException") {
        showNotification("danger", "No user is registered with this email.");
      } else {
        showNotification(
          "danger",
          "Failed to send verification code. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });
      showNotification("success", "Password has been reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error during password reset:", error);
      showNotification("danger", "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - Mesob Finance</title>
      </Helmet>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <NotificationAlert ref={notificationAlertRef} />
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              display: "block",
              margin: "0 auto 1rem",
              maxWidth: "150px",
            }}
          />
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Reset Password
          </h2>
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {codeSent
              ? "Enter the verification code and new password"
              : "Enter your email to receive a verification code"}
          </p>
          <form onSubmit={codeSent ? handleResetPassword : handleSendCode}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#555555",
                  fontWeight: "bold",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={codeSent}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            {codeSent && (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#555555",
                      fontWeight: "bold",
                    }}
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#555555",
                      fontWeight: "bold",
                    }}
                  >
                    New Password
                  </label>
                  {/* <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  /> */}
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        paddingRight: "2.5rem", // Make space for the eye icon
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      style={{
                        position: "absolute",
                        right: "0.5rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {loading ? (
                <>
                  <Spinner color="light" size="sm" />{" "}
                  {codeSent ? "Resetting..." : "Sending..."}
                </>
              ) : codeSent ? (
                "Reset Password"
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Remember your password?{" "}
            <Link
              to="/login"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
