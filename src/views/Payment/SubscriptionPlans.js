import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PanelHeader from "components/PanelHeader/PanelHeader";
import { Helmet } from "react-helmet";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Button,
} from "reactstrap";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Basic Plan",
      features: [
        "Access to Free books",
        "Invite a friend to read",
        "Unlimited Access",
        "2 weeks free trial",
      ],
      price: { monthly: "$30/month", yearly: "$300/year" },
      priceId: { monthly: "price_basic_monthly", yearly: "price_basic_yearly" },
    },
    {
      name: "Professional Plan",
      features: [
        "Access to all books",
        "Invite friends to read",
        "Unlimited Access",
        "1 month free trial",
      ],
      price: { monthly: "$60/month", yearly: "$600/year" },
      priceId: { monthly: "price_pro_monthly", yearly: "price_pro_yearly" },
    },
  ];

  const handleSubscribe = (priceId) => {
    navigate("/subscribe", { state: { priceId: priceId } });
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
                <div className="text-center mb-4">
                  <Button
                    color={billingCycle === "monthly" ? "primary" : "secondary"}
                    onClick={() => setBillingCycle("monthly")}
                    className="mr-2"
                  >
                    Monthly Billing
                  </Button>
                  <Button
                    color={billingCycle === "yearly" ? "primary" : "secondary"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly Billing
                  </Button>
                </div>
                <Row>
                  {plans.map((plan, index) => (
                    <Col md={6} key={index}>
                      <Card className="text-center">
                        <CardHeader>
                          <h3>{plan.name}</h3>
                        </CardHeader>
                        <CardBody>
                          <ul className="list-unstyled">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="mb-2">
                                ✅ {feature}
                              </li>
                            ))}
                          </ul>
                          <p className="h4 text-primary mb-4">
                            {plan.price[billingCycle]}
                          </p>
                          <Button
                            color="primary"
                            onClick={() =>
                              handleSubscribe(plan.priceId[billingCycle])
                            }
                          >
                            Subscribe
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SubscriptionPlans;
