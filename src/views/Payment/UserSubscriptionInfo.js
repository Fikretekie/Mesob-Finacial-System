import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const UserSubscriptionInfo = () => {
  const [userSubscription, setUserSubscription] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );

      if (response.data?.user) {
        const userData = response.data.user;
        setUserSubscription(userData.subscription || false);
        setTrialEndDate(new Date(userData.trialEndDate));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const isTrialActive = () => {
    return new Date() < trialEndDate;
  };

  const renderSubscribeButton = () => {
    if (!userSubscription && !isTrialActive()) {
      return (
        <Button onClick={() => navigate("/subscription")}>Subscribe</Button>
      );
    }
    return null;
  };

  const renderTrialTimer = () => {
    if (isTrialActive()) {
      return (
        <div>
          Trial ends in:{" "}
          {Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24))} days
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {renderSubscribeButton()}
      {renderTrialTimer()}
    </div>
  );
};

export default UserSubscriptionInfo;
