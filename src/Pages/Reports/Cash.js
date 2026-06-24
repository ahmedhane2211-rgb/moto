import { useEffect, useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import { toast } from "react-toastify";
import API from "../../Api/axiosConfig";
import { useTranslation } from "react-i18next";
import { FloatingLabel, Form } from "react-bootstrap";

function Cash() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    branch_uuid: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cashBalance, setCashBalance] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    API.get("/branches")
      .then((res) => setBranches(res.data.data || []))
      .catch((err) => console.error("Failed to load branches", err));
  }, []);

  const columns = [
    { header: t("cash_date"), accessor: "date" },
    // {
    //   header: "النوع",
    //   accessor: (row) =>
    //     row.type === "invoice_service"
    //       ? "فاتورة خدمات"
    //       : row.type === "send_money_invoice"
    //       ? "سند صرف"
    //       : row.type === "receive_money_invoice"
    //       ? "سند قبض"
    //       : row.type === "owner_withdrawl"
    //       ? "مسحوبات المالك"
    //       : row.type === "salary"
    //       ? "الرواتب"
    //       : row.type === "cash_transfer"
    //       ? "تحويلات نقدية"
    //       : row.type === "employee_withdrawal"
    //       ? "مسحوبات الموظفين"
    //       : "معاملة مالية",
    // },
    {
      header: t("cash_invoice_number"),
      accessor: (row) => row.money_invoice?.invoice_number || "-",
    },
    { header: t("cash_operation_value"), accessor: "value" },
    { header: t("cash_balance_after"), accessor: "total_value" },
  ];

  const handleSearch = () => {
    if (!filters.branch_uuid) {
      toast.error(t("select_branch"));
      return;
    }

    setAppliedFilters(filters);
    setRefreshKey((prev) => prev + 1);
  };

  const totalValue = (value) => {
    setCashBalance(value);
  };

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

    setFilters((prev) => ({
      ...prev,
      to: formatDate(lastDay),
      from: formatDate(firstDay),
    }));
  }, []);

  return (
    <div className="container mt-5">
      <Mytitle title={t("cash_title")} />

      {cashBalance !== null && (
        <div
          className="alert alert-info text-end fw-bold"
          style={{ background: "" }}
        >
          {t("cash_current_balance")}{" "}
          {branches.find((b) => b.uuid === appliedFilters?.branch_uuid)?.name ||
            ""}{" "}
          :{" "}
          <span className="text-success">
            {Math.trunc(cashBalance?.total_value)}
          </span>
        </div>
      )}

      <div className="row flex-row-reverse mb-3">
        <div className="col-md-2">
          <MyInput
            label={t("cash_to")}
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            dontShowDay={true}
          />
        </div>
        <div className="col-md-2">
          <MyInput
            label={t("cash_from")}
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            dontShowDay={true}
          />
        </div>

        <div className="col-md-2">
          {/* <div className="form-group">
            <label className="form-label">{t("branch")}</label>
            <select
              className="form-control"
              value={filters.branch_uuid}
              onChange={(e) =>
                setFilters({ ...filters, branch_uuid: e.target.value })
              }
            >
              <option value="">{t("select_branch")}</option>
              {branches.map((branch) => (
                <option key={branch.uuid} value={branch.uuid}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div> */}

          <FloatingLabel label={t("branch")}>
            <Form.Select
              className="form-select mb-3"
              style={{ height: "38px" }}
              value={filters.branch_uuid}
              onChange={(e) =>
                setFilters({ ...filters, branch_uuid: e.target.value })
              }
            >
              <option value="">{t("select_branch")}</option>
              {branches.map((opt, j) => (
                <option key={j} value={opt.uuid}>
                  {opt.name}
                </option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </div>

        <div className="col-md-1 d-flex align-items-center">
          <MyButton onClick={handleSearch} text={t("cash_search")} />
        </div>
      </div>

      {appliedFilters && (
        <MyTable
          title={t("cash_title")}
          resource="cash-report"
          method="post"
          body={appliedFilters}
          columns={columns}
          refreshKey={refreshKey}
          cashBalance={cashBalance}
          setCashBalance={setCashBalance}
          totalValue={totalValue}
          button={{}}
          component="cash"
        />
      )}
    </div>
  );
}

export default Cash;
