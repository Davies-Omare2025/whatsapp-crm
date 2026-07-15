const { STATES } = require("../constants");

const handleChooseLanguage = require("./chooseLanguage");
const handleWelcome = require("./welcome");
const handleAccountMenu = require("./accountMenu");
const handleEnterFullName = require("./enterFullName");
const handleEnterIdNumber = require("./enterIdNumber");
const handleMyDetails = require("./myDetails");
const handleNewTicketCategory = require("./newTicketCategory");
const handleNewTicketMessage = require("./newTicketMessage");

module.exports = {
  [STATES.CHOOSE_LANGUAGE]: handleChooseLanguage,
  [STATES.WELCOME]: handleWelcome,
  [STATES.ACCOUNT_MENU]: handleAccountMenu,
  [STATES.ENTER_FULL_NAME]: handleEnterFullName,
  [STATES.ENTER_ID_NUMBER]: handleEnterIdNumber,
  [STATES.MY_DETAILS]: handleMyDetails,
  [STATES.NEW_TICKET_CATEGORY]: handleNewTicketCategory,
  [STATES.NEW_TICKET_MESSAGE]: handleNewTicketMessage,
};
