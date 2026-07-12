const ussdService = require("../services/ussd.service");

exports.handleUSSD = async (req, res) => {
  console.log("USSD Request:", req.body);

  const response = await ussdService.processRequest(req.body);

  console.log("USSD Response:", response);

  res.set("Content-Type", "text/plain");
  res.send(response);
};
