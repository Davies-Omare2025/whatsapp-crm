const leadsRepo = require("../repositories/leads.repo");

const { getSession, saveSession, deleteSession } = require("./redis.service");

exports.processRequest = async (body) => {
  const { sessionId, text = "" } = body;

  // Load the current session from Redis.
  const session = await getSession(sessionId);
  const { state, context } = session;

  // Africa's Talking sends the complete input history separated by *.
  // We only need the user's latest answer because Redis remembers the state.
  const parts = text === "" ? [] : text.split("*");
  const latestInput = text === "" ? "" : parts[parts.length - 1];

  // Welcome state
  if (state === "welcome") {
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
  }

  // Full-name state
  if (state === "enter_full_name") {
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
  }

  // ID-number state
  if (state === "enter_id_number") {
    const idNumber = latestInput.trim();

    // Accept digits only, between 5 and 12 digits.
    if (!/^\d{5,12}$/.test(idNumber)) {
      return `CON Invalid ID Number.

Enter 5 to 12 digits`;
    }

    // Save the completed registration permanently in PostgreSQL.
    await leadsRepo.insert({
      waPhone: body.phoneNumber,
      name: context.fullName,
      email: null,
      inquiryType: `ID Number: ${idNumber}`,
    });

    // Registration is complete, so remove the temporary Redis session.
    await deleteSession(sessionId);

    return `END Registration successful!`;
  }

  // Phone-number login state
  if (state === "enter_phone_number") {
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
  }

  // Redis contains an unexpected state.
  // Clear it so the user starts with a fresh session next time.
  await deleteSession(sessionId);

  return `END Session error. Please dial again.`;
};
