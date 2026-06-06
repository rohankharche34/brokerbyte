# backend/config.py - UPDATED
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Base
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is required. Set it in .env or export it.")
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # API Settings
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', 5000))
    
    # Database
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'shared_data', 'brokerbyte.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    if len(JWT_SECRET_KEY.encode('utf-8')) < 32:
        raise ValueError(f"JWT_SECRET_KEY must be at least 32 bytes (got {len(JWT_SECRET_KEY.encode('utf-8'))}). "
                         f"Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\"")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5000').split(',')

    # Paths
    DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'shared_data')
    UPLOAD_FOLDER = os.path.join(DATA_DIR, 'uploads')
    
    # Anomaly Detection
    ANOMALY_THRESHOLDS = {
        'Low': 0.3,
        'Medium': 0.6,
        'High': 0.8,
        'Critical': 0.95
    }

config = Config()