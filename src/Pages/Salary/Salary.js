import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import API from "../../Api/axiosConfig";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { faEye, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Button } from "react-bootstrap";

import ModalForm from "../../Components/ModalForm";
import { formatNumbersToDecimals } from "../../utils/formatNumbersToDecimals";
import Can from "../../Components/Can";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function Salary() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const todayDate = today.toISOString().slice(0, 10);
  const [data, setData] = useState(null);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    date: "",
    branch_uuid: "",
  });
  const [branches, setBranches] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentUuid, setCurrentUuid] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // all | one
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cashType, setCashType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [storeCreatedAt, setStoreCreatedAt] = useState(null);
  const fetchUserData = () => {
    API.get("/user")
      .then((res) => {
        const createdAt = res.data.data.store.created_at;
        setStoreCreatedAt(new Date(createdAt));
        setData(res.data);
      })
      .catch((err) => {
        console.error(t("salary.errors.load_store_data"), err);
      });
  };

  useEffect(() => {
    fetchUserData();
    API.get("/branches")
      .then((res) => setBranches(res.data.data || []))
      .catch((err) => console.error("Failed to load branches", err));
  }, []);

  const getLastDayOfMonth = (year, month) =>
    new Date(year, month, 0 + 1).toISOString().slice(0, 10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    if (newFilters.year && newFilters.month) {
      const y = parseInt(newFilters.year);
      const m = parseInt(newFilters.month);

      if (y > currentYear || (y === currentYear && m > currentMonth)) {
        newFilters.date = "";
      } else if (y === currentYear && m === currentMonth) {
        newFilters.date = todayDate;
      } else {
        newFilters.date = getLastDayOfMonth(y, m);
      }
    } else {
      newFilters.date = "";
    }

    setFilters(newFilters);
  };

  const handleSearch = () => {
    if (!filters.year || !filters.month) {
      toast.error(t("select_year_month"));
      return;
    }
    if (!filters.date) {
      toast.error(t("future_date"));
      return;
    }
    setAppliedFilters(filters);
    setRefreshKey((prev) => prev + 1);
  };

  const handlePayAllConfirm = () => {
    setConfirmType("all");
    setShowConfirm(true);
  };

  const handlePayOneConfirm = (uuid) => {
    setSelectedUuid(uuid);
    setConfirmType("one");
    setShowConfirm(true);
  };

  // const handleConfirmAction = async () => {
  //     setLoading(true);
  //     try {
  //         if (confirmType === "all") {
  //             const res = await API.post("/salary-all", { date: appliedFilters.date });
  //             console.log(res.data.message || "تم صرف المرتب للجميع");
  //         } else if (confirmType === "one") {
  //             const res = await API.post("/salary-one", {
  //                 employee_uuid: selectedUuid,
  //                 date: appliedFilters.date,
  //             });
  //             console.log(res.data.message || "تم صرف المرتب للموظف");
  //         }
  //         setRefreshKey((prev) => prev + 1);
  //         setShowConfirm(false);
  //     } catch (error) {
  //         console.log(error.response?.data?.message || "فشل صرف المرتب");
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const handleConfirmAction = async () => {
    setLoading(true);
    try {
      if (confirmType === "all") {
        await API.post("/salary-all", {
          date: appliedFilters.date,
          cash_type: cashType,
        });
      } else if (confirmType === "one") {
        await API.post("/salary-one", {
          employee_uuid: selectedUuid,
          date: appliedFilters.date,
          cash_type: cashType,
        });
      }
      setRefreshKey((prev) => prev + 1);
      setShowConfirm(false);
      fetchUserData();
    } catch (error) {
      console.log(error.response?.data?.message || t("salary_pay_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = (uuid) => {
    setCurrentUuid(uuid);
    setShowUploadModal(true);
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toast.error(t("salary_select_image_first"));
      return;
    }

    if (!currentUuid) {
      toast.error(t("salary_employee_not_selected"));
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const res = await API.post(`/salary/image/${currentUuid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || t("salary_image_upload_success"));
      handleCloseUploadModal();
      setSelectedImage(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("salary_image_upload_failed"),
      );
    }
  };

  const handleCloseUploadModal = () => setShowUploadModal(false);
  const { theme } = useTheme();
  const columns = [
    { header: t("salary_name"), accessor: "name" },
    { header: t("salary_basic_salary"), accessor: (row) => formatNumbersToDecimals(row.basic_salary) },
    { header: t("salary_total_rewards"), accessor: (row) => formatNumbersToDecimals(row.total_rewards) },
    { header: t("salary_total_discounts"), accessor: (row) => formatNumbersToDecimals(row.total_discounts) },
    { header: t("salary_total_withdrawals"), accessor: (row) => formatNumbersToDecimals(row.total_withdrawals) },
    { header: t("salary_net_salary"), accessor: (row) => formatNumbersToDecimals(row.net_salary) },
    {
      header: t("salary_status"),
      accessor: (row) => (
        <span
          className={`${row.is_paid ? "fw-bold text-is-paid" : "text-color"}`}
        >
          {row.is_paid ? t("salary_paid") : t("salary_not_paid")}
        </span>
      ),
    },
    {
      header: t("salary_actions"),
      accessor: (row) => (
        <div
          style={{ width: "fit-content" }}
          className="d-flex border mx-auto rounded justify-content-between gap-3"
        >
          <button className="btn btn-sm me-1" title={t("salary_view_details")}>
            <Link
              to={`/salary-details/${row.uuid}`}
              className="btn btn-sm btn-info me-1 border-0"
              title={t("salary_view_details")}
              style={{ background: "#6c757d" }}
            >
              <FontAwesomeIcon icon={faEye} />
            </Link>
          </button>

          {!row.is_paid && (
            <Can permission="salary_create">
              <div style={{ width: "fit-content", margin: "auto" }}>
                <MyButton
                  text={t("salary_pay")}
                  onClick={() => handlePayOneConfirm(row.uuid)}
                />
              </div>
            </Can>
          )}

          <button
            className="btn btn-sm btn-secondary"
            title={t("salary_upload_image")}
            onClick={() => handleOpenUploadModal(row.uuid)}
          >
            <FontAwesomeIcon icon={faUpload} />
          </button>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  let years = [];
  let months = [];

  if (storeCreatedAt) {
    const startYear = storeCreatedAt.getFullYear();
    const startMonth = storeCreatedAt.getMonth() + 1;

    years = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => startYear + i,
    );

    months = [
      { value: 1, label: t("salary_january") },
      { value: 2, label: t("salary_february") },
      { value: 3, label: t("salary_march") },
      { value: 4, label: t("salary_april") },
      { value: 5, label: t("salary_may") },
      { value: 6, label: t("salary_june") },
      { value: 7, label: t("salary_july") },
      { value: 8, label: t("salary_august") },
      { value: 9, label: t("salary_september") },
      { value: 10, label: t("salary_october") },
      { value: 11, label: t("salary_november") },
      { value: 12, label: t("salary_december") },
    ];

    months = months.filter((m) => {
      if (filters.year === String(startYear) && m.value < startMonth)
        return false;
      if (filters.year === String(currentYear) && m.value > currentMonth)
        return false;
      return true;
    });
  }

  return (
    <div className="container mt-5 ">
      <Mytitle title={t("salary_title")} />

      <div className="container mb-3">
        <div className="row">
          <div className="d-flex justify-content-between align-items-center direction-rtl flex-wrap ">
            <div className="d-flex flex-wrap mb-2">
              <div className="me-2" style={{ width: "200px" }}>
                <MyInput
                label={t("salary_select_year")}
                  as="select"
                  name="year"
                  value={filters.year}
                  onChange={handleChange}
                  options={[
                    { value: "", label: t("salary_select_year") },
                    ...years.map((y) => ({ value: y, label: y })),
                  ]}
                />
              </div>

              <div className="me-2" style={{ width: "200px" }}>
                <MyInput
                label={t("salary_select_month")}
                  as="select"
                  name="month"
                  value={filters.month}
                  onChange={handleChange}
                  disabled={!filters.year}
                  options={[
                    { value: "", label: t("salary_select_month") },
                    ...months.map((m) => ({
                      value: m.value,
                      label: m.label,
                    })),
                  ]}
                />
              </div>

              <div className="me-2" style={{ width: "200px" }}>
                <MyInput
                label={t("salary_select_branch")}
                  as="select"
                  name="branch_uuid"
                  value={filters.branch_uuid}
                  onChange={handleChange}
                  options={[
                    { value: "", label: t("salary_select_branch") },
                    ...branches.map((b) => ({
                      value: b.uuid,
                      label: b.name,
                    })),
                  ]}
                />
              </div>

              <div className="d-flex align-items-center mx-3">
                <MyButton onClick={handleSearch} text={t("salary_search")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {appliedFilters && (
        <>
          <div className="mb-3 text-center">
            <h5 style={{ color: theme === "dark" ? "white" : "black" }}>
              {t("salary_report_for_month")}{" "}
              {
                months.find((m) => m.value === parseInt(appliedFilters.month))
                  ?.label
              }{" "}
              {appliedFilters.year}
            </h5>
          </div>

          <MyTable
            resource="salaryBefore"
            method="post"
            title={t("salary_title")}
            body={{
              date: appliedFilters.date,
              branch_uuid: appliedFilters.branch_uuid,
            }}
            columns={columns}
            refreshKey={refreshKey}
            // button={{
            //   text: "صرف الكل",
            //   onClick: handlePayAllConfirm,
            //   variant: "success",
            //   permission: "salary_create",
            // }}

            // isCompanySealOrLogoPrinted = {{logo: data.data.setting.company_logo, }}
          />
        </>
      )}

      <ModalForm
        show={showUploadModal}
        onClose={() => {
          handleCloseUploadModal();
          setSelectedImage(null);
          URL.revokeObjectURL(previewUrl);
        }}
        title={t("salary_upload_salary_image")}
        onSubmit={handleUploadImage}
        loading={loading}
        mode="upload"
        confirmText={t("salary_upload")}
        cancelText={t("salary_cancel")}
      >
        <div className="mb-3 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedImage(file);
                setPreviewUrl(URL.createObjectURL(file)); // ✅ أنشئ رابط مؤقت
              }
            }}
            className="form-control mb-3"
          />

          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl} // ✅ استخدم الرابط المؤقت
                alt={t("salary_preview")}
                style={{
                  maxWidth: "100%",
                  maxHeight: "250px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>
      </ModalForm>

      <ModalForm
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t("salary_confirm_payment")}
        onSubmit={handleConfirmAction}
        loading={loading}
        mode="confirm"
        confirmText={t("salary_yes")}
        cancelText={t("salary_cancel")}
      >
        {confirmType === "all"
          ? t("salary_confirm_pay_all")
          : t("salary_confirm_pay_one")}

        <div className="mb-3">
          <MyInput
            as="select"
            value={cashType}
            onChange={(e) => setCashType(e.target.value)}
            options={[
              { value: "", label: t("salary_select_cashbox") },
              { value: "cash", label: t("salary_cash") },
              { value: "bank", label: t("salary_bank") },
            ]}
          />
        </div>

        {cashType === "cash" && (
          <div className="text-muted mb-2" style={{ direction: "rtl" }}>
            {t("salary_available_cash")}{" "}
            <strong>{Math.trunc(data?.data.last_cash_balance) ?? 0}</strong>
          </div>
        )}

        {cashType === "bank" && (
          <div className="text-muted mb-2" style={{ direction: "rtl" }}>
            {t("salary_available_bank")}{" "}
            <strong>{Math.trunc(data?.data.last_bank_balance ?? 0)}</strong>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

export default Salary;
