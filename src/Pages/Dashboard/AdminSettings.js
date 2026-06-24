import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faStar } from "@fortawesome/free-solid-svg-icons";
import API from "../../Api/axiosConfig";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

function AdminSettings() {
  const [showReviews, setShowReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const isArabic = i18n.language.startsWith("ar");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await API.get("/admin-settings");
        const settingsData = response.data?.data || response.data;
        if (settingsData && typeof settingsData.show_reviews !== "undefined") {
          setShowReviews(settingsData.show_reviews);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching admin settings:", err);
        setError(
          isArabic
            ? "فشل في تحميل الإعدادات من الخادم."
            : "Failed to load settings from server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async () => {
    const newValue = !showReviews;
    setShowReviews(newValue);
    setSaving(true);

    try {
      await API.post("/admin-settings", {
        show_reviews: newValue,
      });
      toast.success(
        isArabic
          ? "تم حفظ الإعدادات بنجاح"
          : "Settings saved successfully"
      );
    } catch (err) {
      console.error("Error updating admin settings:", err);
      toast.error(
        isArabic
          ? "حدث خطأ أثناء حفظ التعديلات، يرجى المحاولة مرة أخرى."
          : "An error occurred while saving changes, please try again."
      );
      setShowReviews(!newValue);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container p-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 opacity-75">
          {isArabic ? "جاري تحميل الإعدادات..." : "Loading settings..."}
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="container p-4 text-center text-danger">{error}</div>;
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center gap-3">
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "var(--button-pr, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesomeIcon icon={faCog} style={{ color: "#fff", fontSize: "20px" }} />
        </div>
        <div>
          <h2 className="mb-0 fw-bold" style={{ color: "var(--text-main)" }}>
            {isArabic ? "الإعدادات العامة للوحة التحكم" : "Global Admin Settings"}
          </h2>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "1.5rem",
          maxWidth: "700px",
        }}
      >
        <h5
          className="fw-bold mb-4 pb-3"
          style={{
            color: "var(--text-main)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {isArabic ? "ظهور الأقسام في الصفحة الرئيسية" : "Sections Visibility on Home Page"}
        </h5>

        {/* Toggle Row */}
        <div
          className="d-flex align-items-center justify-content-between p-3 rounded-3"
          style={{
            background: "var(--main-bg)",
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.3s",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: showReviews
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s",
              }}
            >
              <FontAwesomeIcon
                icon={faStar}
                style={{
                  color: showReviews ? "#22c55e" : "#ef4444",
                  fontSize: "16px",
                  transition: "color 0.3s",
                }}
              />
            </div>
            <div>
              <p className="fw-bold mb-0" style={{ color: "var(--text-main)" }}>
                {isArabic ? "قسم تقييمات العملاء" : "Customer Reviews Section"}
              </p>
              <small style={{ color: "#888" }}>
                {isArabic
                  ? "يتحكم في ظهور زر 'التقييمات' في فوتر الصفحة الرئيسية"
                  : "Controls the visibility of the 'Reviews' button in the home page footer"}
              </small>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="d-flex align-items-center gap-2">
            {saving && (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                style={{ color: "var(--button-pr, #7c3aed)" }}
              />
            )}
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="toggleReviews"
                checked={showReviews}
                onChange={handleToggle}
                disabled={saving}
                style={{
                  width: "3.2rem",
                  height: "1.6rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  backgroundColor: showReviews ? "var(--button-pr, #7c3aed)" : "#6b7280",
                  borderColor: showReviews ? "var(--button-pr, #7c3aed)" : "#6b7280",
                  backgroundImage: "none",
                  transition: "background-color 0.3s, border-color 0.3s",
                }}
              />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2"
          style={{
            background: showReviews
              ? "rgba(34,197,94,0.08)"
              : "rgba(239,68,68,0.08)",
            border: `1px solid ${showReviews ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            transition: "all 0.3s",
          }}
        >
          <span style={{ fontSize: "18px" }}>{showReviews ? "✅" : "⛔"}</span>
          <span
            style={{
              color: showReviews ? "#22c55e" : "#ef4444",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            {isArabic
              ? showReviews
                ? "قسم التقييمات ظاهر حالياً في الصفحة الرئيسية"
                : "قسم التقييمات مخفي حالياً من الصفحة الرئيسية"
              : showReviews
              ? "Reviews section is currently visible on the home page"
              : "Reviews section is currently hidden from the home page"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;