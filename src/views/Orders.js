import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardBody,
  CardTitle,
  Row,
  Col,
  Input,
  Spinner,
  // Dropdown,
  // DropdownToggle,
  // DropdownMenu,
  // DropdownItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Popover,
  PopoverBody,
  Button,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import formatDate from "utils/formatDate";
import { Helmet } from "react-helmet";
import classnames from "classnames"; // For managing tab active class
import formatUserId from "utils/formatUID";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const Orders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [activeTab, setActiveTab] = useState("1"); // State to manage active tab
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/items")
      .then((response) => {
        if (response.data) {
          setItems(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the items!", error);
      });
  }, []);

  // Separate filters based on adminStatus
  const succeededOrders = items.filter(
    (item) => item.adminStatus === "Succeeded"
  );
  const attemptsOrders = items.filter(
    (item) => item.adminStatus === "Attempts" || item.adminStatus == null
  );
  const closedOrders = items.filter((item) => item.adminStatus === "Closed");


  // Apply search filtering based on searchTerm for each table
  const filteredSucceededOrders = succeededOrders.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttemptsOrders = attemptsOrders.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClosedOrders = closedOrders.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = (id) => {
    setDropdownOpen((prevId) => (prevId === id ? null : id));
  };

  const handleView = (id) => {
    navigate(`/admin/order/details/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/order/edit/${id}`);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const columns = [
    {
      name: "User ID",
      selector: (row) => row.id,
      sortable: true,
      width: "150px",
      cell: (row) => <UserIdCell userId={row.id} />,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone ?? "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "City",
      selector: (row) => row.city ?? "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Is Sender",
      selector: (row) => (row.isSender === true ? "Yes" : "No"),
      sortable: true,
      width: "120px",
    },
    {
      name: "Created At",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
      width: "200px",
    },
    // {
    //   name: "Actions",
    //   cell: (row) => (
    //     <Dropdown
    //       isOpen={dropdownOpen === row.id}
    //       toggle={() => toggleDropdown(row.id)}
    //     >
    //       <DropdownToggle color="dark" size="sm" caret>
    //         Actions
    //       </DropdownToggle>
    //       <DropdownMenu>
    //         <DropdownItem onClick={() => handleView(row.id)}>View</DropdownItem>
    //         <DropdownItem onClick={() => handleEdit(row.id)}>Edit</DropdownItem>
    //       </DropdownMenu>
    //     </Dropdown>
    //   ),
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
    // },
    {
      name: "Assign",
      cell: (row) => {
        if (row.assignedEmail || row.assignedName) {
          return (
            <Button
              className="btn btn-info btn-round btn-sm"
              onClick={() => handleEdit(row.id)}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              {row.assignedName || row.assignedEmail}
            </Button>
          );
        } else {
          return (
            <Button
              className="btn btn-info btn-round btn-sm"
              onClick={() => handleEdit(row.id)}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Assign
            </Button>
          );
        }
      },
      width: "150px",
    },
  ];

  function UserIdCell({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const targetRef = useRef(null);

    const toggle = () => setIsOpen(!isOpen);

    return (
      <div>
        <span ref={targetRef} onMouseEnter={toggle} onMouseLeave={toggle}>
          {formatUserId(userId)}
        </span>
        <Popover
          placement="right"
          isOpen={isOpen}
          target={targetRef}
          toggle={toggle}
          trigger="hover"
        >
          <PopoverBody>{userId}</PopoverBody>
        </Popover>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Orders - Mesob Store</title>
      </Helmet>

      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Orders</h2>
          </div>
        }
      />

      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardBody>
                {/* Tabs */}
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => toggleTab("1")}
                    >
                      Succeeded Orders
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => toggleTab("2")}
                    >
                      Attempts Orders
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => toggleTab("3")}
                    >
                      Closed Orders
                    </NavLink>
                  </NavItem>
                </Nav>

                {/* Tab Content */}
                <TabContent activeTab={activeTab}>
                  {/* Tab 1: Succeeded Orders */}
                  <TabPane tabId="1">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardTitle tag="h4">Succeeded Orders</CardTitle>
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "10px", width: "250px" }}
                      />
                    </div>
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner color="primary" />
                        <p>Loading orders...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredSucceededOrders}
                        selectableRows
                        responsive
                        fixedHeader={true}
                        pagination
                        paginationPerPage={100}
                        paginationRowsPerPageOptions={[
                          100, 200, 300, 500, 1000,
                        ]}
                        highlightOnHover
                      />
                    )}
                  </TabPane>

                  {/* Tab 2: Attempts Orders */}
                  <TabPane tabId="2">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardTitle tag="h4">Attempts Orders</CardTitle>
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "10px", width: "250px" }}
                      />
                    </div>
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner color="primary" />
                        <p>Loading orders...</p>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredAttemptsOrders}
                        selectableRows
                        responsive
                        fixedHeader={true}
                        pagination
                        paginationPerPage={100}
                        paginationRowsPerPageOptions={[
                          100, 200, 300, 500, 1000,
                        ]}
                        highlightOnHover
                      />
                    )}
                  </TabPane>

                  {/* Tab 3: Closed Orders */}
                  <TabPane tabId="3">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardTitle tag="h4">Closed Orders</CardTitle>
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "10px", width: "250px" }}
                      />
                    </div>
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spinner color="primary" />
                        <p>Loading orders...</p>
                      </div>
                    ) : (
                      <>
                      
                   
                      <DataTable
                        columns={columns}
                        data={filteredClosedOrders}
                        selectableRows
                        responsive
                        fixedHeader={true}
                        pagination
                        paginationPerPage={100}
                        paginationRowsPerPageOptions={[
                          100, 200, 300, 500, 1000,
                        ]}
                        highlightOnHover
                      />
                         </>
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Orders;
