import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Label,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
} from "reactstrap";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { FaUpload, FaDownload, FaEye } from "react-icons/fa";
import NotificationAlert from "react-notification-alert";
import { apiUrl, ROUTES, S3_BUCKET_NAME } from "../config/api";

const MAX_FILE_SIZE_MB = 10;
const ACCEPT_TYPES = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";

const Documents = () => {
  const { t } = useTranslation();
  const notificationAlertRef = useRef(null);
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (userId) fetchDocuments();
  }, [userId]);

  const notify = (place, message, type) => {
    if (notificationAlertRef.current)
      notificationAlertRef.current.notificationAlert({
        place,
        message: <div>{message}</div>,
        type,
        icon: "now-ui-icons ui-1_bell-53",
        autoDismiss: 7,
      });
  };

  const fetchDocuments = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`${ROUTES.DOCUMENT}?userId=${encodeURIComponent(userId)}`)
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setDocuments(data);
      } else if (res.ok && data?.documents) {
        setDocuments(data.documents);
      } else if (res.ok && data?.items) {
        setDocuments(data.items);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
      notify("tr", t("documents.errorList"), "danger");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = async (key) => {
    try {
      const res = await fetch(
        apiUrl(`${ROUTES.DOCUMENT}/url?key=${encodeURIComponent(key)}`)
      );
      const data = await res.json();
      return data?.url || data?.previewUrl || null;
    } catch {
      return null;
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length || !userId) return;
    const file = files[0];
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      notify("tr", t("documents.fileTooBig", { max: MAX_FILE_SIZE_MB }), "warning");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result?.split(",")[1] || btoa(reader.result);
          const res = await fetch(apiUrl(ROUTES.DOCUMENT), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              fileContent: base64,
              fileName: file.name,
              contentType: file.type,
              bucketName: S3_BUCKET_NAME,
              keyPrefix: "documents",
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP ${res.status}`);
          }
          notify("tr", t("documents.uploadSuccess"), "success");
          fetchDocuments();
        } catch (err) {
          console.error("Upload error:", err);
          notify("tr", t("documents.uploadError") + " " + (err.message || ""), "danger");
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      notify("tr", t("documents.uploadError"), "danger");
    }
  };

  const handleDownload = async (item) => {
    const key = item.key || item.s3Key;
    const name = item.name || item.fileName || key?.split("/").pop() || "document";
    let url = item.url || item.previewUrl;
    if (!url && key) url = await getDocumentUrl(key);
    if (url) {
      try {
        const response = await fetch(url, { mode: "cors" });
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        notify("tr", t("documents.downloadStarted"), "success");
      } catch (err) {
        window.open(url, "_blank");
      }
    } else {
      notify("tr", t("documents.noUrl"), "warning");
    }
  };

  const handleDownloadAll = async () => {
    if (!documents.length) return;
    setDownloadingAll(true);
    for (let i = 0; i < documents.length; i++) {
      await handleDownload(documents[i]);
      if (i < documents.length - 1) await new Promise((r) => setTimeout(r, 400));
    }
    setDownloadingAll(false);
    notify("tr", t("documents.downloadAllDone", { count: documents.length }), "success");
  };

  const handlePreview = async (item) => {
    setPreviewItem(item);
    setPreviewModal(true);
    setPreviewUrl(null);
    setPreviewLoading(true);
    const key = item.key || item.s3Key;
    let url = item.url || item.previewUrl;
    if (!url && key) url = await getDocumentUrl(key);
    setPreviewUrl(url || null);
    setPreviewLoading(false);
  };

  const formatSize = (bytes) => {
    if (bytes == null) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const isPreviewable = (item) => {
    const name = (item.name || item.fileName || "").toLowerCase();
    return /\.(pdf|jpe?g|png|gif|webp|bmp)$/i.test(name);
  };

  return (
    <>
      <Helmet>
        <title>{t("documents.title")} - Mesob Finance</title>
      </Helmet>
      <NotificationAlert ref={notificationAlertRef} />
      <div className="content" style={{ paddingInline: 15, paddingTop: 80, backgroundColor: "#101926", minHeight: "100vh" }}>
        <Row style={{ marginTop: 25 }}>
          <Col xs={12}>
            <Card
              style={{
                backgroundColor: "#1a273a",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                borderRadius: "8px",
                border: "1px solid #2d3a4f",
              }}
            >
              <CardHeader style={{ backgroundColor: "#1a273a", borderBottom: "1px solid #2d3a4f" }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <CardTitle tag="h4" className="mb-0" style={{ color: "#22d3ee" }}>
                    {t("documents.title")}
                  </CardTitle>
                  <div className="d-flex flex-wrap align-items-center" style={{ gap: "14px" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT_TYPES}
                      onChange={handleUpload}
                      style={{ display: "none" }}
                    />
                    <Button
                      color="primary"
                      disabled={uploading || !userId}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        backgroundColor: "#3d83f1",
                        borderColor: "#3d83f1",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {uploading ? <Spinner size="sm" /> : <FaUpload />}
                      {uploading ? t("documents.uploading") : t("documents.upload")}
                    </Button>
                    {documents.length > 0 && (
                      <Button
                        color="secondary"
                        disabled={downloadingAll || !userId}
                        onClick={handleDownloadAll}
                        style={{
                          backgroundColor: "#0d9488",
                          borderColor: "#0d9488",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {downloadingAll ? <Spinner size="sm" /> : <FaDownload />}
                        {downloadingAll ? t("documents.downloadingAll") : t("documents.downloadAll")}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mb-0 mt-2" style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                  {t("documents.subtitle")} {MAX_FILE_SIZE_MB} MB.
                </p>
              </CardHeader>
              <CardBody style={{ backgroundColor: "#1a273a" }}>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2" style={{ color: "#e2e8f0" }}>{t("documents.loading")}</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-5" style={{ color: "#94a3b8" }}>
                    <p className="mb-2">{t("documents.noDocuments")}</p>
                    <Button
                      color="primary"
                      style={{ backgroundColor: "#3d83f1", borderColor: "#3d83f1" }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("documents.uploadFirst")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {isMobile ? (
                      <div className="d-flex flex-column gap-3">
                        {documents.map((doc, idx) => (
                          <div
                            key={doc.key || doc.id || idx}
                            style={{
                              padding: "12px",
                              backgroundColor: "#0d1321",
                              borderRadius: "8px",
                              border: "1px solid #2d3a4f",
                            }}
                          >
                            <div style={{ color: "#e2e8f0", fontWeight: 500, marginBottom: "8px" }}>
                              {doc.name || doc.fileName || doc.key?.split("/").pop() || "—"}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "8px" }}>
                              {formatSize(doc.size)} · {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}
                            </div>
                            <div className="d-flex flex-wrap" style={{ gap: "12px" }}>
                              {isPreviewable(doc) && (
                                <Button
                                  size="sm"
                                  style={{ backgroundColor: "#2d3a4f", borderColor: "#2d3a4f", color: "#e2e8f0" }}
                                  onClick={() => handlePreview(doc)}
                                >
                                  <FaEye className="me-1" /> {t("documents.preview")}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                style={{ backgroundColor: "#0d9488", borderColor: "#0d9488", color: "#fff" }}
                                onClick={() => handleDownload(doc)}
                              >
                                <FaDownload className="me-1" /> {t("documents.download")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Table responsive style={{ backgroundColor: "#1a273a" }}>
                        <thead>
                          <tr>
                            <th style={{ color: "#94a3b8", borderColor: "#2d3a4f" }}>{t("documents.name")}</th>
                            <th style={{ color: "#94a3b8", borderColor: "#2d3a4f" }}>{t("documents.size")}</th>
                            <th style={{ color: "#94a3b8", borderColor: "#2d3a4f" }}>{t("documents.date")}</th>
                            <th style={{ color: "#94a3b8", borderColor: "#2d3a4f" }}>{t("documents.actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc, idx) => (
                            <tr key={doc.key || doc.id || idx} style={{ borderColor: "#2d3a4f" }}>
                              <td style={{ color: "#e2e8f0", borderColor: "#2d3a4f" }}>
                                {doc.name || doc.fileName || doc.key?.split("/").pop() || "—"}
                              </td>
                              <td style={{ color: "#94a3b8", borderColor: "#2d3a4f" }}>{formatSize(doc.size)}</td>
                              <td style={{ color: "#94a3b8", borderColor: "#2d3a4f" }}>
                                {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}
                              </td>
                              <td style={{ borderColor: "#2d3a4f" }}>
                                <div className="d-flex flex-wrap" style={{ gap: "12px" }}>
                                  {isPreviewable(doc) && (
                                    <Button
                                      size="sm"
                                      style={{ backgroundColor: "#2d3a4f", borderColor: "#2d3a4f", color: "#e2e8f0" }}
                                      onClick={() => handlePreview(doc)}
                                    >
                                      <FaEye className="me-1" /> {t("documents.preview")}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    style={{ backgroundColor: "#0d9488", borderColor: "#0d9488", color: "#fff" }}
                                    onClick={() => handleDownload(doc)}
                                  >
                                    <FaDownload className="me-1" /> {t("documents.download")}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        isOpen={previewModal}
        toggle={() => { setPreviewModal(false); setPreviewItem(null); setPreviewUrl(null); }}
        size="lg"
        style={{ maxWidth: "90vw" }}
      >
        <ModalHeader
          toggle={() => { setPreviewModal(false); setPreviewItem(null); setPreviewUrl(null); }}
          style={{ backgroundColor: "#1a273a", color: "#e2e8f0", borderBottom: "1px solid #2d3a4f" }}
        >
          {previewItem?.name || previewItem?.fileName || t("documents.preview")}
        </ModalHeader>
        <ModalBody style={{ backgroundColor: "#1a273a", color: "#e2e8f0", minHeight: "400px" }}>
          {previewLoading ? (
            <div className="text-center py-5">
              <Spinner color="light" />
              <p className="mt-2">{t("documents.loading")}</p>
            </div>
          ) : previewUrl ? (
            <>
              {/\.pdf$/i.test(previewItem?.name || previewItem?.fileName || "") ? (
                <object
                  data={previewUrl}
                  type="application/pdf"
                  width="100%"
                  height="500px"
                  style={{ borderRadius: "8px" }}
                >
                  <p>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                      {t("documents.openPdf")}
                    </a>
                  </p>
                </object>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                />
              )}
            </>
          ) : (
            <p className="mb-0">{t("documents.previewNotAvailable")}</p>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default Documents;
