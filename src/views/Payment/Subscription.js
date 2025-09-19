import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from "reactstrap";

const stripePromise = loadStripe(
  "pk_test_51RixMnAhnp7DBxtxJYei2Q8DmH2HYu0j7zBxee2Uzw0LiSMpuzd3XyuNMQlU65F1j9LDkr36aP3XqFy2L4rteckG005T8NDjqZ"
);
console.log("process.env.PUBLISHABLE_KEY", process.env.PUBLISHABLE_KEY);

const SubscriptionPage = () => {
  const { priceId } = useParams();
  console.log("process.env.PUBLISHABLE_KEY", process.env.PUBLISHABLE_KEY);

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
