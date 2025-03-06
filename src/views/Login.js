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
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import getUserInfo from "utils/Getuser";

const logo = "/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const notificationAlertRef = useRef(null);

  const handleGoogleSignIn = async () => {
    try {
      let res = await signInWithRedirect({ provider: "Google" });
      console.log("Sign-in with Google successful:", res);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("user_email");
    const role = localStorage.getItem("role");
    if (userEmail) {
      const path = role === "2" ? "/customer/dashboard" : "/admin/dashboard";
      navigate(path);
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   if (!email.trim()) {
  //     console.error("Error: Email is empty!");
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     let res = await signIn({
  //       username: email,
  //       password: password,
  //     });
  //     console.log(">>>>", res);
  //     if (res.isSignedIn === true) {
  //       let user = await getUserInfo();
  //       console.log(".........", user.userId);
  //       const response = await fetch(
  //         `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${user?.userId}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Accept: "application/json",
  //           },
  //         }
  //       );

  //       const result = await response.json();
  //       console.log(">>>>>>>>>>>..", result);
  //       localStorage.clear();
  //       localStorage.setItem("userId", user.userId);
  //       localStorage.setItem("user_email", result.user?.email || "");
  //       localStorage.setItem("user_name", result.user?.name || "");
  //       localStorage.setItem("role", result.user?.role?.toString());
  //       localStorage.setItem(
  //         "outstandingDebt",
  //         result.user?.outstandingDebt || "0"
  //       );
  //       localStorage.setItem(
  //         "valueableItems",
  //         result.user?.valueableItems || "0"
  //       );
  //       localStorage.setItem("cashBalance", result.user?.cashBalance || "0");

  //       showNotification("success", "Login successful!");

  //       const userRole = parseInt(result.user?.role);
  //       const path =
  //         userRole === 2 ? "/customer/dashboard" : "/admin/dashboard";

  //       setTimeout(() => {
  //         navigate(path, { replace: true });
  //       }, 100);
  //     } else {
  //       showNotification("danger", "Sign-in failed");
  //     }
  //   } catch (error) {
  //     console.error("Error signing in:", error);
  //     showNotification("danger", "An error occurred. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim()) {
      showNotification("danger", "Error: Email is empty!");
      setLoading(false);
      return;
    }

    try {
      let res = await signIn({
        username: email,
        password: password,
      });
      console.log(">>>>", res);
      if (res.isSignedIn === true) {
        let user = await getUserInfo();
        console.log(".........", user.userId);
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
        console.log(">>>>>>>>>>>..", result);
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

        const userRole = parseInt(result.user?.role);
        const path =
          userRole === 2 ? "/customer/dashboard" : "/admin/dashboard";

        setTimeout(() => {
          navigate(path, { replace: true });
        }, 2000);
      } else {
        showNotification(
          "danger",
          "Sign-in failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Error signing in:", error);
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

          {/* <button onClick={handleGoogleSignIn} className="google-login-btn">
            Sign in with Google
          </button> */}
          <p>
            Don't have an account yet? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
