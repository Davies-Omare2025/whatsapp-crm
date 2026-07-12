// server/services/leads.service.js
const leadsRepo = require("../repositories/leads.repo");
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

const VALID_TRANSITIONS = {
  new: ["contacted", "lost"],
  contacted: ["qualified", "lost"],
  qualified: ["converted", "lost"],
  converted: [],
  lost: [],
};

// Admins see everything. Agents see only their own leads, unless they
// specifically ask for the "unassigned" pool (leads nobody has claimed yet).
async function listForUser(user, filters) {
  if (user.role === "admin") {
    return leadsRepo.list(filters);
  }
  if (filters.assignedTo === "unassigned") {
    return leadsRepo.list({ ...filters, assignedTo: "unassigned" });
  }
  return leadsRepo.list({ ...filters, assignedTo: user.id });
}

// Fetch one lead, but pretend it doesn't exist (404) if an agent tries to
// view someone else's lead — never reveal it exists via a 403.
async function getLeadForUser(user, id) {
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);
  if (
    user.role !== "admin" &&
    lead.assigned_to &&
    lead.assigned_to !== user.id
  ) {
    throw new AppError("Lead not found", 404);
  }
  return lead;
}

// Any logged-in agent can claim an unassigned lead for themselves.
async function claimLead(user, id) {
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);
  if (lead.assigned_to) {
    throw new AppError("Lead is already assigned", 409);
  }
  return leadsRepo.assign(id, user.id);
}

// Only admins may hand a lead to a specific agent (or unassign it entirely).
async function reassignLead(user, id, newOwnerId) {
  if (user.role !== "admin") {
    throw new AppError("Only admins can reassign leads", 403);
  }
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);
  return leadsRepo.assign(id, newOwnerId); // null means unassign
}

async function changeStatus(user, id, nextStatus) {
  const lead = await getLeadForUser(user, id); // enforces visibility
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new AppError(`Invalid status: ${nextStatus}`, 400);
  }
  const allowed = VALID_TRANSITIONS[lead.status];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Cannot move from ${lead.status} to ${nextStatus}`, 409);
  }
  return leadsRepo.updateStatus(id, nextStatus);
}

async function markAsRead(user, id) {
  // Reuse the existing permission check.
  await getLeadForUser(user, id);

  return leadsRepo.resetUnreadCount(id);
}

async function getStats(user) {
  if (user.role !== "admin") {
    throw new AppError("Admins only", 403);
  }
  const rows = await leadsRepo.statsByStatus();
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  return { total, byStatus: rows };
}

module.exports = {
  listForUser,
  getLeadForUser,
  claimLead,
  reassignLead,
  changeStatus,
  markAsRead,
  getStats,
};
