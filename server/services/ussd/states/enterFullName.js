const { saveSession } = require("../../redis.service");

module.exports = async function handleEnterFullName({
  sessionId,
  latestInput,
  context,
}) {
  const fullName = latestInput.trim();

  // Do not accept an empty name.
  if (fullName === "") {
    return `CON Full name cannot be empty.

Enter your full name`;
  }

  // Remember the name and move to the ID-number state.
  await saveSession(sessionId, {
    state: "enter_id_number",
    context: {
      ...context,
      fullName,
    },
  });

  return `CON Enter your ID Number`;
};
