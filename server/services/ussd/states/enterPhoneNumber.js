const leadsRepo = require("../../../repositories/leads.repo");

const { deleteSession } = require("../../redis.service");

module.exports = async function handleEnterPhoneNumber({
  sessionId,
  latestInput,
}) {
  const phoneNumber = latestInput.trim();

  // Do not accept an empty phone number.
  if (phoneNumber === "") {
    return `CON Phone number cannot be empty.

Enter your phone number`;
  }

  // Search PostgreSQL for a customer with this phone number.
  const customer = await leadsRepo.findByPhone(phoneNumber);

  // No matching customer was found.
  if (!customer) {
    await deleteSession(sessionId);

    return `END Phone number not registered.`;
  }

  // Login is complete, so remove the temporary Redis session.
  await deleteSession(sessionId);

  return `END Welcome back, ${customer.name}!`;
};
