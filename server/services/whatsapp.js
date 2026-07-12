const axios = require("axios");

const GRAPH = "https://graph.facebook.com/v25.0";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function sendText(to, body) {
  const url = `${GRAPH}/${process.env.META_PHONE_NUMBER_ID}/messages`;

  console.log("1. URL:", url);
  console.log("2. Recipient:", to);
  console.log("3. About to call Meta...");

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body,
        },
      },
      {
        headers: authHeaders(),
        timeout: 15000,
      },
    );

    console.log("4. Meta accepted the message!");
    console.log(response.data);

    return response.data;
  } catch (err) {
    console.log("========== META RESPONSE ==========");
    console.log("Status:", err.response?.status);

    if (err.response?.data) {
      console.dir(err.response.data, { depth: null });
    }

    console.log("Message:", err.message);
    console.log("===================================");

    throw err;
  }
}

async function sendInquiryList(to) {
  const url = `${GRAPH}/${process.env.META_PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "list",
          body: {
            text: "What are you interested in?",
          },
          action: {
            button: "Choose one",
            sections: [
              {
                title: "Inquiry type",
                rows: [
                  { id: "viewing", title: "Property viewing" },
                  { id: "test_drive", title: "Car test drive" },
                  { id: "quote", title: "Request a quote" },
                  { id: "billing", title: "M-Pesa / billing" },
                  { id: "other", title: "Something else" },
                ],
              },
            ],
          },
        },
      },
      {
        headers: authHeaders(),
      },
    );
  } catch (err) {
    console.error(
      "sendInquiryList failed:",
      JSON.stringify(err.response?.data, null, 2),
    );
    throw err;
  }
}

module.exports = {
  sendText,
  sendInquiryList,
};
