import apiClient, { getApiErrorMessage } from "./apiClient";

export async function getHistory() {
  try {
    const response = await apiClient.get("/api/history");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load watch history."));
  }
}

export async function addHistoryEntry(movieId, progress = 0) {
  try {
    const response = await apiClient.post("/api/history", {
      movieId,
      progress,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save watch progress."));
  }
}
