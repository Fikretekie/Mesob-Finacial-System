import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from "reactstrap";

const isLocalhost = window.location.href.includes('localhost');

// Set Stripe publishable key based on environment
const stripePublishableKey = isLocalhost
  ? process.env.PUBLISHABLE_KEY_TEST // Test key
  : process.env.PUBLISHABLE_KEY; // Live key

const stripePromise = loadStripe(stripePublishableKey);

console.log("Stripe Publishable Key:", stripePublishableKey);

const SubscriptionPage = () => {
  const { priceId } = useParams();

  return (
    <>
      <Helmet>
        <title>Subscribe - Mesob Finance</title>
      </Helmet>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Subscribe</CardTitle>
              </CardHeader>
              <CardBody>
                <Elements stripe={stripePromise}>
                  <CheckoutForm priceId={priceId} />
                </Elements>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SubscriptionPage;
