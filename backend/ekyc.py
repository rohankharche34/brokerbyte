# backend/ekyc.py - FIXED
import os
import re
import json
from datetime import datetime
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection

class eKYCVerifier:
    def __init__(self):
        self.document_patterns = {
            'aadhaar': r'\b\d{4}\s\d{4}\s\d{4}\b',
            'pan': r'[A-Z]{5}\d{4}[A-Z]{1}',
            'passport': r'[A-Z]{1}\d{7}'
        }
    
    def verify_document(self, user_id, document_type, document_data):
        """Simulate document verification (in real app, use OCR)"""
        try:
            # Simulate document verification logic
            verification_score = 0.8  # Simulated score
            
            status = "verified" if verification_score >= 0.7 else "pending"
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO ekyc_verifications (user_id, document_type, status, verification_score, details)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, document_type, status, verification_score, 
                 json.dumps({"simulated": True, "score": verification_score})))
            
            conn.commit()
            verification_id = cursor.lastrowid
            
            return {
                "success": True,
                "verification_id": verification_id,
                "status": status,
                "score": verification_score,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

ekyc_verifier = eKYCVerifier()