const normalizeBaseUrl = (value, fallback = "") => {
  const resolved = (value ?? fallback ?? "").trim();

  if (!resolved) {
    return "";
  }

  return resolved.endsWith("/") ? resolved.slice(0, -1) : resolved;
};

const getDefaultGatewayUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "http://localhost:8084";
};

export const API_GATEWAY_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_GATEWAY_URL,
  getDefaultGatewayUrl(),
);

export const authApiUrl = (path = "") =>
  `${API_GATEWAY_URL}/api/auth${path}`;

export const profilesApiUrl = (path = "") =>
  `${API_GATEWAY_URL}/api/profiles${path}`;

export const moviesApiUrl = (path = "") =>
  `${API_GATEWAY_URL}/api/movies${path}`;

export const paymentsApiUrl = (path = "") =>
  `${API_GATEWAY_URL}/api/payments${path}`;
