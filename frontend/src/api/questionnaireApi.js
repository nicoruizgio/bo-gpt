import { API_URL } from "./apiurl";

export async function saveQuestionnaireResults(surveyResults) {
  const dataObj = {surveyResults}
  const response = await fetch(`${API_URL}/api/questionnaire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(dataObj)
  });

  if (!response.ok) {
    throw new Error("Failed to save questionnaire results");
  }

  return response.json();
}