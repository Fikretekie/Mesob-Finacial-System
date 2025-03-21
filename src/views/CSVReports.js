import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Table,
  Input,
} from "reactstrap";
import { FaDownload, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import axios from "axios";

const CSVReports = () => {
  const [csvData, setCsvData] = useState(null);
  const [backupUrls, setBackupUrls] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
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
        `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      setDisabled(
        !res.data.user.subscription && res.data.user.scheduleCount >= 4
      );
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

  // const handleDelete = async (url) => {
  //   if (window.confirm("Are you sure you want to delete this backup?")) {
  //     try {
  //       const userId = localStorage.getItem("userId");
  //       await axios.delete(
  //         `https://dzo3qtw4dj.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/backup`,
  //         {
  //           data: { userId, url },
  //         }
  //       );
  //       setBackupUrls(backupUrls.filter((u) => u !== url));
  //     } catch (error) {
  //       console.error("Error deleting backup:", error);
  //     }
  //   }
  // };

  return (
    <div className="content">
      <Card>
        <CardHeader>
          <div
            style={{
              display: "flex",
              marginTop: "30px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CardTitle tag="h4">CSV Report</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {backupUrls.length > 0 ? (
            <Table responsive>
              <thead>
                <tr>
                  <th>Backup File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backupUrls.map((url, index) => (
                  <tr key={index}>
                    <td>{url.split("/").pop()}</td>
                    <td>
                      <Button
                        style={{ marginRight: "10px" }}
                        color="primary"
                        onClick={() => handleDownload(url)}
                        disabled={disabled}
                      >
                        <FaDownload /> Download
                      </Button>
                      {/* <Button color="danger" onClick={() => handleDelete(url)}>
                        <FaTrash /> Delete
                      </Button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No backup CSV files available.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CSVReports;
