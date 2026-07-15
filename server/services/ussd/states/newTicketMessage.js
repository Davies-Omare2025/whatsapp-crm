// server/services/ussd/states/newTicketMessage.js

const leadsRepo = require("../../../repositories/leads.repo");
const ticketsRepo = require("../../../repositories/tickets.repo");

const { saveSession, deleteSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");
const smsService = require("../../sms.service");

function replaceTemplate(template, values) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

module.exports = async function handleNewTicketMessage({
  sessionId,
  latestInput,
  context = {},
  phoneNumber,
  lang,
}) {
  const message = latestInput.trim();

  if (message.length < 3) {
    return `CON ${t(lang, "ticket_message_too_short")}`;
  }

  const lead = await leadsRepo.findByPhone(phoneNumber);

  if (!lead) {
    await deleteSession(sessionId);

    return `END ${t(lang, "not_registered")}`;
  }

  const ticket = await ticketsRepo.create({
    leadId: lead.id,
    category: context.category,
    message,
    channel: "ussd",
  });

  const reference = ticket.id.slice(0, 8).toUpperCase();

  await saveSession(sessionId, {
    state: STATES.ACCOUNT_MENU,
    context: {
      lang,
    },
  });

  const smsMessage = replaceTemplate(t(lang, "ticket_sms_confirmation"), {
    reference,
    category: context.category,
  });

  smsService.sendSMS(phoneNumber, smsMessage).catch((error) => {
    console.error("Ticket confirmation SMS failed:", error.message);
  });

  return `CON ${t(lang, "ticket_received")}

${t(lang, "ticket_reference_label")}: ${reference}

${t(lang, "account_menu_options")}`;
};
