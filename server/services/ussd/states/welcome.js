const { saveSession } = require("../../redis.service");
const { STATES } = require("../constants");

module.exports = async function handleWelcome({ sessionId, latestInput }) {
  if (latestInput === "") {
    return `CON Welcome to Mctaba CRM

1. Register
2. Login`;
  }

  if (latestInput === "1") {
    await saveSession(sessionId, {
      state: STATES.ENTER_FULL_NAME,
      context: {},
    });

    return `CON Enter your full name`;
  }

  if (latestInput === "2") {
    await saveSession(sessionId, {
      state: STATES.ENTER_PHONE_NUMBER,
      context: {},
    });

    return `CON Enter your phone number`;
  }

  return `CON Invalid option

1. Register
2. Login`;
};
