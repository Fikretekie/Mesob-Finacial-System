import React, { useState, useEffect } from "react";
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
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
        );
        setUserData({ ...response.data.user, id: userId });
        setIsCustomer(response.data.user.role === 2);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    fetchUserData();
  }, []);

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
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${id}`,
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

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col md="8">
            <Card>
              <CardHeader>
                <h5 className="title">User Profile</h5>
              </CardHeader>
              <CardBody>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col className="pr-1" md="6">
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
                          value={userData.phone}
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
                  <Row>
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
                  {isCustomer && (
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
                            >
                              Edit Profile
                            </Button>
                          </Col>
                        </Row>
                      )}
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
