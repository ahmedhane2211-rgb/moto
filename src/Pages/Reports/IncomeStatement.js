import { useEffect, useRef, useState } from "react";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyInput from "../../Components/Myinput";
import Mytitle from "../../Components/Mytitle";
import MyButton from "../../Components/MyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useReactToPrint } from "react-to-print";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "react-i18next";

function IncomeStatement() {
  const { t } = useTranslation();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();
  const { settings } = useSettings();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/income-statement", { from, to });
      setReport(data.data);
    } catch (error) {
      toast.error(t("income_load_error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFrom(formatDate(firstDay));
    setTo(formatDate(lastDay));
  }, []);

  return (
    <>
      <div className="income-statement-container">
        <Mytitle title={t("income_title")} className="no-print" />

        <div className="filters row g-3 mb-4 no-print">
          <div className="col-md-3">
            <MyInput
              label={t("income_from")}
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              dontShowDay={true}
            />
          </div>
          <div className="col-md-3">
            <MyInput
              label={t("income_to")}
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              dontShowDay={true}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <MyButton
              text={loading ? t("income_loading") : t("income_show_report")}
              loading={loading}
              onClick={fetchReport}
            />
          </div>
        </div>

        <div className="no-print align-self-end mb-3">
          <button className="btn btn-outline-info" onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} />
          </button>
        </div>

        <div className="print-header">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{t("income_title")}</h2>
            {settings?.head_company_logo == 1 && (
              <img
                src={settings?.company_logo}
                alt={t("income_company_logo")}
                style={{ width: "80px", height: "auto", borderRadius: "8px" }}
              />
            )}
          </div>

          <div className="print-header-section">
            {settings?.head_company_name == 1 && (
              <div>
                <strong>{t("income_company_name")}</strong>:{" "}
                {settings?.company_name || "--"}
              </div>
            )}
            {settings?.head_invoice_address == 1 && (
              <div>
                <strong>{t("income_company_address")}</strong>:{" "}
                {settings?.company_address || "--"}
              </div>
            )}
          </div>

          <div className="print-header-section">
            <div>
              <strong>{t("income_phone")}</strong>:{" "}
              {settings?.company_phone || "--"}
            </div>
            <p className="mt-2">
              <strong>{t("income_print_date")}</strong>:{" "}
              {new Date().toLocaleString("ar-EG")}
            </p>
          </div>
        </div>

        {report && (
          <div className="report-card shadow-sm p-4 rounded">
            <h5 className="only-print">{t("income_statement")}</h5>
            <h5 className="mb-3 text-center">
              {t("income_from")} {report.from} {t("income_to")} {report.to}
            </h5>

            <div className="report-row">
              <span>{t("income_revenue")}</span>
              <strong>{report.invoices.total}</strong>
            </div>

            <div className="report-row">
              <span>{t("income_service_cost")}</span>
              <strong>
                {report.invoices.total - report.invoices.total_win}
              </strong>
            </div>

            <div className="report-row">
              <span>{t("income_expenses")}</span>
              <strong>{report.minvoices.total}</strong>
            </div>

            <div className="report-row">
              <span>{t("income_salaries")}</span>
              <strong>{report.salary.total}</strong>
            </div>

            <div className="report-row net pt-2 mt-2">
              <span>{t("income_net_profit")}</span>
              <strong>{report.net_income}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="print-footers only-print py-4">
        <div className="print-footer-section right">
          {settings?.foot_tax_number == 1 && (
            <div>
              <strong>{t("income_tax_number")}</strong>:{" "}
              {settings?.company_tax_number || "--"}
            </div>
          )}
          {settings?.foot_company_commercial == 1 && (
            <div>
              <strong>{t("income_commercial_register")}</strong>:{" "}
              {settings?.company_commercial || "--"}
            </div>
          )}
        </div>

        <div className="print-footer-section center">
          {settings?.foot_company_seal == 1 && (
            <img
              src={settings?.company_seal}
              alt={t("income_company_seal")}
              style={{ width: "80px", height: "auto", borderRadius: "8px" }}
            />
          )}
        </div>

        <div className="print-footer-section left">
          {settings?.foot_company_website == 1 && (
            <div>
              <strong>{t("income_website")}</strong>:{" "}
              {settings?.company_website || "https://www.facebook.com/"}
            </div>
          )}
          {settings?.foot_company_email == 1 && (
            <div>
              <strong>{t("income_email")}</strong>:{" "}
              {settings?.company_email || "example@info.com"}
            </div>
          )}
        </div>

        <div className="text-center mt-2" style={{ height: "0px" }}>
          {t("income_footer_text")} © {new Date().getFullYear()} -{" "}
          <span>www.ibgates.com</span>
        </div>
      </div>
    </>
  );
}

export default IncomeStatement;
