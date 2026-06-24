import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import API from "../Api/axiosConfig";
import { useSettings } from "../context/SettingsContext";
import React from "react";

function Test() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    API.post(`/salary-details/aba9ed40-adb2-11f0-9df2-dc4a3e6fd975`)
      .then((res) => setEmployee(res.data.data))
      .catch((err) => console.error("فشل تحميل بيانات الموظف", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="text-center text-white mt-5">جاري التحميل...</div>;
  if (!employee)
    return <div className="text-center text-danger mt-5">لا توجد بيانات</div>;

  const allDetails = [
    ...(employee.rewards?.map((d) => ({
      ...d,
      type: "مكافأة",
      color: "success",
    })) || []),
    ...(employee.discounts?.map((d) => ({
      ...d,
      type: "خصم",
      color: "danger",
    })) || []),
    ...(employee.withdrawals?.map((d) => ({
      ...d,
      type: "سحب",
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

  return (
    <>
      <div className="text-center my-3 no-print">
        <button className="btn btn-outline-info" onClick={handlePrint}>
          <FontAwesomeIcon icon={faPrint} /> طباعة
        </button>
      </div>

      <div className="container employee-print-container">
         <header className="print-header d-none d-print-block ">
          <div className="print-header ">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h2> <strong>تفاصيل راتب:</strong> ({employee.name || "الموظف"})</h2>
              {settings.head_company_logo
                ? settings.head_company_logo == 1 && (
                    <img
                      src={settings.company_logo}
                      alt="شعار الشركة"
                      style={{
                        width: "60px",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  )
                : ""}
            </div>
            <div className="print-header-section  ">
              {settings.head_company_name == 1 && (
                <div>اسم الشركة : {settings.company_name || "--"}</div>
              )}
              {settings.head_invoice_address == 1 && (
                <div className="">
                  العنوان : {settings.company_address || "--"}
                </div>
              )}
            
            </div>
            <div className="print-header-section center"></div>

            <div className="print-header-section">
              <div>الهاتف : {settings.company_phone || "--"}</div>

              <p className="">
                تاريخ الطباعة: {new Date().toLocaleString("ar-EG")}
              </p>
            </div>
          </div>
        </header>

        <main className="print-content">
          {/* <h4 className="text-center mb-4">تقرير راتب الموظف</h4> */}

          <div className="employee-info">
            <div>
              <strong>الراتب الأساسي:</strong> {employee.basic_salary}
            </div>
            <div>
              <strong>العمر:</strong> {employee.age}
            </div>
            <div>
              <strong>رقم الهاتف:</strong> {employee.phone}
            </div>
            <div>
              <strong>العنوان:</strong> {employee.address}
            </div>
            <div>
              <strong>النوع:</strong>{" "}
              {employee.gender === "male" ? "ذكر" : "أنثى"}
            </div>
            <div>
              <strong>إجمالي المكافآت:</strong> {employee.total_rewards}
            </div>
            <div>
              <strong>إجمالي الخصومات:</strong> {employee.total_discounts}
            </div>
            <div>
              <strong>إجمالي المسحوبات:</strong> {employee.total_withdrawals}
            </div>
            <div>
              <strong>الراتب الصافي:</strong>{" "}
              <span className="text-bold">{employee.net_salary}</span>
            </div>
            <div>
              <strong>الحالة:</strong>{" "}
              <span
                className={employee.is_paid ? "text-success" : "text-danger"}>
                {employee.is_paid ? "تم الصرف" : "لم يتم الصرف"}
              </span>
            </div>
          </div>

          <h5 className="text-center mt-4 mb-3">تفاصيل المكافآت والخصومات</h5>
          <table
            className="table table-bordered text-center align-middle "
            dir="rtl">
            <thead className="table-light ">
              <tr>
                <th>م</th>
                <th>التاريخ</th>
                <th>النوع</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              {allDetails.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-muted">
                    لا توجد بيانات
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
                          <th>م</th>
                          <th>التاريخ</th>
                          <th>النوع</th>
                          <th>القيمة</th>
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

        {/* ===== الفوتر ===== */}
        <footer className="print-footer">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-center">
              <strong>توقيع الموظف:</strong>
              <div
                className="border mt-1"
                style={{
                  height: "35px",
                  width: "120px",
                  margin: "0 auto",
                }}></div>
            </div>

            {settings?.foot_company_seal == 1 && (
              <div className="text-center">
                <strong>   البصمة:</strong>
                <div className="mt-1">
                  <div
                    className="border mt-1"
                    style={{
                      height: "70px",
                      width: "70px",
                      margin: "0 auto",
                    }}></div>
                </div>
              </div>
            )}
          </div>
          <div className="print-footer only-print">
            <div className="print-footer-section right">
              {settings.foot_tax_number == 1 && (
                <div>الرقم الضريبي: {settings.company_tax_number || "--"}</div>
              )}
              {settings.foot_company_commercial == 1 && (
                <div>السجل التجاري:{settings.company_commercial || "--"} </div>
              )}
            </div>
            {settings.foot_company_seal == 1 && (
              <div className="print-footer-section center">
                <img
                  src={settings.company_seal}
                  alt="ختم الشركة"
                  style={{
                    width: "80px",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />{" "}
              </div>
            )}
            <div className="print-footer-section left">
              {settings.foot_company_website == 1 && (
                <div>
                  الموقع الإلكتروني:
                  {settings.company_website || "https://www.facebook.com/"}{" "}
                </div>
              )}
              {settings.foot_company_email == 1 && (
                <div>
                  البريد الإلكتروني:{" "}
                  {settings.company_email || "exampel@info.com"}{" "}
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>

      <style>
        {`
        @media print {
          .no-print {
            display: none !important;
          }

          .employee-print-container {
            margin: 0 auto;
            padding: 20px;
            max-width: 900px;
            color: #000 !important;
            
          }

        

          .employee-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px 20px;
            font-size: 1rem;
            margin-bottom: 30px;
          }

          .employee-info div {
            border-bottom: 1px dotted #777;
            padding: 5px 0;
          }

       
      

          .salary-image {
            width: 180px;
            height: 180px;
            border: 2px solid #000;
            border-radius: 10px;
            object-fit: cover;
          }

          
         .employee-info div strong {
          color: #000000ff;
          }
        }

        .employee-print-container {
          color: #fff;
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          direction: rtl;
          
        }

        .employee-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 25px;
          font-size: 1.05rem;
        }

 
       

        .salary-image {
          width: 160px;
          height: 160px;
          border-radius: 15px;
          object-fit: cover;
          transition: all 0.3s;
        }

        .salary-image:hover {
          transform: scale(1.08);
        }
      `}
      </style>
      <style>{`
        @media print {
          .no-print { display: none !important; }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          header.print-header, footer.print-footer {
            position: fixed;
            left: 0;
            right: 0;
            background: white;
            z-index: 1000;
          }

          header.print-header {
            top: 0;
            border-bottom: 1px solid #ccc;
            height: 120px;
            padding: 5px 20px;
          }

          footer.print-footer {
            bottom: 0;
            border-top: 1px solid #ccc;
            min-height: 90px;
            padding: 5px 20px;
            font-size: 12px;
          }

          main.print-content {
            margin-top: 110px;
            margin-bottom: 100px;
          }

          tr.page-break {
            page-break-before: always;
          }

          .header-space {
            height: 70px; 
          }

          .header-space-row {
            border: none !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}

export default Test;
