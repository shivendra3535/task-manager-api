const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectMongo = require("./config/mongo");
const { createUserTable } = require("./models/User");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

/*
  Fix double slash issue like:
  //api/tasks -> /api/tasks
*/
app.use((req, res, next) => {
  const q = req.url.indexOf("?");
  const pathPart = q === -1 ? req.url : req.url.slice(0, q);
  const query = q === -1 ? "" : req.url.slice(q);
  const normalized = pathPart.replace(/\/{2,}/g, "/") || "/";
  req.url = normalized + query;
  next();
});

/* Middleware */
app.use(cors());
app.use(express.json());

/* Request logger (useful for debugging) */
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

/* Swagger JSON (optional but useful) */
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

/*
  Swagger UI
  This is the ONLY correct and required setup
*/
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Task Manager API",
  })
);

/* Routes */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

/* Error middleware */
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

/* Start server */
async function start() {
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in environment");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in environment");
    process.exit(1);
  }

  await connectMongo();

  try {
    await createUserTable();
  } catch (err) {
    console.error("PostgreSQL:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
    console.log("Swagger running at:");
    console.log(`http://localhost:${PORT}/api-docs`);
  });
}

start();