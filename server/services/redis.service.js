const { client } = require("../config/redis");
const { STATES } = require("./ussd/constants");

const SESSION_TTL = 300; // 5 minutes

function getSessionKey(sessionId) {
  return `ussd:session:${sessionId}`;
}

async function getSession(sessionId) {
  const raw = await client.get(getSessionKey(sessionId));

  if (!raw) {
    return {
      state: STATES.CHOOSE_LANGUAGE,
      context: {},
    };
  }

  return JSON.parse(raw);
}

async function saveSession(sessionId, data) {
  await client.set(getSessionKey(sessionId), JSON.stringify(data), {
    EX: SESSION_TTL,
  });
}

async function deleteSession(sessionId) {
  await client.del(getSessionKey(sessionId));
}

module.exports = {
  getSession,
  saveSession,
  deleteSession,
};
