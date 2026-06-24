import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyButton from "../../Components/MyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faShield, faTrash } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";

function SubUsers() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: null,
    password_confirmation: null,
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
      email: "",
      password: null,
      password_confirmation: null,
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      name: record.name,
      email: record.email,
      password: null,
      password_confirmation: null,
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
      await API.delete(`/sub-users/${deleteId}`);
      console.log(t("subusers_delete_success"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("subusers_delete_failed"));
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
        await API.put(`/sub-users/${editId}`, formData);
        console.log(t("subusers_update_success"));
      } else {
        await API.post("/sub-users", formData);
        console.log(t("subusers_add_success"));
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
    { header: t("subusers_name"), accessor: "name" },
    { header: t("subusers_email"), accessor: "email" },
    {
      header: t("subusers_actions"),
      accessor: (row) => (
        <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
          <Can permission="sub_user_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}>
              <SquarePen size={16} />
            </button>
          </Can>
          <Can permission="sub_user_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}>
              <FontAwesomeIcon icon={faTrash} style={{fontSize: "14px"}} />
            </button>
          </Can>

          <Can permission="permission_show">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() =>
                (window.location.href = `/user-permissions/${row.uuid}`)
              }>
              <FontAwesomeIcon icon={faShield} style={{fontSize: "14px"}} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">

      <Mytitle title={t("subusers_title")} />
      {/* <Can permission="sub_user_create">
        <MyButton
          text={t("subusers_add_button")}
          variant="success"
          type="button"
          className="mb-3"
          onClick={handleAdd}
          />
      </Can> */}
        

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={
          `${editId
            ? t("subusers_edit_title")
            : t("subusers_add_title")}
        ${editId ? formData.name: ""}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form">
        <MyInput
          label={t("subusers_name")}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name?.[0]}
        />
        <MyInput
          label={t("subusers_email")}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email?.[0]}
        />
        <MyInput
          label={t("subusers_password")}
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password?.[0]}
        />
        <MyInput
          label={t("subusers_password_confirm")}
          type="password"
          value={formData.password_confirmation}
          onChange={(e) =>
            setFormData({
              ...formData,
              password_confirmation: e.target.value,
            })
          }
        />
      </ModalForm>

      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("subusers_confirm_delete")}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={t("subusers_delete")}
        cancelText={t("subusers_cancel")}>
        {t("subusers_delete_confirm_text")}
      </ModalForm>

      <MyTable
        resource="sub-users"
        columns={columns}
        refreshKey={refreshKey}
        title={t("subusers_title")}
        button={{
          text: t("subusers_add_button"),
          onClick: handleAdd,
          variant: "success",
          permission: "sub_user_create",
        }}
      />
    </div>
  );
}

export default SubUsers;
