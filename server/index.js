// server/index.js
const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const webhookRoutes = require("./routes/webhook.routes");
const leadsRoutes = require("./routes/leads.routes");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const requireAuth = require("./middleware/requireAuth");

const app = express();

app.use(cors({ origin: process.env.APP_URL || "http://localhost:3000" }));

// IMPORTANT: we still need the raw request body for Meta's HMAC signature
// verification (same as Week 11). express.json's `verify` callback runs
// before parsing and lets us stash the raw bytes on req.rawBody.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/webhook", webhookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/leads", requireAuth, leadsRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`CRM server running on :${env.PORT}`);
});
