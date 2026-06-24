// context/PermissionContext.js
import { createContext, useContext, useEffect, useState } from "react";
import API from "../Api/axiosConfig";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = (localStorage.getItem("userType") || "").toLowerCase();

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        let endpoint = "/online-user-permissions";
        if (userType === "admin" || userType === "subadmin") {
          endpoint = "/online-admin-permissions";
        }

        const res = await API.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let perms = [];
        if (Array.isArray(res.data.data)) {
          res.data.data.forEach((group) => {
            if (Array.isArray(group.permissions)) {
              group.permissions.forEach((p) => {
                perms.push(p.name);
              });
            }
          });
        }

        setPermissions(perms);
      } catch (err) {
        console.error("فشل تحميل الصلاحيات:", err);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermissions();
  }, []);

  

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const ctx = useContext(PermissionContext);
  return ctx.permissions;
};

export const usePermissionsLoading = () => {
  const ctx = useContext(PermissionContext);
  return ctx.loading;
};
