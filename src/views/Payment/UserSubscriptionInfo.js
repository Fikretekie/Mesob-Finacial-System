import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const UserSubscriptionInfo = ({
  userSubscription,
  trialEndDate,
  scheduleCount,
}) => {
  const navigate = useNavigate();

  const isTrialActive = () => {
    return new Date() < trialEndDate && scheduleCount < 4;
  };

  const renderSubscribeButton = () => {
    if (!userSubscription && (!isTrialActive() || scheduleCount >= 4)) {
      return (
        <Button onClick={() => navigate("/subscription")}>Subscribe</Button>
      );
    }
    return null;
  };

  const renderTrialTimer = () => {
    if (userSubscription) return null;

    if (isTrialActive() && scheduleCount < 4) {
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
