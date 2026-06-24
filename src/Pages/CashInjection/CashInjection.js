import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";

function CashInjection() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    date: "",
    notes: "",
    branch_id: "",
  });
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    API.get("/branches")
      .then((res) => {
        setBranches(res.data.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch branches:", err);
      });
  }, []);

  const handleAdd = () => {
    setFormData({ value: "", date: "", notes: "", branch_id: "" });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      value: record.value || "",
      date: record.date || "",
      notes: record.notes || "",
      branch_id: record.branch_id || "",
    });
    setEditId(record.id);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editId) {
        await API.put(`/inject-money/${editId}`, formData);
        toast.success(t("cash_injection_updated"));
      } else {
        await API.post("/inject-money", formData);
        toast.success(t("cash_injection_added"));
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(t("cash_injection_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const columns = [
    { header: t("cash_injection_value"), accessor: "value" },
    { header: t("cash_injection_date"), accessor: "date" },
    { header: t("cash_injection_notes"), accessor: "notes" },
    {
      header: t("actions"),
      accessor: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm mx-1 extrabtn"
            title={t("view")}
            onClick={() => handleShowDetails(row)}
          >
            <FontAwesomeIcon icon={faEye} style={{fontSize: "14px"}} />
          </button>
          <Can permission="cash_injection_update">
            <button
              className="btn btn-sm btn-warning mx-1"
              title={t("edit")}
              onClick={() => handleEdit(row)}
            >
              <FontAwesomeIcon icon={faEdit} style={{fontSize: "14px"}} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      {/* Add / Edit Modal */}

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? t("cash_injection_edit") : t("cash_injection_add")}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
      >
        <MyInput
          label={t("cash_injection_value")}
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors.value?.[0]}
        />

        <MyInput
          as="select"
          label={t("branch")}
          value={formData.branch_id}
          onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
          options={[
            { value: "", label: t("select_branch") },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
          error={errors.branch_id?.[0]}
        />

        <MyInput
          label={t("cash_injection_date")}
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date?.[0]}
        />

        <MyInput
          label={t("cash_injection_notes")}
          type="textarea"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          error={errors.notes?.[0]}
        />
      </ModalForm>

      {/* View Details Modal */}
      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t("cash_injection_details")}
        mode="print"
      >
        {selectedRecord ? (
          <div className="p-3">
            <div className="row g-3">
              <div className="col-6">
                <label className="fw-bold text-muted small">
                  {t("cash_injection_value")}
                </label>
                <p className="fw-bold fs-5 border-bottom pb-2">
                  {selectedRecord.value}
                </p>
              </div>
              <div className="col-6">
                <label className="fw-bold text-muted small">
                  {t("cash_injection_date")}
                </label>
                <p className="fw-bold fs-5 border-bottom pb-2">
                  {selectedRecord.date || "-"}
                </p>
              </div>
              <div className="col-12">
                <label className="fw-bold text-muted small">
                  {t("cash_injection_notes")}
                </label>
                <p className="border-bottom pb-2">
                  {selectedRecord.notes || "-"}
                </p>
              </div>
              {/* <div className="col-12">
                <label className="fw-bold text-muted small">
                  {t("created_at")}
                </label>
                <p className="border-bottom pb-2">
                  {selectedRecord.created_at
                    ? new Date(selectedRecord.created_at).toLocaleString(
                        "ar-EG",
                        {
                          dateStyle: "short",
                          timeStyle: "short",
                        },
                      )
                    : "-"}
                </p>
              </div> */}
            </div>
          </div>
        ) : (
          <p>{t("no_data")}</p>
        )}
      </ModalForm>

      {/* Table */}
      <MyTable
        resource="inject-money"
        columns={columns}
        refreshKey={refreshKey}
        dateFilter={{
          field: "date",
          label: t("cash_injection_date"),
        }}
        title={t("cash_injection_title")}
        button={{
          text: t("cash_injection_add"),
          onClick: handleAdd,
          variant: "success",
          permission: "cash_injection_create",
        }}
      />
    </div>
  );
}

export default CashInjection;
