import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/labdb")
client = AsyncIOMotorClient(MONGO_URI)
db = client.labdb
collection = db.lab_reports
