const { saveSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

module.exports = async function handleEnterFullName({
  sessionId,
  latestInput,
  context,
  lang,
}) {
  const fullName = latestInput.trim();

  // The customer must enter a name before continuing.
  if (!fullName) {
    return `CON ${t(lang, "enter_full_name")}`;
  }

  // Save the name temporarily and move to the ID-number screen.
  await saveSession(sessionId, {
    state: STATES.ENTER_ID_NUMBER,
    context: {
      ...context,
      fullName,
      lang,
    },
  });

  return `CON ${t(lang, "enter_id_number")}`;
};
