from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from typing import List, Optional
from datetime import datetime, timedelta
import logging
from contextlib import asynccontextmanager
import asyncio
import os

from config import settings
from database import db
from data_ingestion.tempo_client import TEMPOClient
from data_ingestion.ground_client import GroundSensorClient
from data_ingestion.weather_client import WeatherClient
from data_processing.harmonizer import DataHarmonizer
from data_processing.validator import DataValidator
from ml.forecasting_engine import ForecastingEngine
from scheduler import DataScheduler
from services.email_service import EmailService
from pydantic import BaseModel, EmailStr, Field

# Define subscription models inline
class SubscriptionRequest(BaseModel):
    email: EmailStr
    city: str = Field(..., min_length=2, max_length=100)
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    alert_threshold: int = Field(default=100, ge=0, le=500)
    send_time: str = Field(default="08:00")
    frequency: str = Field(default="daily")

class SubscriptionResponse(BaseModel):
    success: bool
    message: str
    subscriber_id: Optional[str] = None

class UnsubscribeResponse(BaseModel):
    success: bool
    message: str

class EmailPreviewResponse(BaseModel):
    success: bool
    html_content: str
    subject: str

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
email_service = EmailService(
    smtp_server=settings.smtp_server,
    smtp_port=settings.smtp_port
)


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


# Email Alert Subscription Endpoints

