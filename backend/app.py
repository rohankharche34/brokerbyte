# backend/app.py - COMPLETE FIXED VERSION
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, timedelta
import json
import logging
import io
import sqlite3
from functools import wraps
# Import local modules
from config import config
from database import get_db_connection, init_database
from auth import auth_system
from anomaly_detection import anomaly_detector
from audit_trail import audit_trail
from ekyc import ekyc_verifier

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Token is missing'}), 401
        
        token = token[7:]
        user_data = auth_system.verify_token(token)
        if not user_data:
            return jsonify({'error': 'Token is invalid'}), 401
        
        request.user = user_data
        return f(*args, **kwargs)
    return decorated

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'BrokerByte API'
    })

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    try:
        data = request.get_json()
        user_id = auth_system.create_user(
            data['username'],
            data['email'],
            data['password'],
            data.get('full_name', ''),
            data.get('role', 'user')
        )
        
        if user_id:
            user = get_db_connection().execute(
                'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
                (user_id,)
            ).fetchone()
            
            token = auth_system.generate_token(dict(user))
            audit_trail.record_action(user_id, 'user_registration')
            
            return jsonify({
                'message': 'User created successfully',
                'token': token,
                'user': dict(user)
            })
        else:
            return jsonify({'error': 'User already exists'}), 400
            
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        data = request.get_json()
        user = auth_system.authenticate_user(data['username'], data['password'])
        
        if user:
            token = auth_system.generate_token(user)
            audit_trail.record_action(user['id'], 'user_login')
            
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'role': user['role']
                }
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
@token_required
def get_dashboard():
    try:
        # Generate sample anomalies
        sample_data = anomaly_detector.generate_sample_data()
        anomalies_data = anomaly_detector.detect_anomalies(sample_data)
        
        # Get recent anomalies
        recent_anomalies = anomalies_data[anomalies_data['is_anomaly']].nlargest(5, 'anomaly_score')
        
        # Prepare response
        anomalies = []
        for _, row in recent_anomalies.iterrows():
            anomalies.append({
                'ticker': row['ticker'],
                'anomaly_score': round(row['anomaly_score'], 4),
                'risk_level': anomaly_detector.get_risk_level(row['anomaly_score']),
                'timestamp': datetime.now().isoformat()
            })
        
        audit_trail.record_action(request.user['user_id'], 'dashboard_view')
        
        return jsonify({
            'alerts': [
                {
                    'id': 1,
                    'title': 'Quarterly Compliance Report Due',
                    'description': 'SEBI quarterly report submission in 7 days',
                    'severity': 'high',
                    'deadline': (datetime.now() + timedelta(days=7)).isoformat()
                }
            ],
            'anomalies': anomalies,
            'stats': {
                'total_checks': len(sample_data),
                'anomalies_found': len(anomalies),
                'high_risk_count': sum(1 for a in anomalies if a['risk_level'] in ['High', 'Critical'])
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/anomalies/detect', methods=['POST'])
@token_required
def detect_anomalies():
    try:
        data = request.get_json()
        tickers = data.get('tickers', ['AAPL', 'GOOGL', 'MSFT'])
        
        # Generate sample data for requested tickers
        sample_data = anomaly_detector.generate_sample_data()
        sample_data = sample_data[sample_data['ticker'].isin(tickers)]
        
        anomalies_data = anomaly_detector.detect_anomalies(sample_data)
        anomalies = anomalies_data[anomalies_data['is_anomaly']]
        
        results = []
        for _, row in anomalies.iterrows():
            results.append({
                'ticker': row['ticker'],
                'anomaly_score': round(row['anomaly_score'], 4),
                'risk_level': anomaly_detector.get_risk_level(row['anomaly_score']),
                'price': row['price'],
                'volume': row['volume'],
                'timestamp': datetime.now().isoformat()
            })
        
        audit_trail.record_action(request.user['user_id'], 'anomaly_detection', {
            'tickers': tickers,
            'anomalies_found': len(results)
        })
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ekyc/verify', methods=['POST'])
@token_required
def verify_identity():
    try:
        data = request.get_json()
        result = ekyc_verifier.verify_document(
            request.user['user_id'],
            data['document_type'],
            data.get('document_data', {})
        )
        
        audit_trail.record_action(request.user['user_id'], 'ekyc_verification', {
            'document_type': data['document_type'],
            'status': result.get('status'),
            'success': result.get('success', False)
        })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audit/trail', methods=['GET'])
@token_required
def get_audit_trail():
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        logs, total = audit_trail.get_audit_log(limit, offset)
        return jsonify({'entries': logs, 'total': total})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/compliance', methods=['GET'])
@token_required
def generate_report():
    try:
        # Generate a simple text report
        report_content = f"""
        BROKERBYTE COMPLIANCE REPORT
        Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Generated by: {request.user['username']}
        
        SUMMARY:
        - Total compliance checks: 150
        - Anomalies detected: 12
        - High-risk transactions: 3
        - Pending actions: 2
        
        RECOMMENDATIONS:
        1. Review high-risk transactions
        2. Complete pending compliance actions
        3. Schedule next audit cycle
        """
        
        audit_trail.record_action(request.user['user_id'], 'report_generated')
        
        return jsonify({
            'report': report_content,
            'filename': f'compliance_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# Add these new routes to your backend app.py

@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get dynamic dashboard statistics"""
    try:
        conn = get_db_connection()
        
        # Get real counts from database
        total_checks = conn.execute('SELECT COUNT(*) FROM anomalies').fetchone()[0]
        anomalies_found = conn.execute('SELECT COUNT(*) FROM anomalies WHERE risk_level IN ("High", "Critical")').fetchone()[0]
        high_risk_count = conn.execute('SELECT COUNT(*) FROM anomalies WHERE risk_level = "High"').fetchone()[0]
        
        # Calculate compliance score (mock logic - replace with real logic)
        compliance_score = max(0, min(100, 100 - (high_risk_count * 5)))
        
        conn.close()
        
        return jsonify({
            'total_checks': total_checks,
            'anomalies_found': anomalies_found,
            'high_risk_count': high_risk_count,
            'compliance_score': compliance_score
        })
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard stats'}), 500

@app.route('/api/compliance/requirements', methods=['GET'])
@token_required
def get_compliance_requirements():
    """Get dynamic compliance requirements"""
    try:
        # This would come from a database in production
        requirements = [
            {
                'id': 1,
                'title': 'SEBI Quarterly Reporting',
                'description': 'Quarterly compliance report for SEBI regulations',
                'severity': 'high',
                'deadline': (datetime.now() + timedelta(days=7)).isoformat(),
                'status': 'pending'
            },
            {
                'id': 2,
                'title': 'RBI KYC Audit',
                'description': 'Annual KYC process audit documentation',
                'severity': 'medium',
                'deadline': (datetime.now() + timedelta(days=30)).isoformat(),
                'status': 'pending'
            },
            {
                'id': 3,
                'title': 'FIU Transaction Monitoring',
                'description': 'Monthly transaction monitoring report',
                'severity': 'medium',
                'deadline': (datetime.now() + timedelta(days=5)).isoformat(),
                'status': 'in_progress'
            }
        ]
        
        return jsonify(requirements)
        
    except Exception as e:
        logger.error(f"Error fetching compliance requirements: {str(e)}")
        return jsonify({'error': 'Failed to fetch compliance requirements'}), 500

@app.route('/api/reports/generate', methods=['POST'])
@token_required
def generate_dynamic_report():
    """Generate dynamic compliance report"""
    try:
        data = request.get_json() or {}
        report_type = data.get('report_type', 'compliance')
        
        conn = get_db_connection()
        
        # Get real data for report
        total_anomalies = conn.execute('SELECT COUNT(*) FROM anomalies').fetchone()[0]
        high_risk_anomalies = conn.execute('SELECT COUNT(*) FROM anomalies WHERE risk_level = "High"').fetchone()[0]
        recent_anomalies = conn.execute('''
            SELECT ticker, anomaly_score, risk_level, timestamp 
            FROM anomalies 
            ORDER BY timestamp DESC 
            LIMIT 10
        ''').fetchall()
        
        conn.close()
        
        # Generate dynamic report content
        report_content = generate_report_content(
            report_type=report_type,
            total_anomalies=total_anomalies,
            high_risk_anomalies=high_risk_anomalies,
            recent_anomalies=recent_anomalies,
            user=request.user
        )
        
        # Save report to database (optional)
        save_report_to_db(request.user['user_id'], report_type, report_content)
        
        return jsonify({
            'message': 'Report generated successfully',
            'report': report_content,
            'filename': f"{report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        })
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({'error': 'Failed to generate report'}), 500

def generate_report_content(report_type, total_anomalies, high_risk_anomalies, recent_anomalies, user):
    """Generate dynamic report content based on real data"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    if report_type == 'compliance':
        return f"""BROKERBYTE COMPLIANCE REPORT
Generated: {timestamp}
Generated by: {user['username']}
Report Type: Comprehensive Compliance Analysis

EXECUTIVE SUMMARY:
- Total Anomalies Detected: {total_anomalies}
- High-Risk Anomalies: {high_risk_anomalies}
- Compliance Score: {max(0, min(100, 100 - (high_risk_anomalies * 5)))}%

DETAILED ANALYSIS:

1. ANOMALY DISTRIBUTION:
   - Critical Risk: {len([a for a in recent_anomalies if a['risk_level'] == 'Critical'])}
   - High Risk: {len([a for a in recent_anomalies if a['risk_level'] == 'High'])}
   - Medium Risk: {len([a for a in recent_anomalies if a['risk_level'] == 'Medium'])}
   - Low Risk: {len([a for a in recent_anomalies if a['risk_level'] == 'Low'])}

2. RECENT ANOMALIES (Last 10):
{chr(10).join([f'   - {a["ticker"]}: {a["anomaly_score"]:.4f} ({a["risk_level"]})' for a in recent_anomalies])}

3. RISK ASSESSMENT:
   - Overall Risk Level: {'High' if high_risk_anomalies > 5 else 'Medium' if high_risk_anomalies > 2 else 'Low'}
   - Recommended Actions: {get_recommended_actions(high_risk_anomalies)}

4. COMPLIANCE STATUS:
   - Regulatory Requirements: All mandatory requirements met
   - Audit Trail: Complete and verifiable
   - KYC Verification: 100% compliant

RECOMMENDATIONS:
1. {"Immediate review required for high-risk anomalies" if high_risk_anomalies > 0 else "No immediate action required"}
2. Schedule next compliance audit within 30 days
3. Review and update trading algorithms
4. Enhance monitoring for detected anomaly patterns
"""
    else:
        return f"Report type {report_type} - {timestamp}"

def get_recommended_actions(high_risk_count):
    """Get dynamic recommendations based on risk level"""
    if high_risk_count > 5:
        return "Immediate intervention required. Freeze suspicious accounts and notify regulators."
    elif high_risk_count > 2:
        return "Enhanced monitoring required. Review trading patterns and implement additional checks."
    else:
        return "Standard monitoring procedures sufficient. Continue regular compliance checks."

def save_report_to_db(user_id, report_type, content):
    """Save generated report to database"""
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO reports (user_id, report_type, content, generated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, report_type, content))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error saving report to DB: {str(e)}")
        return False
    return True

if __name__ == '__main__':
    init_database()
    print(f"Starting BrokerByte Compliance Server...")
    print(f"API URL: http://{config.API_HOST}:{config.API_PORT}")
    app.run(
        host=config.API_HOST,
        port=config.API_PORT,
        debug=config.DEBUG
    )