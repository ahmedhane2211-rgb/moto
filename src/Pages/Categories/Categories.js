import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyButton from "../../Components/MyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faTrash } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";

function Categories() {
  const { t } = useTranslation();

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
    setFormData({
      name: "",
      description: "",
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
      await API.delete(`/categories/${deleteId}`);
      console.log(t("category_deleted_success"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
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
        await API.put(`/categories/${editId}`, formData);
        console.log(t("category_updated_success"));
      } else {
        await API.post("/categories", formData);
        console.log(t("category_added_success"));
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
    { header: t("name"), accessor: "name" },
    { header: t("description"), accessor: "description" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
          <Can permission="category_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}>
              <SquarePen size={16} />
            </button>
          </Can>
          <Can permission="category_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}>
              <FontAwesomeIcon icon={faTrash} style={{fontSize: "14px"}} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title={t("categories")} />

      {/* <Can permission="category_create">

                <MyButton
                    text={t("add_category")}
                    variant="success"
                    type="button"
                    className="mb-3"
                    onClick={handleAdd}
                />
            </Can> */}

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("edit_category") : t("add_category")} ${formData?.name || ''}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form">
        <MyInput
          label={t("name")}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name?.[0]}
          required={true}
        />
        <MyInput
          label={t("description")}
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
        cancelText={t("cancel")}>
        {t("delete_category_confirm")}
      </ModalForm>

      <MyTable
        resource="categories"
        columns={columns}
        refreshKey={refreshKey}
        title={t("categories")}
        button={{
          text: t("add_category"),
          onClick: handleAdd,
          variant: "success",
          permission: "category_create",
        }}
      />
    </div>
  );
}

export default Categories;
