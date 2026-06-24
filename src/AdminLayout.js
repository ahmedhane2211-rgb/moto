import { useLocation, Outlet } from "react-router-dom";
import AdminNavbar from "./Components/AdminNavbar";
import { useEffect, useState } from "react";

function AdminLayout() {
  const location = useLocation();
  const noNavbarRoutes = ["/login", "/register"];
  const [pageKey, setPageKey] = useState(location.key);

  useEffect(() => {
    setPageKey(location.key);
  }, [location.key]);

  return (
    <>
      {!noNavbarRoutes.includes(location.pathname) && <AdminNavbar />}
      <div
        className="page-content"
        key={pageKey}
        style={{
          animation: 'pageTransition 0.4s ease both',
        }}
      >
        <Outlet />
      </div>
    </>
  );
}

export default AdminLayout;
