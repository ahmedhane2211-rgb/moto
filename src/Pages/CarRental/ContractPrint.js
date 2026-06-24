import React from "react";

const ContractPrint = ({ rental, settings, t, i18n }) => {
  if (!rental) return null;

  const isRtl = i18n.language === "ar";
  const rentClauses =
    settings?.rent_clauses || JSON.parse(localStorage.getItem("rent_clauses") || "[]");

  const safe = (val) => (val === undefined || val === null || val === "" ? "--" : val);

  return (
    <div className="contract-wrapper" dir={isRtl ? "rtl" : "ltr"}>
      <style>{`
        /* 1. تعريف المتغيرات للوضع الفاتح (الافتراضي) */
        .contract-wrapper {
          --primary-dark: #1f4252;
          --accent-cyan: #06B6D4;
          --bg-paper: #dfdcdc;      /* خلفية الورقة الرمادية */
          --field-bg: #ffffff;      /* خلفية الحقول البيضاء */
          --text-main: #0F172A;     /* النص الأساسي */
          --text-muted: #64748b;    /* النص الباهت */
          --border-color: #cccccc;  /* لون الحدود */
          --sig-line: #000000;      /* لون خط التوقيع */
          --danger-red: #dc3545;
          
          font-family: 'Inter', 'Cairo', sans-serif;
          color: var(--text-main);
          background-color: var(--bg-paper);
          padding: 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        [data-bs-theme="dark"] .contract-wrapper,
        .dark .contract-wrapper {
          --bg-paper: #0d1117;      /* خلفية غامقة جداً للورقة */
          --field-bg: #161b22;      /* خلفية الحقول داكنة */
          --text-main: #f0f6fc;     /* نص فاتح */
          --text-muted: #8b949e;    /* نص باهت فاتح */
          --border-color: #30363d;  /* حدود داكنة */
          --sig-line: #f0f6fc;      /* خط التوقيع يصبح فاتحاً */
        }

        /* Header - يبقى غالباً كما هو لأنه يعطي شكل رسمي (كحلي) */
        .c-header {
          background: var(--primary-dark);
          color: white;
          padding: 25px;
          text-align: center;
          border-radius: 12px 12px 0 0;
          position: relative;
          border-bottom: 4px solid var(--accent-cyan);
        }
        .c-header h1 { font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 1px; text-transform: uppercase; color: #fff; }
        .c-header p { font-size: 10px; opacity: 0.8; margin: 5px 0 0; color: #fff; }
        .header-meta { display: flex; justify-content: center; gap: 30px; margin-top: 12px; font-size: 11px; color: #fff; }
        .meta-line { border-bottom: 1px solid rgba(255,255,255,0.3); min-width: 100px; display: inline-block; }

        /* Sections */
        .c-body { padding: 20px 0; }
        .s-title { 
          display: flex; align-items: center; gap: 10px; 
          font-size: 12px; font-weight: 700; color: var(--primary-dark);
          margin: 20px 0 15px; text-transform: uppercase;
        }
        [data-bs-theme="dark"] .s-title, .dark .s-title { color: var(--accent-cyan); } /* تغيير لون العناوين في الدارك */
        
        .s-title::after { content: ""; flex: 1; height: 1px; background: var(--border-color); }
        .s-badge { 
          background: var(--primary-dark); color: white; width: 20px; height: 20px; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;
          flex-shrink: 0;
        }
        [data-bs-theme="dark"] .s-badge, .dark .s-badge { background: var(--accent-cyan); color: #000; }

        /* Grid & Fields */
        .c-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 25px; }
        .f-group { display: flex; flex-direction: column; gap: 5px; }
        .f-label { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .f-value { 
          background: var(--field-bg); 
          color: var(--text-main);
          padding: 10px 15px; border-radius: 8px; 
          border: 1px solid var(--border-color); min-height: 38px; font-size: 13px; font-weight: 500;
          display: flex; align-items: center; justify-content: space-between;
        }
        .f-value.highlight { border: 1.5px solid var(--primary-dark); }
        [data-bs-theme="dark"] .f-value.highlight, .dark .f-value.highlight { border-color: var(--accent-cyan); }
        
        .f-value.empty { color: var(--text-muted); font-style: italic; opacity: 0.5; }
        .f-unit { font-size: 11px; color: var(--text-muted); font-weight: 700; }

        /* Financial Section */
        .fin-table { background: var(--field-bg); border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color); }
        .fin-row { display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--border-color); }
        .fin-row span:first-child { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .fin-row span:last-child { font-weight: 600; color: var(--text-main); }
        .fin-row.total-row { background: var(--primary-dark); color: white; border: none; }
        .fin-row.total-row span { color: white !important; }

        /* Terms */
        .terms-box { 
 background: var(--field-bg); 
 border-radius: 10px; 
 padding: 20px; 
 border: 1px solid var(--border-color);
 overflow: visible;
}
        .terms-title { color: var(--danger-red); font-size: 11px; font-weight: 800; border-bottom: 2px solid var(--danger-red); padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; }
        .term-item { display: flex; gap: 12px; font-size: 11px; margin-bottom: 10px; line-height: 1.5; color: var(--text-main); }
        .term-num { background: var(--danger-red); color: white; min-width: 18px; height: 18px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; margin-top: 2px; flex-shrink: 0; }
        .terms-empty { font-size: 11px; color: var(--text-muted); text-align: center; padding: 10px 0; }

        /* Signatures */
        .sig-section { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 30px; text-align: center; }
        .sig-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .sig-line { border-bottom: 1.5px solid var(--sig-line); height: 30px; margin-bottom: 10px; }
        .sig-name { font-size: 10px; color: var(--text-muted); }

        /* عند الطباعة: نلغي الدارك مود دائماً ليكون الورق أبيض */
        @media print {
            .contract-wrapper { 
                background: white !important; 
                color: black !important;
                --bg-paper: white !important;
                --field-bg: white !important;
                --text-main: black !important;
                --border-color: #ccc !important;
                --sig-line: #000 !important;
                padding: 0 !important; 
            }

  @page {
    size: A4;
    margin: 15mm;
  }

  .contract-wrapper {
    background: white !important;
    color: black !important;
    padding: 0 !important;
  }

  /* يمنع تقطيع الأقسام */
  .s-title,
  .fin-table,
  .terms-box,
  .sig-section,
  .c-grid {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* لو الشروط طويلة يسمح يكمل في صفحة جديدة */
  .terms-box {
    break-before: auto;
  }

  /* التوقيعات لا تتقص */
  .sig-section {
    margin-top: 40px;
    page-break-before: auto;
  }

  .f-value {
    background: #fff !important;
    border: 1px solid #ddd !important;
  }

  /* مهم: الغاء قص المحتوى */
  html, body {
    height: auto !important;
    overflow: visible !important;
  }

  .contract-header-card {
    overflow: visible !important;
    height: auto !important;
  }

            .f-value { background: #fff !important; border: 1px solid #ddd !important; }
        }
      `}</style>

      <div className="contract-header-card">
        <div className="c-header">
          <h1>{t("view_rental_details")}</h1>
          <div className="header-meta">
            <div>{t("contract_no")}: <span className="meta-line">{safe(rental.id)}</span></div>
            <div>{t("date")}: <span className="meta-line">{safe(rental.start_date)}</span></div>
          </div>
        </div>

        <div className="c-body">
          {/* Section 1 */}
          <div className="s-title">
            <span className="s-badge">1</span> {t("customer_and_vehicle_info")}
          </div>
          <div className="c-grid">
            <div className="f-group">
              <span className="f-label">{t("customer_name")}</span>
              <div className={`f-value ${!rental.customer?.name ? "empty" : ""}`}>
                {safe(rental.customer?.name)}
              </div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("phone")}</span>
              <div className={`f-value ${!rental.customer?.phone ? "empty" : ""}`}>
                {safe(rental.customer?.phone)}
              </div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("model")}</span>
              <div className="f-value">
                {safe(`${rental.car?.brand || ""} ${rental.car?.model || ""}`.trim())}
              </div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("plate_number")}</span>
              <div className="f-value highlight">{safe(rental.car?.plate_number)}</div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("branch")}</span>
              <div className="f-value">{safe(rental.branch?.name)}</div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("kilometer_before")}</span>
              <div className="f-value highlight">
                <span>{safe(rental.kilometer_before)}</span>
                <span className="f-unit">km</span>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="s-title">
            <span className="s-badge">2</span> {t("rental_period")}
          </div>
          <div className="c-grid">
            <div className="f-group">
              <span className="f-label">{t("pickup_date")}</span>
              <div className="f-value">{safe(rental.start_date)}</div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("pickup_time")}</span>
              <div className="f-value">{safe(rental.start_time)}</div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("return_date")}</span>
              <div className="f-value">{safe(rental.end_date)}</div>
            </div>
            <div className="f-group">
              <span className="f-label">{t("return_time")}</span>
              <div className="f-value">{safe(rental.end_time)}</div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="s-title">
            <span className="s-badge">3</span> {t("financial_summary")}
          </div>
          <div className="fin-table">
            <div className="fin-row">
              <span>{t("insurance_value")}</span>
              <span>{rental.insurance || "0.00"}</span>
            </div>
            <div className="fin-row">
              <span>{t("total")}</span>
              <span>{safe(rental.total)}</span>
            </div>
            <div className="fin-row">
              <span>{t("paid")}</span>
              <span>{safe(rental.paid)}</span>
            </div>
            <div className="fin-row total-row">
              <span>{t("remaining")}</span>
              <span>{safe(rental.remaining)}</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="s-title">
            <span className="s-badge">4</span> {t("terms_conditions")}
          </div>
          <div className="terms-box">
            <div className="terms-title">{t("terms_conditions")}</div>
            {rentClauses.length === 0 ? (
              <div className="terms-empty">{t("no_terms_added")}</div>
            ) : (
              rentClauses.map((clause, index) => (
                <div className="term-item" key={index}>
                  <div className="term-num">{index + 1}</div>
                  <div className="term-text">
                    <strong>{clause.name}:</strong> {clause.desc}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 5 */}
          <div className="sig-section">
            <div className="sig-box">
              <div className="sig-label">{t("lessee_signature")}</div>
              <div className="sig-line"></div>
              <div className="sig-name">
                {t("name")}: {safe(rental.customer?.name)}
              </div>
            </div>
            <div className="sig-box">
              <div className="sig-label">{t("office_representative_signature")}</div>
              <div className="sig-line"></div>
              <div className="sig-name">{t("name")}: ________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPrint;