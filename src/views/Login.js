import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Login.css";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { Helmet } from "react-helmet";
import { Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { signIn, getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import getUserInfo from "utils/Getuser";

const logo = "/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const notificationAlertRef = useRef(null);

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = !!localStorage.getItem("authToken"); // Example: Check for token in localStorage

    if (isAuthenticated) {
      const role = localStorage.getItem("role");

      // Navigate to the customer dashboard if authenticated
      navigate(role === "2" ? "/customer/dashboard" : "/admin/dashboard");

    }
  }, [navigate]);

  useEffect(() => {
    const listener = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          try {
            const user = await getCurrentUser();
            const role = localStorage.getItem("role");
            navigate(role === "2" ? "/customer/dashboard" : "/admin/dashboard");
          } catch (error) {
            console.error("Post-signin error:", error);
          }
          break;
        case "signInWithRedirect_failure":
          showNotification("danger", "Google sign-in failed");
          break;
      }
    });

    return () => listener();
  }, [navigate]);

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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      showNotification("danger", "Google sign-in failed.");
    }
  };
  const handleAppleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: "SignInWithApple" });
    } catch (error) {
      console.error("Error during Apple sign-in:", error);
      showNotification("danger", "Apple sign-in failed.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim()) {
      showNotification("danger", "Error: Email is empty!");
      setLoading(false);
      return;
    }

    try {
      let res = await signIn({ username: email, password });
      if (res.isSignedIn) {
        let user = await getUserInfo();
        const response = await fetch(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${user?.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        localStorage.clear();
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("user_email", result.user?.email || "");
        localStorage.setItem("user_name", result.user?.name || "");
        localStorage.setItem("role", result.user?.role?.toString());
        localStorage.setItem(
          "outstandingDebt",
          result.user?.outstandingDebt || "0"
        );
        localStorage.setItem(
          "valueableItems",
          result.user?.valueableItems || "0"
        );
        localStorage.setItem("cashBalance", result.user?.cashBalance || "0");

        showNotification("success", "Login successful!");
        const path =
          result.user?.role === 2 ? "/customer/dashboard" : "/admin/dashboard";

        setTimeout(() => navigate(path, { replace: true }), 2000);
      } else {
        showNotification(
          "danger",
          "Sign-in failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Error signing in:", error);
      showNotification("danger", "An error occurred. Please try again later.", error);
    } finally {
      setLoading(false);
    }
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
          <p>Welcome! Login to access the Mesob Store</p>
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="true"
              />
            </div>
            <div className="login-input-group">
              <label>Password</label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            <div className="forgot-password-link">
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
          <div className="separator">
            <span>OR</span>
          </div>
          <button onClick={handleGoogleSignIn} className="google-login-btn">
            Sign in with Google
          </button>
          <button onClick={handleAppleSignIn} className="apple-login-btn">
            Sign in with Apple
          </button>
          <p>
            Don't have an account yet? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
