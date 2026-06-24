import { useState } from "react";
import { useTranslation } from "react-i18next";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { SquarePen } from "lucide-react";
import { formatNumbersToDecimals } from "../../utils/formatNumbersToDecimals";

function Partners() {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        share_percentage: "",
        amount: "",
        national_id: "",
        phone: "",
        address: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editId, setEditId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleAdd = () => {
        setFormData({
            name: "",
            share_percentage: "",
            amount: "",
            national_id: "",
            phone: "",
            address: "",
        });
        setEditId(null);
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (partner) => {
        setFormData({ ...partner });
        setEditId(partner.uuid);
        setErrors({});
        setShowModal(true);
    };

    const handleView = async (partner) => {
        try {
            const response = await API.get(`/partners/${partner.uuid}`);
            setSelectedPartner(response.data.data);
            setShowViewModal(true);
        } catch (err) {
            console.error("Failed to fetch partner details", err);
            toast.error(t("failed_to_fetch_details"));
        }
    };

    const handleDeleteClick = (uuid) => {
        setDeleteId(uuid);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/partners/${deleteId}`);
            toast.success(t("partners_deleteSuccess"));
            setRefreshKey((prev) => prev + 1);
            setShowDeleteModal(false);
            setDeleteId(null);
        } catch (err) {
            console.error(err);
            toast.error(t("partners_deleteFail"));
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        let newErrors = {};
        const requiredFields = ["name", "share_percentage", "amount", "national_id", "phone", "address"];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = [t("field_required")];
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            if (formData.share_percentage >= 100) {
                    return toast.error(t("partners_sharePercentage"))
                }
            if (editId) {
                await API.put(`/partners/${editId}`, formData);
                toast.success(t("partners_updateSuccess"));
            } else {
                
                await API.post("/partners", formData);
                toast.success(t("partners_addSuccess"));
            }
            setShowModal(false);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
                // Show all backend validation errors
                Object.keys(err.response.data.errors).forEach((field) => {
                    err.response.data.errors[field].forEach((msg) => {
                        toast.error(`${t(`partners_${field}`) || field}: ${msg}`);
                    });
                });
            } else {
                toast.error(err.response?.data?.message || err.message || t("general_error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: t("partners_name"), accessor: "name" },
        { header: t("partners_ratio"), accessor: "share_percentage" },
        { header: t("partners_amount"), accessor: (row) => formatNumbersToDecimals(row.amount) },
        { header: t("partners_nationalId"), accessor: "national_id" },
        { header: t("partners_phone"), accessor: "phone" },
        { header: t("partners_address"), accessor: "address" },
        {
            header: t("partners_actions"),
            accessor: (row) => (
                <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
                    <Can permission="partner_show">
                        <button
                            className="btn btn-sm btn-info mx-1 no-style"
                            onClick={() => handleView(row)}>
                            <FontAwesomeIcon icon={faEye} />
                        </button>
                    </Can>
                    <Can permission="partner_update">
                        <button
                            className="btn btn-sm btn-primary mx-1 no-style"
                            onClick={() => handleEdit(row)}>
                            <SquarePen />
                        </button>
                    </Can>
                    <Can permission="partner_delete">
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
            <Mytitle title={t("partners_title")} />

            <ModalForm
                show={showModal}
                onClose={() => setShowModal(false)}
                title={`${editId ? t("partners_editTitle") : t("partners_addTitle")} ${formData?.name || ''}`}
                onSubmit={handleSubmit}
                loading={loading}
                mode="form">

                <MyInput
                    label={t("partners_name")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name?.[0]}
                    required={true}
                />
                <MyInput
                    label={t("partners_ratio")}
                    type="number"
                    value={formData.share_percentage}
                    onChange={(e) => setFormData({ ...formData, share_percentage: e.target.value })}
                    error={errors.share_percentage?.[0]}
                    required={true}
                />
                <MyInput
                    label={t("partners_amount")}
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    error={errors.amount?.[0]}
                    required={true}
                />
                <MyInput
                    label={t("partners_nationalId")}
                    value={formData.national_id}
                    type="number"
                    onChange={(e) =>
                        setFormData({ ...formData, national_id: e.target.value })
                    }
                    error={errors.national_id?.[0]}
                    required={true}
                />
                <MyInput
                    label={t("partners_phone")}
                    value={formData.phone}
                    type="number"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone?.[0]}
                    required={true}
                />
                <MyInput
                    label={t("partners_address")}
                    value={formData.address}
                    onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                    }
                    error={errors.address?.[0]}
                    required={true}
                />
            </ModalForm>

            <ModalForm
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t("partners_deleteTitle")}
                onSubmit={confirmDelete}
                loading={deleting}
                mode="confirm"
                confirmText={t("delete")}
                cancelText={t("cancel")}>
                {t("partners_deleteQuestion")}
            </ModalForm>

            <MyTable
                resource="partners"
                title={t("partners_title")}
                columns={columns}
                refreshKey={refreshKey}
                filters={[
                    { type: "text", name: "name", label: t("partners_searchByName") },
                ]}
                button={{
                    text: t("partners_addButton"),
                    onClick: handleAdd,
                    permission: "partner_create",
                }}
            />

            <ModalForm
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                title={`${t("partners_viewDetails")} ${selectedPartner?.name || ''}` }
                mode="view">
                {selectedPartner && (
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="fw-bold">{t("partners_name")}:</label>
                            <p className="border-bottom pb-2">{selectedPartner.name || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("partners_ratio")}:</label>
                            <p className="border-bottom pb-2">{selectedPartner.share_percentage || "0"}%</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("partners_amount")}:</label>
                            <p className="border-bottom pb-2">{selectedPartner.amount || "0"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("partners_nationalId")}:</label>
                            <p className="border-bottom pb-2">{selectedPartner.national_id || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("partners_phone")}:</label>
                            <p className="border-bottom pb-2">{selectedPartner.phone || "-"}</p>
                        </div>
                        <div className="col-md-12">
                            <label className="fw-bold">{t("partners_address")}:</label>
                            <p className="border-bottom pb-2">{selectedPartner.address || "-"}</p>
                        </div>
                    </div>
                )}
            </ModalForm>
        </div>
    );
}

export default Partners;
