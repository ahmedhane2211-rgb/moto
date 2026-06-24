import { useEffect, useRef } from "react";
// import { toast } from "react-toastify";
import { usePermissions, usePermissionsLoading } from "../context/PermissionContext";

function Can({ permission, children }) {
  const permissions = usePermissions();
  const loading = usePermissionsLoading();
  const shownToast = useRef(false);

  // console.log("Permission prop received:", permission);


  const userType = (localStorage.getItem("userType") || "").toLowerCase();
  const hasPermission = userType === "user" || userType === "admin" || permissions.includes(permission);

  useEffect(() => {
    if (!loading && !hasPermission && !shownToast.current) {
      // toast.error("ليس لديك صلاحية للوصول");
      shownToast.current = true;
    }
  }, [loading, hasPermission]);

  if (loading) {
    return null;
  }

  if (hasPermission) {
    return children;
  }

  return null;
}

export default Can;
