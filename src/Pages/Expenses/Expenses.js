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

function Expenses() {
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
      await API.delete(`/expenses/${deleteId}`);
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("expenses_deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editId) {
        await API.put(`/expenses/${editId}`, formData);
      } else {
        await API.post("/expenses", formData);
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
    { header: t("expenses_name"), accessor: "name" },
    { header: t("expenses_description"), accessor: "description" },
    {
      header: t("expenses_actions"),
      accessor: (row) => (
        <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
          <Can permission="expense_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}>
              <SquarePen size={16} />
            </button>
          </Can>
          <Can permission="expense_delete">
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
      <Mytitle title={t("expenses_title")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`
          ${editId
            ? t("expenses_editExpense")
            : t("expenses_addExpense")
        } ${formData?.name || ''}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form">
        <MyInput
          label={t("expenses_name")}
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          error={errors.name?.[0]}
          required={true}
        />

        <MyInput
          label={t("expenses_description")}
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
        title={t("expenses_deleteConfirmTitle")}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={t("expenses_delete")}
        cancelText={t("expenses_cancel")}>
        {t("expenses_deleteMessage")}
      </ModalForm>

      <MyTable
        resource="expenses"
        columns={columns}
        refreshKey={refreshKey}
        title={t("expenses_title")}
        button={{
          text: t("expenses_addExpense"),
          onClick: handleAdd,
          variant: "success",
          permission: "expense_create",
        }}
      />
    </div>
  );
}

export default Expenses;
