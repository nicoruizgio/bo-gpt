import os
from dotenv import load_dotenv
import psycopg2
from openai import OpenAI
from datetime import datetime

load_dotenv()

client = OpenAI(
    api_key=os.environ.get('OPENAI_API_KEY')
)

def get_time():
  current_time = int(datetime.utcnow().timestamp())
  return f"Today's date: {current_time}"

def get_openai_embedding(text, model="text-embedding-ada-002"):
    """
    Generate an embedding for the given text using OpenAI's embedding API.
    """
    try:
      response = client.embeddings.create(
      model="text-embedding-ada-002",
      input=text.replace("\n", " ")
      )
      return response.data[0].embedding
    except Exception as e:
      print('Error generating embedding')
      return None

def get_db_connection():
    """Establish and return a database connection."""
    return psycopg2.connect(
        dbname=os.environ['POSTGRES_DB'],
        user=os.environ['POSTGRES_USER'],
        password=os.environ['POSTGRES_PASSWORD'],
        host=os.environ['POSTGRES_HOST'],
    )

def vector_search(query,db, top_k=5):
  try:
    conn = db
    cur = conn.cursor()

    vector_str = "[" + ", ".join(map(str, query)) + "]"
    sql = f"""
        SELECT id, title, summary, link, published_unix, embedding <=> '{vector_str}'::vector AS distance
        FROM rss_embeddings
        ORDER BY embedding <=> '{vector_str}'::vector
        LIMIT {top_k};
        """

    cur.execute(sql)
    results = cur.fetchall()
    cur.close()
    conn.close()
    return results
  except Exception as e:
    print('Error connecting to the db or executing query')


def main():
  user_input = input('Enter your query: ')
  query = user_input + ' ' + get_time()
  print(query)
  query = get_openai_embedding(user_input)
  if query is None:
    print('Failed to generate embedding')
    return

  db = get_db_connection()

  results = vector_search(query,db)

  print("\nTop results")
  for row in results:
    doc_id, title, summary,link, date, distance= row
    print(f"""
        id: {doc_id}
        title: {title}
        summary: {summary},
        link: {link}
        date: {date}
        distance: {distance}



          """)

if __name__ == "__main__":
    main()