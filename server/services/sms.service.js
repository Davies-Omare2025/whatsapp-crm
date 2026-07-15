// server/services/sms.service.js
const env = require("../config/env");

const AT_SMS_URL = "https://api.sandbox.africastalking.com/version1/messaging";

async function sendSMS(to, message) {
  const requestData = {
    username: env.AT_USERNAME,
    to,
    message,
  };

  if (env.AT_SMS_FROM) {
    requestData.from = env.AT_SMS_FROM;
  }

  const body = new URLSearchParams(requestData).toString();

  const response = await fetch(AT_SMS_URL, {
    method: "POST",
    headers: {
      apiKey: env.AT_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const rawResponse = await response.text();

  let data;

  try {
    data = JSON.parse(rawResponse);
  } catch {
    data = rawResponse;
  }

  if (!response.ok) {
    console.error("Africa's Talking SMS error:", {
      status: response.status,
      statusText: response.statusText,
      response: data,
    });

    throw new Error(typeof data === "string" ? data : "SMS sending failed");
  }

  return data;
}

module.exports = {
  sendSMS,
};
