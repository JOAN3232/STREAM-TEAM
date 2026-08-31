import apiClient, { getApiErrorMessage } from "./apiClient";

export async function getWatchlist() {
  try {
    const response = await apiClient.get("/api/watchlist");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load watchlist."));
  }
}

export async function addToWatchlist(movieId) {
  try {
    const response = await apiClient.post(`/api/watchlist/${movieId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not add title to watchlist."));
  }
}

export async function removeFromWatchlist(movieId) {
  try {
    await apiClient.delete(`/api/watchlist/${movieId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not remove title from watchlist."));
  }
}
