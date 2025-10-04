from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_uri)
            cls.db = cls.client.get_default_database()
            
            # Create indexes
            await cls.db.harmonized_data.create_index([("timestamp", -1)])
            await cls.db.harmonized_data.create_index([("location", "2dsphere")])
            await cls.db.harmonized_data.create_index([("pollutant_type", 1)])
            
            await cls.db.forecasts.create_index([("timestamp", -1)])
            await cls.db.forecasts.create_index([("city", 1)])
            
            await cls.db.raw_tempo.create_index([("timestamp", -1)])
            await cls.db.raw_ground.create_index([("timestamp", -1)])
            await cls.db.raw_weather.create_index([("timestamp", -1)])
            
            # Email subscribers indexes
            await cls.db.subscribers.create_index([("email", 1)], unique=True)
            await cls.db.subscribers.create_index([("subscription_status", 1)])
            await cls.db.subscribers.create_index([("location.city", 1)])
            
            # Citizen reports indexes
            await cls.db.citizen_reports.create_index([("timestamp", -1)])
            await cls.db.citizen_reports.create_index([("location", "2dsphere")])
            await cls.db.citizen_reports.create_index([("type", 1)])
            await cls.db.citizen_reports.create_index([("status", 1)])
            
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        return cls.db


# Database instance
db = Database()
