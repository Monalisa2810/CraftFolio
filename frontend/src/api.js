const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchFromServer(endpoint, body) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const res = await fetch(`${BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
