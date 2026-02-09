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
import { FaPaypal } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa";
import LanguageSelector from "components/Languageselector/LanguageSelector";
import { useTranslation } from "react-i18next";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
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

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("paypal") === "success") {
      fetchUser();
    }
  }, [location.search]);

  // Billing plans info with Stripe priceIds and PayPal plan IDs
  const plans = [
    {
      name: t('subscription.pricingPlan'),
      features: [
        t('subscription.features.viewHistory'),
        t('subscription.features.seeReports'),
        t('subscription.features.checkBalance'),
        t('subscription.features.viewIncome'),
        t('subscription.features.userProfile'),
        t('subscription.features.downloadReceipts'),
      ],
      price: { monthly: `$29.99${t('subscription.perMonth')}`, yearly: `$600${t('subscription.perYear')}` },
      priceId: {
        monthly: window?.location.hostname.includes("localhost") ? "price_1RlUF2Ahnp7DBxtxAWHdp8jw" : "price_1SECeAAhnp7DBxtxSbajPWO3",
        yearly: "price_basic_yearly",
      },
      paypalPlanId: {
        monthly: window?.location.hostname.includes("localhost") ? "P-75006919S65969906NDAXFNA" : "P-1E453171T1240781XNDIUNGY"
      },
    },
  ];

  const isSubscribed = userData
    ? userData.isPaid === true &&
    (userData.subscription === true || userData.subscription === "true")
    : false;

  // Stripe subscription handler
  const handleSubscribe = async () => {
    console.log("Stripe subscribe clicked for priceId");
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
      console.log("response of subscription session....", response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const session = await response.json();
      console.log("Stripe session response....", session);

      const checkoutUrl = session?.url || session?.session?.url;
      console.log("checkoutUrl....", checkoutUrl);

      if (!checkoutUrl) throw new Error("Session URL missing");

      window.location.href = checkoutUrl;
    } catch (error) {
      setError(error.message || "Failed to create Stripe subscription session");
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
      ? "AfyldJzeR-e8NQP2M24ocwWHWPfwRAH8XrUa7W70nwSfDYXmHjMOUgdpiEuv8RTV5RT6-GcR_hOMbG6A"
      : "AVuPk0EljwS6RR9n8GU5Rb2MOQADzQ6T3qSj8YoAsNaHGYwdqko9GOilnxq7vCFDn2iH9hQ8xDoaPL3u";
  };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("success") === "true") {
      setJustSubscribed(true);
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

  const cancelStripeSubscription = async () => {
    try {
      setCancelLoading(true);
      setError("");

      if (!userData || !userData.subscriptionId) {
        setError("Subscription ID missing.");
        return;
      }

      await axios.delete(
        `${backendBaseUrl}/Subscription/${userData.subscriptionId}`
      );

      await fetchUser();
      window.location.reload();
    } catch (err) {
      console.error("Stripe unsubscribe error:", err);
      setError("Failed to cancel Stripe subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  // PayPal cancellation function
  const cancelPaypalSubscription = async () => {
    try {
      setCancelLoading(true);
      setError("");

      if (!userData || !userData.subscriptionId) {
        setError("Subscription ID missing.");
        return;
      }

      const res = await fetch(
        `${backendBaseUrl}/PaypalSubscription/${userData.subscriptionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      console.log('res=>>', res);
      await fetchUser();
    } catch (err) {
      console.error("PayPal unsubscribe error:", err);
      setError("Failed to cancel PayPal subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Main cancellation handler
  const handleCancelSubscription = () => {
    console.log("Payment Type:", userData?.paymentType);

    if (userData?.paymentType === "STRIPE") {
      console.log("Cancelling Stripe subscription...");
      cancelStripeSubscription();
    } else if (userData?.paymentType === "PAYPAL") {
      console.log("Cancelling PayPal subscription...");
      cancelPaypalSubscription();
    } else {
      setError("Unable to determine payment type. Please contact support.");
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('subscription.title')} - Mesob Finance</title>
      </Helmet>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12} md={4} lg={4}>
            <LanguageSelector />
          </Col>
          <Col xs={12} style={{ paddingInline: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">{t('subscription.title')}</CardTitle>
              </CardHeader>
              <CardBody>
                {justSubscribed && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                    {t('subscription.congratulations')}
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
                                <p>{t('subscription.loadingSubscription')}</p>
                              </div>
                            ) : isSubscribed ? (
                              <>
                                <Alert color="success" className="mb-4">
                                  {t('subscription.alreadySubscribed')}
                                </Alert>
                                <Button
                                  color="danger"
                                  onClick={() => setShowConfirmModal(true)}
                                  disabled={cancelLoading}
                                >
                                  {cancelLoading ? (
                                    <>
                                      <Spinner size="sm" /> {t('subscription.cancelling')}
                                    </>
                                  ) : (
                                    t('subscription.unsubscribe')
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
                                {t('subscription.subscribe')}
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
                    <p>{t('subscription.loadingSubscription')}</p>
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
            {t('subscription.choosePaymentMethod')}
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
                  <FaCreditCard size={20} /> {" "} {t('subscription.payWithCard')}
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
                              backgroundColor: "#003087",
                              borderColor: "#003087",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "10px 10px",
                              fontSize: "16px",
                            }}
                            block
                            disabled={loading}
                            onClick={async () => {
                              setLoading(true);
                              setError("");

                              try {
                                console.log("[PayPal Subscribe]", {
                                  planId,
                                  billingCycle,
                                  selectedPriceId,
                                });

                                if (!planId) {
                                  setError(
                                    "PayPal plan not configured for this billing cycle."
                                  );
                                  return;
                                }

                                const userId = getUserId();
                                const email = localStorage.getItem("user_email");

                                if (!userId || !email) {
                                  setError("User not logged in");
                                  return;
                                }

                                const res = await fetch(
                                  `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/createPaypalSubscription`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      planId,
                                      userId,
                                      email,
                                      redirectUrl: window.location.origin + "/customer/subscription",
                                    }),
                                  }
                                );

                                const data = await res.json();
                                console.log("[PayPal Backend Response]", data);

                                if (data.success && data.approvalLink) {
                                  window.location.href = data.approvalLink;
                                } else {
                                  setError(
                                    "Failed to create PayPal subscription. Try again."
                                  );
                                }
                              } catch (err) {
                                console.error("[PayPal Button Error]", err);
                                setError(
                                  "PayPal subscription failed. Please try again."
                                );
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                {t('subscription.processing')}
                              </>
                            ) : (
                              <>
                                <FaPaypal size={20} />
                                {t('subscription.payWithPaypal')}
                              </>
                            )}
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
              {t('subscription.cancel')}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Confirmation modal for unsubscribe */}
        <Modal isOpen={showConfirmModal} toggle={() => setShowConfirmModal(false)}>
          <ModalHeader toggle={() => setShowConfirmModal(false)}>
            {t('subscription.confirmUnsubscribe')}
          </ModalHeader>
          <ModalBody>
            {t('subscription.unsubscribeMessage')}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowConfirmModal(false)}>
              {t('subscription.cancel')}
            </Button>
            <Button
              color="danger"
              onClick={() => {
                handleCancelSubscription();
                setShowConfirmModal(false);
              }}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Spinner size="sm" /> {t('subscription.unsubscribing')}
                </>
              ) : (
                t('subscription.unsubscribe')
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default SubscriptionPlans;