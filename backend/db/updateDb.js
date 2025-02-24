const { Pool } = require("pg");
const dotenv = require("dotenv");
const  prompts = require("./prompts");

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

const updatePrompts = async () => {
  const client = await pool.connect();
  try {
    const updates = [
      {
        screen: "recommender_screen",
        prompt: prompts.recommender_screen
    },
    {
      screen: "rating_screen",
      prompt: prompts.rating_screen
    }
  ];
  console.log("propmpts: ", prompts)
    for (const {screen, prompt} of updates) {
      const query = `
        UPDATE chat_contexts
        SET system_prompt = $1
        WHERE screen_name = $2;
      `
      await client.query(query, [prompt, screen]);
      console.log(`Updated system_prompt for ${screen}`);
    }
    console.log('All prompts updated sucessfuly')
  } catch (error) {
    console.log("Error updating promots: ", error);
  } finally {
    client.release();
  }
}

updatePrompts().then(()=> pool.end());