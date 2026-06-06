# backend/anomaly_detection.py - FIXED
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import logging
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config

logger = logging.getLogger(__name__)

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
    
    def generate_sample_data(self):
        """Generate sample stock data for demonstration"""
        np.random.seed(42)
        dates = pd.date_range(end=datetime.now(), periods=90, freq='D')
        tickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
        
        data = []
        for ticker in tickers:
            base_price = np.random.uniform(100, 500)
            for date in dates:
                price = base_price * (1 + np.random.normal(0, 0.02))
                volume = np.random.randint(1000000, 5000000)
                data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'ticker': ticker,
                    'price': round(price, 2),
                    'volume': volume
                })
        
        return pd.DataFrame(data)
    
    def train_model(self, data):
        """Train anomaly detection model"""
        try:
            features = data[['price', 'volume']].values
            self.model.fit(features)
            self.is_trained = True
            return True
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False
    
    def detect_anomalies(self, data):
        """Detect anomalies in stock data"""
        if not self.is_trained:
            self.train_model(data)
        
        features = data[['price', 'volume']].values
        anomalies = self.model.predict(features)
        scores = self.model.decision_function(features)
        
        data['anomaly_score'] = 1 - (scores - scores.min()) / (scores.max() - scores.min())
        data['is_anomaly'] = anomalies == -1
        
        return data
    
    def get_risk_level(self, score):
        """Get risk level based on anomaly score"""
        for level, threshold in config.ANOMALY_THRESHOLDS.items():
            if score <= threshold:
                return level
        return 'Critical'

anomaly_detector = AnomalyDetector()