// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import PanelHeader from "components/PanelHeader/PanelHeader";
// import { Helmet } from "react-helmet";
// import axios from "axios";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   CardTitle,
//   Row,
//   Col,
//   Button,
//   Spinner,
//   Alert,
// } from "reactstrap";

// const SubscriptionPlans = () => {
//   const navigate = useNavigate();
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [cancelloading, setCancelLoading] = useState(false);
//   // Get stored user ID from localStorage
//   const getUserId = () => {
//     const userData = JSON.parse(localStorage.getItem("user"));
//     return userData?.subscriptionId || null; // Ensure null if no user exists
//   };

//   const fetchSubscription = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const userId = getUserId();
//       if (!userId) {
//         throw new Error("User ID not found. Please subscribe first.");
//       }

//       console.log("Fetching subscription for ID:", userId);

//       // Fetch Subscription from API
//       const response = await axios.get(
//         `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/${userId}`
//       );

//       console.log("Subscription response:", response);
//       setSubscription(response.data.subscription);
//     } catch (err) {
//       console.error("Error fetching subscription:", err);
//       setError(err.response?.data?.message || "Failed to fetch subscription.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const cancelSubscription = async () => {
//     try {
//       setCancelLoading(true);
//       setError("");

//       const userId = getUserId();
//       if (!userId) {
//         throw new Error("User ID not found. Cannot cancel subscription.");
//       }

//       console.log("Cancelling subscription for ID:", userId);

//       // Call DELETE API
//       const response = await axios.delete(
//         `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/${userId}`
//       );

//       console.log("Cancel subscription response:", response);
//       setSubscription(null); // Clear subscription after cancellation
//       alert("Subscription cancelled successfully.");
//     } catch (err) {
//       console.error("Error cancelling subscription:", err);
//       setError(err.response?.data?.message || "Failed to cancel subscription.");
//     } finally {
//       setCancelLoading(false);
//     }
//   };
//   const plans = [
//     {
//       name: "Pricing Plan",
//       features: [
//         "✅ View Transaction History",
//         "✅ See Financial Reports (Basic Summary)",
//         "✅ Check Balance Sheet",
//         "✅ View Income Statement",
//         "✅ User Profile Management",
//         "✅ Download & View Receipts",
//       ],
//       price: { monthly: "$29.99/month", yearly: "$600/year" },
//       priceId: {
//         monthly: "price_1RAXwQAhBlpHU9kBZkhZbUqs",
//         yearly: "price_basic_yearly",
//       },
//     },
//   ];

//   const createSchedule = async () => {
//     try {
//       const params = {
//         email: email,
//         subject: "test",
//         message: "testing email for schedule ",
//         user_id: "14288408-9011-70a3-eeec-8d7cb1b9dca4",
//         schedule_type: 1, // Default type
//         schedule_count: 1,
//       };
//       const response = await axios.post(
//         "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/schedule",
//         params
//       );
//       console.log("Response Data:", response.data);
//     } catch (error) {
//       console.log("Error:", error);
//     }
//   };

//   const handleSubscribe = async (priceId) => {
//     const email = localStorage.getItem("user_email");
//     console.log("Email from localStorage:", email);
//     console.log("userid>>>>", localStorage.getItem("userId"));
//     const userId = localStorage.getItem("userId");

//     if (!email || !userId) {
//       console.error("Email or User ID is missing!");
//       return;
//     }

//     const baseUrl = window.location.origin + "/customer/dashboard";
//     console.log("Base URL:", baseUrl);

