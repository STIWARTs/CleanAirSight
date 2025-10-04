const fs = require('fs');
const path = require('path');

console.log('🔍 Checking NASA Services Integration...\n');

// Check if service files exist
const servicesPath = path.join(__dirname, 'services');
const requiredServices = [
  'nasaTempoService.js',
  'planetaryComputerService.js',
  'azureMLService.js',
  'weatherService.js'
];

let allServicesPresent = true;

console.log('📁 Service Files:');
for (const service of requiredServices) {
  const servicePath = path.join(servicesPath, service);
  if (fs.existsSync(servicePath)) {
    console.log(`  ✅ ${service}`);
  } else {
    console.log(`  ❌ ${service} - MISSING`);
    allServicesPresent = false;
  }
}

// Check environment variables
console.log('\n🔑 Environment Configuration:');
const requiredEnvVars = [
  'NASA_TEMPO_API_KEY',
  'NASA_EARTHDATA_USERNAME', 
  'AZURE_SUBSCRIPTION_ID',
  'PLANETARY_COMPUTER_KEY',
  'METEOMATICS_USERNAME',
  'OPENWEATHER_API_KEY'
];

let envConfigured = 0;
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar}`);
    envConfigured++;
  } else {
    console.log(`  ⚠️  ${envVar} - Not configured`);
  }
}

// Test basic service loading
console.log('\n🧪 Service Loading Test:');
let servicesLoaded = 0;

for (const service of requiredServices) {
  try {
    const servicePath = path.join(servicesPath, service);
    if (fs.existsSync(servicePath)) {
      require(servicePath);
      console.log(`  ✅ ${service} loaded successfully`);
      servicesLoaded++;
    }
  } catch (error) {
    console.log(`  ❌ ${service} failed to load: ${error.message}`);
  }
}

// Summary
console.log('\n📊 Summary:');
console.log(`  Services Present: ${requiredServices.filter(s => fs.existsSync(path.join(servicesPath, s))).length}/${requiredServices.length}`);
console.log(`  Environment Configured: ${envConfigured}/${requiredEnvVars.length}`);
console.log(`  Services Loaded: ${servicesLoaded}/${requiredServices.length}`);

const overallStatus = allServicesPresent && servicesLoaded === requiredServices.length;
console.log(`  Overall Status: ${overallStatus ? '✅ READY' : '⚠️  NEEDS SETUP'}`);

if (!overallStatus) {
  console.log('\n💡 Next Steps:');
  
  if (!allServicesPresent) {
    console.log('  1. Ensure all service files are present in the services/ directory');
  }
  
  if (envConfigured < requiredEnvVars.length) {
    console.log('  2. Configure missing environment variables in .env file:');
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`     - ${envVar}`);
      }
    }
  }
  
  if (servicesLoaded < requiredServices.length) {
    console.log('  3. Fix service loading errors (check dependencies)');
    console.log('     Run: npm install');
  }
  
  console.log('  4. Restart the backend service after configuration');
}

console.log('\n🛰️ NASA Integration Status Check Complete\n');

// Exit with appropriate code
process.exit(overallStatus ? 0 : 1);