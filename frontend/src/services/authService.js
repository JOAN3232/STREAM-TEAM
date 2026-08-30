// src/services/authService.js

const API_BASE_URL = "http://localhost:8081/api/auth";

export async function registerUser(data) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned status ${response.status}: ${errorText}`);
  }
  

  return response.json();

  
}

export async function loginUser(identifier, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: identifier, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned status ${response.status}: ${errorText}`);
  }

  return response.json();
}
export async function sendVerificationEmail(email, name) {
  const response = await fetch(`${API_BASE_URL}/send-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned status ${response.status}: ${errorText}`);
  }
  return response.text(); // plain string response, not JSON
}

export async function setPassword(token, password) {
  const response = await fetch(`${API_BASE_URL}/set-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned status ${response.status}: ${errorText}`);
  }
  return response.json();
}