/* eslint-disable react/jsx-no-duplicate-props */
import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import numberToArabicWords, { numberToEnglishWords } from "../../Components/numberToArabicWords";
import { SquarePen } from "lucide-react";
import Can from "../../Components/Can";

function CarExpenses() {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        branch_id: "",
        notes: "",
        items: [
            {
                car_id: "",
                expense_name: "",
                amount: "",
                description: "",
            },
        ],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
    });
    const [appliedFilters, setAppliedFilters] = useState(null);

    const [cars, setCars] = useState([]);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        API.get("/branches")
            .then((res) => setBranches(res.data.data || []))
            .catch(() => console.error("Failed to load branches"));

        API.get("/cars")
            .then((res) => setCars(res.data.data || []))
            .catch(() => console.error("Failed to load cars"));
    }, []);

    const handleSearch = () => {
        setAppliedFilters(filters);
        setRefreshKey((prev) => prev + 1);
    };

    const total = formData.items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const handleAdd = () => {
        setFormData({
            date: new Date().toISOString().split("T")[0],
            branch_id: "",
            notes: "",
            items: [
                {
                    car_id: "",
                    expense_name: "",
                    amount: "",
                    description: "",
                },
            ],
        });
        setEditId(null);
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (record) => {
        setFormData({ 
            ...record,
            branch_id: record.branch?.id || record.branch_id || "",
            items: record.items?.map(item => ({
                ...item,
                car_id: item.car?.id || item.car_id || "",
                expense_name: item.expense_name || item.service?.name || "",
                amount: item.amount || item.value || item.cost || "",
                description: item.description || item.payer || ""
            })) || [
                { car_id: "", expense_name: "", amount: "", description: "" }
            ]
        });
        setEditId(record.uuid);
        setErrors({});
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/cars-expense/${deleteId}`);
            setRefreshKey((prev) => prev + 1);
            setShowDeleteModal(false);
            setDeleteId(null);
            toast.success(t("services_invoice_deleted"));
        } catch (err) {
            toast.error(t("services_delete_failed"));
        } finally {
            setDeleting(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...formData.items];
        if (field === "amount" || field === "car_id") {
            updated[index][field] = value === "" ? "" : Number(value);
        } else {
            updated[index][field] = value;
        }

        setFormData({ ...formData, items: updated });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    car_id: "",
                    expense_name: "",
                    amount: "",
                    description: "",
                },
            ],
        });
    };

    const removeItem = (index) => {
        const updated = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            if (editId) {
                await API.put(`/cars-expense/${editId}`, formData);
            } else {
                await API.post("/cars-expense", formData);
            }
            setShowModal(false);
            setRefreshKey((prev) => prev + 1);
            toast.success(editId ? t("services_invoice_updated") : t("services_invoice_added"));
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                toast.error(t("services_save_error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: t("branch"), accessor: "branch.name" },
        { header: t("date"), accessor: "date" },
        { header: t("total"), accessor: "total" },
        { header: t("notes"), accessor: "notes" },

        {
            header: t("actions"),
            accessor: (row) => (
                <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
                    <Can permission="car_expense_update">
                        <button
                            className="btn btn-sm btn-primary mx-1 no-style"
                            onClick={() => handleEdit(row)}>
                            <SquarePen />
                        </button>
                    </Can>
                    <Can permission="car_expense_delete">
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

    // Removing simplified profit calculation since it's not currently used in UI
    // const profit = 0; 


    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        setFilters({
            ...filters,
            to: formatDate(lastDay),
            from: formatDate(firstDay),
        });
    }, []);

    return (
        <div className="container mt-5">
            <Mytitle title={t("car_expenses_title")} />

            <div style={{width:"fit-content"}} className="d-flex justify-content-between mb-3 no-print">
                <Can permission="car_expense_create">
                    <MyButton
                        text={t("car_expenses_add_invoice")}
                        variant="success"
                        type="button"
                        onClick={handleAdd}
                    />
                </Can>
            </div>

            <ModalForm
                show={showModal}
                onClose={() => setShowModal(false)}
                title={`${editId ? t("car_expenses_edit_invoice") : t("car_expenses_add_invoice")} ${formData.id ? `(${formData.id})` : ""}`}
                onSubmit={handleSubmit}
                loading={loading}
                mode="form"
                className="invoices-modal">
                <div className="form-grid">
                    <div className="form-group">
                        <MyInput
                            as="select"
                            label={t("car_expenses_select_branch")}
                            value={formData.branch_id}
                            onChange={(e) =>
                                setFormData({ ...formData, branch_id: e.target.value === "" ? "" : Number(e.target.value) })
                            }
                            error={errors.branch_id?.[0]}
                            options={[
                                { value: "", label: t("car_expenses_select_branch") },
                                ...branches.map((b) => ({ value: b.id, label: b.name })),
                            ]}
                            disabled={editId}
                        />
                    </div>
                    <div className="form-group">
                        <MyInput
                            label={t("services_date")}
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            error={errors.date?.[0]}
                        />
                    </div>

                    <div className="form-group">
                        <MyInput
                            label={t("notes")}
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            error={errors.notes?.[0]}
                        />
                    </div>
                </div>

                <div className="scroll-invoice-table">
                    <button
                        type="button"
                        className="add-service-btn"
                        onClick={addItem}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>

                    <table className="services-table">
                        <thead>
                            <tr>
                                <th style={{ width: "200px" }}>{t("expense_name")}</th>
                                <th style={{ width: "200px" }}>{t("car")}</th>
                                <th style={{ width: "120px" }}>{t("amount")}</th>
                                <th>{t("description")}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            value={item.expense_name}
                                            onChange={(e) =>
                                                handleItemChange(index, "expense_name", e.target.value)
                                            }
                                            placeholder={t("expense_name")}
                                        />
                                        {errors[`items.${index}.expense_name`] && (
                                            <div className="text-danger small">{errors[`items.${index}.expense_name`][0]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            value={item.car_id}
                                            onChange={(e) =>
                                                handleItemChange(index, "car_id", e.target.value)
                                            }>
                                            <option value="">{t("select_car")}</option>
                                            {cars.map((car) => (
                                                <option key={car.id} value={car.id}>
                                                    {car.brand} - {car.model} ({car.plate_number})
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`items.${index}.car_id`] && (
                                            <div className="text-danger small">{errors[`items.${index}.car_id`][0]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) =>
                                                handleItemChange(index, "amount", e.target.value)
                                            }
                                        />
                                        {errors[`items.${index}.amount`] && (
                                            <div className="text-danger small">{errors[`items.${index}.amount`][0]}</div>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            value={item.description}
                                            onChange={(e) =>
                                                handleItemChange(index, "description", e.target.value)
                                            }
                                            placeholder={t("description")}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="delete-service-btn"
                                            onClick={() => removeItem(index)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #121e41ff", borderRadius: "5px" }}>
                    <h5 style={{ marginBottom: "15px", color: "#ffffffff" }}>{t("car_expenses_payment_details")}</h5>



                    <div style={{ padding: "15px", backgroundColor: "rgb(11 55 105)", borderRadius: "5px" }}>
                        <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>
                            {t("car_expenses_amount_paid")}: {total.toFixed(2)} {t("car_expenses_currency")}
                        </div>

                        <div style={{ padding: "10px", backgroundColor: "rgb(11 55 105)", border: "1px solid #091e35ff", borderRadius: "3px" }}>
                            <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                                {t("car_expenses_amount_in_words")}
                            </div>
                            <div style={{ fontSize: "14px", color: "#ffffffff" }}>
                                {t("car_expenses_only")} {" "}
                                {localStorage.getItem("i18nextLng") === "ar"
                                    ? numberToArabicWords(total)
                                    : numberToEnglishWords(total)
                                } {" "}

                                {t("car_expenses_currency")}  {t("car_expenses_no_more")}

                            </div>
                        </div>
                    </div>
                </div>

            </ModalForm>

            <ModalForm
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t("services_confirm_delete")}
                onSubmit={confirmDelete}
                loading={deleting}
                mode="confirm"
                confirmText={t("services_delete")}
                cancelText={t("services_cancel")}>
                {t("services_delete_confirm_text")}
            </ModalForm>

            <div className="row mb-3 no-print date-filter-row">
                <div className="col-md-2">
                    <MyInput
                        label={t("services_from")}
                        type="date"
                        value={filters.from}
                        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                        dontShowDay={true}
                    />
                </div>

                <div className="col-md-2">
                    <MyInput
                        label={t("services_to")}
                        type="date"
                        value={filters.to}
                        dontShowDay={true}
                        min={filters.from} 
                        onChange={(e) => {
                          if (filters.from && e.target.value < filters.from) {
                            setFilters({ ...filters, to: filters.from });
                          } else {
                            setFilters({ ...filters, to: e.target.value });
                          }
                        }}
                    />
                </div>

                <div className="col-md-1 d-flex align-items-center">
                    <MyButton onClick={handleSearch} text={t("services_search")} />
                </div>
            </div>

            <MyTable
                resource="cars-expense"
                method="get"
                title={t("car_expenses_title")}
                body={appliedFilters}
                columns={columns}
                refreshKey={refreshKey}
            />
        </div>
    );
}

export default CarExpenses;
