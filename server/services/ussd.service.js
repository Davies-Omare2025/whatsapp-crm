const { getSession, deleteSession } = require("./redis.service");

const stateHandlers = require("./ussd/states");

exports.processRequest = async (body) => {
  const { sessionId, text = "", phoneNumber } = body;

  try {
    // Load the current USSD session from Redis.
    const session = await getSession(sessionId);
    const { state, context } = session;

    // Use the language saved in Redis.
    // If no language has been saved yet, use English.
    const lang = context?.lang || "en";

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
    // The selected language is also passed to the handler.
    return await handler({
      sessionId,
      latestInput,
      context,
      phoneNumber,
      lang,
    });
  } catch (error) {
    console.error("USSD processing error:", error);

    // Try to remove the broken session.
    // If Redis is also unavailable, do not allow that second error
    // to hide the original problem.
    await deleteSession(sessionId).catch(() => {});

    return `END Temporary error. Please try again later.`;
  }
};
