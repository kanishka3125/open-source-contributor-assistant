const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Normalizes error messages from backend responses into developer-friendly text per PRD.
 */
function normalizeErrorMessage(status, data) {
  const backendMsg = (typeof data?.error === "string" ? data.error : "") ||
    (typeof data?.detail === "string" ? data.detail : "") ||
    (typeof data?.detail?.error === "string" ? data.detail.error : "");

  if (status === 400) {
    if (backendMsg.toLowerCase().includes("non-github") || backendMsg.toLowerCase().includes("invalid") || backendMsg.toLowerCase().includes("format")) {
      return "Please enter a valid GitHub repository URL.";
    }
    return backendMsg || "Please enter a valid GitHub repository URL.";
  }

  if (status === 404) {
    return "Repository could not be found or accessed. Please check the URL.";
  }

  if (status === 413) {
    return "This repository exceeds the supported processing limit.";
  }

  if (status === 503) {
    return "Repository intelligence is currently unavailable. Please try again later.";
  }

  if (backendMsg) {
    return backendMsg;
  }

  return `Server returned status (${status}). Please try again.`;
}

/**
 * Check backend health status.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

/**
 * Send a GitHub repository URL to the backend to clone, extract, and index.
 * @param {string} repoUrl
 * @returns {Promise<object>}
 */
export async function processRepository(repoUrl) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });
  } catch (err) {
    throw new Error("Unable to reach backend server. Please check your network connection or server status.", { cause: err });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    const message = normalizeErrorMessage(response.status, data);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Send a natural-language question about the repository to the chat endpoint.
 * @param {string} question
 * @returns {Promise<object>}
 */
export async function sendChatMessage(question) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });
  } catch (err) {
    throw new Error("Unable to reach AI chat service. Please ensure the backend server is running.", { cause: err });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    const message = normalizeErrorMessage(response.status, data);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
