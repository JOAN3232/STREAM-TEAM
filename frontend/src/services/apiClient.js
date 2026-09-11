import axios from "axios";
import { API_GATEWAY_URL } from "./api";

const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
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
