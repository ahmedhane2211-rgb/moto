import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faFileSignature } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";
import axios from "axios";
import ContractPrint from "./ContractPrint";
import { useSettings } from "../../context/SettingsContext";

function CarRental() {
  const { t,i18n } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    branch_id: "",
    car_id: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    kilometer_before: "",
    // kilometer_after: "",
    late_fee_per_hour: "",
    guarantor_name: "",
    guarantor_national_id: "",
    license_number: "",
    license_expiry_date: "",
    license_source: "",
    license_type: "",
    total: "",
    paid: "",
    remaining: "",
    insurance: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const { settings } = useSettings();
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [cars, setCars] = useState([]);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);
  // Load data
  useEffect(() => {
    loadCustomers();
    loadBranches();
    loadCars();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await API.get("/get-customers");
      setCustomers(response.data.data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await API.get("/branches");
      setBranches(response.data.data || []);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  };

  const loadCars = async () => {
    try {
      const response = await API.get("/cars");
      setCars(response.data.data || []);
    } catch (err) {
      console.error("Failed to load cars", err);
    }
  };

  const handleAdd = () => {
    setFormData({
      customer_id: "",
      branch_id: "",
      car_id: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      kilometer_before: "",
      // kilometer_after: "",
      late_fee_per_hour: "",
      guarantor_name: "",
      guarantor_national_id: "",
      license_number: "",
      license_expiry_date: "",
      license_source: "",
      license_type: "",
      total: "",
      paid: "",
      remaining: "",
      insurance: "",
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      ...record,
      customer_id: record.customer?.id || "",
      branch_id: record.branch?.id || "",
      car_id: record.car?.id || "",
    });
    setEditId(record.uuid);
    setErrors({});
    setShowModal(true);
  };

  const handleView = async (record) => {
    try {
      const response = await API.get(`/cars-rental/${record.uuid}`);
      setSelectedRental(response.data.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch rental details", err);
      toast.error(t("failed_to_fetch_details"));
    }
  };

  const handleDeleteClick = (uuid) => {
    setDeleteId(uuid);
    setShowDeleteModal(true);
  };

  const handlePrintClause =async (uuid) =>{
    const res = await API.get(`/cars-rental/${uuid}`)
    setPrintData(res.data.data);
    setShowPrintModal(true);
  }

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/cars-rental/${deleteId}`);
      toast.success(t("car_rental_deleted_success"));
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
      "customer_id",
      "branch_id",
      "car_id",
      "start_date",
      "end_date",
      "total",
      "paid",
    ];

    requiredFields.forEach((field) => {
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
      if (editId) {
        await API.put(`/cars-rental/${editId}`, formData);
        toast.success(t("car_rental_updated_success"));
      } else {
        await API.post("/cars-rental", formData);
        toast.success(t("car_rental_added_success"));
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

  // Auto-calculate remaining amount
  useEffect(() => {
    const total = parseFloat(formData.total) || 0;
    const paid = parseFloat(formData.paid) || 0;

    const rem = total - paid;
    setFormData((prev) => ({ ...prev, remaining: rem }));
  }, [formData.total, formData.paid]);

  const columns = [
    { header: t("customer_name"), accessor: "customer.name" },
    { header: t("branch"), accessor: "branch.name" },
    {
      header: t("car_type"),
      accessor: (row) => `${row.car?.brand || ""} ${row.car?.model || ""}`,
    },
    {
      header: t("pickup_date"),
      accessor: (row) => `${row.start_date || ""} ${row.start_time || ""}`,
    },
    {
      header: t("return_date"),
      accessor: (row) => `${row.end_date || ""} ${row.end_time || ""}`,
    },
    { header: t("total_amount"), accessor: "total" },
    { header: t("paid_amount"), accessor: "paid" },
    { header: t("remaining_amount"), accessor: "remaining" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div
          style={{ width: "fit-content" }}
          className="d-flex border mx-auto rounded"
        >
          <Can permission="car_rental_show">
            <button
              className="btn btn-sm btn-info mx-1 no-style"
              onClick={() => handleView(row)}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </Can>
          <Can permission="car_rental_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen />
            </button>
          </Can>
          <Can permission="car_rental_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </Can>
          <Can permission="">
            <button
              className="btn btn-sm no-style"
              onClick={() => handlePrintClause(row.uuid)}
            >
              <FontAwesomeIcon icon={faFileSignature} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title={t("car_rental")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("edit_car_rental") : t("add_car_rental")} ${formData?.customer?.name || ""}`}
        onSubmit={handleSubmit}
        loading={loading}
        size="xl"
        mode="form"
      >
        {/* Basic Information */}
        <div className="row">
          <div className="col-md-4">
            <MyInput
              as="select"
              label={t("customer_name")}
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
              options={[
                { value: "", label: t("select_customer") },
                ...customers.map((c) => ({ value: c.id, label: c.name })),
              ]}
              error={errors.customer_id?.[0]}
              required={true}
            />
          </div>

          <div className="col-md-4">
            <MyInput
              as="select"
              label={t("car_type")}
              value={formData.car_id}
              onChange={(e) =>
                setFormData({ ...formData, car_id: e.target.value })
              }
              options={[
                { value: "", label: t("select_car") },
                ...cars.map((car) => ({
                  value: car.id,
                  label: `${car.brand} ${car.model} - ${car.plate_number}`,
                })),
              ]}
              error={errors.car_id?.[0]}
              required={true}
            />
          </div>
          <div className="col-md-4">
            <MyInput
              as="select"
              label={t("branch")}
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: e.target.value })
              }
              options={[
                { value: "", label: t("select_branch") },
                ...branches.map((b) => ({ value: b.id, label: b.name })),
              ]}
              error={errors.branch_id?.[0]}
              required={true}
            />
          </div>
        </div>

        {/* Rental Period */}
        <div className="row mt-3">
          <div className="col-12">
            <div
              className="p-3"
              style={{ backgroundColor: "#4b8ccd4d", borderRadius: "8px" }}
            >
              <h6 className="mb-3">{t("rental_period")}</h6>
              <div className="row">
                <div className="col-md-3">
                  <MyInput
                    label={t("pickup_date")}
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    error={errors.start_date?.[0]}
                    required={true}
                  />
                </div>
                <div className="col-md-3">
                  <MyInput
                    label={t("pickup_time")}
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    error={errors.start_time?.[0]}
                  />
                </div>
                <div className="col-md-3">
                  <MyInput
                    label={t("return_date")}
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    error={errors.end_date?.[0]}
                    required={true}
                  />
                </div>
                <div className="col-md-3">
                  <MyInput
                    label={t("return_time")}
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    error={errors.end_time?.[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Condition & Late Fee */}
        <div className="row mt-3">
          <div className="col-12">
            <div
              className="p-3"
              style={{ backgroundColor: "#4b8ccd4d", borderRadius: "8px" }}
            >
              <h6 className="mb-3">{t("vehicle_condition")}</h6>
              <div className="row">
                <div className="col-md-4">
                  <MyInput
                    label={t("speedometer_before")}
                    type="number"
                    value={formData.kilometer_before}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kilometer_before: e.target.value,
                      })
                    }
                    error={errors.kilometer_before?.[0]}
                  />
                </div>
                {/* <div className="col-md-4">
                                    <MyInput
                                        label={t("speedometer_after")}
                                        type="number"
                                        value={formData.kilometer_after}
                                        onChange={(e) => setFormData({ ...formData, kilometer_after: e.target.value })}
                                        error={errors.kilometer_after?.[0]}
                                    />
                                </div> */}
                <div className="col-md-4">
                  <MyInput
                    label={t("late_fee_per_hour")}
                    type="number"
                    value={formData.late_fee_per_hour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        late_fee_per_hour: e.target.value,
                      })
                    }
                    error={errors.late_fee_per_hour?.[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantor Information */}
        <div className="row mt-3">
          <div className="col-12">
            <div
              className="p-3"
              style={{ backgroundColor: "#4b8ccd4d", borderRadius: "8px" }}
            >
              <h6 className="mb-3">{t("guarantor_information")}</h6>
              <div className="row">
                <div className="col-md-6">
                  <MyInput
                    label={t("guarantor_name")}
                    value={formData.guarantor_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor_name: e.target.value,
                      })
                    }
                    error={errors.guarantor_name?.[0]}
                  />
                </div>
                <div className="col-md-6">
                  <MyInput
                    label={t("guarantor_id")}
                    value={formData.guarantor_national_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor_national_id: e.target.value,
                      })
                    }
                    error={errors.guarantor_national_id?.[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="row mt-3">
          <div className="col-12">
            <div
              className="p-3"
              style={{ backgroundColor: "#4b8ccd4d", borderRadius: "8px" }}
            >
              <h6 className="mb-3">{t("license_information")}</h6>
              <div className="row">
                <div className="col-md-6">
                  <MyInput
                    label={t("renter_license_number")}
                    value={formData.license_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_number: e.target.value,
                      })
                    }
                    error={errors.license_number?.[0]}
                  />
                </div>
                <div className="col-md-6">
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
                  />
                </div>
                <div className="col-md-6">
                  <MyInput
                    label={t("license_source")}
                    value={formData.license_source}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_source: e.target.value,
                      })
                    }
                    error={errors.license_source?.[0]}
                  />
                </div>
                <div className="col-md-6">
                  <MyInput
                    label={t("license_type")}
                    value={formData.license_type}
                    onChange={(e) =>
                      setFormData({ ...formData, license_type: e.target.value })
                    }
                    error={errors.license_type?.[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="row mt-3">
          <div className="col-12">
            <div
              className="p-3"
              style={{ backgroundColor: "#4b8ccd4d", borderRadius: "8px" }}
            >
              <h6 className="mb-3">{t("financial_details")}</h6>
              <div className="row">
                <div className="col-md-3">
                  <MyInput
                    label={t("total_amount")}
                    type="number"
                    value={formData.total}
                    onChange={(e) =>
                      setFormData({ ...formData, total: e.target.value })
                    }
                    error={errors.total?.[0]}
                    required={true}
                  />
                </div>
                <div className="col-md-3">
                  <MyInput
                    label={t("paid_amount")}
                    type="number"
                    value={formData.paid}
                    onChange={(e) =>
                      setFormData({ ...formData, paid: e.target.value })
                    }
                    error={errors.paid?.[0]}
                    required={true}
                  />
                </div>
                <div className="col-md-3">
                  <MyInput
                    label={t("remaining_amount")}
                    type="number"
                    value={formData.remaining}
                    readOnly
                    error={errors.remaining?.[0]}
                  />
                </div>
                <div className="col-md-3">
                  <MyInput
                    label={t("insurance_value")}
                    type="number"
                    value={formData.insurance}
                    onChange={(e) =>
                      setFormData({ ...formData, insurance: e.target.value })
                    }
                    error={errors.insurance?.[0]}
                  />
                </div>
              </div>
            </div>
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
        cancelText={t("cancel")}
      >
        {t("delete_car_rental_confirm")}
      </ModalForm>

      <MyTable
        resource="cars-rental"
        columns={columns}
        refreshKey={refreshKey}
        title={t("car_rental")}
        button={{
          text: t("add_car_rental"),
          onClick: handleAdd,
          variant: "success",
          permission: "car_rental_create",
        }}
      />
      {/* {showPrintModal && printData && (
        <ContractPrint 
          rental={printData} 
          settings={settings} 
          t={t} 
          i18n={i18n} 
          onClose={() => setShowPrintModal(false)} 
        />
      )} */}

      <ModalForm 
        show={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        mode="print" // هذا المود يزيل أزرار الحفظ ويجعل الخلفية بيضاء للطباعة
        size="lg"
        className="car-rental-print-modal"
      >
        {printData && (
          <ContractPrint 
            rental={printData} 
            settings={settings} 
            t={t} 
            i18n={i18n} 
          />
        )}
      </ModalForm>
      <ModalForm
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={t("view_rental_details")}
        mode="view"
        size="lg"
      >
        {selectedRental && (
          <div className="row g-3">
            {/* Customer */}
            <div className="col-md-6">
              <label className="fw-bold">{t("customer_name")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.customer?.name || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("customer_phone")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.customer?.phone || "-"}
              </p>
            </div>

            {/* Branch */}
            <div className="col-md-6">
              <label className="fw-bold">{t("branch")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.branch?.name || "-"}
              </p>
            </div>

            {/* Car */}
            <div className="col-md-6">
              <label className="fw-bold">{t("car")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.car
                  ? `${selectedRental.car.brand} ${selectedRental.car.model} (${selectedRental.car.plate_number})`
                  : "-"}
              </p>
            </div>

            {/* Rental Info */}
            <div className="col-md-6">
              <label className="fw-bold">{t("status")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.status || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("insurance_value")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.insurance || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("pickup")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.start_date || "-"}{" "}
                {selectedRental.start_time || ""}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("return")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.end_date || "-"} {selectedRental.end_time || ""}
              </p>
            </div>

            {/* Financial */}
            <div className="col-md-4">
              <label className="fw-bold">{t("total")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.total || "-"}
              </p>
            </div>

            <div className="col-md-4">
              <label className="fw-bold">{t("paid")}:</label>
              <p className="border-bottom pb-2">{selectedRental.paid || "-"}</p>
            </div>

            <div className="col-md-4">
              <label className="fw-bold">{t("remaining")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.remaining || "-"}
              </p>
            </div>

            {/* Kilometer */}
            <div className="col-md-6">
              <label className="fw-bold">{t("kilometer_before")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.kilometer_before || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("kilometer_after")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.kilometer_after || "-"}
              </p>
            </div>

            {/* License */}
            <div className="col-md-6">
              <label className="fw-bold">{t("renter_license_number")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.license_number || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("license_source")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.license_source || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("license_expiry_date")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.license_expiry_date || "-"}
              </p>
            </div>

            {/* Guarantor */}
            <div className="col-md-6">
              <label className="fw-bold">{t("guarantor_name")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.guarantor_name || "-"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">{t("late_fee_per_hour")}:</label>
              <p className="border-bottom pb-2">
                {selectedRental.late_fee_per_hour || "-"}
              </p>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

export default CarRental;
