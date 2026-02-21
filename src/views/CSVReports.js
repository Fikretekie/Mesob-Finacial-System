import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Table,
  Row,
  Col,
} from "reactstrap";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import { useTranslation } from "react-i18next";

const CSVReports = () => {
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState(null);
  const [backupUrls, setBackupUrls] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
        );
        if (response.data.user && response.data.user.lastBackupUrls) {
          setBackupUrls(response.data.user.lastBackupUrls);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      const { subscription, scheduleCount, userRole } = res.data.user;
      setDisabled(!(subscription || userRole === 1) && scheduleCount >= 4);
    };
    checkSubscription();
  }, []);

  const handleDownload = async (url) => {
    try {
      // Replace virtual-hosted style URL with path-style URL
      const updatedUrl = url.replace(
        /https:\/\/(.+?)\.s3\.amazonaws\.com\//,
        "https://s3.amazonaws.com/$1/"
      );

      const response = await axios.get(updatedUrl, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = updatedUrl.split("/").pop();
      link.click();
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  // Mobile Card Component
  const MobileBackupCard = ({ url, index }) => {
    const fileName = url.split("/").pop();
    return (
      <div
        style={{
          background: "#1c1e3d",
          border: "1px solid rgba(59, 130, 246, 0.15)",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1rem",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.45)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.15)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* File Number */}
        <p
          style={{
            color: "#64748b",
            fontSize: "0.75rem",
            margin: "0 0 0.5rem 0",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Backup {index + 1}
        </p>

        {/* File Name */}
        <p
          style={{
            color: "#e2e8f0",
            fontSize: "clamp(0.8rem, 3.5vw, 0.95rem)",
            fontWeight: "500",
            margin: "0 0 1rem 0",
            lineHeight: 1.4,
            wordBreak: "break-all",
          }}
        >
          {fileName}
        </p>

        {/* Download Button */}
        <Button
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontWeight: "600",
            fontSize: "clamp(0.85rem, 3vw, 0.95rem)",
            padding: "0.75rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onClick={() => handleDownload(url)}
          disabled={disabled}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaDownload size={16} />
          {t("backupCSV.download")}
        </Button>

        {disabled && (
          <p
            style={{
              color: "#f87171",
              fontSize: "0.75rem",
              marginTop: "0.75rem",
              textAlign: "center",
            }}
          >
            {t("backupCSV.limitReached")}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="content"
        style={{
          marginTop: isMobile ? "80px" : "60px",
          paddingInline: isMobile ? "1.25rem" : "1.5rem",
          paddingBlock: "1.5rem",
          backgroundColor: "#101926",
          minHeight: "100vh",
        }}
      >
        <Row>
          <Col xs={12} style={{ paddingInline: 0 }}>
            {/* Mobile View */}
            {isMobile ? (
              <div>
                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      color: "#ffffff",
                      fontSize: "clamp(1.3rem, 5vw, 1.6rem)",
                      fontWeight: "700",
                      margin: "0 0 0.5rem 0",
                      lineHeight: 1.2,
                    }}
                  >
                    {t("backupCSV.title")}
                  </h2>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      margin: 0,
                    }}
                  >
                    {backupUrls.length} {backupUrls.length === 1 ? "file" : "files"} available
                  </p>
                </div>

                {/* Backup Cards */}
                {backupUrls.length > 0 ? (
                  <div>
                    {backupUrls.map((url, index) => (
                      <MobileBackupCard key={index} url={url} index={index} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      borderRadius: "12px",
                      padding: "2rem 1.5rem",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.95rem",
                        margin: 0,
                      }}
                    >
                      {t("backupCSV.noBackups")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop View - Original Table */
              <Card
                style={{
                  backgroundColor: "#101926",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)",
                  borderRadius: "8px",
                }}
              >
                <CardHeader style={{ backgroundColor: "#101926" }}>
                  <div
                    style={{
                      display: "flex",
                      marginTop: "5px",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <CardTitle tag="h4" style={{ color: "#2b427d" }}>
                      {t("backupCSV.title")}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardBody style={{ backgroundColor: "#101926" }}>
                  {backupUrls.length > 0 ? (
                    <Table responsive style={{ backgroundColor: "#101926" }}>
                      <thead>
                        <tr>
                          <th style={{ color: "#ffffff", borderColor: "#3a4555" }}>
                            {t("backupCSV.backupFile")}
                          </th>
                          <th style={{ color: "#ffffff", borderColor: "#3a4555" }}>
                            {t("backupCSV.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {backupUrls.map((url, index) => (
                          <tr key={index} style={{ borderColor: "#3a4555" }}>
                            <td style={{ color: "#ffffff", borderColor: "#3a4555" }}>
                              {url.split("/").pop()}
                            </td>
                            <td style={{ borderColor: "#3a4555" }}>
                              <Button
                                style={{ marginRight: "10px" }}
                                color="primary"
                                onClick={() => handleDownload(url)}
                                disabled={disabled}
                              >
                                <FaDownload /> {t("backupCSV.download")}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p style={{ color: "#ffffff" }}>
                      {t("backupCSV.noBackups")}
                    </p>
                  )}
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CSVReports;