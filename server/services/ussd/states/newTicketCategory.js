// server/services/ussd/states/newTicketCategory.js

const { saveSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

const CATEGORIES = {
  1: "billing",
  2: "product_quality",
  3: "delivery",
  4: "other",
};

module.exports = async function handleNewTicketCategory({
  sessionId,
  latestInput,
  context = {},
  lang,
}) {
  // Option 0: Return to the main menu.
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

  const category = CATEGORIES[latestInput];

  // Invalid option: keep the customer on the same screen.
  if (!category) {
    return `CON ${t(lang, "invalid_ticket_category")}`;
  }

  const nextContext = {
    ...context,
    lang,
    category,
  };

  console.log("Saving USSD session:", {
    sessionId,
    nextState: STATES.NEW_TICKET_MESSAGE,
    nextContext,
  });

  await saveSession(sessionId, {
    state: STATES.NEW_TICKET_MESSAGE,
    context: nextContext,
  });

  console.log("USSD session saved successfully:", {
    sessionId,
    state: STATES.NEW_TICKET_MESSAGE,
  });

  return `CON ${t(lang, "describe_problem")}`;
};
