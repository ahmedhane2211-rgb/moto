import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../Api/axiosConfig";
import Mytitle from "../../Components/Mytitle";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarDays,
  Crown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

function SubscriptionHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await API.get("/subscriptions/history");
        setSubscriptions(res.data?.data || res.data || []);
      } catch (err) {
        // fallback: use user data if API doesn't exist
        if (user?.data?.subscriptions) {
          setSubscriptions(user.data.subscriptions);
        } else if (user?.data?.lastSubscription) {
          setSubscriptions([user.data.lastSubscription]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [user]);

  const getStatus = (sub) => {
    const now = new Date();
    const from = new Date(sub.from);
    const to = new Date(sub.to);

    if (now < from) return "upcoming";
    if (now > to) return "expired";
    return "active";
  };

  const getDaysRemaining = (to) => {
    const now = new Date();
    const endDate = new Date(to);
    const diff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="sub-badge sub-badge-active">
            <CheckCircle2 size={14} />
            {t("sub_active")}
          </span>
        );
      case "expired":
        return (
          <span className="sub-badge sub-badge-expired">
            <XCircle size={14} />
            {t("sub_expired")}
          </span>
        );
      case "upcoming":
        return (
          <span className="sub-badge sub-badge-upcoming">
            <Clock size={14} />
            {t("sub_upcoming")}
          </span>
        );
      default:
        return null;
    }
  };

  // Find current active subscription
  const activeSub = subscriptions.find((s) => getStatus(s) === "active");

  if (loading) {
    return (
      <div className="container mt-5">
        <Mytitle title={t("subscription_history")} />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Mytitle title={t("subscription_history")} />

      {/* Current Subscription Card */}
      {activeSub && (
        <div className="sub-current-card mb-4">
          <div className="sub-current-header">
            <div className="sub-current-icon">
              <Crown size={28} />
            </div>
            <div>
              <h5 className="mb-1 fw-bold">{t("current_subscription")}</h5>
              <p className="mb-0 opacity-75">
                {activeSub.is_trial
                  ? t("sub_trial_plan")
                  : t("sub_paid_plan")}
              </p>
            </div>
            <div className="ms-auto text-end">
              {getStatusBadge("active")}
              <div className="sub-days-remaining mt-2">
                <Sparkles size={14} />
                <span>
                  {getDaysRemaining(activeSub.to)} {t("sub_days_left")}
                </span>
              </div>
            </div>
          </div>
          <div className="sub-current-body">
            <div className="sub-info-item">
              <CalendarDays size={18} />
              <div>
                <small className="opacity-75">{t("sub_start_date")}</small>
                <p className="mb-0 fw-bold">{activeSub.from}</p>
              </div>
            </div>
            <div className="sub-info-item">
              <CalendarDays size={18} />
              <div>
                <small className="opacity-75">{t("sub_end_date")}</small>
                <p className="mb-0 fw-bold">{activeSub.to}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="sub-progress-container">
              <div className="sub-progress-bar">
                <div
                  className="sub-progress-fill"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        ((new Date() - new Date(activeSub.from)) /
                          (new Date(activeSub.to) - new Date(activeSub.from))) *
                          100
                      )
                    )}%`,
                  }}
                ></div>
              </div>
              <small className="opacity-75">{t("sub_time_progress")}</small>
            </div>
          </div>
        </div>
      )}

      {/* No active subscription warning */}
      {!activeSub && subscriptions.length > 0 && (
        <div className="sub-warning-card mb-4">
          <AlertTriangle size={24} />
          <div>
            <h6 className="mb-1 fw-bold">{t("sub_no_active")}</h6>
            <p className="mb-0 opacity-75">{t("sub_contact_renew")}</p>
          </div>
        </div>
      )}

      {/* Subscription History Timeline */}
      <div className="sub-history-section">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <Clock size={22} />
          {t("sub_history_title")}
        </h5>

        {subscriptions.length === 0 ? (
          <div className="sub-empty-state">
            <Crown size={48} className="opacity-50 mb-3" />
            <h6>{t("sub_no_history")}</h6>
            <p className="opacity-50">{t("sub_no_history_desc")}</p>
          </div>
        ) : (
          <div className="sub-timeline">
            {subscriptions.map((sub, index) => {
              const status = getStatus(sub);
              return (
                <div
                  key={sub.id || index}
                  className={`sub-timeline-item sub-timeline-${status}`}
                >
                  <div className="sub-timeline-dot"></div>
                  <div className="sub-timeline-content">
                    <div className="sub-timeline-header">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold">
                          {sub.is_trial
                            ? t("sub_trial_plan")
                            : t("sub_paid_plan")}
                        </span>
                        {getStatusBadge(status)}
                      </div>
                      {sub.value && (
                        <span className="sub-timeline-value">
                          {sub.value} {t("currency")}
                        </span>
                      )}
                    </div>
                    <div className="sub-timeline-dates">
                      <span>
                        <CalendarDays size={14} />
                        {t("from")}: {sub.from}
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {t("to")}: {sub.to}
                      </span>
                      {status === "active" && (
                        <span className="sub-days-badge">
                          {getDaysRemaining(sub.to)} {t("sub_days_left")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .sub-current-card {
          background: var(--card-bg);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .sub-current-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        }
        .sub-current-header {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .sub-current-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0EA5E9, #06B6D4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .sub-current-body {
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .sub-info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: var(--text-main);
        }
        .sub-info-item svg {
          color: var(--primary-color);
          margin-top: 4px;
        }
        .sub-progress-container {
          grid-column: 1 / -1;
        }
        .sub-progress-bar {
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .sub-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #0EA5E9);
          border-radius: 4px;
          transition: width 1s ease;
        }
        .sub-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        .sub-badge-active {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
        }
        .sub-badge-expired {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }
        .sub-badge-upcoming {
          background: rgba(245, 158, 11, 0.15);
          color: #F59E0B;
        }
        .sub-days-remaining {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #10B981;
          font-weight: 600;
        }
        .sub-warning-card {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #EF4444;
        }
        .sub-warning-card p {
          color: var(--text-secondary);
        }
        .sub-history-section {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid var(--border-color);
          margin-bottom: 40px;
        }
        .sub-empty-state {
          text-align: center;
          padding: 48px 24px;
          color: var(--text-secondary);
        }
        .sub-timeline {
          position: relative;
          padding-right: 24px;
        }
        [dir="ltr"] .sub-timeline {
          padding-left: 24px;
          padding-right: 0;
        }
        .sub-timeline::before {
          content: '';
          position: absolute;
          right: 6px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-color);
        }
        [dir="ltr"] .sub-timeline::before {
          left: 6px;
          right: auto;
        }
        .sub-timeline-item {
          position: relative;
          padding: 16px 20px;
          margin-bottom: 16px;
          background: var(--main-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        .sub-timeline-item:hover {
          transform: translateX(-4px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        [dir="ltr"] .sub-timeline-item:hover {
          transform: translateX(4px);
        }
        .sub-timeline-dot {
          position: absolute;
          right: -31px;
          top: 24px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid var(--card-bg);
        }
        [dir="ltr"] .sub-timeline-dot {
          left: -31px;
          right: auto;
        }
        .sub-timeline-active .sub-timeline-dot {
          background: #10B981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
        .sub-timeline-expired .sub-timeline-dot {
          background: #EF4444;
        }
        .sub-timeline-upcoming .sub-timeline-dot {
          background: #F59E0B;
        }
        .sub-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sub-timeline-value {
          font-weight: 700;
          font-size: 16px;
          color: var(--primary-color);
        }
        .sub-timeline-dates {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .sub-timeline-dates span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sub-days-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default SubscriptionHistory;
