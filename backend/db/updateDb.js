const { pool, jasminTable} = require("../src/config/db");
const dotenv = require("dotenv");
const  prompts = require("./prompts");


// Update prompts
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
      // CHANGE HERE
      const query = jasminTable ? `
        UPDATE j_chat_contexts
        SET system_prompt = $1
        WHERE screen_name = $2;
      ` : `
      UPDATE chat_contexts
      SET system_prompt = $1
      WHERE screen_name = $2;
    `
      await client.query(query, [prompt, screen]);
      jasminTable ? console.log('Updating Jasmins table') : console.log('Updating Nicos table')
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