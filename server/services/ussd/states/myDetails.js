// server/services/ussd/states/myDetails.js

const leadsRepo = require("../../../repositories/leads.repo");

const { saveSession, deleteSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

module.exports = async function handleMyDetails({
  sessionId,
  latestInput = "",
  phoneNumber,
  context = {},
  lang,
}) {
  // The customer selected 0, so return to the main menu.
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

  const lead = await leadsRepo.findByPhone(phoneNumber);

  // End the session if the phone number has no CRM record.
  if (!lead) {
    await deleteSession(sessionId);

    return `END ${t(lang, "crm_record_not_found")}`;
  }

  const name = lead.name || t(lang, "not_available");
  const status = lead.status || t(lang, "not_available");
  const category = lead.category || t(lang, "not_available");

  const details = `${t(lang, "name_label")}: ${name}
${t(lang, "status_label")}: ${status}
${t(lang, "category_label")}: ${category}`;

  // The first time the details screen opens.
  if (latestInput === "") {
    return `CON ${details}

${t(lang, "details_back_option")}`;
  }

  // Any input other than 0 is invalid.
  return `CON ${t(lang, "invalid_details_option")}

${details}

${t(lang, "details_back_option")}`;
};
