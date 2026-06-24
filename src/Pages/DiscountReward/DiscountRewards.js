import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyButton from "../../Components/MyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import MyTable from "../../Components/MyTable";
import { SquarePen } from "lucide-react";

function DiscountReward() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    value: "",
    note: "",
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
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    API.get("/employees")
      .then((res) => {
        setEmployees(res.data.data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("discountReward_loadEmployeesFail"));
      });
    API.get("/branches")
      .then((res) => setBranches(res.data.data || []))
      .catch((err) => console.error("Failed to load branches", err));
  }, [t]);

  const handleShowDetails = (record) => {
    setSelectedEmployee(record);
    setShowDetailsModal(true);
  };

  const handleAdd = () => {
    setFormData({
      employee_id: "",
      type: "",
      date: new Date().toISOString().split("T")[0],
      value: "",
      note: "",
      branch_uuid: "",
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({ ...record });
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
      await API.delete(`/discount-reward/${deleteId}`);
      console.log(t("discountReward_deleteSuccess"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("discountReward_deleteFail"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    let newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = [t("field_required")];
    if (!formData.type) newErrors.type = [t("field_required")];
    if (!formData.branch_uuid) newErrors.branch_uuid = [t("field_required")];
    if (!formData.date) newErrors.date = [t("field_required")];
    if (!formData.value) newErrors.value = [t("field_required")];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (editId) {
        await API.put(`/discount-reward/${editId}`, formData);
        toast.success(t("discountReward_updateSuccess"));
      } else {
        await API.post("/discount-reward", formData);
        toast.success(t("discountReward_addSuccess"));
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        // Show all backend validation errors
        Object.keys(err.response.data.errors).forEach((field) => {
          err.response.data.errors[field].forEach((msg) => {
            toast.error(`${t(`discountReward_${field}`) || field}: ${msg}`);
          });
        });
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            t("discountReward_addFail") ||
            "Submission failed",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: t("discountReward_employee"), accessor: "employee.name" },
    {
      header: t("discountReward_type"),
      accessor: (row) =>
        row.type === "discount"
          ? t("discountReward_discount")
          : t("discountReward_reward"),
    },
    { header: t("discountReward_date"), accessor: "date" },
    { header: t("discountReward_value"), accessor: "value" },
    {
      header: t("discountReward_actions"),
      accessor: (row) => (
        <div
          style={{ width: "fit-content" }}
          className="d-flex border mx-auto rounded"
        >
          <Can permission="empAdjustment_show">
            <button
              className="btn btn-sm mx-1 extrabtn"
              title={t("discountReward_viewDetails")}
              onClick={() => handleShowDetails(row)}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </Can>

          <Can permission="empAdjustment_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen />
            </button>
          </Can>

          <Can permission="empAdjustment_delete">
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
    <div className="container mt-5">
      <Mytitle title={t("discountReward_title")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${
          editId ? t("discountReward_editTitle") : t("discountReward_addTitle")
        } ${formData?.employee?.name || ""}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
      >
        <MyInput
          as="select"
          label={t("discountReward_employee")}
          value={formData?.employee_id}
          onChange={(e) =>
            setFormData({ ...formData, employee_id: e.target.value })
          }
          error={errors?.employee_id?.[0]}
          required={true}
          options={[
            { value: "", label: t("discountReward_selectEmployee") },
            ...employees?.map((emp) => ({
              value: emp?.id,
              label: emp?.name,
            })),
          ]}
        />

        <MyInput
          label={t("discountReward_type")}
          value={formData?.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          error={errors?.type?.[0]}
          as="select"
          required={true}
          options={[
            { value: "", label: t("discountReward_selectType") },
            { value: "discount", label: t("discountReward_discount") },
            { value: "reward", label: t("discountReward_reward") },
          ]}
        />

        <MyInput
          as="select"
          label={t("discountReward_safe")}
          value={formData?.branch_uuid}
          onChange={(e) =>
            setFormData({ ...formData, branch_uuid: e.target.value })
          }
          error={errors?.branch_uuid?.[0]}
          required={true}
          options={[
            { value: "", label: t("discountReward_selectSafe") },
            ...branches?.map((b) => ({ value: b?.uuid, label: b?.name })),
          ]}
        />

        <MyInput
          label={t("discountReward_date")}
          type="date"
          value={formData?.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors?.date?.[0]}
          required={true}
        />

        <MyInput
          label={t("discountReward_value")}
          type="number"
          value={formData?.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors?.value?.[0]}
          required={true}
        />

        <MyInput
          label={t("discountReward_note")}
          value={formData?.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          error={errors?.note?.[0]}
        />
      </ModalForm>

      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("discountReward_deleteTitle")}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={t("discountReward_deleteConfirm")}
        cancelText={t("discountReward_cancel")}
      >
        {t("discountReward_deleteQuestion")}
      </ModalForm>

      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`${t("discountReward_detailsTitle")} (${selectedEmployee?.employee?.name})`}
        mode="print"
      >
        {selectedEmployee ? (
          <div className="container text-end">
            <h5 className="text-center mb-5">
              {t("discountReward_title")} ({selectedEmployee?.id})
            </h5>
            <div className="row mb-3">
              <div className="col-6 mb-3">
                <strong>{t("discountReward_employee")}:</strong>{" "}
                {selectedEmployee?.employee?.name}
              </div>
              <div className="col-6 mb-3">
                <strong>{t("discountReward_type")}:</strong>{" "}
                {selectedEmployee?.type === "reward"
                  ? t("discountReward_reward")
                  : t("discountReward_discount")}
              </div>
              <div className="col-6 mb-3">
                <strong>{t("discountReward_value")}:</strong>{" "}
                {selectedEmployee?.value}
              </div>
              <div className="col-6 mb-3">
                <strong>{t("discountReward_note")}:</strong>{" "}
                {selectedEmployee?.note || "—"}
              </div>
              <div className="col-12 mb-3 text-end">
                <strong>{t("discountReward_date")}:</strong>{" "}
                {selectedEmployee?.date}
              </div>
            </div>
          </div>
        ) : (
          // <table className="table table-bordered"> // <thead> // <tr> // <th>التاريخ</th> // <th>الموظف</th> // <th>رقم الهاتف</th> // <th>النوع</th> // <th>القيمة</th> // <th>الوصف</th> // </tr> // </thead> // <tbody> // <tr> // <td>{selectedInvoice.date}</td> // <td>{selectedInvoice.employee?.name}</td> // <td>{selectedInvoice.employee?.phone}</td> // <td> // {selectedInvoice.cash_type === "cash" // ? "نقدي" // : selectedInvoice.cash_type === "bank" // ? "تحويل بنكي" // : "-"} // </td> // <td>{selectedInvoice.value}</td> // <td>{selectedInvoice.description || "-"}</td> // </tr> // </tbody> // </table>
          <p>{t("discountReward_noData")}</p>
        )}
      </ModalForm>

      <MyTable
        resource="discount-reward"
        columns={columns}
        refreshKey={refreshKey}
        title={t("discountReward_tableTitle")}
        filters={[
          {
            type: "text",
            name: "employee.name",
            label: t("discountReward_searchByEmployee"),
          },
          {
            type: "select",
            name: "type",
            label: t("discountReward_type"),
            options: [
              { value: "", label: t("discountReward_all") },
              { value: "reward", label: t("discountReward_reward") },
              { value: "discount", label: t("discountReward_discount") },
            ],
          },
        ]}
        dateFilter={{
          field: "created_at",
          label: t("discountReward_createdAt"),
        }}
        button={{
          text: t("discountReward_addTitle"),
          onClick: handleAdd,
          variant: "success",
          permission: "empAdjustment_create",
        }}
      />
    </div>
  );
}

export default DiscountReward;
