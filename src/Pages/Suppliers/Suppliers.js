import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API, { BASE_URL } from "../../Api/axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";
import { NegativeNumberDisplay } from "../../utils/formatNegativeNumber";

function Suppliers() {
  const { t } = useTranslation();
  const [imagePreviews, setImagePreviews] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "supplier",
    name: "",
    national_id: "",
    phone: null,
    address: "",
    bank_name: "",
    opening_balance: "",
    attachments: [],
    account_number: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);
  const [canEditOpeningBalance, setCanEditOpeningBalance] = useState(true);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleAdd = () => {
    setFormData({
      type: "supplier",
      name: "",
      national_id: "",
      phone: null,
      address: "",
      bank_name: "",
      opening_balance: "",
      attachments: [],
      account_number: "",
    });
    setEditId(null);
    setErrors({});
    setImagePreviews([]);
    setCanEditOpeningBalance(true);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    const openingBalance =
      record.last_balance?.type === "opening_balance"
        ? record.last_balance.value
        : "";
    setFormData({
      ...record,
      account_number: record.bank_account_number || record.account_number || "",
      opening_balance: openingBalance,
      attachments: [],
    });
    setEditId(record.uuid);
    setErrors({});
    const hasTransactions =
      record.balances &&
      record.balances.some((b) => b.type !== "opening_balance");
    setCanEditOpeningBalance(!hasTransactions);
    setShowModal(true);

    if (record.attachments && record.attachments.length > 0) {
      const storageBaseUrl = BASE_URL.replace("/api/", "/storage/");
      setImagePreviews(
        record.attachments.map((att) =>
          att.attachment ? `${storageBaseUrl}${att.attachment}` : att,
        ),
      );
    } else {
      setImagePreviews([]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
      }));
    }
  };

  const removeAttachment = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      attachments: newAttachments,
    }));
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
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "attachments") {
          formData.attachments.forEach((file) => {
            data.append("attachments[]", file);
          });
        } else if (
          key === "balances" ||
          key === "last_balance" ||
          (editId && key === "opening_balance" && !canEditOpeningBalance)
        ) {
          // Skip large objects or fields that shouldn't be updated during edit
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (editId) {
        data.append("_method", "PUT");
        await API.post(`/customers/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/customers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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

  const handleShowDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const columns = [
    { header: t("name"), accessor: "name" },
    { header: t("national_id"), accessor: "national_id" },
    { header: t("phone"), accessor: "phone" },
    { header: t("address"), accessor: "address" },
    { header: t("bank_name"), accessor: "bank_name" },
    { header: t("account_number"), accessor: "account_number" },
    {
      header: t("customers_currentBalance"),
      accessor: (row) => (
        <NegativeNumberDisplay value={row.last_balance?.total_value} />
      ),
    },
    {
      header: t("actions"),
      accessor: (row) => {
        return (
          <>
            <div
              style={{ width: "fit-content" }}
              className="d-flex border mx-auto rounded"
            >
              <Can permission="service_show">
                <button
                  className="btn btn-sm btn-primary mx-1 no-style"
                  onClick={() => handleShowDetails(row)}
                >
                  <FontAwesomeIcon icon={faEye} style={{ fontSize: "14px" }} />
                </button>
              </Can>
              <Can permission="service_show">
                <button
                  className="btn btn-sm btn-primary mx-1 no-style"
                  onClick={() => handleEdit(row)}
                >
                  <SquarePen size={16} />
                </button>
              </Can>
            </div>
          </>
        );
      },
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title={t("suppliers")} />

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editId ? t("edit_supplier") : t("add_supplier")} ${formData.name ? `(${formData.name})` : ""}`}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
      >
        <div className="row">
          <div className="col-md-6">
            <MyInput
              label={t("name")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name?.[0]}
              required={true}
            />
          </div>

          <div className="col-md-6">
            <MyInput
              label={t("national_id")}
              value={formData.national_id}
              onChange={(e) =>
                setFormData({ ...formData, national_id: e.target.value })
              }
              error={errors.national_id?.[0]}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <MyInput
              label={t("phone")}
              type="number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              error={errors.phone?.[0]}
            />
          </div>

          <div className="col-md-6">
            <MyInput
              label={t("address")}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              error={errors.address?.[0]}
            />
          </div>
        </div>

        <div className="col-md-6">
          <MyInput
            label={t("account_number")}
            value={formData.account_number}
            onChange={(e) =>
              setFormData({ ...formData, account_number: e.target.value })
            }
            error={errors.account_number?.[0]}
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <MyInput
              label={t("bank_name")}
              value={formData.bank_name}
              onChange={(e) =>
                setFormData({ ...formData, bank_name: e.target.value })
              }
              error={errors.bank_name?.[0]}
            />
          </div>

          <div className="col-md-6">
            <MyInput
              label={t("customers_openingBalance")}
              type="number"
              value={formData.opening_balance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opening_balance: e.target.value,
                })
              }
              error={errors.opening_balance?.[0]}
              disabled={!!(editId && !canEditOpeningBalance)}
            />
            {editId && !canEditOpeningBalance && (
              <div className="text-muted mt-1" style={{ fontSize: "0.9rem" }}>
                {t("cannot_edit_opening_balance_has_transactions")}
              </div>
            )}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-12">
            <div className="d-flex align-items-center mb-3 gap-3">
              <h5 className="mb-0">{t("attachments")}</h5>
              <label className="btn btn-sm btn-outline-primary mb-0">
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                {t("add")}
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
            </div>

            <div className="row">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div
                    className="position-relative border rounded p-2 text-center"
                    style={{ height: "150px" }}
                  >
                    <img
                      src={preview}
                      alt={`preview-${index}`}
                      className="img-fluid h-100"
                      style={{ objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      onClick={() => removeAttachment(index)}
                      style={{ borderRadius: "50%", padding: "2px 6px" }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModalForm>

      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedSupplier?.name || ""}
        mode="view"
      >
        {selectedSupplier?.balances?.length ? (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>{t("customers_details_date")}</th>
                <th>{t("customers_details_type")}</th>
                <th>{t("customers_details_value")}</th>
                <th>{t("customers_details_balance")}</th>
              </tr>
            </thead>
            <tbody>
              {selectedSupplier.balances.map((b) => (
                <tr key={b.id}>
                  <td>{b.date}</td>
                  <td>
                    {b.type === "opening_balance"
                      ? t("customers_details_opening")
                      : t("customers_details_invoice")}
                  </td>
                  <td>
                    <NegativeNumberDisplay value={b.value} />
                  </td>
                  <td>
                    <NegativeNumberDisplay value={b.total_value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>{t("customers_noPayments")}</p>
        )}

        {selectedSupplier?.attachments?.length > 0 && (
          <div className="mt-4">
            <h5 className="mb-3">{t("attachments")}</h5>
            <div className="row">
              {selectedSupplier.attachments.map((att, index) => {
                const storageBaseUrl = BASE_URL.replace("/api/", "/storage/");
                const imageUrl = att.attachment
                  ? `${storageBaseUrl}${att.attachment}`
                  : att.url || att;
                return (
                  <div key={index} className="col-md-4 mb-3">
                    <div
                      className="border rounded p-2 text-center"
                      style={{ height: "150px", background: "#f8f9fa" }}
                    >
                      <a href={imageUrl} target="_blank" rel="noreferrer">
                        <img
                          src={imageUrl}
                          alt={`attachment-${index}`}
                          className="img-fluid h-100"
                          style={{ objectFit: "contain", cursor: "pointer" }}
                        />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ModalForm>

      <MyTable
        resource="customers"
        columns={columns}
        refreshKey={refreshKey}
        title={t("suppliers")}
        button={{
          text: t("add_supplier"),
          onClick: handleAdd,
          variant: "success",
          permission: "service_show",
        }}
        baseFilter={(item) => item.type === "supplier"}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "40px",
        }}
      >
        <div
          className="text-center"
          style={{
            borderRadius: "15px",
            padding: "12px 35px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            minWidth: "300px",
            maxWidth: "90vw",
            backgroundColor: "#b19bd5",
            color: "#fff",
          }}
        >
          ! <strong>{t("customers_alert_title")}</strong>{" "}
          {t("customers_alert_message")}
        </div>
      </div>
    </div>
  );
}

export default Suppliers;
