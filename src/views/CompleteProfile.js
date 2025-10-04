import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { updateUserAttributes } from "aws-amplify/auth";
import axios from "axios";

const CompleteProfile = () => {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [otherBusinessType, setOtherBusinessType] = useState("");
  const [errors, setErrors] = useState({});
  const notificationAlertRef = useRef(null);
  const navigate = useNavigate();

  const email = localStorage.getItem("socialEmail");

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

    // Validate form
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!companyName) newErrors.companyName = "Company name is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (!businessType) newErrors.businessType = "Business type is required";
    if (businessType === "Other" && !otherBusinessType.trim()) {
      newErrors.otherBusinessType = "Please specify your business type";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Update Cognito attributes
      await updateUserAttributes({
        userAttributes: {
          name,
          phone_number: phone,
          "custom:company": companyName,
          "custom:businessType":
            businessType === "Other" ? otherBusinessType : businessType,
        },
      });

      // Update your database
      const businessTypeValue =
        businessType === "Other" ? otherBusinessType : businessType;
      const response = await axios.put(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${localStorage.getItem(
          "userId"
        )}`,
        {
          name,
          companyName,
          phone_number: phone,
          businessType: businessTypeValue,
          role: 2,
          cashBalance: "0",
          outstandingDebt: "0",
          valueableItems: "0",
          startFromZero: true,
        }
      );

      // Update local storage
      localStorage.setItem("user_name", name);
      localStorage.setItem("role", "2");
      localStorage.setItem("businessType", businessTypeValue);
      localStorage.removeItem("socialSignup");

      showNotification("success", "Profile completed successfully!");
      setTimeout(() => navigate("/customer/dashboard"), 1500);
    } catch (error) {
      console.error("Error completing profile:", error);
      showNotification(
        "danger",
        "Failed to complete profile. Please try again."
      );
    }
  };

  const handlePhoneChange = (value) => {
    setPhone("+" + value);
  };

  return (
    <div className="complete-profile-container">
      <NotificationAlert ref={notificationAlertRef} />
      <div className="complete-profile-box" >
        <h2>Complete Your Profile</h2>
        <p>
          Please provide some additional information to finish setting up your
          account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} disabled />
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "error" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="input-group">
            <label>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={errors.companyName ? "error" : ""}
            />
            {errors.companyName && (
              <span className="error-message">{errors.companyName}</span>
            )}
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <PhoneInput
              country={"us"}
              value={phone.replace("+", "")}
              onChange={handlePhoneChange}
              inputClass={errors.phone ? "error" : ""}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="input-group">
            <label>Business Type</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={errors.businessType ? "error" : ""}
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
              <option value="Other">Other</option>
            </select>
            {errors.businessType && (
              <span className="error-message">{errors.businessType}</span>
            )}
          </div>

          {businessType === "Other" && (
            <div className="input-group">
              <label>Specify Business Type</label>
              <input
                type="text"
                value={otherBusinessType}
                onChange={(e) => setOtherBusinessType(e.target.value)}
                className={errors.otherBusinessType ? "error" : ""}
              />
              {errors.otherBusinessType && (
                <span className="error-message">
                  {errors.otherBusinessType}
                </span>
              )}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
