import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
// import MyButton from "../../Components/MyButton";
// import Can from "../../Components/Can";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

function OwnerWithdrawl() {
  const { t } = useTranslation();
  const { user, handleRefetch } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    cash_type: "",
    date: null,
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWithdrawl, setSelectedWithdrawl] = useState(null);

  const handleAdd = () => {
    setFormData({
      value: "",
      cash_type: "",
      date: null,
      description: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await API.post("/owner-withdrawl", formData);
      console.log(t("ownerWithdrawl_success"));
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.log(t("ownerWithdrawl_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (withdrawl) => {
    setSelectedWithdrawl(withdrawl);
    setShowDetailsModal(true);
  };

  const columns = [
    { header: t("ownerWithdrawl_value"), accessor: "value" },
    {
      header: t("ownerWithdrawl_safe"),
      accessor: (row) =>
        row.cash_type === "bank"
          ? t("ownerWithdrawl_bank")
          : t("ownerWithdrawl_cash"),
    },
    { header: t("ownerWithdrawl_date"), accessor: "date" },
    { header: t("ownerWithdrawl_description"), accessor: "description" },
    {
      header: t("ownerWithdrawl_actions"),
      accessor: (row) => (
        <button
          className="btn btn-sm mx-1 extrabtn"
          title={t("ownerWithdrawl_viewDetails")}
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
      <Mytitle title={t("ownerWithdrawl_title")} />

      {/* <Can permission="owner_withdrawl_create">
        <MyButton
          text={t("ownerWithdrawl_add")}
          variant="success"
          type="button"
          className="mb-3"
          onClick={handleAdd}
        />
      </Can> */}

      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={t("ownerWithdrawl_addNew")}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form"
        cash_type={formData.cash_type}
      >
        <MyInput
          label={t("ownerWithdrawl_value")}
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors.value?.[0]}
        />

        <MyInput
          as="select"
          value={formData.cash_type}
          formData={formData}
          onChange={(e) => {
            handleRefetch();
            setFormData({ ...formData, cash_type: e.target.value });
          }}
          options={[
            { value: "", label: t("ownerWithdrawl_selectSafe") },
            { value: "cash", label: t("ownerWithdrawl_cash") },
            { value: "bank", label: t("ownerWithdrawl_bank") },
          ]}
          error={errors.cash_type?.[0]}
        />

        <MyInput
          label={t("ownerWithdrawl_date")}
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date?.[0]}
        />

        <MyInput
          label={t("ownerWithdrawl_description")}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          error={errors.description?.[0]}
        />

        {formData.cash_type === "cash" && (
          <div className="text-muted mb-2" style={{ direction: "rtl" }}>
            {t("ownerWithdrawl_cashBalance")}{" "}
            <strong>{user?.data.last_cash_balance ?? 0}</strong>
          </div>
        )}

        {formData.cash_type === "bank" && (
          <div className="text-muted mb-2" style={{ direction: "rtl" }}>
            {t("ownerWithdrawl_bankBalance")}{" "}
            <strong>{user?.data.last_bank_balance ?? 0}</strong>
          </div>
        )}
      </ModalForm>

      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t("ownerWithdrawl_details")}
        mode="print"
      >
        {selectedWithdrawl ? (
          <div className="p-3 bg-white text-dark" dir="rtl">
            <p>
              <strong>{t("ownerWithdrawl_value")}:</strong>{" "}
              {selectedWithdrawl.value}
            </p>
            <p>
              <strong>{t("ownerWithdrawl_type")}:</strong>{" "}
              {selectedWithdrawl.cash_type === "bank"
                ? t("ownerWithdrawl_bank")
                : t("ownerWithdrawl_cash")}
            </p>
            <p>
              <strong>{t("ownerWithdrawl_description")}:</strong>{" "}
              {selectedWithdrawl.description || "-"}
            </p>
            <p>
              <strong>{t("ownerWithdrawl_createdAt")}:</strong>{" "}
              {new Date(selectedWithdrawl.created_at).toLocaleString("ar-EG", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
        ) : (
          <p>{t("ownerWithdrawl_noData")}</p>
        )}
      </ModalForm>

      <ModalForm
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={t("ownerWithdrawl_operationDetails")}
        mode="print"
      >
        {selectedWithdrawl ? (
          <div className="p-3 bg-white text-dark" dir="rtl">
            <h5 className="text-center mb-5">
              {t("ownerWithdrawl_title")} ({selectedWithdrawl.id})
            </h5>
            <p>
              <strong>{t("ownerWithdrawl_value")}:</strong>{" "}
              {selectedWithdrawl.value}
            </p>
            <p>
              <strong>{t("ownerWithdrawl_date")}:</strong>{" "}
              {selectedWithdrawl.date}
            </p>
            <p>
              <strong>{t("ownerWithdrawl_createdAt")}:</strong>{" "}
              {new Date(selectedWithdrawl.created_at).toLocaleString("ar-EG", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
            <p>
              <strong>{t("ownerWithdrawl_note")}:</strong>{" "}
              {selectedWithdrawl.note || "-"}
            </p>
          </div>
        ) : (
          <p>{t("ownerWithdrawl_noData")}</p>
        )}
      </ModalForm>

      <MyTable
        resource="owner-withdrawl"
        columns={columns}
        refreshKey={refreshKey}
        dateFilter={{
          field: "created_at",
          label: t("ownerWithdrawl_createdAt"),
        }}
        title={t("ownerWithdrawl_title")}
        button={{
          text: t("ownerWithdrawl_add"),
          onClick: handleAdd,
          variant: "success",
          permission: "owner_withdrawl_create",
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
          ! <strong>{t("ownerWithdrawl_alertTitle")}</strong>{" "}
          {t("ownerWithdrawl_alertMessage")}
        </div>
      </div>
    </div>
  );
}

export default OwnerWithdrawl;
