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
import { SquarePen } from "lucide-react";

function SubAdmins() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    job_title: "",
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
      password: "",
      job_title: "",
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      name: record.name || "",
      email: record.email || "",
      password: "",
      job_title: record.job_title || "",
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
      await API.post(`/delete-sub-admin/${deleteId}`);
      console.log("تم حذف المدير بنجاح");
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      console.log("فشل الحذف");
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
        await API.post(`/update-sub-admin/${editId}`, formData);
        console.log("تم تعديل المدير بنجاح");
      } else {
        await API.post("/add-sub-admin", formData);
        console.log("تم إضافة المدير بنجاح");
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "الاسم", accessor: "name" },
    { header: "البريد الإلكتروني", accessor: "email" },
    { header: "المسمى الوظيفي", accessor: "job_title" },
    {
      header: "الإجراءات",
      accessor: (row) => (
        <>
          <Can permission="admin_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}>
              <SquarePen />
            </button>
          </Can>
          <Can permission="admin_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </Can>
          <Can permission="admin_permission_show">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() =>
                (window.location.href = `/admin/admin-permissions/${row.uuid}`)
              }>
              <FontAwesomeIcon icon={faShield} />
            </button>
          </Can>
        </>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title="المديرين الفرعيين" />
      <Can permission="admin_create">
        <MyButton
          text="إضافة مدير"
          variant="success"
          type="button"
          className="mb-3"
          onClick={handleAdd}
        />
      </Can>

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "تعديل المدير" : "إضافة مدير"}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form">
        <MyInput
          label="الاسم"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name?.[0]}
        />
        <MyInput
          label="البريد الإلكتروني"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email?.[0]}
        />
        <MyInput
          label="كلمة المرور"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password?.[0]}
        />
      </ModalForm>

      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد الحذف"
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText="حذف"
        cancelText="إلغاء">
        هل أنت متأكد أنك تريد حذف هذا المدير؟
      </ModalForm>

      <MyTable
        resource="sub-admins"
        columns={columns}
        refreshKey={refreshKey}
      />
    </div>
  );
}

export default SubAdmins;
