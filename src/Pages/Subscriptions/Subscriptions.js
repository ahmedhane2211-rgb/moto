import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyButton from "../../Components/MyButton";
import Can from "../../Components/Can";
import { SquarePen, Eye, CalendarDays, Crown, CheckCircle2, XCircle, Clock, Sparkles, AlertTriangle } from "lucide-react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

// ─── Subscription Details Modal ──────────────────────────────────────────────
function SubscriptionDetailsModal({ show, onClose, record }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const getStatus = (sub) => {
    const now = new Date();
    const from = new Date(sub.from);
    const to = new Date(sub.to);
    if (now < from) return "upcoming";
    if (now > to) return "expired";
    return "active";
  };

  const getDaysRemaining = (to) => {
    const diff = Math.ceil((new Date(to) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (status) => {
    const map = {
      active:   { cls: "sub-badge-active",   icon: <CheckCircle2 size={13} />, label: "فعّال" },
      expired:  { cls: "sub-badge-expired",  icon: <XCircle size={13} />,      label: "منتهي" },
      upcoming: { cls: "sub-badge-upcoming", icon: <Clock size={13} />,         label: "قادم" },
    };
    const s = map[status];
    if (!s) return null;
    return (
      <span className={`sub-badge ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  // Load subscription details when modal opens
  const handleShow = async () => {
    if (historyLoaded || !record) return;
    setHistoryLoading(true);
    try {
      const uuid = record?.uuid || record?.id;
      const res = await API.get(`/subscriptions/${uuid}`);
      const data = res.data?.data || res.data || {};
      // Support array or single object with nested history
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data.history) {
        setHistory(data.history);
      } else if (data.subscriptions) {
        setHistory(data.subscriptions);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
      setHistoryLoaded(true);
    }
  };

  const handleClose = () => {
    setHistory([]);
    setHistoryLoaded(false);
    onClose();
  };

  if (!record) return null;

  const status = getStatus(record);
  const daysLeft = getDaysRemaining(record.to);

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        onShow={handleShow}
        dialogClassName="sub-details-modal"
      >
        <Modal.Header
          closeButton
          className=" d-flex justify-content-between"
          style={{ borderBottom: "1px solid var(--border-color)", background: "var(--card-bg)" }}
        >
          <Modal.Title style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)" }}>
            تفاصيل الاشتراك
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: "var(--main-bg)", padding: "24px" }}>

          {/* ── Current Subscription Card ── */}
          <div className="sdd-card mb-4">
            <div className="sdd-card-header">
              <div className="sdd-icon">
                <Crown size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-main)" }}>
                    {record.is_trial ? "اشتراك تجريبي" : "اشتراك مدفوع"}
                  </span>
                  {getStatusBadge(status)}
                </div>
                <small style={{ color: "var(--text-secondary)" }}>
                  {record?.store?.user?.email || "—"}
                </small>
              </div>
              {record.value && (
                <div className="sdd-value">{record.value} ر.س</div>
              )}
            </div>

            <div className="sdd-card-body">
              <div className="sdd-info-row">
                <div className="sdd-info-item">
                  <CalendarDays size={16} style={{ color: "var(--primary-color)" }} />
                  <div>
                    <small style={{ color: "var(--text-secondary)", display: "block" }}>تاريخ البداية</small>
                    <strong>{record.from}</strong>
                  </div>
                </div>
                <div className="sdd-info-item">
                  <CalendarDays size={16} style={{ color: "var(--primary-color)" }} />
                  <div>
                    <small style={{ color: "var(--text-secondary)", display: "block" }}>تاريخ الانتهاء</small>
                    <strong>{record.to}</strong>
                  </div>
                </div>
                <div className="sdd-info-item">
                  <div className={`sdd-active-dot ${record.active ? "active" : "inactive"}`} />
                  <div>
                    <small style={{ color: "var(--text-secondary)", display: "block" }}>الحالة</small>
                    <strong>{record.active ? "مفعّل" : "موقوف"}</strong>
                  </div>
                </div>
              </div>

              {/* Progress bar – only for active subscriptions */}
              {status === "active" && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>التقدم الزمني</span>
                    <span style={{ color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Sparkles size={13} /> {daysLeft} يوم متبقي
                    </span>
                  </div>
                  <div className="sdd-progress-bar">
                    <div
                      className="sdd-progress-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100,
                          ((new Date() - new Date(record.from)) /
                            (new Date(record.to) - new Date(record.from))) * 100
                        ))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {status === "expired" && (
                <div className="sdd-warning">
                  <AlertTriangle size={16} />
                  <span>هذا الاشتراك منتهٍ منذ {Math.abs(daysLeft)} يوم</span>
                </div>
              )}
            </div>
          </div>

          {/* ── History Timeline ── */}
          <div className="sdd-history-section">
            <h6 style={{ fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)" }}>
              <Clock size={18} /> سجل الاشتراكات السابقة
            </h6>

            {historyLoading ? (
              <div style={{ textAlign: "center", padding: "30px" }}>
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              </div>
            ) : history.length === 0 ? (
              <div className="sdd-empty">
                <Crown size={36} style={{ opacity: 0.3, marginBottom: "8px" }} />
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>لا يوجد سجل اشتراكات</p>
              </div>
            ) : (
              <div className="sdd-timeline">
                {history.map((sub, idx) => {
                  const s = getStatus(sub);
                  return (
                    <div key={sub.id || sub.uuid || idx} className={`sdd-timeline-item sdd-tl-${s}`}>
                      <div className="sdd-tl-dot" />
                      <div className="sdd-tl-content">
                        <div className="sdd-tl-top">
                          <span style={{ fontWeight: 600 }}>
                            {sub.is_trial ? "تجريبي" : "مدفوع"}
                          </span>
                          {getStatusBadge(s)}
                          {sub.value && (
                            <span style={{ marginRight: "auto", fontWeight: 700, color: "var(--primary-color)" }}>
                              {sub.value} ر.س
                            </span>
                          )}
                        </div>
                        <div className="sdd-tl-dates">
                          <span><CalendarDays size={13} /> من: {sub.from}</span>
                          <span><CalendarDays size={13} /> إلى: {sub.to}</span>
                          {s === "active" && (
                            <span className="sdd-days-badge">{getDaysRemaining(sub.to)} يوم متبقي</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer style={{ background: "var(--card-bg)", borderTop: "1px solid var(--border-color)" }}>
          <button className="btn btn-secondary btn-sm" onClick={handleClose}>إغلاق</button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .sdd-card {
          background: var(--card-bg);
          border-radius: 14px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .sdd-card-header {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid var(--border-color);
        }
        .sdd-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0EA5E9, #06B6D4);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
        }
        .sdd-value {
          font-size: 20px; font-weight: 800;
          color: var(--primary-color);
          white-space: nowrap;
        }
        .sdd-card-body { padding: 18px 20px; }
        .sdd-info-row {
          display: flex; gap: 24px; flex-wrap: wrap;
        }
        .sdd-info-item {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .sdd-active-dot {
          width: 14px; height: 14px; border-radius: 50%; margin-top: 4px;
          flex-shrink: 0;
        }
        .sdd-active-dot.active  { background: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,.2); }
        .sdd-active-dot.inactive { background: #EF4444; box-shadow: 0 0 0 3px rgba(239,68,68,.2); }
        .sdd-progress-bar {
          height: 8px; background: var(--border-color);
          border-radius: 4px; overflow: hidden;
        }
        .sdd-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #0EA5E9);
          border-radius: 4px; transition: width 1s ease;
        }
        .sdd-warning {
          margin-top: 14px; padding: 10px 14px;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 8px; color: #EF4444;
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600;
        }
        .sdd-history-section {
          background: var(--card-bg);
          border-radius: 14px; padding: 20px;
          border: 1px solid var(--border-color);
        }
        .sdd-empty {
          text-align: center; padding: 32px;
          color: var(--text-secondary);
        }
        .sdd-timeline { position: relative; padding-right: 24px; }
        [dir="ltr"] .sdd-timeline { padding-left: 24px; padding-right: 0; }
        .sdd-timeline::before {
          content: ''; position: absolute;
          right: 6px; top: 0; bottom: 0;
          width: 2px; background: var(--border-color);
        }
        [dir="ltr"] .sdd-timeline::before { left: 6px; right: auto; }
        .sdd-timeline-item {
          position: relative; padding: 14px 16px;
          margin-bottom: 12px;
          background: var(--main-bg);
          border-radius: 10px;
          border: 1px solid var(--border-color);
          transition: all .25s ease;
        }
        .sdd-timeline-item:last-child { margin-bottom: 0; }
        .sdd-timeline-item:hover { transform: translateX(-3px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        [dir="ltr"] .sdd-timeline-item:hover { transform: translateX(3px); }
        .sdd-tl-dot {
          position: absolute; right: -31px; top: 20px;
          width: 13px; height: 13px; border-radius: 50%;
          border: 3px solid var(--card-bg);
        }
        [dir="ltr"] .sdd-tl-dot { left: -31px; right: auto; }
        .sdd-tl-active   .sdd-tl-dot { background: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,.2); }
        .sdd-tl-expired  .sdd-tl-dot { background: #EF4444; }
        .sdd-tl-upcoming .sdd-tl-dot { background: #F59E0B; }
        .sdd-tl-content {}
        .sdd-tl-top {
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap; margin-bottom: 8px;
        }
        .sdd-tl-dates {
          display: flex; gap: 16px; flex-wrap: wrap;
          font-size: 13px; color: var(--text-secondary);
        }
        .sdd-tl-dates span { display: flex; align-items: center; gap: 5px; }
        .sdd-days-badge {
          background: rgba(16,185,129,.1); color: #10B981;
          padding: 2px 8px; border-radius: 10px;
          font-weight: 600; font-size: 12px;
        }
        .sub-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
        }
        .sub-badge-active   { background: rgba(16,185,129,.15); color: #10B981; }
        .sub-badge-expired  { background: rgba(239,68,68,.15);  color: #EF4444; }
        .sub-badge-upcoming { background: rgba(245,158,11,.15); color: #F59E0B; }
      `}</style>
    </>
  );
}

// ─── Main Subscriptions Page ──────────────────────────────────────────────────
function Subscriptions() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    from: "",
    to: "",
    value: "",
    is_trial: false,
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState(null);

  // View details state
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      from: "",
      to: "",
      value: "",
      is_trial: false,
      active: true,
    });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      from: record.from,
      to: record.to,
      value: record.value,
      is_trial: record.is_trial,
      active: record.active,
    });
    setEditId(record.uuid);
    setErrors({});
    setShowModal(true);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editId) {
        await API.put(`/subscriptions/${editId}`, formData);
        toast.success("تم تعديل الاشتراك بنجاح");
      } else {
        await API.post("/subscriptions", formData);
        toast.success("تم إضافة الاشتراك بنجاح");
      }
      setShowModal(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "من", accessor: "from" },
    { header: "إلى", accessor: "to" },
    { header: "القيمة", accessor: "value" },
    {
      header: "تجريبي؟",
      accessor: (row) => (row.is_trial ? "نعم" : "لا"),
    },
    {
      header: "مفعل؟",
      accessor: (row) => (row.active ? "نعم" : "لا"),
    },
    {
      header: "الايميل",
      accessor: (row) => row.store?.user?.email,
    },
    {
      header: "الإجراءات",
      accessor: (row) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          {/* View Details Button */}
          <button
            title="عرض التفاصيل"
            className="btn btn-sm no-style"
            style={{
              background: "rgba(14,165,233,0.1)",
              color: "#0EA5E9",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: "8px",
              padding: "4px 8px",
              transition: "all .2s",
            }}
            onClick={() => handleViewDetails(row)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0EA5E9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(14,165,233,0.1)";
            }}
          >
            <Eye size={16} />
          </button>

          {/* Edit Button */}
          <Can permission="subscriber_update">
            <button
              title="تعديل"
              className="btn btn-sm btn-primary mx-1 no-style"
              onClick={() => handleEdit(row)}
            >
              <SquarePen size={16} />
            </button>
          </Can>
        </div>
      ),
      hideOnPrint: true,
    },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title="الاشتراكات" />
      <Can permission="subscriber_create">
        <MyButton
          text="إضافة اشتراك"
          variant="success"
          type="button"
          className="mb-3"
          onClick={handleAdd}
        />
      </Can>

      {/* Add / Edit Modal */}
      <ModalForm
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "تعديل الاشتراك" : "إضافة اشتراك"}
        onSubmit={handleSubmit}
        loading={loading}
        mode="form">
        {!editId && (
          <>
            <MyInput
              type="text"
              label="الاسم"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name?.[0]}
            />
            <MyInput
              type="email"
              label="البريد الإلكتروني"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email?.[0]}
            />
            <MyInput
              type="password"
              label="كلمة المرور"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password?.[0]}
            />
            <MyInput
              type="password"
              label="تأكيد كلمة المرور"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              error={errors.password_confirmation?.[0]}
            />
          </>
        )}

        <MyInput
          type="date"
          label="من"
          value={formData.from}
          onChange={(e) => setFormData({ ...formData, from: e.target.value })}
          error={errors.from?.[0]}
        />
        <MyInput
          type="date"
          label="إلى"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          error={errors.to?.[0]}
        />
        <MyInput
          type="number"
          label="القيمة"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors.value?.[0]}
        />
        <div className="form-check my-2">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.is_trial}
            onChange={(e) =>
              setFormData({ ...formData, is_trial: e.target.checked })
            }
          />
          <label className="form-check-label">اشتراك تجريبي</label>
        </div>
        <div className="form-check my-2">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.active}
            onChange={(e) =>
              setFormData({ ...formData, active: e.target.checked })
            }
          />
          <label className="form-check-label">مفعل</label>
        </div>
      </ModalForm>

      {/* Details Modal */}
      <SubscriptionDetailsModal
        show={showDetails}
        onClose={() => { setShowDetails(false); setSelectedRecord(null); }}
        record={selectedRecord}
      />

      <MyTable
        resource="subscriptions"
        columns={columns}
        refreshKey={refreshKey}
      />
    </div>
  );
}

export default Subscriptions;
