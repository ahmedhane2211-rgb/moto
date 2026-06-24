import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faTrash } from "@fortawesome/free-solid-svg-icons";
import { SquarePen } from "lucide-react";
import Can from "../../Components/Can";

function PartnerWithdrawals() {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        partner_uuid: "",
        value: "",
        cash_type: "cash",
        date: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editId, setEditId] = useState(null);

    const [partners, setPartners] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await API.get("/partners");
                setPartners(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch partners", err);
            }
        };
        fetchPartners();
    }, [refreshKey]);

    const handleAdd = () => {
        setFormData({
            partner_uuid: "",
            value: "",
            cash_type: "cash",
            date: new Date().toISOString().split('T')[0],
        });
        setEditId(null);
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (withdrawal) => {
        setFormData({
            partner_uuid: withdrawal.partner?.uuid || "",
            value: withdrawal.value,
            cash_type: withdrawal.cash_type,
            date: withdrawal.date,
        });
        setEditId(withdrawal.uuid);
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
            await API.delete(`/owner-withdrawl/${deleteId}`);
            toast.success(t("partnerWithdrawals_deleteSuccess"));
            setRefreshKey((prev) => prev + 1);
            setShowDeleteModal(false);
            setDeleteId(null);
        } catch (err) {
            console.error(err);
            toast.error(t("partnerWithdrawals_deleteFail"));
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
                await API.put(`/owner-withdrawl/${editId}`, formData);
                toast.success(t("partnerWithdrawals_updateSuccess"));
            } else {
                await API.post("/owner-withdrawl", formData);
                toast.success(t("partnerWithdrawals_addSuccess"));
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
        { header: t("partnerWithdrawals_partnerName"), accessor: (row) => row.partner?.name || "-" },
        { header: t("partnerWithdrawals_amount"), accessor: "value" },
        {
            header: t("partnerWithdrawals_transferType"),
            accessor: (row) => row.cash_type ? t(`payment_${row.cash_type}`) : ""
        },
        { header: t("partnerWithdrawals_date"), accessor: "date" },
        {
            header: t("partnerWithdrawals_actions"),
            accessor: (row) => (
                <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
                    <Can permission="owner_withdrawl_create">
                        <button
                            className="btn btn-sm btn-primary mx-1 no-style"
                            onClick={() => handleEdit(row)}>
                            <SquarePen />
                        </button>
                    </Can>
                    <Can permission="owner_withdrawl_create">
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

    const transferTypeOptions = [
        { value: "cash", label: t("payment_cash") },
        { value: "bank_installment", label: t("payment_bank_installment") },
        { value: "direct_installment", label: t("payment_direct_installment") },
        { value: "network", label: t("payment_network") },
    ];

    return (
        <div className="container mt-5">
            <Mytitle title={t("partnerWithdrawals_title")} />

            <ModalForm
                show={showModal}
                onClose={() => setShowModal(false)}
                title={`${editId ? t("partnerWithdrawals_editTitle") : t("partnerWithdrawals_addTitle")}`}
                onSubmit={handleSubmit}
                loading={loading}
                mode="form">
                <MyInput
                    as="select"
                    label={t("partnerWithdrawals_partnerName")}
                    value={formData.partner_uuid}
                    onChange={(e) => setFormData({ ...formData, partner_uuid: e.target.value })}
                    error={errors.partner_uuid?.[0]}
                    options={[
                        { value: "", label: t("partnerWithdrawals_selectPartner") },
                        ...partners.map((p) => ({ value: p.uuid, label: p.name })),
                    ]}
                    required={true}
                />
                
                <MyInput
                    label={t("partnerWithdrawals_amount")}
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    error={errors.value?.[0]}
                    required={true}
                />

                <MyInput
                    as="select"
                    label={t("partnerWithdrawals_transferType")}
                    value={formData.cash_type}
                    onChange={(e) => setFormData({ ...formData, cash_type: e.target.value })}
                    error={errors.cash_type?.[0]}
                    options={transferTypeOptions}
                    required={true}
                />

                <MyInput
                    label={t("partnerWithdrawals_date")}
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    error={errors.date?.[0]}
                    required={true}
                />
            </ModalForm>

            <ModalForm
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t("partnerWithdrawals_deleteTitle")}
                onSubmit={confirmDelete}
                loading={deleting}
                mode="confirm"
                confirmText={t("delete")}
                cancelText={t("cancel")}>
                {t("partnerWithdrawals_deleteQuestion")}
            </ModalForm>

            <MyTable
                resource="owner-withdrawl"
                title={t("partnerWithdrawals_title")}
                columns={columns}
                refreshKey={refreshKey}
                filters={[
                    { type: "text", name: "partner.name", label: t("partnerWithdrawals_searchByPartner") },
                ]}
                button={{
                    text: t("partnerWithdrawals_addButton"),
                    onClick: handleAdd,
                    permission: "owner_withdrawl_create",
                }}
            />
        </div>
    );
}

export default PartnerWithdrawals;
