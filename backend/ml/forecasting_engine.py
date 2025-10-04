"""Machine Learning Forecasting Engine for Air Quality Predictions"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import joblib
from pathlib import Path

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from xgboost import XGBRegressor

class ForecastingEngine:
    """ML-based air quality forecasting"""
    
    def __init__(self, model_dir: str = "./models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        self.models = {}
        self.feature_columns = []
        
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features for ML models"""
        df = df.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Time-based features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        df['day_of_year'] = df['timestamp'].dt.dayofyear
        
        # Cyclical encoding for time features
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        # Spatial features
        if 'lat' in df.columns and 'lon' in df.columns:
            df['lat'] = df['lat'].fillna(0)
            df['lon'] = df['lon'].fillna(0)
        
        # Weather features
        weather_cols = ['temperature', 'humidity', 'wind_speed', 'pressure']
        for col in weather_cols:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        # Lag features (previous values)
        for lag in [1, 2, 3, 6, 12, 24]:
            if 'value' in df.columns:
                df[f'lag_{lag}'] = df['value'].shift(lag)
        
        # Rolling statistics
        if 'value' in df.columns:
            df['rolling_mean_3'] = df['value'].rolling(window=3, min_periods=1).mean()
            df['rolling_mean_6'] = df['value'].rolling(window=6, min_periods=1).mean()
            df['rolling_mean_12'] = df['value'].rolling(window=12, min_periods=1).mean()
            df['rolling_mean_24'] = df['value'].rolling(window=24, min_periods=1).mean()
            df['rolling_std_3'] = df['value'].rolling(window=3, min_periods=1).std()
            df['rolling_std_12'] = df['value'].rolling(window=12, min_periods=1).std()
        
        # Drop rows with NaN in lag features (first few rows)
        df = df.dropna(subset=[f'lag_{i}' for i in [1, 2, 3]])
        
        return df
    
    def train_model(self, df: pd.DataFrame, pollutant: str, model_type: str = 'xgboost') -> Dict:
        """Train forecasting model for specific pollutant"""
        print(f"Training {model_type} model for {pollutant}...")
        
        # Prepare features
        df_features = self.prepare_features(df)
        
        # Define feature columns (exclude target and metadata)
        exclude_cols = ['timestamp', 'value', 'pollutant_type', 'source', 'city', 'location']
        self.feature_columns = [col for col in df_features.columns if col not in exclude_cols]
        
        # Prepare X and y
        X = df_features[self.feature_columns].fillna(0)
        y = df_features['value']
        
        # Split data (time-series split - no shuffle)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, shuffle=False, random_state=42
        )
        
        # Train model
        if model_type == 'xgboost':
            model = XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'random_forest':
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
        elif model_type == 'gradient_boosting':
            model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        metrics = {
            'r2_score': r2_score(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'mape': np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        }
        
        print(f"Model Performance for {pollutant}:")
        print(f"  R² Score: {metrics['r2_score']:.4f}")
        print(f"  RMSE: {metrics['rmse']:.4f}")
        print(f"  MAE: {metrics['mae']:.4f}")
        print(f"  MAPE: {metrics['mape']:.2f}%")
        
        # Store model
        self.models[pollutant] = model
        
        # Save model
        model_path = self.model_dir / f"{pollutant}_{model_type}.joblib"
        joblib.dump({'model': model, 'features': self.feature_columns}, model_path)
        print(f"Model saved to {model_path}")
        
        return metrics
    
    def load_model(self, pollutant: str, model_type: str = 'xgboost'):
        """Load trained model from disk"""
        model_path = self.model_dir / f"{pollutant}_{model_type}.joblib"
        if model_path.exists():
            data = joblib.load(model_path)
            self.models[pollutant] = data['model']
            self.feature_columns = data['features']
            print(f"Loaded model for {pollutant} from {model_path}")
            return True
        return False
    
    def predict(self, df: pd.DataFrame, pollutant: str, hours: int = 24) -> List[Dict]:
        """Generate forecasts for specified hours ahead"""
        if pollutant not in self.models:
            print(f"No model found for {pollutant}")
            return []
        
        model = self.models[pollutant]
        df_features = self.prepare_features(df)
        
        # Get the last known values
        last_row = df_features.iloc[-1]
        last_timestamp = pd.to_datetime(last_row['timestamp'])
        
        forecasts = []
        current_features = last_row[self.feature_columns].to_dict()
        
        for hour in range(1, hours + 1):
            # Predict next hour
            X_pred = pd.DataFrame([current_features])
            prediction = model.predict(X_pred)[0]
            
            # Create forecast record
            forecast_time = last_timestamp + timedelta(hours=hour)
            forecast = {
                'timestamp': forecast_time.isoformat(),
                'pollutant_type': pollutant,
                'predicted_value': float(prediction),
                'forecast_hour': hour,
                'confidence': 'medium'  # Simplified confidence
            }
            forecasts.append(forecast)
            
            # Update features for next iteration
            current_features['hour'] = forecast_time.hour
            current_features['hour_sin'] = np.sin(2 * np.pi * forecast_time.hour / 24)
            current_features['hour_cos'] = np.cos(2 * np.pi * forecast_time.hour / 24)
            
            # Update lag features
            if 'lag_1' in current_features:
                for lag in range(24, 1, -1):
                    if f'lag_{lag}' in current_features and f'lag_{lag-1}' in current_features:
                        current_features[f'lag_{lag}'] = current_features[f'lag_{lag-1}']
                current_features['lag_1'] = prediction
        
        return forecasts
    
    def forecast_for_location(self, lat: float, lon: float, pollutant: str, hours: int = 24,
                            historical_data: pd.DataFrame = None) -> List[Dict]:
        """Generate forecast for specific location"""
        if historical_data is None or historical_data.empty:
            return []
        
        # Filter data for location (within 0.1 degree radius)
        location_data = historical_data[
            (abs(historical_data['lat'] - lat) < 0.1) &
            (abs(historical_data['lon'] - lon) < 0.1) &
            (historical_data['pollutant_type'] == pollutant)
        ].copy()
        
        if location_data.empty:
            return []
        
        return self.predict(location_data, pollutant, hours)
