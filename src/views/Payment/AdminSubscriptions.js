import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import DataTable from "react-data-table-component";
import "../../views/mesobfinancial2.css";
const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubscriptionClick = (subscription) => {
    setSelectedSubscription(subscription);
    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const columns = [
    {
      name: "User ID",
      selector: (row) => row.id,
      sortable: true,
      width: "150px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "300px",
    },
    {
      name: "Name",
      selector: (row) => row.name || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone_number || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Company Name",
      selector: (row) => row.companyName || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Business Type",
      selector: (row) => row.businessType || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Cash Balance",
      selector: (row) => row.cashBalance || 0,
      sortable: true,
      width: "150px",
      cell: (row) => `$${row.cashBalance || "0"}`,
    },
    {
      name: "Role",
      selector: (row) => row.role || "-",
      sortable: true,
      width: "150px",
      cell: (row) => (row.role === 2 ? "User" : "Admin"),
    },
    {
      name: "Created At",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "200px",
      cell: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
    },
    {
      name: "Subscription",
      cell: (row) =>
        row.subscription ? (
          <Button
            color="info"
            size="sm"
            onClick={() => handleSubscriptionClick(row.subscription)}
          >
            View
          </Button>
        ) : (
          "-"
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes] = await Promise.all([
        axios.get(
          "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        ),
        axios.get(
          "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription"
        ),
      ]);

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const subscriptionsData = Array.isArray(subsRes.data)
        ? subsRes.data
        : subsRes.data.subscriptions || [];

      const enrichedUsers = usersData.map((user) => {
        const subscription = subscriptionsData.find(
          (sub) => sub.id === user.subscriptionId
        );
        return { ...user, subscription };
      });

      setUsers(enrichedUsers);
      setSubscriptions(subscriptionsData);
      setError(null);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <CardTitle tag="h4">Users</CardTitle>
                  <Button color="secondary" className="btn-round btn-sm">
                    Users <span className="ml-2">({users.length})</span>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {error ? (
                  <Alert color="danger">{error}</Alert>
                ) : loading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                    <p>Loading users and subscriptions...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={users}
                    pagination
                    responsive
                    highlightOnHover
                    fixedHeader
                    noDataComponent="No users found"
                  />
                )}
                <Card>
                  <CardHeader>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <CardTitle tag="h4">All Subscriptions</CardTitle>
                      <Button color="secondary" className="btn-round btn-sm">
                        Subscriptions{" "}
                        <span className="ml-2">({subscriptions.length})</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {loading ? (
                      <div className="text-center">
                        <Spinner color="primary" />
                        <p>Loading subscriptions...</p>
                      </div>
                    ) : subscriptions.length === 0 ? (
                      <Alert color="warning">No subscriptions found.</Alert>
                    ) : (
                      <DataTable
                        columns={[
                          {
                            name: "Subscription ID",
                            selector: (row) => row.id,
                            sortable: true,
                            width: "180px",
                          },
                          {
                            name: "User ID",
                            selector: (row) => row.userId || "-",
                            sortable: true,
                            width: "150px",
                          },
                          {
                            name: "Plan",
                            selector: (row) => row.subscriptionPlan || "-",
                            width: "200px",
                          },
                          {
                            name: "Start Date",
                            selector: (row) =>
                              row.startDate
                                ? new Date(row.startDate).toLocaleDateString()
                                : "-",
                            width: "150px",
                          },
                          {
                            name: "Expire Date",
                            selector: (row) =>
                              row.expireDate
                                ? new Date(row.expireDate).toLocaleDateString()
                                : "-",
                            width: "150px",
                          },
                          {
                            name: "View",
                            cell: (row) => (
                              <Button
                                color="info"
                                size="sm"
                                onClick={() => handleSubscriptionClick(row)}
                              >
                                View
                              </Button>
                            ),
                            ignoreRowClick: true,
                            allowOverflow: true,
                            button: true,
                            width: "100px",
                          },
                        ]}
                        data={subscriptions}
                        pagination
                        responsive
                        highlightOnHover
                        fixedHeader
                        noDataComponent="No subscriptions found"
                      />
                    )}
                  </CardBody>
                </Card>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        toggle={toggleModal}
        contentClassName="custom-modal-width"
      >
        <ModalHeader toggle={toggleModal}>Subscription Details</ModalHeader>
        <ModalBody>
          {selectedSubscription ? (
            <Row>
              <Col md="6">
                <strong>ID:</strong> {selectedSubscription.id}
              </Col>
              <Col md="6">
                <strong>Name:</strong> {selectedSubscription.name}
              </Col>
              <Col md="6">
                <strong>User ID:</strong> {selectedSubscription.userId}
              </Col>
              <Col md="6">
                <strong>Payment Method:</strong>{" "}
                {selectedSubscription.paymentMethodId}
              </Col>
              <Col md="6">
                <strong>Address:</strong> {selectedSubscription.address}
              </Col>
              <Col md="6">
                <strong>Plan:</strong> {selectedSubscription.subscriptionPlan}
              </Col>
              <Col md="6">
                <strong>Start:</strong> {selectedSubscription.startDate}
              </Col>
              <Col md="6">
                <strong>Expire:</strong> {selectedSubscription.expireDate}
              </Col>
            </Row>
          ) : (
            <p>No subscription data found.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AdminSubscriptions;
