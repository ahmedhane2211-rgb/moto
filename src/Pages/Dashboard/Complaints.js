import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";

function Complaints() {
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isRTL = i18n.language === "ar";

  const handleView = (record) => {
    setSelectedComplaint(record);
    setShowViewModal(true);
  };

  const handleDeleteClick = (uuid) => {
    setDeleteId(uuid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/complaints/${deleteId}`);
      toast.success(isRTL ? "تم حذف الشكوى بنجاح" : "Complaint deleted successfully");
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "فشل حذف الشكوى" : "Failed to delete complaint");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { header: isRTL ? "الاسم" : "Name", accessor: "name" },
    { header: isRTL ? "الهاتف" : "Phone", accessor: "phone" },
    { header: isRTL ? "البريد الإلكتروني" : "Email", accessor: "email" },
    { header: isRTL ? "العنوان" : "Address", accessor: "address" },
    {
      header: isRTL ? "الشكوى" : "Complaint",
      accessor: (row) => {
        const text = row.complaint || "";
        return text.length > 50 ? `${text.substring(0, 50)}...` : text;
      },
    },
    {
      header: isRTL ? "الإجراءات" : "Actions",
      accessor: (row) => (
        <div style={{ width: "fit-content" }} className="d-flex border mx-auto rounded">
          <button
            className="btn btn-sm btn-info mx-1 no-style"
            onClick={() => handleView(row)}
            title={isRTL ? "عرض الشكوى" : "View Complaint"}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <Can permission="admin_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}
              title={isRTL ? "حذف الشكوى" : "Delete Complaint"}
            >
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
      <Mytitle title={isRTL ? "الشكاوي والاقتراحات" : "Complaints & Suggestions"} />

      {/* View Complaint Modal */}
      <ModalForm
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={isRTL ? "تفاصيل الشكوى" : "Complaint Details"}
        mode="view"
        size="lg"
      >
        {selectedComplaint && (
          <div className="row g-3 p-3 vsc" style={{ borderRadius: "10px", direction: isRTL ? "rtl" : "ltr" }}>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "الاسم" : "Name"}:</label>
              <p className="border-bottom pb-2">{selectedComplaint.name || "—"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "رقم الهاتف" : "Phone Number"}:</label>
              <p className="border-bottom pb-2" dir="ltr" style={{ textAlign: isRTL ? "right" : "left" }}>
                {selectedComplaint.phone || "—"}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "البريد الإلكتروني" : "Email"}:</label>
              <p className="border-bottom pb-2">{selectedComplaint.email || "—"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "العنوان" : "Address"}:</label>
              <p className="border-bottom pb-2">{selectedComplaint.address || "—"}</p>
            </div>
            <div className="col-12 mb-3">
              <label className="fw-bold">{isRTL ? "نص الشكوى" : "Complaint Content"}:</label>
              <div
                className="p-3 border rounded"
                style={{
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text-main)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  minHeight: "100px",
                }}
              >
                {selectedComplaint.complaint || "—"}
              </div>
            </div>
          </div>
        )}
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={isRTL ? "تأكيد الحذف" : "Confirm Delete"}
        onSubmit={confirmDelete}
        loading={deleting}
        mode="confirm"
        confirmText={isRTL ? "حذف" : "Delete"}
        cancelText={isRTL ? "إلغاء" : "Cancel"}
      >
        {isRTL ? "هل أنت متأكد أنك تريد حذف هذه الشكوى؟" : "Are you sure you want to delete this complaint?"}
      </ModalForm>

      {/* Table to display complaints */}
      <MyTable
        resource="complaints"
        columns={columns}
        refreshKey={refreshKey}
      />
    </div>
  );
}

export default Complaints;
