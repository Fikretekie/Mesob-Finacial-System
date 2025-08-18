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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
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
  const [activeTab, setActiveTab] = useState("1");

  const handleSubscriptionClick = (subscription) => {
    setSelectedSubscription(subscription);
    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone_number || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Company Name",
      selector: (row) => row.companyName || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Created At",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "180px",
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
                  <CardTitle tag="h4">Subscriptions</CardTitle>
                  <Button color="secondary" className="btn-round btn-sm">
                    Subscriptions <span className="ml-2">({users.length})</span>
                  </Button>
                </div>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={activeTab === "1" ? "active" : ""}
                      onClick={() => toggleTab("1")}
                    >
                      Subscribed
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "2" ? "active" : ""}
                      onClick={() => toggleTab("2")}
                    >
                      Unsubstantiated
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    {error ? (
                      <Alert color="danger">{error}</Alert>
                    ) : loading ? (
                      <div className="text-center">
                        <Spinner color="primary" />
                        <p>Loading subscriptions...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={users.filter((user) => user.subscription)}
                        pagination
                        responsive
                        highlightOnHover
                        fixedHeader
                        noDataComponent="No subscribed users found"
                      />
                    )}
                  </TabPane>
                  <TabPane tabId="2">
                    {error ? (
                      <Alert color="danger">{error}</Alert>
                    ) : loading ? (
                      <div className="text-center">
                        <Spinner color="primary" />
                        <p>Loading subscriptions...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={users.filter((user) => !user.subscription)}
                        pagination
                        responsive
                        highlightOnHover
                        fixedHeader
                        noDataComponent="No unsubstantiated users found"
                      />
                    )}
                  </TabPane>
                </TabContent>
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