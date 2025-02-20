// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, Link, useActionData } from "react-router-dom";
// import NotificationAlert from "react-notification-alert";
// import "react-notification-alert/dist/animate.css";

// const SignupPage = () => {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [businessType, setBusinessType] = useState("");
//   const [cashBalance, setCashBalance] = useState("");
//   const [outstandingDebt, setOutstandingDebt] = useState("");
//   const [valueableItems, setValueableItems] = useState("");
//   // const [beginningCash, setBeginningCash] = useState("");
//   const [isHovered, setIsHovered] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isSignupSuccessful, setIsSignupSuccessful] = useState(false);
//   const notificationAlertRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (isSignupSuccessful) {
//       navigate("/admin/dashboard");
//     }
//   }, [isSignupSuccessful, navigate]);

//   const showNotification = (type, message) => {
//     const options = {
//       place: "tr",
//       message: <div>{message}</div>,
//       type: type,
//       icon: "now-ui-icons ui-1_bell-53",
//       autoDismiss: 5,
//     };
//     notificationAlertRef.current.notificationAlert(options);
//   };

//   const validateStep1 = () => {
//     const newErrors = {};
//     if (!name) newErrors.name = "Name is required.";
//     if (!companyName) newErrors.companyName = "Company name is required.";
//     if (!email) newErrors.email = "Email is required.";
//     else if (!/\S+@\S+\.\S+/.test(email))
//       newErrors.email = "Please enter a valid email address.";
//     if (!phone) newErrors.phone = "Phone number is required.";
//     if (!password) newErrors.password = "Password is required.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = () => {
//     const newErrors = {};
//     if (!businessType) newErrors.businessType = "Business type is required.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep3 = () => {
//     const newErrors = {};
//     if (!cashBalance) newErrors.cashBalance = "Cash balance is required.";
//     if (!outstandingDebt)
//       newErrors.outstandingDebt = "Outstanding debt is required.";
//     if (!valueableItems)
//       newErrors.valueableItems = "Valuable items are required.";
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSignup = async () => {
//     if (!validateStep3()) return;

//     const data = {
//       name,
//       companyName,
//       email,
//       phone,
//       password,
//       businessType,
//       cashBalance,
//       outstandingDebt,
//       valueableItems,
//       role: 2, // Set default role as customer
//       startFromZero: false,
//     };

//     try {
//       const response = await fetch(
//         "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Signup",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(data),
//         }
//       );

//       const result = await response.json();

//       if (response.status === 409) {
//         showNotification("warning", result.message);
//       } else if (response.ok) {
//         localStorage.setItem("userId", result.user?.id || "");
//         localStorage.setItem("user_email", result.user?.email || "");
//         localStorage.setItem("user_name", result.user?.name || "");
//         localStorage.setItem("role", "2"); // Set customer role

//         showNotification("success", "Signup successful!");
//         setTimeout(() => {
//           navigate("/customer/dashboard");
//         }, 100);
//       } else {
//         showNotification("danger", result.message || "Signup failed");
//       }
//     } catch (error) {
//       console.error("Error details:", error);
//       showNotification(
//         "danger",
//         "An unexpected error occurred. Please try again later."
//       );
//     }
//   };

//   const handleNextStep = () => {
//     if (step === 1 && validateStep1()) setStep(2);
//     else if (step === 2 && validateStep2()) setStep(3);
//   };

//   const handleStartFromZero = async () => {
//     if (!name || !companyName || !email || !phone) {
//       showNotification("warning", "Please fill in all required fields first");
//       return;
//     }

//     const data = {
//       name,
//       companyName,
//       email,
//       phone,
//       password: "PCmalik99",
//       businessType: "Trucking",
//       cashBalance: "0",
//       outstandingDebt: "0",
//       valueableItems: "0",
//       role: 2,
//       startFromZero: true,
//     };

//     try {
//       // Clear any existing data first
//       localStorage.clear();

//       const response = await fetch(
//         "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Signup",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(data),
//         }
//       );

//       const result = await response.json();
//       if (response.ok) {
//         localStorage.setItem("userId", result.user?.id || "");
//         localStorage.setItem("user_email", result.user?.email || "");
//         localStorage.setItem("user_name", result.user?.name || "");
//         localStorage.setItem("role", "2");
//         localStorage.setItem("outstandingDebt", "0");
//         localStorage.setItem("valueableItems", "0");
//         localStorage.setItem("cashBalance", "0");

//         showNotification(
//           "success",
//           "Account created successfully. Starting from zero!"
//         );

//         // Use window.location for full page refresh
//         window.location.href = "/customer/dashboard";
//       } else {
//         showNotification(
//           "danger",
//           result.message || "Failed to create account"
//         );
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       showNotification("danger", "An unexpected error occurred");
//     }
//   };

//   const renderStepContent = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div>
//             <h2>Create Your Account</h2>
//             <p style={styles.subtext}>
//               Already have an account?{" "}
//               <Link to="/login" style={styles.link}>
//                 Login
//               </Link>
//             </p>
//             <input
//               type="text"
//               placeholder="Enter Your Name"
//               value={name}
//               onChange={(e) => {
//                 setName(e.target.value);
//                 setErrors((prev) => ({ ...prev, name: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.name ? "red" : "#000",
//               }}
//             />
//             {errors.name && <p style={styles.error}>{errors.name}</p>}
//             <input
//               type="text"
//               placeholder="Enter Your Company Name"
//               value={companyName}
//               onChange={(e) => {
//                 setCompanyName(e.target.value);
//                 setErrors((prev) => ({ ...prev, companyName: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.companyName ? "red" : "#000",
//               }}
//             />
//             {errors.companyName && (
//               <p style={styles.error}>{errors.companyName}</p>
//             )}
//             <input
//               type="email"
//               placeholder="Enter Your Email"
//               value={email}
//               onChange={(e) => {
//                 setEmail(e.target.value);
//                 setErrors((prev) => ({ ...prev, email: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.email ? "red" : "#000",
//               }}
//             />
//             {errors.email && <p style={styles.error}>{errors.email}</p>}

//             <input
//               type="tel"
//               placeholder="Enter Your Phone Number"
//               value={phone}
//               onChange={(e) => {
//                 setPhone(e.target.value);
//                 setErrors((prev) => ({ ...prev, phone: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.phone ? "red" : "#000",
//               }}
//             />
//             {errors.phone && <p style={styles.error}>{errors.phone}</p>}

//             <input
//               type="password"
//               placeholder="Enter Your Password"
//               value={password}
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 setErrors((prev) => ({ ...prev, password: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.password ? "red" : "#000",
//               }}
//             />
//             {errors.password && <p style={styles.error}>{errors.password}</p>}

//             <button
//               onClick={handleNextStep}
//               style={{
//                 ...styles.button,
//                 backgroundColor: isHovered ? "blue" : "#3b82f6",
//               }}
//               onMouseOver={() => setIsHovered(true)}
//               onMouseLeave={() => setIsHovered(false)}
//             >
//               Next
//             </button>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <h2>Select Business Type</h2>
//             <select
//               value={businessType}
//               onChange={(e) => {
//                 setBusinessType(e.target.value);
//                 setErrors((prev) => ({ ...prev, businessType: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.businessType ? "red" : "#000",
//               }}
//             >
//               <option value="">Select Business Type</option>
//               <option value="Trucking">Trucking</option>
//               <option value="Groceries">Groceries</option>
//               <option value="Service">Service</option>
//             </select>
//             {errors.businessType && (
//               <p style={styles.error}>{errors.businessType}</p>
//             )}
//             <button
//               onClick={handleNextStep}
//               style={{
//                 ...styles.button,
//                 backgroundColor: isHovered ? "blue" : "#3b82f6",
//               }}
//               onMouseOver={() => setIsHovered(true)}
//               onMouseLeave={() => setIsHovered(false)}
//             >
//               Next
//             </button>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <h2>Financial Information</h2>
//             <p style={styles.infoText}>
//               To get started, we need to know where your business stands
//               financially today. This includes how much cash you have, any money
//               owed to you, any debt you owe, and any valuable items (like
//               inventory) you own. This helps us build an accurate financial
//               picture of your business (recommended). <br></br>
//               If you want to start from zero,{" "}
//               <a
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleStartFromZero();
//                 }}
//                 href="#"
//               >
//                 Click Here
//               </a>
//               :
//             </p>
//             {/* <button
//               onClick={handleStartFromZero}
//               style={{ ...styles.button, backgroundColor: "#3b82f6" }}
//             >
//               Click Here
//             </button> */}
//             <input
//               type="text"
//               placeholder="Cash Balance (e.g., $10,000)"
//               value={cashBalance}
//               onChange={(e) => {
//                 setCashBalance(e.target.value);
//                 setErrors((prev) => ({ ...prev, cashBalance: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.cashBalance ? "red" : "#000",
//               }}
//             />
//             {errors.cashBalance && (
//               <p style={styles.error}>{errors.cashBalance}</p>
//             )}
//             <input
//               type="text"
//               placeholder="Outstanding Debt (e.g., $5,000)"
//               value={outstandingDebt}
//               onChange={(e) => {
//                 setOutstandingDebt(e.target.value);
//                 setErrors((prev) => ({ ...prev, outstandingDebt: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.outstandingDebt ? "red" : "#000",
//               }}
//             />
//             {errors.outstandingDebt && (
//               <p style={styles.error}>{errors.outstandingDebt}</p>
//             )}
//             <input
//               type="text"
//               placeholder="Valuable Items (e.g., Truck worth $50,000)"
//               value={valueableItems}
//               onChange={(e) => {
//                 setValueableItems(e.target.value);
//                 setErrors((prev) => ({ ...prev, valueableItems: "" }));
//               }}
//               style={{
//                 ...styles.input,
//                 borderColor: errors.valueableItems ? "red" : "#000",
//               }}
//             />
//             {errors.valueableItems && (
//               <p style={styles.error}>{errors.valueableItems}</p>
//             )}
//             <button
//               onClick={handleSignup}
//               style={{
//                 ...styles.button,
//                 backgroundColor: isHovered ? "blue" : "#3b82f6",
//               }}
//               onMouseOver={() => setIsHovered(true)}
//               onMouseLeave={() => setIsHovered(false)}
//             >
//               Save and Finish
//             </button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <NotificationAlert ref={notificationAlertRef} />
//       <div style={styles.card}>{renderStepContent()}</div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100vh",
//     backgroundColor: "#fff",
//     color: "#000",
//   },
//   card: {
//     padding: "20px",
//     borderRadius: "10px",
//     backgroundColor: "#fff",
//     boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
//     width: "400px",
//   },
//   input: {
//     width: "100%",
//     padding: "10px",
//     marginBottom: "10px",
//     borderRadius: "5px",
//     border: "1px solid #000",
//     backgroundColor: "#fff",
//     color: "#000",
//   },
//   button: {
//     width: "100%",
//     padding: "10px",
//     borderRadius: "5px",
//     border: "none",
//     cursor: "pointer",
//     color: "#fff",
//     marginBottom: "10px",
//   },
//   subtext: {
//     marginBottom: "20px",
//   },
//   link: {
//     color: "#3b82f6",
//     textDecoration: "none",
//   },
//   error: {
//     color: "red",
//     fontSize: "12px",
//     marginTop: "-10px",
//     marginBottom: "10px",
//   },
//   infoText: {
//     backgroundColor: "#fff",
//     color: "#000",
//     padding: "10px",
//     marginBottom: "5px",
//   },
// };

// export default SignupPage;




import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useActionData } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [outstandingDebt, setOutstandingDebt] = useState("");
  const [valueableItems, setValueableItems] = useState("");
  // const [beginningCash, setBeginningCash] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSignupSuccessful, setIsSignupSuccessful] = useState(false);
  const notificationAlertRef = useRef(null);
  const navigate = useNavigate();
  const [termsChecked, setTermsChecked] = useState(false); // New state for terms checkbox

  useEffect(() => {
    if (isSignupSuccessful) {
      navigate("/admin/dashboard");
    }
  }, [isSignupSuccessful, navigate]);

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

  const validateStep1 = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required.";
    if (!companyName) newErrors.companyName = "Company name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Please enter a valid email address.";
    if (!phone) newErrors.phone = "Phone number is required.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!businessType) newErrors.businessType = "Business type is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!cashBalance) newErrors.cashBalance = "Cash balance is required.";
    if (!outstandingDebt)
      newErrors.outstandingDebt = "Outstanding debt is required.";
    if (!valueableItems)
      newErrors.valueableItems = "Valuable items are required.";
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateStep3()) return;

    const data = {
      name,
      companyName,
      email,
      phone,
      password,
      businessType,
      cashBalance,
      outstandingDebt,
      valueableItems,
      role: 2, // Set default role as customer
      startFromZero: false,
    };

    try {
      const response = await fetch(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.status === 409) {
        showNotification("warning", result.message);
      } else if (response.ok) {
        localStorage.setItem("userId", result.user?.id || "");
        localStorage.setItem("user_email", result.user?.email || "");
        localStorage.setItem("user_name", result.user?.name || "");
        localStorage.setItem("role", "2"); // Set customer role

        showNotification("success", "Signup successful!");
        setTimeout(() => {
          navigate("/customer/dashboard");
        }, 100);
      } else {
        showNotification("danger", result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Error details:", error);
      showNotification(
        "danger",
        "An unexpected error occurred. Please try again later."
      );
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleStartFromZero = async () => {
    if (!name || !companyName || !email || !phone) {
      showNotification("warning", "Please fill in all required fields first");
      return;
    }

    const data = {
      name,
      companyName,
      email,
      phone,
      password: "PCmalik99",
      businessType: "Trucking",
      cashBalance: "0",
      outstandingDebt: "0",
      valueableItems: "0",
      role: 2,
      startFromZero: true,
    };

    try {
      // Clear any existing data first
      localStorage.clear();

      const response = await fetch(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("userId", result.user?.id || "");
        localStorage.setItem("user_email", result.user?.email || "");
        localStorage.setItem("user_name", result.user?.name || "");
        localStorage.setItem("role", "2");
        localStorage.setItem("outstandingDebt", "0");
        localStorage.setItem("valueableItems", "0");
        localStorage.setItem("cashBalance", "0");

        showNotification(
          "success",
          "Account created successfully. Starting from zero!"
        );

        // Use window.location for full page refresh
        window.location.href = "/customer/dashboard";
      } else {
        showNotification(
          "danger",
          result.message || "Failed to create account"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("danger", "An unexpected error occurred");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Create Your Account</h2>
            <p style={styles.subtext}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>
                Login
              </Link>
            </p>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.name ? "red" : "#000",
              }}
            />
            {errors.name && <p style={styles.error}>{errors.name}</p>}
            <input
              type="text"
              placeholder="Enter Your Company Name"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setErrors((prev) => ({ ...prev, companyName: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.companyName ? "red" : "#000",
              }}
            />
            {errors.companyName && (
              <p style={styles.error}>{errors.companyName}</p>
            )}
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.email ? "red" : "#000",
              }}
            />
            {errors.email && <p style={styles.error}>{errors.email}</p>}

            <input
              type="tel"
              placeholder="Enter Your Phone Number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.phone ? "red" : "#000",
              }}
            />
            {errors.phone && <p style={styles.error}>{errors.phone}</p>}

            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.password ? "red" : "#000",
              }}
            />
            {errors.password && <p style={styles.error}>{errors.password}</p>}

            <button
              onClick={handleNextStep}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? "blue" : "#3b82f6",
              }}
              onMouseOver={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Select Business Type</h2>
            <select
              value={businessType}
              onChange={(e) => {
                setBusinessType(e.target.value);
                setErrors((prev) => ({ ...prev, businessType: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.businessType ? "red" : "#000",
              }}
            >
              <option value="">Select Business Type</option>
              <option value="Trucking">Trucking</option>
              <option value="Groceries">Groceries</option>
              <option value="Service">Service</option>
            </select>
            {errors.businessType && (
              <p style={styles.error}>{errors.businessType}</p>
            )}
            <button
              onClick={handleNextStep}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? "blue" : "#3b82f6",
              }}
              onMouseOver={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Next
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Financial Information</h2>
            <p style={styles.infoText}>
              To get started, we need to know where your business stands
              financially today. This includes how much cash you have, any money
              owed to you, any debt you owe, and any valuable items (like
              inventory) you own. This helps us build an accurate financial
              picture of your business (recommended). <br></br>
              If you want to start from zero,{" "}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleStartFromZero();
                }}
                href="#"
              >
                Click Here
              </a>
              :
            </p>
            {/* <button
              onClick={handleStartFromZero}
              style={{ ...styles.button, backgroundColor: "#3b82f6" }}
            >
              Click Here
            </button> */}
            <input
              type="text"
              placeholder="Cash Balance (e.g., $10,000)"
              value={cashBalance}
              onChange={(e) => {
                setCashBalance(e.target.value);
                setErrors((prev) => ({ ...prev, cashBalance: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.cashBalance ? "red" : "#000",
              }}
            />
            {errors.cashBalance && (
              <p style={styles.error}>{errors.cashBalance}</p>
            )}
            <input
              type="text"
              placeholder="Outstanding Debt (e.g., $5,000)"
              value={outstandingDebt}
              onChange={(e) => {
                setOutstandingDebt(e.target.value);
                setErrors((prev) => ({ ...prev, outstandingDebt: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.outstandingDebt ? "red" : "#000",
              }}
            />
            {errors.outstandingDebt && (
              <p style={styles.error}>{errors.outstandingDebt}</p>
            )}
            <input
              type="text"
              placeholder="Valuable Items (e.g., Truck worth $50,000)"
              value={valueableItems}
              onChange={(e) => {
                setValueableItems(e.target.value);
                setErrors((prev) => ({ ...prev, valueableItems: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.valueableItems ? "red" : "#000",
              }}
            />
            {errors.valueableItems && (
              <p style={styles.error}>{errors.valueableItems}</p>
            )}

            {/* Terms and Conditions Checkbox */}
            <label style={styles.termsLabel}>
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                style={{ marginRight: "5px" }}
              />
              I agree to the <a href="https://mesobfinancial.com/terms-of-use" target="_blank" rel="noopener noreferrer" style={styles.termsLink}>Terms of Use</a>
            </label>

            <button
              onClick={handleSignup}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? "blue" : "#3b82f6",
                opacity: termsChecked ? 1 : 0.5,
                cursor: termsChecked ? "pointer" : "not-allowed",
              }}
              onMouseOver={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={!termsChecked}
            >
              Save and Finish
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <NotificationAlert ref={notificationAlertRef} />
      <div style={styles.card}>{renderStepContent()}</div>
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
  subtext: {
    marginBottom: "20px",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "-10px",
    marginBottom: "10px",
  },
  infoText: {
    backgroundColor: "#fff",
    color: "#000",
    padding: "10px",
    marginBottom: "5px",
  },
  /* Style for terms and conditions checkbox and label */
  termsLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  /* Style for the terms and conditions link */
  termsLink: {
    color: "#3b82f6",
    textDecoration: "none",
  },
};

export default SignupPage;
