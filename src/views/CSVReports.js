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
import PanelHeader from "components/PanelHeader/PanelHeader";
import LanguageSelector from "components/Languageselector/LanguageSelector";
import { useTranslation } from "react-i18next";

const CSVReports = () => {
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState(null);
  const [backupUrls, setBackupUrls] = useState([]);
  const [disabled, setDisabled] = useState(false);

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

  return (
    <>
<PanelHeader
  size="sm"
  content={
    <Row className="w-100">
      <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-start">
        <LanguageSelector />
      </Col>
    </Row>
  }
/>
      <div className="content" style={{ paddingInline: 15, backgroundColor: "#101926" }}>
        <Row>
        
          <Col xs={12} style={{ paddingInline: 0 }}>
            <Card style={{ backgroundColor: "#101926", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)", borderRadius: "8px" }}>
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
                    {t('backupCSV.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardBody style={{ backgroundColor: "#101926" }}>
                {backupUrls.length > 0 ? (
                  <Table responsive style={{ backgroundColor: "#101926" }}>
                    <thead>
                      <tr>
                        <th style={{ color: "#ffffff", borderColor: "#3a4555" }}>
                          {t('backupCSV.backupFile')}
                        </th>
                        <th style={{ color: "#ffffff", borderColor: "#3a4555" }}>
                          {t('backupCSV.actions')}
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
                              <FaDownload /> {t('backupCSV.download')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ color: "#ffffff" }}>
                    {t('backupCSV.noBackups')}
                  </p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CSVReports;