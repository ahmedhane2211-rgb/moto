import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function TaxesReport() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
  });
  const [cashBalance, setCashBalance] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [items, setItems] = useState([]); // العملاء أو المصروفات

  const columns = [
    { header: t("taxes_payment_method"), accessor: (row) => row.payment_type ? t(`payment_${row.payment_type}`) : "" },
    { header: t("taxes_invoice_number"), accessor: "invoice_number" },
    { header: t("taxes_tax_value"), accessor: "tax_value" },
    { header: t("taxes_invoice_value"), accessor: "total_after_tax" },
    { header: t("taxes_invoice_date"), accessor: "date" },
  ];

  useEffect(() => {
    const today = new Date();

    // أول يوم في الشهر الحالي
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    // آخر يوم في الشهر الحالي
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // نحول التاريخ إلى صيغة YYYY-MM-DD بدون UTC
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFilters({
      ...filters,
      to_date: formatDate(lastDay),
      from_date: formatDate(firstDay),
    });
  }, []);
  // console.log(filters);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setRefreshKey((prev) => prev + 1);
  };
  // كشف حساب الخزنة
  return (
    <div className="container mt-5">
      <Mytitle title={t("taxes_title")} />
      {/* 🟢 عرض الرصيد الحالي */}

      <div className="row  flex-row-reverse">

        <div className="col-md-2">
          <MyInput
            label={t("taxes_to")}
            type="date"
            value={filters.to_date}
            onChange={(e) =>
              setFilters({ ...filters, to_date: e.target.value })
            }
            dontShowDay={true}
          />
        </div>
        <div className="col-md-2">
          <MyInput
            label={t("taxes_from")}
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              setFilters({ ...filters, from_date: e.target.value })
            }
            dontShowDay={true}
          />
        </div>

        <div className="col-md-1 d-flex align-items-center">
          <MyButton onClick={handleSearch} text={t("taxes_search")} />
        </div>
      </div>

      {appliedFilters && (
        <MyTable
          resource="taxReport-from-to"
          method="post"
          component="taxesReport"
          title={t("taxes_accounts_report")}
          body={appliedFilters}
          columns={columns}
          refreshKey={refreshKey}
          cashBalance={cashBalance}
          setCashBalance={setCashBalance}
          filters={[
            {
              type: "text",
              name: "invoice_number",
              label: t("taxes_search_invoice_number"),
            },
            // { type: "text", name: "customer.name", label: "بحث باسم العميل" },
          ]}
          // component="accountStatement"
        />
      )}
    </div>
  );
}

export default TaxesReport;
