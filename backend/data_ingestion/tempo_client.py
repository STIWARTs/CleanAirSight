import httpx
import xarray as xr
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from pathlib import Path
import aiofiles
import tempfile
import os

logger = logging.getLogger(__name__)


class TEMPOClient:
    """
    Client for fetching NASA TEMPO satellite data from GES DISC.
    TEMPO provides hourly measurements of NO2, O3, and HCHO across North America.
    """
    
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self.base_url = "https://goldsmr4.gesdisc.eosdis.nasa.gov/data/TEMPO"
        
        # TEMPO product endpoints (example paths - adjust based on actual data availability)
        self.products = {
            "NO2": "/TEMPO_NO2_L2/",
            "O3": "/TEMPO_O3_L2/",
            "HCHO": "/TEMPO_HCHO_L2/"
        }
    
    async def fetch_tempo_data(
        self, 
        pollutant: str = "NO2", 
        date: Optional[datetime] = None,
        bbox: Optional[tuple] = None
    ) -> List[Dict]:
        """
        Fetch TEMPO satellite data for a specific pollutant.
        
        Args:
            pollutant: Type of pollutant (NO2, O3, HCHO)
            date: Date to fetch data for (defaults to today)
            bbox: Bounding box (min_lon, min_lat, max_lon, max_lat)
        
        Returns:
            List of data records
        """
        if date is None:
            date = datetime.utcnow()
        
        if pollutant not in self.products:
            logger.error(f"Invalid pollutant type: {pollutant}")
            return []
        
        try:
            # Construct file path (adjust based on actual TEMPO file naming convention)
            year = date.strftime("%Y")
            doy = date.strftime("%j")
            
            # Example file pattern - adjust based on actual TEMPO data structure
            file_pattern = f"TEMPO_{pollutant}_L2_{date.strftime('%Y%m%d')}"
            
            logger.info(f"Fetching TEMPO {pollutant} data for {date.strftime('%Y-%m-%d')}")
            
            # For demonstration, we'll simulate data fetching
            # In production, this would download the actual NetCDF/HDF5 file
            data = await self._fetch_and_parse_tempo_file(pollutant, date, bbox)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching TEMPO data: {e}")
            return []
    
    async def _fetch_and_parse_tempo_file(
        self, 
        pollutant: str, 
        date: datetime,
        bbox: Optional[tuple] = None
    ) -> List[Dict]:
        """
        Download and parse TEMPO NetCDF/HDF5 file.
        
        Note: This is a simulation. In production, you would:
        1. Use earthaccess library or direct HTTP download with authentication
        2. Parse actual NetCDF/HDF5 files
        3. Extract relevant variables (lat, lon, pollutant concentrations)
        """
        try:
            # Simulate TEMPO data structure
            # Real TEMPO data would be downloaded and parsed from NetCDF/HDF5
            
            # For demonstration, generate sample data grid
            if bbox:
                min_lon, min_lat, max_lon, max_lat = bbox
            else:
                # Default to North America
                min_lon, min_lat, max_lon, max_lat = -125, 25, -65, 50
            
            # Generate sample grid (in production, this comes from TEMPO file)
            lats = np.arange(min_lat, max_lat, 0.1)
            lons = np.arange(min_lon, max_lon, 0.1)
            
            data_records = []
            
            # Sample a subset of grid points for demonstration
            sample_indices = np.random.choice(len(lats) * len(lons), min(1000, len(lats) * len(lons)), replace=False)
            
            for idx in sample_indices:
                lat_idx = idx // len(lons)
                lon_idx = idx % len(lons)
                
                lat = lats[lat_idx]
                lon = lons[lon_idx]
                
                # Simulate pollutant concentration (in µg/m³)
                # Real values would come from TEMPO data
                if pollutant == "NO2":
                    value = np.random.uniform(5, 50)
                elif pollutant == "O3":
                    value = np.random.uniform(20, 80)
                elif pollutant == "HCHO":
                    value = np.random.uniform(1, 15)
                else:
                    value = 0
                
                data_records.append({
                    "timestamp": date.isoformat(),
                    "lat": float(lat),
                    "lon": float(lon),
                    "pollutant_type": pollutant,
                    "value": float(value),
                    "source": "TEMPO",
                    "quality_flag": "good",
                    "uncertainty": float(value * 0.1)
                })
            
            logger.info(f"Parsed {len(data_records)} TEMPO {pollutant} records")
            return data_records
            
        except Exception as e:
            logger.error(f"Error parsing TEMPO file: {e}")
            return []
    
    async def save_raw_data(self, data: List[Dict], output_dir: str = "data/raw"):
        """Save raw TEMPO data to CSV"""
        if not data:
            return
        
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        df = pd.DataFrame(data)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        pollutant = data[0].get("pollutant_type", "unknown")
        filename = f"{output_dir}/tempo_{pollutant}_{timestamp}.csv"
        
        df.to_csv(filename, index=False)
        logger.info(f"Saved TEMPO data to {filename}")
        
        return filename


# Example usage for testing
async def test_tempo_client():
    """Test the TEMPO client"""
    client = TEMPOClient("username", "password")
    data = await client.fetch_tempo_data("NO2")
    print(f"Fetched {len(data)} TEMPO records")
    
    if data:
        await client.save_raw_data(data)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_tempo_client())
