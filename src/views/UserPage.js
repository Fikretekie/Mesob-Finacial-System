import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Alert,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";

function UserPage() {
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    companyName: "",
    businessType: "",
    cashBalance: "",
    outstandingDebt: "",
    valueableItems: "",
    role: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editDisabled, setEditDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
        );
        console.log("api response", response);
        const user = response.data?.user;
        if (user) {
          // Save both the current and the original copy
          const fullUser = { ...user, id: userId };
          setUserData(fullUser);
          setOriginalData(fullUser);
          // setUserData({ ...user, id: userId });
          setIsCustomer(user.role === 2 || user.role === 1);
        } else {
          setUserData({ id: userId });
          setIsCustomer(false);
          setError("User data not found. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    const fetchSubscription = async () => {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      // Use optional chaining and sensible defaults
      setEditDisabled(
        !res.data?.user?.subscription &&
        (res.data?.user?.scheduleCount ?? 0) >= 4
      );
    };
    fetchSubscription();
  }, []);

  // Discard changes → restore original data
  const handleDiscard = () => {
    setUserData(originalData);
    setIsEditing(false);
    setHasChanges(false);
    setSuccess(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && hasChanges) {
      try {
        const { id, ...updateFields } = userData;

        console.log("Sending update request for ID:", id);
        console.log("Payload:", updateFields);

        const response = await axios.put(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${id}`,
          updateFields
        );

        console.log("Update response:", response.data);
        setIsEditing(false);
        setHasChanges(false);
        setSuccess("Profile updated successfully!");
        setError(null);
      } catch (error) {
        console.error(
          "Error updating user data:",
          error.response?.data || error.message
        );
        setError("Failed to update profile. Please try again.");
        setSuccess(null);
      }
    } else {
      setIsEditing(true);
    }
  };
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const userId = localStorage.getItem("userId");
      await axios.delete(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      localStorage.clear(); // Clear user data
      alert("Account deleted successfully.");
      navigate("/login"); // Redirect to login or homepage
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete account. Please try again.");
    }
  };

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md="8" style={{ paddingInline: 0 }}>
            <Card>
              <CardHeader>
                <h5 className="title">User Profile</h5>
              </CardHeader>
              <CardBody>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row >
                    <Col className="pr-1" md="6" >
                      <FormGroup>
                        <label>Name</label>
                        <Input
                          name="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label>Email address</label>
                        <Input
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="email"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="6">
                      <FormGroup>
                        <label>Phone</label>
                        <Input
                          name="phone"
                          value={userData.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label>Company Name</label>
                        <Input
                          name="companyName"
                          value={userData.companyName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {/* <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Business Type</label>
                        <Input
                          name="businessType"
                          value={userData.businessType}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row> */}
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Business Type</label>
                        {isEditing ? (
                          <Input
                            type="select"
                            name="businessType"
                            value={userData.businessType || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Business Type</option>
                            <option value="Trucking">Trucking</option>
                            <option value="RIDESHARE DRIVERS/PARTNERS">
                              RIDESHARE DRIVERS/PARTNERS
                            </option>
                            <option value="Groceries">Groceries</option>
                            <option value="Individual/Households">
                              Individual/Households
                            </option>
                            <option value="Resturant/Cafe">Resturant/Cafe</option>
                            <option value="Cleaning Services">Cleaning Services</option>
                            <option value="Beauty & Grooming">
                              Beauty & Grooming (Salons, Barbershops)
                            </option>
                            <option value="E-commerce Sellers">
                              E-commerce Sellers (Shopify, Amazon, Etsy)
                            </option>
                            <option value="Construction Trades">
                              Construction Trades (Plumbing, Electrical, Painting, etc.)
                            </option>
                            <option value="Content Creator">Content Creator</option>
                            <option value="Other">Other Businesses</option>
                          </Input>
                        ) : (
                          <Input
                            value={userData.businessType || "—"}
                            disabled
                            type="text"
                            placeholder="Not specified"
                          />
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup>
                        <label>Cash Balance</label>
                        <Input
                          name="cashBalance"
                          value={userData.cashBalance}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="4">
                      <FormGroup>
                        <label>Outstanding Debt</label>
                        <Input
                          name="outstandingDebt"
                          value={userData.outstandingDebt}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label>Valuable Items</label>
                        <Input
                          name="valueableItems"
                          value={userData.valueableItems}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {/* {isCustomer && (
                    <>
                      {isEditing && hasChanges && (
                        <Row>
                          <Col md="12">
                            <Button color="success" type="submit">
                              Save Changes
                            </Button>
                          </Col>
                        </Row>
                      )}
                      {(!isEditing || !hasChanges) && (
                        <Row>
                          <Col md="12">
                            <Button
                              color="primary"
                              onClick={() => setIsEditing(true)}
                              disabled={editDisabled}
                            >
                              Edit Profile
                            </Button>
                          </Col>
                        </Row>
                      )}
                      {isCustomer && (
                        <Row className="mt-3">
                          <Col md="12">
                            <Button color="danger" onClick={handleDelete}>
                              Delete Account
                            </Button>
                          </Col>
                        </Row>
                      )}
                    </>
                  )} */}
                  {isCustomer && (
                    <>
                      {/* Save + Discard when editing and there are changes */}
                      {isEditing && hasChanges && (
                        <Row>
                          <Col md="12">
                            <Button color="success" type="submit">
                              Save Changes
                            </Button>
                            <Button
                              color="secondary"
                              className="ml-2"
                              onClick={handleDiscard}
                            >
                              Discard
                            </Button>
                          </Col>
                        </Row>
                      )}

                      {/* Edit button when NOT editing or no changes */}
                      {(!isEditing || !hasChanges) && (
                        <Row>
                          <Col md="12">
                            <Button
                              color="primary"
                              onClick={() => setIsEditing(true)}
                              disabled={editDisabled}
                            >
                              Edit Profile
                            </Button>
                          </Col>
                        </Row>
                      )}

                      {/* Delete account button */}
                      <Row className="mt-3">
                        <Col md="12">
                          <Button color="danger" onClick={handleDelete}>
                            Delete Account
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default UserPage;
