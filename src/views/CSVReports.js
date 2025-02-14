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

const CSVReports = () => {
  const [csvData, setCsvData] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const storedCsvData = localStorage.getItem("csvData");
    if (storedCsvData) {
      setCsvData(JSON.parse(storedCsvData));
    }
  }, []);

  const handleDownload = () => {
    if (!csvData) {
      alert("No CSV data available to download!");
      return;
    }

    // Check if csvData is a string (CSV format) or an array of objects
    let ws, wb;
    if (typeof csvData === "string") {
      // If it's a string, assume it's in CSV format and parse it
      ws = XLSX.utils.csv_to_sheet(csvData);
      wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FinancialReport");
    } else if (Array.isArray(csvData)) {
      // If it's an array, convert it to a worksheet
      ws = XLSX.utils.json_to_sheet(csvData);
      wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FinancialReport");
    } else {
      alert("Invalid CSV data format.");
      return;
    }

    // Generate Excel file
    XLSX.writeFile(wb, "financial_report.xlsx");
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleCSVUpload(selectedFile);
    }
  };
  const handleDeleteCSV = () => {
    localStorage.removeItem("csvData");
    setCsvData(null);
    setFile(null); // Clear the selected file
  };

  const handleCSVUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binarystr = e.target.result;
        const wb = XLSX.read(binarystr, {
          type: "binary",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Store the CSV data in localStorage
        localStorage.setItem("csvData", JSON.stringify(data));
        setCsvData(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="content">
      <Card>
        <CardHeader>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CardTitle tag="h4">CSV Report</CardTitle>
            <div>
              <Input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: "inline-block", marginTop: "10px" }}
                id="csvInput"
              />
              <Button
                color="primary"
                onClick={handleDownload}
                disabled={!csvData}
              >
                <FaDownload /> Download Excel
              </Button>
              <Button
                color="danger"
                onClick={handleDeleteCSV}
                disabled={!csvData}
                style={{ marginLeft: "0.5rem" }}
              >
                <FaTrash /> Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {csvData ? (
            <Table responsive>
              <thead>
                <tr>
                  {typeof csvData === "string"
                    ? csvData
                        .split("\n")[0]
                        .split(",")
                        .map((header, index) => <th key={index}>{header}</th>)
                    : csvData.length > 0
                    ? Object.keys(csvData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))
                    : null}
                </tr>
              </thead>
              <tbody>
                {typeof csvData === "string"
                  ? csvData
                      .split("\n")
                      .slice(1)
                      .map((row, index) => (
                        <tr key={index}>
                          {row.split(",").map((cell, i) => (
                            <td key={i}>{cell}</td>
                          ))}
                        </tr>
                      ))
                  : csvData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </Table>
          ) : (
            <p>No CSV data uploaded yet.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CSVReports;
