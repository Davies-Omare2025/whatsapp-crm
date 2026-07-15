// server/controllers/tickets.controller.js

const ticketsService = require("../services/tickets.service");

async function list(req, res) {
  const tickets = await ticketsService.listForUser(req.user, {
    status: req.query.status,
    channel: req.query.channel,
    search: req.query.search,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined,
  });

  res.json({ tickets });
}

async function getOne(req, res) {
  const ticket = await ticketsService.getTicketForUser(req.user, req.params.id);

  res.json({ ticket });
}

async function patchStatus(req, res) {
  const ticket = await ticketsService.updateStatus(
    req.user,
    req.params.id,
    req.body.status,
  );

  res.json({ ticket });
}

module.exports = {
  list,
  getOne,
  patchStatus,
};
