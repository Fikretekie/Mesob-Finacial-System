import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Spinner,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ButtonGroup,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const userId = localStorage.getItem("userId");

  const fetchReceipts = async () => {
    try {
      const response = await axios.get(
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      );

      let receiptsData = Array.from(
        new Map(
          response.data
            .filter(
              (transaction) =>
                transaction.receiptUrl && transaction.receiptUrl.trim() !== ""
            )
            .map((item) => [item.receiptUrl, item])
        ).values()
      );

      // Apply date filter if dates are selected
      if (startDate && endDate) {
        receiptsData = receiptsData.filter((receipt) => {
          const receiptDate = new Date(receipt.createdAt);
          return (
            receiptDate >= new Date(startDate) &&
            receiptDate <= new Date(endDate)
          );
        });
      }

      // Apply type filter
      if (selectedType !== "all") {
        receiptsData = receiptsData.filter(
          (receipt) => receipt.transactionType === selectedType
        );
      }

      setReceipts(receiptsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [startDate, endDate, selectedType]);

  const handlePreview = (receipt) => {
    const modifiedUrl = receipt.receiptUrl.replace(
      "app.mesobfinancial.com.s3.amazonaws.com",
      "s3.amazonaws.com/app.mesobfinancial.com"
    );
    setSelectedReceipt({ ...receipt, receiptUrl: modifiedUrl });
    setPreviewModal(true);
  };

  const handleDownload = async (receipt) => {
    try {
      // Use https:// instead of http://
      const url = receipt.receiptUrl.replace(
        "app.mesobfinancial.com.s3.amazonaws.com",
        "s3.amazonaws.com/app.mesobfinancial.com"
      );

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `receipt-${
        receipt.transactionPurpose
      }-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  const handleDownloadAll = async () => {
    try {
      for (const receipt of receipts) {
        await handleDownload(receipt);
      }
    } catch (error) {
      console.error("Error downloading all receipts:", error);
    }
  };

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
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <CardTitle tag="h4">Transaction Receipts</CardTitle>
                  <div className="d-flex gap-3 align-items-center flex-wrap">
                    <Input
                      type="select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      <option value="all">All Types</option>
                      <option value="Pay">Pay</option>
                      <option value="Receive">Receive</option>
                      <option value="Payable">Payable</option>
                    </Input>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start Date"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End Date"
                    />
                    <Button color="primary" onClick={handleDownloadAll}>
                      Download All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner color="primary" />
                    <p>Loading receipts...</p>
                  </div>
                ) : receipts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p>No receipts found</p>
                  </div>
                ) : (
                  <Row>
                    {receipts.map((receipt) => (
                      <Col md={4} key={receipt.id || receipt.receiptUrl}>
                        <Card className="mb-4">
                          <CardBody>
                            <h5>{receipt.transactionPurpose}</h5>
                            <p>
                              Date:{" "}
                              {new Date(receipt.createdAt).toLocaleDateString()}
                            </p>
                            <p>Amount: ${receipt.transactionAmount}</p>
                            <p>Type: {receipt.transactionType}</p>
                            {receipt.subType && (
                              <p>Category: {receipt.subType}</p>
                            )}
                            <div className="receipt-actions">
                              <ButtonGroup className="w-100">
                                <Button
                                  style={{ marginRight: "10px" }}
                                  color="info"
                                  onClick={() => handlePreview(receipt)}
                                >
                                  Preview
                                </Button>
                                <Button
                                  color="primary"
                                  onClick={() => handleDownload(receipt)}
                                >
                                  Download
                                </Button>
                              </ButtonGroup>
                            </div>
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

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        toggle={() => setPreviewModal(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setPreviewModal(false)}>
          Receipt Preview
        </ModalHeader>
        <ModalBody>
          {selectedReceipt && (
            <div className="receipt-preview">
              <object
                data={selectedReceipt.receiptUrl}
                type="application/pdf"
                style={{
                  width: "100%",
                  height: "600px",
                }}
              >
                <embed
                  src={selectedReceipt.receiptUrl}
                  type="application/pdf"
                  style={{
                    width: "100%",
                    height: "600px",
                  }}
                />
              </object>
            </div>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default Receipts;
