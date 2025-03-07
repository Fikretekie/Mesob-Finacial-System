import React, { useState, useRef } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button, Input, Card } from "reactstrap";
import axios from "axios";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
const CheckoutForm = ({ priceId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const notificationAlertRef = useRef(null);
  const [formData, setFormData] = useState({
    userId: localStorage.getItem("userId"),
    createdAt: "",
    email: "",
    name: "",
    phone: "030862337456",
    priceId: "price_1QzDgvAhBlpHU9kBDjgqbKIK",
    description: "New customer from Mesob Financials",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const showNotification = (type, message) => {
    const options = {
      place: "tr",
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const subscriptionPlans = {
      price_basic_monthly: "Basic Plan (Monthly)",
      price_basic_yearly: "Basic Plan (Yearly)",
      price_pro_monthly: "Professional Plan (Monthly)",
      price_pro_yearly: "Professional Plan (Yearly)",
    };
    try {
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
      console.log(">>>>>>", createSubscriptionResponse);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Subscription error:", error);
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto p-6 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
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

        {message && <p className="text-red-500 text-sm">{message}</p>}
      </form>
      <NotificationAlert ref={notificationAlertRef} zIndex={9999} />
    </Card>
  );
};

export default CheckoutForm;
