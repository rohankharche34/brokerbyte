# backend/auth.py - FIXED
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import sqlite3
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection
from config import config

class AuthSystem:
    def hash_password(self, password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password, hashed_password):
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def validate_password_strength(self, password):
        if len(password) < 8:
            return False, 'Password must be at least 8 characters long'
        if not any(c.isupper() for c in password):
            return False, 'Password must contain at least one uppercase letter'
        if not any(c.islower() for c in password):
            return False, 'Password must contain at least one lowercase letter'
        if not any(c.isdigit() for c in password):
            return False, 'Password must contain at least one digit'
        return True, ''

    def create_user(self, username, email, password, full_name, role='user'):
        valid, msg = self.validate_password_strength(password)
        if not valid:
            raise ValueError(msg)
        conn = get_db_connection()
        try:
            password_hash = self.hash_password(password)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name, role)
                VALUES (?, ?, ?, ?, ?)
            ''', (username, email, password_hash, full_name, role))
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def authenticate_user(self, username, password):
        conn = get_db_connection()
        try:
            user = conn.execute(
                'SELECT * FROM users WHERE username = ? AND is_active = 1',
                (username,)
            ).fetchone()
            
            if user and self.verify_password(password, user['password_hash']):
                return dict(user)
            return None
        finally:
            conn.close()
    
    def generate_token(self, user_data):
        payload = {
            'user_id': user_data['id'],
            'username': user_data['username'],
            'role': user_data['role'],
            'exp': datetime.now(timezone.utc) + config.JWT_ACCESS_TOKEN_EXPIRES
        }
        return jwt.encode(payload, config.JWT_SECRET_KEY, algorithm='HS256')
    
    def verify_token(self, token):
        try:
            payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

auth_system = AuthSystem()