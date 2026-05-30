const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Token management ──────────────────────────────────────────────────────
const TOKEN_KEY = "craftfolio_token";

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ── Authenticated API fetch (for all protected endpoints) ─────────────────
export async function fetchFromServer(endpoint, body) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const headers = { "Content-Type": "application/json" };
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error(`API error [${endpoint}]: HTTP ${res.status}`, errorBody);
      throw new Error(`HTTP ${res.status}: ${errorBody}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`API timeout [${endpoint}]: Request took longer than 60s`);
    } else {
      console.error(`API error [${endpoint}]:`, err.message);
    }
    return null;
  }
}

// ── Auth-specific API calls ───────────────────────────────────────────────
export async function authRegister(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function authLogin(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function authMe() {
  const token = getAuthToken();
  if (!token) return null;

  const res = await fetch(`${BASE}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    setAuthToken(null); // Clear invalid token
    return null;
  }
  return await res.json();
}
