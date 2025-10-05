#!/usr/bin/env pwsh

# Restore SSL Certificates for CleanAirSights Production

$ErrorActionPreference = "Stop"

Write-Host "🔐 Restoring SSL Certificates for CleanAirSights" -ForegroundColor Green

# Create SSL directory
$sslDir = ".\nginx\ssl"
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force
    Write-Host "📁 Created SSL directory: $sslDir" -ForegroundColor Blue
}

# Check if Let's Encrypt certificates exist
$letsEncryptDir = "/etc/letsencrypt/live/cleanairsight.earth"
$localCertPath = "/etc/letsencrypt/live/cleanairsight.earth/fullchain.pem"
$localKeyPath = "/etc/letsencrypt/live/cleanairsight.earth/privkey.pem"

Write-Host "🔍 Checking for existing SSL certificates..." -ForegroundColor Yellow

# Copy certificates if they exist
if (Test-Path $localCertPath -PathType Leaf) {
    Copy-Item $localCertPath "$sslDir\fullchain.pem"
    Copy-Item $localKeyPath "$sslDir\privkey.pem"
    Write-Host "✅ SSL certificates copied successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  SSL certificates not found at $letsEncryptDir" -ForegroundColor Yellow
    Write-Host "📋 To obtain SSL certificates, run:" -ForegroundColor Blue
    Write-Host "   sudo certbot certonly --nginx -d cleanairsight.earth -d www.cleanairsight.earth" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔄 Continuing with HTTP-only configuration for now..." -ForegroundColor Yellow
    return
}

# Switch to HTTPS nginx configuration
Write-Host "🔧 Switching to HTTPS nginx configuration..." -ForegroundColor Yellow

# Update docker-compose to use SSL config
$dockerComposeFile = "docker-compose.prod.yml"
$content = Get-Content $dockerComposeFile -Raw

# Replace HTTP-only config with SSL config
$content = $content -replace "nginx-http-only\.conf", "nginx.conf"
$content = $content -replace "- nginx_logs:/var/log/nginx", "- ./nginx/ssl:/etc/nginx/ssl`r`n      - nginx_logs:/var/log/nginx"

Set-Content $dockerComposeFile $content

Write-Host "✅ Updated docker-compose configuration for SSL" -ForegroundColor Green

# Restart containers with SSL
Write-Host "🔄 Restarting containers with SSL configuration..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to start
Start-Sleep -Seconds 10

# Test HTTPS
Write-Host "🧪 Testing HTTPS connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://cleanairsight.earth/health" -SkipCertificateCheck -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ HTTPS is working correctly!" -ForegroundColor Green
        Write-Host "🌐 Website: https://cleanairsight.earth" -ForegroundColor Cyan
        Write-Host "🔍 API: https://cleanairsight.earth/api/current" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ HTTPS test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Check nginx logs: docker-compose -f docker-compose.prod.yml logs nginx" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎉 SSL restoration completed!" -ForegroundColor Green