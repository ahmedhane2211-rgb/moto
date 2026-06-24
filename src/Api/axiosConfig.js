import axios from "axios";
import { toast } from "react-toastify";
import i18n from "../i18n";

// export const BASE_URL = "http://localhost:8000/api";
export const BASE_URL = "http://192.168.1.5:8080/api/";
// export const BASE_URL = "https://untrig-osculant-marcellus.ngrok-free.dev/api/";
// export const BASE_URL = "https://api.motogates.com/api/";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": i18n.language || "ar",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token");
          toast.error(i18n.t("api_session_expired"));
          window.location.href = "/login";
          break;
        case 403:
          toast.error(
            error.response.data?.message || i18n.t("api_unknown_error"),
          );
          break;
        case 404:
          toast.error(
            error.response.data?.message || i18n.t("api_unknown_error"),
          );
          break;
        case 500:
          toast.error(i18n.t("api_server_error"));
          break;
        default:
          toast.error(
            error.response.data?.message || i18n.t("api_unknown_error"),
          );
      }
    } else if (error.request) {
      toast.error(i18n.t("api_connection_lost"));
    } else {
      toast.error(error.message);
    }

    return Promise.reject(error);
  },
);

export default API;
