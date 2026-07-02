// server/services/bot.js
const leadsRepo = require("../repositories/leads.repo");
const conversationsRepo = require("../repositories/conversations.repo");
const messagesRepo = require("../repositories/messages.repo");
const usersRepo = require("../repositories/users.repo");
const { sendText, sendInquiryList } = require("./whatsapp");

// --- Persistence helpers --------------------------------------------------

async function findOrCreateLead(waPhone, profileName) {
  let lead = await leadsRepo.findByPhone(waPhone);
  if (lead) return lead;

  lead = await leadsRepo.insert({
    waPhone,
    name: profileName || null,
    email: null,
    inquiryType: null,
  });

  await conversationsRepo.create(lead.id, "awaiting_name");

  // Auto-route: assign new lead to the least-busy agent (fallback: unassigned)
  try {
    const agent = await usersRepo.findLeastBusyAgent();
    if (agent) {
      const updated = await leadsRepo.assign(lead.id, agent.id);
      if (updated) lead = updated;
      console.log(`[auto-route] lead ${lead.id} -> ${agent.name}`);
    } else {
      console.log(
        `[auto-route] no agents available, lead ${lead.id} left unassigned`,
      );
    }
  } catch (err) {
    console.error("[auto-route] failed, lead left unassigned:", err.message);
  }

  return lead;
}

async function getConversation(leadId) {
  return conversationsRepo.findByLeadId(leadId);
}

async function setState(leadId, state) {
  return conversationsRepo.setState(leadId, state);
}

async function updateLead(leadId, patch) {
  return leadsRepo.updateFields(leadId, patch);
}

async function logMessage(leadId, direction, body, rawPayload) {
  return messagesRepo.append(leadId, direction, body, rawPayload);
}

// --- Validation -------------------------------------------------------

function looksLikeEmail(str) {
  return typeof str === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function looksLikeName(str) {
  return typeof str === "string" && str.trim().length >= 2;
}

// --- Conversation handler -----------------------------------------------

async function handleIncoming(message, contact) {
  const waPhone = message.from;
  const profileName = contact?.profile?.name;

  const lead = await findOrCreateLead(waPhone, profileName);

  let userText = null;
  let listChoiceId = null;

  if (message.type === "text") {
    userText = message.text?.body?.trim();
  } else if (message.type === "interactive") {
    const i = message.interactive;
    if (i?.type === "list_reply") {
      listChoiceId = i.list_reply.id;
      userText = i.list_reply.title;
    } else if (i?.type === "button_reply") {
      userText = i.button_reply.title;
    }
  } else {
    await sendText(
      waPhone,
      "I can only read text messages right now. Could you type your answer?",
    );
    await logMessage(lead.id, "in", `[${message.type}]`, message);
    return;
  }
  await logMessage(lead.id, "in", userText, message);

  if (userText && /^(restart|start over|reset)$/i.test(userText)) {
    await setState(lead.id, "awaiting_name");
    await updateLead(lead.id, { name: null, email: null, inquiry_type: null });
    const reply = "No problem, let's start over. What's your full name?";
    await sendText(waPhone, reply);
    await logMessage(lead.id, "out", reply);
    return;
  }

  const convo = await getConversation(lead.id);
  switch (convo.state) {
    case "awaiting_name": {
      if (!userText || !looksLikeName(userText)) {
        const reply =
          "Hi! Welcome to Mactaba Lab CRM. What's your full name? (at least 2 characters)";
        await sendText(waPhone, reply);
        await logMessage(lead.id, "out", reply);
        return;
      }
      await updateLead(lead.id, { name: userText });
      const reply = `Thanks ${userText.split(" ")[0]}! What's your email address?`;
      await sendText(waPhone, reply);
      await setState(lead.id, "awaiting_email");
      await logMessage(lead.id, "out", reply);
      return;
    }
    case "awaiting_email": {
      if (!looksLikeEmail(userText)) {
        const reply =
          "Hmm, that doesn't look like an email. Could you send it again? Example: yourname@gmail.com";
        await sendText(waPhone, reply);
        await logMessage(lead.id, "out", reply);
        return;
      }
      await updateLead(lead.id, { email: userText });
      await sendInquiryList(waPhone);
      await setState(lead.id, "awaiting_inquiry_type");
      await logMessage(lead.id, "out", "[interactive list: inquiry type]");
      return;
    }
    case "awaiting_inquiry_type": {
      if (!listChoiceId && !userText) {
        await sendInquiryList(waPhone);
        return;
      }
      const inquiry = listChoiceId || userText;
      await updateLead(lead.id, { inquiry_type: inquiry });

      const fresh = await leadsRepo.findById(lead.id);
      const reply =
        `Please confirm your details:\n\n` +
        `Name: ${fresh.name}\n` +
        `Email: ${fresh.email}\n` +
        `Inquiry: ${fresh.inquiry_type}\n\n` +
        `Reply "yes" to confirm or "restart" to start over.`;
      await sendText(waPhone, reply);
      await setState(lead.id, "confirming");
      await logMessage(lead.id, "out", reply);
      return;
    }
    case "confirming": {
      if (/^y(es)?$/i.test(userText || "")) {
        const reply =
          "Thanks! Your details are saved. Someone from our team will be in touch shortly. To start a new inquiry, type 'restart'.";
        await sendText(waPhone, reply);
        await setState(lead.id, "complete");
        await logMessage(lead.id, "out", reply);
        return;
      }
      const reply =
        "Reply 'yes' to confirm the details above, or 'restart' to start over.";
      await sendText(waPhone, reply);
      await logMessage(lead.id, "out", reply);
      return;
    }

    case "complete":
    default: {
      const reply =
        "Thanks! We already have your details. A team member will be in touch. To start a new inquiry, type 'restart'.";
      await sendText(waPhone, reply);
      await logMessage(lead.id, "out", reply);
      return;
    }
  }
}

module.exports = {
  findOrCreateLead,
  getConversation,
  setState,
  updateLead,
  logMessage,
  handleIncoming,
};
