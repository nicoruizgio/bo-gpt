import openai
import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import json
import tiktoken
import psycopg2
import ast
import math
from psycopg2.extras import execute_values

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")  # Load API Key

def num_tokens_from_string(string: str, encoding_name = "cl100k_base") -> int:
    if not string:
        return 0
    # Returns the number of tokens in a text string
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

def get_embedding_cost(num_tokens):
    return num_tokens/1000*0.0002


# RSS feed URL
rss_links = [
    "https://www.waz.de/rss",
    "https://www.waz.de/lokales/bochum/rss",
    "https://www1.wdr.de/nachrichten/ruhrgebiet/uebersicht-ruhrgebiet-100.feed",
    "https://www.waz.de/sport/lokalsport/bochum/rss",
    "https://www.waz.de/lokales/bochum/blaulicht-bochum/rss",
    "https://www.waz.de/sport/vfl-bochum/rss",
    "https://www.ruhrnachrichten.de/feed/",
    "https://hallobo.de/feed/",
    "https://www.bochum.de/neu/BODirector.nsf/DIRECTOR.xsp?qname=RSS_Pressemeldungen&q=2_&type=3&lg=DE"
]

all_articles = []
# Parse the RSS feed
for rss_url in rss_links:
    feed = feedparser.parse(rss_url)
    for entry in feed.entries:
        # Convert date to Unix timestamp
        if "published" in entry:
            try:
                dt = parser.parse(entry.published)  # Auto-detect and parse date
                published_unix = int(dt.timestamp())  # Convert to Unix timestamp
            except Exception as e:
                print(f"Error parsing date: {entry.published} -> {e}")
                published_unix = None  # Handle parsing errors
        else:
            published_unix = None  # If no published date
        
        # Skip articles without a summary
        summary_text = entry.get("summary")
        if not summary_text or summary_text.strip() == "":
            print(f"Skipping article without summary: {entry.title}")
            continue
        else:
            summary = entry["summary"]

        all_articles.append({
            "title": entry.title,
            "url": entry.link,
            "date": published_unix,
            "summary": summary_text
        })


# Create a DataFrame
df = pd.DataFrame(all_articles)

new_list = []

for i in range(len(df.index)):
    text = df['summary'][i]
    token_len = num_tokens_from_string(text)
    if token_len > 512:
        new_list.append([df['title'][i], df['url'][i], df['date'][i], df['summary'][i],token_len])
    else:
        # add content to the new list in chunks
        start = 0
        ideal_token_size = 512
        # 1 token ~ 3/4 of a word
        ideal_size = int(ideal_token_size // (4/3))
        end = ideal_size
        #split text by spaces into words
        words = text.split()

        #remove empty spaces
        words = [x for x in words if x != ' ']

        total_words = len(words)
        
        #calculate iterations
        chunks = total_words // ideal_size
        if total_words % ideal_size != 0:
            chunks += 1
        
        new_content = []
        for j in range(chunks):
            if end > total_words:
                end = total_words
            new_content = words[start:end]
            new_content_string = ' '.join(new_content)
            new_content_token_len = num_tokens_from_string(new_content_string)
            if new_content_token_len > 0:
                new_list.append([df['title'][i], new_content_string, df['url'][i], new_content_token_len])
            start += ideal_size
            end += ideal_size



def get_embeddings(text):
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input = text.replace("\n", " ") 
    )
    return response.data[0].embedding



for i in range(len(new_list)):
   text = new_list[i][1]
   embedding = get_embeddings(text)
   new_list[i].append(embedding)

df_new = pd.DataFrame(new_list, columns = ['title', 'summary', 'url', 'date', 'token_len', 'embedding'])