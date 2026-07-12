const { getSession, deleteSession } = require("./redis.service");

const stateHandlers = require("./ussd/states");

exports.processRequest = async (body) => {
  const { sessionId, text = "", phoneNumber } = body;

  // Load the current USSD session from Redis.
  const session = await getSession(sessionId);
  const { state, context } = session;

  // Africa's Talking sends the full input history separated by *.
  // Redis already remembers the current state, so we only need
  // the user's most recent answer.
  const parts = text === "" ? [] : text.split("*");
  const latestInput = text === "" ? "" : parts[parts.length - 1];

  // Find the handler connected to the current Redis state.
  const handler = stateHandlers[state];

  // If Redis contains an unknown state, clear the broken session
  // and ask the user to start again.
  if (!handler) {
    await deleteSession(sessionId);

    return `END Session error. Please dial again.`;
  }

  // Send the request to the correct state handler.
  return handler({
    sessionId,
    latestInput,
    context,
    phoneNumber,
  });
};
