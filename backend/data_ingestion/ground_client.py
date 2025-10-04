import httpx
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class GroundSensorClient:
    """
    Client for fetching ground sensor data from OpenAQ and EPA AirNow APIs.
    Provides real-time PM2.5, PM10, O3, NO2, CO, SO2 measurements.
    """
    
    def __init__(self, openaq_api_key: Optional[str] = None, airnow_api_key: Optional[str] = None):
        self.openaq_api_key = openaq_api_key
        self.airnow_api_key = airnow_api_key
        self.openaq_base_url = "https://api.openaq.org/v2"
        self.airnow_base_url = "https://www.airnowapi.org/aq"
        
    async def fetch_openaq_data(
        self, 
        city: Optional[str] = None,
        country: str = "US",
        bbox: Optional[tuple] = None,
        parameters: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Fetch data from OpenAQ API.
        
        Args:
            city: City name
            country: Country code (default: US)
            bbox: Bounding box (min_lon, min_lat, max_lon, max_lat)
            parameters: List of parameters to fetch (pm25, pm10, o3, no2, co, so2)
        
        Returns:
            List of measurement records
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "limit": 1000,
                    "order_by": "datetime",
                    "sort": "desc"
                }
                
                if city:
                    params["city"] = city
                if country:
                    params["country"] = country
                if bbox:
                    min_lon, min_lat, max_lon, max_lat = bbox
                    params["coordinates"] = f"{min_lat},{min_lon},{max_lat},{max_lon}"
                if parameters:
                    params["parameter"] = ",".join(parameters)
                
                headers = {}
                if self.openaq_api_key:
                    headers["X-API-Key"] = self.openaq_api_key
                
                logger.info(f"Fetching OpenAQ data for {city or 'all locations'}")
                
                response = await client.get(
                    f"{self.openaq_base_url}/measurements",
                    params=params,
                    headers=headers
                )
                response.raise_for_status()
                
                data = response.json()
                measurements = data.get("results", [])
                
                # Transform to standard format
                records = []
                for m in measurements:
                    records.append({
                        "timestamp": m.get("date", {}).get("utc"),
                        "lat": m.get("coordinates", {}).get("latitude"),
                        "lon": m.get("coordinates", {}).get("longitude"),
                        "pollutant_type": self._normalize_parameter(m.get("parameter")),
                        "value": self._convert_to_ugm3(m.get("value"), m.get("unit")),
                        "source": "OpenAQ",
                        "city": m.get("city"),
                        "location": m.get("location"),
                        "unit": "µg/m³"
                    })
                
                logger.info(f"Fetched {len(records)} OpenAQ records")
                return records
                
        except Exception as e:
            logger.error(f"Error fetching OpenAQ data: {e}")
            return []
    
    async def fetch_airnow_data(
        self,
        bbox: Optional[tuple] = None,
        parameters: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Fetch data from EPA AirNow API.
        
        Args:
            bbox: Bounding box (min_lon, min_lat, max_lon, max_lat)
            parameters: List of parameters to fetch
        
        Returns:
            List of measurement records
        """
        if not self.airnow_api_key:
            logger.warning("AirNow API key not provided, skipping AirNow data")
            return []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if bbox:
                    min_lon, min_lat, max_lon, max_lat = bbox
                else:
                    # Default to continental US
                    min_lon, min_lat, max_lon, max_lat = -125, 25, -65, 50
                
                params = {
                    "bbox": f"{min_lon},{min_lat},{max_lon},{max_lat}",
                    "format": "application/json",
                    "API_KEY": self.airnow_api_key,
                    "verbose": 1
                }
                
                if parameters:
                    params["parameters"] = ",".join(parameters)
                
                logger.info(f"Fetching AirNow data for bbox {bbox}")
                
                response = await client.get(
                    f"{self.airnow_base_url}/data/",
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Transform to standard format
                records = []
                for item in data:
                    records.append({
                        "timestamp": item.get("UTC"),
                        "lat": item.get("Latitude"),
                        "lon": item.get("Longitude"),
                        "pollutant_type": self._normalize_parameter(item.get("Parameter")),
                        "value": float(item.get("Value", 0)),
                        "source": "AirNow",
                        "aqi": item.get("AQI"),
                        "category": item.get("Category", {}).get("Name"),
                        "unit": item.get("Unit")
                    })
                
                logger.info(f"Fetched {len(records)} AirNow records")
                return records
                
        except Exception as e:
            logger.error(f"Error fetching AirNow data: {e}")
            return []
    
    async def fetch_all_ground_data(
        self,
        city: Optional[str] = None,
        bbox: Optional[tuple] = None
    ) -> List[Dict]:
        """Fetch data from all ground sensor sources"""
        openaq_data = await self.fetch_openaq_data(city=city, bbox=bbox)
        airnow_data = await self.fetch_airnow_data(bbox=bbox)
        
        all_data = openaq_data + airnow_data
        logger.info(f"Total ground sensor records: {len(all_data)}")
        
        return all_data
    
    def _normalize_parameter(self, param: str) -> str:
        """Normalize parameter names to standard format"""
        param_mapping = {
            "pm25": "PM2.5",
            "pm2.5": "PM2.5",
            "pm10": "PM10",
            "o3": "O3",
            "ozone": "O3",
            "no2": "NO2",
            "nitrogen dioxide": "NO2",
            "co": "CO",
            "carbon monoxide": "CO",
            "so2": "SO2",
            "sulfur dioxide": "SO2"
        }
        return param_mapping.get(param.lower(), param.upper())
    
    def _convert_to_ugm3(self, value: float, unit: str) -> float:
        """Convert values to µg/m³"""
        if unit in ["µg/m³", "ug/m3", "ugm3"]:
            return value
        elif unit in ["mg/m³", "mg/m3"]:
            return value * 1000
        elif unit == "ppm":
            # Approximate conversion (depends on molecular weight and conditions)
            return value * 1000  # Simplified
        return value
    
    async def save_raw_data(self, data: List[Dict], output_dir: str = "data/raw"):
        """Save raw ground sensor data to CSV"""
        if not data:
            return
        
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        df = pd.DataFrame(data)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/ground_{timestamp}.csv"
        
        df.to_csv(filename, index=False)
        logger.info(f"Saved ground data to {filename}")
        
        return filename


# Example usage for testing
async def test_ground_client():
    """Test the ground sensor client"""
    client = GroundSensorClient()
    data = await client.fetch_all_ground_data(city="Los Angeles")
    print(f"Fetched {len(data)} ground sensor records")
    
    if data:
        await client.save_raw_data(data)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_ground_client())
