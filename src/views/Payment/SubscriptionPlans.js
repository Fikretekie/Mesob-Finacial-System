import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [showModal, setshowModal] = useState(false);
  const location = useLocation();
  const [justSubscribed, setJustSubscribed] = useState(false);
  // Get stored user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem("userId") || null;
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();
      console.log("userid, ", userId);
      if (!userId) {
        setUserData(null);
        return;
      }

      console.log("Fetching user data for ID:", userId);

      // Fetch User data from API
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      const rawData = response.data.Item ? response.data.Item : response.data;
      console.log("User response:", userData);
      setUserData(rawData);
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
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );

      let userData = response.data.user.subscriptionId;
      try {
        setCancelLoading(true);
        setError("");
        if (!userData) {
          throw new Error(
            "Subscription ID not found. Cannot cancel subscription."
          );
        }
        console.log("Cancelling subscription for ID:", userData);
        // const cancelResponse = await axios.delete(
        //   `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/${userData}`,
        //   { redirectUrl: window.location.origin, id: userData }
        // );

        const response = await fetch(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/${userData}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              redirectUrl: window.location.origin,
              id: userData,
            }),
          }
        );

        console.log("Cancel response:", response);
        alert("Subscription cancelled successfully.");
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to cancel subscription."
        );
      } finally {
        setCancelLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data. Please try again later.");
    }
  };

  const updateCancelSubscription = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found.");
        return;
      }

      setCancelLoading(true);
      setError("");
      const updateFields = {
        isPaid: false,
        subscription: false,
      };
      await axios.put(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`,
        updateFields
      );
      fetchUser();

      alert("Subscription cancelled and status updated.");
    } catch (err) {
      console.error("Error updating subscription status:", err);
      setError(
        err.response?.data?.message || "Failed to update subscription status."
      );
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
        monthly: "price_1RlU9fAhnp7DBxtxfIknJzW2",
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

  const handleSubscribe = async () => {
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
            planType: billingCycle, // ✅ "monthly" or "yearly"
            redirectUrl: baseUrl,
            userId,
            email,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const session = await response.json();
      console.log("API Response:", session);

      const checkoutUrl = session?.url || session?.session?.url;

      if (!checkoutUrl) {
        console.error("Stripe session response invalid:", session);
        throw new Error("Session URL is missing in the response");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Stripe subscription error:", error);
      setError("Failed to create subscription session. Please try again.");
    }
  };

  const handlePayPalApprove = async (data) => {
    try {
      await fetch("https://your-lambda-url.com/confirm", {
        method: "POST",
        body: JSON.stringify({
          subscriptionID: data.subscriptionID,
        }),
      });
      alert("PayPal subscription approved!");
    } catch (error) {
      console.error("Error confirming PayPal subscription:", error);
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

  const handleCloseModal = async () => {
    setshowModal(false);
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchUser();
    }
  }, []);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("success") === "true") {
      setJustSubscribed(true);
      // Optionally remove query param from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, document.title, newUrl.toString());
      setTimeout(() => setJustSubscribed(false), 5000);
    }
  }, []);

  useEffect(() => {
    if (location.state?.justSubscribed) {
      setJustSubscribed(true);
      setTimeout(() => setJustSubscribed(false), 5000);
    }
  }, [location.state]);
  // Ensure isSubscribed is a boolean, default to false if userData is null
  const isSubscribed = userData
    ? userData.isPaid === true && userData.subscription === true
    : false;
  console.log("userData:", userData ? userData.subscription : "No userData");
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
                {justSubscribed && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                    🎉 Congratulations! You’ve successfully subscribed.
                  </div>
                )}
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
                                onClick={updateCancelSubscription}
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

        {/* Subscription Modal */}
        <Modal isOpen={showModal} toggle={handleCloseModal}>
          <ModalHeader toggle={handleCloseModal}>
            Choose Payment Method
          </ModalHeader>
          <ModalBody>
            {/* <PayPalScriptProvider
              options={{
                "client-id":
                  "AWHC_KiGbQpiR_Id96ZR5ddNdBa2Z8eX9xOo8TUAl1DAtsPTCU-w8c6cGU803D23hPfLzOut89xgBOpB",
                vault: true,
                intent: "subscription",
              }}
            >
              <PayPalButtons
                style={{ layout: "vertical" }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: "P-XXXXXXXXXXXX", // Replace with actual plan ID from Lambda
                  });
                }}
                onApprove={handlePayPalApprove}
              />
            </PayPalScriptProvider> */}
            <hr />
            <Button
              color="primary"
              block
              onClick={() => handleSubscribe(selectedPriceId)}
            >
              Pay with Card
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
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
                  handleSubscribe();
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
                        selectedPriceId === process.env.PRICE_ID
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
