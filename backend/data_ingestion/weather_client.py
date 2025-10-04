import httpx
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class WeatherClient:
    """
    Client for fetching weather data from OpenWeatherMap API.
    Provides temperature, humidity, wind, pressure data.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
    async def fetch_current_weather(
        self,
        lat: float,
        lon: float
    ) -> Dict:
        """
        Fetch current weather data for a specific location.
        
        Args:
            lat: Latitude
            lon: Longitude
        
        Returns:
            Weather data dictionary
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric"
                }
                
                response = await client.get(
                    f"{self.base_url}/weather",
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                
                return {
                    "timestamp": datetime.utcfromtimestamp(data.get("dt")).isoformat(),
                    "lat": lat,
                    "lon": lon,
                    "temperature": data.get("main", {}).get("temp"),
                    "feels_like": data.get("main", {}).get("feels_like"),
                    "humidity": data.get("main", {}).get("humidity"),
                    "pressure": data.get("main", {}).get("pressure"),
                    "wind_speed": data.get("wind", {}).get("speed"),
                    "wind_direction": data.get("wind", {}).get("deg"),
                    "clouds": data.get("clouds", {}).get("all"),
                    "visibility": data.get("visibility"),
                    "weather_condition": data.get("weather", [{}])[0].get("main"),
                    "weather_description": data.get("weather", [{}])[0].get("description"),
                    "source": "OpenWeatherMap"
                }
                
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            return {}
    
    async def fetch_weather_for_cities(
        self,
        cities: List[Dict[str, float]]
    ) -> List[Dict]:
        """
        Fetch weather data for multiple cities.
        
        Args:
            cities: List of dicts with 'lat' and 'lon' keys
        
        Returns:
            List of weather records
        """
        records = []
        
        for city in cities:
            lat = city.get("lat")
            lon = city.get("lon")
            
            if lat and lon:
                weather_data = await self.fetch_current_weather(lat, lon)
                if weather_data:
                    weather_data["city"] = city.get("name", "Unknown")
                    records.append(weather_data)
        
        logger.info(f"Fetched weather data for {len(records)} locations")
        return records
    
    async def fetch_weather_for_grid(
        self,
        bbox: tuple,
        grid_resolution: float = 1.0
    ) -> List[Dict]:
        """
        Fetch weather data for a grid of points within a bounding box.
        
        Args:
            bbox: Bounding box (min_lon, min_lat, max_lon, max_lat)
            grid_resolution: Grid spacing in degrees
        
        Returns:
            List of weather records
        """
        min_lon, min_lat, max_lon, max_lat = bbox
        
        lats = []
        lons = []
        
        lat = min_lat
        while lat <= max_lat:
            lon = min_lon
            while lon <= max_lon:
                lats.append(lat)
                lons.append(lon)
                lon += grid_resolution
            lat += grid_resolution
        
        records = []
        
        # Batch requests to avoid rate limiting
        for i in range(0, len(lats), 60):  # OpenWeatherMap free tier: 60 calls/min
            batch_lats = lats[i:i+60]
            batch_lons = lons[i:i+60]
            
            for lat, lon in zip(batch_lats, batch_lons):
                weather_data = await self.fetch_current_weather(lat, lon)
                if weather_data:
                    records.append(weather_data)
            
            # Small delay to respect rate limits
            if i + 60 < len(lats):
                await asyncio.sleep(1)
        
        logger.info(f"Fetched weather data for {len(records)} grid points")
        return records
    
    async def fetch_forecast(
        self,
        lat: float,
        lon: float,
        hours: int = 24
    ) -> List[Dict]:
        """
        Fetch weather forecast data.
        
        Args:
            lat: Latitude
            lon: Longitude
            hours: Number of hours to forecast (max 120 for free tier)
        
        Returns:
            List of forecast records
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric",
                    "cnt": min(hours // 3, 40)  # 3-hour intervals, max 40 (5 days)
                }
                
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                
                records = []
                for item in data.get("list", []):
                    records.append({
                        "timestamp": datetime.utcfromtimestamp(item.get("dt")).isoformat(),
                        "lat": lat,
                        "lon": lon,
                        "temperature": item.get("main", {}).get("temp"),
                        "humidity": item.get("main", {}).get("humidity"),
                        "pressure": item.get("main", {}).get("pressure"),
                        "wind_speed": item.get("wind", {}).get("speed"),
                        "wind_direction": item.get("wind", {}).get("deg"),
                        "clouds": item.get("clouds", {}).get("all"),
                        "weather_condition": item.get("weather", [{}])[0].get("main"),
                        "weather_description": item.get("weather", [{}])[0].get("description"),
                        "source": "OpenWeatherMap",
                        "forecast": True
                    })
                
                logger.info(f"Fetched {len(records)} forecast records")
                return records
                
        except Exception as e:
            logger.error(f"Error fetching forecast data: {e}")
            return []
    
    async def save_raw_data(self, data: List[Dict], output_dir: str = "data/raw"):
        """Save raw weather data to CSV"""
        if not data:
            return
        
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        df = pd.DataFrame(data)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/weather_{timestamp}.csv"
        
        df.to_csv(filename, index=False)
        logger.info(f"Saved weather data to {filename}")
        
        return filename


import asyncio


# Example usage for testing
async def test_weather_client():
    """Test the weather client"""
    client = WeatherClient("your_api_key_here")
    
    # Test single location
    weather = await client.fetch_current_weather(34.05, -118.25)  # Los Angeles
    print(f"Weather data: {weather}")
    
    # Test multiple cities
    cities = [
        {"name": "Los Angeles", "lat": 34.05, "lon": -118.25},
        {"name": "New York", "lat": 40.71, "lon": -74.01},
        {"name": "Chicago", "lat": 41.88, "lon": -87.63}
    ]
    
    weather_data = await client.fetch_weather_for_cities(cities)
    print(f"Fetched weather for {len(weather_data)} cities")
    
    if weather_data:
        await client.save_raw_data(weather_data)


if __name__ == "__main__":
    asyncio.run(test_weather_client())
