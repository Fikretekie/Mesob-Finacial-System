import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from "reactstrap";

const isLocalhost = window.location.href.includes('localhost');

// CRA only inlines vars prefixed REACT_APP_ — without it these are always
// undefined in the bundle.
const stripePublishableKey = isLocalhost
  ? process.env.REACT_APP_PUBLISHABLE_KEY_TEST // Test key
  : process.env.REACT_APP_PUBLISHABLE_KEY; // Live key

// Created on demand, not at module scope: index.js imports this file at boot,
// so a top-level loadStripe() with a missing key threw
// "IntegrationError: Missing value for Stripe()" on every page load.
let stripePromise;
const getStripe = () => {
  if (!stripePublishableKey) return null;
  if (!stripePromise) stripePromise = loadStripe(stripePublishableKey);
  return stripePromise;
};

const SubscriptionPage = () => {
  const { priceId } = useParams();
  const stripe = getStripe();

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content"  >
        <Row>
          <Col xs={12} style={{ paddingInline: 0, }}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Subscribe</CardTitle>
              </CardHeader>
              <CardBody>
                {stripe ? (
                  <Elements stripe={stripe}>
                    <CheckoutForm priceId={priceId} />
                  </Elements>
                ) : (
                  <p className="text-muted mb-0">
                    Card payment is unavailable right now. Please try again later
                    or contact support.
                  </p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SubscriptionPage;
