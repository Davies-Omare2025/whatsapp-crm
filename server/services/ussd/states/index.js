const { STATES } = require("../constants");

const handleWelcome = require("./welcome");
const handleEnterFullName = require("./enterFullName");
const handleEnterIdNumber = require("./enterIdNumber");
const handleEnterPhoneNumber = require("./enterPhoneNumber");

module.exports = {
  [STATES.WELCOME]: handleWelcome,
  [STATES.ENTER_FULL_NAME]: handleEnterFullName,
  [STATES.ENTER_ID_NUMBER]: handleEnterIdNumber,
  [STATES.ENTER_PHONE_NUMBER]: handleEnterPhoneNumber,
};
