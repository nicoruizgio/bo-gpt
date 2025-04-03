
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


-- Create conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  conversation_type VARCHAR(20) NOT NULL CHECK (conversation_type IN ('rating','recommender')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
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


--- questionnaire view
CREATE VIEW participant_profiles AS
SELECT
  p.id AS participant_id,
  p.username,
  q.age,
  q.gender,
  q.location,
  q.education,
  q.news_consumption_frequency,
  COUNT(DISTINCT c.id) AS num_conversations,
  COUNT(m.id) AS num_messages
FROM participants p
LEFT JOIN questionnaire_responses q ON p.id = q.participant_id
LEFT JOIN conversations c ON p.id = c.participant_id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY p.id, q.age, q.gender, q.location, q.education, q.news_consumption_frequency;


--- conversation view
CREATE VIEW conversation_history AS
SELECT
  c.id AS conversation_id,
  p.username,
  c.conversation_type,
  m.role,
  m.message,
  m.sent_at
FROM conversations c
JOIN participants p ON c.participant_id = p.id
JOIN messages m ON m.conversation_id = c.id
ORDER BY c.id, m.sent_at;


--- delete all conversations and restore id
TRUNCATE conversations RESTART IDENTITY CASCADE;

