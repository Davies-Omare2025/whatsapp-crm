const leadsRepo = require("../../../repositories/leads.repo");

const { saveSession, deleteSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

module.exports = async function handleEnterIdNumber({
  sessionId,
  latestInput,
  context,
  phoneNumber,
  lang,
}) {
  const idNumber = latestInput.trim();

  // The ID number must contain 5 to 12 digits only.
  if (!/^\d{5,12}$/.test(idNumber)) {
    return `CON ${t(lang, "invalid_id_number")}`;
  }

  // Make sure the registration name is still available in Redis.
  const fullName = context?.fullName?.trim();

  if (!fullName) {
    await deleteSession(sessionId);

    return `END ${t(lang, "registration_session_error")}`;
  }

  // Check again in case the phone number was registered during this session.
  const existingLead = await leadsRepo.findByPhone(phoneNumber);

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

  // Save the new customer permanently in PostgreSQL.
  const newLead = await leadsRepo.insert({
    waPhone: phoneNumber,
    name: fullName,
    email: null,
    inquiryType: `ID Number: ${idNumber}`,
    channel: "ussd",
    category: "registration",
  });

  // Registration is finished, but the USSD session should continue
  // into the registered customer's Account Menu.
  await saveSession(sessionId, {
    state: STATES.ACCOUNT_MENU,
    context: {
      lang,
    },
  });

  const customerName = newLead?.name || fullName || t(lang, "not_available");

  return `CON ${t(lang, "registration_successful")}

${t(lang, "account_menu_greeting")}, ${customerName}

${t(lang, "account_menu_options")}`;
};
