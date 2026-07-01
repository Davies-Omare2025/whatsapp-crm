// server/controllers/leads.controller.js
const leadsService = require("../services/leads.service");

async function list(req, res) {
  const { status, search, limit, offset } = req.query;
  const leads = await leadsService.listLeads({
    status,
    search,
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined,
  });
  res.json({ leads });
}

async function getOne(req, res) {
  const lead = await leadsService.getLead(req.params.id);
  res.json({ lead });
}

async function patchStatus(req, res) {
  const lead = await leadsService.changeStatus(req.params.id, req.body.status);
  res.json({ lead });
}

async function stats(req, res) {
  const data = await leadsService.getStats();
  res.json(data);
}

module.exports = { list, getOne, patchStatus, stats };
