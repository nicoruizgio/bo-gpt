# Bo-GPT README

This project is divided into two main folders: `backend` and `frontend`. Below, you’ll find instructions on how to run both, as well as how to modify certain parameters (such as prompts and the RAG pipeline type).

---

## Table of Contents

1. [Running the Backend](#running-the-backend)
2. [Running the Fronted](#running-the-frontend)
3. [Switching Between OpenAI Models](#switching-between-openai-models)
4. [Modifying Prompts](#modifying-prompts)
5. [MultiqueryRAG vs SimpleRAG](#multiqueryrag-vs-simplerag)
6. [Toggling Between RAG Pipelines](#toggling-between-rag-pipelines)
7. [Using Query Transformations](#using-query-transformations)
8. [Viewing Logs](#viewing-logs)
9. [Running the Frontend](#running-the-frontend)

---

## Running the Backend

1. **Navigate to the `backend` folder**:
   ```bash
   cd backend

2. **Install dependencies (if you haven’t already)**
    ```bash
    npm install


3. **Start the backend server**
    ```bash
    npm start

The backend will start running, and you can view logs directly in the terminal.

---

## Running the Frontend

1. **Open a new terminal** (keeping the backend terminal open) and navigate to the frontend folder:

  ```bash
  cd frontend
  ```

2. **Install dependencies** (if you haven’t already):

  ```bash
  npm install
  ```

2. **Run the frontend**

  ```bash
  npm run dev
  ```

This should start the frontend development server. Follow the console output to see which local port the frontend is being served on.

---

## Switching Between OpenAI Models

To modify the OpenAI models used in different parts of the system, update the relevant files as follows:

- **User Preferences Summary Model**
  Navigate to `backend/src/controllers/controllers/saveRatingController.js` and modify the `model` field inside `response`:
  ```js
  model: "gpt-4o"
  ```

- **Rating and Recommender Chatbot Model**
  Go to `backend/src/helpers/completionHelpers` and update the `model` field inside the `async function streamChatCompletion`:
  ```js
  model: "gpt-4o"
  ```

- **Query Transformation Model**
  In `backend/src/helpers/completionHelpers`, modify the `model` field inside `async function transformQuery`:
  ```js
  model: "gpt-4o"
  ```

## Modifying Prompts

Within `backend/src/prompts/`, there are two files:

- `newsToRate.js`
- `prompts.js`

All chatbot prompts are defined in `prompts.js`, including:

- `rating_screen_prompt`: Used by the rating bot to present the articles.
- `get_user_preferences_prompt`: Used to generate the user preference summary based on the conversation with the rating bot.
- `recommender_screen_multiquery_prompt`: Used by the recommender chatbot that employs a multi-query RAG pipeline.
- `recommender_screen_simple_prompt`: Used by the recommender chatbot that employs a simple RAG pipeline.
- `query_transformation_prompt`: Used to enhance user message

Feel free to adjust these prompts to experiment with different chatbot behaviors.

---

## MultiqueryRAG vs SimpleRAG

Bo-GPT supports both **multiquery** and **simple** RAG pipelines.

- The **multiquery** pipeline retrieves two sets of articles, both embedded in the model’s context window. One set is based on the user’s message, while the other is based on the user’s preferences. Then, the system decides which articles to recommend based on both sets. The system prompt for this pipeline is defined in `recommender_screen_multiquery_prompt`.

- The **simple** RAG pipeline queries the database using only the user’s message, while the user’s preferences are directly embedded into the model’s context window. Here, the system takes into account the user preferences to determine which articles to recommend from the retrieved set. The system prompt for this pipeline is defined in `recommender_screen_simple_prompt`.

---

## Toggling Between RAG Pipelines

You can switch between the **multiquery** and **simple** RAG pipelines by editing the function call in:

- `backend/src/controllers/completionControllers.js`

Inside the function that calls the RAG pipeline, you’ll see something like:

  ```bash
  systemPrompt = await doRAG(chatLog, userId, 'multiqueryRAG', true);
  ```

Change 'multiqueryRAG' to 'simpleRAG' to switch to the simple pipeline:

  ```bash
  systemPrompt = await doRAG(chatLog, userId, 'simpleRAG', true);
  ```

---

## Using Query Transformations

To improve the retrieved articles, we can enhance user messages by adding more details and extra information to the query ([read more](https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/query_transformations.ipynb)). To use this feature set the fourth argument of `doRAG` to `true` in `backend/src/controllers/completionControllers.js`. To use the user message to query the database without doing query transformation change it to `fasle`.

---

## Viewing Logs

While the backend is running, whenever you interact with the recommender chatbot, you can check the terminal output and see the transformed query (if activated), the user message and the RAG type being used along with the entire system prompt. You should see lines like:

  ```bash

    USER MESSAGE:  fussball
    TRANSFORMED QUERY:  Fußballspiele und Vereinsentwicklungen in Bochum und der Bundesliga.
    RAG TYPE: SIMPLE
  ..
  <system prompt details>
  ```

---

## Navigating between screens

In `App.jsx` you can see all the project pages available. Use the urls to navigate between them during testing.

---

## Changing the number of news shown in Rating Screen

The number of news shown by the rating chatbot is set to `36` by default. To change it, go to `frontend/src/screens/rating-screen/RatingScreen.jsx` and search for the prop `MaxMessages={36}`