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

  return (
    <div className="content">
      <Card>
        <CardHeader>
          <div
            style={{
              display: "flex",
              marginTop: '30px',
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CardTitle tag="h4">CSV Report</CardTitle>
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
