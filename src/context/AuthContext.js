import { createContext, useContext, useEffect, useState } from "react";
import API from "../Api/axiosConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await API.get("/user");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [refetch]);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  const handleRefetch = () => {
    setRefetch((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{ handleRefetch, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
