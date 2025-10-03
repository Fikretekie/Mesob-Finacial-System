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

  // useEffect(() => {
  //   if (selectedUser?.id) {
  //     fetchReceipts();
  //   }
  // }, [selectedUser, startDate, endDate, selectedType]);

  useEffect(() => {
    if (userRole === 0 && !selectedUserId) return; // admin must pick user

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
        !res.data.user.subscription && res.data.user.scheduleCount >= 4
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

  // const handlePreview = async (receipt) => {
  //   console.log("recerpt=>>", receipt);

  //    setSelectedReceipt(receipt);
  //   setPreviewModal(true);
  // };

  // const handlePreview = async (receipt) => {
  //   console.log("Receipt URL:", receipt.receiptUrl); // Debugging: Check the URL
  //   setSelectedReceipt(receipt); // Update state

  //   setPreviewModal(true); // Open modal
  // };
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
      // Create proper date objects with time handling
      const startDateTime = new Date(fromDate);
      startDateTime.setHours(0, 0, 0, 0); // Start of day

      const endDateTime = new Date(toDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day

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

  // const handleDownloadAll = async () => {
  //   try {
  //     if (receipts.length === 0) {
  //       notify("tr", "No receipts to download.", "warning");
  //       return;
  //     }

  //     notify("tr", "Preparing receipts for download...", "info");

  //     const zip = new JSZip();

  //     await Promise.all(
  //       receipts.map(async (receipt, index) => {
  //         try {
  //           const url = receipt.receiptUrl;
  //           const response = await fetch(url, {
  //             mode: "cors",
  //           });
  //           if (!response.ok) {
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //           }

  //           const blob = await response.blob();
  //           zip.file(
  //             `receipt-${receipt.transactionPurpose}-${index + 1}.pdf`,
  //             blob
  //           );
  //         } catch (error) {
  //           console.error(
  //             `Error downloading receipt ${receipt.transactionPurpose}:`,
  //             error
  //           );
  //           notify(
  //             "tr",
  //             `Error downloading receipt ${receipt.transactionPurpose}: ${error.message}`,
  //             "danger"
  //           );
  //         }
  //       })
  //     );

  //     zip
  //       .generateAsync({ type: "blob" })
  //       .then((blob) => {
  //         saveAs(blob, "receipts.zip");
  //         notify("tr", "All receipts downloaded successfully!", "success");
  //       })
  //       .catch((error) => {
  //         console.error("Error creating zip file:", error);
  //         notify("tr", "Error creating zip file", "danger");
  //       });
  //   } catch (error) {
  //     console.error("Error downloading all receipts:", error);
  //     notify("tr", "Error downloading all receipts", "danger");
  //   }
  // };



  // const handleDownloadAll = async () => {
  //   try {
  //     if (receipts.length === 0) {
  //       notify("tr", "No receipts to download.", "warning");
  //       return;
  //     }

  //     notify("tr", "Preparing receipts for download...", "info");

  //     const zip = new JSZip();

  //     const downloadPromises = receipts.map((receipt, index) =>
  //       (async () => {
  //         try {
  //           const url = receipt.receiptUrl.replace(
  //             "app.mesobfinancial.com.s3.amazonaws.com",
  //             "s3.amazonaws.com/app.mesobfinancial.com"
  //           );
  //           const response = await fetch(url, { mode: "cors" });
  //           if (!response.ok) {
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //           }

  //           const blob = await response.blob();
  //           zip.file(
  //             `receipt-${receipt.transactionPurpose || "unknown"}-${index + 1}.pdf`,
  //             blob
  //           );
  //         } catch (error) {
  //           console.error(
  //             `Error downloading receipt ${receipt.transactionPurpose || index}:`,
  //             error
  //           );
  //           notify(
  //             "tr",
  //             `Error downloading receipt ${receipt.transactionPurpose || "unknown"}: ${error.message}`,
  //             "danger"
  //           );
  //         }
  //       })()
  //     );

  //     await Promise.all(downloadPromises);

  //     const blob = await zip.generateAsync({ type: "blob" });
  //     saveAs(blob, "receipts.zip");
  //     notify("tr", "All receipts downloaded successfully!", "success");
  //   } catch (error) {
  //     console.error("Error downloading all receipts:", error);
  //     notify("tr", "Error creating zip file", "danger");
  //   }
  // };


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
                fileExtension = "bin"; // Default for unknown types
              }
            } else {
              // Fallback: Extract extension from URL if available
              const urlParts = url.split('.');
              fileExtension = urlParts.length > 1 ? urlParts.pop() : "bin";
            }

            const blob = await response.blob();
            const fileName = `receipt-${receipt.transactionPurpose || "unknown"}-${index + 1}.${fileExtension}`;

            zip.file(fileName, blob);
          } catch (error) {
            console.error(
              `Error downloading receipt ${receipt.transactionPurpose || index}:`,
              error
            );
            notify(
              "tr",
              `Error downloading receipt ${receipt.transactionPurpose || "unknown"}: ${error.message}`,
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
      <div className="content">
        {userRole === 0 && (
          <Row style={{ margin: "0" }}>
            <Col xs={12}>
              <Card style={{ marginBottom: "20px" }}>
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 25px",
                  }}
                >
                  <CardTitle tag="h4">Transaction Receipts</CardTitle>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-end",
                    }}
                  >
                    <FormGroup style={{ marginBottom: 0 }}>
                      <Label for="fromDate">From</Label>
                      <Input
                        type="date"
                        id="fromDate"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: 0 }}>
                      <Label for="toDate">To</Label>
                      <Input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </FormGroup>
                    <Button
                      color="primary"
                      onClick={handleRun}
                      style={{ marginBottom: 0, height: "38px" }}
                    >
                      Run
                    </Button>
                    <Button
                      color="secondary"
                      onClick={handleClear}
                      style={{ marginBottom: 0, height: "38px" }}
                    >
                      Clear Filters
                    </Button>
                    <Button
                      color="info"
                      onClick={handleDownloadAll}
                      disabled={disabled}
                      style={{ marginBottom: 0, height: "38px" }}
                    >
                      Download All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {userRole === 0 && !selectedUserId && (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "20px 0",
                      color: "gray",
                    }}
                  >
                    Please select a user to view receipts.
                  </div>
                )}

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
                  <>
                    {searchedDates && (
                      <div style={{ marginBottom: "15px" }}>
                        <strong>Searched dates:</strong> {searchedDates.from} -{" "}
                        {searchedDates.to}
                      </div>
                    )}
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
                              {new Date(receipt.createdAt).toLocaleDateString()}
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
                                  cursor: disabled ? "not-allowed" : "pointer",
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
                                  cursor: disabled ? "not-allowed" : "pointer",
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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
                  height="600px"
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
