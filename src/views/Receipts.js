import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const fetchReceipts = async () => {
    try {
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/receipts?userId=${userId}`
      );
      setReceipts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Receipts - Mesob Finance</title>
      </Helmet>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Transaction Receipts</CardTitle>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading receipts...</p>
                  </div>
                ) : (
                  <Row>
                    {receipts.map((receipt, index) => (
                      <Col md={4} key={index}>
                        <Card>
                          <CardBody>
                            <h5>{receipt.transactionPurpose}</h5>
                            <p>
                              Date:{" "}
                              {new Date(receipt.createdAt).toLocaleDateString()}
                            </p>
                            <p>Amount: ${receipt.transactionAmount}</p>
                            <img
                              src={receipt.receiptUrl}
                              alt="Receipt"
                              style={{
                                width: "100%",
                                height: "auto",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                window.open(receipt.receiptUrl, "_blank")
                              }
                            />
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Receipts;
