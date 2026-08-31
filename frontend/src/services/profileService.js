import apiClient, { getApiErrorMessage } from "./apiClient";

export async function getProfiles() {
  try {
    const response = await apiClient.get("/api/profiles");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load profiles."));
  }
}

export async function createProfile(profile) {
  try {
    const response = await apiClient.post("/api/profiles", profile);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not create profile."));
  }
}

export async function deleteProfile(profileId) {
  try {
    await apiClient.delete(`/api/profiles/${profileId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not delete profile."));
  }
}
