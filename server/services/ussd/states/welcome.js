const { saveSession } = require("../../redis.service");

module.exports = async function handleWelcome({ sessionId, latestInput }) {
  // The user has just dialled the USSD code.
  if (latestInput === "") {
    return `CON Welcome to Mctaba CRM

1. Register
2. Login`;
  }

  // The user selected Register.
  if (latestInput === "1") {
    await saveSession(sessionId, {
      state: "enter_full_name",
      context: {},
    });

    return `CON Enter your full name`;
  }

  // The user selected Login.
  if (latestInput === "2") {
    await saveSession(sessionId, {
      state: "enter_phone_number",
      context: {},
    });

    return `CON Enter your phone number`;
  }

  // Invalid input keeps the USSD session open.
  return `CON Invalid option

1. Register
2. Login`;
};
