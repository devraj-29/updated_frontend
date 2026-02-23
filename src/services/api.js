const BASE = "http://139.59.78.201:8001/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("nda_access") || null;
    this.refreshToken = localStorage.getItem("nda_refresh") || null;
  }

  setTokens(access, refresh) {
    this.token = access;
    this.refreshToken = refresh;
    localStorage.setItem("nda_access", access);
    localStorage.setItem("nda_refresh", refresh);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem("nda_access");
    localStorage.removeItem("nda_refresh");
    localStorage.removeItem("nda_user");
  }

  async request(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (!(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });

    // Auto-refresh on 401
    if (res.status === 401 && this.refreshToken) {
      const refreshed = await this._doRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.token}`;
        return fetch(`${BASE}${path}`, { ...opts, headers });
      }
    }
    return res;
  }

  async _doRefresh() {
    try {
      const res = await fetch(`${BASE}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  async get(path) {
    const r = await this.request(path);
    if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
    return r.json();
  }

  async post(path, data) {
    const isForm = data instanceof FormData;
    const r = await this.request(path, {
      method: "POST",
      body: isForm ? data : JSON.stringify(data),
      headers: isForm ? {} : undefined,
    });
    const json = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data: json };
  }

  async put(path, data) {
    const r = await this.request(path, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const json = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data: json };
  }

  async patch(path, data) {
    const r = await this.request(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data: json };
  }

  async del(path) {
    const r = await this.request(path, { method: "DELETE" });
    return { ok: r.ok, status: r.status };
  }

  // ── Auth ──
  async login(email, password) {
    const r = await fetch(`${BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (r.ok) {
      this.setTokens(data.access_token, data.refresh_token);
      localStorage.setItem("nda_user", JSON.stringify(data.user));
    }
    return { ok: r.ok, data };
  }

  async logout() {
    try {
      await this.post("/auth/logout/", {});
    } catch {}
    this.clearTokens();
  }

  async me() {
    return this.get("/auth/me/");
  }
  async dashboard() {
    return this.get("/auth/dashboard/");
  }

  // ── Users ──
  async getUsers() {
    return this.get("/auth/users/");
  }
  async createUser(data) {
    return this.post("/auth/users/", data);
  }
  async updateUser(id, data) {
    return this.patch(`/auth/users/${id}/`, data);
  }

  // ── Audit ──
  async getAuditLogs() {
    return this.get("/auth/audit-logs/");
  }

  // ── NDAs ──
  async getNDAs(params = "") {
    return this.get(`/ndas/${params ? "?" + params : ""}`);
  }
  async getNDA(id) {
    return this.get(`/ndas/${id}/`);
  }
  async createNDA(formData) {
    return this.post("/ndas/", formData);
  }
  async updateNDA(id, data) {
    return this.patch(`/ndas/${id}/`, data);
  }
  async createVersion(id, formData) {
    return this.post(`/ndas/${id}/new-version/`, formData);
  }
  async activateNDA(id) {
    return this.post(`/ndas/${id}/activate/`, {});
  }
  async archiveNDA(id) {
    return this.post(`/ndas/${id}/archive/`, {});
  }
  async deleteNDA(id) {
    return this.del(`/ndas/${id}/`);
  }
  async getNDAVersions(id) {
    return this.get(`/ndas/${id}/versions/`);
  }
  async getCategories() {
    return this.get("/ndas/categories/");
  }

  // ── People ──
  async getPeople(params = "") {
    return this.get(`/people/${params ? "?" + params : ""}`);
  }
  async getPerson(id) {
    return this.get(`/people/${id}/`);
  }
  async createPerson(data) {
    return this.post("/people/", data);
  }
  async updatePerson(id, data) {
    return this.patch(`/people/${id}/`, data);
  }
  async bulkCreatePeople(people) {
    return this.post("/people/bulk-create/", { people });
  }

  // ── Assignments ──
  async getAssignments(params = "") {
    return this.get(`/assignments/${params ? "?" + params : ""}`);
  }
  async assignSingle(data) {
    return this.post("/assignments/assign-single/", data);
  }
  async assignGroup(data) {
    return this.post("/assignments/assign-group/", data);
  }
  async sendAssignment(id) {
    return this.post(`/assignments/${id}/send/`, {});
  }
  async remindAssignment(id) {
    return this.post(`/assignments/${id}/remind/`, {});
  }
  async revokeAssignment(id) {
    return this.post(`/assignments/${id}/revoke/`, {});
  }
  async getAssignmentStats() {
    return this.get("/assignments/stats/");
  }
  async getGroups() {
    return this.get("/assignments/groups/");
  }

  // ── Documents ──
  async getSignedDocs() {
    return this.get("/documents/signed/");
  }
  async getSignedDoc(id) {
    return this.get(`/documents/signed/${id}/`);
  }
}

const api = new ApiService();
export default api;
