import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { SquarePen } from "lucide-react";
import Can from "../../Components/Can";

function Banks() {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        required_documents: "",
        branch_address: "",
        is_active: 1,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editId, setEditId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);

    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleAdd = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            required_documents: "",
            branch_address: "",
            is_active: 1,
        });
        setEditId(null);
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (record) => {
        setFormData({ 
            ...record,
            is_active: record.is_active ?? 1
         });
        setEditId(record.uuid);
        setErrors({});
        setShowModal(true);
    };

    const handleView = async (record) => {
        try {
            const response = await API.get(`/banks/${record.uuid}`);
            setSelectedBank(response.data.data);
            setShowViewModal(true);
        } catch (err) {
            console.error("Failed to fetch bank details", err);
            toast.error(t("failed_to_fetch_details"));
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/banks/${deleteId}`);
            setRefreshKey((prev) => prev + 1);
            setShowDeleteModal(false);
            setDeleteId(null);
            toast.success(t("bank_deleted_success"));
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
                await API.put(`/banks/${editId}`, formData);
                toast.success(t("bank_updated_success"));
            } else {
                await API.post("/banks", formData);
                toast.success(t("bank_added_success"));
            }
            setShowModal(false);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                toast.error(t("general_error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: t("bank_name"), accessor: "name" },
        { header: t("bank_branch_address"), accessor: "branch_address" },
        { header: t("bank_phone"), accessor: "phone" },
        { header: t("bank_email"), accessor: "email" },
        { 
            header: t("bank_status"), 
            accessor: (row) => row.is_active ? t("active") : t("inactive") 
        },
        {
            header: t("actions"),
            accessor: (row) => (
                <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
                    <Can permission="bank_show">
                        <button
                            className="btn btn-sm btn-info mx-1 no-style"
                            onClick={() => handleView(row)}>
                            <FontAwesomeIcon icon={faEye} />
                        </button>
                    </Can>
                    <Can permission="bank_update">
                        <button
                            className="btn btn-sm btn-primary mx-1 no-style"
                            onClick={() => handleEdit(row)}>
                            <SquarePen />
                        </button>
                    </Can>
                    <Can permission="bank_delete">
                        <button
                            className="btn btn-sm btn-danger no-style"
                            onClick={() => handleDeleteClick(row.uuid)}>
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
            <Mytitle title={t("banks")} />

            <ModalForm
                show={showModal}
                onClose={() => setShowModal(false)}
                title={
                    `${editId
                        ? t("edit_bank")
                        : t("add_bank")
                } ${editId ? formData?.name : ""}`}
                onSubmit={handleSubmit}
                loading={loading}
                mode="form">
                <div className="row">
                    <div className="col-md-6">
                        <MyInput
                            label={t("bank_name")}
                            value={formData?.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            error={errors.name?.[0]}
                            required={true}
                        />
                    </div>

                    <div className="col-md-6">
                        <MyInput
                            label={t("bank_branch_address")}
                            value={formData?.branch_address}
                            onChange={(e) =>
                                setFormData({ ...formData, branch_address: e.target.value })
                            }
                            error={errors.branch_address?.[0]}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <MyInput
                            label={t("bank_phone")}
                            type="text"
                            value={formData?.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            error={errors.phone?.[0]}
                        />
                    </div>

                    <div className="col-md-6">
                        <MyInput
                            label={t("bank_email")}
                            type="email"
                            value={formData?.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            error={errors.email?.[0]}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <MyInput
                            label={t("required_documents")}
                            type="textarea"
                            value={formData?.required_documents}
                            onChange={(e) =>
                                setFormData({ ...formData, required_documents: e.target.value })
                            }
                            error={errors.required_documents?.[0]}
                        />
                    </div>
                </div>

                {editId && (
                    <div className="row mt-3">
                        <div className="col-md-12">
                            <div className="form-check form-switch custom-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData?.is_active === 1 || formData?.is_active === true}
                                    onChange={(e) =>
                                        setFormData({ 
                                            ...formData, 
                                            is_active: e.target.checked ? 1 : 0 
                                        })
                                    }
                                />
                                <label className="form-check-label ms-2" htmlFor="is_active">
                                    {t("register.is_active")}
                                </label>
                            </div>
                        </div>
                    </div>
                )}
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
                {t("delete_bank_confirm")}
            </ModalForm>

            <MyTable
                resource="banks"
                columns={columns}
                refreshKey={refreshKey}
                title={t("banks")}
                button={{
                    text: t("add_bank"),
                    onClick: handleAdd,
                    variant: "success",
                    permission: "bank_create",
                }}
            />

            <ModalForm
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                title={`${t("view_bank_details")} ${selectedBank?.name}`}
                mode="view">
                {selectedBank && (
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="fw-bold">{t("bank_name")}:</label>
                            <p className="border-bottom pb-2">{selectedBank?.name || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("bank_branch_address")}:</label>
                            <p className="border-bottom pb-2">{selectedBank?.branch_address || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("bank_phone")}:</label>
                            <p className="border-bottom pb-2">{selectedBank?.phone || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("bank_email")}:</label>
                            <p className="border-bottom pb-2">{selectedBank?.email || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("bank_status")}:</label>
                            <p className="border-bottom pb-2">
                                {selectedBank?.is_active ? t("active") : t("inactive")}
                            </p>
                        </div>
                        <div className="col-md-12">
                            <label className="fw-bold">{t("required_documents")}:</label>
                            <p className="border-bottom pb-2" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedBank?.required_documents || "-"}
                            </p>
                        </div>
                    </div>
                )}
            </ModalForm>
        </div>
    );
}

export default Banks;
