import { useState } from "react";
import { useTranslation } from "react-i18next";

import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

// import MyButton from "../../Components/MyButton";
// import Can from "../../Components/Can";

function CashTransfer() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    value: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleAdd = () => {
    setFormData({
      from: "",
      to: "",
      value: "",
      date: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        date: formData.date || new Date().toISOString().split("T")[0],
      };

      await API.post("/cash-transfer", payload);
      toast.success(t("cashTransfer_addSuccess"));
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(t("general_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (withdrawl) => {
    setSelectedTransfer(withdrawl);
    setShowDetailsModal(true);
  };

  const columns = [
    {
      header: t("cashTransfer_from"),
      accessor: (row) =>
        row.from === "bank" ? t("cashTransfer_bank") : t("cashTransfer_cash"),
    },
    {
      header: t("cashTransfer_to"),
      accessor: (row) =>
        row.to === "bank" ? t("cashTransfer_bank") : t("cashTransfer_cash"),
    },
    { header: t("cashTransfer_value"), accessor: "value" },
    { header: t("cashTransfer_date"), accessor: "date" },
    {
      header: t("cashTransfer_actions"),
      accessor: (row) => (
        <button
          className="btn btn-sm mx-1 extrabtn"
          title={t("cashTransfer_viewDetails")}
          onClick={() => handleShowDetails(row)}
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title={t("cashTransfer_title")} />
      {/* <Can permission="cash_transfer_create">
              <MyButton
                  text="إضافة تحويل"
                  variant="success"
                  type="button"
                  className="mb-3"
                  onClick={handleAdd}
              />
          </Can> */}
      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={t("cashTransfer_addTitle")}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
      >
        <MyInput
          as="select"
          value={formData.from}
          onChange={(e) => setFormData({ ...formData, from: e.target.value })}
          options={[
            { value: "", label: t("cashTransfer_from") },
            { value: "cash", label: t("cashTransfer_cash") },
            { value: "bank", label: t("cashTransfer_bank") },
          ]}
          error={errors.from?.[0]}
          required={true}
        />

        <MyInput
          as="select"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          options={[
            { value: "", label: t("cashTransfer_to") },
            { value: "cash", label: t("cashTransfer_cash") },
            { value: "bank", label: t("cashTransfer_bank") },
          ]}
          error={errors.to?.[0]}
          required={true}
        />

        <MyInput
          label={t("cashTransfer_value")}
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors.value?.[0]}
          required={true}
        />

        <MyInput
          label={t("cashTransfer_date")}
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date?.[0]}
          required={true}
        />
      </ModalForm>

      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t("cashTransfer_detailsTitle")}
        mode="print"
      >
        {selectedTransfer ? (
          <div dir="rtl">
            <h5 className="text-center mb-5 ">
              {t("cashTransfer_title")} ({selectedTransfer.id})
            </h5>
            <p>
              <strong>{t("cashTransfer_from")}:</strong>{" "}
              {selectedTransfer.from === "bank"
                ? t("cashTransfer_bank")
                : t("cashTransfer_cash")}
            </p>
            <p>
              <strong>{t("cashTransfer_to")}:</strong>{" "}
              {selectedTransfer.to === "bank"
                ? t("cashTransfer_bank")
                : t("cashTransfer_cash")}
            </p>
            <p>
              <strong>{t("cashTransfer_value")}:</strong>{" "}
              {selectedTransfer.value}
            </p>
            {/* <p>
            <strong>{t("cashTransfer_date")}:</strong>{" "}
            {selectedTransfer.date
              ? new Date(selectedTransfer.date).toLocaleDateString("ar-EG")
              : "—"}
          </p> */}
            <p>
              <strong>{t("cashTransfer_eventDate")}:</strong>{" "}
              {selectedTransfer.created_at
                ? new Date(selectedTransfer.created_at).toLocaleString(
                    "ar-EG",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    },
                  )
                : "—"}
            </p>
          </div>
        ) : (
          <p>{t("general_loading")}</p>
        )}
      </ModalForm>

      <MyTable
        resource="cash-transfer"
        columns={columns}
        refreshKey={refreshKey}
        title={t("cashTransfer_title")}
        dateFilter={{
          field: "created_at",
          label: t("cashTransfer_createdAt"),
        }}
        button={{
          text: t("cashTransfer_addButton"),
          onClick: handleAdd,
          variant: "success",
          permission: "cash_transfer_create",
        }}
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
          <strong>{t("cashTransfer_alertTitle")}</strong>{" "}
          {t("cashTransfer_alertText")}
          <u>{t("cashTransfer_alertUnderline")}</u>.
        </div>
      </div>
    </div>
  );
}

export default CashTransfer;
