import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faTrash, faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";

function ServicesExpenses() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    payment_type: "",
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleShowDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [nextInvoice, setNextInvoice] = useState();

  useEffect(() => {
    API.get("/get-all-customers")
      .then((res) => setCustomers(res.data.data || []))
      .catch(() => toast.error(t("services_load_customers_failed")));

    API.get("/services")
      .then((res) => setServicesList(res.data.data || []))
      .catch(() => toast.error(t("services_load_services_failed")));

    API.get("/next-invoice-number")
      .then((res) => setNextInvoice(res.data.next_invoice_number || null))
      .catch(() => toast.error(t("services_load_next_invoice_failed")));
  }, []);

  const handleSearch = () => {
    // if (!filters.from || !filters.to) {
    //     toast.error("من فضلك اختر الفترة (من – إلى)");
    //     return;
    // }

    //     let result = allInvoices;
    //     if (filters.invoice_number) {
    //     result = result.filter((inv) =>
    //         inv.invoice_number?.toString().includes(filters.invoice_number)
    //     );
    // }
    setAppliedFilters(filters);
    setRefreshKey((prev) => prev + 1);
  };

  const total = formData.services.reduce(
    (sum, s) => sum + Number(s.value || 0),
    0
  );
  const remaining = total - Number(formData.paid || 0);

  const handleAdd = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      payment_type: "",
      paid: "",
      customer_id: "",
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
    // console.log(nextInvoice);
  };

  const handleEdit = (record) => {
    setFormData({ ...record });
    setEditId(record.uuid);
    setErrors({});
    setShowModal(true);
    // console.log(formData);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/invoices/${deleteId}`);
      console.log(t("services_invoice_deleted"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error(t("services_delete_failed"));
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
    setLoading(true);
    setErrors({});
    try {
      if (editId) {
        await API.put(`/invoices/${editId}`, formData);
        console.log(t("services_invoice_updated"));
      } else {
        await API.post("/invoices", formData);
        console.log(t("services_invoice_added"));
      }
      setShowModal(false);
      API.get("/next-invoice-number")
        .then((res) => setNextInvoice(res.data.next_invoice_number || null))
        .catch(() => toast.error(t("services_load_next_invoice_failed")));
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.log(t("services_save_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: t("services_invoice_number"), accessor: "invoice_number" },
    { header: t("name"), accessor: (row)=> row?.services?.map((service)=>service.service_name).join(", ") },
    { header: t("services_date"), accessor: "date" },
    { header: t("services_total_price"), accessor: "total_price" },
    { header: t("services_total_cost"), accessor: "total_cost" },
    { header: t("services_profit"), accessor: "profit" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm mx-1 extrabtn"
            title={t("view")}
            onClick={() => handleShowDetails(row)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  const profit = formData.services.reduce(
    (sum, s) => sum + (Number(s.value || 0) - Number(s.cost || 0)),
    0
  );

  useEffect(() => {
    const today = new Date();

    // أول يوم في الشهر الحالي
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    // آخر يوم في الشهر الحالي
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // نحول التاريخ إلى صيغة YYYY-MM-DD بدون UTC
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
    <Mytitle title={t("service_expenses")} />
    {/* <Can permission="invoice_create">

                <MyButton
                    text="إضافة فاتورة"
                    variant="success"
                    type="button"
                    className="mb-3"
                    onClick={handleAdd}
                />
            </Can> */}
    <ModalForm
      show={showModal}
      onClose={() => setShowModal(false)}
      title={`${editId ? t("services_edit_invoice") : t("services_add_invoice")} (${
        formData.invoice_number ? formData.invoice_number : nextInvoice
      })`}
      onSubmit={handleSubmit}
      loading={loading}
      mode="form"
      className="invoices-modal">
      <div className="form-grid">
        {/* <div className="form-group">
                        <MyInput
                            label="رقم الفاتورة"
                            value={formData.invoice_number}
                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                            error={errors.invoice_number?.[0]}
                            disabled={!!editId}
                        />
                    </div> */}

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
            as="select"
            // label="طريقة الدفع"
            value={formData.payment_type}
            onChange={(e) =>
              setFormData({ ...formData, payment_type: e.target.value })
            }
            error={errors.payment_type?.[0]}
            options={[
              { value: "", label: t("services_select_payment_method") },
              { value: "cash", label: t("payment_cash") },
              { value: "bank_installment", label: t("payment_bank_installment") },
              { value: "direct_installment", label: t("payment_direct_installment") },
              { value: "network", label: t("payment_network") },
            ]}
            disabled={editId}
          />
        </div>

        {/* {!editId  && ( */}
        <div className="form-group">
          <MyInput
            as="select"
            // label="العميل"
            value={formData.customer_id}
            onChange={(e) =>
              setFormData({ ...formData, customer_id: e.target.value })
            }
            error={errors.customer_id?.[0]}
            options={[
              { value: "", label: t("services_select_customer") },
              ...customers.map((c) => ({ value: c.id, label: c.name })),
            ]}
            disabled={editId}
          />
        </div>
        {/* )} */}
      </div>

      <div className="scroll-invoice-table">
        {!(formData.payment_type !== "cash" && editId) && (
          <button
            type="button"
            className="add-service-btn"
            onClick={addService}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}

        <table className="services-table">
          <thead>
            <tr>
              <th style={{ width: "250px" }}>{t("services_service")}</th>
              <th style={{ width: "120px" }}>{t("services_cost")}</th>
              <th style={{ width: "120px" }}>{t("services_price")}</th>
              <th>{t("services_car_number")}</th>
              <th>{t("services_car_type")}</th>
              <th>{t("services_car_model")}</th>
              <th>{t("services_payer")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {formData.services.map((srv, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={srv.service_id}
                    onChange={(e) =>
                      handleServiceChange(index, "service_id", e.target.value)
                    }
                    disabled={formData.payment_type !== "cash" && editId}>
                    <option value="">{t("services_select_service")}</option>
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
                    value={srv.cost}
                    onChange={(e) =>
                      handleServiceChange(index, "cost", e.target.value)
                    }
                    // disabled={editId && !!formData.customer_id}
                    disabled={formData.payment_type !== "cash" && editId}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={srv.value}
                    onChange={(e) =>
                      handleServiceChange(index, "value", e.target.value)
                    }
                    // disabled={editId && !!formData.customer_id}
                    disabled={formData.payment_type !== "cash" && editId}
                  />
                </td>
                <td>
                  <input
                    value={srv.car_number}
                    onChange={(e) =>
                      handleServiceChange(index, "car_number", e.target.value)
                    }
                    // disabled={editId && !!formData.customer_id}
                    disabled={formData.payment_type !== "cash" && editId}
                  />
                </td>
                <td>
                  <input
                    value={srv.car_type}
                    onChange={(e) =>
                      handleServiceChange(index, "car_type", e.target.value)
                    }
                    // disabled={editId && !!formData.customer_id}
                    disabled={formData.payment_type !== "cash" && editId}
                  />
                </td>
                <td>
                  <input
                    value={srv.car_model}
                    onChange={(e) =>
                      handleServiceChange(index, "car_model", e.target.value)
                    }
                    // disabled={editId && !!formData.customer_id}
                    disabled={formData.payment_type !== "cash" && editId}
                  />
                </td>
                <td>
                  <input
                    value={srv.payer}
                    onChange={(e) =>
                      handleServiceChange(index, "payer", e.target.value)
                    }
                    // disabled={editId && !!formData.customer_id}
                    disabled={formData.payment_type !== "cash" && editId}
                  />
                </td>
                <td>
                  {!(formData.payment_type !== "cash" && editId) && (
                    <button
                      type="button"
                      className="delete-service-btn"
                      onClick={() => removeService(index)}>
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
        {formData.payment_type !== "cash" && (
          <>
            <MyInput label={t("services_remaining")} value={remaining} disabled />
            <MyInput
              label={t("services_paid")}
              type="number"
              value={formData.paid}
              onChange={(e) =>
                setFormData({ ...formData, paid: e.target.value })
              }
              error={errors.paid?.[0]}
            />
          </>
        )}
        <MyInput label={t("services_total")} value={total} disabled />
        <MyInput label={t("services_profit")} value={profit} disabled />
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

    <ModalForm
      show={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
      title={t("serviceInvoices_viewDetails")}
      mode="print"
    >
      {selectedRecord ? (
        <div className="p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="fw-bold text-muted small">
                {t("services_invoice_number")}
              </label>
              <p className="fw-bold fs-5 border-bottom pb-2">
                {selectedRecord.invoice_number}
              </p>
            </div>
            <div className="col-md-4">
              <label className="fw-bold text-muted small">
                {t("services_date")}
              </label>
              <p className="fw-bold fs-5 border-bottom pb-2">
                {selectedRecord.date || "-"}
              </p>
            </div>
            <div className="col-md-4">
              <label className="fw-bold text-muted small">
                {t("customers")}
              </label>
              <p className="fw-bold fs-5 border-bottom pb-2">
                {selectedRecord.name || "-"}
              </p>
            </div>
            <div className="col-md-4">
              <label className="fw-bold text-muted small">
                {t("services_total_price")}
              </label>
              <p className="fw-bold fs-5 border-bottom pb-2">
                {selectedRecord.total_price}
              </p>
            </div>
            <div className="col-md-4">
              <label className="fw-bold text-muted small">
                {t("services_total_cost")}
              </label>
              <p className="fw-bold fs-5 border-bottom pb-2">
                {selectedRecord.total_cost}
              </p>
            </div>
            <div className="col-md-4">
              <label className="fw-bold text-muted small">
                {t("services_profit")}
              </label>
              <p className="fw-bold fs-5 border-bottom pb-2">
                {selectedRecord.profit}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h5 className="border-bottom pb-2">{t("services")}</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-striped mt-2">
                <thead>
                  <tr>
                    <th>{t("service_name")}</th>
                    <th>{t("category")}</th>
                    <th>{t("services_price")}</th>
                    <th>{t("services_cost")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.services?.map((srv, index) => (
                    <tr key={index}>
                      <td>{srv.service_name || "-"}</td>
                      <td>{srv.category_name || "-"}</td>
                      <td>{srv.value || "-"}</td>
                      <td>{srv.cost || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p>{t("no_data")}</p>
      )}
    </ModalForm>

    <div className="row flex-row mb-3">
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
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          dontShowDay={true}
        />
      </div>
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
                </div> */}

      <div className="col-md-1 d-flex align-items-center">
        <MyButton onClick={handleSearch} text={t("services_search")} />
      </div>
    </div>

    <MyTable
      resource="expense-invoice"
      method="post"
      title={t("services_title")}
      body={appliedFilters}
      columns={columns}
      refreshKey={refreshKey}
      // invoiceNumber={filters.invoice_number}
    />
  </div>
);
}

export default ServicesExpenses;
