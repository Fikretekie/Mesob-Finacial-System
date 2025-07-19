import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Spinner,
  Button,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";
import { Helmet } from "react-helmet";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "../store/userSlice";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const notificationAlertRef = useRef(null);
  const dispatch = useDispatch();

  const handleUserSelect = (user) => {
    dispatch(setSelectedUser({ id: user.id, email: user.email }));
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
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      name: "Select",
      cell: (row) => (
        <Button color="primary" size="sm" onClick={() => handleUserSelect(row)}>
          Select
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "100px",
    },
  ];
  const notify = (place, message, type) => {
    const options = {
      place: place,
      message: <div>{message}</div>,
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (response.data) {
          setUsers(Array.isArray(response.data) ? response.data : []);
          console.log("response data", response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        notify(
          "tr",
          error.response?.data?.message || "Failed to fetch users",
          "danger"
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredData = users.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      item.email?.toLowerCase().includes(searchTermLower) ||
      item.id?.toString().toLowerCase().includes(searchTermLower) ||
      item.name?.toLowerCase().includes(searchTermLower) ||
      item.companyName?.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <>
      <Helmet>
        <title>Users - Mesob Finance</title>
      </Helmet>

      <PanelHeader size="sm" />
      <NotificationAlert ref={notificationAlertRef} />
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
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button color="secondary" className="btn-round btn-sm">
                      Users <span className="ml-2">({users.length})</span>
                    </Button>
                    <Input
                      type="text"
                      placeholder="Search by email, user ID, or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ marginLeft: "10px", width: "250px" }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {error ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "red",
                    }}
                  >
                    {error}
                  </div>
                ) : loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    responsive
                    highlightOnHover
                    fixedHeader
                    noDataComponent="No users found"
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Users;
