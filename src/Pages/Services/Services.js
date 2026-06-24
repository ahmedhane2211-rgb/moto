import { useState, useEffect } from "react";
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
import Seo from "../../Components/Seo";

function Services() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        setCategories(data.data || data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setFormData({ name: "", category_id: "" });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      name: record.name,
      category_id: record.category_id,
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
      toast.success(t("service_deleted_success"));
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
        await API.put(`/services/${editId}`, formData);
        toast.success(t("service_updated_success"));
      } else {
        await API.post("/services", formData);
        toast.success(t("service_added_success"));
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
    { header: t("category"), accessor: "category.name" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
          <Can permission="service_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}>
              <SquarePen size={16} />
            </button>
          </Can>
          <Can permission="service_delete">
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
    <>
    <Seo title={t("seo.traffic_title")} description={t("seo.traffic_description")}/>
    <div className="container mt-5">
      <Mytitle title={t("services")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("edit_service") : t("add_service")} ${formData?.name || ""}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form">
        <MyInput
          label={t("service_name")}
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          error={errors.name?.[0]}
          required={true}
        />

        <MyInput
          as="select"
          label={t("category")}
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          options={[
            { value: "", label: t("select_category") },
            ...categories.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          ]}
          error={errors.category_id?.[0]}
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
        {t("delete_service_confirm")}
      </ModalForm>

      <MyTable
        resource="services"
        columns={columns}
        refreshKey={refreshKey}
        title={t("services")}
        button={{
          text: t("add_service"),
          onClick: handleAdd,
          variant: "success",
          permission: "service_create",
        }}
      />
    </div>
    </>
  );
}

export default Services;
