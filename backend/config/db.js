const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bo_gpt",
  password: process.env.DB_PASSWORD || "your_password",
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

module.exports = pool;
