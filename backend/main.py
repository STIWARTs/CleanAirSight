from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
import logging
from contextlib import asynccontextmanager

from config import settings
from database import db
from data_ingestion.tempo_client import TEMPOClient
from data_ingestion.ground_client import GroundSensorClient
from data_ingestion.weather_client import WeatherClient
from data_processing.harmonizer import DataHarmonizer
from data_processing.validator import DataValidator
from ml.forecasting_engine import ForecastingEngine
from scheduler import DataScheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting CleanAirSight API...")
    await db.connect_db()
    
    # Initialize scheduler for automated data collection
    scheduler = DataScheduler(
        tempo_client=TEMPOClient(
            settings.nasa_earthdata_username,
            settings.nasa_earthdata_password
        ),
        ground_client=GroundSensorClient(
            settings.openaq_api_key,
            settings.airnow_api_key
        ),
        weather_client=WeatherClient(settings.openweather_api_key),
        db=db.get_db()
    )
    
    # Start background scheduler
    scheduler.start()
    app.state.scheduler = scheduler
    
    logger.info("CleanAirSight API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CleanAirSight API...")
    scheduler.stop()
    await db.close_db()
    logger.info("CleanAirSight API shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="CleanAirSight API",
    description="Real-time air quality monitoring and forecasting using NASA TEMPO satellite data",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
harmonizer = DataHarmonizer()
validator = DataValidator(discrepancy_threshold=settings.discrepancy_threshold)
forecasting_engine = ForecastingEngine()


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "CleanAirSight API",
        "version": "1.0.0",
        "description": "Real-time air quality monitoring and forecasting",
        "endpoints": {
            "current": "/api/current",
            "forecast": "/api/forecast",
            "map": "/api/map",
            "historical": "/api/historical",
            "validation": "/api/validation"
        }
    }


