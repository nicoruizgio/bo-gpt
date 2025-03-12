const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load the correct environment file
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});


// Postgres connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

console.log(`Connected to PostgreSQL on ${process.env.POSTGRES_HOST}`);

module.exports = {pool};
