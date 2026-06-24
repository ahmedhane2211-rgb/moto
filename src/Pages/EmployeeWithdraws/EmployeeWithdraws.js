import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { NegativeNumberDisplay } from "../../utils/formatNegativeNumber";
import { SquarePen } from "lucide-react";

function EmployeeWithdraws() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    value: "",
    cash_type: "cash",
    description: "",
    date: "",
    branch_uuid: "",
  });
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await API.get("employees");
        setEmployees(data.data || data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchBranches = async () => {
      try {
        const { data } = await API.get("branches");
        setBranches(data.data || data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
    fetchBranches();
  }, []);

  const handleAdd = () => {
    setFormData({
      employee_id: "",
      value: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      cash_type: "cash",
      branch_uuid: "",
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      employee_id: record.employee_id,
      value: record.value,
      description: record.description,
      date: record.date,
      cash_type: "cash",
      branch_uuid: record.branch_uuid || "",
    });
    setEditId(record.uuid);
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (uuid) => {
    setDeleteId(uuid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/services/${deleteId}`);
      toast.success(t("withdraw_deleted_success"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("delete_failed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    let newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = [t("field_required")];
    if (!formData.branch_uuid) newErrors.branch_uuid = [t("field_required")];
    if (!formData.value) newErrors.value = [t("field_required")];
    if (!formData.date) newErrors.date = [t("field_required")];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }
    const selectedEmployee = employees.find(
      (emp) => String(emp.id) === String(formData.employee_id),
    );

    const employeeSalary = Number(selectedEmployee?.salary || 0);
    const withdrawValue = Number(formData.value || 0);

    if (withdrawValue > employeeSalary) {
      toast.error(t("withdraw_cannot_exceed_salary"));
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      if (editId) {
        await API.put(`/employee-withdrowal/${editId}`, formData);
        toast.success(t("withdraw_updated_success"));
      } else {
        await API.post("/employee-withdrowal", formData);
        toast.success(t("withdraw_added_success"));
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        // Show all backend validation errors
        Object.keys(err.response.data.errors).forEach((field) => {
          err.response.data.errors[field].forEach((msg) => {
            toast.error(`${t(field) || field}: ${msg}`);
          });
        });
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            t("add_failed") ||
            "Submission failed",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (row) => {
    setSelectedCustomer(row);
    setShowDetailsModal(true);
  };

  const columns = [
    { header: t("employee_name"), accessor: "employee.name" },
    { header: t("national_id"), accessor: "employee.national_id" },
    {
      header: t("value"),
      accessor: (row) => <NegativeNumberDisplay value={row.value} />,
    },
    { header: t("description"), accessor: "description" },
    { header: t("date"), accessor: "date" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div
          style={{ width: "fit-content" }}
          className="d-flex border mx-auto rounded"
        >
          <Can permission="customer_show">
            <button
              className="btn btn-sm mx-1 extrabtn"
              onClick={() => handleShowDetails(row)}
              title={t("view_details")}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </Can>
          <Can permission="service_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen />
            </button>
          </Can>
          <Can permission="service_update">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];
  return (
    <div
      className="container mt-5"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ textAlign: isRTL ? "right" : "left" }}
    >
      <Mytitle title={t("employee_withdrawals")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("edit_withdraw") : t("add_withdraw")} ${formData.employee_id && employees.find((e) => String(e.id) === String(formData.employee_id)) ? `(${employees.find((e) => String(e.id) === String(formData.employee_id))?.name})` : ""}`.trim()}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
      >
        <MyInput
          as="select"
          label={t("employee_name")}
          value={formData.employee_id}
          onChange={(e) =>
            setFormData({ ...formData, employee_id: e.target.value })
          }
          error={errors.employee_id?.[0]}
          required={true}
          options={[
            { value: "", label: t("select_employee") },
            ...employees.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          ]}
        />

        <MyInput
          as="select"
          label={t("payment_method")}
          value={formData.cash_type}
          onChange={(e) =>
            setFormData({ ...formData, cash_type: e.target.value })
          }
          options={[
            { value: "cash", label: t("payment_cash") },
            { value: "network", label: t("payment_network") },
          ]}
          required={true}
        />

        <MyInput
          as="select"
          label={t("safe")}
          value={formData.branch_uuid}
          onChange={(e) =>
            setFormData({ ...formData, branch_uuid: e.target.value })
          }
          error={errors.branch_uuid?.[0]}
          required={true}
          options={[
            { value: "", label: t("employeeWithdrawals_selectSafe") },
            ...branches.map((b) => ({ value: b.uuid, label: b.name })),
          ]}
        />

        <MyInput
          label={t("value")}
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors.value?.[0]}
          required={true}
        />

        <MyInput
          label={t("date")}
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date?.[0]}
          required={true}
        />

        <MyInput
          label={t("description")}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </ModalForm>

      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("confirm_delete")}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={t("delete")}
        cancelText={t("cancel")}
      >
        {t("delete_withdraw_confirm")}
      </ModalForm>

      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`${t("withdraw_details")} ${selectedCustomer?.employee?.name ? `(${selectedCustomer.employee.name})` : ""}`.trim()}
        mode="print"
      >
        {selectedCustomer ? (
          <div className="withdrawal-details print-area">
            <div className="row mb-3 text-end">
              <div className="col-6">
                <strong>{t("employee_name")}:</strong>{" "}
                {selectedCustomer.employee?.name}
              </div>
              <div className="col-6">
                <strong>{t("national_id")}:</strong>{" "}
                {selectedCustomer.employee?.national_id}
              </div>
              <div className="col-6 mt-2">
                <strong>{t("value")}:</strong>{" "}
                <NegativeNumberDisplay value={selectedCustomer.value} />
              </div>
              <div className="col-6 mt-2">
                <strong>{t("description")}:</strong>{" "}
                {selectedCustomer.description || t("no_description")}
              </div>
            </div>
          </div>
        ) : (
          <p>{t("no_data")}</p>
        )}
      </ModalForm>

      <MyTable
        resource="employee-withdrowal"
        columns={columns}
        refreshKey={refreshKey}
        title={t("employee_withdrawals")}
        button={{
          text: t("add_withdraw"),
          onClick: handleAdd,
          variant: "success",
          permission: "service_create",
        }}
        filters={[
          {
            type: "text",
            name: "employee.national_id",
            label: t("national_id"),
          },
          {
            type: "text",
            name: "employee.name",
            label: t("search_employee"),
          },
        ]}
      />
    </div>
  );
}

export default EmployeeWithdraws;
