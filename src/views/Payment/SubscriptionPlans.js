import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import axios from "axios";
import {
  Row,
  Col,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { FaPaypal, FaCreditCard, FaCheck } from "react-icons/fa";
import LanguageSelector from "components/Languageselector/LanguageSelector";
import { useTranslation } from "react-i18next";

/* ─── inline styles ─────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#101926",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "1rem",          // ← adds side padding on mobile
  },
  wrapper: {
    width: "100%",
    maxWidth: "560px",
    marginTop: "1rem",        // ← less top gap on mobile
  },
  /* gradient border card */
  gradientBorder: {
    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #3b82f6 100%)",
    borderRadius: "20px",
            // ← add padding so gradient border shows
  },
  card: {
    background: "#1c1e3d",
    borderRadius: "19px",
    padding: "1.5rem 1.25rem", // ← tighter padding on mobile
  },
  heading: {
    textAlign: "center",
    marginBottom: "1.0rem",
  },
    h2: {
    fontSize: "clamp(1.3rem, 5vw, 1.6rem)", // ← fluid font size
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "0.75rem",
    lineHeight: 1.3,
  },
  accent: { color: "white" },
   subtitle: {
    color: "#94a3b8",
    fontSize: "clamp(0.8rem, 3.5vw, 0.95rem)", // ← fluid
    lineHeight: 1.6,
    margin: 0,
    textAlign: "center",
  },
  bold: { fontWeight: "600", color: "#e2e8f0" },
  /* features box */
featuresBox: {
    background: "#282d57",
    border: "1px solid rgba(59, 130, 246, 0.15)",
    borderRadius: "14px",
    padding: "1rem",          // ← less padding on mobile
    marginBottom: "1.0rem",
  },
   featureRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    marginBottom: "0.3rem",
  },
 checkIcon: {
    color: "#8e94b3",
    marginTop: "3px",
    flexShrink: 0,
    fontSize: "13px",
  },
  featureText: {
    color: "#94a3b8",
    fontSize: "clamp(0.8rem, 3.2vw, 0.875rem)", // ← fluid
    lineHeight: 1.6,
    margin: 0,
  },
  featureBold: { 
    fontWeight: "600", 
    color: "#e2e8f0",
  },
  pitch: {
    color: "#64748b",
    fontSize: "0.82rem",
    textAlign: "center",
    marginTop: "1rem",
    lineHeight: 1.6,
    margin: "1rem 0 0",
  },
  /* price */
  priceWrap: { textAlign: "center", marginBottom: "0.5rem" },
  price: { 
    fontSize: "clamp(1.75rem, 7vw, 2.25rem)", // ← fluid
    fontWeight: "700", 
    color: "#ffffff", 
    margin: 0 
  },
  perMonth: { fontSize: "1rem", fontWeight: "400", color: "#64748b" },
  /* CTA */
 ctaBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "clamp(0.9rem, 4vw, 1rem)", // ← fluid
    padding: "0.875rem 1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
    letterSpacing: "0.01em",
  },
  footNote: {
    color: "#475569",
    fontSize: "0.75rem",
    textAlign: "center",
    marginTop: "0.875rem",
    marginBottom: 0,
  },
  /* subscribed state */
  subscribedBadge: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "10px",
    color: "#34d399",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    textAlign: "center",
    marginBottom: "1rem",
    fontWeight: "500",
  },
  cancelBtn: {
    width: "100%",
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.5)",
    borderRadius: "12px",
    color: "#f87171",
    fontWeight: "600",
    fontSize: "0.95rem",
    padding: "0.8rem 1.5rem",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  /* error */
  errorBox: {
    marginTop: "1rem",
    padding: "10px 14px",
    backgroundColor: "#1a0000",
    border: "1px solid #ff4444",
    borderRadius: "8px",
    color: "#ff6b6b",
    fontSize: "14px",
  },
  /* success toast */
  successToast: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "10px",
    color: "#34d399",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
    textAlign: "center",
  },
  /* Modal dark theme */
  modalContent: {
    backgroundColor: "#0d1117",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#111827",
    borderBottom: "1px solid #1e293b",
    color: "#ffffff",
    padding: "1rem 1.5rem",
  },
  modalBody: {
    backgroundColor: "#0d1117",
    padding: "1.75rem",
  },
  modalFooter: {
    backgroundColor: "#111827",
    borderTop: "1px solid #1e293b",
    padding: "0.875rem 1.5rem",
  },
  payBtn: (gradient, shadow) => ({
    width: "100%",
    background: gradient,
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    boxShadow: shadow,
    cursor: "pointer",
    transition: "all 0.3s ease",
  }),
  cancelModalBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
  },
  /* confirm modal */
  confirmModalBody: {
    backgroundColor: "#0d1117",
    color: "#94a3b8",
    padding: "1.5rem",
  },
  dangerBtn: {
    background: "linear-gradient(135deg,#ef4444,#b91c1c)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "8px 20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
};

