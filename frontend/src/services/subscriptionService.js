import apiClient, { getApiErrorMessage } from "./apiClient";

export async function getCurrentUser() {
  try {
    const response = await apiClient.get("/api/users/me");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load account."));
  }
}

export async function getCurrentSubscription() {
  try {
    const response = await apiClient.get("/api/subscriptions/me");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load subscription."));
  }
}

export async function createSubscription(plan) {
  try {
    const response = await apiClient.post("/api/subscriptions", { plan });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update subscription."));
  }
}
