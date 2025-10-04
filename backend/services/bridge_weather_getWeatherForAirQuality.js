
const path = require('path');

// Import the service
const servicePath = path.join(__dirname, 'services', 'weatherService.js');
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
        const params = {"lat": 40.7128, "lon": -74.006};
        let result;
        
        if (service.getWeatherForAirQuality) {
            result = await service.getWeatherForAirQuality(...Object.values(params));
        } else {
            throw new Error('Method getWeatherForAirQuality not found in service');
        }
        
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Service call failed:', error.message);
        process.exit(1);
    }
}

callService();
