import React, { forwardRef } from "react";
import Logo from "../logo.svg";

const PrintTemplate = forwardRef(({ data, columns, settings, title, t, i18n }, ref) => {
  const isRTL = i18n.language === "ar";

  return (
    <div style={{ display: "none" }}>
      <div ref={ref} className="print-only-container" dir={isRTL ? "rtl" : "ltr"} style={{ padding: "20px", color: "#000", backgroundColor: "#fff" }}>
        
        {/* --- الهيدر (Header) --- */}
        <div className="row align-items-center g-4 mb-4 small">
          {/* العمود الأول: العنوان */}
          <div className="col-4">
            {Boolean(settings?.head_invoice_address) && (
              <div className="d-flex align-items-center justify-content-start gap-2">
                {settings?.company_address || ""}
              </div>
            )}
          </div>

          {/* العمود الثاني: اسم الشركة */}
          <div className="col-4 text-center">
            {Boolean(settings?.head_company_name) && (
              <div className="text-sm-head fw-bold" style={{ fontSize: '18px' }}>
                {settings?.company_name || ""}
              </div>
            )}
          </div>

          {/* العمود الثالث: اللوجو */}
          <div className="col-4">
            {Boolean(settings?.head_company_logo) && (
              <div className="d-flex align-items-center justify-content-end gap-2">
                <img
                  src={settings?.company_logo || Logo}
                  alt="logo"
                  style={{ width: "60px", height: "60px", objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          {/* سطر الوقت والتاريخ */}
          <div className="col-4">
            <div className="d-flex align-items-center justify-content-start gap-2">
              <strong>{t("time")}:</strong> {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="col-4 text-center">
             <h5 className="mb-0">{title}</h5>
          </div>
          <div className="col-4">
            <div className="d-flex align-items-center justify-content-end gap-2">
              <strong>{t("date")}:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* --- الجدول (Table) --- */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              {columns.filter(col => !col.hideOnPrint).map((col, i) => (
                <th key={i} style={styles.th}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td style={styles.td}>{rowIndex + 1}</td>
                {columns.filter(col => !col.hideOnPrint).map((col, colIndex) => {
                  let value;
                  if (typeof col.accessor === "function") {
                    value = col.accessor(row, rowIndex);
                  } else if (typeof col.accessor === "string" && col.accessor.includes(".")) {
                    value = col.accessor.split(".").reduce((acc, key) => acc?.[key], row);
                  } else {
                    value = row[col.accessor];
                  }
                  return (
                    <td key={colIndex} style={styles.td}>
                      {value ?? "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- الفوتر (Footer) --- */}
        {/* تم إضافة justify-content-between للـ row */}
{/* قمنا بإزالة justify-content-between واستبدالها بـ text-end لضبط اتجاه النص العربي */}
<div className="row g-4 mb-4 mx-3 small border-top pt-3 text-end" style={{ marginTop: '10px' }}>
  
  {/* هاتف الشركة */}
  {Boolean(settings?.show_phone) && (
    <div className="col-4">
      <div className="d-flex align-items-center justify-content-start gap-2">
        <strong>{t("phone")}:</strong> <span>{settings?.company_phone}</span>
      </div>
    </div>
  )}

  {/* الموقع الإلكتروني */}
  {Boolean(settings?.foot_company_website) && (
    <div className="col-4">
      <div className="d-flex align-items-center justify-content-start gap-2">
        <strong>{t("website")}:</strong> <span>{settings?.company_website}</span>
      </div>
    </div>
  )}

  {/* البريد الإلكتروني */}
  {Boolean(settings?.foot_company_email) && (
    <div className="col-4">
      <div className="d-flex align-items-center justify-content-start gap-2">
        <strong>{t("email")}:</strong> <span>{settings?.company_email}</span>
      </div>
    </div>
  )}

  {/* الرقم الضريبي / الحساب */}
  {Boolean(settings?.foot_tax_number) && (
    <div className="col-4">
      <div className="d-flex align-items-center justify-content-start gap-2">
        <strong>{t("tax_number")}:</strong> <span>{settings?.company_tax_number}</span>
      </div>
    </div>
  )}

  {/* السجل التجاري */}
  {Boolean(settings?.foot_company_commercial) && (
     <div className="col-4">
      <div className="d-flex align-items-center justify-content-start gap-2">
        <strong>{t("commercial_number")}:</strong> <span>{settings?.company_commercial}</span>
      </div>
    </div>
  )}

  {/* الختم */}
  {Boolean(settings?.foot_company_seal) && (
    <div className="col-4">
      <div className="d-flex align-items-center justify-content-start gap-2">
        <strong>{t("company_seal")}:</strong>
        <img
          src={settings.company_seal}
          alt="seal"
          style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
        />
      </div>
    </div>
  )}
</div>
      </div>

      <style>{`
        @media print {
          .print-only-container { display: block !important; }
        }
      `}</style>
    </div>
  );
});

const styles = {
  th: { border: "1px solid #000", padding: "10px 5px", backgroundColor: "#f2f2f2", fontWeight: "bold", fontSize: "13px", textAlign: "center" },
  td: { border: "1px solid #000", padding: "8px 4px", fontSize: "12px", textAlign: "center" }
};

export default PrintTemplate;