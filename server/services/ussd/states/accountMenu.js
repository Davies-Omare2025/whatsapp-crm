const leadsRepo = require("../../../repositories/leads.repo");

const { saveSession, deleteSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

const handleMyDetails = require("./myDetails");

module.exports = async function handleAccountMenu({
  sessionId,
  latestInput,
  phoneNumber,
  context,
  lang,
}) {
  const lead = await leadsRepo.findByPhone(phoneNumber);

  if (!lead) {
    await deleteSession(sessionId);

    return `END ${t(lang, "crm_record_not_found")}`;
  }

  const customerName = lead.name || t(lang, "not_available");

  if (latestInput === "") {
    return `CON ${t(lang, "account_menu_greeting")}, ${customerName}

${t(lang, "account_menu_options")}`;
  }

  // Option 1: My Details
  if (latestInput === "1") {
    await saveSession(sessionId, {
      state: STATES.MY_DETAILS,
      context: {
        ...context,
        lang,
      },
    });

    return handleMyDetails({
      sessionId,
      latestInput: "",
      phoneNumber,
      context,
      lang,
    });
  }

  // Option 2: New Support Ticket
  if (latestInput === "2") {
    await saveSession(sessionId, {
      state: STATES.NEW_TICKET_CATEGORY,
      context: {
        ...context,
        lang,
      },
    });

    return `CON ${t(lang, "ticket_category_menu")}`;
  }

  // Option 0: Main Menu
  if (latestInput === "0") {
    await saveSession(sessionId, {
      state: STATES.WELCOME,
      context: {
        ...context,
        lang,
      },
    });

    return `CON ${t(lang, "welcome_menu")}`;
  }

  return `CON ${t(lang, "invalid_account_menu_option")}

${t(lang, "account_menu_options")}`;
};
