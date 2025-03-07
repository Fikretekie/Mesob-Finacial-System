import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Table,
  Alert,
} from "reactstrap";

import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription"
      );
      console.log("API Response:", response.data);

      // Check if response.data is an array or contains subscriptions
      if (Array.isArray(response.data)) {
        setSubscriptions(response.data);
      } else if (
        response.data.subscriptions &&
        Array.isArray(response.data.subscriptions)
      ) {
        setSubscriptions(response.data.subscriptions); // Set nested subscriptions array
      } else {
        throw new Error("Unexpected API response format");
      }

      setError(null); // Clear any previous errors
      setSuccess("Subscriptions fetched successfully!");
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to fetch subscriptions. Please try again.");
      setSuccess(null); // Clear any previous success messages
    }
  };

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">All Subscriptions</h5>
                {/* Add the Get button */}
                <Button color="primary" onClick={fetchSubscriptions}>
                  Get Subscriptions
                </Button>
              </CardHeader>
              <CardBody>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                <Table responsive>
                  <thead className="text ">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>User ID</th>
                      <th>Payment Method ID</th>
                      <th>Created At</th>
                      <th>Address</th>
                      <th>Subscription Plan</th>
                      <th>Start Date</th>
                      <th>Expire Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.id}</td>
                        <td>{sub.name}</td>
                        <td>{sub.userId}</td>
                        <td>{sub.paymentMethodId}</td>
                        <td>{sub.createdAt}</td>
                        <td>{sub.address}</td>
                        <td>{sub.subscriptionPlan}</td>
                        <td>{sub.startDate}</td>
                        <td>{sub.expireDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminSubscriptions;
