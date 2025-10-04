
const path = require('path');

// Import the service
const servicePath = path.join(__dirname, 'services', 'azure_mlService.js');
let service;

try {
    service = require(servicePath);
} catch (error) {
    console.error('Failed to load service:', error.message);
    process.exit(1);
}

// Call the method
async function callService() {
    try {
        const params = {"currentData": {"aqi": 85, "location": {"lat": 40.7128, "lon": -74.006}}, "locationData": {"population": {"density": 5000}, "landCover": {"urbanDensity": "high"}}, "hours": 12};
        let result;
        
        if (service.generateAirQualityForecast) {
            result = await service.generateAirQualityForecast(...Object.values(params));
        } else {
            throw new Error('Method generateAirQualityForecast not found in service');
        }
        
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Service call failed:', error.message);
        process.exit(1);
    }
}

callService();
