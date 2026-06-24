import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";
import API from "../../Api/axiosConfig";

function EmployeeDetails() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  useEffect(() => {
    API.post(`/salary-details/${uuid}`)
      .then((res) => setEmployee(res.data.data))
      .catch((err) => console.error("فشل تحميل بيانات الموظف", err))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading)
    return <div className="text-center text-white mt-5">جاري التحميل...</div>;
  if (!employee)
    return <div className="text-center text-danger mt-5">لا توجد بيانات</div>;

  const allDetails = [
    ...(employee.rewards?.map((d) => ({
      ...d,
      type: t("reward"),
      color: "success",
    })) || []),
    ...(employee.discounts?.map((d) => ({
      ...d,
      type: t("discount"),
      color: "danger",
    })) || []),
    ...(employee.withdrawals?.map((d) => ({
      ...d,
      type: t("withdrawal"),
      color: "warning",
    })) || []),
  ];

  const rowsPerFirstPage = 9;
  const rowsPerNextPage = 17;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 100);
    }, 100);
  };

  const currentTextColor = theme === "light" ? "black" : "white";

  return (
    <>
      {/* إضافة كلاس 'printable-content' للعنصر الذي نريد طباعته */}
      <div
        style={{ maxWidth: "900px" }}
        className="text-center my-3 m-auto no-print"
      >
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            &#8592; {t("back") || "العودة"}
          </button>
          <button className="btn btn-outline-info" onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} /> {t("prints")}
          </button>
        </div>
      </div>
      <div
        className={`container employee-print-container theme-${theme} printable-content`}
      >
        <header
          style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
          className="print-header d-print-block"
        >
          <div
            className="w-100"
            style={{
              display: "flex",
              justifyItems: "center",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
            }}
          >
            <div
              style={{
                flex: 1,
                textAlign: "start",
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
              {settings?.head_company_logo == 1 && settings?.company_logo && (
                <img
                  src={settings?.company_logo}
                  alt="Logo"
                  style={{ height: "40px", width: "auto" }}
                />
              )}
            </div>
          </div>
          <h2>
            <strong>{t("salary_details")}:</strong> ({employee.name || "الموظف"}
            )
          </h2>
        </header>

        <main className="print-content">
          <h4 style={{ color: currentTextColor }} className="text-center mb-4">
            {t("employee_salary_report")}: {employee.name}
          </h4>

          <div style={{ color: currentTextColor }} className="employee-info">
            <div>
              <strong>{t("basic_salary")}:</strong> {employee.basic_salary}
            </div>
            <div>
              <strong>{t("age")}:</strong> {employee.age}
            </div>
            <div>
              <strong>{t("phone")}:</strong> {employee.phone}
            </div>
            <div>
              <strong>{t("address")}:</strong> {employee.address}
            </div>
            <div>
              <strong>{t("gender")}:</strong>{" "}
              {employee.gender === "male" ? t("male") : t("female")}
            </div>
            <div>
              <strong>{t("total_rewards")}:</strong> {employee.total_rewards}
            </div>
            <div>
              <strong>{t("total_discounts")}:</strong>{" "}
              {employee.total_discounts}
            </div>
            <div>
              <strong>{t("total_withdrawals")}:</strong>{" "}
              {employee.total_withdrawals}
            </div>
            <div>
              <strong>{t("net_salary")}:</strong>{" "}
              <span className="text-bold">{employee.net_salary}</span>
            </div>
            <div>
              <strong>{t("status")}:</strong>{" "}
              <span
                className={employee.is_paid ? "text-success" : "text-danger"}
              >
                {employee.is_paid ? t("paid") : t("not_paid")}
              </span>
            </div>
          </div>
          {employee.salary_image && employee.is_paid && (
            <div className="text-center mt-4 no-print">
              <img
                src={`http://localhost:8000/storage/${employee.salary_image}`}
                alt="صورة الراتب"
                className="salary-image"
              />
            </div>
          )}

          <h5
            style={{ color: currentTextColor }}
            className="text-center mt-4 mb-3"
          >
            {t("rewards_and_discounts_details")}
          </h5>
          <table
            className="table table-bordered text-center align-middle"
            dir="rtl"
          >
            <thead className="table-light">
              <tr>
                <th>{t("serial_number")}</th>
                <th>{t("date")}</th>
                <th>{t("type")}</th>
                <th>{t("value")}</th>
              </tr>
            </thead>
            <tbody>
              {allDetails.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-muted">
                    {t("no_data")}
                  </td>
                </tr>
              )}

              {allDetails.map((item, index) => {
                const isPageBreak =
                  isPrinting &&
                  (index === rowsPerFirstPage ||
                    (index > rowsPerFirstPage &&
                      (index - rowsPerFirstPage) % rowsPerNextPage === 0));

                return (
                  <React.Fragment key={index}>
                    {isPageBreak && (
                      <>
                        <tr className="page-break"></tr>
                        <tr className="header-space-row">
                          <td colSpan="4">
                            <div className="header-space"></div>
                          </td>
                        </tr>

                        <tr className="only-print table-light">
                          <th>{t("serial_number")}</th>
                          <th>{t("date")}</th>
                          <th>{t("type")}</th>
                          <th>{t("value")}</th>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.date}</td>
                      <td className={`text-${item.color}`}>{item.type}</td>
                      <td>{item.value}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </main>

        <footer style={{ flexDirection: "column" }} className="print-footer">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-center">
              <strong>{t("employee_signature")}:</strong>
              <div
                className="border mt-1"
                style={{
                  height: "35px",
                  width: "120px",
                  margin: "0 auto",
                }}
              ></div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              justifyContent: "space-between",
              gap: "10px",
            }}
            className="print-footer-details"
          >
            <div className="print-footer-section right">
              {settings?.foot_tax_number == 1 && (
                <div>
                  {t("tax_number")}: {settings?.company_tax_number || "--"}
                </div>
              )}
              {settings?.foot_company_commercial == 1 && (
                <div>
                  {t("commercial_register")}:
                  {settings?.company_commercial || "--"}{" "}
                </div>
              )}
            </div>
            <div className="print-footer-section center">
              {settings?.foot_company_website == 1 && (
                <div className="footer-line">
                  <span className="footer-label">{t("website")}: </span>
                  <span className="footer-value" dir="ltr">
                    {settings?.company_website || "https://www.facebook.com/"}
                  </span>
                </div>
              )}
              {settings?.foot_company_email == 1 && (
                <div className="footer-line">
                  <span className="footer-label">{t("email")}: </span>
                  <span className="footer-value" dir="ltr">
                    {settings?.company_email || "exampel@info.com"}
                  </span>
                </div>
              )}
            </div>
            {settings?.foot_company_seal == 1 && (
              <div className="print-footer-section left">
                <img
                  src={settings?.company_seal}
                  alt="ختم الشركة"
                  style={{
                    width: "80px",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />{" "}
              </div>
            )}
          </div>
        </footer>
      </div>

      <style>
        {`
        /* الأنماط العامة للصفحة */
        .employee-print-container {
          padding: 20px;
          margin: 0 auto;
          max-width: 900px;
          /* الأنماط الافتراضية للثيم هنا أو من ملف CSS خارجي */
        }

        .footer-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
  justify-content: center; /* أو flex-end حسب الاتجاه */
}

.footer-label {
  white-space: nowrap;
  flex-shrink: 0;
}

.footer-value {
  white-space: nowrap;
  unicode-bidi: plaintext;
}


        /* الأنماط لتكييف الألوان مع الثيم للعرض على الشاشة */
        .employee-print-container.theme-dark {
          background-color: #343a40; /* لون خلفية داكن */
          color: white; /* لون النص في الوضع الداكن */
        }

        .employee-print-container.theme-light {
          background-color: #ffffff; /* لون خلفية فاتح */
          color: black; /* لون النص في الوضع الفاتح */
        }
        
        .employee-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 25px;
          font-size: 1.05rem;
          margin-bottom: 30px;
        }
       
        .employee-info div {
          padding: 5px 0;
          border-bottom: 1px dotted rgba(119, 119, 119, 0.5);
        }

        .employee-info div strong {
          font-weight: bold;
        }

        .salary-image {
          width: 160px;
          height: 160px;
          border-radius: 15px;
          object-fit: cover;
          transition: all 0.3s;
          border: 1px solid #ccc;
        }

        .salary-image:hover {
          transform: scale(1.08);
        }
        @media print {
          html, body, #root, .App {
            background-color: white !important;
          }
        }

        @media print {
          :root {
            color-scheme: light only;
          }
        }
        /* الطباعة: الأنماط التي تضمن الخلفية البيضاء والنصوص السوداء */
        @media print {
          .no-print {
            display: none !important;
          }
            

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          /* تطبيق الخلفية البيضاء على كامل مستند الطباعة */
          html, body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important; /* مهم جداً لتجاهل ألوان الخلفية من المتصفح */
            print-color-adjust: exact !important; /* لنفس الغرض */
          }

          /* التأكد من أن كل المحتوى داخل الحاوية المطبوعة يكون بالخلفية البيضاء والنص الأسود */
          .printable-content, .printable-content * {
            background-color: white !important;
            color: black !important;
            border-color: black !important; /* لجعل الحدود سوداء وواضحة */
          }

          /* إعادة تعيين ألوان العناصر التي قد يكون لها ألوان مخصصة */
          h2, h4, h5, strong, th, p, span, div {
            color: black !important;
          }
          
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            border-bottom: 1px solid black;
            padding: 5px 20px;
            height: 120px;
            display: block !important;
            background-color: white !important;
            box-shadow: none !important; /* إزالة أي ظلال قد تظهر */
          }

          .print-header h2 {
            text-align: center;
            margin-bottom: 10px;
          }

          main.print-content {
            margin-top: 130px;
            margin-bottom: 110px;
            padding: 10px 0;
          }

          .print-footer-details {
             display: grid !important;
             grid-template-columns: 1fr 1fr 1fr !important;
             justify-content: space-between !important;
             gap: 10px !important;
             margin-top: 10px;
          }

          .print-footer-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .print-footer-section.left {
            align-items: flex-end;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid black !important;
            padding: 8px;
            text-align: center;
          }

          thead.table-light tr, .only-print.table-light {
            background-color: #f2f2f2 !important;
          }

          .table-light th {
            color: black !important;
          }

          .page-break {
            page-break-before: always;
          }

          .header-space {
            height: 100px;
          }

          .header-space-row {
            border: none !important;
          }

          .employee-info div {
            border-bottom: 1px dotted black !important;
          }
          .employee-info div strong {
            color: black !important;
          }
          .salary-image {
            border: 2px solid black !important;
          }
            .print-footer,
  .print-footer * {
    background-color: white !important;
    background: white !important;
  }
        }
      `}
      </style>
    </>
  );
}

export default EmployeeDetails;
