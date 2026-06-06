from datetime import datetime
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection


class AuditTrail:
    def record_action(self, user_id, action_type, details=None):
        conn = get_db_connection()
        try:
            conn.execute(
                'INSERT INTO audit_trail (user_id, action_type, details) VALUES (?, ?, ?)',
                (user_id, action_type, json.dumps(details) if details else None),
            )
            conn.commit()
        finally:
            conn.close()

    def get_audit_log(self, limit=100, offset=0):
        conn = get_db_connection()
        try:
            total = conn.execute('SELECT COUNT(*) FROM audit_trail').fetchone()[0]
            results = conn.execute(
                '''SELECT a.*, u.username
                   FROM audit_trail a
                   LEFT JOIN users u ON a.user_id = u.id
                   ORDER BY a.timestamp DESC
                   LIMIT ? OFFSET ?''',
                (limit, offset),
            ).fetchall()
            return [dict(row) for row in results], total
        finally:
            conn.close()


audit_trail = AuditTrail()
