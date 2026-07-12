const handleWelcome = require("./welcome");
const handleEnterFullName = require("./enterFullName");
const handleEnterIdNumber = require("./enterIdNumber");
const handleEnterPhoneNumber = require("./enterPhoneNumber");

module.exports = {
  welcome: handleWelcome,
  enter_full_name: handleEnterFullName,
  enter_id_number: handleEnterIdNumber,
  enter_phone_number: handleEnterPhoneNumber,
};
