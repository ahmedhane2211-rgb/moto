import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faStar, faCheck, faBan } from "@fortawesome/free-solid-svg-icons";
import Can from "../../Components/Can";
import { useTranslation } from "react-i18next";

function Reviews() {
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isRTL = i18n.language === "ar";

  const handleView = (record) => {
    setSelectedReview(record);
    setShowViewModal(true);
  };

  const handleDeleteClick = (uuid) => {
    setDeleteId(uuid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/reviews/${deleteId}`);
      toast.success(isRTL ? "تم حذف التقييم بنجاح" : "Review deleted successfully");
      setRefreshKey((prev) => prev + 1);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "فشل حذف التقييم" : "Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.post(`/reviews/${id}/approve`);
      toast.success(isRTL ? "تم قبول التقييم بنجاح" : "Review approved successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "فشل قبول التقييم" : "Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/reviews/${id}/reject`);
      toast.success(isRTL ? "تم رفض التقييم بنجاح" : "Review rejected successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "فشل رفض التقييم" : "Failed to reject review");
    }
  };

  // Helper to render stars beautifully
  const renderStars = (rating) => {
    const stars = [];
    const count = parseInt(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          style={{ color: i <= count ? "gold" : "#ccc", marginRight: "2px" }}
        />
      );
    }
    return <div dir="ltr" style={{ display: "inline-flex" }}>{stars}</div>;
  };

  const columns = [
    { header: isRTL ? "الاسم" : "Name", accessor: "name" },
    { header: isRTL ? "الهاتف" : "Phone", accessor: "phone" },
    { header: isRTL ? "البريد الإلكتروني" : "Email", accessor: "email" },
    {
      header: isRTL ? "التقييم" : "Rating",
      accessor: (row) => renderStars(row.rate),
    },
    {
      header: isRTL ? "الحالة" : "Status",
      accessor: (row) => {
        const status = row.status || (row.is_approved ? "approved" : "pending");
        let badgeColor = "bg-warning";
        let label = isRTL ? "قيد الانتظار" : "Pending";

        if (status === "approved" || status === "approve") {
          badgeColor = "bg-success";
          label = isRTL ? "مقبول" : "Approved";
        } else if (status === "rejected" || status === "reject") {
          badgeColor = "bg-danger";
          label = isRTL ? "مرفوض" : "Rejected";
        }
        return <span className={`badge ${badgeColor}`}>{label}</span>;
      }
    },
    {
      header: isRTL ? "الإجراءات" : "Actions",
      accessor: (row) => (
        <div style={{ width: "fit-content" }} className="d-flex border mx-auto rounded">
          <button
            className="btn btn-sm btn-info mx-1 no-style"
            onClick={() => handleView(row)}
            title={isRTL ? "عرض التقييم" : "View Review"}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          
          {(row.status !== "approved" && row.status !== "approve") && (
            <button
              className="btn btn-sm btn-success mx-1 no-style"
              onClick={() => handleApprove(row.id || row.uuid)}
              title={isRTL ? "قبول التقييم" : "Approve Review"}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          )}

          {(row.status !== "rejected" && row.status !== "reject") && (
            <button
              className="btn btn-sm btn-warning mx-1 no-style"
              onClick={() => handleReject(row.id || row.uuid)}
              title={isRTL ? "رفض التقييم" : "Reject Review"}
            >
              <FontAwesomeIcon icon={faBan} />
            </button>
          )}

          <Can permission="admin_delete">
            <button
              className="btn btn-sm btn-danger no-style"
              onClick={() => handleDeleteClick(row.uuid)}
              title={isRTL ? "حذف التقييم" : "Delete Review"}
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
      <Mytitle title={isRTL ? "تقييمات وآراء العملاء" : "Customer Reviews & Ratings"} />

      {/* View Review Modal */}
      <ModalForm
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={isRTL ? "تفاصيل التقييم" : "Review Details"}
        mode="view"
        size="lg"
      >
        {selectedReview && (
          <div className="row g-3 p-3 vsc" style={{ borderRadius: "10px", direction: isRTL ? "rtl" : "ltr" }}>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "الاسم" : "Name"}:</label>
              <p className="border-bottom pb-2">{selectedReview.name || "—"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "رقم الهاتف" : "Phone Number"}:</label>
              <p className="border-bottom pb-2" dir="ltr" style={{ textAlign: isRTL ? "right" : "left" }}>
                {selectedReview.phone || "—"}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "البريد الإلكتروني" : "Email"}:</label>
              <p className="border-bottom pb-2">{selectedReview.email || "—"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-bold">{isRTL ? "التقييم بالنجوم" : "Star Rating"}:</label>
              <div className="pb-2 border-bottom">{renderStars(selectedReview.rate)}</div>
            </div>
            <div className="col-12 mb-3">
              <label className="fw-bold">{isRTL ? "الرسالة / التجربة" : "Message / Experience"}:</label>
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
                {selectedReview.message || "—"}
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
        {isRTL ? "هل أنت متأكد أنك تريد حذف هذا التقييم؟" : "Are you sure you want to delete this review?"}
      </ModalForm>

      {/* Table to display reviews */}
      <MyTable
        resource="reviews"
        columns={columns}
        refreshKey={refreshKey}
      />
    </div>
  );
}

export default Reviews;
