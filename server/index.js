// server/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const env = require("./config/env");
const { client, connectRedis } = require("./config/redis");

const ussdRoutes = require("./routes/ussd.routes");
const webhookRoutes = require("./routes/webhook.routes");
const authRoutes = require("./routes/auth.routes");
const leadsRoutes = require("./routes/leads.routes");
const ticketsRoutes = require("./routes/tickets.routes");
const messagesRoutes = require("./routes/messages.routes");

const requireAuth = require("./middleware/requireAuth");
const errorHandler = require("./middleware/errorHandler");

const { saveSession, getSession } = require("./services/redis.service");

const app = express();
const server = http.createServer(app);

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const io = new Server(server, {
  cors: {
    origin: process.env.APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("Browser connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Browser disconnected:", socket.id);
  });
});

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
  }),
);

// Keep the raw request body for Meta webhook signature verification.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

app.use("/webhook", webhookRoutes);
app.use("/api/auth", authRoutes);
app.use("/", ussdRoutes);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

app.use("/api/leads", requireAuth, leadsRoutes);

app.use("/api/tickets", requireAuth, ticketsRoutes);

app.use("/api/users", requireAuth, require("./routes/users.routes"));

app.use("/api/messages", requireAuth, messagesRoutes);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

async function startServer() {
  await connectRedis();

  const redisServerInfo = await client.info("server");
  console.log("Redis server information:\n", redisServerInfo);

  await saveSession("test-session", {
    state: "welcome",
    context: {
      name: "Redis Test",
    },
  });

  const savedSession = await getSession("test-session");

  console.log("Redis session test:", savedSession);

  server.listen(env.PORT, () => {
    console.log(`CRM server running on :${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
