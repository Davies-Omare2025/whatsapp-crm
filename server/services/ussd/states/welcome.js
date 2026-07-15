const leadsRepo = require("../../../repositories/leads.repo");

const { saveSession, deleteSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

module.exports = async function handleWelcome({
  sessionId,
  latestInput,
  phoneNumber,
  context,
  lang,
}) {
  if (latestInput === "") {
    return `CON ${t(lang, "welcome_menu")}`;
  }

  // Option 1: Register
  if (latestInput === "1") {
    const existingLead = await leadsRepo.findByPhone(phoneNumber);

    // Existing customer: move to the Account Menu.
    if (existingLead) {
      await saveSession(sessionId, {
        state: STATES.ACCOUNT_MENU,
        context: {
          ...context,
          lang,
        },
      });

      const customerName = existingLead.name || t(lang, "not_available");

      return `CON ${t(lang, "account_menu_greeting")}, ${customerName}

${t(lang, "account_menu_options")}`;
    }

    // New customer: begin registration.
    await saveSession(sessionId, {
      state: STATES.ENTER_FULL_NAME,
      context: {
        ...context,
        lang,
      },
    });

    return `CON ${t(lang, "enter_full_name")}`;
  }

  // Option 2: My Details
  if (latestInput === "2") {
    const existingLead = await leadsRepo.findByPhone(phoneNumber);

    if (!existingLead) {
      await deleteSession(sessionId);

      return `END ${t(lang, "not_registered")}`;
    }

    await saveSession(sessionId, {
      state: STATES.MY_DETAILS,
      context: {
        ...context,
        lang,
      },
    });

    const name = existingLead.name || t(lang, "not_available");
    const status = existingLead.status || t(lang, "not_available");
    const category = existingLead.category || t(lang, "not_available");

    return `CON ${t(lang, "name_label")}: ${name}
${t(lang, "status_label")}: ${status}
${t(lang, "category_label")}: ${category}

${t(lang, "details_back_option")}`;
  }

  // Option 3: New Support Ticket
  if (latestInput === "3") {
    const existingLead = await leadsRepo.findByPhone(phoneNumber);

    if (!existingLead) {
      await deleteSession(sessionId);

      return `END ${t(lang, "not_registered")}`;
    }

    await saveSession(sessionId, {
      state: STATES.NEW_TICKET_CATEGORY,
      context: {
        ...context,
        lang,
      },
    });

    return `CON ${t(lang, "ticket_category_menu")}`;
  }

  // Option 0: Exit
  if (latestInput === "0") {
    await deleteSession(sessionId);

    return `END ${t(lang, "exit_message")}`;
  }

  return `CON ${t(lang, "invalid_main_option")}`;
};