@app.post("/api/subscribe", response_model=SubscriptionResponse)
async def subscribe_to_alerts(subscription: SubscriptionRequest):
    """Subscribe to daily AQI email alerts"""
    try:
        # Check if subscriber already exists
        existing_subscriber = await db.get_db().subscribers.find_one({"email": subscription.email})
        
        if existing_subscriber:
            # Update existing subscription
            await db.get_db().subscribers.update_one(
                {"email": subscription.email},
                {
                    "$set": {
                        "location": {
                            "city": subscription.city,
                            "lat": subscription.lat,
                            "lon": subscription.lon
                        },
                        "preferences": {
                            "alert_threshold": subscription.alert_threshold,
                            "send_time": subscription.send_time,
                            "frequency": subscription.frequency
                        },
                        "subscription_status": "active",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            message = f"Updated your subscription for {subscription.city}"
        else:
            # Create new subscription
            subscriber_doc = {
                "email": subscription.email,
                "location": {
                    "city": subscription.city,
                    "lat": subscription.lat,
                    "lon": subscription.lon
                },
                "preferences": {
                    "alert_threshold": subscription.alert_threshold,
                    "send_time": subscription.send_time,
                    "frequency": subscription.frequency
                },
                "subscription_status": "active",
                "created_at": datetime.utcnow(),
                "last_sent": None
            }
            
            result = await db.get_db().subscribers.insert_one(subscriber_doc)
            message = f"Successfully subscribed to AQI alerts for {subscription.city}"
        
        # Send confirmation email
        await email_service.send_confirmation_email(subscription.email, subscription.city)
        
        return SubscriptionResponse(
            success=True,
            message=message,
            subscriber_id=str(result.inserted_id) if 'result' in locals() else None
        )
        
    except Exception as e:
        logger.error(f"Error in subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")


@app.delete("/api/unsubscribe/{email}", response_model=UnsubscribeResponse)
async def unsubscribe_from_alerts(email: str):
    """Unsubscribe from AQI email alerts"""
    try:
        result = await db.get_db().subscribers.update_one(
            {"email": email},
            {"$set": {"subscription_status": "cancelled", "cancelled_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Subscriber not found")
        
        return UnsubscribeResponse(
            success=True,
            message="Successfully unsubscribed from AQI alerts"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in unsubscription: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to unsubscribe: {str(e)}")


@app.get("/api/subscribers/preview/{email}", response_model=EmailPreviewResponse)
async def preview_alert_email(email: str):
    """Preview what the email alert will look like"""
    try:
        # Get subscriber info
        subscriber = await db.get_db().subscribers.find_one({"email": email})
        if not subscriber:
            raise HTTPException(status_code=404, detail="Subscriber not found")
        
        # Generate sample AQI data
        sample_aqi_data = {
            "city": subscriber["location"]["city"],
            "current_aqi": 85,
            "forecast_aqi": 92,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Generate email HTML
        unsubscribe_link = f"http://localhost:8000/api/unsubscribe/{email}"
        html_content = email_service.generate_email_template(sample_aqi_data, unsubscribe_link)
        
        return EmailPreviewResponse(
            success=True,
            html_content=html_content,
            subject=f"🌤️ AQI Alert: {sample_aqi_data['city']} - {sample_aqi_data['current_aqi']} (Moderate)"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating email preview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")


@app.get("/unsubscribe/{email}")
async def unsubscribe_web_page(email: str):
    """Web page for unsubscribing from email alerts"""
    try:
        # Update subscription status
        result = await db.get_db().subscribers.update_one(
            {"email": email},
            {"$set": {"subscription_status": "cancelled", "cancelled_at": datetime.utcnow()}}
        )
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Unsubscribed - CleanAirSight</title>
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }}
                .container {{ background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
                .success {{ color: #10b981; font-size: 48px; margin-bottom: 20px; }}
                h1 {{ color: #1e40af; margin-bottom: 20px; }}
                p {{ color: #6b7280; line-height: 1.6; }}
                .button {{ display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success">✅</div>
                <h1>Successfully Unsubscribed</h1>
                <p>You have been unsubscribed from CleanAirSight AQI email alerts.</p>
                <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
                <a href="http://localhost:3000" class="button">Return to CleanAirSight</a>
            </div>
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        logger.error(f"Error in web unsubscribe: {e}")
        return HTMLResponse(
            content=f"<h1>Error</h1><p>Failed to unsubscribe: {str(e)}</p>",
            status_code=500
        )


# Personalized Dashboard API Endpoints

@app.get("/api/personalized/hotspots")
async def get_pollution_hotspots(
    threshold: int = Query(100, description="AQI threshold for hotspots"),
    limit: int = Query(10, description="Maximum number of hotspots")
):
    """Get pollution hotspots for policy makers"""
    try:
        # Get recent data above threshold
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$gte": one_hour_ago.isoformat()}
                }
            },
            {
                "$group": {
                    "_id": {"lat": "$lat", "lon": "$lon", "city": "$city"},
                    "avg_value": {"$avg": "$value"},
                    "max_value": {"$max": "$value"},
                    "pollutant_type": {"$first": "$pollutant_type"},
                    "latest_timestamp": {"$max": "$timestamp"}
                }
            },
            {"$sort": {"max_value": -1}},
            {"$limit": limit}
        ]
        
        hotspots = []
        cursor = db.get_db().harmonized_data.aggregate(pipeline)
        
        async for result in cursor:
            aqi_info = harmonizer.calculate_aqi(
                result.get("pollutant_type"),
                result.get("max_value")
            )
            
            if aqi_info.get("aqi", 0) >= threshold:
                hotspots.append({
                    "location": {
                        "city": result["_id"].get("city"),
                        "lat": result["_id"].get("lat"),
                        "lon": result["_id"].get("lon")
                    },
                    "aqi": aqi_info.get("aqi"),
                    "category": aqi_info.get("category"),
                    "pollutant": result.get("pollutant_type"),
                    "value": result.get("max_value"),
                    "timestamp": result.get("latest_timestamp")
                })
        
        return {"hotspots": hotspots, "threshold": threshold}
        
    except Exception as e:
        logger.error(f"Error fetching hotspots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/personalized/health-advice")
async def get_health_advice(
    aqi: int = Query(..., description="Current AQI value"),
    user_type: str = Query("general", description="User type: sensitive, general, outdoor")
):
    """Get personalized health advice based on AQI and user type"""
    try:
        advice = {
            "aqi": aqi,
            "user_type": user_type,
            "recommendations": [],
            "mask_needed": False,
            "activity_level": "normal"
        }
        
        if user_type == "sensitive":
            # Health-sensitive individuals (lower thresholds)
            if aqi <= 50:
                advice["recommendations"] = ["Excellent air quality. Perfect for all activities."]
                advice["activity_level"] = "unrestricted"
            elif aqi <= 75:
                advice["recommendations"] = ["Good air quality. Consider limiting prolonged outdoor activities."]
                advice["activity_level"] = "light_caution"
            else:
                advice["recommendations"] = ["Stay indoors. Use air purifiers if available.", "Avoid outdoor exercise."]
                advice["mask_needed"] = True
                advice["activity_level"] = "restricted"
        else:
            # General population
            if aqi <= 100:
                advice["recommendations"] = ["Air quality is acceptable for outdoor activities."]
                advice["activity_level"] = "normal"
            elif aqi <= 150:
                advice["recommendations"] = ["Limit prolonged outdoor activities.", "Consider wearing a mask outdoors."]
                advice["activity_level"] = "moderate_caution"
                advice["mask_needed"] = True
            else:
                advice["recommendations"] = ["Avoid outdoor activities.", "Stay indoors with windows closed."]
                advice["activity_level"] = "restricted"
                advice["mask_needed"] = True
        
        return advice
        
    except Exception as e:
        logger.error(f"Error generating health advice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/personalized/route-quality")
async def get_route_air_quality(
    route_coords: str = Query(..., description="Route coordinates as lat1,lon1;lat2,lon2;...")
):
    """Get air quality along a transportation route"""
    try:
        # Parse route coordinates
        coords = []
        for coord_pair in route_coords.split(';'):
            lat, lon = map(float, coord_pair.split(','))
            coords.append({"lat": lat, "lon": lon})
        
        route_quality = []
        
        for point in coords:
            # Find nearby air quality data (within 5km)
            query = {
                "lat": {"$gte": point["lat"] - 0.05, "$lte": point["lat"] + 0.05},
                "lon": {"$gte": point["lon"] - 0.05, "$lte": point["lon"] + 0.05},
                "timestamp": {"$gte": (datetime.utcnow() - timedelta(hours=2)).isoformat()}
            }
            
            cursor = db.get_db().harmonized_data.find(query).sort("timestamp", -1).limit(5)
            results = await cursor.to_list(length=5)
            
            if results:
                # Calculate average AQI for this point
                total_aqi = 0
                count = 0
                
                for result in results:
                    aqi_info = harmonizer.calculate_aqi(
                        result.get("pollutant_type"),
                        result.get("value")
                    )
                    total_aqi += aqi_info.get("aqi", 0)
                    count += 1
                
                avg_aqi = total_aqi / count if count > 0 else 0
                
                route_quality.append({
                    "coordinates": point,
                    "aqi": round(avg_aqi),
                    "data_points": count,
                    "status": "good" if avg_aqi <= 100 else "caution" if avg_aqi <= 150 else "poor"
                })
            else:
                route_quality.append({
                    "coordinates": point,
                    "aqi": None,
                    "data_points": 0,
                    "status": "no_data"
                })
        
        # Calculate overall route assessment
        valid_points = [p for p in route_quality if p["aqi"] is not None]
        if valid_points:
            avg_route_aqi = sum(p["aqi"] for p in valid_points) / len(valid_points)
            max_route_aqi = max(p["aqi"] for p in valid_points)
        else:
            avg_route_aqi = None
            max_route_aqi = None
        
        return {
            "route_points": route_quality,
            "summary": {
                "average_aqi": round(avg_route_aqi) if avg_route_aqi else None,
                "maximum_aqi": max_route_aqi,
                "total_points": len(coords),
                "data_coverage": len(valid_points) / len(coords) * 100 if coords else 0,
                "recommendation": "proceed" if max_route_aqi and max_route_aqi <= 100 else "caution" if max_route_aqi and max_route_aqi <= 150 else "avoid"
            }
        }
        
    except Exception as e:
        logger.error(f"Error analyzing route air quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/personalized/city-leaderboard")
async def get_city_leaderboard(limit: int = Query(10, description="Number of cities to return")):
    """Get leaderboard of cities with best air quality for citizen science"""
    try:
        # Get recent data for major cities
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$gte": one_day_ago.isoformat()},
                    "city": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": "$city",
                    "avg_value": {"$avg": "$value"},
                    "data_points": {"$sum": 1},
                    "pollutant_type": {"$first": "$pollutant_type"}
                }
            },
            {"$match": {"data_points": {"$gte": 5}}},  # Cities with sufficient data
            {"$sort": {"avg_value": 1}},  # Sort by best air quality (lowest values)
            {"$limit": limit}
        ]
        
        leaderboard = []
        cursor = db.get_db().harmonized_data.aggregate(pipeline)
        
        rank = 1
        async for result in cursor:
            aqi_info = harmonizer.calculate_aqi(
                result.get("pollutant_type"),
                result.get("avg_value")
            )
            
            # Calculate trend (simplified - would need time series analysis)
            trend = "stable"  # In real implementation, compare with previous period
            
            leaderboard.append({
                "rank": rank,
                "city": result["_id"],
                "aqi": round(aqi_info.get("aqi", 0)),
                "category": aqi_info.get("category"),
                "trend": trend,
                "data_points": result.get("data_points"),
                "score": max(0, 100 - aqi_info.get("aqi", 0))  # Score out of 100
            })
            rank += 1
        
        return {"leaderboard": leaderboard, "generated_at": datetime.utcnow().isoformat()}
        
    except Exception as e:
        logger.error(f"Error generating city leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/personalized/citizen-report")
async def submit_citizen_report(
    report_type: str = Query(..., description="Report type: smoke, dust, chemical_smell, etc."),
    location: str = Query(..., description="Location description"),
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    description: str = Query(..., description="Description of observation"),
    severity: str = Query("low", description="Severity: low, moderate, high")
):
    """Submit citizen science pollution report"""
    try:
        # Store citizen report
        report = {
            "type": report_type,
            "location": {
                "description": location,
                "lat": lat,
                "lon": lon
            },
            "description": description,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending",
            "votes": 0,
            "verified": False
        }
        
        result = await db.get_db().citizen_reports.insert_one(report)
        
        return {
            "success": True,
            "report_id": str(result.inserted_id),
            "message": "Report submitted successfully. Thank you for contributing to cleaner air!"
        }
        
    except Exception as e:
        logger.error(f"Error submitting citizen report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/personalized/business-impact")
async def get_business_impact_analysis(
    business_lat: float = Query(..., description="Business location latitude"),
    business_lon: float = Query(..., description="Business location longitude"),
    days: int = Query(30, description="Analysis period in days")
):
    """Get business impact analysis for economic stakeholders"""
    try:
        # Get historical data for location
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = {
            "lat": {"$gte": business_lat - 0.01, "$lte": business_lat + 0.01},
            "lon": {"$gte": business_lon - 0.01, "$lte": business_lon + 0.01},
            "timestamp": {"$gte": start_date.isoformat()}
        }
        
        cursor = db.get_db().harmonized_data.find(query).sort("timestamp", 1)
        results = await cursor.to_list(length=10000)
        
        # Calculate business impact metrics
        high_aqi_days = 0
        total_days = days
        estimated_costs = 0
        
        daily_aqi = {}
        for result in results:
            date = result.get("timestamp", "")[:10]  # Get date part
            aqi_info = harmonizer.calculate_aqi(
                result.get("pollutant_type"),
                result.get("value")
            )
            aqi_value = aqi_info.get("aqi", 0)
            
            if date not in daily_aqi:
                daily_aqi[date] = []
            daily_aqi[date].append(aqi_value)
        
        # Calculate impact
        for date, aqi_values in daily_aqi.items():
            max_aqi = max(aqi_values)
            if max_aqi > 150:  # Unhealthy levels
                high_aqi_days += 1
                estimated_costs += 1000  # $1000 per high AQI day (simplified)
            elif max_aqi > 100:  # Moderate levels
                estimated_costs += 500   # $500 per moderate AQI day
        
        risk_score = min(100, (high_aqi_days / total_days) * 100 + (estimated_costs / 1000))
        
        return {
            "analysis_period": f"{days} days",
            "location": {"lat": business_lat, "lon": business_lon},
            "metrics": {
                "high_aqi_days": high_aqi_days,
                "estimated_cost_impact": estimated_costs,
                "risk_score": round(risk_score, 1),
                "data_points": len(results)
            },
            "recommendations": [
                "Install air filtration systems" if risk_score > 70 else "Monitor air quality trends",
                "Consider flexible work policies during high AQI days" if high_aqi_days > 5 else "Current air quality impact is manageable",
                "Review insurance coverage for air quality-related claims" if estimated_costs > 5000 else "Standard coverage appears adequate"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error analyzing business impact: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# NASA Enhanced Endpoints
@app.get("/api/nasa/air-quality")
async def get_nasa_air_quality(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    include_forecast: bool = Query(False, description="Include 24-hour forecast"),
    include_context: bool = Query(True, description="Include environmental context")
):
    """
    🛰️ Get enhanced air quality data from NASA TEMPO satellite with AI analysis
    
    This endpoint provides:
    - Real NASA TEMPO satellite data (when API keys configured)
    - Environmental context from Microsoft Planetary Computer
    - AI-powered forecasts from Azure ML
    - Enhanced weather impact analysis
    """
    try:
        from nasa_integration import nasa_services
        
        logger.info(f"🛰️ NASA air quality request for {lat}, {lon}")
        
        # Get NASA TEMPO air quality data
        air_quality_data = await nasa_services.get_nasa_air_quality(lat, lon)
        
        # Get environmental context if requested
        environmental_context = None
        if include_context:
            environmental_context = await nasa_services.get_environmental_context(lat, lon)
        
        # Get weather data with air quality impact
        weather_data = await nasa_services.get_weather_for_air_quality(lat, lon)
        
        # Get forecast if requested
        forecast_data = None
        if include_forecast:
            forecast_data = await nasa_services.get_ml_forecast(
                air_quality_data, 
                environmental_context or {}, 
                24
            )
        
        # Compile comprehensive response
        response = {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "location": {"lat": lat, "lon": lon},
            "airQuality": air_quality_data,
            "weather": weather_data,
            "environmentalContext": environmental_context,
            "forecast": forecast_data,
            "dataSource": "NASA TEMPO + Microsoft Planetary Computer + Azure ML",
            "confidence": "HIGH" if air_quality_data.get("source") == "NASA_TEMPO_SATELLITE" else "ENHANCED_SIMULATION",
            "recommendations": _generate_comprehensive_recommendations(
                air_quality_data, weather_data, environmental_context
            ),
            "metadata": {
                "api_version": "3.0.0",
                "integration_type": "nasa_enhanced", 
                "update_frequency": "10 minutes",
                "coverage": "Global with North America priority"
            }
        }
        
        logger.info(f"✅ NASA air quality data delivered for {lat}, {lon}")
        return response
        
    except Exception as e:
        logger.error(f"❌ NASA air quality error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch NASA air quality data: {str(e)}")

@app.get("/api/nasa/services-status")
async def get_nasa_services_status():
    """
    🔧 Get status of all NASA integration services
    
    Shows which services are configured and operational
    """
    try:
        from nasa_integration import nasa_services
        
        status = nasa_services.get_services_status()
        
        # Add configuration status
        config_status = {
            "nasa_tempo_api": bool(os.getenv("NASA_TEMPO_API_KEY")),
            "nasa_earthdata": bool(os.getenv("NASA_EARTHDATA_USERNAME")),
            "azure_subscription": bool(os.getenv("AZURE_SUBSCRIPTION_ID")),
            "planetary_computer": bool(os.getenv("PLANETARY_COMPUTER_KEY")),
            "meteomatics": bool(os.getenv("METEOMATICS_USERNAME")),
            "openweather": bool(os.getenv("OPENWEATHER_API_KEY"))
        }
        
        response = {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "services": status,
            "configuration": config_status,
            "overall_status": "OPERATIONAL" if status["integration_available"] else "FALLBACK_MODE",
            "recommendations": _generate_setup_recommendations(config_status),
            "next_steps": [
                "Configure missing API keys in .env file",
                "Restart service to activate real NASA data",
                "Monitor data quality and service performance"
            ]
        }
        
        return response
        
    except Exception as e:
        logger.error(f"❌ NASA services status error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to check NASA services status: {str(e)}")

def _generate_comprehensive_recommendations(air_quality_data, weather_data, environmental_context):
    """Generate comprehensive recommendations based on all data sources"""
    recommendations = []
    
    aqi = air_quality_data.get("aqi", 50)
    
    # Air quality recommendations
    if aqi > 150:
        recommendations.append({
            "type": "health_alert",
            "priority": "high",
            "message": "Unhealthy air quality detected",
            "action": "Avoid outdoor activities, keep windows closed, use air purifiers"
        })
    elif aqi > 100:
        recommendations.append({
            "type": "sensitive_groups",
            "priority": "medium", 
            "message": "Air quality may affect sensitive individuals",
            "action": "Limit prolonged outdoor activities for sensitive groups"
        })
    
    # Weather-based recommendations
    if weather_data and weather_data.get("airQualityImpact"):
        impact = weather_data["airQualityImpact"]
        if impact.get("overallImpact") == "adverse":
            recommendations.append({
                "type": "weather_impact",
                "priority": "medium",
                "message": "Weather conditions may worsen air quality",
                "action": "Monitor conditions closely, expect pollution accumulation"
            })
    
    return recommendations

def _generate_setup_recommendations(config_status):
    """Generate setup recommendations based on configuration"""
    recommendations = []
    
    if not config_status.get("nasa_tempo_api"):
        recommendations.append("Configure NASA_TEMPO_API_KEY for real satellite data")
    
    if not config_status.get("azure_subscription"):
        recommendations.append("Set up Azure subscription for ML forecasting ($200 free credit available)")
    
    if not config_status.get("planetary_computer"):
        recommendations.append("Register for Microsoft Planetary Computer (free) for environmental data")
    
    if not config_status.get("meteomatics"):
        recommendations.append("Consider Meteomatics API for premium weather data")
    
    return recommendations

@app.get("/health")
async def health_check():
    """Health check endpoint with NASA integration status"""
    try:
        # Check database connection
        await db.get_db().command("ping")
        
        # Check NASA services
        nasa_status = "checking..."
        try:
            from nasa_integration import nasa_services
            services_status = nasa_services.get_services_status()
            nasa_status = "operational" if services_status["integration_available"] else "fallback_mode"
        except:
            nasa_status = "not_available"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
            "nasa_integration": nasa_status,
            "version": "3.0.0 - NASA TEMPO Integration",
            "features": ["nasa_tempo", "planetary_computer", "azure_ml", "enhanced_weather"]
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
