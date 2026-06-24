import { useState, useEffect, useRef } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";

function ServiceInvoices() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    payment_type: "",
    license_type_id: "",
    paid: "",
    customer_id: "",
    services: [
      {
        service_id: "",
        cost: "",
        car_number: "",
        car_type: "",
        car_model: "",
        payer: "",
        value: "",
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
    invoice_number: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [nextInvoice, setNextInvoice] = useState();
  const [licences, setLicences] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { settings } = useSettings();

  useEffect(() => {
    API.get("/get-all-customers")
  .then((res) => {
    const rawData = res.data.data || [];
    const filteredCustomers = rawData.filter((item) => item.type === "customer");
    setCustomers(filteredCustomers);
  })
  .catch(() => toast.error(t("serviceInvoices_loadCustomersFailed")));

    API.get("/services")
      .then((res) => setServicesList(res.data.data || []))
      .catch(() => toast.error(t("serviceInvoices_loadServicesFailed")));

    API.get("/next-invoice-number")
      .then((res) => setNextInvoice(res.data.next_invoice_number || null))
      .catch(() => toast.error(t("serviceInvoices_loadNextInvoiceFailed")));

    API.get("/licenseTypes")
      .then((res) => setLicences(res.data.data || null))
      .catch(() => toast.error(t("serviceInvoices_loadLicencesFailed")));

    const params = new URLSearchParams(window.location.search);
    const invoiceUuid = params.get("invoice");

    if (invoiceUuid) {
      API.get(`/invoices/${invoiceUuid}`)
        .then((res) => {
          setSelectedInvoice(res.data.data);
          setShowDetailsModal(true);
          setTimeout(() => window.print(), 1500);
        })
        .catch(() => toast.error(t("serviceInvoices_loadInvoiceFailed")));
    }
  }, [t]);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setRefreshKey((prev) => prev + 1);
  };

  const total = formData.services.reduce(
    (sum, s) => sum + Number(s.value || 0),
    0,
  );
  const costTotal = formData.services.reduce(
    (sum, s) => sum + Number(s.cost || 0),
    0,
  );
  const remaining = total - Number(formData.paid || 0);

  const handleAdd = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      payment_type: "",
      paid: "",
      customer_id: "",
      license_type_id: "",
      services: [
        {
          service_id: "",
          cost: "",
          car_number: "",
          car_type: "",
          car_model: "",
          value: "",
          payer: "",
        },
      ],
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({ ...record });
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
      await API.delete(`/invoices/${deleteId}`);
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error(t("serviceInvoices_deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...formData.services];
    updated[index][field] = value;
    setFormData({ ...formData, services: updated });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        {
          service_id: "",
          cost: "",
          car_number: "",
          car_type: "",
          car_model: "",
          payer: "",
          value: "",
        },
      ],
    });
  };

  const removeService = (index) => {
    const updated = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    let newErrors = {};
    if (!formData.date) newErrors.date = [t("field_required")];
    if (!formData.payment_type) newErrors.payment_type = [t("field_required")];
    if (!formData.customer_id) newErrors.customer_id = [t("field_required")];

    // Validate services array
    const servicesErrors = formData.services.map((srv) => {
      let srvErr = {};
      if (!srv.service_id) srvErr.service_id = t("field_required");
      if (!srv.cost) srvErr.cost = t("field_required");
      if (!srv.value) srvErr.value = t("field_required");
      return srvErr;
    });

    const hasServiceErrors = servicesErrors.some(
      (err) => Object.keys(err).length > 0,
    );

    if (Object.keys(newErrors).length > 0 || hasServiceErrors) {
      setErrors({ ...newErrors, services: servicesErrors });
      
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      if (editId) {
        await API.put(`/invoices/${editId}`, formData);
        console.log(t("serviceInvoices_updateSuccess"));
      } else {
        await API.post("/invoices", formData);
        console.log(t("serviceInvoices_createSuccess"));
      }
      setShowModal(false);
      API.get("/next-invoice-number")
        .then((res) => setNextInvoice(res.data.next_invoice_number || null))
        .catch(() => toast.error(t("serviceInvoices_loadNextInvoiceFailed")));
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.log(t("serviceInvoices_saveError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const columns = [
    { header: t("serviceInvoices_customer"), accessor: "customer.name" },
    { header: t("serviceInvoices_invoiceNumber"), accessor: "invoice_number" },
    {
      header: t("serviceInvoices_cost"),
      accessor: (row) =>
        row.services?.reduce((sum, s) => sum + Number(s.cost || 0), 0),
    },
    {
      header: t("serviceInvoices_total"),
      accessor: (row) => Math.trunc(row.services[0]?.value),
    },
    {
      header: t("serviceInvoices_paymentType"),
      accessor: (row) =>
        row.payment_type
          ? row.payment_type === "cash"
            ? t("payment_cash")
            : row.payment_type === "bank_installment"
              ? t("payment_bank_installment")
              : row.payment_type === "direct_installment"
                ? t("payment_direct_installment")
                : row.payment_type === "network"
                  ? t("payment_network")
                  : row.payment_type
          : "",
    },
    { header: t("serviceInvoices_date"), accessor: "date" },
    {
      header: t("serviceInvoices_actions"),
      accessor: (row) => (
        <>
          <Can permission="invoice_show">
            <button
              className="btn btn-sm mx-1 extrabtn"
              onClick={() => handleShowDetails(row)}
              title={t("serviceInvoices_viewDetails")}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </Can>
          <Can permission="invoice_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen />
            </button>
          </Can>
          <Can permission="invoice_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </Can>
        </>
      ),
      hideOnPrint: true,
    },
  ];

  const taxPercent = parseFloat(settings?.tax_percent || 0);
  const taxValue = (total * taxPercent) / 100;
  const totalAfterTax = total + taxValue;
  const profit = formData.services.reduce(
    (sum, s) => sum + (Number(s.value || 0) - Number(s.cost || 0)),
    0,
  );
  const profitAfterTax = formData.services.reduce(
    (sum, s) => sum + (Number(totalAfterTax || 0) - Number(s.cost || 0)),
    0,
  );

  useEffect(() => {
    if (showDetailsModal && selectedInvoice?.uuid) {
      const qrContainer = document.getElementById("invoice-qrcode");
      if (qrContainer) {
        qrContainer.innerHTML = "";

        const url = `https://api.motogates.com/invoice/${selectedInvoice.uuid}`;

        if (window.QRCode) {
          new window.QRCode(qrContainer, {
            text: url,
            width: 128,
            height: 128,
          });
        }
      }
    }
  }, [showDetailsModal, selectedInvoice]);

  return (
    <div className="container mt-5">
      <Mytitle title={t("service_sales")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("serviceInvoices_editInvoice") : t("serviceInvoices_addInvoice")} (${
          formData.invoice_number ? formData.invoice_number : nextInvoice
        })`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form" size=""
        className="invoices-modal"
      >
        <div className="form-grid">
          {/* {!editId  && ( */}
          <div className="form-group">
            <MyInput
              as="select"
              label={t("serviceInvoices_customer")}
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
              error={errors.customer_id?.[0]}
              options={[
                { value: "", label: t("serviceInvoices_selectCustomer") },
                ...customers.map((c) => ({ value: c.id, label: c.name })),
              ]}
              disabled={editId}
              required={true}
            />
          </div>

          <div className="form-group">
            <MyInput
              as="select"
              label={t("serviceInvoices_paymentType")}
              value={formData.payment_type}
              onChange={(e) =>
                setFormData({ ...formData, payment_type: e.target.value })
              }
              error={errors.payment_type?.[0]}
              options={[
                { value: "", label: t("serviceInvoices_selectPayment") },
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
                { value: "transfer", label: t("payment_transfer") },
              ]}
              disabled={editId}
              required={true}
            />
          </div>

          {/* {!editId  && ( */}
          {settings?.licence_type === 1 && (
            <div className="form-group">
              <MyInput
                as="select"
                label={t("serviceInvoices_licences")}
                value={formData.license_type_id}
                onChange={(e) =>
                  setFormData({ ...formData, license_type_id: e.target.value })
                }
                error={errors.license_type_id?.[0]}
                options={[
                  { value: "", label: t("serviceInvoices_licences") },
                  ...licences.map((c) => ({ value: c.id, label: c.name })),
                ]}
                disabled={editId}
              />
            </div>
          )}

          <div className="form-group">
            <MyInput
              label={t("serviceInvoices_date")}
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              error={errors.date?.[0]}
              required={true}
            />
          </div>

          {/* )} */}

          {/* )} */}
        </div>

        <div className="scroll-invoice-table">
          {!(formData.payment_type !== "cash" && editId) && (
            <button
              type="button"
              className="add-service-btn"
              onClick={addService}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}

          <table className="services-table add-service">
            <thead>
              <tr>
                <th style={{ width: "250px" }}>
                  {t("serviceInvoices_service")}{" "}
                  <span className="text-danger">*</span>
                </th>
                <th style={{ width: "120px" }}>
                  {t("serviceInvoices_cost")}{" "}
                  <span className="text-danger">*</span>
                </th>
                <th style={{ width: "120px" }}>
                  {t("serviceInvoices_price")}{" "}
                  <span className="text-danger">*</span>
                </th>
                {settings?.bool_1 == 1 && <th>{settings?.string_1 || ""}</th>}
                {settings?.bool_2 == 1 && <th>{settings?.string_2 || ""}</th>}
                {settings?.bool_3 == 1 && <th>{settings?.string_3 || ""}</th>}
                {settings?.bool_4 == 1 && <th>{settings?.string_4 || ""}</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formData.services.map((srv, index) => (
                <tr key={index}>
                  <td>
                    <select
                      className={
                        errors.services?.[index]?.service_id ? "is-invalid" : ""
                      }
                      value={srv.service_id}
                      onChange={(e) =>
                        handleServiceChange(index, "service_id", e.target.value)
                      }
                      disabled={formData.payment_type !== "cash" && editId}
                    >
                      <option value="">
                        {t("serviceInvoices_selectService")}
                      </option>
                      {servicesList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className={
                        errors.services?.[index]?.cost ? "is-invalid" : ""
                      }
                      value={srv.cost}
                      onChange={(e) =>
                        handleServiceChange(index, "cost", e.target.value)
                      }
                      disabled={formData.payment_type !== "cash" && editId}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={
                        errors.services?.[index]?.value ? "is-invalid" : ""
                      }
                      value={srv.value}
                      onChange={(e) =>
                        handleServiceChange(index, "value", e.target.value)
                      }
                      disabled={formData.payment_type !== "cash" && editId}
                    />
                  </td>
                  {settings?.bool_1 == 1 && (
                    <td>
                      <input
                        value={srv.string_1}
                        onChange={(e) =>
                          handleServiceChange(
                            index,
                            "car_number",
                            e.target.value,
                          )
                        }
                        disabled={formData.payment_type !== "cash" && editId}
                      />
                    </td>
                  )}
                  {settings?.bool_2 == 1 && (
                    <td>
                      <input
                        value={srv.string_2}
                        onChange={(e) =>
                          handleServiceChange(index, "car_type", e.target.value)
                        }
                        disabled={formData.payment_type !== "cash" && editId}
                      />
                    </td>
                  )}
                  {settings?.bool_3 == 1 && (
                    <td>
                      <input
                        value={srv.string_3}
                        onChange={(e) =>
                          handleServiceChange(
                            index,
                            "car_model",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  )}
                  {settings?.bool_4 == 1 && (
                    <td>
                      <input
                        value={srv.string_4}
                        onChange={(e) =>
                          handleServiceChange(index, "payer", e.target.value)
                        }
                        disabled={formData.payment_type !== "cash" && editId}
                      />
                    </td>
                  )}
                  <td>
                    {!(formData.payment_type !== "cash" && editId) && (
                      <button
                        type="button"
                        className="delete-service-btn"
                        onClick={() => removeService(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-footer">
          {settings?.tax_percent != "0.00" && (
            <>
              <MyInput
                label={t("serviceInvoices_profitAfterTax")}
                value={profitAfterTax.toFixed(2)}
                disabled
              />
              <MyInput
                label={t("serviceInvoices_totalAfterTax")}
                value={totalAfterTax.toFixed(2)}
                disabled
              />
              <MyInput
                label={`${t("serviceInvoices_taxValue")} (${settings?.tax_percent || 0}%)`}
                value={taxValue.toFixed(2)}
                disabled
              />
            </>
          )}
          {formData.payment_type !== "cash" && (
            <>
              <MyInput
                label={t("serviceInvoices_remaining")}
                value={remaining}
                disabled
              />
              <MyInput
                label={t("serviceInvoices_paid")}
                type="number"
                value={formData.paid}
                onChange={(e) =>
                  setFormData({ ...formData, paid: e.target.value })
                }
                error={errors.paid?.[0]}
              />
            </>
          )}

          {/* 👇 أضف السطرين دول */}
          <MyInput label={t("serviceInvoices_total")} value={total} disabled />
          <MyInput
            label={t("serviceInvoices_profit")}
            value={profit}
            disabled
          />
        </div>
      </ModalForm>

      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("serviceInvoices_deleteConfirmTitle")}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={t("serviceInvoices_delete")}
        cancelText={t("serviceInvoices_cancel")}
      >
        {t("serviceInvoices_deleteInvoiceMessage")}
      </ModalForm>

      <ModalForm
  show={showDetailsModal}
  onClose={() => setShowDetailsModal(false)}
  title={`${t("serviceInvoices_invoiceTitle")} ${selectedInvoice?.invoice_number || ""}`}
  className="invoice"
  mode="print"
  modal="invoice"
>
  {selectedInvoice ? (
    <>
      {/* ===== بيانات العميل (كما كانت بدون تغيير) ===== */}
      <div className={`invoice-details ${localStorage.getItem("theme") === "dark" ? "text-white" : ""} p-2`}>
        <div className="row mb-1">
          <div className="col-6">
            <p className="mb-2"><strong>{t("serviceInvoices_customerLabel")}:</strong> {selectedInvoice.customer?.name}</p>
          </div>
          <div className="col-6">
            <p className="mb-2">
              <strong>{t("serviceInvoices_paymentTypeLabel")}:</strong>{" "}
              {selectedInvoice.payment_type === "cash" ? t("payment_cash") : selectedInvoice.payment_type === "bank_installment" ? t("payment_bank_installment") : selectedInvoice.payment_type === "direct_installment" ? t("payment_direct_installment") : t("payment_network")}
            </p>
          </div>
          <div className="col-6">
            <p className="mb-2"><strong>{t("serviceInvoices_invoiceTotal")}:</strong> {selectedInvoice.total}</p>
          </div>
          {settings?.licence_type == 1 && (
            <div className="col-6">
              <p className="mb-2"><strong>{t("serviceInvoices_licence")}:</strong> {selectedInvoice?.license_type?.name || "-----"}</p>
            </div>
          )}
          <div className="col-6">
            <p className="mb-2"><strong>{t("serviceInvoices_invoiceNumber")}:</strong> {selectedInvoice.invoice_number}</p>
          </div>
          <div className="col-6">
            <p className="mb-2"><strong>{t("serviceInvoices_date")}:</strong> {selectedInvoice.date}</p>
          </div>
          {settings?.tax_percent != "0.00" && (
            <>
              <div className="col-6"><p className="mb-2"><strong>{t("serviceInvoices_taxPercent")}:</strong> {`${settings?.tax_percent} % ` || "-----"}</p></div>
              <div className="col-6"><p className="mb-2"><strong>{t("serviceInvoices_totalAfterTax")}:</strong> {`${selectedInvoice?.total_after_tax} ` || "-----"}</p></div>
              <div className="col-6"><p className="mb-2"><strong>{t("serviceInvoices_taxValue")}:</strong> {`${selectedInvoice?.tax_value} ` || "-----"}</p></div>
            </>
          )}
          <div className="col-6">
            <p className="mb-2">
              <strong>{t("serviceInvoices_paymentStatus")}:</strong>{" "}
              <span className={Number(selectedInvoice.remaining) > 0 ? "text-danger" : "text-success"}>
                {Number(selectedInvoice.remaining) > 0 ? t("serviceInvoices_remaining") : t("serviceInvoices_paidStatus")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ===== جدول الخدمات (أضفنا كلاس invoices-table فقط) ===== */}
      <div className="mt-3">
        <h5 className="fw-bold mb-3 text-center">{t("serviceInvoices_services")}</h5>
        <table className="table table-bordered text-center align-middle invoices-table">
          <thead className="table-light">
            <tr>
              <th>{t("serviceInvoices_index")}</th>
              <th>{t("serviceInvoices_serviceName")}</th>
              <th>{t("serviceInvoices_value")}</th>
              {settings?.bool_1 == 1 && <th>{settings?.string_1}</th>}
              {settings?.bool_2 == 1 && <th>{settings?.string_2}</th>}
              {settings?.bool_3 == 1 && <th>{settings?.string_3}</th>}
              {settings?.bool_4 == 1 && <th>{settings?.string_4}</th>}
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.services?.map((srv, index) => (
              <tr key={srv.id}>
                <td>{index + 1}</td>
                <td>{srv.service?.name || "-"}</td>
                <td>{srv?.value}</td>
                {srv?.car_number && <td>{srv?.car_number}</td>}
                {srv?.car_type && <td>{srv?.car_type}</td>}
                {srv?.car_model && <td>{srv?.car_model}</td>}
                {srv?.payer && <td>{srv?.payer}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center h-100 d-flex flex-column justify-content-start pt-5">
        <div id="invoice-qrcode" className="d-flex justify-content-center"></div>
        <p className="mt-2 small text-muted">{t("serviceInvoices_scanQr")}</p>
      </div>
    </>
  ) : (
    <p>{t("serviceInvoices_noData")}</p>
  )}
</ModalForm>
      <div className="row flex-row-reverse mb-3">
        {/* دى الطريقة القديمة بالفلتر بالتاريخ وزرار البحث */}
        {/* <div className="col-md-2">
                    <MyInput
                        label="من"
                        type="date"
                        value={filters.from}
                        onChange={(e) =>
                            setFilters({ ...filters, from: e.target.value })
                        }
                        dontShowDay={true}
                    />
                </div>

                <div className="col-md-2">
                    <MyInput
                        label="إلى"
                        type="date"
                        value={filters.to}
                        onChange={(e) =>
                            setFilters({ ...filters, to: e.target.value })
                        }
                        dontShowDay={true}
                    />
                </div> */}

        {/* <div className="col-md-2">
                    <MyInput
                        label="رقم الفاتورة"
                        type="search"
                        value={filters.invoice_number}
                        onChange={(e) =>
                            setFilters({ ...filters, invoice_number: e.target.value })
                        }
                        dontShowDay={true}
                    />
                </div>


                <div className="col-md-1 d-flex align-items-center">
                    <MyButton onClick={handleSearch} text="بحث" />
                </div> */}
      </div>
      <MyTable
        resource="invoices-from-to"
        method="post"
        title={t("serviceInvoices_title")}
        body={appliedFilters}
        invoice={true}
        columns={columns}
        refreshKey={refreshKey}
        // invoiceNumber={filters.invoice_number}
        dateFilter={{
          field: "created_at",
          label: t("serviceInvoices_createdAt"),
        }}
        filters={[
          {
            type: "text",
            name: "invoice_number",
            label: t("serviceInvoices_searchByInvoice"),
          },
          // { type: "text", name: "customer.name", label: "بحث باسم العميل" },
          {
            type: "select",
            name: "payment_type",
            label: t("serviceInvoices_paymentType"),
            options: [
              { value: "", label: t("serviceInvoices_all") },
              { value: "cash", label: t("serviceInvoices_cash") },
              { value: "credit", label: t("serviceInvoices_credit") },
              { value: "bank_transfer", label: t("serviceInvoices_bank") },
              { value: "card", label: t("serviceInvoices_card") },
            ],
          },
        ]}
        button={{
          text: t("serviceInvoices_addInvoice"),
          onClick: handleAdd,
          variant: "success",
          permission: "invoice_create",
        }}
      />
    </div>
  );
}

export default ServiceInvoices;
