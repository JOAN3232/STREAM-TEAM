import apiClient, { getApiErrorMessage } from "./apiClient";

export async function initializePayment(plan, email) {
  try {
    const response = await apiClient.post("/api/payments/initialize", {
      plan,
      email,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not initialize payment."));
  }
}

export async function verifyPayment(reference) {
  try {
    const response = await apiClient.get(`/api/payments/verify/${reference}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not verify payment."));
  }
}
