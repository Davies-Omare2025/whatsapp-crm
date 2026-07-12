// server/services/bot.js

const leadsRepo = require("../repositories/leads.repo");
const conversationsRepo = require("../repositories/conversations.repo");
const messagesRepo = require("../repositories/messages.repo");
const usersRepo = require("../repositories/users.repo");
const { sendText, sendInquiryList } = require("./whatsapp");

/* -------------------------------------------------------------------------- */
/*                              Persistence Helpers                           */
/* -------------------------------------------------------------------------- */

async function findOrCreateLead(waPhone) {
  let lead = await leadsRepo.findByPhone(waPhone);

  if (lead) {
    return {
      lead,
      isNew: false,
    };
  }

  lead = await leadsRepo.insert({
    waPhone,
    name: null,
    email: null,
    inquiryType: null,
  });

  await conversationsRepo.create(lead.id, "awaiting_name");

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
    console.error("[auto-route] failed:", err.message);
  }

  return {
    lead,
    isNew: true,
  };
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
  const saved = await messagesRepo.append(leadId, direction, body, rawPayload);

  if (global.io) {
    global.io.emit("message:new", {
      leadId,
      message: saved,
    });
  }

  return saved;
}

/* -------------------------------------------------------------------------- */
/*                                 Validation                                 */
/* -------------------------------------------------------------------------- */

function looksLikeEmail(str) {
  return typeof str === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function looksLikeName(str) {
  if (typeof str !== "string") return false;

  const value = str.trim();

  if (value.length < 2) return false;

  const greetings = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "mambo",
    "niaje",
    "yo",
  ];

  return !greetings.includes(value.toLowerCase());
}

/* -------------------------------------------------------------------------- */
/*                            Conversation Handler                            */
/* -------------------------------------------------------------------------- */

async function handleIncoming(message, contact) {
  const waPhone = message.from;

  const { lead, isNew } = await findOrCreateLead(waPhone);

  let userText = null;
  let listChoiceId = null;

  if (message.type === "text") {
    userText = message.text?.body?.trim();
  } else if (message.type === "interactive") {
    const interactive = message.interactive;

    if (interactive?.type === "list_reply") {
      listChoiceId = interactive.list_reply.id;
      userText = interactive.list_reply.title;
    } else if (interactive?.type === "button_reply") {
      userText = interactive.button_reply.title;
    }
  } else {
    await sendText(
      waPhone,
      "I can only read text messages right now. Please type your answer.",
    );

    await logMessage(lead.id, "in", `[${message.type}]`, message);

    return;
  }

  // Save incoming message
  await logMessage(lead.id, "in", userText, message);

  // Has the chatbot already handed over to a human?
  const latestLead = await leadsRepo.findById(lead.id);

  if (!latestLead.bot_enabled) {
    if (/^(restart|start over|reset)$/i.test(userText || "")) {
      // Allow restart below.
    } else {
      console.log(
        "🤖 Bot disabled. Human agent is handling this conversation.",
      );
      return;
    }
  }

  /* ---------------------------------------------------------------------- */

  if (userText && /^(restart|start over|reset)$/i.test(userText)) {
    await updateLead(lead.id, {
      name: null,
      email: null,
      inquiry_type: null,
    });
    await leadsRepo.setBotEnabled(lead.id, true);
    await setState(lead.id, "awaiting_name");

    const reply =
      "No problem 😊\n\nLet's start over.\n\nWhat's your full name?";

    await sendText(waPhone, reply);

    await logMessage(lead.id, "out", reply);

    return;
  }

  let convo = await getConversation(lead.id);

  if (!convo) {
    convo = await conversationsRepo.create(lead.id, "awaiting_name");
  }

  switch (convo.state) {
    case "awaiting_name": {
      if (!looksLikeName(userText)) {
        const reply = "Please tell me your full name.";

        await sendText(waPhone, reply);

        await logMessage(lead.id, "out", reply);

        return;
      }

      await updateLead(lead.id, {
        name: userText,
      });

      await setState(lead.id, "awaiting_email");

      const reply = `Thanks ${
        userText.split(" ")[0]
      }! 😊\n\nWhat's your email address?`;

      await sendText(waPhone, reply);

      await logMessage(lead.id, "out", reply);

      return;
    }

    case "awaiting_email": {
      if (!looksLikeEmail(userText)) {
        const reply =
          "That doesn't look like a valid email.\n\nExample:\nname@gmail.com";

        await sendText(waPhone, reply);

        await logMessage(lead.id, "out", reply);

        return;
      }

      await updateLead(lead.id, {
        email: userText,
      });

      await setState(lead.id, "awaiting_inquiry_type");

      await sendInquiryList(waPhone);

      await logMessage(lead.id, "out", "[interactive inquiry list]");

      return;
    }

    case "awaiting_inquiry_type": {
      if (!listChoiceId && !userText) {
        await sendInquiryList(waPhone);
        return;
      }

      const inquiry = listChoiceId || userText;

      await updateLead(lead.id, {
        inquiry_type: inquiry,
      });

      const fresh = await leadsRepo.findById(lead.id);

      await setState(lead.id, "confirming");

      const reply =
        `Please confirm your details:\n\n` +
        `Name: ${fresh.name}\n` +
        `Email: ${fresh.email}\n` +
        `Inquiry: ${fresh.inquiry_type}\n\n` +
        `Reply "yes" to confirm or "restart" to start over.`;

      await sendText(waPhone, reply);

      await logMessage(lead.id, "out", reply);

      return;
    }

    case "confirming": {
      const answer = (userText || "").trim().toLowerCase();

      if (
        [
          "yes",
          "y",
          "confirm",
          "confirmed",
          "ok",
          "okay",
          "continue",
          "proceed",
        ].includes(answer)
      ) {
        await setState(lead.id, "complete");

        const reply =
          "🎉 Thanks!\n\nYour details have been saved successfully.\n\nOne of our team members will contact you shortly.";

        await sendText(waPhone, reply);

        await logMessage(lead.id, "out", reply);
        await leadsRepo.setBotEnabled(lead.id, false);

        return;
      }

      const reply =
        'Please reply "yes" to confirm your details or type "restart" to start over.';

      await sendText(waPhone, reply);

      await logMessage(lead.id, "out", reply);

      return;
    }

    case "complete":
    default: {
      const reply =
        'We already have your details 😊\n\nIf you would like to submit a new inquiry, type "restart".';

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
