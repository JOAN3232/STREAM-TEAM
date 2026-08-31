import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error, fallbackMessage = "Request failed.") {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data && typeof error.response.data === "string") {
    return error.response.data;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}

export default apiClient;
