import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Spinner,
  Input,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Button,
} from "reactstrap";
import Select from "react-select";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { Helmet } from "react-helmet";
import { FaEye, FaDownload } from "react-icons/fa";
import NotificationAlert from "react-notification-alert";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Receipts = ({ selectedUser }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchedDates, setSearchedDates] = useState(null);
  const notificationAlertRef = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const userRole = parseInt(localStorage.getItem("role") || 1);

  useEffect(() => {
    if (userRole === 0 && !selectedUserId) return;

    fetchReceipts();
  }, [selectedUserId, startDate, endDate, selectedType]);

  useEffect(() => {
    const persistedUserId = localStorage.getItem("selectedUserId");

    if (userRole !== 0) return;
    if (!selectedUserId && !persistedUserId) {
      notify("tr", "Please select a user to view receipts", "warning");
      setLoading(false);
      return;
    }

    if (!selectedUserId && persistedUserId) {
      setSelectedUserId(persistedUserId);
      return;
    }

    if (selectedUserId) {
      fetchReceipts();
    }
  }, [userRole, selectedUserId, startDate, endDate, selectedType]);

  useEffect(() => {
    const checkSubscription = async () => {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      setDisabled(
        userRole !== 1 &&
        !res.data.user.subscription &&
        res.data.user.scheduleCount >= 4
      );
    };
    checkSubscription();
  }, []);

  useEffect(() => {
    if (userRole === 0) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            "https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users"
          );
          setUsers(response.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
          notify("tr", "Error fetching users", "danger");
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const getUserId = () => {
        if (userRole === 0) return selectedUserId;
        return localStorage.getItem("userId");
      };
      const userId = getUserId();
      if (!userId) {
        setReceipts([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Transaction?userId=${userId}`
      );

      let receiptsData = response.data.filter(
        (transaction) =>
          transaction.receiptUrl && transaction.receiptUrl.trim() !== ""
      );

      if (startDate && endDate) {
        receiptsData = receiptsData.filter((receipt) => {
          const receiptDate = new Date(receipt.createdAt);
          return (
            receiptDate >= new Date(startDate) &&
            receiptDate <= new Date(endDate)
          );
        });
      }

      if (selectedType !== "all") {
        receiptsData = receiptsData.filter(
          (receipt) => receipt.transactionType === selectedType
        );
      }
      receiptsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReceipts(receiptsData);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      notify("tr", "Error fetching receipts", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (receipt) => {
    const modifiedUrl = receipt.receiptUrl.replace(
      "app.mesobfinancial.com.s3.amazonaws.com",
      "s3.amazonaws.com/app.mesobfinancial.com"
    );
    setSelectedReceipt({ receiptUrl: modifiedUrl });
    setPreviewModal(true);
  };

  const handleDownload = async (receipt) => {
    try {
      if (!receipt || !receipt.receiptUrl) {
        throw new Error("Invalid receipt or missing URL");
      }

      const url = receipt.receiptUrl.replace(
        "app.mesobfinancial.com.s3.amazonaws.com",
        "s3.amazonaws.com/app.mesobfinancial.com"
      );

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const contentType = response.headers.get("content-type");
      let fileExtension;
      if (contentType.startsWith("image/")) {
        fileExtension = contentType.split("/")[1];
      } else if (contentType === "application/pdf") {
        fileExtension = "pdf";
      } else {
        fileExtension = "bin";
      }

      const blob = await response.blob();
      const fileName = `receipt-${receipt.transactionPurpose || "unknown"
        }-${Date.now()}.${fileExtension}`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      notify("tr", `Error downloading receipt: ${error.message}`, "danger");
    }
  };

  const handleRun = () => {
    if (fromDate && toDate) {
      const startDateTime = new Date(fromDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(toDate);
      endDateTime.setHours(23, 59, 59, 999);

      setStartDate(startDateTime.toISOString());
      setEndDate(endDateTime.toISOString());
      setSearchedDates({ from: fromDate, to: toDate });
    } else {
      notify("tr", "Please select both From and To dates", "warning");
    }
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setStartDate("");
    setEndDate("");
    setSearchedDates(null);
    setSelectedType("all");
  };

  const handleDownloadAll = async () => {
    try {
      if (receipts.length === 0) {
        notify("tr", "No receipts to download.", "warning");
        return;
      }

      notify("tr", "Preparing receipts for download...", "info");

      const zip = new JSZip();

      const downloadPromises = receipts.map((receipt, index) =>
        (async () => {
          try {
            const url = receipt.receiptUrl.replace(
              "app.mesobfinancial.com.s3.amazonaws.com",
              "s3.amazonaws.com/app.mesobfinancial.com"
            );
            const response = await fetch(url, { mode: "cors" });
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            let fileExtension;
            if (contentType) {
              if (contentType.startsWith("image/")) {
                fileExtension = contentType.split("/")[1];
              } else if (contentType === "application/pdf") {
                fileExtension = "pdf";
              } else {
                fileExtension = "bin";
              }
            } else {
              const urlParts = url.split(".");
              fileExtension = urlParts.length > 1 ? urlParts.pop() : "bin";
            }

            const blob = await response.blob();
            const fileName = `receipt-${receipt.transactionPurpose || "unknown"
              }-${index + 1}.${fileExtension}`;

            zip.file(fileName, blob);
          } catch (error) {
            console.error(
              `Error downloading receipt ${receipt.transactionPurpose || index
              }:`,
              error
            );
            notify(
              "tr",
              `Error downloading receipt ${receipt.transactionPurpose || "unknown"
              }: ${error.message}`,
              "danger"
            );
          }
        })()
      );

      await Promise.all(downloadPromises);

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "receipts.zip");
      notify("tr", "All receipts downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading all receipts:", error);
      notify("tr", "Error creating zip file", "danger");
    }
  };

  const notify = (place, message, type) => {
    notificationAlertRef.current.notificationAlert({
      place,
      message: <div>{message}</div>,
      type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    });
  };

  return (
    <>
      <Helmet>
        <title>Receipts - Mesob Finance</title>
      </Helmet>
      <PanelHeader size="sm" />
      <NotificationAlert ref={notificationAlertRef} />
      <div className="content" style={{ paddingInline: 15 }}>
        {userRole === 0 && (
          <Row style={{ margin: "0", paddingInline: 0 }}>
            <Col xs={12} style={{ paddingInline: 0 }}>
              <Card style={{ marginBottom: "5px" }}>
                <CardHeader></CardHeader>
                <CardBody style={{ paddingBottom: "15px" }}>
                  <FormGroup style={{ marginBottom: "0" }}>
                    <Label>Select User to View Receipts:</Label>
                    <Select
                      options={users.map((user) => ({
                        value: user.id,
                        label: user.email,
                      }))}
                      value={
                        users.find((u) => u.id === selectedUserId)
                          ? {
                            value: selectedUserId,
                            label: users.find((u) => u.id === selectedUserId)
                              .email,
                          }
                          : null
                      }
                      onChange={(option) => {
                        const userId = option ? option.value : null;
                        setSelectedUserId(userId);
                        if (userId) {
                          localStorage.setItem("selectedUserId", userId);
                        } else {
                          localStorage.removeItem("selectedUserId");
                        }
                      }}
                      isClearable
                      isSearchable
                      placeholder="Select or search user receipts"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: "38px",
                          height: "38px",
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                          padding: "0 6px",
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: "0px",
                        }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: "38px",
                        }),
                      }}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <CardTitle tag="h4" className="mb-0">
                    Receipts
                  </CardTitle>
                  {/* <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <FormGroup className="mb-0 flex-fill">
                        <Label for="fromDate" className="mb-1">
                          From
                        </Label>
                        <Input
                          type="date"
                          id="fromDate"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-100"
                        />
                      </FormGroup>
                      <FormGroup className="mb-0 flex-fill">
                        <Label for="toDate" className="mb-1">
                          To
                        </Label>
                        <Input
                          type="date"
                          id="toDate"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-100"
                        />
                      </FormGroup>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
                      <Button
                        color="primary"
                        onClick={handleRun}
                        className="flex-fill"
                        style={{ minWidth: "80px" }}
                      >
                        Run
                      </Button>
                      <Button
                        color="secondary"
                        onClick={handleClear}
                        className="flex-fill"
                        style={{ minWidth: "80px" }}
                      >
                        Clear
                      </Button>
                      <Button
                        color="info"
                        onClick={handleDownloadAll}
                        disabled={disabled}
                        className="flex-fill"
                        style={{ minWidth: "80px" }}
                      >
                        Download All
                      </Button>
                    </div>
                  </div> */}
                  <div className="d-flex flex-column flex-lg-row gap-3 w-100 align-items-lg-end">
                    <div className="d-flex flex-column flex-sm-row gap-3 flex-lg-grow-1">
                      <FormGroup className="mb-0 flex-fill p-2" >
                        <Label for="fromDate" className="mb-1">
                          From
                        </Label>
                        <Input
                          type="date"
                          id="fromDate"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-100"
                        />
                      </FormGroup>
                      <FormGroup className="mb-0 flex-fill p-2">
                        <Label for="toDate" className="mb-1">
                          To
                        </Label>
                        <Input
                          type="date"
                          id="toDate"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-100"
                        />
                      </FormGroup>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        onClick={handleRun}
                        style={{ minWidth: "90px" }}
                      >
                        Run
                      </Button>
                      <Button
                        color="secondary"
                        onClick={handleClear}
                        style={{ minWidth: "90px" }}
                      >
                        Clear
                      </Button>
                      <Button
                        color="info"
                        onClick={handleDownloadAll}
                        disabled={disabled}
                        style={{ minWidth: "120px" }}
                      >
                        Download All
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {userRole === 0 && !selectedUserId && (
                  <div className="text-center my-4 text-muted">
                    Please select a user to view receipts.
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading receipts...</p>
                  </div>
                ) : receipts.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No receipts found</p>
                  </div>
                ) : (
                  <>
                    {searchedDates && (
                      <div className="mb-3">
                        <strong>Searched dates:</strong> {searchedDates.from} -{" "}
                        {searchedDates.to}
                      </div>
                    )}

                    {/* Desktop Table */}
                    <div className="d-none d-md-block">
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Purpose</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receipts.map((receipt) => (
                            <tr key={receipt.id || receipt.receiptUrl}>
                              <td>
                                {new Date(
                                  receipt.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td>{receipt.transactionPurpose}</td>
                              <td>${receipt.transactionAmount}</td>
                              <td>{receipt.transactionType}</td>
                              <td>{receipt.subType || "-"}</td>
                              <td>
                                <FaEye
                                  onClick={
                                    !disabled
                                      ? () => handlePreview(receipt)
                                      : undefined
                                  }
                                  style={{
                                    cursor: disabled
                                      ? "not-allowed"
                                      : "pointer",
                                    marginRight: "1rem",
                                  }}
                                  title="Preview"
                                />
                                <FaDownload
                                  onClick={
                                    !disabled
                                      ? () => handleDownload(receipt)
                                      : undefined
                                  }
                                  style={{
                                    cursor: disabled
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="d-block d-md-none">
                      {receipts.map((receipt) => (
                        <Card
                          key={receipt.id || receipt.receiptUrl}
                          className="mb-3"
                        >
                          <CardBody>
                            <Row>
                              <Col xs={6}>
                                <strong>Date:</strong>
                              </Col>
                              <Col xs={6}>
                                {new Date(
                                  receipt.createdAt
                                ).toLocaleDateString()}
                              </Col>
                            </Row>
                            <Row className="mt-2">
                              <Col xs={6}>
                                <strong>Purpose:</strong>
                              </Col>
                              <Col xs={6}>{receipt.transactionPurpose}</Col>
                            </Row>
                            <Row className="mt-2">
                              <Col xs={6}>
                                <strong>Amount:</strong>
                              </Col>
                              <Col xs={6}>${receipt.transactionAmount}</Col>
                            </Row>
                            <Row className="mt-2">
                              <Col xs={6}>
                                <strong>Type:</strong>
                              </Col>
                              <Col xs={6}>{receipt.transactionType}</Col>
                            </Row>
                            <Row className="mt-2">
                              <Col xs={6}>
                                <strong>Category:</strong>
                              </Col>
                              <Col xs={6}>{receipt.subType || "-"}</Col>
                            </Row>
                            <Row className="mt-3">
                              <Col xs={12}>
                                <div className="d-flex justify-content-center gap-3">
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={
                                      !disabled
                                        ? () => handlePreview(receipt)
                                        : undefined
                                    }
                                    disabled={disabled}
                                  >
                                    <FaEye className="me-1" />
                                    Preview
                                  </Button>
                                  <Button
                                    color="info"
                                    size="sm"
                                    onClick={
                                      !disabled
                                        ? () => handleDownload(receipt)
                                        : undefined
                                    }
                                    disabled={disabled}
                                  >
                                    <FaDownload className="me-1" />
                                    Download
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        isOpen={previewModal}
        toggle={() => setPreviewModal(false)}
        size="lg"
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={() => setPreviewModal(false)}>
          Receipt Preview
        </ModalHeader>
        <ModalBody>
          {selectedReceipt && selectedReceipt.receiptUrl && (
            <>
              {selectedReceipt.receiptUrl.endsWith(".pdf") ? (
                <object
                  data={selectedReceipt.receiptUrl}
                  type="application/pdf"
                  width="100%"
                  height="500px"
                >
                  <p>
                    Your browser does not support PDFs.{" "}
                    <a
                      href={selectedReceipt.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View PDF
                    </a>
                  </p>
                </object>
              ) : (
                <img
                  src={selectedReceipt.receiptUrl}
                  alt="Receipt"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    margin: "0 auto",
                    objectFit: "contain",
                  }}
                />
              )}
            </>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default Receipts;
