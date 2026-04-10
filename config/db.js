const { Pool } = require("pg");
require("dotenv").config();

const port = Number(process.env.POSTGRES_PORT) || 5432;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port,
  host: process.env.POSTGRES_HOST || "localhost",
});

module.exports = pool;
