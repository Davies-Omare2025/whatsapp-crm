// server/routes/tickets.routes.js

const express = require("express");
const controller = require("../controllers/tickets.controller");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
router.patch("/:id/status", asyncHandler(controller.patchStatus));

module.exports = router;
