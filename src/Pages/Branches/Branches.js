import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";

function Branches() {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        notes: "",
        is_active: 1,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editId, setEditId] = useState(null);

    const handleAdd = () => {
        setFormData({
            name: "",
            phone: "",
            address: "",
            notes: "",
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
                await API.put(`/branches/${editId}`, formData);
                toast.success(t("branch_updated_success"));
            } else {
                await API.post("/branches", formData);
                toast.success(t("branch_added_success"));
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
        { header: t("phone"), accessor: "phone" },
        { header: t("address"), accessor: "address" },
        { header: t("notes"), accessor: "notes" },
        {
            header: t("actions"),
            accessor: (row) => (
                <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
                    <Can permission="branch_update">
                        <button
                            className="btn btn-sm btn-primary mx-1 no-style"
                            onClick={() => handleEdit(row)}>
                            <SquarePen />
                        </button>
                    </Can>
                </div>
            ),
            hideOnPrint: true,
        },
    ];

    return (
        <div className="container mt-5">
            <Mytitle title={t("branches")} />

            <ModalForm
                show={showModal}
                onClose={() => setShowModal(false)}
                title={`${editId ? t("edit_branch") : t("add_branch")} ${formData?.name || ''}`}
                onSubmit={handleSubmit}
                loading={loading}
                mode="form">
                <MyInput
                    label={t("branch_name")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name?.[0]}
                    required={true}
                />
                <MyInput
                    label={t("phone")}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone?.[0]}
                />
                <MyInput
                    label={t("address")}
                    value={formData.address}
                    onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                    }
                    error={errors.address?.[0]}
                />
                <MyInput
                    label={t("notes")}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    error={errors.notes?.[0]}
                />
                {editId && (
                    <div className="mb-3">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="is_active"
                                checked={Boolean(formData.is_active)}
                                onChange={(e) =>
                                    setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })
                                }
                            />
                            <label className="form-check-label" htmlFor="is_active">
                                {t("register.is_active")}
                            </label>
                        </div>
                    </div>
                )}
            </ModalForm>

            <MyTable
                resource="branches"
                columns={columns}
                refreshKey={refreshKey}
                title={t("branches")}
                button={{
                    text: t("add_branch"),
                    onClick: handleAdd,
                    variant: "success",
                    permission: "branch_create",
                }}
            />
        </div>
    );
}

export default Branches;