//     try {
//       const response = await fetch(
//         `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/Session`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             priceId,
//             redirectUrl: baseUrl,
//             userId,
//             email,
//           }),
//         }
//       );
//       const session = await response.json();
//       console.log("Session response:", session.session.url);
//       window.location.href = session.session.url;
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Subscription Plans - Mesob Finance</title>
//       </Helmet>
//       <PanelHeader size="sm" />
//       <div className="content">
//         <Row>
//           <Col xs={12}>
//             <Card>
//               <CardHeader>
//                 <CardTitle tag="h4">Subscription Plans</CardTitle>
//               </CardHeader>
//               {/* <Button
//                 color="primary"
//                 onClick={() =>
//                   createSchedule()
//                 }
//               >
//                 Subscribe
//               </Button> */}
//               <CardBody>
//                 {/* <div className="text-center mb-4">
//                   <Button
//                     color={billingCycle === "monthly" ? "primary" : "secondary"}
//                     onClick={() => setBillingCycle("monthly")}
//                     className="mr-2"
//                   >
//                     Monthly Billing
//                   </Button>
//                   <Button
//                     color={billingCycle === "yearly" ? "primary" : "secondary"}
//                     onClick={() => setBillingCycle("yearly")}
//                   >
//                     Yearly Billing
//                   </Button>
//                 </div> */}
//                 <Row>
//                   {plans.map((plan, index) => (
//                     <Col md={12} key={index}>
//                       <Card className="text-center">
//                         <CardHeader>
//                           <h3>{plan.name}</h3>
//                         </CardHeader>
//                         <CardBody>
//                           <ul className="list-unstyled">
//                             {plan.features.map((feature, i) => (
//                               <li key={i} className="mb-2">
//                                 {feature}
//                               </li>
//                             ))}
//                           </ul>
//                           <p className="h4 text-primary mb-4">
//                             {plan.price[billingCycle]}
//                           </p>
//                           <Button
//                             color="primary"
//                             onClick={() =>
//                               handleSubscribe(plan.priceId[billingCycle])
//                             }
//                           >
//                             Subscribe
//                           </Button>
//                           {/* <Button
//                             color="info"
//                             onClick={fetchSubscription}
//                             className="ml-2"
//                           >
//                             Get one subscription
//                           </Button> */}
//                           {/* <Button
//                             color="info"
//                             onClick={cancelSubscription}
//                             className="ml-2"
//                           >
//                             Cancel subscription
//                           </Button> */}
//                         </CardBody>
//                       </Card>
//                     </Col>
//                   ))}
//                 </Row>

//                 {/* Show loading spinner while fetching */}
//                 {loading && (
//                   <div className="text-center mt-3">
//                     <Spinner color="primary" />
//                     <p>Loading subscription details...</p>
//                   </div>
//                 )}

//                 {/* Show error message if fetching fails */}
//                 {error && (
//                   <Alert color="danger" className="mt-3">
//                     {error}
//                   </Alert>
//                 )}

//                 {/* Show Subscription Details if available */}
//                 {subscription && (
//                   <div className="mt-4">
//                     <h5>Subscription Details</h5>
//                     <p>
//                       <strong>ID:</strong> {subscription.id}
//                     </p>
//                     <p>
//                       <strong>Plan:</strong> {subscription.subscriptionPlan}
//                     </p>
//                     <p>
//                       <strong>Status:</strong> {subscription.status}
//                     </p>
//                     <p>
//                       <strong>Expires:</strong>{" "}
//                       {new Date(subscription.expireDate).toDateString()}
//                     </p>
//                   </div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </>
//   );
// };
// export default SubscriptionPlans;


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
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelloading, setCancelLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState("");

  const getUserId = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    return userData?.subscriptionId || null;
  };

  const handleOpenModal = (priceId) => {
    setSelectedPriceId(priceId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPriceId("");
  };

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();
      if (!userId) {
        throw new Error("User ID not found. Please subscribe first.");
      }

      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/${userId}`
      );

      setSubscription(response.data.subscription);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch subscription.");
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

      await axios.delete(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription/${userId}`
      );

      setSubscription(null);
      alert("Subscription cancelled successfully.");
    } catch (err) {
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

  const handleStripeSubscribe = async (priceId) => {
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
      console.error("Stripe subscription error:", error);
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
                          <Button
                            color="primary"
                            onClick={() =>
                              handleOpenModal(plan.priceId[billingCycle])
                            }
                          >
                            Subscribe
                          </Button>
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

                {subscription && (
                  <div className="mt-4">
                    <h5>Subscription Details</h5>
                    <p>
                      <strong>ID:</strong> {subscription.id}
                    </p>
                    <p>
                      <strong>Plan:</strong> {subscription.subscriptionPlan}
                    </p>
                    <p>
                      <strong>Status:</strong> {subscription.status}
                    </p>
                    <p>
                      <strong>Expires:</strong>{" "}
                      {new Date(subscription.expireDate).toDateString()}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Subscription Modal */}
        <Modal isOpen={showModal} toggle={handleCloseModal}>
          <ModalHeader toggle={handleCloseModal}>Choose Payment Method</ModalHeader>
          <ModalBody>
            <PayPalScriptProvider
              options={{
                "client-id": "AWHC_KiGbQpiR_Id96ZR5ddNdBa2Z8eX9xOo8TUAl1DAtsPTCU-w8c6cGU803D23hPfLzOut89xgBOpB",
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
            </PayPalScriptProvider>
            <hr />
            <Button
              color="primary"
              block
              onClick={() => handleStripeSubscribe(selectedPriceId)}
            >
              Pay with Stripe
            </Button>
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
