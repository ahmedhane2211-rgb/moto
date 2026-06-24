import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedLayout({ allowedTypes }) {
  const token = localStorage.getItem("token");
  const userType = (localStorage.getItem("userType") || "").toLowerCase();
  const { user, loading } = useAuth();

  if (!token || !allowedTypes.includes(userType)) {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    return <Navigate to="/login" replace />;
  }

  if (!loading && user && ["user", "subuser"].includes(userType)) {
    const subscription = user?.data?.lastSubscription;
    if (subscription && subscription.to) {
      const now = new Date();
      const endDate = new Date(subscription.to);
      if (endDate - now <= 0) {
        return (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fa", color: "#dc3545", fontFamily: "Cairo", textAlign: "center", padding: "20px" }}>
            <h1 style={{ fontWeight: "bold", marginBottom: "20px" }}>⚠️ عذراً، لقد انتهى اشتراكك</h1>
            <h4 style={{ color: "#333", marginBottom: "30px" }}>يرجى التواصل لـ تجديد الاشتراك للتمكن من متابعة العمل على النظام وإدارة بياناتك.</h4>
            <button 
              onClick={() => { 
                localStorage.removeItem("token");
                localStorage.removeItem("userType");
                window.location.href = "/login"; 
              }} 
              style={{ padding: "12px 24px", fontSize: "18px", cursor: "pointer", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", fontWeight: "bold" }}>
              تسجيل الخروج
            </button>
          </div>
        );
      }
    }
  }

  return <Outlet />;
}

export default ProtectedLayout;
