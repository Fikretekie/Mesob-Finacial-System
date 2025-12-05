import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/css/Login.css";
import { Helmet } from "react-helmet";
import { Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { signIn, signInWithRedirect, signOut } from "aws-amplify/auth";
import getUserInfo from "utils/Getuser";
import NotificationAlert from "react-notification-alert";
const logo = "/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialAuth, setSocialAuth] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const notificationAlertRef = useRef(null);

  // Check for error from redirect - now just console.log if any
  const { state } = location;
  const error =
    state?.error || new URLSearchParams(location.search).get("error");
  const errorMessage =
    state?.message || new URLSearchParams(location.search).get("message");

  useEffect(() => {
    if (error) {
      console.error("Login error:", errorMessage || "Login failed.");
    }
  }, [error, errorMessage]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setSocialAuth("google");
      console.log("🔵 Initiating Google sign-in with redirect...");
      await signOut();
      await signInWithRedirect({
        provider: "Google",
        customState: "google_login",
      });
      localStorage.setItem("provider", "Google");
    } catch (error) {
      console.error("🔴 Google sign-in error:", error);
      setLoading(false);
      setSocialAuth("");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setSocialAuth("apple");
      await signOut();

      console.log("🔵 Initiating Apple sign-in with redirect...");
      await signInWithRedirect({ provider: "SignInWithApple" });
      localStorage.setItem("provider", "Apple");
    } catch (error) {
      console.error("🔴 Apple sign-in error:", error);
      setLoading(false);
      setSocialAuth("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim()) {
      console.error("Email is required");
      setLoading(false);
      return;
    }

    try {
      console.log("🔵 Signing in with email:", email);
      await signOut();

      const res = await signIn({ username: email, password });
      if (res.isSignedIn) {
        console.log("✅ Email sign-in successful");
        const user = await getUserInfo();
        const response = await fetch(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${user?.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        console.log("🔍 User data:", result);

        localStorage.clear();
        localStorage.setItem("provider", "Email");
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("user_email", result.user?.email || "");
        localStorage.setItem("user_name", result.user?.name || "");
        localStorage.setItem("role", result.user?.role?.toString() || "2");
        localStorage.setItem(
          "outstandingDebt",
          result.user?.outstandingDebt || "0"
        );
        localStorage.setItem(
          "valueableItems",
          result.user?.valueableItems || "0"
        );
        localStorage.setItem("cashBalance", result.user?.cashBalance || "0");
        localStorage.setItem("authToken", "authenticated");

        const path =
          result.user?.role === 2
            ? "/customer/dashboard"
            : result.user?.role === 0
            ? "/admin/dashboard"
            : "/customer/dashboard";
        navigate(path, { replace: true });
      } else {
        console.error("Invalid credentials");
      }
    } catch (error) {
      console.error("🔴 Email sign-in error:", error);
      notify("danger", error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const notify = (type, message) => {
    notificationAlertRef.current?.notificationAlert({
      place: "tr",
      message: <div>{message}</div>,
      type, // "danger", "success", "warning", "info"
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 5,
    });
  };
  return (
    <>
      <Helmet>
        <title>Login - Mesob Finance</title>
      </Helmet>
      <div className="login-container">
        <NotificationAlert ref={notificationAlertRef} />
        <div className="login-box">
          <img src={logo} alt="Logo" className="logo_img" />
          <h2>Login</h2>
          <p style={{color: "#9ca5b0"}}>Welcome! Login to access the <span style={{color: "#3b83f6"}}>Mesob Store</span> </p> 
          {loading && (
            <div
              className="loading-message"
              style={{ color: "#666", marginBottom: "1rem" }}
            >
              {socialAuth === "google" && (
                <>
                  Processing Google sign-in...{" "}
                  <Spinner color="secondary" size="sm" />
                </>
              )}
              {socialAuth === "apple" && (
                <>
                  Processing Apple sign-in...{" "}
                  <Spinner color="secondary" size="sm" />
                </>
              )}
              {!socialAuth && (
                <>
                  Processing... <Spinner color="secondary" size="sm" />
                </>
              )}
            </div>
          )}
          {!loading && (
            <>
              <form onSubmit={handleSubmit}>
                <div className="login-input-group">
                  <label style={{color:"#ffffff"}}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="login-input-group">
                  <label style={{color:"#ffffff"}}>Password</label>
                  <div className="password-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        size="lg"
                      />
                    </button>
                  </div>
                </div>
                <div className="forgot-password-link" style={{ marginTop: 10 }}>
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner color="secondary" size="sm" /> Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
              <div className="separator" style={{ marginTop: 10 }}>
                <span style={{color:"#9ca5b0"}}>OR</span>
              </div>
              <button
                onClick={handleGoogleSignIn}
                className="social-login-btn google"
                disabled={loading}
              >
                {socialAuth === "google" && loading ? (
                  <>
                    <Spinner color="light" size="sm" /> Processing...
                  </>
                ) : (
                  <>
                    <img
                      src="/googlelogo.png"
                      alt="Google"
                      className="social-icon"
                    />
                    Continue with Google
                  </>
                )}
              </button>

              <button
                onClick={handleAppleSignIn}
                className="social-login-btn apple"
                disabled={loading}
              >
                {socialAuth === "apple" && loading ? (
                  <>
                    <Spinner color="light" size="sm" /> Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faApple}
                      className="social-icon"
                      style={{ color: "#ffffff" }}
                    />
                    Continue with Apple
                  </>
                )}
              </button>
              <p style={{ marginTop: 10, color:"#9ca5b0" }}>
                Don't have an account yet? <Link to="/signup">Sign up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
