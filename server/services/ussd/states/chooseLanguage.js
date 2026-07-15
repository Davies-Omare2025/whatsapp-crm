const { saveSession } = require("../../redis.service");
const { STATES } = require("../constants");
const { t } = require("../i18n");

module.exports = async function handleChooseLanguage({
  sessionId,
  latestInput,
  context,
}) {
  if (latestInput === "") {
    return `CON ${t("en", "choose_language")}`;
  }

  const languages = {
    1: "en",
    2: "sw",
  };

  const selectedLang = languages[latestInput];

  if (!selectedLang) {
    return `CON ${t("en", "invalid_language_option")}`;
  }

  await saveSession(sessionId, {
    state: STATES.WELCOME,
    context: {
      ...context,
      lang: selectedLang,
    },
  });

  return `CON ${t(selectedLang, "welcome_menu")}`;
};
