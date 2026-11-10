/* Cloud connection and authenticated account helpers.
   No feed tickets are uploaded by this module. */
window.CKCloud = (() => {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_KEY;
  const configured = Boolean(url && key);
  let session = null; // In-memory only; closing/reloading requires signing in again.

  async function request(path, options = {}) {
    if (!configured) throw Error("Supabase is not configured.");
    const response = await fetch(url + path, {
      ...options,
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
        ...(options.headers || {})
      }
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

  async function signIn(email, password) {
    if (!email || !password) throw Error("Enter email and password.");
    const result = await request("/auth/v1/token?grant_type=password", {
      method: "POST", body: JSON.stringify({ email, password })
    });
    if (!result.access_token || !result.user?.id) throw Error("Sign-in response was incomplete.");
    session = result;
    try {
      const profile = await myProfile();
      if (!profile) throw Error("This account has not been assigned to a feed-ticket user.");
      return profile;
    } catch (e) {
      session = null;
      throw e;
    }
  }

  async function myProfile() {
    if (!session?.user?.id) return null;
    const id = encodeURIComponent(session.user.id);
    const rows = await request("/rest/v1/drivers?select=id,name,company,is_admin,is_office,user_id&user_id=eq." + id + "&limit=1");
    return Array.isArray(rows) ? rows[0] || null : null;
  }

  async function listDrivers() {
    if (!session?.access_token) throw Error("Sign in before viewing drivers.");
    const rows = await request("/rest/v1/drivers?select=id,name,company,is_admin,is_office&order=name.asc");
    if (!Array.isArray(rows)) throw Error("Driver directory response was invalid.");
    return rows;
  }

  async function listWeeklyTickets(driverId, monday) {
    if (!session?.access_token) throw Error("Sign in before viewing tickets.");
    if (!/^[0-9a-f-]{36}$/i.test(driverId)) throw Error("Invalid driver.");
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(monday)) throw Error("Invalid week.");
    const first = new Date(monday + "T12:00:00");
    if (Number.isNaN(first.getTime()) || first.getDay() !== 1 ||
        first.getFullYear() + "-" + String(first.getMonth()+1).padStart(2,"0") + "-" + String(first.getDate()).padStart(2,"0") !== monday)
      throw Error("Choose a Monday as the week start.");
    const end = new Date(first);
    end.setDate(end.getDate() + 7);
    const next = end.getFullYear() + "-" + String(end.getMonth()+1).padStart(2,"0") + "-" + String(end.getDate()).padStart(2,"0");
    const query = "/rest/v1/feed_tickets?select=id,ticket_number,delivery_date,tons,destination,driver_id" +
      "&driver_id=eq." + encodeURIComponent(driverId) +
      "&delivery_date=gte." + monday + "&delivery_date=lt." + next +
      "&deleted_at=is.null&order=delivery_date.asc,ticket_number.asc&limit=500";
    const rows = await request(query);
    if (!Array.isArray(rows)) throw Error("Invalid weekly ticket response.");
    return rows;
  }

  async function signOut() {
    if (session) {
      try { await request("/auth/v1/logout", { method: "POST" }); }
      finally { session = null; }
    }
  }

  function isSignedIn() { return Boolean(session?.access_token); }
  return { configured, health, signIn, signOut, myProfile, listDrivers, listWeeklyTickets, isSignedIn };
})();
