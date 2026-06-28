import { useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "react-i18next";
import Logo from "../logo.svg";
import { useTheme } from "../context/ThemeContext";
import { X } from "lucide-react";

function ModalForm({
  show,
  onClose,
  title,
  children,
  onSubmit,
  loading,
  mode = "form", // form | confirm | print
  confirmText,
  cancelText,
  className,
  size = "md", // sm | lg | xl
}) {
  const printRef = useRef();
  const { settings } = useSettings();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ar";
  const { theme } = useTheme();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm !important;
      }

      body {
        direction: ${isRTL ? "rtl" : "ltr"};
        text-align: ${isRTL ? "right" : "left"};
        font-family: 'Cairo', sans-serif;
        color: #000 !important;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      @media print {
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .text-white {
          color: #000 !important;
        }
      }

      .print-header {
        margin-bottom: 20px;
      }

      .print-header-section {
        display: flex;
        justify-content: space-between;
        flex-direction: ${isRTL ? "row-reverse" : "row"};
      }

      .print-footer {
        // position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
      }

      .print-footer-section {
        display: flex;
        flex-direction: column;
        align-items: ${isRTL ? "flex-end" : "flex-start"};
      }
    `,
  });
useEffect(() => {
    const handleKeyDown = (event) => {
      if (!show || loading) return;

      if (event.key === "Enter") {
        // منع السلوك الافتراضي لضمان عدم حدوث تداخل مع الـ forms
        event.preventDefault(); 
        
        if (mode === "print") {
          handlePrint();
        } else if (mode !== "view" && onSubmit) {
          onSubmit(event);
        }
      }
    };

    if (show) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, loading, mode, onSubmit, handlePrint]);
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size={size}
      className={className}
      style={{ minWidth: "550px" }}
    >
      <Modal.Header className={`modal-header-custom ${isRTL ? "rtl" : "ltr"}`}>
        <Modal.Title>{title}</Modal.Title>

        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{ color:theme ==="dark" ? "white":"black",border:"none",backgroundColor:"transparent",fontSize:"20px" }}
        >
          <X/>
        </button>
        
      </Modal.Header>

      <Modal.Body
        ref={printRef}
        style={
          mode === "confirm"
            ? {
                textAlign: "center",
                fontWeight: "600",
                fontSize: "18px",
                padding: "20px",
              }
            : {}
        }
      >
        {mode === "print" && (
          <div
            className="print-header w-100"
            style={{
              display: "flex",
              justifyItems: "center",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              borderBottom: "1px solid black",
            }}
          >
            <div
              style={{
                flex: 1,
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {settings?.head_invoice_address == 1 && settings?.company_address}
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "22px",
              }}
            >
              {settings?.head_company_name == 1 && settings?.company_name}
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {settings?.head_company_logo == 1 && settings?.company_logo ? (
                <img
                  src={settings?.company_logo}
                  alt="Logo"
                  style={{ height: "40px", width: "auto" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  logo{" "}
                  <img
                    src={Logo}
                    alt="logo"
                    style={{ height: "24px", marginLeft: "5px" }}
                  />
                </span>
              )}
            </div>
          </div>
        )}

        <div className="print-content">{children}</div>

        {mode === "print" && (
          <div className="w-100">
            <div
              className="print-footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px 20px",
                borderTop: "1px solid black",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  textAlign: "end",
                  lineHeight: "2",
                  direction: isRTL ? "ltr" : "rtl",
                  color: "black",
                }}
              >
                <div>
                  <span>{settings?.company_phone || "01005612315"}</span>{" "}
                  <strong> :{t("wsab")}</strong>
                </div>
                <div>
                  <span>{settings?.company_phone || "01023150231"}</span>{" "}
                  <strong> :{t("company_phone")}</strong>
                </div>
                <div>
                  <span>{settings?.company_commercial || "5132501"}</span>{" "}
                  <strong> :{t("company_commercial")}</strong>
                </div>
              </div>

              <div
                style={{
                  fontSize: "16px",
                  lineHeight: "2",
                  direction: isRTL ? "rtl" : "ltr",
                  color: "black",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <strong> {t("website")}:</strong>{" "}
                  {settings?.company_website || "http://www.nyhexiruru.me.uk"}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <strong> {t("company_address")}:</strong>{" "}
                  {settings?.company_email || "ahmed@gmail.com"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  <strong> {t("company_seal")}:</strong>
                  {settings?.company_seal ? (
                    <img
                      src={settings?.company_seal}
                      alt="Seal"
                      style={{
                        width: "40px",
                        height: "auto",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#e0e0e0",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{ fontSize: "20px", color: "#888" }}
                        className="fw-bold px-3 py-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          fill="currentColor"
                          className="bi bi-person-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer dir={isRTL ? "rtl" : "ltr"} className="d-flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          {cancelText || t("common.cancel")}
        </Button>

        {mode === "print" ? (
          <Button variant="info" onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} />
          </Button>
        ) : mode !== "view" ? (
          <Button
            variant={mode === "confirm" ? "danger" : "primary"}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? t("common.loading") : confirmText || t("common.save")}
          </Button>
        ) : null}
      </Modal.Footer>
    </Modal>
  );
}

export default ModalForm;
