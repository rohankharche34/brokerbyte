import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from app import app
from database import init_database


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        init_database()
        yield client


def test_health_check(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'BrokerByte API'


def test_login_success(client):
    resp = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'admin',
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'token' in data
    assert data['user']['username'] == 'admin'


def test_login_invalid_credentials(client):
    resp = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'wrong',
    })
    assert resp.status_code == 401


def test_register(client):
    ts = int(time.time())
    resp = client.post('/api/auth/register', json={
        'username': f'testuser{ts}',
        'email': f'test{ts}@example.com',
        'password': 'TestPass123',
        'full_name': 'Test User',
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'token' in data


def test_dashboard_requires_auth(client):
    resp = client.get('/api/dashboard')
    assert resp.status_code == 401


def test_dashboard_authenticated(client):
    login = client.post('/api/auth/login', json={
        'username': 'admin', 'password': 'admin',
    })
    token = login.get_json()['token']
    resp = client.get('/api/dashboard', headers={
        'Authorization': f'Bearer {token}',
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'anomalies' in data
    assert 'stats' in data


def test_audit_trail(client):
    login = client.post('/api/auth/login', json={
        'username': 'admin', 'password': 'admin',
    })
    token = login.get_json()['token']
    resp = client.get('/api/audit/trail?limit=10', headers={
        'Authorization': f'Bearer {token}',
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'entries' in data