const features = (t) => [
  {
    title: "Unlimited Transactions:",
    desc: "Track every transaction without limits — always know your real profit.",
  },
  {
    title: "Advanced Financial Reports:",
    desc: "Instantly generate clear reports for taxes and smarter decisions.",
  },
  {
    title: "Check Balance Sheet:",
    desc: "View a full balance sheet to understand your assets, liabilities, and equity at a glance.",
  },
  {
    title: "View Income Statement:",
    desc: "Track your revenue and expenses over time with a clear income statement.",
  },
  {
    title: "Export & Download Receipts:",
    desc: "Keep all your receipts organized, downloadable, and audit-ready.",
  },
  {
    title: "User Profile Management:",
    desc: "Manage your business info easily, no confusion, no lost data.",
  },
];
/* ─── component ─────────────────────────────────────────────── */
const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [billingCycle] = useState("monthly");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);

  const backendBaseUrl =
    "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem";

  const getUserId = () => localStorage.getItem("userId") || null;

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");
      const userId = getUserId();
      if (!userId) { setUserData(null); return; }
      const response = await axios.get(`${backendBaseUrl}/Users/${userId}`);
      setUserData(response.data.user || response.data);
    } catch (err) {
      if (err.response?.status === 404) setUserData(null);
      else setError(err.response?.data?.message || "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (getUserId()) fetchUser(); }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paypal") === "success") fetchUser();
  }, [location.search]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("success") === "true") {
      setJustSubscribed(true);
      const u = new URL(window.location.href);
      u.searchParams.delete("success");
      window.history.replaceState({}, document.title, u.toString());
      setTimeout(() => setJustSubscribed(false), 5000);
    }
  }, []);

  useEffect(() => {
    if (location.state?.justSubscribed) {
      setJustSubscribed(true);
      setTimeout(() => setJustSubscribed(false), 5000);
    }
  }, [location.state]);

  const plans = [
    {
      name: t("subscription.pricingPlan"),
      price: { monthly: "$29.99/month", yearly: "$600/year" },
      priceId: {
        monthly: window?.location.hostname.includes("localhost")
          ? "price_1RlUF2Ahnp7DBxtxAWHdp8jw"
          : "price_1SECeAAhnp7DBxtxSbajPWO3",
        yearly: "price_basic_yearly",
      },
      paypalPlanId: {
        monthly: window?.location.hostname.includes("localhost")
          ? "P-75006919S65969906NDAXFNA"
          : "P-1E453171T1240781XNDIUNGY",
      },
    },
  ];

  const isSubscribed =
    userData?.isPaid === true &&
    (userData?.subscription === true || userData?.subscription === "true");

  const handleSubscribe = async () => {
    try {
      const email = localStorage.getItem("user_email");
      const userId = getUserId();
      if (!email || !userId) { setError("Email or User ID missing"); return; }
      const response = await fetch(`${backendBaseUrl}/Subscription/Session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: billingCycle,
          redirectUrl: window.location.origin + "/customer/dashboard",
          userId,
          email,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const session = await response.json();
      const url = session?.url || session?.session?.url;
      if (!url) throw new Error("Session URL missing");
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Failed to create Stripe subscription session");
    }
  };

  const cancelStripeSubscription = async () => {
    try {
      setCancelLoading(true); setError("");
      if (!userData?.subscriptionId) { setError("Subscription ID missing."); return; }
      await axios.delete(`${backendBaseUrl}/Subscription/${userData.subscriptionId}`);
      await fetchUser();
      window.location.reload();
    } catch { setError("Failed to cancel Stripe subscription."); }
    finally { setCancelLoading(false); }
  };

  const cancelPaypalSubscription = async () => {
    try {
      setCancelLoading(true); setError("");
      if (!userData?.subscriptionId) { setError("Subscription ID missing."); return; }
      await fetch(`${backendBaseUrl}/PaypalSubscription/${userData.subscriptionId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
      });
      await fetchUser();
    } catch { setError("Failed to cancel PayPal subscription."); }
    finally { setCancelLoading(false); }
  };

  const handleCancelSubscription = () => {
    if (userData?.paymentType === "STRIPE") cancelStripeSubscription();
    else if (userData?.paymentType === "PAYPAL") cancelPaypalSubscription();
    else setError("Unable to determine payment type. Please contact support.");
  };

  const getPaypalClientId = () =>
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? "AfyldJzeR-e8NQP2M24ocwWHWPfwRAH8XrUa7W70nwSfDYXmHjMOUgdpiEuv8RTV5RT6-GcR_hOMbG6A"
      : "AVuPk0EljwS6RR9n8GU5Rb2MOQADzQ6T3qSj8YoAsNaHGYwdqko9GOilnxq7vCFDn2iH9hQ8xDoaPL3u";

  const currentPriceId = plans[0].priceId[billingCycle];

  return (
    <>
      <Helmet>
        <title>{t("subscription.title")} - Mesob Finance</title>
      </Helmet>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12} md={4} lg={4}>
            <LanguageSelector />
          </Col>
        </Row>

        <div style={styles.page}>
          <div style={styles.wrapper}>
            {justSubscribed && (
              <div style={styles.successToast}>
                🎉 {t("subscription.congratulations")}
              </div>
            )}

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}

            {/* ── Gradient-border card ── */}
            <div style={styles.gradientBorder}>
              <div style={styles.card}>

                {/* Header */}
                <div style={styles.heading}>
                <h2 style={styles.h2}>
                  <span style={styles.accent}>Pro Plan</span>
                </h2>
                <p style={styles.subtitle}>
                  Your 30-day free trial is ending. Don't lose access to your
                  transactions, reports, and saved business data.
                </p>
              </div>

                {/* Features */}
                <div style={styles.featuresBox}>
                  {features(t).map((f, i) => (
                    <div key={i} style={{ ...styles.featureRow, marginBottom: i === features(t).length - 1 ? 0 : "0.5rem" }}>
                      <FaCheck style={styles.checkIcon} />
                      <p style={styles.featureText}>
                        <span style={styles.featureBold}>{f.title}</span>{" "}
                        {f.desc}
                      </p>
                    </div>
                  ))}
                <p style={styles.pitch}>
                  Stop guessing where your money goes. Keep full
                  control of your finances.
                </p>
                </div>

                {/* Price */}
                <div style={styles.priceWrap}>
                  <p style={styles.price}>
                    $29.99{" "}
                    <span style={styles.perMonth}>/ month</span>
                  </p>
                </div>

                {/* CTA / subscribed state */}
                {loading ? (
                  <div style={{ textAlign: "center", padding: "1rem" }}>
                    <Spinner style={{ color: "#60a5fa" }} />
                    <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                      {t("subscription.loadingSubscription")}
                    </p>
                  </div>
                ) : isSubscribed ? (
                  <>
                    <div style={styles.subscribedBadge}>
                      ✓ {t("subscription.alreadySubscribed")}
                    </div>
                    <button
                      style={styles.cancelBtn}
                      disabled={cancelLoading}
                      onClick={() => setShowConfirmModal(true)}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {cancelLoading ? (
                        <><Spinner size="sm" /> {t("subscription.cancelling")}</>
                      ) : t("subscription.unsubscribe")}
                    </button>
                  </>
                ) : (
                  <button
                    style={{
                      ...styles.ctaBtn,
                      ...(ctaHover ? {
                        boxShadow: "0 6px 28px rgba(59,130,246,0.55)",
                        transform: "translateY(-1px)",
                      } : {}),
                    }}
                    onMouseEnter={() => setCtaHover(true)}
                    onMouseLeave={() => setCtaHover(false)}
                    onClick={() => {
                      setSelectedPriceId(currentPriceId);
                      setIsModalOpen(true);
                    }}
                  >
                    Keep My Unlimited Access
                  </button>
                )}

               <p style={styles.footNote}>
                No interruption. Cancel anytime.
              </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment Method Modal ── */}
        <Modal
          isOpen={isModalOpen}
          toggle={() => setIsModalOpen(false)}
          contentClassName=""
          style={{ "--bs-modal-bg": "transparent" }}
        >
          <div style={styles.modalContent}>
            <ModalHeader
              toggle={() => setIsModalOpen(false)}
              style={styles.modalHeader}
            >
              <span style={{ color: "#fff", fontWeight: 600 }}>
                {t("subscription.choosePaymentMethod")}
              </span>
            </ModalHeader>

            <ModalBody style={styles.modalBody}>
              <Row className="g-3">
                <Col md={6}>
                  <button
                    style={styles.payBtn(
                      "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)",
                      "0 4px 16px rgba(59,130,246,0.3)"
                    )}
                    onClick={() => { handleSubscribe(); setIsModalOpen(false); }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 22px rgba(59,130,246,0.55)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.3)"}
                  >
                    <FaCreditCard size={19} />
                    {t("subscription.payWithCard")}
                  </button>
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
                    {billingCycle === "monthly" && (() => {
                      const selectedPlan = plans.find((p) =>
                        Object.values(p.priceId).includes(selectedPriceId)
                      );
                      const planId = selectedPlan?.paypalPlanId?.monthly;
                      return (
                        <button
                          disabled={loading}
                          style={{
                            ...styles.payBtn(
                              "linear-gradient(135deg,#0070ba 0%,#003087 100%)",
                              "0 4px 16px rgba(0,112,186,0.3)"
                            ),
                            opacity: loading ? 0.7 : 1,
                          }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,112,186,0.55)"}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,112,186,0.3)"}
                          onClick={async () => {
                            setLoading(true); setError("");
                            try {
                              if (!planId) { setError("PayPal plan not configured."); return; }
                              const userId = getUserId();
                              const email = localStorage.getItem("user_email");
                              if (!userId || !email) { setError("User not logged in"); return; }
                              const res = await fetch(
                                `${backendBaseUrl}/createPaypalSubscription`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    planId, userId, email,
                                    redirectUrl: window.location.origin + "/customer/subscription",
                                  }),
                                }
                              );
                              const data = await res.json();
                              if (data.success && data.approvalLink) {
                                window.location.href = data.approvalLink;
                              } else {
                                setError("Failed to create PayPal subscription.");
                              }
                            } catch { setError("PayPal subscription failed. Please try again."); }
                            finally { setLoading(false); }
                          }}
                        >
                          {loading ? (
                            <><span className="spinner-border spinner-border-sm" /> {t("subscription.processing")}</>
                          ) : (
                            <><FaPaypal size={19} /> {t("subscription.payWithPaypal")}</>
                          )}
                        </button>
                      );
                    })()}
                  </PayPalScriptProvider>
                </Col>
              </Row>

              {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            </ModalBody>

            <ModalFooter style={styles.modalFooter}>
              <button
                style={styles.cancelModalBtn}
                onClick={() => setIsModalOpen(false)}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#334155"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#1e293b"; }}
              >
                {t("subscription.cancel")}
              </button>
            </ModalFooter>
          </div>
        </Modal>

        {/* ── Confirm Unsubscribe Modal ── */}
        <Modal isOpen={showConfirmModal} toggle={() => setShowConfirmModal(false)}>
          <div style={styles.modalContent}>
            <ModalHeader
              toggle={() => setShowConfirmModal(false)}
              style={styles.modalHeader}
            >
              <span style={{ color: "#fff" }}>{t("subscription.confirmUnsubscribe")}</span>
            </ModalHeader>
            <ModalBody style={styles.confirmModalBody}>
              {t("subscription.unsubscribeMessage")}
            </ModalBody>
            <ModalFooter style={styles.modalFooter}>
              <button
                style={styles.cancelModalBtn}
                onClick={() => setShowConfirmModal(false)}
              >
                {t("subscription.cancel")}
              </button>
              <button
                style={styles.dangerBtn}
                disabled={cancelLoading}
                onClick={() => { handleCancelSubscription(); setShowConfirmModal(false); }}
              >
                {cancelLoading ? (
                  <><Spinner size="sm" /> {t("subscription.unsubscribing")}</>
                ) : t("subscription.unsubscribe")}
              </button>
            </ModalFooter>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default SubscriptionPlans;