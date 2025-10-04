import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional
import logging
from scipy.interpolate import griddata

logger = logging.getLogger(__name__)


class DataHarmonizer:
    """
    Harmonize data from multiple sources (TEMPO, ground sensors, weather)
    into a unified schema with normalized units and formats.
    """
    
    # Standard pollutant conversion factors (to µg/m³)
    CONVERSION_FACTORS = {
        "NO2": {
            "ppb": 1.88,  # at 25°C, 1 atm
            "ppm": 1880,
            "µg/m³": 1.0
        },
        "O3": {
            "ppb": 1.96,
            "ppm": 1960,
            "µg/m³": 1.0
        },
        "PM2.5": {
            "µg/m³": 1.0,
            "mg/m³": 1000
        },
        "PM10": {
            "µg/m³": 1.0,
            "mg/m³": 1000
        },
        "CO": {
            "ppb": 1.145,
            "ppm": 1145,
            "mg/m³": 1000,
            "µg/m³": 1.0
        },
        "SO2": {
            "ppb": 2.62,
            "ppm": 2620,
            "µg/m³": 1.0
        },
        "HCHO": {
            "ppb": 1.23,
            "ppm": 1230,
            "µg/m³": 1.0
        }
    }
    
    def harmonize_all_data(
        self,
        tempo_data: List[Dict],
        ground_data: List[Dict],
        weather_data: List[Dict]
    ) -> List[Dict]:
        """
        Harmonize all data sources into unified format.
        
        Returns:
            List of harmonized records with schema:
            {
                timestamp, lat, lon, pollutant_type, value, 
                source, confidence, weather_context
            }
        """
        harmonized = []
        
        # Process TEMPO satellite data
        for record in tempo_data:
            harmonized_record = self._harmonize_tempo_record(record)
            if harmonized_record:
                harmonized.append(harmonized_record)
        
        # Process ground sensor data
        for record in ground_data:
            harmonized_record = self._harmonize_ground_record(record)
            if harmonized_record:
                harmonized.append(harmonized_record)
        
        # Enrich with weather data
        harmonized = self._enrich_with_weather(harmonized, weather_data)
        
        # Handle missing values
        harmonized = self._handle_missing_values(harmonized)
        
        logger.info(f"Harmonized {len(harmonized)} total records")
        return harmonized
    
    def _harmonize_tempo_record(self, record: Dict) -> Optional[Dict]:
        """Harmonize TEMPO satellite data"""
        try:
            return {
                "timestamp": self._parse_timestamp(record.get("timestamp")),
                "lat": float(record.get("lat")),
                "lon": float(record.get("lon")),
                "pollutant_type": record.get("pollutant_type"),
                "value": self._normalize_value(
                    record.get("value"),
                    record.get("pollutant_type"),
                    "µg/m³"
                ),
                "source": "TEMPO",
                "quality_flag": record.get("quality_flag", "unknown"),
                "uncertainty": record.get("uncertainty"),
                "data_type": "satellite",
                "spatial_resolution": "high"
            }
        except Exception as e:
            logger.warning(f"Error harmonizing TEMPO record: {e}")
            return None
    
    def _harmonize_ground_record(self, record: Dict) -> Optional[Dict]:
        """Harmonize ground sensor data"""
        try:
            return {
                "timestamp": self._parse_timestamp(record.get("timestamp")),
                "lat": float(record.get("lat")),
                "lon": float(record.get("lon")),
                "pollutant_type": record.get("pollutant_type"),
                "value": self._normalize_value(
                    record.get("value"),
                    record.get("pollutant_type"),
                    record.get("unit", "µg/m³")
                ),
                "source": record.get("source", "Ground"),
                "city": record.get("city"),
                "location": record.get("location"),
                "aqi": record.get("aqi"),
                "data_type": "ground",
                "spatial_resolution": "point"
            }
        except Exception as e:
            logger.warning(f"Error harmonizing ground record: {e}")
            return None
    
    def _enrich_with_weather(
        self,
        harmonized_data: List[Dict],
        weather_data: List[Dict]
    ) -> List[Dict]:
        """Add weather context to harmonized data"""
        if not weather_data:
            return harmonized_data
        
        # Create weather lookup by location and time
        weather_df = pd.DataFrame(weather_data)
        
        for record in harmonized_data:
            # Find nearest weather station
            nearest_weather = self._find_nearest_weather(
                record["lat"],
                record["lon"],
                record["timestamp"],
                weather_df
            )
            
            if nearest_weather:
                record["weather_context"] = {
                    "temperature": nearest_weather.get("temperature"),
                    "humidity": nearest_weather.get("humidity"),
                    "wind_speed": nearest_weather.get("wind_speed"),
                    "wind_direction": nearest_weather.get("wind_direction"),
                    "pressure": nearest_weather.get("pressure")
                }
        
        return harmonized_data
    
    def _find_nearest_weather(
        self,
        lat: float,
        lon: float,
        timestamp: str,
        weather_df: pd.DataFrame
    ) -> Optional[Dict]:
        """Find nearest weather station data"""
        if weather_df.empty:
            return None
        
        # Calculate distances
        weather_df["distance"] = np.sqrt(
            (weather_df["lat"] - lat) ** 2 + 
            (weather_df["lon"] - lon) ** 2
        )
        
        # Find closest within reasonable distance (e.g., 0.5 degrees)
        nearest = weather_df[weather_df["distance"] < 0.5].sort_values("distance").head(1)
        
        if nearest.empty:
            return None
        
        return nearest.iloc[0].to_dict()
    
    def _normalize_value(
        self,
        value: float,
        pollutant: str,
        unit: str
    ) -> float:
        """Normalize pollutant values to µg/m³"""
        if pd.isna(value):
            return None
        
        if pollutant not in self.CONVERSION_FACTORS:
            return float(value)
        
        conversion = self.CONVERSION_FACTORS[pollutant].get(unit, 1.0)
        return float(value) * conversion
    
    def _parse_timestamp(self, timestamp) -> str:
        """Parse and standardize timestamp to ISO format"""
        if isinstance(timestamp, str):
            try:
                dt = pd.to_datetime(timestamp)
                return dt.isoformat()
            except:
                return timestamp
        elif isinstance(timestamp, datetime):
            return timestamp.isoformat()
        else:
            return datetime.utcnow().isoformat()
    
    def _handle_missing_values(self, data: List[Dict]) -> List[Dict]:
        """Handle missing values with interpolation where appropriate"""
        df = pd.DataFrame(data)
        
        # Group by pollutant type and location
        numeric_cols = ["value", "lat", "lon"]
        
        for col in numeric_cols:
            if col in df.columns:
                # Simple forward fill for now
                df[col] = df[col].fillna(method='ffill').fillna(method='bfill')
        
        return df.to_dict('records')
    
    def calculate_aqi(self, pollutant: str, concentration: float) -> Dict:
        """
        Calculate AQI based on pollutant concentration.
        Uses EPA AQI breakpoints.
        
        Returns:
            Dict with aqi value and category
        """
        # EPA AQI breakpoints (concentration ranges in µg/m³)
        breakpoints = {
            "PM2.5": [
                (0, 12.0, 0, 50),
                (12.1, 35.4, 51, 100),
                (35.5, 55.4, 101, 150),
                (55.5, 150.4, 151, 200),
                (150.5, 250.4, 201, 300),
                (250.5, 500.4, 301, 500)
            ],
            "PM10": [
                (0, 54, 0, 50),
                (55, 154, 51, 100),
                (155, 254, 101, 150),
                (255, 354, 151, 200),
                (355, 424, 201, 300),
                (425, 604, 301, 500)
            ],
            "O3": [
                (0, 54, 0, 50),
                (55, 70, 51, 100),
                (71, 85, 101, 150),
                (86, 105, 151, 200),
                (106, 200, 201, 300)
            ],
            "NO2": [
                (0, 53, 0, 50),
                (54, 100, 51, 100),
                (101, 360, 101, 150),
                (361, 649, 151, 200),
                (650, 1249, 201, 300),
                (1250, 2049, 301, 500)
            ]
        }
        
        categories = [
            "Good",
            "Moderate",
            "Unhealthy for Sensitive Groups",
            "Unhealthy",
            "Very Unhealthy",
            "Hazardous"
        ]
        
        if pollutant not in breakpoints:
            return {"aqi": None, "category": "Unknown"}
        
        for bp in breakpoints[pollutant]:
            c_low, c_high, i_low, i_high = bp
            if c_low <= concentration <= c_high:
                aqi = ((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low
                category_index = min(int(aqi / 50), len(categories) - 1)
                return {
                    "aqi": round(aqi),
                    "category": categories[category_index]
                }
        
        # If concentration exceeds all breakpoints
        return {"aqi": 500, "category": "Hazardous"}
    
    def aggregate_by_location(
        self,
        data: List[Dict],
        grid_size: float = 0.1
    ) -> List[Dict]:
        """
        Aggregate data by grid cells for mapping.
        
        Args:
            data: Harmonized data
            grid_size: Grid cell size in degrees
        
        Returns:
            Aggregated data by grid cell
        """
        df = pd.DataFrame(data)
        
        # Create grid cells
        df["lat_grid"] = (df["lat"] / grid_size).round() * grid_size
        df["lon_grid"] = (df["lon"] / grid_size).round() * grid_size
        
        # Aggregate by grid cell and pollutant
        aggregated = df.groupby(
            ["lat_grid", "lon_grid", "pollutant_type"]
        ).agg({
            "value": ["mean", "std", "count"],
            "timestamp": "max"
        }).reset_index()
        
        aggregated.columns = [
            "lat", "lon", "pollutant_type",
            "value_mean", "value_std", "count", "timestamp"
        ]
        
        return aggregated.to_dict('records')


# Example usage
if __name__ == "__main__":
    harmonizer = DataHarmonizer()
    
    # Test AQI calculation
    aqi = harmonizer.calculate_aqi("PM2.5", 35.5)
    print(f"AQI for PM2.5 at 35.5 µg/m³: {aqi}")
