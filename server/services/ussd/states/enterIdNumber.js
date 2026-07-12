const leadsRepo = require("../../../repositories/leads.repo");

const { deleteSession } = require("../../redis.service");

module.exports = async function handleEnterIdNumber({
  sessionId,
  latestInput,
  context,
  phoneNumber,
}) {
  const idNumber = latestInput.trim();

  // Accept digits only, between 5 and 12 digits.
  if (!/^\d{5,12}$/.test(idNumber)) {
    return `CON Invalid ID Number.

Enter 5 to 12 digits`;
  }

  // Save the completed registration permanently in PostgreSQL.
  await leadsRepo.insert({
    waPhone: phoneNumber,
    name: context.fullName,
    email: null,
    inquiryType: `ID Number: ${idNumber}`,
  });

  // Registration is complete, so remove the temporary Redis session.
  await deleteSession(sessionId);

  return `END Registration successful!`;
};
