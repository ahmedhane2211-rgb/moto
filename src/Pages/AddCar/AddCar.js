import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import PremiumUploader from "../../Components/PremiumUploader";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";

function AddCar() {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [carImagePreview, setCarImagePreview] = useState(null);
    const [licenseImagePreview, setLicenseImagePreview] = useState(null);
    const [inspectionImagePreview, setInspectionImagePreview] = useState(null);
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        branche_id: "",
        brand: "",
        model: "",
        color: "",
        chassis_number: "",
        manufacture_year: "",
        plate_number: "",
        license_expiry_date: today,
        supplier_id: "",
        purchase_date: today,
        price: "",
        paid: "",
        remaining: "",
        payment_method: "",
        car_image: null,
        license_image: null,
        inspection_image: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editId, setEditId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);

    const [branches, setBranches] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load branches and suppliers
    useEffect(() => {
        loadBranches();
        loadSuppliers();
    }, []);

    // Auto-calculate remaining amount
    useEffect(() => {
        const price = parseFloat(formData.price) || 0;
        const paid = parseFloat(formData.paid) || 0;
        setFormData(prev => ({ ...prev, remaining: price - paid }));
    }, [formData.price, formData.paid]);

    const loadBranches = async () => {
        try {
            const response = await API.get("/branches");
            setBranches(response.data.data || []);
        } catch (err) {
            console.error("Failed to load branches", err);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await API.get("/customers");
            setSuppliers(response.data.data.filter((supplier)=> supplier.type === "supplier") || []);
        } catch (err) {
            console.error("Failed to load suppliers", err);
        }
    };

    const handleAdd = () => {
        setFormData({
            branche_id: "",
            brand: "",
            model: "",
            color: "",
            chassis_number: "",
            manufacture_year: "",
            plate_number: "",
            license_expiry_date: today,
            supplier_id: "",
            purchase_date: today,
            price: "",
            paid: "",
            remaining: "",
            payment_method: "",
            car_image: null,
            license_image: null,
            inspection_image: null,
        });
        setEditId(null);
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (record) => {
        setFormData({ 
            ...record,
            branche_id:  record.branche?.id,
            supplier_id: record.supplier?.id,
            manufacture_year: record.manufacture_year,
            price: record.price,
            paid: record.paid,
            remaining: record.remaining,
        });
        setEditId(record.uuid);
        setErrors({});
        setShowModal(true);

        // Set previews if images exist
        if (record.car_image) setCarImagePreview(record.car_image);
        if (record.license_image) setLicenseImagePreview(record.license_image);
        if (record.inspection_image) setInspectionImagePreview(record.inspection_image);
    };

    const handleView = async (record) => {
        try {
            const response = await API.get(`/cars/${record.uuid}`);
            setSelectedCar(response.data.data);
            setShowViewModal(true);
        } catch (err) {
            console.error("Failed to fetch car details", err);
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
            await API.delete(`/cars/${deleteId}`);
            toast.success(t("car_deleted_success"));
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
        const requiredFields = [
            "branche_id", "brand", "model", "color", "manufacture_year",
            "plate_number", "supplier_id", "purchase_date", "price",
            "paid", "remaining", "payment_method", "license_expiry_date"
        ];

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

        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] instanceof File) {
                formDataToSend.append(key, formData[key]);
            } else if (
                formData[key] !== null && 
                formData[key] !== "" && 
                formData[key] !== undefined &&
                typeof formData[key] !== "object"
            ) {
                formDataToSend.append(key, formData[key]);
            }
        });

        if (editId) {
            formDataToSend.append("_method", "PUT");
        }

        if (editId) {
            formDataToSend.append("_method", "PUT");
        }

        try {
            if (editId) {
                await API.post(`/cars/${editId}`, formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(t("car_updated_success"));
            } else {
                await API.post("/cars", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(t("car_added_success"));
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
        { header: t("branch"), accessor: "branche.name" },
        { header: t("brand"), accessor: "brand" },
        { header: t("model"), accessor: "model" },
        { header: t("plate_number"), accessor: "plate_number" },
        { header: t("supplier"), accessor: "supplier.name" },
        { header: t("price"), accessor: "price" },
        {
            header: t("actions"),
            accessor: (row) => (
                <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
                    <Can permission="car_show">
                        <button
                            className="btn btn-sm btn-info mx-1 no-style"
                            onClick={() => handleView(row)}>
                            <FontAwesomeIcon icon={faEye} />
                        </button>
                    </Can>
                    <Can permission="car_update">
                        <button
                            className="btn btn-sm btn-primary mx-1 no-style"
                            onClick={() => handleEdit(row)}>
                            <SquarePen />
                        </button>
                    </Can>
                    <Can permission="car_delete">
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
            <Mytitle title={t("add_new_car")} />

            <ModalForm
                show={showModal}
                onClose={() => setShowModal(false)}
                title={`${editId ? t("edit_car") : t("add_new_car")} ${formData?.plate_number || ""}`}
                onSubmit={handleSubmit}
                loading={loading}
                size="lg"
                mode="form">
                <div className="row">
                    {/* العمود الأيسر */}
                    <div className="col-md-6">
                        <MyInput
                            as="select"
                            label={t("branch")}
                            value={formData.branche_id}
                            onChange={(e) =>
                                setFormData({ ...formData, branche_id: e.target.value })
                            }
                            options={[
                                { value: "", label: t("select_branch") },
                                ...branches.map((branch) => ({
                                    value: branch.id,
                                    label: branch.name,
                                })),
                            ]}
                            error={errors.branche_id?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("brand")}
                            value={formData.brand}
                            onChange={(e) =>
                                setFormData({ ...formData, brand: e.target.value })
                            }
                            error={errors.brand?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("model")}
                            value={formData.model}
                            onChange={(e) =>
                                setFormData({ ...formData, model: e.target.value })
                            }
                            error={errors.model?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("color")}
                            value={formData.color}
                            onChange={(e) =>
                                setFormData({ ...formData, color: e.target.value })
                            }
                            error={errors.color?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("chassis_number")}
                            value={formData.chassis_number}
                            onChange={(e) =>
                                setFormData({ ...formData, chassis_number: e.target.value })
                            }
                            error={errors.chassis_number?.[0]}
                        />

                        <MyInput
                            label={t("manufacturing_year")}
                            type="number"
                            value={formData.manufacture_year}
                            onChange={(e) =>
                                setFormData({ ...formData, manufacture_year: e.target.value })
                            }
                            error={errors.manufacture_year?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("plate_number")}
                            value={formData.plate_number}
                            onChange={(e) =>
                                setFormData({ ...formData, plate_number: e.target.value })
                            }
                            error={errors.plate_number?.[0]}
                            required={true}
                        />
                    </div>

                    {/* العمود الأيمن */}
                    <div className="col-md-6">
                        <MyInput
                            as="select"
                            label={t("supplier")}
                            value={formData.supplier_id}
                            onChange={(e) =>
                                setFormData({ ...formData, supplier_id: e.target.value })
                            }
                            options={[
                                { value: "", label: t("select_supplier") },
                                ...suppliers.map((supplier) => ({
                                    value: supplier.id,
                                    label: supplier.name,
                                })),
                            ]}
                            error={errors.supplier_id?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("purchase_date")}
                            type="date"
                            value={formData.purchase_date}
                            onChange={(e) =>
                                setFormData({ ...formData, purchase_date: e.target.value })
                            }
                            error={errors.purchase_date?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("price")}
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                                setFormData({ ...formData, price: e.target.value })
                            }
                            error={errors.price?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("paid")}
                            type="number"
                            value={formData.paid}
                            onChange={(e) =>
                                setFormData({ ...formData, paid: e.target.value })
                            }
                            error={errors.paid?.[0]}
                            required={true}
                        />

                        <MyInput
                            label={t("remaining")}
                            type="number"
                            value={formData.remaining}
                            readOnly={true}
                            error={errors.remaining?.[0]}
                            required={true}
                        />


                        <MyInput
                            label={t("payment_method")}
                            as="select"
                            value={formData.payment_method}
                            onChange={(e) =>
                                setFormData({ ...formData, payment_method: e.target.value })
                            }
                            options={[
                                { value: "", label: t("serviceInvoices_selectPayment") },
                                { value: "cash", label: t("payment_cash") },
                                { value: "bank_installment", label: t("payment_bank_installment") },
                                { value: "deferred", label: t("payment_deferred") },
                                { value: "network", label: t("payment_network") },
                            ]}
                            error={errors.payment_method?.[0]}
                            required={true}
                        />


                        <MyInput
                            label={t("license_expiry_date")}
                            type="date"
                            value={formData.license_expiry_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    license_expiry_date: e.target.value,
                                })
                            }
                            error={errors.license_expiry_date?.[0]}
                            required={true}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <PremiumUploader
                            title={t("car_image")}
                            name="car_image"
                            preview={carImagePreview}
                            onDelete={() => {
                                setCarImagePreview(null);
                                setFormData({ ...formData, car_image: null });
                            }}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setCarImagePreview(URL.createObjectURL(e.target.files[0]));
                                    setFormData({ ...formData, car_image: e.target.files[0] });
                                }
                            }}
                            accept="image/*"
                        />
                    </div>

                    <div className="col-md-4">
                        <PremiumUploader
                            title={t("license_image")}
                            name="license_image"
                            preview={licenseImagePreview}
                            onDelete={() => {
                                setLicenseImagePreview(null);
                                setFormData({ ...formData, license_image: null });
                            }}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setLicenseImagePreview(URL.createObjectURL(e.target.files[0]));
                                    setFormData({ ...formData, license_image: e.target.files[0] });
                                }
                            }}
                            accept="image/*"
                        />
                    </div>

                    <div className="col-md-4">
                        <PremiumUploader
                            title={t("inspection_image")}
                            name="inspection_image"
                            preview={inspectionImagePreview}
                            onDelete={() => {
                                setInspectionImagePreview(null);
                                setFormData({ ...formData, inspection_image: null });
                            }}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setInspectionImagePreview(URL.createObjectURL(e.target.files[0]));
                                    setFormData({ ...formData, inspection_image: e.target.files[0] });
                                }
                            }}
                            accept="image/*"
                        />
                    </div>
                </div>
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
                {t("delete_car_confirm")}
            </ModalForm>

            <MyTable
                resource="cars"
                columns={columns}
                refreshKey={refreshKey}
                title={t("add_new_car")}
                button={{
                    text: t("add_new_car"),
                    onClick: handleAdd,
                    variant: "success",
                    permission: "car_create",
                }}
            />

            <ModalForm
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                title={`${t("view_car_details")} ${selectedCar?.plate_number}`}
                mode="view">
                {selectedCar && (
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="fw-bold">{t("branch")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.branche?.name || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("brand")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.brand || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("model")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.model || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("plate_number")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.plate_number || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("supplier")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.supplier?.name || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("price")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.price || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("paid")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.paid || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("remaining")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.remaining || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("payment_method")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{t(selectedCar.payment_method) || "-"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="fw-bold">{t("license_expiry_date")}:</label>
                            <p style={{borderBottom:"1px solid #5d5858"}} className="pb-2">{selectedCar.license_expiry_date || "-"}</p>
                        </div>
                        
                        <div className="col-12 mt-4">
                            <h5 className="mb-3 pb-2">{t("attachments")}</h5>
                            <div className="row">
                                {selectedCar.car_image && (
                                    <div className="col-md-4 text-center">
                                        <label className="d-block mb-2 small">{t("car_image")}</label>
                                        <a href={selectedCar.car_image} target="_blank" rel="noreferrer">
                                            <img src={selectedCar.car_image} className="img-fluid rounded border" style={{maxHeight: '150px'}} alt="car" />
                                        </a>
                                    </div>
                                )}
                                {selectedCar.license_image && (
                                    <div className="col-md-4 text-center">
                                        <label className="d-block mb-2 small">{t("license_image")}</label>
                                        <a href={selectedCar.license_image} target="_blank" rel="noreferrer">
                                            <img src={selectedCar.license_image} className="img-fluid rounded border" style={{maxHeight: '150px'}} alt="license" />
                                        </a>
                                    </div>
                                )}
                                {selectedCar.inspection_image && (
                                    <div className="col-md-4 text-center">
                                        <label className="d-block mb-2 small">{t("inspection_image")}</label>
                                        <a href={selectedCar.inspection_image} target="_blank" rel="noreferrer">
                                            <img src={selectedCar.inspection_image} className="img-fluid rounded border" style={{maxHeight: '150px'}} alt="inspection" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </ModalForm>
        </div>
    );
}

export default AddCar;
