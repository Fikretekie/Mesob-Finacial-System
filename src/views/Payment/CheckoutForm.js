import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button, Input, Card } from "reactstrap";

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

    const res = await fetch(
      "https://your-api-gateway-url/create-subscription",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentMethodId: paymentMethod.id,
          priceId,
        }),
      }
    );

    const data = await res.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Subscription successful!");
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
