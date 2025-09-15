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
import { FaPaypal } from 'react-icons/fa'; // Using react-icons for PayPal logo
import { FaCreditCard } from 'react-icons/fa'; // Using react-icons for card icon

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [justSubscribed, setJustSubscribed] = useState(false);

  // Backend base URL
  const backendBaseUrl =
    "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem";

  // Helper to get userId from localStorage
  const getUserId = () => localStorage.getItem("userId") || null;

  // Fetch user data to determine subscription state
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");
      const userId = getUserId();
      if (!userId) {
        setUserData(null);
        return;
      }

      const response = await axios.get(`${backendBaseUrl}/Users/${userId}`);
      const rawData = response.data.user || response.data;
      setUserData(rawData);
    } catch (err) {
      if (err.response?.status === 404) {
        setUserData(null);
      } else {
        setError(err.response?.data?.message || "Failed to fetch user data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) fetchUser();
  }, []);

  // Billing plans info with Stripe priceIds and PayPal plan IDs
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
      paypalPlanId: {
        monthly: "P-0S5615S6S423821PNC4WT3Y", // CORRECT ID, matches your PayPal dashboard
      },
    },
  ];

  const isSubscribed = userData
    ? userData.isPaid === true && userData.subscription === true
    : false;

  // Stripe subscription handler (your existing method)
  const handleSubscribe = async (priceId) => {
    try {
      const email = localStorage.getItem("user_email");
      const userId = getUserId();

      if (!email || !userId) {
        setError("Email or User ID missing");
        return;
      }

      const baseUrl = window.location.origin + "/customer/dashboard";

      const response = await fetch(`${backendBaseUrl}/Subscription/Session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: billingCycle,
          redirectUrl: baseUrl,
          userId,
          email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const session = await response.json();

      const checkoutUrl = session?.url || session?.session?.url;
      if (!checkoutUrl) throw new Error("Session URL missing");

      window.location.href = checkoutUrl;
    } catch (error) {
      setError(error.message || "Failed to create Stripe subscription session");
    }
  };

  // PayPal Subscription: create and redirect user to approval link
  const handlePayPalSubscription = async (planId) => {
    try {
      const userId = getUserId();
      const email = localStorage.getItem("user_email");

      if (!userId || !email) {
        setError("User not logged in");
        return;
      }

      const { data } = await axios.post(
        `${backendBaseUrl}/createPaypalSubscription`,
        {
          planId,
          userId,
          email,
          redirectUrl: window.location.origin,
        }
      );

      if (!data.success) {
        setError("Failed to create PayPal subscription");
        return;
      }

      // Redirect user to PayPal approval page
      window.location.href = data.approvalLink;
    } catch (err) {
      setError("Failed to initiate PayPal subscription");
      console.error(err);
    }
  };

  // Verify PayPal subscription after approval (called on return route or manually)
  const verifyPayPalSubscription = async (subscriptionId) => {
    try {
      const userId = getUserId();
      const { data } = await axios.post(
        `${backendBaseUrl}/verifyPaypalSubscription`,
        {
          subscriptionId,
          userId,
        }
      );

      if (data.success) {
        alert("PayPal subscription verified successfully!");
        fetchUser();
      } else {
        setError("Subscription verification failed.");
      }
    } catch (err) {
      setError("Failed to verify PayPal subscription");
    }
  };

  // Modal controls
  const handleCloseModal = () => setIsModalOpen(false);

  // PayPal Client ID switch for sandbox/live
  const getPaypalClientId = () => {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return isLocalhost
      ? "AcKZJrj-TJATLIZZ50lSXJPal6xrlk0rAwN2Q4nNE260Vhyq6E3lDkhAulmc09D8unlihbGz3iKYG9SW" // sandbox client id
      : "AVuPk0EljwS6RR9n8GU5Rb2MOQADzQ6T3qSj8YoAsNaHGYwdqko9GOilnxq7vCFDn2iH9hQ8xDoaPL3u"; // live client id
  };

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
  const updateCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setError("");

      if (!userData || !userData.subscriptionId) {
        setError("Subscription ID missing.");
        return;
      }

      // Perform DELETE request with subscriptionId in URL, no body sent
      await axios.delete(
        `${backendBaseUrl}/Subscription/${userData.subscriptionId}`,
        {
          // If your backend requires auth token or other headers, add here, e.g.:
          // headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh user data to update UI after cancellation
      await fetchUser();
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError("Failed to unsubscribe. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

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
                  {plans.map((plan, index) => {
                    const currentPriceId = plan.priceId[billingCycle];
                    const currentPaypalPlanId = plan.paypalPlanId[billingCycle];
                    return (
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
                                  disabled={cancelLoading}
                                >
                                  {cancelLoading ? (
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
                                  setSelectedPriceId(currentPriceId);
                                  setIsModalOpen(true);
                                }}
                              >
                                Subscribe
                              </Button>
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    );
                  })}
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
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Payment selection modal */}
        <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
          <ModalHeader toggle={handleCloseModal}>
            Choose Payment Method
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6} className="mb-3">
                <Button

                  color="primary"
                  block
                  onClick={() => {
                    handleSubscribe(selectedPriceId); // Stripe payment
                    setIsModalOpen(false);
                  }}
                >
                  <FaCreditCard size={20} /> {/* Credit card icon */}
                  {' '}Pay with Card (Stripe)
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
                  {billingCycle === "monthly" &&
                    (() => {
                      const selectedPlan = plans.find((p) =>
                        Object.values(p.priceId).includes(selectedPriceId)
                      );
                      const planId = selectedPlan?.paypalPlanId?.monthly;

                      return (
                        <Col md={14}>
                          <Button
                            style={{
                              backgroundColor: '#003087', // PayPal dark blue
                              borderColor: '#003087', // Match border to background
                              color: '#ffffff', // White text for contrast
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px', // Space between logo and text
                              padding: '10px 10px', // Adjust padding for better appearance
                              fontSize: '16px', // Consistent font size
                            }}
                            block
                            onClick={async () => {
                              try {
                                console.log('[PayPal Subscribe]', {
                                  planId,
                                  billingCycle,
                                  selectedPriceId,
                                });

                                if (!planId) {
                                  setError('PayPal plan not configured for this billing cycle.');
                                  return;
                                }

                                const userId = getUserId();
                                const email = localStorage.getItem('user_email');

                                if (!userId || !email) {
                                  setError('User not logged in');
                                  return;
                                }

                                // Call your backend to create the subscription
                                const res = await fetch(
                                  `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/createPaypalSubscription`,
                                  {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      planId,
                                      userId,
                                      email,
                                      redirectUrl: window.location.origin,
                                    }),
                                  }
                                );

                                const data = await res.json();
                                console.log('[PayPal Backend Response]', data);

                                if (data.success && data.approvalLink) {
                                  window.location.href = data.approvalLink; // Redirect to PayPal
                                } else {
                                  setError('Failed to create PayPal subscription. Try again.');
                                }
                              } catch (err) {
                                console.error('[PayPal Button Error]', err);
                                setError('PayPal subscription failed. Please try again.');
                              }
                            }}
                          >
                            <FaPaypal size={20} /> {/* PayPal logo icon */}
                            Pay with PayPal
                          </Button>
                        </Col>

                      );
                    })()}
                </PayPalScriptProvider>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default SubscriptionPlans;
