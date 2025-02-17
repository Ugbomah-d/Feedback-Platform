from pymongo import MongoClient

#Connecting to mongoDB 
client = MongoClient('mongodb://localhost:27017/')

#Database
db = client["feedback_db"]

#Collections
feedback_collection = db["feedbacks"]
users_collection = db["users"] #Stores authentication details

