import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class DataValidator:
    """
    Validate data quality by comparing TEMPO satellite data 
    with ground sensor measurements.
    """
    
    def __init__(self, discrepancy_threshold: float = 0.30):
        self.discrepancy_threshold = discrepancy_threshold
    
    def validate_against_ground(
        self,
        tempo_data: List[Dict],
        ground_data: List[Dict],
        max_distance_km: float = 10.0,
        max_time_diff_hours: float = 1.0
    ) -> List[Dict]:
        """
        Compare TEMPO satellite data with ground measurements.
        
        Args:
            tempo_data: TEMPO satellite records
            ground_data: Ground sensor records
            max_distance_km: Maximum distance for spatial matching (km)
            max_time_diff_hours: Maximum time difference for temporal matching
        
        Returns:
            List of validation results with confidence scores
        """
        if not tempo_data or not ground_data:
            logger.warning("Insufficient data for validation")
            return []
        
        tempo_df = pd.DataFrame(tempo_data)
        ground_df = pd.DataFrame(ground_data)
        
        # Convert timestamps to datetime
        tempo_df["timestamp"] = pd.to_datetime(tempo_df["timestamp"])
        ground_df["timestamp"] = pd.to_datetime(ground_df["timestamp"])
        
        validation_results = []
        
        # For each TEMPO measurement, find matching ground measurements
        for _, tempo_record in tempo_df.iterrows():
            matches = self._find_matching_ground_measurements(
                tempo_record,
                ground_df,
                max_distance_km,
                max_time_diff_hours
            )
            
            if matches:
                validation = self._calculate_validation_metrics(
                    tempo_record,
                    matches
                )
                validation_results.append(validation)
        
        logger.info(f"Validated {len(validation_results)} TEMPO records")
        return validation_results
    
    def _find_matching_ground_measurements(
        self,
        tempo_record: pd.Series,
        ground_df: pd.DataFrame,
        max_distance_km: float,
        max_time_diff_hours: float
    ) -> pd.DataFrame:
        """Find ground measurements that match TEMPO record spatially and temporally"""
        # Filter by pollutant type
        matches = ground_df[
            ground_df["pollutant_type"] == tempo_record["pollutant_type"]
        ].copy()
        
        if matches.empty:
            return matches
        
        # Calculate spatial distance (approximate)
        matches["distance_km"] = self._haversine_distance(
            tempo_record["lat"],
            tempo_record["lon"],
            matches["lat"],
            matches["lon"]
        )
        
        # Filter by distance
        matches = matches[matches["distance_km"] <= max_distance_km]
        
        # Calculate time difference
        matches["time_diff_hours"] = abs(
            (matches["timestamp"] - tempo_record["timestamp"]).dt.total_seconds() / 3600
        )
        
        # Filter by time
        matches = matches[matches["time_diff_hours"] <= max_time_diff_hours]
        
        return matches
    
    def _calculate_validation_metrics(
        self,
        tempo_record: pd.Series,
        ground_matches: pd.DataFrame
    ) -> Dict:
        """Calculate validation metrics comparing TEMPO and ground data"""
        tempo_value = tempo_record["value"]
        ground_values = ground_matches["value"].values
        ground_mean = np.mean(ground_values)
        ground_std = np.std(ground_values)
        
        # Calculate relative difference
        if ground_mean > 0:
            relative_diff = abs(tempo_value - ground_mean) / ground_mean
        else:
            relative_diff = 0.0
        
        # Calculate absolute difference
        absolute_diff = abs(tempo_value - ground_mean)
        
        # Determine if discrepancy exceeds threshold
        high_discrepancy = relative_diff > self.discrepancy_threshold
        
        # Calculate confidence score (inverse of discrepancy)
        confidence = max(0.0, 1.0 - relative_diff)
        
        # Determine confidence level
        if confidence >= 0.8:
            confidence_level = "high"
        elif confidence >= 0.6:
            confidence_level = "medium"
        else:
            confidence_level = "low"
        
        return {
            "timestamp": tempo_record["timestamp"].isoformat(),
            "lat": tempo_record["lat"],
            "lon": tempo_record["lon"],
            "pollutant_type": tempo_record["pollutant_type"],
            "tempo_value": tempo_value,
            "ground_mean": ground_mean,
            "ground_std": ground_std,
            "ground_count": len(ground_matches),
            "relative_diff": relative_diff,
            "absolute_diff": absolute_diff,
            "high_discrepancy": high_discrepancy,
            "confidence": confidence,
            "confidence_level": confidence_level,
            "validation_status": "validated"
        }
    
    def _haversine_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: pd.Series,
        lon2: pd.Series
    ) -> pd.Series:
        """
        Calculate haversine distance between points in kilometers.
        Vectorized for efficiency.
        """
        R = 6371  # Earth radius in kilometers
        
        lat1_rad = np.radians(lat1)
        lat2_rad = np.radians(lat2)
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = np.sin(dlat / 2) ** 2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2) ** 2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        
        return R * c
    
    def generate_quality_report(
        self,
        validation_results: List[Dict]
    ) -> Dict:
        """Generate quality assurance report"""
        if not validation_results:
            return {
                "total_validations": 0,
                "message": "No validation data available"
            }
        
        df = pd.DataFrame(validation_results)
        
        report = {
            "total_validations": len(df),
            "high_confidence_count": len(df[df["confidence_level"] == "high"]),
            "medium_confidence_count": len(df[df["confidence_level"] == "medium"]),
            "low_confidence_count": len(df[df["confidence_level"] == "low"]),
            "high_discrepancy_count": len(df[df["high_discrepancy"]]),
            "mean_confidence": df["confidence"].mean(),
            "mean_relative_diff": df["relative_diff"].mean(),
            "pollutant_breakdown": df.groupby("pollutant_type").agg({
                "confidence": "mean",
                "relative_diff": "mean",
                "high_discrepancy": "sum"
            }).to_dict()
        }
        
        # Add percentages
        report["high_confidence_pct"] = (report["high_confidence_count"] / report["total_validations"]) * 100
        report["high_discrepancy_pct"] = (report["high_discrepancy_count"] / report["total_validations"]) * 100
        
        return report
    
    def flag_anomalies(
        self,
        data: List[Dict],
        z_threshold: float = 3.0
    ) -> List[Dict]:
        """
        Flag anomalous values using z-score method.
        
        Args:
            data: Harmonized data records
            z_threshold: Z-score threshold for anomaly detection
        
        Returns:
            Data with anomaly flags added
        """
        df = pd.DataFrame(data)
        
        if df.empty:
            return data
        
        # Calculate z-scores by pollutant type
        for pollutant in df["pollutant_type"].unique():
            mask = df["pollutant_type"] == pollutant
            values = df.loc[mask, "value"]
            
            if len(values) > 2:
                mean = values.mean()
                std = values.std()
                
                if std > 0:
                    z_scores = np.abs((values - mean) / std)
                    df.loc[mask, "z_score"] = z_scores
                    df.loc[mask, "is_anomaly"] = z_scores > z_threshold
                else:
                    df.loc[mask, "z_score"] = 0
                    df.loc[mask, "is_anomaly"] = False
        
        # Fill NaN values
        df["is_anomaly"] = df["is_anomaly"].fillna(False)
        df["z_score"] = df["z_score"].fillna(0)
        
        logger.info(f"Flagged {df['is_anomaly'].sum()} anomalies out of {len(df)} records")
        
        return df.to_dict('records')


# Example usage
if __name__ == "__main__":
    validator = DataValidator(discrepancy_threshold=0.30)
    
    # Test with sample data
    tempo_sample = [{
        "timestamp": "2024-01-01T12:00:00",
        "lat": 34.05,
        "lon": -118.25,
        "pollutant_type": "NO2",
        "value": 25.0
    }]
    
    ground_sample = [{
        "timestamp": "2024-01-01T12:15:00",
        "lat": 34.06,
        "lon": -118.26,
        "pollutant_type": "NO2",
        "value": 28.0
    }]
    
    results = validator.validate_against_ground(tempo_sample, ground_sample)
    print(f"Validation results: {results}")
    
    if results:
        report = validator.generate_quality_report(results)
        print(f"Quality report: {report}")
