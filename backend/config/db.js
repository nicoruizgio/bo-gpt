const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load the correct environment file
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

// Create the PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER, // Change from DB_USER
  host: process.env.POSTGRES_HOST, // Change from DB_HOST
  database: process.env.POSTGRES_DB, // Change from DB_NAME
  password: process.env.POSTGRES_PASSWORD, // Change from DB_PASSWORD
  port: process.env.POSTGRES_PORT || 5432, // Change from DB_PORT
});

console.log(`Connected to PostgreSQL on ${process.env.POSTGRES_HOST}`);

module.exports = pool;
