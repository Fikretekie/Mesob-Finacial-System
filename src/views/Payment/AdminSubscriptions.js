// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Card,
//   CardHeader,
//   CardBody,
//   CardTitle,
//   Row,
//   Col,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Nav,
//   NavItem,
//   NavLink,
//   TabContent,
//   TabPane,
// } from "reactstrap";

// import PanelHeader from "components/PanelHeader/PanelHeader.js";
// import axios from "axios";
// import DataTable from "react-data-table-component";
// import "../../views/mesobfinancial2.css";

// const AdminSubscriptions = () => {
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [error, setError] = useState(null);
//   const [selectedSubscription, setSelectedSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("1");

//   const handleSubscriptionClick = (subscription) => {
//     setSelectedSubscription(subscription);
//     setModalOpen(true);
//   };

//   const toggleModal = () => {
//     setModalOpen(!modalOpen);
//   };

//   const toggleTab = (tab) => {
//     if (activeTab !== tab) setActiveTab(tab);
//   };

//   const columns = [
//     {
//       name: "Name",
//       selector: (row) => row.name || "-",
//       sortable: true,
//       width: "200px",
//     },
//     {
//       name: "Email",
//       selector: (row) => row.email,
//       sortable: true,
//       width: "200px",
//     },
//     {
//       name: "Phone",
//       selector: (row) => row.phone_number || "-",
//       sortable: true,
//       width: "180px",
//     },
//     {
//       name: "Company Name",
//       selector: (row) => row.companyName || "-",
//       sortable: true,
//       width: "180px",
//     },
//     {
//       name: "Created At",
//       selector: (row) => row.createdAt,
//       sortable: true,
//       width: "180px",
//       cell: (row) =>
//         row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
//     },
//     {
//       name: "Subscription",
//       cell: (row) =>
//         row.subscription ? (
//           <Button
//             color="info"
//             size="sm"
//             onClick={() => handleSubscriptionClick(row.subscription)}
//           >
//             View
//           </Button>
//         ) : (
//           "-"
//         ),
//       ignoreRowClick: true,
//       allowOverflow: true,
//       button: true,
//       width: "150px",
//     },
//   ];

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [usersRes, subsRes] = await Promise.all([
//         axios.get(
//           "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users",
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//           }
//         ),
//         axios.get(
//           "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription"
//         ),
//       ]);

//       const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
//       const subscriptionsData = Array.isArray(subsRes.data)
//         ? subsRes.data
//         : subsRes.data.subscriptions || [];

//       const enrichedUsers = usersData.map((user) => {
//         const subscription = subscriptionsData.find(
//           (sub) => sub.id === user.subscriptionId
//         );
//         return { ...user, subscription };
//       });

//       setUsers(enrichedUsers);
//       setSubscriptions(subscriptionsData);
//       setError(null);
//     } catch (err) {
//       console.error("Data fetch error:", err);
//       setError("Failed to load data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <>
//       <PanelHeader size="sm" />
//       <div className="content">
//         <Row>
//           <Col xs={12}>
//             <Card>
//               <CardHeader>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                   }}
//                 >
//                   <CardTitle tag="h4">Subscriptions</CardTitle>
//                   <Button color="secondary" className="btn-round btn-sm">
//                     Subscriptions <span className="ml-2">({users.length})</span>
//                   </Button>
//                 </div>
//                 <Nav tabs>
//                   <NavItem>
//                     <NavLink
//                       className={activeTab === "1" ? "active" : ""}
//                       onClick={() => toggleTab("1")}
//                     >
//                       Subscribed
//                     </NavLink>
//                   </NavItem>
//                   <NavItem>
//                     <NavLink
//                       className={activeTab === "2" ? "active" : ""}
//                       onClick={() => toggleTab("2")}
//                     >
//                       Unsubstantiated
//                     </NavLink>
//                   </NavItem>
//                 </Nav>
//               </CardHeader>
//               <CardBody>
//                 <TabContent activeTab={activeTab}>
//                   <TabPane tabId="1">
//                     {error ? (
//                       <Alert color="danger">{error}</Alert>
//                     ) : loading ? (
//                       <div className="text-center">
//                         <Spinner color="primary" />
//                         <p>Loading subscriptions...</p>
//                       </div>
//                     ) : (
//                       <DataTable
//                         columns={columns}
//                         data={users.filter((user) => user.subscription)}
//                         pagination
//                         responsive
//                         highlightOnHover
//                         fixedHeader
//                         noDataComponent="No subscribed users found"
//                       />
//                     )}
//                   </TabPane>
//                   <TabPane tabId="2">
//                     {error ? (
//                       <Alert color="danger">{error}</Alert>
//                     ) : loading ? (
//                       <div className="text-center">
//                         <Spinner color="primary" />
//                         <p>Loading subscriptions...</p>
//                       </div>
//                     ) : (
//                       <DataTable
//                         columns={columns}
//                         data={users.filter((user) => !user.subscription)}
//                         pagination
//                         responsive
//                         highlightOnHover
//                         fixedHeader
//                         noDataComponent="No unsubstantiated users found"
//                       />
//                     )}
//                   </TabPane>
//                 </TabContent>
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </div>

//       {/* Modal */}
//       <Modal
//         isOpen={modalOpen}
//         toggle={toggleModal}
//         contentClassName="custom-modal-width"
//       >
//         <ModalHeader toggle={toggleModal}>Subscription Details</ModalHeader>
//         <ModalBody>
//           {selectedSubscription ? (
//             <Row>
//               <Col md="6">
//                 <strong>ID:</strong> {selectedSubscription.id}
//               </Col>
//               <Col md="6">
//                 <strong>Name:</strong> {selectedSubscription.name}
//               </Col>
//               <Col md="6">
//                 <strong>User ID:</strong> {selectedSubscription.userId}
//               </Col>
//               <Col md="6">
//                 <strong>Payment Method:</strong>{" "}
//                 {selectedSubscription.paymentMethodId}
//               </Col>
//               <Col md="6">
//                 <strong>Address:</strong> {selectedSubscription.address}
//               </Col>
//               <Col md="6">
//                 <strong>Plan:</strong> {selectedSubscription.subscriptionPlan}
//               </Col>
//               <Col md="6">
//                 <strong>Start:</strong> {selectedSubscription.startDate}
//               </Col>
//               <Col md="6">
//                 <strong>Expire:</strong> {selectedSubscription.expireDate}
//               </Col>
//             </Row>
//           ) : (
//             <p>No subscription data found.</p>
//           )}
//         </ModalBody>
//         <ModalFooter>
//           <Button color="secondary" onClick={toggleModal}>
//             Close
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </>
//   );
// };

// export default AdminSubscriptions;




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
  Badge,
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
  const [providerFilter, setProviderFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Desktop columns
  const desktopColumns = [
    {
      name: "Name",
      selector: (row) => row.name || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone_number || row.phone || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Company Name",
      selector: (row) => row.companyName || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Provider",
      selector: (row) => row.subscription?.provider || "-",
      sortable: true,
      width: "120px",
      cell: (row) => {
        const provider = row.subscription?.provider;
        if (!provider) return "-";

        return (
          <Badge
            color={provider.toLowerCase() === "stripe" ? "primary" : "success"}
            pill
          >
            {provider.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row.subscription?.status || "-",
      sortable: true,
      width: "120px",
      cell: (row) => {
        const status = row.subscription?.status;
        if (!status) return "-";

        const isActive = status.toLowerCase() === "active";
        return (
          <Badge color={isActive ? "success" : "danger"} pill>
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      name: "Plan",
      selector: (row) => row.subscription?.subscriptionPlan || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Created At",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "150px",
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
      width: "120px",
    },
  ];

  // Mobile columns - simplified view
  const mobileColumns = [
    {
      name: "User",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <div>
          <div className="font-weight-bold text-primary">{row.email}</div>
          {row.name && <div className="text-muted small">Name: {row.name}</div>}
          {row.companyName && (
            <div className="text-muted small">Company: {row.companyName}</div>
          )}
        </div>
      ),
    },
    {
      name: "Subscription",
      selector: (row) => row.subscription?.status || "-",
      sortable: true,
      width: "150px",
      cell: (row) => {
        const subscription = row.subscription;
        if (!subscription) {
          return (
            <Badge color="secondary" pill>
              No Sub
            </Badge>
          );
        }

        const isActive = subscription.status?.toLowerCase() === "active";
        const provider = subscription.provider;

        return (
          <div>
            <Badge
              color={isActive ? "success" : "danger"}
              pill
              className="mb-1 d-block"
            >
              {subscription.status?.toUpperCase() || "N/A"}
            </Badge>
            <Badge
              color={
                provider?.toLowerCase() === "stripe" ? "primary" : "success"
              }
              pill
              className="d-block"
            >
              {provider?.toUpperCase() || "N/A"}
            </Badge>
          </div>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) =>
        row.subscription ? (
          <Button
            color="info"
            size="sm"
            onClick={() => handleSubscriptionClick(row.subscription)}
            className="w-100"
          >
            Details
          </Button>
        ) : (
          <span className="text-muted">-</span>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "100px",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes] = await Promise.all([
        axios.get(
          "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        ),
        axios.get(
          "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Subscription"
        ),
      ]);

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const subscriptionsData = Array.isArray(subsRes.data)
        ? subsRes.data
        : subsRes.data.subscriptions || [];

      const enrichedUsers = usersData.map((user) => {
        const subscription = subscriptionsData.find(
          (sub) => sub.userId === user.id || sub.email === user.email
        );
        return { ...user, subscription };
      });

      setUsers(enrichedUsers);
      setSubscriptions(subscriptionsData);
      console.log('subscriptionsData=>>', subscriptionsData);
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

  // Helper function to check if subscription is active
  const isSubscriptionActive = (subscription) => {
    if (!subscription || !subscription.status) return false;
    const status = subscription.status.toLowerCase();
    return status === "active" || status === "trialing";
  };

  const getFilteredUsers = (subscribed) => {
    let filtered;

    if (subscribed) {
      // Show users with active subscriptions
      filtered = users.filter(
        (user) => user.subscription && isSubscriptionActive(user.subscription)
      );
    } else {
      // Show users without subscription or with cancelled/inactive subscriptions
      filtered = users.filter(
        (user) => !user.subscription || !isSubscriptionActive(user.subscription)
      );
    }

    if (providerFilter !== "all" && subscribed) {
      filtered = filtered.filter(
        (user) =>
          user.subscription?.provider?.toLowerCase() ===
          providerFilter.toLowerCase()
      );
    }

    return filtered;
  };

  const getProviderCounts = () => {
    const activeSubscriptions = users.filter(
      (user) => user.subscription && isSubscriptionActive(user.subscription)
    );

    const stripeCount = activeSubscriptions.filter(
      (user) => user.subscription?.provider?.toLowerCase() === "stripe"
    ).length;

    const paypalCount = activeSubscriptions.filter(
      (user) => user.subscription?.provider?.toLowerCase() === "paypal"
    ).length;

    return {
      stripe: stripeCount,
      paypal: paypalCount,
      total: activeSubscriptions.length,
    };
  };

  const counts = getProviderCounts();
  const unsubscribedCount = users.filter(
    (user) => !user.subscription || !isSubscriptionActive(user.subscription)
  ).length;

  // Mobile Card Component for better mobile experience
  const MobileSubscriptionCard = ({ user, subscribed }) => (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h6 className="font-weight-bold text-primary mb-1">{user.email}</h6>
            {user.name && (
              <p className="text-muted mb-1 small">Name: {user.name}</p>
            )}
            {user.companyName && (
              <p className="text-muted mb-1 small">
                Company: {user.companyName}
              </p>
            )}
            {user.phone_number && (
              <p className="text-muted mb-1 small">
                Phone: {user.phone_number}
              </p>
            )}
          </div>
        </div>

        {user.subscription ? (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <Badge
                color={
                  user.subscription.status?.toLowerCase() === "active"
                    ? "success"
                    : "danger"
                }
                pill
                className="mr-2"
              >
                {user.subscription.status?.toUpperCase()}
              </Badge>
              <Badge
                color={
                  user.subscription.provider?.toLowerCase() === "stripe"
                    ? "primary"
                    : "success"
                }
                pill
              >
                {user.subscription.provider?.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <small className="text-muted d-block">
                Plan: {user.subscription.subscriptionPlan || "N/A"}
              </small>
              <small className="text-muted">
                Created:{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </small>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <Badge color="secondary" pill>
              No Subscription
            </Badge>
          </div>
        )}

        {user.subscription && (
          <Button
            color="info"
            size="sm"
            onClick={() => handleSubscriptionClick(user.subscription)}
            className="w-100 mt-2"
          >
            View Details
          </Button>
        )}
      </CardBody>
    </Card>
  );

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12} style={{ paddingInline: 0 }}>
            <Card>
              <CardHeader>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <CardTitle tag="h4" className="mb-0">
                    Subscriptions
                  </CardTitle>
                  <div className="d-flex flex-wrap gap-2">
                    <Button color="secondary" className="btn-round btn-sm">
                      Total: {users.length}
                    </Button>
                    <Button color="primary" className="btn-round btn-sm">
                      Stripe: {counts.stripe}
                    </Button>
                    <Button color="success" className="btn-round btn-sm">
                      PayPal: {counts.paypal}
                    </Button>
                  </div>
                </div>

                {/* Mobile-friendly tabs */}
                <Nav tabs className={isMobile ? "flex-column" : ""}>
                  <NavItem className={isMobile ? "w-100" : ""}>
                    <NavLink
                      className={activeTab === "1" ? "active" : ""}
                      onClick={() => toggleTab("1")}
                      style={{ cursor: "pointer" }}
                      className={`text-center ${isMobile ? "w-100" : ""}`}
                    >
                      Active ({counts.total})
                    </NavLink>
                  </NavItem>
                  <NavItem className={isMobile ? "w-100" : ""}>
                    <NavLink
                      className={activeTab === "2" ? "active" : ""}
                      onClick={() => toggleTab("2")}
                      style={{ cursor: "pointer" }}
                      className={`text-center ${isMobile ? "w-100" : ""}`}
                    >
                      Inactive ({unsubscribedCount})
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          color={
                            providerFilter === "all" ? "primary" : "secondary"
                          }
                          size="sm"
                          onClick={() => setProviderFilter("all")}
                        >
                          All ({counts.total})
                        </Button>
                        <Button
                          color={
                            providerFilter === "stripe"
                              ? "primary"
                              : "secondary"
                          }
                          size="sm"
                          onClick={() => setProviderFilter("stripe")}
                        >
                          Stripe ({counts.stripe})
                        </Button>
                        <Button
                          color={
                            providerFilter === "paypal"
                              ? "success"
                              : "secondary"
                          }
                          size="sm"
                          onClick={() => setProviderFilter("paypal")}
                        >
                          PayPal ({counts.paypal})
                        </Button>
                      </div>
                    </div>
                    {error ? (
                      <Alert color="danger">{error}</Alert>
                    ) : loading ? (
                      <div className="text-center py-4">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading subscriptions...</p>
                      </div>
                    ) : isMobile ? (
                      // Mobile Card Layout
                      <div>
                        {getFilteredUsers(true).length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No active subscriptions found
                          </div>
                        ) : (
                          getFilteredUsers(true).map((user) => (
                            <MobileSubscriptionCard
                              key={user.id}
                              user={user}
                              subscribed={true}
                            />
                          ))
                        )}
                      </div>
                    ) : (
                      // Desktop Table Layout
                      <DataTable
                        columns={desktopColumns}
                        data={getFilteredUsers(true)}
                        pagination
                        responsive
                        highlightOnHover
                        fixedHeader
                        fixedHeaderScrollHeight="400px"
                        noDataComponent={
                          <div className="text-center py-4 text-muted">
                            No active subscriptions found
                          </div>
                        }
                      />
                    )}
                  </TabPane>
                  <TabPane tabId="2">
                    {error ? (
                      <Alert color="danger">{error}</Alert>
                    ) : loading ? (
                      <div className="text-center py-4">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading data...</p>
                      </div>
                    ) : isMobile ? (
                      // Mobile Card Layout
                      <div>
                        {getFilteredUsers(false).length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No cancelled/inactive subscriptions found
                          </div>
                        ) : (
                          getFilteredUsers(false).map((user) => (
                            <MobileSubscriptionCard
                              key={user.id}
                              user={user}
                              subscribed={false}
                            />
                          ))
                        )}
                      </div>
                    ) : (
                      // Desktop Table Layout
                      <DataTable
                        columns={desktopColumns}
                        data={getFilteredUsers(false)}
                        pagination
                        responsive
                        highlightOnHover
                        fixedHeader
                        fixedHeaderScrollHeight="400px"
                        noDataComponent={
                          <div className="text-center py-4 text-muted">
                            No cancelled/inactive subscriptions found
                          </div>
                        }
                      />
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal - Made responsive */}
      <Modal
        isOpen={modalOpen}
        toggle={toggleModal}
        size={isMobile ? "lg" : "xl"}
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={toggleModal}>Subscription Details</ModalHeader>
        <ModalBody>
          {selectedSubscription ? (
            <Row>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Provider:</strong>{" "}
                <Badge
                  color={
                    selectedSubscription.provider?.toLowerCase() === "stripe"
                      ? "primary"
                      : "success"
                  }
                  pill
                  className="ml-2"
                >
                  {selectedSubscription.provider?.toUpperCase() || "N/A"}
                </Badge>
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Status:</strong>{" "}
                <Badge
                  color={
                    selectedSubscription.status?.toLowerCase() === "active"
                      ? "success"
                      : "danger"
                  }
                  pill
                  className="ml-2"
                >
                  {selectedSubscription.status?.toUpperCase() || "N/A"}
                </Badge>
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>ID:</strong> {selectedSubscription.id || "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Name:</strong> {selectedSubscription.name || "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Email:</strong> {selectedSubscription.email || "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Phone:</strong> {selectedSubscription.phone || "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>User ID:</strong> {selectedSubscription.userId || "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Payment Method:</strong>{" "}
                {selectedSubscription.paymentMethodId || "N/A"}
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Address:</strong>{" "}
                {selectedSubscription.address || "N/A"}
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Plan:</strong>{" "}
                {selectedSubscription.subscriptionPlan || "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Start Date:</strong>{" "}
                {selectedSubscription.startDate
                  ? new Date(selectedSubscription.startDate).toLocaleString()
                  : "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Expire Date:</strong>{" "}
                {selectedSubscription.expireDate &&
                  selectedSubscription.expireDate !== "N/A"
                  ? new Date(selectedSubscription.expireDate).toLocaleString()
                  : "N/A"}
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <strong>Created At:</strong>{" "}
                {selectedSubscription.createdAt
                  ? new Date(selectedSubscription.createdAt).toLocaleString()
                  : "N/A"}
              </Col>
            </Row>
          ) : (
            <p className="text-center text-muted">
              No subscription data found.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={toggleModal}
            className="w-100 w-sm-auto"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AdminSubscriptions;