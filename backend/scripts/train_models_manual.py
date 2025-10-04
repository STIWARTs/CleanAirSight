"""
Manual Model Training Script
Run this to train models with synthetic/demo data for testing purposes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from ml.forecasting_engine import ForecastingEngine

def generate_synthetic_data(days=30):
    """Generate synthetic air quality data for training"""
    print(f"Generating {days} days of synthetic data...")
    
    timestamps = pd.date_range(
        start=datetime.now() - timedelta(days=days),
        end=datetime.now(),
        freq='H'  # Hourly data
    )
    
    data = []
    for ts in timestamps:
        # Simulate realistic patterns
        hour = ts.hour
        day_of_week = ts.dayofweek
        
        # Base pollution levels with daily cycles
        base_pm25 = 30 + 15 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 5)
        base_pm10 = 50 + 20 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 7)
        base_o3 = 40 + 25 * np.sin(2 * np.pi * (hour - 12) / 24) + np.random.normal(0, 6)
        base_no2 = 25 + 10 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 4)
        
        # Higher pollution on weekdays
        weekday_factor = 1.3 if day_of_week < 5 else 1.0
        
        # Weather effects
        temperature = 20 + 10 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 2)
        humidity = 60 + 20 * np.sin(2 * np.pi * (hour + 6) / 24) + np.random.normal(0, 5)
        wind_speed = 5 + 3 * np.random.random()
        pressure = 1013 + np.random.normal(0, 5)
        
        for pollutant, base_value in [
            ('PM2.5', base_pm25 * weekday_factor),
            ('PM10', base_pm10 * weekday_factor),
            ('O3', base_o3),
            ('NO2', base_no2 * weekday_factor)
        ]:
            data.append({
                'timestamp': ts,
                'pollutant_type': pollutant,
                'value': max(0, base_value),
                'lat': 34.05 + np.random.normal(0, 0.1),
                'lon': -118.25 + np.random.normal(0, 0.1),
                'temperature': temperature,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'pressure': pressure,
                'source': 'synthetic',
                'city': 'Los Angeles',
                'location': 'Downtown'
            })
    
    df = pd.DataFrame(data)
    print(f"Generated {len(df)} records")
    return df

def train_all_models():
    """Train models for all pollutants"""
    print("=" * 60)
    print("MANUAL MODEL TRAINING SCRIPT")
    print("=" * 60)
    
    # Initialize forecasting engine (absolute path)
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "../models")
    model_dir = os.path.abspath(model_dir)
    print(f"Models will be saved to: {model_dir}\n")
    
    engine = ForecastingEngine(model_dir=model_dir)
    
    # Generate synthetic training data
    df = generate_synthetic_data(days=60)  # 60 days = ~1400+ records per pollutant
    
    # Train models for each pollutant
    pollutants = ['PM2.5', 'PM10', 'O3', 'NO2']
    
    for pollutant in pollutants:
        print(f"\n{'=' * 60}")
        print(f"Training model for {pollutant}")
        print(f"{'=' * 60}")
        
        # Filter data for this pollutant
        pollutant_data = df[df['pollutant_type'] == pollutant].copy()
        print(f"Training data size: {len(pollutant_data)} records")
        
        if len(pollutant_data) < 100:
            print(f"⚠️  Insufficient data for {pollutant}, skipping...")
            continue
        
        try:
            # Train model
            metrics = engine.train_model(pollutant_data, pollutant, model_type='xgboost')
            
            print(f"\n✅ Model trained successfully!")
            print(f"   R² Score: {metrics['r2_score']:.4f}")
            print(f"   RMSE: {metrics['rmse']:.4f}")
            print(f"   MAE: {metrics['mae']:.4f}")
            print(f"   MAPE: {metrics['mape']:.2f}%")
            
        except Exception as e:
            print(f"❌ Error training model for {pollutant}: {e}")
    
    print(f"\n{'=' * 60}")
    print("✅ MODEL TRAINING COMPLETE!")
    print(f"{'=' * 60}")
    print("\nModels saved to: ../models/")
    print("\nYou can now use these models for forecasting!")
    print("\nTo verify, check the models folder:")
    print("  ls ../models/")

if __name__ == "__main__":
    train_all_models()
