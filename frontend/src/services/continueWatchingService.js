const API_BASE = "http://localhost:8081/api/profiles";

const getUserId = () => localStorage.getItem("token");

const getActiveProfile = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem("stream_active_profile")
    );
  } catch {
    return null;
  }
};

const requireContext = () => {
  const userId = getUserId();
  const profile = getActiveProfile();
  const profileId = profile?.id;

  if (!userId) {
    throw new Error("No logged-in STREAM user.");
  }

  if (!profileId) {
    throw new Error("No active STREAM profile.");
  }

  return {
    userId,
    profileId,
  };
};

const request = async (url, options = {}) => {
  const { userId } = requireContext();

  const response = await fetch(url, {
    ...options,

    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),

      "X-User-Id": userId,

      ...options.headers,
    },
  });

  if (!response.ok) {
    let message =
      "Continue Watching request failed.";

    try {
      const data = await response.json();

      message =
        data?.message ||
        data?.error ||
        message;
    } catch {
      // Ignore invalid JSON response.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getContinueWatching = async () => {
  const { profileId } = requireContext();

  return request(
    `${API_BASE}/${profileId}/continue-watching`
  );
};

export const saveContinueWatching = async (
  item
) => {
  const { profileId } = requireContext();

  return request(
    `${API_BASE}/${profileId}/continue-watching`,
    {
      method: "PUT",
      body: JSON.stringify(item),
    }
  );
};

export const removeFromContinueWatching = async (
  mediaType,
  contentId
) => {
  const { profileId } = requireContext();

  return request(
    `${API_BASE}/${profileId}/continue-watching/${encodeURIComponent(
      mediaType
    )}/${encodeURIComponent(contentId)}`,
    {
      method: "DELETE",
    }
  );
};