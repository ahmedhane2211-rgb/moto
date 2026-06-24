import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import PremiumUploader from "../../Components/PremiumUploader";
import { NegativeNumberDisplay } from "../../utils/formatNegativeNumber";
import { SquarePen } from "lucide-react";

function Employees() {
  const { t } = useTranslation();
  // Removed inspectionImagePreview state

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    national_id: "",
    phone: "",
    address: "",
    salary: "",
    active: true,
    branch_id: "",
    attachment: null,
    attachment_preview: null, // Added for PremiumUploader preview
  });
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    API.get("/branches")
      .then((res) => setBranches(res.data.data || []))
      .catch((err) => console.error("Failed to load branches", err));
  }, []);

  const handleAdd = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      national_id: null,
      phone: null,
      address: "",
      salary: "",
      branch_id: "",
      active: true,
      attachment: null,
      attachment_preview: null, // Reset preview on add
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setFormData({
      ...employee,
      attachment_preview: employee.attachment ? employee.attachment : null, // Set preview if attachment exists
    });
    setEditId(employee.uuid);
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
      await API.delete(`/employees/${deleteId}`);
      console.log(t("employees_deleteSuccess"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("employees_deleteFail"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    let newErrors = {};
    if (!formData.name) newErrors.name = [t("field_required")];
    if (!formData.national_id) newErrors.national_id = [t("field_required")];
    if (!formData.salary) newErrors.salary = [t("field_required")];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }

    setLoading(true);
    setErrors({});

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "attachment_preview") return;

      let value = formData[key];

      // Standardize boolean fields for backend (often expect 1/0)
      if (key === "active") {
        value = value === true || value === 1 || value === "1" ? "1" : "0";
      }

      if (key === "attachment") {
        if (value instanceof File) data.append(key, value);
      } else if (value !== null && value !== "" && value !== undefined) {
        data.append(key, value);
      }
    });

    try {
      if (editId) {
        await API.post(`/employees/${editId}?_method=PUT`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("employees_updateSuccess"));
      } else {
        await API.post("/employees", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("employees_addSuccess"));
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        // Improved error display: Show all validation error messages from the backend
        Object.keys(err.response.data.errors).forEach((field) => {
          err.response.data.errors[field].forEach((msg) => {
            toast.error(`${t(`employees_${field}`) || field}: ${msg}`);
          });
        });
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            t("employees_addFail") ||
            "Submission failed",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: t("employees_name"), accessor: "name" },
    { header: t("employees_branch"), accessor: "branch.name" },
    { header: t("employees_age"), accessor: "age" },
    {
      header: t("employees_gender"),
      accessor: (row) =>
        row.gender === "male"
          ? t("employees_male")
          : row.gender === "female"
            ? t("employees_female")
            : "-",
    },
    { header: t("employees_nationalId"), accessor: "national_id" },
    { header: t("employees_phone"), accessor: "phone" },
    { header: t("employees_address"), accessor: "address" },
    {
      header: t("employees_salary"),
      accessor: (row) => <NegativeNumberDisplay value={row.salary} />,
    },
    {
      header: t("employees_status"),
      accessor: (row) =>
        row.active ? t("employees_active") : t("employees_inactive"),
    },
    {
      header: t("employees_actions"),
      accessor: (row) => (
        <div
          style={{ width: "fit-content" }}
          className="d-flex border mx-auto rounded"
        >
          <Can permission="employee_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen />
            </button>
          </Can>
          <Can permission="employee_delete">
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
      <Mytitle title={t("employees_title")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("employees_editTitle") : t("employees_addTitle")} ${formData?.name || ""}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
        size="lg"
      >
        {/* السطر الأول: الحالة والفرع */}
        <div className="row">
          {editId && (
            <div className="col-md-6 mb-3">
              <MyInput
                value={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value })
                }
                error={errors.active?.[0]}
                as="select"
                options={[
                  { value: "", label: t("employees_selectStatus") },
                  { value: 1, label: t("employees_active") },
                  { value: 0, label: t("employees_inactive") },
                ]}
              />
            </div>
          )}

          <div className={editId ? "col-md-6 mb-3" : "col-md-12 mb-3"}>
            <MyInput
              label={t("employees_branch")}
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: e.target.value })
              }
              error={errors.branch_id?.[0]}
              as="select"
              options={[
                { value: "", label: t("employees_select_branch") },
                ...branches.map((b) => ({ value: b.uuid, label: b.name })),
              ]}
            />
          </div>
        </div>

        {/* السطر الثاني: الاسم والسن */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <MyInput
              label={t("employees_name")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name?.[0]}
              required={true}
            />
          </div>
          <div className="col-md-6 mb-3">
            <MyInput
              label={t("employees_age")}
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              error={errors.age?.[0]}
            />
          </div>
        </div>

        {/* السطر الثالث: الجنس والرقم القومي */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <MyInput
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              error={errors.gender?.[0]}
              as="select"
              options={[
                { value: "", label: t("employees_selectGender") },
                { value: "male", label: t("employees_male") },
                { value: "female", label: t("employees_female") },
              ]}
            />
          </div>
          <div className="col-md-6 mb-3">
            <MyInput
              label={t("employees_nationalId")}
              value={formData.national_id}
              onChange={(e) =>
                setFormData({ ...formData, national_id: e.target.value })
              }
              error={errors.national_id?.[0]}
              required={true}
            />
          </div>
        </div>

        {/* السطر الرابع: الهاتف والعنوان */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <MyInput
              label={t("employees_phone")}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              error={errors.phone?.[0]}
            />
          </div>
          <div className="col-md-6 mb-3">
            <MyInput
              label={t("employees_address")}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              error={errors.address?.[0]}
            />
          </div>
        </div>

        {/* السطر الخامس: المرتب (ممكن تخليه واخد نص السطر أو السطر كله) */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <MyInput
              label={t("employees_salary")}
              type="number"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              error={errors.salary?.[0]}
              required={true}
            />
          </div>
        </div>

        {/* المرفقات */}
        <div className="row">
          <div className="col-md-12 d-flex justify-content-center-center">
            <PremiumUploader
              title={t("attachments")}
              name="attachment"
              preview={formData.attachment_preview}
              onDelete={() => {
                setFormData({
                  ...formData,
                  attachment: null,
                  attachment_preview: null,
                });
              }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFormData({
                    ...formData,
                    attachment: e.target.files[0],
                    attachment_preview: URL.createObjectURL(e.target.files[0]),
                  });
                }
              }}
              accept="image/*"
            />
          </div>
        </div>
      </ModalForm>

      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("employees_deleteTitle")}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={t("employees_deleteConfirm")}
        cancelText={t("employees_cancel")}
      >
        {t("employees_deleteQuestion")}
      </ModalForm>

      <MyTable
        resource="employees"
        title={t("employees_title")}
        columns={columns}
        refreshKey={refreshKey}
        filters={[
          { type: "text", name: "name", label: t("employees_searchByName") },
          {
            type: "select",
            name: "active",
            label: t("employees_status"),
            options: [
              { value: "", label: t("employees_all") },
              { value: 1, label: t("employees_active") },
              { value: 0, label: t("employees_inactive") },
            ],
          },
        ]}
        button={{
          text: t("employees_addButton"),
          onClick: handleAdd,
          permission: "employee_create",
        }}
      />
    </div>
  );
}

export default Employees;
