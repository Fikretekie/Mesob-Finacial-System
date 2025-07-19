import React, { useState, useRef } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "reactstrap";
import axios from "axios";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";

const CheckoutForm = ({ priceId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const notificationAlertRef = useRef(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canPay, setCanPay] = useState(false);
  const [formData, setFormData] = useState({
    userId: localStorage.getItem("userId"),
    createdAt: "",
    email: "",
    name: "",
    phone: "03317766777",
    priceId: process.env.PRICE_ID,
    description: "New customer from Mesob Financials",
  });

  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (type, message) => {
    const options = {
      place: "tr",
      message: <div>{message}</div>,
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subscriptionPlans = {
        price_basic_monthly: "Basic Plan (Monthly)",
        price_basic_yearly: "Basic Plan (Yearly)",
        price_pro_monthly: "Professional Plan (Monthly)",
        price_pro_yearly: "Professional Plan (Yearly)",
      };

      const selectedPlan =
        subscriptionPlans[formData.priceId] || "Unknown Plan";

      // Create subscription
      const createSubscriptionResponse = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription",
        {
          userId: formData.userId,
          createdAt: formData.createdAt,
          description: formData.description,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          priceId: formData.priceId,
          subscriptionPlan: selectedPlan,
          address: formData.address,
        }
      );

      if (
        createSubscriptionResponse.data.subscriptionId &&
        createSubscriptionResponse.data.clientSecret
      ) {
        // Handle payment intent with clientSecret
        const { paymentIntent } = await stripe.confirmCardPayment(
          createSubscriptionResponse.data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: formData.name,
                email: formData.email,
              },
            },
          }
        );

        if (paymentIntent.status === "succeeded") {
          showNotification(
            "success",
            "🎉 Congratulations! Enjoy using Mesob Financial."
          );
          setIsSubscribed(true);
        } else {
          showNotification(
            "danger",
            "❌ Subscription failed. Please try again."
          );
        }
      } else {
        showNotification(
          "danger",
          "❌ Failed to create subscription. Please try again."
        );
      }
    } catch (error) {
      showNotification("danger", "❌ An error occurred. Please try again.");
      console.error("Subscription error:", error);
    }

    setLoading(false);
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (!stripe || !priceId) {
      console.log("Stripe or PriceId is not ready yet.");
      return;
    }

    const fetchPriceDetails = async () => {
      try {
        console.log("Fetching price details for priceId:", priceId);
        const response = await axios.get(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/price/${priceId}`
        );

        const { amount, currency } = response.data;
        console.log("Fetched amount:", amount, "currency:", currency);

        const pr = stripe.paymentRequest({
          country: "US",
          currency: currency || "usd",
          total: {
            label: "Total",
            amount: amount || 2999, // cents
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        pr.on("paymentmethod", async (ev) => {
          console.log("Received paymentmethod event");
          try {
            const response = await axios.post(
              "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription",
              {
                userId: formData.userId,
                email: ev.payerEmail,
                name: ev.payerName,
                priceId: priceId,
                subscriptionPlan: "Apple/Google Pay Plan",
              }
            );

            const { clientSecret } = response.data;
            console.log("Client secret received:", clientSecret);

            const { error } = await stripe.confirmPayment({
              clientSecret,
              paymentMethod: ev.paymentMethod.id,
            });

            if (error) {
              ev.complete("fail");
              console.error("Payment failed:", error);
              showNotification("danger", "Payment failed.");
            } else {
              ev.complete("success");
              setIsSubscribed(true);
              showNotification("success", "Payment succeeded!");
            }
          } catch (err) {
            ev.complete("fail");
            console.error("Subscription creation failed:", err);
            showNotification("danger", "Error creating subscription.");
          }
        });

        // Check if Apple/Google Pay is supported
        pr.canMakePayment().then((result) => {
          console.log("canMakePayment() result:", result);
          setCanPay(!!result);
        });

        setPaymentRequest(pr);
      } catch (err) {
        console.error("Error fetching price:", err);
      }
    };

    fetchPriceDetails();
  }, [stripe, priceId]);

  return (
    <div>
      <NotificationAlert ref={notificationAlertRef} zIndex={9999} />

      {!isSubscribed ? (
        <Card className="max-w-md mx-auto p-6 shadow-lg rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
          {/* Apple Pay / Google Pay Button */}
          {canPay && paymentRequest && (
            <div className="mb-4">
              <PaymentRequestButtonElement
                options={{ paymentRequest }}
                className="w-full"
              />
              <div className="text-center my-2">Or</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              name="country"
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <Input
              name="address"
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <div className="border p-3 rounded-md">
              <CardElement />
            </div>
            <Button
              type="submit"
              disabled={loading || !stripe}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Processing..." : "Subscribe"}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="text-center text-green-600 font-semibold mt-4">
          🎉 Congratulations! Enjoy using Mesob Financial.
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
