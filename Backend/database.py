import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Connecting to MongoDB
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))

#Database
db = client[os.getenv("MONGO_DB_NAME", "feedback_db")]

#Collections
feedback_collection = db["feedbacks"]
users_collection = db["users"] #Stores authentication details

