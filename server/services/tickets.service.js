// server/services/tickets.service.js

const ticketsRepo = require("../repositories/tickets.repo");
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

const VALID_CHANNELS = ["ussd", "whatsapp", "web"];

async function listForUser(user, filters = {}) {
  if (!user) {
    throw new AppError("Authentication required", 401);
  }

  const { status, channel, search, limit, offset } = filters;

  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`Invalid ticket status: ${status}`, 400);
  }

  if (channel && !VALID_CHANNELS.includes(channel)) {
    throw new AppError(`Invalid ticket channel: ${channel}`, 400);
  }

  return ticketsRepo.list({
    status,
    channel,
    search,
    limit,
    offset,
  });
}

async function getTicketForUser(user, id) {
  if (!user) {
    throw new AppError("Authentication required", 401);
  }

  const ticket = await ticketsRepo.findById(id);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  return ticket;
}

async function updateStatus(user, ticketId, status) {
  if (!user) {
    throw new AppError("Authentication required", 401);
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError("Invalid ticket status", 400);
  }

  const ticket = await ticketsRepo.findById(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const updatedTicket = await ticketsRepo.updateStatus(ticketId, status);

  return updatedTicket;
}

module.exports = {
  listForUser,
  getTicketForUser,
  updateStatus,
};
