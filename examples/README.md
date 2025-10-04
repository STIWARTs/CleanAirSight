# Example Data Files

This directory contains sample data files demonstrating the structure and format of data used in CleanAirSight.

## Files

### 1. `tempo_sample.csv`
Sample NASA TEMPO satellite data with NO2, O3, and HCHO measurements.

**Columns:**
- `timestamp`: ISO 8601 datetime
- `lat`: Latitude (decimal degrees)
- `lon`: Longitude (decimal degrees)
- `pollutant_type`: Pollutant name (NO2, O3, HCHO)
- `value`: Concentration (µg/m³)
- `source`: Data source (TEMPO)
- `quality_flag`: Quality indicator (good, moderate, poor)
- `uncertainty`: Measurement uncertainty (µg/m³)

### 2. `ground_sample.csv`
Sample ground sensor data from OpenAQ and EPA AirNow.

**Columns:**
- `timestamp`: ISO 8601 datetime
- `lat`: Latitude
- `lon`: Longitude
- `pollutant_type`: Pollutant name (PM2.5, PM10, O3, NO2, CO, SO2)
- `value`: Concentration (µg/m³)
- `source`: Data source (OpenAQ, AirNow)
- `city`: City name
- `location`: Station/location name
- `unit`: Measurement unit

### 3. `weather_sample.csv`
Sample weather data from OpenWeatherMap.

**Columns:**
- `timestamp`: ISO 8601 datetime
- `lat`: Latitude
- `lon`: Longitude
- `temperature`: Temperature (°C)
- `humidity`: Relative humidity (%)
- `wind_speed`: Wind speed (m/s)
- `wind_direction`: Wind direction (degrees)
- `pressure`: Atmospheric pressure (hPa)
- `clouds`: Cloud coverage (%)
- `weather_condition`: Weather description
- `source`: Data source

### 4. `harmonized_sample.csv`
Sample harmonized data combining all sources.

**Columns:**
- `timestamp`: ISO 8601 datetime
- `lat`: Latitude
- `lon`: Longitude
- `pollutant_type`: Pollutant name
- `value`: Normalized concentration (µg/m³)
- `source`: Original data source
- `data_type`: satellite or ground
- `temperature`: Weather context - temperature
- `humidity`: Weather context - humidity
- `wind_speed`: Weather context - wind speed
- `aqi`: Calculated AQI value

## Usage

These files can be used for:

1. **Testing**: Load sample data to test the application without API keys
2. **Development**: Understand data structures when building features
3. **Documentation**: Reference for data formats and schemas
4. **Training**: Use as initial training data for ML models

## Loading Sample Data

### Python
```python
import pandas as pd

# Load TEMPO data
tempo_df = pd.read_csv('examples/tempo_sample.csv')

# Load ground sensor data
ground_df = pd.read_csv('examples/ground_sample.csv')

# Load weather data
weather_df = pd.read_csv('examples/weather_sample.csv')
```

### MongoDB Import
```bash
# Import harmonized data
mongoimport --db cleanairsight \
  --collection harmonized_data \
  --type csv \
  --headerline \
  --file examples/harmonized_sample.csv
```

## Notes

- All sample data uses realistic values but is synthetically generated
- Timestamps are from January 2024
- Geographic coordinates cover major US cities
- Pollutant concentrations are within typical ambient ranges
