import { createContext, useContext, useEffect, useState } from "react";
import API from "../Api/axiosConfig";
import { useAuth } from "./AuthContext"; // ✅ استخدم سياق المستخدم

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const fetchSettings = async () => {
    try {
      const response = await API.get("/settings");
      setSettings(response.data.data);
    } catch (error) {
      console.error("خطأ في جلب الإعدادات:", error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      if (
        user.data.user.type === "user" ||
        user.data.user.type === "sub-user"
      ) {
        fetchSettings();
      }
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refetch: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
