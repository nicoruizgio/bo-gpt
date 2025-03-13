# Project README

This project is divided into two main folders: `backend` and `frontend`. Below, you’ll find instructions on how to run both, as well as how to modify certain parameters (such as prompts and the RAG pipeline type).

---

## Table of Contents

1. [Running the Backend](#running-the-backend)
2. [Modifying Prompts](#modifying-prompts)
3. [Toggling Between RAG Pipelines](#toggling-between-rag-pipelines)
4. [Viewing Logs](#viewing-logs)
5. [Running the Frontend](#running-the-frontend)

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

## Modifying Prompts

Within `backend/src/prompts/`, there are two files:

- `newsToRate.js`
- `prompts.js`

All chatbot prompts are defined in `prompts.js`, including:

- `rating_screen_prompt`: Used by the rating bot to present the articles.
- `get_user_preferences_prompt`: Used to generate the user preference summary based on the conversation with the rating bot.
- `recommender_screen_multiquery_prompt`: Used by the recommender chatbot that employs a multi-query RAG pipeline.
- `recommender_screen_simple_prompt`: Used by the recommender chatbot that employs a simple RAG pipeline.

Feel free to adjust these prompts to experiment with different chatbot behaviors.

---

## Toggling Between RAG Pipelines

You can switch between the **multiquery** and **simple** RAG pipelines by editing the function call in:

- `backend/src/controllers/completionControllers.js`

Inside the function that calls the RAG pipeline, you’ll see something like:

  ```bash
  systemPrompt = await doRAG(chatLog, userId, ragType = 'multiqueryRAG');
  ```

Change 'multiqueryRAG' to 'simpleRAG' to switch to the simple pipeline:

  ```bash
  systemPrompt = await doRAG(chatLog, userId, ragType = 'simpleRAG');
  ```

---

## Viewing Logs

While the backend is running, whenever you interact with the recommender chatbot, you can check the terminal output. You should see lines like:

  ```bash
    RAG TYPE: MULTIQUERY
  ..
  <system prompt details>
  ```

or

 ```bash
    RAG TYPE: SIMPLE
  ..
  <system prompt details>
  ```

This log output helps confirm which pipeline the system is using and also prints out the exact system prompts (which include the relevant text retrieved from articles).

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