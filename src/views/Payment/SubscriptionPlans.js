import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelloading, setCancelLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  // Get stored user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem("userId") || null;
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();
      if (!userId) {
        setUserData(null);
        return;
      }

      console.log("Fetching user data for ID:", userId);

      // Fetch User data from API
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      const userData = response.data.Item ? response.data.Item : response.data;
      console.log("User response:", userData);
      setUserData(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      if (err.response?.status === 404) {
        setUserData(null);
      } else {
        setError(err.response?.data?.message || "Failed to fetch user data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setError("");

      const userId = getUserId();
      if (!userId) {
        throw new Error("User ID not found. Cannot cancel subscription.");
      }

      console.log("Cancelling subscription for ID:", userId);

      // Update user data to cancel subscription by setting isPaid and subscription to false
      const response = await axios.put(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`,
        {
          ...userData,
          isPaid: false,
          subscription: false,
        }
      );

      console.log("Cancel subscription response:", response);
      setUserData({ ...userData, isPaid: false, subscription: false });
      alert("Subscription cancelled successfully.");
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError(err.response?.data?.message || "Failed to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  const plans = [
    {
      name: "Pricing Plan",
      features: [
        "✅ View Transaction History",
        "✅ See Financial Reports (Basic Summary)",
        "✅ Check Balance Sheet",
        "✅ View Income Statement",
        "✅ User Profile Management",
        "✅ Download & View Receipts",
      ],
      price: { monthly: "$29.99/month", yearly: "$600/year" },
      priceId: {
        monthly: "price_1RAXwQAhBlpHU9kBZkhZbUqs",
        yearly: "price_basic_yearly",
      },
    },
  ];

  const createSchedule = async () => {
    try {
      const params = {
        email: localStorage.getItem("user_email"),
        subject: "test",
        message: "testing email for schedule ",
        user_id: "14288408-9011-70a3-eeec-8d7cb1b9dca4",
        schedule_type: 1,
        schedule_count: 1,
      };
      const response = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/schedule",
        params
      );
      console.log("Response Data:", response.data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleSubscribe = async (priceId) => {
    const email = localStorage.getItem("user_email");
    const userId = localStorage.getItem("userId");

    if (!email || !userId) {
      console.error("Email or User ID is missing!");
      return;
    }

    const baseUrl = window.location.origin + "/customer/dashboard";

    try {
      const response = await fetch(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/Session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            redirectUrl: baseUrl,
            userId,
            email,
          }),
        }
      );
      const session = await response.json();
      window.location.href = session.session.url;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getPaypalClientId = () => {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return isLocalhost
      ? "AUI_SWyj_kfkuONQ_fe6KD-70qHAp2vRom3nAivzP2KaajvHst_nthZNw4d5hTCVndUctofi2_6Nl8bu"
      : "AVpz-RlQ2NQtOH27s9jabSWT8Sx2NmUns-NfbxeYUVx1pAMe2w4mQCHBAq-xNkpOqcXlo0kVHw-bBpoB";
  };

  const handlePaypalSubscription = async (priceId) => {
    try {
      const email = localStorage.getItem("user_email");
      const userId = localStorage.getItem("userId");

      const response = await axios.post(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/PaypalSubscription`,
        {
          priceId,
          userId,
          email,
          billingCycle,
        }
      );

      if (response.data.success) {
        await axios.put(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`,
          {
            ...userData,
            isPaid: true,
            subscription: true,
          }
        );
        alert("Subscription created successfully with PayPal!");
        fetchUser();
      }
    } catch (error) {
      console.error("PayPal subscription error:", error);
      setError("Failed to create PayPal subscription");
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchUser();
    }
  }, []);

  // Ensure isSubscribed is a boolean, default to false if userData is null
  const isSubscribed = userData.user
    ? userData.user.isPaid === true && userData.user.subscription === true
    : false;
  console.log("userData:", userData?.user.subscription);

  return (
    <>
      <Helmet>
        <title>Subscription Plans - Mesob Finance</title>
      </Helmet>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Subscription Plans</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  {plans.map((plan, index) => (
                    <Col md={12} key={index}>
                      <Card className="text-center">
                        <CardHeader>
                          <h3>{plan.name}</h3>
                        </CardHeader>
                        <CardBody>
                          <ul className="list-unstyled">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="mb-2">
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <p className="h4 text-primary mb-4">
                            {plan.price[billingCycle]}
                          </p>
                          {loading ? (
                            <div className="text-center">
                              <Spinner color="primary" />
                              <p>Loading...</p>
                            </div>
                          ) : isSubscribed ? (
                            <>
                              <Alert color="success" className="mb-4">
                                You are already subscribed to this plan.
                              </Alert>
                              <Button
                                color="danger"
                                onClick={cancelSubscription}
                                disabled={cancelloading}
                              >
                                {cancelloading ? (
                                  <>
                                    <Spinner size="sm" /> Cancelling...
                                  </>
                                ) : (
                                  "Unsubscribe"
                                )}
                              </Button>
                            </>
                          ) : (
                            <Button
                              color="primary"
                              onClick={() => {
                                setSelectedPriceId(plan.priceId[billingCycle]);
                                setIsModalOpen(true);
                              }}
                            >
                              Subscribe
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {loading && (
                  <div className="text-center mt-3">
                    <Spinner color="primary" />
                    <p>Loading subscription details...</p>
                  </div>
                )}

                {error && (
                  <Alert color="danger" className="mt-3">
                    {error}
                  </Alert>
                )}

                {/* {isSubscribed && !loading && (
                  <div className="mt-4">
                    <h5>Subscription Details</h5>
                    <p>
                      <strong>Name:</strong> {userData.name || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {userData.phone_number || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {userData.email || "N/A"}
                    </p>
                    <p>
                      <strong>Company:</strong> {userData.companyName || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {userData.isPaid && userData.subscription
                        ? "Active"
                        : "Inactive"}
                    </p>
                    <p>
                      <strong>Expires:</strong>{" "}
                      {userData.trialEndDate
                        ? new Date(userData.trialEndDate).toDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Plan:</strong>{" "}
                      {billingCycle === "monthly"
                        ? "Monthly Plan"
                        : "Yearly Plan"}
                    </p>
                  </div>
                )} */}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)}>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Choose Payment Method
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6} className="mb-3">
              <Button
                color="primary"
                block
                onClick={() => {
                  handleSubscribe(selectedPriceId);
                  setIsModalOpen(false);
                }}
              >
                Pay with Stripe
              </Button>
            </Col>
            <Col md={6}>
              <PayPalScriptProvider
                options={{
                  "client-id": getPaypalClientId(),
                  currency: "USD",
                  intent: "subscription",
                  vault: true,
                }}
              >
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "blue",
                    shape: "rect",
                    label: "subscribe",
                  }}
                  createSubscription={(data, actions) => {
                    return actions.subscription.create({
                      plan_id:
                        selectedPriceId === "price_1RAXwQAhBlpHU9kBZkhZbUqs"
                          ? "P-3RX40926YD7153733MKY4ZYI"
                          : "YEARLY_PLAN_ID",
                    });
                  }}
                  onApprove={async (data, actions) => {
                    await handlePaypalSubscription(selectedPriceId);
                    setIsModalOpen(false);
                  }}
                  onError={(err) => {
                    console.error("PayPal error:", err);
                    setError("Payment failed. Please try again.");
                  }}
                />
              </PayPalScriptProvider>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SubscriptionPlans;
