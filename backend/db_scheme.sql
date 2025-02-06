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


CREATE TABLE news_articles_flexible (
    id SERIAL PRIMARY KEY,
    message_id TEXT,         -- now stored as text, not BIGINT
    title TEXT,
    sender TEXT,
    link TEXT,
    created_date TEXT,       -- store date/time as text for flexibility
    text TEXT,
    image_url TEXT,          -- renamed from enclosure to image_url for clarity
    embedding VECTOR(1536)   -- remains unchanged (used for vector search)
);
