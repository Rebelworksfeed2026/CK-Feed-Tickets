/* Cloud connection helpers. No ticket data is uploaded until a driver signs in. */
window.CKCloud = (() => {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_KEY;
  const configured = Boolean(url && key);
  async function request(path, options = {}) {
    if (!configured) throw Error("Supabase is not configured.");
    const response = await fetch(url + path, {
      ...options,
      headers: { apikey: key, "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(body.msg || body.message || body.error_description || "Cloud request failed.");
    return body;
  }
  async function health() {
    if (!configured) return { ok: false, message: "Cloud settings missing" };
    try {
      await request("/auth/v1/health");
      return { ok: true, message: "Supabase server reachable; sign-in and sync not yet enabled" };
    } catch (e) {
      return { ok: false, message: "Cloud connection check failed: " + e.message };
    }
  }
  return { configured, health };
})();
