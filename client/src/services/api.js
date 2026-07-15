// client/src/services/api.js

import { api } from "../lib/api";

/*
|--------------------------------------------------------------------------
| Leads
|--------------------------------------------------------------------------
*/

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

export async function assignLead(id, userId) {
  return api(`/leads/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({
      assignedTo: userId,
    }),
  });
}

export async function markLeadAsRead(id) {
  return api(`/leads/${id}/read`, {
    method: "PATCH",
  });
}

/*
|--------------------------------------------------------------------------
| Tickets
|--------------------------------------------------------------------------
*/

export async function listTickets({
  status = "",
  channel = "",
  search = "",
} = {}) {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (channel) params.set("channel", channel);
  if (search) params.set("search", search);

  const qs = params.toString();

  return api(`/tickets${qs ? `?${qs}` : ""}`);
}

export async function getTicket(id) {
  if (!id) {
    throw new Error("Ticket ID is required.");
  }

  return api(`/tickets/${id}`);
}

export async function updateTicketStatus(id, status) {
  if (!id) {
    throw new Error("Ticket ID is required.");
  }

  if (!status) {
    throw new Error("Ticket status is required.");
  }

  return api(`/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

export async function listUsers() {
  return api("/users");
}

/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

export async function getMessages(leadId) {
  return api(`/messages/${leadId}`);
}

export async function sendMessage(leadId, body) {
  return api("/messages/send", {
    method: "POST",
    body: JSON.stringify({
      leadId,
      body,
    }),
  });
}
