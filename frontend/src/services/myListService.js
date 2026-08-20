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
    let message = "My List request failed.";

    try {
      const data = await response.json();
      message = data?.error || data?.message || message;
    } catch {
      // Response did not contain JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getMyList = async () => {
  const { profileId } = requireContext();

  return request(
    `${API_BASE}/${profileId}/my-list`
  );
};

export const addToMyList = async (item) => {
  const { userId, profileId } = requireContext();

  console.log("🟣 MY LIST TEST");
  console.log("User ID:", userId);
  console.log("Profile ID:", profileId);
  console.log("Movie being saved:", item);

  const result = await request(
    `${API_BASE}/${profileId}/my-list`,
    {
      method: "POST",
      body: JSON.stringify(item),
    }
  );

  console.log("✅ Backend saved:", result);

  return result;
};

export const removeFromMyList = async (
  mediaType,
  contentId
) => {
  const { profileId } = requireContext();

  return request(
    `${API_BASE}/${profileId}/my-list/${encodeURIComponent(
      mediaType
    )}/${encodeURIComponent(contentId)}`,
    {
      method: "DELETE",
    }
  );
};