@app.get("/api/current")
async def get_current_aqi(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    pollutant: Optional[str] = Query(None, description="Pollutant type (PM2.5, PM10, O3, NO2)")
):
    """
    Get current AQI for a specific location.
    
    Returns latest air quality data from harmonized sources.
    """
    try:
        query = {}
        
        # Build query based on parameters
        if city:
            query["city"] = {"$regex": city, "$options": "i"}
        
        if lat is not None and lon is not None:
            # Find locations within ~10km radius
            query["lat"] = {"$gte": lat - 0.1, "$lte": lat + 0.1}
            query["lon"] = {"$gte": lon - 0.1, "$lte": lon + 0.1}
        
        if pollutant:
            query["pollutant_type"] = pollutant
        
        # Get latest data from last 2 hours
        two_hours_ago = datetime.utcnow() - timedelta(hours=2)
        query["timestamp"] = {"$gte": two_hours_ago.isoformat()}
        
        # Fetch from database
        cursor = db.get_db().harmonized_data.find(query).sort("timestamp", -1).limit(100)
        results = await cursor.to_list(length=100)
        
        if not results:
            # Return demo data if database is empty (for testing)
            logger.warning("No data in database, returning demo data")
            demo_data = [
                {
                    "timestamp": datetime.utcnow().isoformat(),
                    "city": city or "Los Angeles",
                    "lat": lat or 34.0522,
                    "lon": lon or -118.2437,
                    "pollutant_type": "PM2.5",
                    "value": 18.5,
                    "aqi": 64,
                    "aqi_category": "Moderate",
                    "source": "Demo"
                }
            ]
            return {"success": True, "data": demo_data, "count": len(demo_data), "note": "Demo data - backend is collecting real data"}
        
        # Calculate AQI for each result
        for result in results:
            aqi_info = harmonizer.calculate_aqi(
                result.get("pollutant_type"),
                result.get("value")
            )
            result["aqi"] = aqi_info.get("aqi")
            result["aqi_category"] = aqi_info.get("category")
            result.pop("_id", None)  # Remove MongoDB ID
        
        # Group by pollutant and get latest for each
        pollutant_latest = {}
        for result in results:
            p_type = result.get("pollutant_type")
            if p_type not in pollutant_latest:
                pollutant_latest[p_type] = result
        
        # Calculate overall AQI (maximum of all pollutants)
        overall_aqi = max([r.get("aqi", 0) for r in pollutant_latest.values()])
        overall_category = harmonizer.calculate_aqi("PM2.5", 0).get("category")
        
        for aqi_val, category in [(50, "Good"), (100, "Moderate"), (150, "Unhealthy for Sensitive Groups"), 
                                    (200, "Unhealthy"), (300, "Very Unhealthy"), (500, "Hazardous")]:
            if overall_aqi <= aqi_val:
                overall_category = category
                break
        
        return {
            "location": {
                "city": city or results[0].get("city", "Unknown"),
                "lat": lat or results[0].get("lat"),
                "lon": lon or results[0].get("lon")
            },
            "timestamp": results[0].get("timestamp"),
            "overall_aqi": overall_aqi,
            "overall_category": overall_category,
            "pollutants": list(pollutant_latest.values()),
            "data_sources": list(set([r.get("source") for r in results]))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching current AQI: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/forecast")
async def get_forecast(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    hours: int = Query(24, description="Forecast horizon in hours", ge=1, le=72)
):
    """
    Get air quality forecast for next N hours.
    
    Returns ML-based predictions for air quality.
    """
    try:
        query = {}
        
        if city:
            query["city"] = {"$regex": city, "$options": "i"}
        
        if lat is not None and lon is not None:
            query["lat"] = {"$gte": lat - 0.1, "$lte": lat + 0.1}
            query["lon"] = {"$gte": lon - 0.1, "$lte": lon + 0.1}
        
        # Check if we have recent forecasts
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        query["generated_at"] = {"$gte": one_hour_ago.isoformat()}
        
        cursor = db.get_db().forecasts.find(query).sort("timestamp", 1).limit(hours * 10)
        cached_forecasts = await cursor.to_list(length=hours * 10)
        
        if cached_forecasts:
            # Return cached forecasts
            for forecast in cached_forecasts:
                forecast.pop("_id", None)
            
            return {
                "location": {
                    "city": city or cached_forecasts[0].get("city", "Unknown"),
                    "lat": lat or cached_forecasts[0].get("lat"),
                    "lon": lon or cached_forecasts[0].get("lon")
                },
                "generated_at": cached_forecasts[0].get("generated_at"),
                "forecast_hours": hours,
                "forecasts": cached_forecasts[:hours * 4],  # Multiple pollutants
                "model_info": {
                    "type": "ensemble",
                    "confidence": "medium"
                }
            }
        
        # If no cached forecasts, return a message
        raise HTTPException(
            status_code=404, 
            detail="No recent forecasts available. Model training in progress."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/map")
async def get_map_data(
    bbox: Optional[str] = Query(
        None, 
        description="Bounding box as 'min_lon,min_lat,max_lon,max_lat'"
    ),
    pollutant: Optional[str] = Query(None, description="Filter by pollutant type")
):
    """
    Get air quality data formatted for map visualization (GeoJSON).
    
    Returns data points with coordinates and AQI values.
    """
    try:
        query = {}
        
        # Parse bounding box
        if bbox:
            try:
                min_lon, min_lat, max_lon, max_lat = map(float, bbox.split(","))
                query["lat"] = {"$gte": min_lat, "$lte": max_lat}
                query["lon"] = {"$gte": min_lon, "$lte": max_lon}
            except:
                raise HTTPException(status_code=400, detail="Invalid bbox format")
        else:
            # Default to continental US
            query["lat"] = {"$gte": 25, "$lte": 50}
            query["lon"] = {"$gte": -125, "$lte": -65}
        
        if pollutant:
            query["pollutant_type"] = pollutant
        
        # Get recent data (last hour)
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        query["timestamp"] = {"$gte": one_hour_ago.isoformat()}
        
        cursor = db.get_db().harmonized_data.find(query).limit(5000)
        results = await cursor.to_list(length=5000)
        
        # Convert to GeoJSON format
        features = []
        for result in results:
            aqi_info = harmonizer.calculate_aqi(
                result.get("pollutant_type"),
                result.get("value")
            )
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [result.get("lon"), result.get("lat")]
                },
                "properties": {
                    "pollutant_type": result.get("pollutant_type"),
                    "value": result.get("value"),
                    "aqi": aqi_info.get("aqi"),
                    "category": aqi_info.get("category"),
                    "timestamp": result.get("timestamp"),
                    "source": result.get("source"),
                    "city": result.get("city")
                }
            })
        
        geojson = {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "count": len(features),
                "bbox": bbox
            }
        }
        
        return geojson
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating map data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/historical")
async def get_historical_data(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    pollutant: Optional[str] = Query(None, description="Pollutant type"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    limit: int = Query(1000, description="Maximum number of records", le=10000)
):
    """
    Get historical air quality data.
    """
    try:
        query = {}
        
        if city:
            query["city"] = {"$regex": city, "$options": "i"}
        
        if lat is not None and lon is not None:
            query["lat"] = {"$gte": lat - 0.1, "$lte": lat + 0.1}
            query["lon"] = {"$gte": lon - 0.1, "$lte": lon + 0.1}
        
        if pollutant:
            query["pollutant_type"] = pollutant
        
        # Date range
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date
            if end_date:
                query["timestamp"]["$lte"] = end_date
        
        cursor = db.get_db().harmonized_data.find(query).sort("timestamp", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Clean up results
        for result in results:
            result.pop("_id", None)
            aqi_info = harmonizer.calculate_aqi(
                result.get("pollutant_type"),
                result.get("value")
            )
            result["aqi"] = aqi_info.get("aqi")
        
        return {
            "count": len(results),
            "data": results
        }
        
    except Exception as e:
        logger.error(f"Error fetching historical data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/validation")
async def get_validation_report():
    """
    Get data validation and quality report.
    
    Returns comparison between TEMPO satellite and ground sensor data.
    """
    try:
        # Get recent validation results
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        
        cursor = db.get_db().validation_results.find({
            "timestamp": {"$gte": one_day_ago.isoformat()}
        }).limit(1000)
        
        validation_results = await cursor.to_list(length=1000)
        
        if not validation_results:
            return {
                "message": "No validation data available",
                "report": {}
            }
        
        # Clean up results
        for result in validation_results:
            result.pop("_id", None)
        
        # Generate quality report
        report = validator.generate_quality_report(validation_results)
        
        return {
            "report": report,
            "sample_validations": validation_results[:10]
        }
        
    except Exception as e:
        logger.error(f"Error generating validation report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/trigger-update")
async def trigger_data_update(background_tasks: BackgroundTasks):
    """
    Manually trigger data collection and processing.
    """
    try:
        background_tasks.add_task(run_data_collection)
        return {
            "status": "triggered",
            "message": "Data collection started in background"
        }
    except Exception as e:
        logger.error(f"Error triggering update: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def run_data_collection():
    """Background task to collect and process data"""
    try:
        logger.info("Starting manual data collection...")
        
        # This would be called by the scheduler
        # Implementation would fetch data from all sources
        
        logger.info("Data collection completed")
    except Exception as e:
        logger.error(f"Error in data collection: {e}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        await db.get_db().command("ping")
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
