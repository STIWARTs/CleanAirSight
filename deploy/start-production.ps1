#!/usr/bin/env pwsh

# Start Production CleanAirSights with proper environment loading

$ErrorActionPreference = "Stop"

# Get the directory paths
$deployDir = Get-Location
$rootDir = Split-Path -Parent $deployDir
$envFile = Join-Path $rootDir ".env.prod"

Write-Host "🚀 Starting CleanAirSights Production Deployment" -ForegroundColor Green
Write-Host "Deploy Directory: $deployDir" -ForegroundColor Blue
Write-Host "Root Directory: $rootDir" -ForegroundColor Blue
Write-Host "Environment File: $envFile" -ForegroundColor Blue

# Check if .env.prod exists
if (-not (Test-Path $envFile)) {
    Write-Error "Environment file not found: $envFile"
    exit 1
}

# Load environment variables from .env.prod file
Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^"(.*)"$', '$1'
        $value = $value -replace "^'(.*)'$", '$1'
        $envVars[$key] = $value
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "✅ Loaded $($envVars.Count) environment variables" -ForegroundColor Green

# Show key variables (without secrets)
Write-Host "🔧 Key Configuration:" -ForegroundColor Yellow
Write-Host "  - DOMAIN: $($envVars['DOMAIN'])" -ForegroundColor Cyan
Write-Host "  - ENVIRONMENT: $($envVars['ENVIRONMENT'])" -ForegroundColor Cyan
Write-Host "  - MONGO_ROOT_USERNAME: $($envVars['MONGO_ROOT_USERNAME'])" -ForegroundColor Cyan
Write-Host "  - API_PORT: $($envVars['API_PORT'])" -ForegroundColor Cyan

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Build and start containers
Write-Host "🏗️ Building and starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up --build -d

# Wait a moment for containers to start
Start-Sleep -Seconds 5

# Check container status
Write-Host "📊 Container Status:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Show logs for backend to check for errors
Write-Host "📋 Backend Startup Logs:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

Write-Host ""
Write-Host "🎉 CleanAirSights should now be running!" -ForegroundColor Green
Write-Host "🌐 Website: https://$($envVars['DOMAIN'])" -ForegroundColor Cyan
Write-Host "🔍 API Health: https://$($envVars['DOMAIN'])/api/current" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 To view logs: docker-compose -f docker-compose.prod.yml logs -f [service]" -ForegroundColor Blue
Write-Host "🛑 To stop: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Blue