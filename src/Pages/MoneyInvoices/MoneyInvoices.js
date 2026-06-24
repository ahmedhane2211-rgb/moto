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
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import { numberToWords } from "../../utils/numberToWords";
import { SquarePen } from "lucide-react";

function MoneyInvoices() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();

  // const [filters, setFilters] = useState({
  //   from: "",
  //   to: "",
  // });
  // const [appliedFilters, setAppliedFilters] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    expense_id: "",
    customer_id: "",
    supplier_id: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    we: "",
    textValue: "",
    for: "",
    payment_type: "",
    invoice_number: "",
    send_type: "",
    note: "",
    type: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [nextInvoice, setNextInvoice] = useState();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedMoneyInvoice, setSelectedMoneyInvoice] = useState(null);

  useEffect(() => {
    API.get("/expenses")
      .then((res) => setExpenses(res.data.data || []))
      .catch(() => toast.error(t("moneyInvoices_loadExpensesFailed")));

    API.get("/get-all-customers")
      .then((res) => {
        setCustomers(res.data.data.filter((customer) => customer.type === "customer").length > 0 ? res.data.data.filter((customer) => customer.type === "customer") : [])
        setSuppliers(res.data.data.filter((customer) => customer.type === "supplier").length > 0 ? res.data.data.filter((customer) => customer.type === "supplier") : [])
      })
      .catch(() => toast.error(t("moneyInvoices_loadCustomersFailed")));

    API.get("/next-money-invoice-number")
      .then((res) => setNextInvoice(res.data.next_invoice_number || null))
      .catch(() => toast.error(t("moneyInvoices_loadNextInvoiceFailed")));
  }, [t]);

  // Handle auto-filling amount words
  useEffect(() => {
    if (formData.amount) {
      const words = numberToWords(formData.amount, i18n.language);
      setFormData((prev) => ({ ...prev, textValue: words }));
    } else {
      setFormData((prev) => ({ ...prev, textValue: "" }));
    }
  }, [formData.amount, i18n.language]);

  const handleAdd = () => {
    setFormData({
      expense_id: "",
      customer_id: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      we: i18n.language === "ar" 
        ? `استلمنا نحن ${settings?.company_name || ""}` 
        : `Received by us ${settings?.company_name || ""}`,
      textValue: "",
      for: "",
      payment_type: "",
      invoice_number: nextInvoice,
      send_type: "",
      note: "",
      supplier_id: "",
      type: "",
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({ ...record,supplier_id: record.supplier_id || "" });
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
      await API.delete(`/money-invoices/${deleteId}`);
      console.log(t("moneyInvoices_deleteSuccess"));
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(t("moneyInvoices_deleteFailed"));
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
        await API.put(`/money-invoices/${editId}`, formData);
        console.log(t("moneyInvoices_updateSuccess"));
      } else {
        await API.post("/money-invoices", formData);
        console.log(t("moneyInvoices_createSuccess"));
      }
      setShowModal(false);
      API.get("/next-money-invoice-number")
        .then((res) => setNextInvoice(res.data.next_invoice_number || null))
        .catch(() => toast.error(t("moneyInvoices_loadNextInvoiceFailed")));

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(t("moneyInvoices_saveError"));
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleSearch = () => {
  //   if (!filters) {
  //     toast.error(t("moneyInvoices_selectSafeType"));
  //     return;
  //   }

  //   setAppliedFilters(filters);
  //   setRefreshKey((prev) => prev + 1);
  // };

  const handleShowDetails = (moneyInvoice) => {
    setSelectedMoneyInvoice(moneyInvoice);
    setShowDetailsModal(true);
  };

  const columns = [
    {
      header: t("moneyInvoices_type"),
      accessor: (row) =>
        row.type === "send"
          ? t("moneyInvoices_send")
          : t("moneyInvoices_receive"),
    },
    { header: t("invoice_number"), accessor: "invoice_number" },
    { header: t("moneyInvoices_amount"), accessor: "amount" },
    { header: t("moneyInvoices_date"), accessor: "date" },
    {
      header: t("moneyInvoices_actions"),
      accessor: (row) => (
        <div style={{width:"fit-content"}} className="d-flex border mx-auto rounded">
          <Can permission="money_invoice_show">
            <button
              className="btn btn-sm mx-1 extrabtn"
              onClick={() => handleShowDetails(row)}
              title={t("moneyInvoices_viewDetails")}>
              <FontAwesomeIcon icon={faEye} />
            </button>
          </Can>
          <Can permission="money_invoice_update">
            <button
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}>
              <SquarePen />
            </button>
          </Can>
          <Can permission="money_invoice_delete">
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
    <Mytitle title={t("moneyInvoices_title")} />

    <div className="d-flex justify-content-between align-items-center">
      {/* <Can permission="money_invoice_create">

                    <MyButton
                        text={t("moneyInvoices_add")}
                        variant="success"
                        type="button"
                        className="mb-3"
                        onClick={handleAdd}
                    />
                </Can> */}

      {/* <div className="form-group" style={{width: "180px"}}>
                    <MyInput
                        as="select"
                        // label={t("moneyInvoices_paymentType")}
                        value={formData.payment_type}
                        onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                        error={errors.payment_type?.[0]}
                        options={[
                            { value: "", label: t("moneyInvoices_selectPayment") },
                            { value: "cash", label: t("moneyInvoices_receive") },
                            { value: "credit", label: t("moneyInvoices_send") },
                            { value: "bank_transfer", label: t("moneyInvoices_voucher") },
                        ]}
                        disabled={editId}

                    />
                </div> */}
    </div>

    <ModalForm
      show={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
      title={t("moneyInvoices_details")}
      mode="print">

      {selectedMoneyInvoice ? (
        <>
          <div className="p-1" dir="rtl">
            {/* ===== العنوان ===== */}
            <h5 className="fw-bold text-center mb-4 pb-2">
              {selectedMoneyInvoice?.type === "send"
                ? t("moneyInvoices_send")
                : t("moneyInvoices_receive")}
              ({selectedMoneyInvoice?.invoice_number})
            </h5>
            {selectedMoneyInvoice?.type === "send" && (
              <p>
                <strong>{t("car_expenses_supplier_name")}: </strong>
                {selectedMoneyInvoice?.supplier?.name || t("-")}
              </p>
            )}

            <div className="row">
              {/* ===== بيانات العميل ===== */}
              {selectedMoneyInvoice?.type === "receive" && (
                <div className="mb-4 col-12 col-xl-12">
                  <h6 className="fw-bolder fs-5 pb-2 mb-4">
                    {t("moneyInvoices_customerData")}
                  </h6>

                  <div className="d-flex justify-content-between">
                    <p>
                      <strong>{t("moneyInvoices_name")}:</strong>{" "}
                      {selectedMoneyInvoice?.customer?.name || "-"}
                    </p>
                    <p>
                      <strong>{t("moneyInvoices_phone")}:</strong>{" "}
                      {selectedMoneyInvoice?.customer?.phone || "-----------"}
                    </p>
                  </div>
                </div>
              )}


                {/* ===== بيانات العملية ===== */}
                <div className="mb-4 col-12 col-xl-12 mt-2">
                  <h6 className="fw-bolder pb-2 fs-5 mb-4">{t("process_details")} </h6>
                  <div className="d-flex justify-content-between">
                    {" "}
                    <p>
                      <strong>{t("process_type")}:</strong>{" "}
                      {selectedMoneyInvoice?.type === "receive"
                        ? t("moneyInvoices_receive")
                        : t("moneyInvoices_send")}
                    </p>
                    <p>
                      <strong>{t("payment_method")}:</strong>{" "}
                      {selectedMoneyInvoice?.payment_type === "cash"
                        ? t("payment_cash")
                        : selectedMoneyInvoice?.payment_type === "bank_installment"
                          ? t("payment_bank_installment")
                          : selectedMoneyInvoice?.payment_type === "direct_installment"
                            ? t("payment_direct_installment")
                            : t("payment_network")}
                    </p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>
                      <strong>{t("date")}:</strong> {selectedMoneyInvoice?.date}
                    </p>
                    {selectedMoneyInvoice?.type === "send" && (
                      <p>
                        <strong>{t("expense_name")}: </strong>
                        {selectedMoneyInvoice?.expense?.name || "-----"}
                      </p>
                    )}
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>
                      <strong>{t("notes")}: </strong>
                      {selectedMoneyInvoice?.note
                        ? selectedMoneyInvoice?.note
                        : "-------------"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // <table className="table table-bordered">
          //   <thead>
          //     <tr>
          //       <th>التاريخ</th>
          //       <th>الموظف</th>
          //       <th>رقم الهاتف</th>
          //       <th>النوع</th>
          //       <th>القيمة</th>
          //       <th>الوصف</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     <tr>
          //       <td>{selectedInvoice.date}</td>
          //       <td>{selectedInvoice.employee?.name}</td>
          //       <td>{selectedInvoice.employee?.phone}</td>
          //       <td>
          //         {selectedInvoice.cash_type === "cash"
          //           ? "نقدي"
          //           : selectedInvoice.cash_type === "bank"
          //           ? "تحويل بنكي"
          //           : "-"}
          //       </td>
          //       <td>{selectedInvoice.value}</td>
          //       <td>{selectedInvoice.description || "-"}</td>
          //     </tr>
          //   </tbody>
          // </table>
         <p>{t("moneyInvoices_noData")}</p>
)}
</ModalForm>

  <ModalForm
    show={showModal}
    onClose={() => setShowModal(false)}
    title={`${editId ? t("moneyInvoices_editVoucher") : t("moneyInvoices_addVoucher")} (${
      formData.invoice_number ? formData.invoice_number : nextInvoice
    })`}
    onSubmit={handleSubmit}
    loading={loading}
    mode="form">

  <div className="form-grid">
    {/* <div className="form-group">
                    <MyInput
                        label={t("moneyInvoices_invoiceNumber")}
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        error={errors.invoice_number?.[0]}
                        disabled={!!editId}
                        />
                </div> */}

    <div className="form-group">
      <MyInput
        as="select"
        value={formData.type}
        onChange={(e) =>
          setFormData({ ...formData, type: e.target.value })
        }
        error={errors.type?.[0]}
        options={[
          { value: "", label: t("moneyInvoices_selectType") },
          { value: "send", label: t("moneyInvoices_send") },
          { value: "receive", label: t("moneyInvoices_receive") },
        ]}
        disabled={!!editId}
        required={true}
      />
    </div>

    {formData.type === "receive" && (
      <>
        {(formData.type === "send" || formData.type === "receive") && (
          <div className="form-group">
            <MyInput
              as="select"
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customer_id: e.target.value,
                  expense_id: "",
                })
              }
              error={errors.customer_id?.[0]}
              options={[
                { value: "", label: t("moneyInvoices_selectCustomer") },
                ...customers.map((c) => ({ value: c.id, label: c.name })),
              ]}
              disabled={formData.type === "send" && formData.expense_id}
              required={true}
            />
          </div>
        )}
      </>
    )}

    {formData.type === "send" && (
      <>
      <div className="form-group">
        <MyInput
          as="select"
          value={formData.expense_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              expense_id: e.target.value,
              customer_id: "",
            })
          }
          error={errors.expense_id?.[0]}
          options={[
            { value: "", label: t("moneyInvoices_selectExpense") },
            ...expenses.map((e) => ({ value: e.id, label: e.name })),
          ]}
          disabled={formData.customer_id}
          required={true}
        />
      </div>
      <div className="form-group">
      <MyInput
        as="select"
        label={t("supplier")}
        value={formData.supplier_id}
        onChange={(e) =>
          setFormData({
            ...formData,
            supplier_id: e.target.value,
            customer_id: "",
            expense_id: "", // تصفير المصروف إذا اختار مورد
          })
        }
        error={errors.supplier_id?.[0]}
        options={[
          { value: "", label: t("supplier") },
          ...suppliers.map((s) => ({ value: s.id, label: s.name })),
        ]}
        disabled={!!formData.expense_id}
      />
    </div>
      </>
    )}

    <div className="form-group">
      <MyInput
        label={t("moneyInvoices_amount")}
        type="number"
        value={formData.amount}
        onChange={(e) =>
          setFormData({ ...formData, amount: e.target.value })
        }
        error={errors.amount?.[0]}
        required={true}
      />
    </div>

    <div className="form-group">
      <MyInput
        label={t("moneyInvoices_date")}
        type="date"
        value={formData.date}
        onChange={(e) =>
          setFormData({ ...formData, date: e.target.value })
        }
        error={errors.date?.[0]}
        required={true}
      />
    </div>

    <div className="form-group">
      <MyInput
        label={t("moneyInvoices_receivedByUs")}
        value={formData.we}
        onChange={(e) => setFormData({ ...formData, we: e.target.value })}
        error={errors.for?.[0]}
        required={true}
      />
    </div>

    <div className="form-group">
      <MyInput
        label={t("moneyInvoices_amountWritten")}
        value={formData.textValue}
        onChange={(e) =>
          setFormData({ ...formData, textValue: e.target.value })
        }
        error={errors.textValue?.[0]}
        required={true}
      />
    </div>

    <div className="form-group">
      <MyInput
        label={t("moneyInvoices_for")}
        value={formData.for}
        onChange={(e) =>
          setFormData({ ...formData, for: e.target.value })
        }
        error={errors.for?.[0]}
      />
    </div>

    <div className="form-group">
      <MyInput
        as="select"
        value={formData.payment_type}
        onChange={(e) =>
          setFormData({ ...formData, payment_type: e.target.value })
        }
        error={errors.payment_type?.[0]}
        options={[
          { value: "", label: t("moneyInvoices_selectPaymentType") },
          { value: "cash", label: t("payment_cash") },
          { value: "bank_installment", label: t("payment_bank_installment") },
          { value: "direct_installment", label: t("payment_direct_installment") },
          { value: "network", label: t("payment_network") },
        ]}
        required={true}
      />
    </div>

    <div className="form-group full-width">
      <MyInput
        label={t("moneyInvoices_note")}
        value={formData.note}
        onChange={(e) =>
          setFormData({ ...formData, note: e.target.value })
        }
        error={errors.note?.[0]}
      />
    </div>
  </div>

      </ModalForm>

    <ModalForm
  show={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  title={t("moneyInvoices_confirmDeleteTitle")}
  onSubmit={confirmDelete}
  loading={deleting}
  mode="confirm"
  confirmText={t("moneyInvoices_delete")}
  cancelText={t("moneyInvoices_cancel")}
>
  {t("moneyInvoices_confirmDeleteMessage")}
</ModalForm>


      {/* <MyTable
                resource="money-invoices"
                columns={columns}
                refreshKey={refreshKey}
            /> */}

      {/* دى الطريقة القديمة بالفلتر بالتاريخ وزرار البحث */}
      {/* <div className="row flex-row-reverse mb-3">
                <div className="col-md-2">
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
                </div>
                <div className="col-md-1 d-flex align-items-center">
                    <MyButton onClick={handleSearch} text="بحث" />
                </div>
            </div> */}

<MyTable
  resource="money-invoices"
  columns={columns}
  refreshKey={refreshKey}
  title={t("moneyInvoices_title")}
  // invoiceNumber={filters.invoice_number}
  filters={[
    // { type: "text", name: "invoice_number", label: t("moneyInvoices_searchByInvoice") },
    // { type: "text", name: "customer.name", label: t("moneyInvoices_searchByCustomer") },
    {
      type: "select",
      name: "type",
      label: t("moneyInvoices_voucherType"),
      options: [
        { value: "", label: t("moneyInvoices_all") },
        { value: "receive", label: t("moneyInvoices_receiveShort") },
        { value: "send", label: t("moneyInvoices_sendShort") },
      ],
    },
  ]}
  button={{
    text: t("moneyInvoices_addVoucher"),
    onClick: handleAdd,
    variant: "success",
    permission: "money_invoice_create",
  }}
  dateFilter={{ field: "created_at", label: t("moneyInvoices_createdAt") }}
/>

    </div>
  );
}

export default MoneyInvoices;
