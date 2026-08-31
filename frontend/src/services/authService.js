import apiClient, { getApiErrorMessage } from "./apiClient";

const AUTH_BASE = "/api/auth";

export async function registerUser(data) {
  try {
    const response = await apiClient.post(`${AUTH_BASE}/register`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not create account."));
  }
}

export async function loginUser(identifier, password) {
  try {
    const response = await apiClient.post(`${AUTH_BASE}/login`, {
      email: identifier,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not sign in."));
  }
}

export async function verifyEmailToken(token) {
  try {
    const response = await apiClient.get(`${AUTH_BASE}/verify-email`, {
      params: { token },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not verify email."));
  }
}

export async function verifyEmailTokenPost(token) {
  try {
    const response = await apiClient.post(`${AUTH_BASE}/verify-email`, { token });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not verify email."));
  }
}

export async function resendVerification(email) {
  try {
    const response = await apiClient.post(`${AUTH_BASE}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not resend verification email."));
  }
}
