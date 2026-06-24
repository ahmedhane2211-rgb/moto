import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../Api/axiosConfig";
import { toast } from "react-toastify";

function InvoiceDetails() {
  const { uuid } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`public/invoice/${uuid}`)
      .then((res) => {
        setInvoice(res.data.data);
        setLoading(false);
        console.log(res.data.data);
      })
      .catch((err) => {
        toast.error("حدث خطأ أثناء تحميل بيانات الفاتورة");
        setLoading(false);
      });
  }, [uuid]);

  if (loading)
    return <p className="text-center mt-5">جارٍ تحميل الفاتورة...</p>;
  if (!invoice)
    return <p className="text-center mt-5 text-danger">الفاتورة غير موجودة</p>;

  return (
    <div className="container mt-5">
      <div
        className="invoice-details bg-white text-dark p-4 rounded-4 shadow-lg"
        dir="rtl"
        style={{ maxWidth: "900px", margin: "auto" }}>
        {/* ===== لوجو واسم الشركة ===== */}
        <div className="text-center mb-4">
          <img
            // src={`http://192.168.1.6:8000/storage/${invoice?.company_logo}`}
            src={`https://api.motogates.com/storage/${invoice?.company_logo}`}
            alt="Company Logo"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "3px solid #ddd",
              marginBottom: "10px",
            }}
          />
          <h2 className="fw-bold mt-2">{invoice?.company_name}</h2>
          <div
            style={{
              height: "3px",
              width: "120px",
              background: "#000",
              margin: "15px auto",
              borderRadius: "5px",
            }}></div>
        </div>

        {/* ===== بيانات الفاتورة ===== */}
        <div className="bg-light p-3 rounded-3 mb-4">
          <h4 className="text-center mb-3 fw-bold">فاتورة خدمات</h4>

          <div className="row mb-1">
            <div className="col-12 col-md-6 mb-2">
              <strong>العميل:</strong> {invoice.invoice.customer?.name}
            </div>

            <div className="col-12 col-md-6 mb-2">
              <strong>نوع الدفع:</strong>{" "}
              {invoice.invoice.payment_type === "cash" ? "نقدي" : "تحويل بنكي"}
            </div>

            <div className="col-12 col-md-6 mb-2">
              <strong>إجمالي الفاتورة:</strong> {invoice.invoice.total}
            </div>

            {invoice?.licence_type == 1 && (
              <div className="col-12 col-md-6 mb-2">
                <strong>الترخيص:</strong>{" "}
                {invoice?.license_type?.name || "-----"}
              </div>
            )}

            <div className="col-12 col-md-6 mb-2">
              <strong>رقم الفاتورة:</strong> {invoice.invoice.invoice_number}
            </div>

            <div className="col-12 col-md-6 mb-2">
              <strong>التاريخ:</strong> {invoice.invoice.date}
            </div>

            {invoice?.tax_percent != "0.00" && (
              <>
                <div className="col-12 col-md-6 mb-2">
                  <strong>نسبة الضريبة:</strong> {invoice?.tax_percent}%
                </div>

                <div className="col-12 col-md-6 mb-2">
                  <strong>الإجمالي بعد الضريبة:</strong>{" "}
                  {invoice?.invoice.total_after_tax}
                </div>

                <div className="col-12 col-md-6 mb-2">
                  <strong>قيمة الضريبة:</strong>{" "}
                  {Math.trunc(invoice?.invoice.tax_value)}
                </div>
              </>
            )}

            <div className="col-12 col-md-6 mb-2">
              <strong>حالة الدفع:</strong>{" "}
              <span
                className={
                  Number(invoice.invoice.remaining) > 0
                    ? "text-danger"
                    : "text-success"
                }>
                {Number(invoice.invoice.remaining) > 0 ? "متبقي" : "مدفوعة"}
              </span>
            </div>
          </div>
        </div>

        {/* ===== جدول الخدمات ===== */}
        <div>
          <h5 className="fw-bold mb-3 text-center">الخدمات</h5>

          <table className="table table-bordered text-center align-middle rounded-3 overflow-hidden">
            <thead className="table-dark">
              <tr>
                <th>م</th>
                <th>اسم الخدمة</th>
                <th>القيمة</th>
              </tr>
            </thead>

            <tbody>
              {invoice.invoice.services?.map((srv, index) => (
                <tr key={srv.id}>
                  <td>{index + 1}</td>
                  <td>{srv.service?.name || "-"}</td>
                  <td>{srv?.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;
