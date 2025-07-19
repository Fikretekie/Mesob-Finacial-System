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
  Spinner, // Added for loading indicator
} from "reactstrap";

import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  const fetchSubscriptions = async () => {
    setLoading(true); // Set loading to true when starting the fetch
    try {
      const response = await axios.get(
        "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription"
      );
      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setSubscriptions(response.data);
      } else if (
        response.data.subscriptions &&
        Array.isArray(response.data.subscriptions)
      ) {
        setSubscriptions(response.data.subscriptions);
      } else {
        throw new Error("Unexpected API response format");
      }

      setError(null);
      setSuccess("Subscriptions fetched successfully!");
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to fetch subscriptions. Please try again.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">All Subscriptions</h5>
                {/* Add the Get button if needed */}
                {/* <Button color="primary" onClick={fetchSubscriptions}>
                  Get Subscriptions
                </Button> */}
              </CardHeader>
              <CardBody>
                {loading && (
                  <div className="text-center">
                    <Spinner color="primary" /> Loading subscriptions...
                  </div>
                )}
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                {!loading && subscriptions.length === 0 && (
                  <p>No subscriptions available.</p>
                )}
                {!loading && subscriptions.length > 0 && (
                  <Table responsive>
                    <thead className="text-primary">
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
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminSubscriptions;
