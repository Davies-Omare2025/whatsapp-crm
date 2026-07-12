const express = require("express");
const router = express.Router();

const ussdController = require("../controllers/ussd.controller");

router.post(
  "/ussd",
  express.urlencoded({ extended: false }),
  ussdController.handleUSSD,
);

module.exports = router;
