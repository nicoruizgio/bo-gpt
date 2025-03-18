import pool from "../config/db.js";

/* Save questionnaire in DB */
const saveQuestionnaireResponse = async (req, res) => {
  try {
    const surveyResults = req.body.surveyResults;
    if (!surveyResults) {
      return res.status(400).json({ error: "No survey results provided" });
    }

    const { age, gender, location, newsConsumptionFrequency, education } =
      surveyResults;

    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const queryText = `
    INSERT INTO questionnaire_responses
      (participant_id, age, gender, location, news_consumption_frequency, education)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING id
    `;

    const values = [
      userId,
      age,
      gender,
      location,
      newsConsumptionFrequency,
      education,
    ];

    const result = await pool.query(queryText, values);
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error saving questionnaire response: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default saveQuestionnaireResponse;
