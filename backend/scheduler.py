from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging
from typing import Optional

from data_ingestion.tempo_client import TEMPOClient
from data_ingestion.ground_client import GroundSensorClient
from data_ingestion.weather_client import WeatherClient
from data_processing.harmonizer import DataHarmonizer
from data_processing.validator import DataValidator
from ml.forecasting_engine import ForecastingEngine
from config import settings

logger = logging.getLogger(__name__)


class DataScheduler:
    """
    Automated scheduler for data collection, processing, and forecasting.
    Runs background jobs at configured intervals.
    """
    
    def __init__(
        self,
        tempo_client: TEMPOClient,
        ground_client: GroundSensorClient,
        weather_client: WeatherClient,
        db
    ):
        self.tempo_client = tempo_client
        self.ground_client = ground_client
        self.weather_client = weather_client
        self.db = db
        
        self.harmonizer = DataHarmonizer()
        self.validator = DataValidator(settings.discrepancy_threshold)
        self.forecasting_engine = ForecastingEngine()
        
        self.scheduler = AsyncIOScheduler()
        
    def start(self):
        """Start all scheduled jobs"""
        logger.info("Starting data collection scheduler...")
        
        # Job 1: Fetch TEMPO satellite data (every hour)
        self.scheduler.add_job(
            self.fetch_tempo_data,
            trigger=IntervalTrigger(minutes=settings.tempo_refresh_interval),
            id="fetch_tempo",
            name="Fetch TEMPO satellite data",
            replace_existing=True
        )
        
        # Job 2: Fetch ground sensor data (every 15 minutes)
        self.scheduler.add_job(
            self.fetch_ground_data,
            trigger=IntervalTrigger(minutes=settings.ground_refresh_interval),
            id="fetch_ground",
            name="Fetch ground sensor data",
            replace_existing=True
        )
        
        # Job 3: Fetch weather data (every hour)
        self.scheduler.add_job(
            self.fetch_weather_data,
            trigger=IntervalTrigger(minutes=settings.weather_refresh_interval),
            id="fetch_weather",
            name="Fetch weather data",
            replace_existing=True
        )
        
        # Job 4: Harmonize and validate data (every 30 minutes)
        self.scheduler.add_job(
            self.harmonize_and_validate,
            trigger=IntervalTrigger(minutes=30),
            id="harmonize_validate",
            name="Harmonize and validate data",
            replace_existing=True
        )
        
        # Job 5: Generate forecasts (every 2 hours)
        self.scheduler.add_job(
            self.generate_forecasts,
            trigger=IntervalTrigger(hours=2),
            id="generate_forecasts",
            name="Generate ML forecasts",
            replace_existing=True
        )
        
        # Job 6: Retrain models (every 24 hours)
        self.scheduler.add_job(
            self.retrain_models,
            trigger=IntervalTrigger(hours=settings.model_retrain_interval_hours),
            id="retrain_models",
            name="Retrain ML models",
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("Scheduler started successfully")
        
        # Run initial data fetch
        self.scheduler.add_job(
            self.initial_data_fetch,
            id="initial_fetch",
            name="Initial data fetch"
        )
    
    def stop(self):
        """Stop the scheduler"""
        logger.info("Stopping scheduler...")
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")
    
    async def initial_data_fetch(self):
        """Initial data fetch on startup"""
        logger.info("Running initial data fetch...")
        try:
            await self.fetch_ground_data()
            await self.fetch_weather_data()
            # TEMPO data may not be immediately available
            # await self.fetch_tempo_data()
        except Exception as e:
            logger.error(f"Error in initial data fetch: {e}")
    
    async def fetch_tempo_data(self):
        """Fetch TEMPO satellite data"""
        logger.info("Fetching TEMPO satellite data...")
        try:
            pollutants = ["NO2", "O3", "HCHO"]
            
            for pollutant in pollutants:
                data = await self.tempo_client.fetch_tempo_data(pollutant=pollutant)
                
                if data:
                    # Save raw data
                    await self.tempo_client.save_raw_data(data)
                    
                    # Store in database
                    await self.db.raw_tempo.insert_many(data)
                    
                    logger.info(f"Stored {len(data)} TEMPO {pollutant} records")
                else:
                    logger.warning(f"No TEMPO data retrieved for {pollutant}")
            
        except Exception as e:
            logger.error(f"Error fetching TEMPO data: {e}")
    
    async def fetch_ground_data(self):
        """Fetch ground sensor data"""
        logger.info("Fetching ground sensor data...")
        try:
            # Major US cities for focused data collection
            cities = [
                "Los Angeles", "New York", "Chicago", "Houston", 
                "Phoenix", "Philadelphia", "San Antonio", "San Diego",
                "Dallas", "San Jose", "Austin", "Jacksonville"
            ]
            
            all_data = []
            
            for city in cities:
                data = await self.ground_client.fetch_all_ground_data(city=city)
                all_data.extend(data)
            
            if all_data:
                # Save raw data
                await self.ground_client.save_raw_data(all_data)
                
                # Store in database
                await self.db.raw_ground.insert_many(all_data)
                
                logger.info(f"Stored {len(all_data)} ground sensor records")
            else:
                logger.warning("No ground sensor data retrieved")
            
        except Exception as e:
            logger.error(f"Error fetching ground data: {e}")
    
    async def fetch_weather_data(self):
        """Fetch weather data"""
        logger.info("Fetching weather data...")
        try:
            # Major US cities with coordinates
            cities = [
                {"name": "Los Angeles", "lat": 34.05, "lon": -118.25},
                {"name": "New York", "lat": 40.71, "lon": -74.01},
                {"name": "Chicago", "lat": 41.88, "lon": -87.63},
                {"name": "Houston", "lat": 29.76, "lon": -95.37},
                {"name": "Phoenix", "lat": 33.45, "lon": -112.07},
                {"name": "Philadelphia", "lat": 39.95, "lon": -75.17},
                {"name": "San Antonio", "lat": 29.42, "lon": -98.49},
                {"name": "San Diego", "lat": 32.72, "lon": -117.16},
                {"name": "Dallas", "lat": 32.78, "lon": -96.80},
                {"name": "San Jose", "lat": 37.34, "lon": -121.89}
            ]
            
            data = await self.weather_client.fetch_weather_for_cities(cities)
            
            if data:
                # Save raw data
                await self.weather_client.save_raw_data(data)
                
                # Store in database
                await self.db.raw_weather.insert_many(data)
                
                logger.info(f"Stored {len(data)} weather records")
            else:
                logger.warning("No weather data retrieved")
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
    
    async def harmonize_and_validate(self):
        """Harmonize data from all sources and validate"""
        logger.info("Harmonizing and validating data...")
        try:
            # Fetch recent raw data from last 2 hours
            recent_time = datetime.utcnow().isoformat()
            
            # Get raw data
            tempo_cursor = self.db.raw_tempo.find({
                "timestamp": {"$gte": recent_time}
            }).limit(10000)
            tempo_data = await tempo_cursor.to_list(length=10000)
            
            ground_cursor = self.db.raw_ground.find({
                "timestamp": {"$gte": recent_time}
            }).limit(10000)
            ground_data = await ground_cursor.to_list(length=10000)
            
            weather_cursor = self.db.raw_weather.find({
                "timestamp": {"$gte": recent_time}
            }).limit(1000)
            weather_data = await weather_cursor.to_list(length=1000)
            
            # Harmonize
            harmonized = self.harmonizer.harmonize_all_data(
                tempo_data,
                ground_data,
                weather_data
            )
            
            if harmonized:
                # Store harmonized data
                await self.db.harmonized_data.insert_many(harmonized)
                logger.info(f"Stored {len(harmonized)} harmonized records")
                
                # Validate TEMPO vs ground
                if tempo_data and ground_data:
                    validation_results = self.validator.validate_against_ground(
                        tempo_data,
                        ground_data
                    )
                    
                    if validation_results:
                        await self.db.validation_results.insert_many(validation_results)
                        logger.info(f"Stored {len(validation_results)} validation results")
            
        except Exception as e:
            logger.error(f"Error in harmonization and validation: {e}")
    
    async def generate_forecasts(self):
        """Generate ML-based forecasts"""
        logger.info("Generating forecasts...")
        try:
            # Get recent harmonized data
            cursor = self.db.harmonized_data.find({}).sort("timestamp", -1).limit(10000)
            recent_data = await cursor.to_list(length=10000)
            
            if not recent_data:
                logger.warning("No data available for forecasting")
                return
            
            # Prepare features
            import pandas as pd
            df = pd.DataFrame(recent_data)
            features = self.forecasting_engine.prepare_features(recent_data)
            
            # Generate forecasts for each pollutant
            pollutants = ["PM2.5", "PM10", "O3", "NO2"]
            all_forecasts = []
            
            for pollutant in pollutants:
                try:
                    forecasts = self.forecasting_engine.predict_forecast(
                        features,
                        pollutant,
                        horizon_hours=settings.forecast_horizon_hours
                    )
                    
                    # Add metadata
                    for forecast in forecasts:
                        forecast["generated_at"] = datetime.utcnow().isoformat()
                    
                    all_forecasts.extend(forecasts)
                    logger.info(f"Generated {len(forecasts)} forecasts for {pollutant}")
                    
                except Exception as e:
                    logger.warning(f"Could not generate forecast for {pollutant}: {e}")
            
            if all_forecasts:
                # Store forecasts
                await self.db.forecasts.insert_many(all_forecasts)
                logger.info(f"Stored {len(all_forecasts)} total forecasts")
            
        except Exception as e:
            logger.error(f"Error generating forecasts: {e}")
    
    async def retrain_models(self):
        """Retrain ML models with latest data"""
        logger.info("Retraining ML models...")
        try:
            # Get historical data for training
            cursor = self.db.harmonized_data.find({}).sort("timestamp", -1).limit(50000)
            training_data = await cursor.to_list(length=50000)
            
            if len(training_data) < 1000:
                logger.warning("Insufficient data for model training")
                return
            
            # Prepare features
            import pandas as pd
            features = self.forecasting_engine.prepare_features(training_data)
            
            # Train models for each pollutant
            pollutants = ["PM2.5", "PM10", "O3", "NO2"]
            
            for pollutant in pollutants:
                try:
                    metrics = self.forecasting_engine.train_model(
                        features,
                        pollutant,
                        model_type="xgboost"
                    )
                    
                    logger.info(f"Trained model for {pollutant}: {metrics}")
                    
                    # Store training metrics
                    await self.db.model_metrics.insert_one({
                        "timestamp": datetime.utcnow().isoformat(),
                        "pollutant": pollutant,
                        "metrics": metrics
                    })
                    
                except Exception as e:
                    logger.warning(f"Could not train model for {pollutant}: {e}")
            
        except Exception as e:
            logger.error(f"Error retraining models: {e}")


# For testing
if __name__ == "__main__":
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    
    async def test_scheduler():
        # Connect to database
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client.get_default_database()
        
        # Create clients
        tempo_client = TEMPOClient(
            settings.nasa_earthdata_username,
            settings.nasa_earthdata_password
        )
        ground_client = GroundSensorClient(
            settings.openaq_api_key,
            settings.airnow_api_key
        )
        weather_client = WeatherClient(settings.openweather_api_key)
        
        # Create scheduler
        scheduler = DataScheduler(
            tempo_client,
            ground_client,
            weather_client,
            db
        )
        
        # Start scheduler
        scheduler.start()
        
        # Keep running
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            scheduler.stop()
    
    asyncio.run(test_scheduler())
