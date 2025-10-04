import asyncio
import sys
import os
sys.path.append('.')
from nasa_integration import nasa_services

async def test_nasa_services():
    print('🧪 Testing NASA Services Integration...')
    
    # Test air quality data for New York
    print('\n1. Testing NASA TEMPO Air Quality for New York...')
    try:
        air_quality = await nasa_services.get_nasa_air_quality(40.7128, -74.0060)
        print(f'   ✅ AQI: {air_quality.get("aqi", "N/A")}')
        print(f'   📡 Source: {air_quality.get("source", "N/A")}')
        print(f'   🏢 Location Type: {air_quality.get("locationInfo", {}).get("type", "N/A")}')
        print(f'   🏙️ Nearest City: {air_quality.get("locationInfo", {}).get("nearest_city", "N/A")}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
    
    # Test environmental context
    print('\n2. Testing Environmental Context...')
    try:
        context = await nasa_services.get_environmental_context(40.7128, -74.0060)
        land_cover = context.get('landCover', {})
        population = context.get('population', {})
        print(f'   🌍 Land Cover: {land_cover.get("primaryType", "N/A")}')
        print(f'   🏢 Urban Density: {land_cover.get("urbanDensity", "N/A")}')
        print(f'   👥 Population: {population.get("category", "N/A")} ({population.get("density", "N/A")} people/km²)')
    except Exception as e:
        print(f'   ❌ Error: {e}')
    
    # Test weather data
    print('\n3. Testing Enhanced Weather Service...')
    try:
        weather = await nasa_services.get_weather_for_air_quality(40.7128, -74.0060)
        impact = weather.get('airQualityImpact', {})
        print(f'   🌡️ Temperature: {weather.get("temperature", "N/A")}°C')
        print(f'   💨 Wind Speed: {weather.get("windSpeed", "N/A")} m/s')
        print(f'   🌬️ AQ Impact: {impact.get("overallImpact", "N/A")}')
        print(f'   💡 Recommendations: {len(weather.get("recommendations", []))} available')
    except Exception as e:
        print(f'   ❌ Error: {e}')
    
    # Test ML forecast
    print('\n4. Testing AI Forecast...')
    try:
        current_data = {"aqi": 85, "location": {"lat": 40.7128, "lon": -74.0060}}
        location_data = {"population": {"density": 5000}, "landCover": {"urbanDensity": "high"}}
        forecast = await nasa_services.get_ml_forecast(current_data, location_data, 12)
        summary = forecast.get('summary', {})
        print(f'   📊 Forecast Hours: {forecast.get("forecastHours", "N/A")}')
        print(f'   📈 Max AQI: {summary.get("maxAQI", "N/A")}')
        print(f'   📉 Min AQI: {summary.get("minAQI", "N/A")}')
        print(f'   🎯 Confidence: {forecast.get("confidence", "N/A")}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
    
    # Service status
    print('\n5. Overall Service Status:')
    try:
        status = nasa_services.get_services_status()
        print(f'   🔧 Integration Available: {status.get("integration_available", False)}')
        print(f'   📦 Node Version: {status.get("node_version", "N/A")}')
        
        services = status.get('services', {})
        for service_name, service_status in services.items():
            print(f'   🛠️ {service_name}: {service_status}')
            
    except Exception as e:
        print(f'   ❌ Error: {e}')
    
    print('\n✅ NASA Services Integration Test Complete!')
    print('\n💡 Next Steps:')
    print('   1. Add API keys to .env file for real NASA data')
    print('   2. Start the FastAPI server: python main.py')
    print('   3. Test endpoints: http://localhost:8000/api/nasa/air-quality?lat=40.7128&lon=-74.0060')

if __name__ == "__main__":
    asyncio.run(test_nasa_services())