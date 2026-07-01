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

async function getLead(id) {
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);
  return lead;
}

async function listLeads(filters) {
  return leadsRepo.list(filters);
}

async function changeStatus(id, nextStatus) {
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new AppError(`Invalid status: ${nextStatus}`, 400);
  }
  const lead = await getLead(id);
  const allowed = VALID_TRANSITIONS[lead.status];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Cannot move from ${lead.status} to ${nextStatus}`, 409);
  }
  return leadsRepo.updateStatus(id, nextStatus);
}

async function getStats() {
  const rows = await leadsRepo.statsByStatus();
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  return { total, byStatus: rows };
}

module.exports = { getLead, listLeads, changeStatus, getStats };
