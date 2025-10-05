from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # NASA Earthdata
    nasa_earthdata_username: str = ""
    nasa_earthdata_password: str = ""
    
    # OpenAQ API
    openaq_api_key: str = ""
    
    # EPA AirNow API
    airnow_api_key: str = ""
    
    # OpenWeatherMap API
    openweather_api_key: str = ""
    
    # Database
    mongodb_uri: str = "mongodb://localhost:27017/cleanairsight"
    database_url: str = ""
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    allowed_origins: str = "https://cleanairsight.earth,https://www.cleanairsight.earth"
    
    # Email Service Settings
    sender_email: str = "alerts@cleanairsight.com"
    sender_password: str = ""
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    
    # ML Model Settings
    model_retrain_interval_hours: int = 24
    forecast_horizon_hours: int = 24
    
    # Refresh intervals (in minutes)
    environment: str = "production"
    tempo_refresh_interval: int = 60
    ground_refresh_interval: int = 15
    weather_refresh_interval: int = 60
    
    # Validation Thresholds
    discrepancy_threshold: float = 0.30
    low_confidence_threshold: float = 0.60
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        # Use allowed_origins for production, cors_origins for development
        origins = self.allowed_origins if self.environment == "production" else self.cors_origins
        return [origin.strip() for origin in origins.split(",")]


settings = Settings()
