import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faTrash } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";

function Licences() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      name: record.name,
      description: record.description,
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
      await API.delete(`/licenseTypes/${deleteId}`);
      toast.success(t("licence_deleted_success"));
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
    if (!formData.name) newErrors.name = [t("field_required")];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (editId) {
        await API.put(`/licenseTypes/${editId}`, formData);
        toast.success(t("licence_updated_success"));
      } else {
        await API.post("/licenseTypes", formData);
        toast.success(t("licence_added_success"));
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: t("licence_name"), accessor: "name" },
    { header: t("notes"), accessor: "description" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
          <Can permission="license_type_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen />
            </button>
          </Can>
          <Can permission="license_type_delete">
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
      <Mytitle title={t("licences")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("edit_licence") : t("add_licence")} ${formData?.name || ''}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
      >
        <MyInput
          label={t("licence_name")}
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          error={errors.name?.[0]}
          required={true}
        />

        <MyInput
          label={t("notes")}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          error={errors.description?.[0]}
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
        {t("delete_licence_confirm")}
      </ModalForm>

      <MyTable
        resource="licenseTypes"
        columns={columns}
        refreshKey={refreshKey}
        title={t("licences")}
        button={{
          text: t("add_licence"),
          onClick: handleAdd,
          variant: "success",
          permission: "license_type_create",
        }}
      />
    </div>
  );
}

export default Licences;
