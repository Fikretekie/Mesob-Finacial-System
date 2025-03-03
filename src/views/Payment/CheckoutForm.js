import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button, Input, Card } from "reactstrap";
import axios from "axios";

const CheckoutForm = ({ priceId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    country: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    try {
      // Create subscription
      const createSubscriptionResponse = await axios.post(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/updateUserSubscription",
        {
          userId: localStorage.getItem("userId"),
          subscriptionDetails: {
            paymentMethodId: paymentMethod.id,
            priceId,
            ...formData,
          },
        }
      );

      if (
        createSubscriptionResponse.data.message ===
        "Subscription created successfully"
      ) {
        // Update user's subscription status
        const updateSubscriptionResponse = await axios.post(
          "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/updateUserSubscription",
          {
            userId: localStorage.getItem("userId"),
            subscription: true,
          }
        );

        if (
          updateSubscriptionResponse.data.message ===
          "Subscription updated successfully"
        ) {
          setMessage("Subscription successful!");
        } else {
          setMessage("Subscription created but user status update failed.");
        }
      } else {
        setMessage(
          createSubscriptionResponse.data.error ||
            "Subscription creation failed."
        );
      }
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
    </Card>
  );
};

export default CheckoutForm;
