import { authApiUrl } from "./api";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: response.ok,
      message: text,
    };
  }
}

export async function registerUser(data) {
  const response = await fetch(authApiUrl("/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Server returned status ${response.status}`
    );
  }

  return result;
}

export async function loginUser(identifier, password) {
  const response = await fetch(authApiUrl("/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: identifier,
      password,
    }),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Server returned status ${response.status}`
    );
  }

  return result;
}

export async function sendVerificationEmail(email, name) {
  const response = await fetch(
    authApiUrl("/send-verification"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
      }),
    }
  );

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Server returned status ${response.status}`
    );
  }

  return result;
}

export async function setPassword(token, password) {
  const response = await fetch(
    authApiUrl("/set-password"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    }
  );

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Server returned status ${response.status}`
    );
  }

  return result;
}

export async function selectPlan(plan) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication token is missing. Please sign in again."
    );
  }

  const response = await fetch(
    authApiUrl("/select-plan"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        plan,
      }),
    }
  );

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Server returned status ${response.status}`
    );
  }

  return result;
}
