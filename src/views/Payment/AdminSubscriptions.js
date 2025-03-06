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
      console.log(">>>", response);
      // setSubscriptions(response.data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // useEffect(() => {
  //   // Dummy data
  //   const dummyData = [
  //     {
  //       id: 1,
  //       name: "John Doe",
  //       userId: "user123",
  //       paymentMethodId: "pm_1234567890",
  //       createdAt: "2025-02-15",
  //       address: "123 Main St, New York, USA",
  //       subscriptionPlan: "monthly",
  //       startDate: "2025-03-01",
  //       expireDate: "2025-04-01",
  //     },
  //     {
  //       id: 2,
  //       name: "Jane Smith",
  //       userId: "user456",
  //       paymentMethodId: "pm_0987654321",
  //       createdAt: "2025-02-20",
  //       address: "456 Elm St, London, UK",
  //       subscriptionPlan: "yearly",
  //       startDate: "2025-03-01",
  //       expireDate: "2026-03-01",
  //     },
  //   ];
  //   setSubscriptions(dummyData);
  // }, []);

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">All Subscriptions</h5>
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
