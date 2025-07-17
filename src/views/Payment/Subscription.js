import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from "reactstrap";

// const stripePromise = loadStripe(
//   "pk_test_51RixMnAhnp7DBxtxJYei2Q8DmH2HYu0j7zBxee2Uzw0LiSMpuzd3XyuNMQlU65F1j9LDkr36aP3XqFy2L4rteckG005T8NDjqZ"
// );

const stripePromise = loadStripe(
  "pk_live_51RixMnAhnp7DBxtx3iUXn6WsNiDtC1MXhjYNDtU56TDRuHZCAazyLGLHvAL7fcOqsIm9tEoxY87eVllZpYb4w42700lTyd1mNz"
);

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
