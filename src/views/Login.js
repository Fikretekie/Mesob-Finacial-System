import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Login.css";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { Helmet } from "react-helmet";
import logo from "logo.jpeg";
import { Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const notificationAlertRef = useRef(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("user_email");
    if (userEmail) {
      navigate("/admin/dashboard");
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (response.ok && result.message?.toLowerCase().includes("success")) {
        localStorage.setItem("userId", result.user?.id || "");
        localStorage.setItem("user_email", result.user?.email || "");
        localStorage.setItem("user_name", result.user?.name || "");
        localStorage.setItem("role", result.user?.role?.toString());

        showNotification("success", "Login successful!");

        // Navigate based on role
        const userRole = parseInt(result.user?.role);
        const path =
          userRole === 2 ? "/customer/dashboard" : "/admin/dashboard";

        // Use setTimeout to prevent navigation throttling
        setTimeout(() => {
          navigate(path, { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error("Error during login:", error);
      showNotification("danger", "An error occurred. Please try again later.");
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
                  onClick={() => setShowPassword((prevState) => !prevState)}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    size="lg"
                  />
                </button>
              </div>
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
          <p>
            Don't have an account yet? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
