import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import PremiumUploader from "../../Components/PremiumUploader";
import { HandCoins, SquarePen } from "lucide-react";
import { NegativeNumberDisplay } from "../../utils/formatNegativeNumber";
import { useSettings } from "../../context/SettingsContext";
import Seo from "../../Components/Seo";

function CarSales() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    branch_id: "",
    car_id: "",
    sale_price: "",
    discount: "",
    paid: "",
    remaining: "",
    total: "",
    payment_method: "cash",
    admin_fees: "",
    license_fees: "",
    tax: "",
    bank_id: "",
    bank_order_number: "",
    bank_order_date: "",
    images: null,
    images_preview: null,
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [cars, setCars] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { settings } = useSettings();
  // Load data
  useEffect(() => {
    loadCustomers();
    loadBranches();
    loadCars();
    loadBanks();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await API.get("/get-customers");
      const allCustomers = response.data.data || [];
      setCustomers(allCustomers.filter((c) => c.can_deleted !== 0));
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

  const loadBanks = async () => {
    try {
      const response = await API.get("/banks");
      setBanks(response.data.data || []);
    } catch (err) {
      console.error("Failed to load banks", err);
    }
  };

  const handleAdd = () => {
    setFormData({
      customer_id: "",
      branch_id: "",
      car_id: "",
      sale_price: "",
      discount: "",
      paid: "",
      remaining: "",
      payment_method: "cash",
      admin_fees: "",
      license_fees: "",
      tax: "",
      bank_id: "",
      bank_amount: "",
      bank_order_date: "",
      images: null,
      images_preview: null,
      notes: "",
    });
    setSelectedCustomer(null);
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      ...record,
      customer_id: record.customer?.id || record.customer_id || "",
      branch_id: record.branch?.id || record.branch_id || "",
      car_id: record.car?.id || record.car_id || "",
      // Map backend fields to frontend state if names differ
      admin_fees: record.admin_fees || record.administrative_fees || "",
      paid: record.paid || record.paid_amount || "",
      remaining: record.remaining || record.remaining_amount || "",
      bank_id: record.bank_id || record.financing_entity || "",
      bank_order_number:
        record.bank_order_number || record.purchase_order_number || "",
      bank_amount: record.bank_amount || record.financing_amount || "",
      bank_order_date:
        record.bank_order_date || record.purchase_order_date || "",
      images_preview: record.images ? record.images : null,
    });
    setEditId(record.uuid);
    setErrors({});

    const customer = customers.find(
      (c) => c.id === (record.customer?.id || record.customer_id),
    );
    setSelectedCustomer(customer);

    setShowModal(true);
  };

  const handleView = async (record) => {
    try {
      const response = await API.get(`/cars-sale/${record.uuid}`);
      setSelectedSale(response.data.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch sale details", err);
      toast.error(t("failed_to_load_details"));
    }
  };

  const handleDeleteClick = (uuid) => {
    setDeleteId(uuid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/cars-sale/${deleteId}`);
      toast.success(t("car_sale_deleted_success"));
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

  const handleCustomerChange = (customerId) => {
    setFormData({ ...formData, customer_id: customerId });
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images_preview") return;

      let value = formData[key];

      if (key === "images") {
        if (value instanceof File) data.append(key, value);
      } else if (
        value !== null &&
        value !== "" &&
        value !== undefined &&
        typeof value !== "object"
      ) {
        data.append(key, value);
      }
    });

    try {
      if (editId) {
        await API.post(`/cars-sale/${editId}?_method=PUT`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("car_sale_updated_success"));
      } else {
        await API.post("/cars-sale", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("car_sale_added_success"));
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
    const salePrice = parseFloat(formData.sale_price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const adminFees = parseFloat(formData.admin_fees) || 0;
    const licenseFees = parseFloat(formData.license_fees) || 0;
    const tax = parseFloat(formData.tax) || 0;
    const paid = parseFloat(formData.paid) || 0;

    const total = salePrice + adminFees + licenseFees + tax - discount;
    const remaining = total - paid;

    setFormData((prev) => ({
      ...prev,
      remaining: remaining.toFixed(2),
      total: total.toFixed(2),
    }));
  }, [
    formData.sale_price,
    formData.discount,
    formData.admin_fees,
    formData.license_fees,
    formData.tax,
    formData.paid,
  ]);

  const columns = [
    { header: t("customer_name"), accessor: "customer.name" },
    { header: t("branch"), accessor: "branch.name" },
    {
      header: t("car_info"),
      accessor: (row) => `${row.car?.brand || ""} ${row.car?.model || ""}`,
    },
    { header: t("sale_price"), accessor: "sale_price" },
    {
      header: t("discount_value"),
      accessor: (row) => <NegativeNumberDisplay value={row.discount} />,
    },
    { header: t("paid"), accessor: "paid" },
    { header: t("remaining"), accessor: "remaining" },
    {
      header: t("payment_method"),
      accessor: (row) =>
        row.payment_method ? t(`payment_${row.payment_method}`) : "",
    },
    {
      header: t("actions"),
      accessor: (row) => (
        <div
          style={{ width: "fit-content" }}
          className="d-flex border mx-auto rounded"
        >
          <Can permission="car_sale_show">
            <button
              className="btn btn-sm btn-info mx-1 no-style"
              onClick={() => handleView(row)}
            >
              <FontAwesomeIcon icon={faEye} style={{ fontSize: "14px" }} />
            </button>
          </Can>
          <Can permission="car_sale_show">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen size={16} />
            </button>
          </Can>
          <Can permission="car_sale_show">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}
            >
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "14px" }} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <>
      <Seo
        title={t("seo.sale_title")}
        description={t("seo.sale_description")}
      />
      <div className="container mt-5">
        <Mytitle title={t("car_sales")} />

        <ModalForm
          show={showModal}
          onClose={() => setShowModal(false)}
          title={`${editId ? t("edit_car_sale") : t("add_car_sale")} ${formData?.customer?.name || ""}`}
          onSubmit={handleSubmit}
          loading={loading}
          size="lg"
          mode="form"
        >
          <div className="row">
            <div className="col-md-6">
              <MyInput
                label={t("select_customer")}
                value={formData.customer_id}
                onChange={(e) => handleCustomerChange(e.target.value)}
                error={errors.customer_id?.[0]}
                as="select"
                options={[
                  { value: "", label: t("select_customer") },
                  ...customers.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              {selectedCustomer && (
                <div
                  className="mb-3 p-3"
                  style={{ backgroundColor: "#0a4179ff", borderRadius: "8px" }}
                >
                  <h6>{t("customer_details")}</h6>
                  <p className="mb-1">
                    <strong>{t("national_id")}:</strong>{" "}
                    {selectedCustomer.national_id}
                  </p>
                  <p className="mb-1">
                    <strong>{t("phone")}:</strong> {selectedCustomer.phone}
                  </p>
                  <p className="mb-1">
                    <strong>{t("address")}:</strong> {selectedCustomer.address}
                  </p>
                  <p className="mb-1">
                    <strong>{t("account_number")}:</strong>{" "}
                    {selectedCustomer.account_number}
                  </p>
                  <p className="mb-0">
                    <strong>{t("bank_name")}:</strong>{" "}
                    {selectedCustomer.bank_name}
                  </p>
                </div>
              )}

              <MyInput
                label={t("select_branch")}
                value={formData.branch_id}
                onChange={(e) =>
                  setFormData({ ...formData, branch_id: e.target.value })
                }
                error={errors.branch_id?.[0]}
                as="select"
                options={[
                  { value: "", label: t("select_branch") },
                  ...branches.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />

              <MyInput
                label={t("select_car")}
                value={formData.car_id}
                onChange={(e) =>
                  setFormData({ ...formData, car_id: e.target.value })
                }
                error={errors.car_id?.[0]}
                as="select"
                options={[
                  { value: "", label: t("select_car") },
                  ...cars
                    .filter((c) => c.status !== "sold")
                    .map((c) => ({
                      value: c.id,
                      label: `${c.brand} ${c.model} - ${c.plate_number}`,
                    })),
                ]}
              />
            </div>

            <div className="col-md-6">
              <MyInput
                label={t("sale_price")}
                type="number"
                value={formData.sale_price}
                onChange={(e) =>
                  setFormData({ ...formData, sale_price: e.target.value })
                }
                error={errors.sale_price?.[0]}
              />

              <MyInput
                label={t("discount_value")}
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                error={errors.discount?.[0]}
              />

              <div className="row">
                <div className="col-md-12">
                  <MyInput
                    label={t("total")}
                    type="number"
                    value={formData.total}
                    readOnly
                    className="bg-light"
                  />
                </div>
                <div className="col-md-6">
                  <MyInput
                    label={t("paid")}
                    type="number"
                    value={formData.paid}
                    onChange={(e) =>
                      setFormData({ ...formData, paid: e.target.value })
                    }
                    error={errors.paid?.[0]}
                  />
                </div>
                <div className="col-md-6">
                  <MyInput
                    label={t("remaining")}
                    type="number"
                    value={formData.remaining}
                    readOnly
                    className="bg-light"
                    error={
                      errors.remaining?.[0] || errors.remaining_amount?.[0]
                    }
                  />
                </div>
              </div>

              <MyInput
                label={t("payment_method")}
                as="select"
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
                options={[
                  { value: "cash", label: t("payment_cash") },
                  {
                    value: "bank_installment",
                    label: t("payment_bank_installment"),
                  },
                  {
                    value: "direct_installment",
                    label: t("payment_direct_installment"),
                  },
                  { value: "network", label: t("payment_network") },
                ]}
                error={errors.payment_method?.[0]}
              />
            </div>
          </div>

          {/* مربع الرسوم */}
          <div className="row mt-4">
            <div className="col-12">
              <div
                className="p-3"
                style={{
                  backgroundColor: "#0a4179ff",
                  borderRadius: "8px",
                  border: "1px solid #d1e7ff",
                }}
              >
                <h6 className="mb-3">{t("fees_section")}</h6>
                <div className="row">
                  <div className="col-md-4">
                    <MyInput
                      label={t("administrative_fees")}
                      type="number"
                      value={formData.admin_fees}
                      onChange={(e) =>
                        setFormData({ ...formData, admin_fees: e.target.value })
                      }
                      error={errors.admin_fees?.[0]}
                    />
                  </div>
                  <div className="col-md-4">
                    <MyInput
                      label={t("license_fees")}
                      type="number"
                      value={formData.license_fees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          license_fees: e.target.value,
                        })
                      }
                      error={errors.license_fees?.[0]}
                    />
                  </div>
                  <div className="col-md-4">
                    <MyInput
                      label={t("tax")}
                      type="number"
                      value={formData.tax}
                      onChange={(e) =>
                        setFormData({ ...formData, tax: e.target.value })
                      }
                      error={errors.tax?.[0]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* مربع بيانات الجهة التمويلية */}
          <div className="row mt-3">
            <div className="col-12">
              <div
                className="p-3"
                style={{
                  backgroundColor: "#0a4179ff",
                  borderRadius: "8px",
                  border: "1px solid #ffe082",
                }}
              >
                <h6 className="mb-3">{t("financing_entity_info")}</h6>
                <div className="row">
                  <div className="col-md-6">
                    <MyInput
                      label={t("financing_entity")}
                      value={formData.bank_id}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_id: e.target.value })
                      }
                      error={errors.bank_id?.[0]}
                      as="select"
                      options={[
                        { value: "", label: t("select_bank") },
                        ...banks.map((bank) => ({
                          value: bank.id,
                          label: bank.name,
                        })),
                      ]}
                    />
                  </div>
                  <div className="col-md-6">
                    <MyInput
                      label={t("purchase_order_number")}
                      value={formData.bank_order_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_order_number: e.target.value,
                        })
                      }
                      error={errors.bank_order_number?.[0]}
                    />
                  </div>
                  <div className="col-md-6">
                    <MyInput
                      label={t("financing_amount")}
                      type="number"
                      value={formData.bank_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_amount: e.target.value,
                        })
                      }
                      error={errors.bank_amount?.[0]}
                    />
                  </div>
                  <div className="col-md-6">
                    <MyInput
                      label={t("purchase_order_date")}
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.bank_order_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_order_date: e.target.value,
                        })
                      }
                      error={errors.bank_order_date?.[0]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* مرفق الصور */}
          <div className="row mt-3">
            <div className="col-12">
              <div
                className="p-3"
                style={{
                  backgroundColor: "#0a4179ff",
                  borderRadius: "8px",
                  border: "1px solid #6c757d",
                }}
              >
                <h6 className="mb-3">{t("attachments")}</h6>
                <PremiumUploader
                  title={t("attachments")}
                  name="images"
                  preview={formData.images_preview}
                  onDelete={() => {
                    setFormData({
                      ...formData,
                      images: null,
                      images_preview: null,
                    });
                  }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({
                        ...formData,
                        images: e.target.files[0],
                        images_preview: URL.createObjectURL(e.target.files[0]),
                      });
                    }
                  }}
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          {/* خانة الملاحظات */}
          <div className="row mt-3">
            <div className="col-12">
              <div
                className="p-3"
                style={{
                  backgroundColor: "#0a4179ff",
                  borderRadius: "8px",
                  border: "1px solid #6c757d",
                }}
              >
                <h6 className="mb-3">{t("notes")}</h6>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder={t("enter_notes")}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  style={{ resize: "vertical" }}
                />
                {errors.notes?.[0] && (
                  <div className="text-danger small mt-1">
                    {errors.notes[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalForm>

        <ModalForm
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`${t("view_sale_details")} (${selectedSale?.customer?.name || ""})`}
          mode="print"
          size="lg"
        >
          {selectedSale && (
            <div className="row p-3 vsc" style={{ borderRadius: "10px" }}>
              <div className="col-md-6 mb-3">
                <label className="fw-bold">{t("customer_name")}:</label>
                <p className="border-bottom pb-2">
                  {selectedSale.customer?.name}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="fw-bold">{t("branch")}:</label>
                <p className="border-bottom pb-2">
                  {selectedSale.branch?.name}
                </p>
              </div>
              <div className="col-md-12 mb-3">
                <label className="fw-bold">{t("car_info")}:</label>
                <p className="border-bottom pb-2">
                  {selectedSale.car?.brand} {selectedSale.car?.model} -{" "}
                  {selectedSale.car?.plate_number}
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("sale_price")}:</label>
                <p className="border-bottom pb-2">{selectedSale.sale_price}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("discounts")}:</label>
                <p className="border-bottom pb-2">
                  <NegativeNumberDisplay value={selectedSale.discount} />
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("total")}:</label>
                <p className="border-bottom pb-2">{selectedSale.total}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("paid")}:</label>
                <p className="border-bottom pb-2">{selectedSale.paid}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("remaining")}:</label>
                <p className="border-bottom pb-2">{selectedSale.remaining}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("payment_method")}:</label>
                <p className="border-bottom pb-2">
                  {t(`payment_${selectedSale.payment_method}`)}
                </p>
              </div>
              <hr className="bg-light" />
              <h6 className="w-100">{t("fees_section")}</h6>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("administrative_fees")}:</label>
                <p className="border-bottom pb-2">{selectedSale.admin_fees}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("license_fees")}:</label>
                <p className="border-bottom pb-2">
                  {selectedSale.license_fees}
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="fw-bold">{t("tax")}:</label>
                <p className="border-bottom pb-2">{selectedSale.tax}</p>
              </div>
              {selectedSale.bank && (
                <>
                  <hr className="bg-light" />
                  <h6
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    className="w-100 mb-4"
                  >
                    {t("financing_entity_info")} <HandCoins />
                  </h6>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">{t("financing_entity")}:</label>
                    <p className="border-bottom pb-2">
                      {selectedSale.bank?.name}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">
                      {t("purchase_order_number")}:
                    </label>
                    <p className="border-bottom pb-2">
                      {selectedSale.bank_order_number}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">{t("financing_amount")}:</label>
                    <p className="border-bottom pb-2">
                      {selectedSale.bank_amount}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">
                      {t("purchase_order_date")}:
                    </label>
                    <p className="border-bottom pb-2">
                      {selectedSale.bank_order_date ||
                        selectedSale.purchase_order_date ||
                        "-"}
                    </p>
                  </div>
                </>
              )}
              <div className="col-md-12">
                <label className="fw-bold">{t("notes")}:</label>
                <p className="border-bottom pb-2">
                  {selectedSale.notes || "-"}
                </p>
              </div>
              {/* Sale Clauses */}
              {(typeof settings?.sale_clauses === "string"
                ? JSON.parse(settings.sale_clauses)
                : settings?.sale_clauses ||
                  JSON.parse(localStorage.getItem("sale_clauses") || "[]")
              )?.length > 0 && (
                <>
                  <div className="col-12 contract_clauses">
                    <h5
                      className="mb-4"
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {t("contract_clauses")}
                    </h5>

                    <ol className="pe-3">
                      {(typeof settings?.sale_clauses === "string"
                        ? JSON.parse(settings.sale_clauses)
                        : settings?.sale_clauses ||
                          JSON.parse(
                            localStorage.getItem("sale_clauses") || "[]",
                          )
                      ).map((clause, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "black",
                            fontWeight: "bold",
                          }}
                          className="mb-3"
                        >
                          <p>
                            {index + 1}- {clause.name} :
                          </p>

                          <p
                            className="mb-0"
                            style={{
                              color: "black",
                            }}
                          >
                            {clause.desc}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
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
          cancelText={t("cancel")}
        >
          {t("delete_car_sale_confirm")}
        </ModalForm>

        <MyTable
          resource="cars-sale"
          columns={columns}
          refreshKey={refreshKey}
          title={t("car_sales")}
          button={{
            text: t("add_car_sale"),
            onClick: handleAdd,
            variant: "success",
            permission: "car_sale_create",
          }}
        />
      </div>
    </>
  );
}

export default CarSales;
