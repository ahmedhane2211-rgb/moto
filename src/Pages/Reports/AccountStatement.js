import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function AccountStatement() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    type: "",
    id: "",
  });
  const [cashBalance, setCashBalance] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [items, setItems] = useState([]); // العملاء أو المصروفات
  const isEnglish = localStorage.getItem("i18nextLng") === "en";
  const columns = [
    { header: t("account_date"), accessor: "date" },
    {
      header: t("account_name"),
      accessor: (row) =>
        row.expense ? row.expense.name : row.customer ? row.customer.name : "-",
    },
    {
      header: t("account_invoice_number"),
      accessor: (row) =>
        row.expense
          ? row.invoice_number
          : row.customer
            ? row.invoice_number
            : "-",
    },
    {
      header: t("account_invoice_type"),
      accessor: (row) => {
        if (row.expense) {
          switch (row.type) {
            case "send":
              return t("account_send_money_invoice");
            case "receive":
              return t("account_receive_money_invoice");
            default:
              return "-";
          }
        } else if (row.customer) {
          switch (row.type) {
            case "invoice_service":
              return t("account_service_invoice");
            case "send_money_invoice":
              return t("account_send_money_invoice");
            case "receive_money_invoice":
              return t("account_receive_money_invoice");
            case "opening_balance":
              return t("account_opening_balance");
            default:
              return "-";
          }
        } else {
          return "-";
        }
      },
    },
    {
      header: t("account_amount"),
      accessor: (row) =>
        row.expense ? row.amount : row.customer ? row.value : "",
    },
    ...(filters.type === "customer"
      ? [
          {
            header: t("account_total"),
            accessor: (row) => row.total_value ?? "-",
          },
        ]
      : []),
  ];

  useEffect(() => {
    const fetchItems = async () => {
      if (!filters.type) {
        setItems([]);
        setFilters((prev) => ({ ...prev, id: "" }));
        return;
      }

      try {
        const endpoint =
          filters.type === "customer" ? "/get-all-customers" : "/expenses";
        const res = await API.get(endpoint);
        setItems(res.data.data || []);
      } catch (error) {
        console.error("فشل في جلب البيانات", error);
        setItems([]);
      }
    };

    fetchItems();
  }, [filters.type]);

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
      to: formatDate(lastDay),
      from: formatDate(firstDay),
    });
  }, []);

  const handleSearch = () => {
    if (!filters.type) {
      toast.error(t("account_select_type_first"));
      return;
    }
    if (!filters.id) {
      toast.error(t("account_select_name"));
      return;
    }

    setAppliedFilters(filters);
    setRefreshKey((prev) => prev + 1);
  };

  // كشف حساب الخزنة
  return (
    <div className="container mt-5">
      <Mytitle title={t("account_title")} />
      {/* 🟢 عرض الرصيد الحالي */}

      <div
        style={{ direction: !isEnglish ? "ltr" : "rtl" }}
        className="row  flex-row-reverse"
      >
        <div className="col-md-2">
          <MyInput
            as="select"
            value={filters.type}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: e.target.value,
                id: "",
              })
            }
            options={[
              { value: "", label: t("account_select_type") },
              { value: "customer", label: t("account_customers") },
              { value: "expense", label: t("account_expenses") },
            ]}
          />
        </div>

        {/* {filters.type && ( */}
        <div className="col-md-2">
          <MyInput
            as="select"
            value={filters.id}
            onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            options={[
              { value: "", label: t("account_select_name_label") },
              ...items.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </div>
        {/* )} */}

        <div className="col-md-2">
          <MyInput
            label={t("account_from")}
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            dontShowDay={true}
          />
        </div>

        <div className="col-md-2">
          <MyInput
            label={t("account_to")}
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            dontShowDay={true}
          />
        </div>

        <div className="col-md-1 d-flex align-items-center">
          <MyButton onClick={handleSearch} text={t("account_search")} />
        </div>
      </div>

      {appliedFilters && (
        <MyTable
          resource="account-statement"
          method="post"
          title={t("account_title")}
          body={appliedFilters}
          columns={columns}
          refreshKey={refreshKey}
          cashBalance={cashBalance}
          setCashBalance={setCashBalance}
          component="accountStatement"
        />
      )}
    </div>
  );
}

export default AccountStatement;
