--- Add pgvector extension
CREATE EXTENSION vector;

-- Create Participants Table
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Ratings Table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participants(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questionnaire table
CREATE TABLE questionnaire_responses (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  age INTEGER,
  gender VARCHAR(255),
  location VARCHAR(20),
  news_consumption_frequency VARCHAR(255),
  education VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Old stuff?
CREATE TABLE news_articles_flexible (
    id SERIAL PRIMARY KEY,
    message_id TEXT,
    title TEXT,
    sender TEXT,
    link TEXT,
    created_date TEXT,
    text TEXT,
    image_url TEXT,
    embedding VECTOR(1536)
);

-- Create chat context (list of news articles to rate and base prompt for rating and recommender screens)
CREATE TABLE chat_contexts (
    id SERIAL PRIMARY KEY,
    screen_name VARCHAR(255) UNIQUE NOT NULL,
    system_prompt TEXT NOT NULL,
    news_for_rating TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


--- create articles vector db
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE rss_embeddings (
    id SERIAL PRIMARY KEY,
    title TEXT,
    link TEXT,
    summary TEXT,
    published_unix BIGINT,
    embedding VECTOR(1536)
);
