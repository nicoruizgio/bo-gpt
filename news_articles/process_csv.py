import os
import openai
import pandas as pd
import psycopg2
from dotenv import load_dotenv
from datetime import datetime
import tiktoken  # For token counting and truncation

# Load environment variables from .env file
load_dotenv()

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME") or "pgvector_db",
    user=os.getenv("DB_USER") or "postgres",
    password=os.getenv("DB_PASSWORD") or "mysecretpassword",
    host=os.getenv("DB_HOST") or "localhost",
    port=os.getenv("DB_PORT") or "5433"
)
cursor = conn.cursor()

# Load CSV data
df = pd.read_csv("news_dataset.csv")

# Function to truncate text to a maximum token limit using tiktoken.
def truncate_text_to_token_limit(text, max_tokens=8000, model="text-embedding-ada-002"):
    try:
        encoding = tiktoken.encoding_for_model(model)
    except Exception:
        # Fallback to a base encoding if the model isn't found
        encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    if len(tokens) > max_tokens:
        tokens = tokens[:max_tokens]
        text = encoding.decode(tokens)
    return text

# Batch size for API calls (you can adjust this)
BATCH_SIZE = 20

# Prepare a list to hold the rows to process
rows_data = []

for index, row in df.iterrows():
    try:
        # Convert all fields to string, providing defaults if needed
        message_id = str(row.get("message_id", ""))
        title = str(row.get("title", ""))
        sender = str(row.get("sender", ""))
        link = str(row.get("link", ""))
        text_content = str(row.get("text", ""))
        image_url = str(row.get("enclosure", ""))  # Using 'enclosure' for the image URL
        created_date = str(row.get("createddate", ""))
        
        # Combine title and text_content to form the embedding input.
        embedding_input = f"{title} {text_content}"
        # Truncate the embedding_input to 8000 tokens if necessary.
        embedding_input = truncate_text_to_token_limit(embedding_input, max_tokens=8000)
        
        # Append the row's data (including the embedding input) to our list.
        rows_data.append({
            "index": index,
            "message_id": message_id,
            "title": title,
            "sender": sender,
            "link": link,
            "created_date": created_date,
            "text_content": text_content,
            "image_url": image_url,
            "embedding_input": embedding_input
        })
    except Exception as e:
        print(f"Skipping row {index} during data preparation: {e}")
        continue

# Process the rows in batches
for i in range(0, len(rows_data), BATCH_SIZE):
    batch = rows_data[i:i+BATCH_SIZE]
    batch_inputs = [row["embedding_input"] for row in batch]
    
    # Generate embeddings for the entire batch in one API call
    try:
        response = openai.Embedding.create(
            input=batch_inputs,
            model="text-embedding-ada-002"
        )
        embeddings_data = response["data"]  # This is a list of dicts
    except Exception as e:
        print(f"Skipping batch starting at row {i}: embedding generation failed with error: {e}")
        continue
    
    # Loop over the batch and insert each row into the database
    for j, row_data in enumerate(batch):
        try:
            embedding = embeddings_data[j]["embedding"]
            cursor.execute(
                """
                INSERT INTO news_articles_flexible 
                (message_id, title, sender, link, created_date, text, image_url, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    row_data["message_id"],
                    row_data["title"],
                    row_data["sender"],
                    row_data["link"],
                    row_data["created_date"],
                    row_data["text_content"],
                    row_data["image_url"],
                    embedding
                )
            )
            # Print a statement indicating this row was processed
            print(f"Processed row #{row_data['index']}")
        except Exception as e:
            print(f"Error inserting row {row_data['index']}: {e}")
            continue

# Commit the transaction and close the connection
conn.commit()
cursor.close()
conn.close()
