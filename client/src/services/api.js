// client/src/services/api.js
import { api } from "../lib/api";

export async function listLeads({
  search = "",
  status = "",
  assignedTo = "",
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (assignedTo) params.set("assignedTo", assignedTo);
  const qs = params.toString();
  return api(`/leads${qs ? `?${qs}` : ""}`);
}

export async function getLead(id) {
  return api(`/leads/${id}`);
}

export async function updateLead(id, patch) {
  return api(`/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function getStats() {
  return api("/leads/stats");
}

export async function listUsers() {
  return api("/users");
}

export async function assignLead(id, userId) {
  return api(`/leads/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedTo: userId }),
  });
}
