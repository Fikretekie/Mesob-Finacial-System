import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useActionData } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { signUp } from "aws-amplify/auth";
import axios from "axios";
import { businessTypes } from "./BusinessTypes";
import TermsOfUse from "./Terms";
const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [otherBusinessType, setOtherBusinessType] = useState(""); // new state
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
  const [incomePurposes, setIncomePurposes] = useState([]);
  const [expensePurposes, setExpensePurposes] = useState([]);
  const [payablePurposes, setPayablePurposes] = useState([]);
  const [manualIncomePurposes, setManualIncomePurposes] = useState([]);
  const [manualExpensePurposes, setManualExpensePurposes] = useState([]);
  const [manualPayablePurposes, setManualPayablePurposes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");

  const getBusinessPurposes = (businessType) => {
    // If the business type is "Other", return empty arrays for manual entry
    if (businessType === "Other") {
      return {
        income: [],
        expenses: [],
        payables: [],
      };
    }

    // Otherwise, return the predefined purposes for the business type
    return (
      businessTypes[businessType] || {
        income: [],
        expenses: [],
        payables: [],
      }
    );
  };
  useEffect(() => {
    if (selectedBusinessType) {
      if (selectedBusinessType === "Other") {
        // For manual entry, do not call getBusinessPurposes
        setIncomePurposes(manualIncomePurposes);
        setExpensePurposes(manualExpensePurposes);
        setPayablePurposes(manualPayablePurposes);
      } else {
        const purposes = getBusinessPurposes(selectedBusinessType);
        setIncomePurposes(purposes.income || []);
        setExpensePurposes(purposes.expenses || []);
        setPayablePurposes(purposes.payables || []);
      }
    }
  }, [
    selectedBusinessType,
    manualIncomePurposes,
    manualExpensePurposes,
    manualPayablePurposes,
  ]);

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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Define special characters

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    return ""; // No error
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
    else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!selectedBusinessType) {
      newErrors.businessType = "Business type is required.";
    }
    if (selectedBusinessType === "Other" && !otherBusinessType.trim()) {
      newErrors.otherBusinessType = "Please specify your business type.";
    }

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
  const createSchedule = async () => {
    try {
      let user_id = localStorage.getItem("userId");
      if (!user_id) {
        console.error("User ID not found in localStorage.");
        return;
      }
      // Retrieve the last schedule count from localStorage (or default to 1)
      let lastScheduleCount =
        parseInt(localStorage.getItem("schedule_count")) || 1;
      let newScheduleCount = lastScheduleCount + 1;
      const params = {
        email: email,
        subject: "test",
        message: "testing email for schedule ",
        user_id: user_id,
        schedule_type: 1, // Default type
        schedule_count: newScheduleCount,
      };
      const response = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/schedule",
        params
      );
      console.log("Response Data:", response.data);
      // Update schedule count in localStorage
      localStorage.setItem("schedule_count", newScheduleCount);
    } catch (error) {
      console.error(
        "Error fetching schedule:",
        error.response?.data || error.message
      );
    }
  };
  // const handleSignup = async (e) => {
  //   if (!validateStep3()) return;
  //   e.preventDefault();
  //   try {
  //     let res = await signUp({
  //       username: email,
  //       password: password,
  //       options: {
  //         userAttributes: {
  //           email: email,
  //           phone_number: phone,
  //         },
  //       },
  //     });
  //     console.log("Sign-up successful", res);
  //     // Redirect to confirmation page
  //     navigate("/confirm", { state: { email: email, phone_number: phone } });
  //     const data = {
  //       username: email,
  //       name,
  //       id: res.userId,
  //       companyName,
  //       email,
  //       phone_number: phone,
  //       businessType:
  //         businessType === "Other_manuel_entry"
  //           ? otherBusinessType
  //           : businessType, // Use otherBusinessType if "Other" is selected
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

  //     // Handle successful sign-up
  //   } catch (error) {
  //     console.error("Error signing up:", error);
  //     return;
  //   }
  // };

  const handleSignup = async (e) => {
    if (!validateStep3()) return;
    e.preventDefault();
    try {
      let res = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            phone_number: phone,
          },
        },
      });
      console.log("Sign-up successful", res);

      const creationDate = new Date().toISOString();
      const trialEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(); // 30 days from now
      const businessTypeValue =
        selectedBusinessType === "Other"
          ? otherBusinessType
          : selectedBusinessType;

      const data = {
        username: email,
        name,
        companyName,
        email,
        phone_number: phone,
        businessType:
          businessType === "Other" ? otherBusinessType : businessType,
        cashBalance,
        outstandingDebt,
        valueableItems,
        role: 2, // Set default role as customer
        startFromZero: false,
        businessType: businessTypeValue,
        creationDate,
        trialEndDate,
        isPaid: false,
        subscription: false,
        scheduleCount: 1,
        createdAt: creationDate,
      };

      try {
        const response = await axios.put(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${res.userId}`,
          data
        );

        if (response.status === 200) {
          localStorage.setItem("userId", res.userId || "");
          localStorage.setItem("user_email", email || "");
          localStorage.setItem("user_name", name || "");
          localStorage.setItem("role", "2"); // Set customer role
          localStorage.setItem("businessType", businessTypeValue);

          let emailddata = {
            email: email,
            subject: "Welcome to Mesob Financial – You're All Set!",
            message: `<p>🎉 <strong>Thank you for subscribing to Mesob Financial!</strong> We're thrilled to have you on board.</p>

                  <p>With your subscription, you can now easily record and track your income and expenses. Our intuitive charts will help you analyze your financial data at a glance, giving you a clearer view of your financial health.</p>

                  <p>Your free trial period of 30 days is coming to an end! To continue accessing Mesob Financial's powerful tools for tracking and managing your finances, please subscribe before your access expires.</p>

                  <h3>🔍 What You Can Expect:</h3>
                  <ul>
                    <li>✅ Effortless tracking of your income and expenses</li>
                    <li>✅ Detailed financial analysis displayed in easy-to-read charts</li>
                    <li>✅ A user-friendly experience to help you stay on top of your finances</li>
                  </ul>

                  <p>If you have any questions or need assistance, don't hesitate to contact us at <a href="mailto:mesob@mesobstore.com">mesob@mesobstore.com</a>. We're here to help!</p>

                  <p>Welcome aboard, and we look forward to helping you manage your finances more effectively.</p>

                  <p>Best regards,</p>
                  <p><strong>The Mesob Financial Team</strong></p>
                  `,
          };

          const response = await axios.post(
            `https://q0v1vrhy5g.execute-api.us-east-1.amazonaws.com/staging`,
            emailddata
          );
          console.log("Email sent successfully:", response.data);

          await createSchedule();
          showNotification("success", "Signup successful!");
          setTimeout(() => {
            navigate("/confirm", {
              state: { email: email, phone_number: phone },
            });
          }, 100);
        } else {
          showNotification("danger", "Failed to update user profile");
        }
      } catch (error) {
        console.error("Error updating user profile:", error);
        showNotification(
          "danger",
          "An unexpected error occurred while updating profile. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showNotification("danger", "Error signing up. Please try again." + error);

    }
  };

  const checkEmailExists = async (email) => {
    try {
      // Replace with your actual endpoint
      const response = await fetch(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/existingusercheck?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log('respoms ss', response);
      // Assume API returns { exists: true/false }
      return response.exists;
    } catch (error) {
      // Handle API/network errors
      console.log('errors is ', error);
      return false; // Fail-safe: treat as not existing
    }
  };

  // const handleNextStep = async () => {


  //   let exist = await checkEmailExists(email);
  //   if (exist === true) {

  //   } else {
  //     if (step === 1 && validateStep1()) setStep(2);
  //     else if (step === 2 && validateStep2()) setStep(3);
  //   }

  // };


  const handleNextStep = async () => {
    if (step === 1) {
      // Validate fields first
      if (!validateStep1()) return;

      // Check if email exists
      let exist = await checkEmailExists(email);
      if (exist === true) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered. Please use another.",
        }));
        showNotification("warning", "This email is already registered. Please use another.");
        return; // Do not proceed to next step
      } else {
        setStep(2);
      }
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
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

  const handlePhoneChange = (value) => {
    const formattedPhone = "+" + value.replace(/[^\d]/g, "");
    setPhone(formattedPhone);
  };

  const handleBusinessTypeChange = (type) => {
    setSelectedBusinessType(type);
    localStorage.setItem("businessType", type);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Create Your Account</h2>
            <p style={styles.subtext}>
              Already have an account?
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

            <PhoneInput
              country={"us"}
              value={phone}
              onChange={handlePhoneChange}
              inputStyle={{
                ...styles.input,
                width: "100%",
                height: "40px",
                fontSize: "16px",
                paddingLeft: "48px",
                borderColor: errors.phone ? "red" : "#000",
              }}
              containerStyle={{
                width: "100%",
                marginBottom: "10px",
              }}
              buttonStyle={{
                backgroundColor: "transparent",
                border: "none",
                padding: "0 5px",
              }}
            />

            {errors.phone && <p style={styles.error}>{errors.phone}</p>}

            <div style={styles.inputContainer}>
              <input
                type={showPassword ? "text" : "password"}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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
              value={selectedBusinessType}
              onChange={(e) => {
                handleBusinessTypeChange(e.target.value);
                setErrors((prev) => ({ ...prev, businessType: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.businessType ? "red" : "#000",
              }}
            >
              <option value="">Select Business Type</option>
              <option value="Trucking">Trucking</option>
              <option value="RIDESHARE DRIVERS/PARTNERS">
                RIDESHARE DRIVERS/PARTNERS
              </option>
              <option value="Groceries">Groceries</option>
              <option value="Individual/Households">
                Individual/Households
              </option>
              <option value="Cafe">Cafe</option>
              <option value="Other">Other manuel entry</option>
            </select>
            {errors.businessType && (
              <p style={styles.error}>{errors.businessType}</p>
            )}
            {selectedBusinessType === "Other" && (
              <>
                <input
                  type="text"
                  placeholder="Specify your business type"
                  value={otherBusinessType}
                  onChange={(e) => {
                    setOtherBusinessType(e.target.value);
                    setErrors((prev) => ({ ...prev, otherBusinessType: "" }));
                  }}
                  style={{
                    ...styles.input,
                    borderColor: errors.otherBusinessType ? "red" : "#000",
                  }}
                />
                {errors.otherBusinessType && (
                  <p style={styles.error}>{errors.otherBusinessType}</p>
                )}
              </>
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
              If you want to start from zero,
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
              I agree to the
              <Link
                to="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.termsLink}
              >
                Terms of Use
              </Link>
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
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    top: "40%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};

export default SignupPage;
