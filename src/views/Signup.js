import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { deleteUser, signUp } from "aws-amplify/auth";
import axios from "axios";
import { businessTypes } from "./BusinessTypes";
import { currencies } from "utils/currencies";
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
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [loading, setLoading] = useState(true); // loading state

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const provider = searchParams.get("provider");
  const socialEmail = searchParams.get("email");
  const socialUserId = searchParams.get("userId");
  const socialName = searchParams.get("name");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startFromZeroConfirmed, setStartFromZeroConfirmed] = useState(false);

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
      setLoading(false);
      navigate("/admin/dashboard");
    }
  }, [isSignupSuccessful, navigate]);
  useEffect(() => {
    if ((provider === "Google" || provider === "Apple") && socialEmail) {
      setEmail(socialEmail);
      setLoading(false);
      if (socialName) setName(socialName);
    }
  }, [provider, socialEmail, socialName]);
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
    // Only validate password if not Google
    if (provider !== "Google" && provider !== "Apple") {
      if (!password) newErrors.password = "Password is required.";
      else {
        const passwordError = validatePassword(password);
        if (passwordError) {
          newErrors.password = passwordError;
        }
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
    if (!selectedCurrency) {
      newErrors.currency = "Currency is required.";
    }
    {
      errors.currency && <p style={styles.error}>{errors.currency}</p>;
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

  const handleSignup = async (e, type) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (type !== 0 && !validateStep3()) {
      setIsSubmitting(false);
      return;
    }
    e.preventDefault();
    setLoading(true);
    // Prepare user data
    const creationDate = new Date().toISOString();
    const trialEndDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();
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
      businessType: businessTypeValue,
      cashBalance: type === 0 ? "0" : cashBalance,
      outstandingDebt: type === 0 ? "0" : outstandingDebt,
      valueableItems: type === 0 ? "0" : valueableItems,
      role: 2,
      startFromZero: type === 0,
      creationDate,
      trialEndDate,
      isPaid: false,
      subscription: false,
      scheduleCount: 1,
      createdAt: creationDate,
      currency: selectedCurrency,
      provider: provider || "Email", // Add provider info
    };

    // Handle Google OAuth signup (skip Cognito signup)
    if (provider === "Google" || provider === "Apple") {
      try {
        console.log("🔵 Processing  OAuth signup...", provider);

        // For Google users, we don't need Cognito signup since they're already authenticated
        // Just save to backend database
        const response = await axios.put(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${socialUserId}`,
          data
        );

        console.log("Google signup response:", response);

        if (response.status === 200) {
          // Set local storage for Google user
          localStorage.setItem("userId", socialUserId || "");
          localStorage.setItem("user_email", email);
          localStorage.setItem("user_name", name);
          localStorage.setItem("role", "2");
          localStorage.setItem("businessType", businessTypeValue);
          localStorage.setItem("cashBalance", type === 0 ? "0" : cashBalance);
          localStorage.setItem(
            "outstandingDebt",
            type === 0 ? "0" : outstandingDebt
          );
          localStorage.setItem(
            "valueableItems",
            type === 0 ? "0" : valueableItems
          );
          setLoading(false);

          localStorage.setItem("authToken", "authenticated");

          // Send welcome email for Google users
          const emailData = {
            email: email,
            subject: "Welcome to Mesob Financial – You're All Set!",
            message: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
    <p>Dear <strong>${name}</strong>,</p>

    <p>Welcome to <strong>Mesob Financial</strong>! Your account has been successfully created and you're ready to start managing your business finances.</p>

    <p>Here's what you can do next:</p>
    <ul style="padding-left: 20px;">
      <li>Set up your financial dashboard</li>
      <li>Track your income and expenses</li>
      <li>Monitor your cash flow</li>
      <li>Generate financial reports</li>
    </ul>

    <p><strong>Ready to unlock all features?</strong></p>

    <p>
      <a href="https://app.mesobfinancial.com/customer/subscription" style="color: #1e90ff; text-decoration: none;">
        Click here to view or upgrade your subscription
      </a>
    </p>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,<br>
    The Mesob Financial Team</p>
  </div>
`,
          };

          try {
            await axios.post(
              `https://q0v1vrhy5g.execute-api.us-east-1.amazonaws.com/staging`,
              emailData
            );
            console.log("Welcome email sent successfully");
          } catch (emailError) {
            console.warn("Failed to send welcome email:", emailError);
            // Don't block signup if email fails
          }

          // Create schedule for Google user
          // try {
          //   await createSchedule();
          //   console.log("Schedule created successfully");
          // } catch (scheduleError) {
          //   console.warn("Failed to create schedule:", scheduleError);
          //   // Don't block signup if schedule fails
          // }

          showNotification("success", provider, "signup successful!");

          // Redirect directly to dashboard (skip 2FA for Google users)
          setTimeout(() => {
            setLoading(false);
            navigate("/customer/dashboard", { replace: true });
          }, 1000);
        }
      } catch (dbError) {
        console.error(`${provider} signup database error:`, dbError);
        setLoading(false);

        if (dbError.response?.status === 409) {
          setLoading(false);

          showNotification(
            "danger",
            "User already exists in our system. Please login."
          );
        } else {
          setLoading(false);

          showNotification(
            "danger",
            "Error saving user data. Please try again."
          );
        }
        return;
      }
      return; // Exit early for Google signup
    }

    // Handle regular email/password signup (existing Cognito flow)
    try {
      console.log("🔵 Processing regular email/password signup...");

      // Cognito Signup for email/password users
      const res = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            phone_number: phone,
          },
        },
      });
      console.log("Signup response:", res);

      try {
        // Database Update for email/password users
        const response = await axios.put(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${res.userId}`,
          data
        );

        console.log("Email signup response:", response);

        if (response.status === 200) {
          // Local storage setup for email users
          localStorage.setItem("userId", response.data.id);
          localStorage.setItem("user_email", email);
          localStorage.setItem("user_name", name);
          localStorage.setItem("role", "2");
          localStorage.setItem("businessType", businessTypeValue);
          setLoading(false);

          showNotification("success", "Signup successful!");

          // Redirect to confirmation page for email users (2FA)
          setTimeout(() => {
            setLoading(false);

            navigate("/confirm", {
              state: {
                email,
                id: response.data.id,
                phone_number: phone,
                name: name, // <-- add name here
                password,
              },
            });
          }, 1000);
        }
      } catch (dbError) {
        setLoading(false);

        console.error("Email signup database error:", dbError);

        // Handle existing user in database
        if (dbError.response?.status === 409) {
          setLoading(false);

          showNotification(
            "danger",
            "User already exists in our system. Please login."
          );
        } else {
          setLoading(false);

          showNotification(
            "danger",
            "Error saving user data. Please try again."
          );
        }

        return;
      }
    } catch (cognitoError) {
      setLoading(false);

      console.error("Cognito signup error:", cognitoError);

      // Handle existing user in Cognito
      if (cognitoError.name === "UsernameExistsException") {
        setLoading(false);

        showNotification(
          "danger",
          "User already exists. Please login instead."
        );
      } else {
        setLoading(false);

        showNotification(
          "danger",
          `Signup failed: ${cognitoError.message || "Unknown error"}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/existingusercheck?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("✅ Email check response:", result);

      // return true/false directly
      return result.exists === true;
    } catch (error) {
      console.error("❌ Email check API error:", error);
      return false; // fail-safe: assume not exists
    }
  };

  // const handleNextStep = async () => {
  //   if (isLoading) return;
  //   setIsLoading(true);
  //   if (step === 1) {
  //     if (!validateStep1()) return;

  //     try {
  //       const exists = await checkEmailExists(email);

  //       if (exists) {
  //         setErrors((prev) => ({
  //           ...prev,
  //           email: "This email is already registered. Please login.",
  //         }));
  //         showNotification(
  //           "warning",
  //           "This email is already registered. Please use another."
  //         );
  //         setIsLoading(false);
  //         return;
  //       }

  //       setStep(2); // Proceed to step 2
  //     } catch (err) {
  //       console.error("❌ Email check error:", err);
  //       showNotification("danger", "An error occurred while checking email");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   } else if (step === 2) {
  //     if (!validateStep2()) {
  //       setIsLoading(false);
  //       return;
  //     }
  //     setStep(3);
  //     setIsLoading(false);
  //   }
  // };

  const handleNextStep = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (step === 1) {
      if (!validateStep1()) {
        setIsLoading(false);
        return;
      }

      try {
        const exists = await checkEmailExists(email);

        if (exists) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered. Please login.",
          }));
          showNotification(
            "warning",
            "This email is already registered. Please use another."
          );
          setIsLoading(false);
          return;
        }

        setTimeout(() => {
          setStep(2);
          setIsLoading(false);
        }, 500); // ✅ Shows loading for half a second
      } catch (err) {
        console.error("❌ Email check error:", err);
        showNotification("danger", "An error occurred while checking email");
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (!validateStep2()) {
        setIsLoading(false);
        return;
      }

      // ✅ TEMPORARILY delay to trigger button loading
      setTimeout(() => {
        setStep(3);
        setIsLoading(false);
      }, 500); // <- Forces visibility of spinner/loading for ~½ second
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
                if (provider !== "Google" && provider !== "Apple")
                  setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.email ? "red" : "#000",
                backgroundColor: provider === "Google" ? "#f0f0f0" : "#fff",
              }}
              readOnly={
                provider === "Google" || provider === "Apple" ? true : false
              }
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

            {provider !== "Google" && provider !== "Apple" && (
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
            )}
            {provider !== "Google" &&
              provider !== "Apple" &&
              errors.password && <p style={styles.error}>{errors.password}</p>}

            <button
              onClick={handleNextStep}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? "blue" : "#3b82f6",
              }}
              onMouseOver={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Next"}
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
              <option value="Cafe">Resturant/Cafe</option>
              <option value="Cleaning Services">Cleaning Services</option>
              <option value="⁠Beauty & Grooming">
                ⁠Beauty & Grooming (Salons, Barbershops)
              </option>
              <option value="E-commerce Sellers">
                E-commerce Sellers (Shopify, Amazon, Etsy)
              </option>
              <option value="Construction Trades">
                Construction Trades (Plumbing, Electrical, Painting, etc.)
              </option>
              <option value="Content Creator">Content Creator</option>
              <option value="Other">Other Businesses</option>
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
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              style={styles.input}
            >
              {Object.entries(currencies).map(([code, { symbol, name }]) => (
                <option key={code} value={code}>
                  {symbol} {code} - {name}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextStep}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? "blue" : "#3b82f6",
              }}
              onMouseOver={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Next"}
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
              picture of your business (recommended).
            </p>

            <div style={{ marginBottom: "10px", marginTop: "10px" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();

                  if (!termsChecked) {
                    showNotification(
                      "warning",
                      "Please accept the Terms of Use to proceed."
                    );
                    return;
                  }

                  if (!isSubmitting) handleSignup(e, 0);
                }}
                style={{
                  color: "#3b82f6",
                  textDecoration: "underline",
                  cursor: "pointer",
                  display: "inline-block",
                  marginTop: "5px",
                }}
              >
                Proceed to start from zero
              </a>
            </div>

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
              I agree to the{" "}
              <Link
                to="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.termsLink}
              >
                {" "}
                Terms of Use
              </Link>
            </label>

            <button
              onClick={(e) => handleSignup(e, 1)}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? "blue" : "#3b82f6",
                opacity: termsChecked ? 1 : 0.5,
                cursor: termsChecked ? "pointer" : "not-allowed",
              }}
              onMouseOver={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={!termsChecked || isLoading}
            >
              {isSubmitting ? "Saving..." : "Save and Finish"}
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
