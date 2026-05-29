# BrokerByte - Financial Compliance Dashboard

A financial compliance monitoring dashboard for brokerage firms and regulators. Uses machine learning (Isolation Forest) for anomaly detection in trading data, eKYC identity verification, audit trail logging, and compliance report generation.

## Features

- **Dashboard** — Real-time compliance overview with anomaly alerts and compliance stats
- **Anomaly Detection** — ML-based detection using Isolation Forest on price/volume data, with risk level classification (Low/Medium/High/Critical)
- **eKYC Verification** — Electronic Know Your Customer identity verification with support for Aadhaar, PAN, and Passport documents
- **Audit Trail** — Paginated log of all user actions with timestamps and user details
- **Compliance Reports** — Auto-generated compliance reports with anomaly distribution and risk assessment
- **Authentication** — JWT-based auth with bcrypt password hashing, rate-limited login/register, and password strength validation
- **Dark Mode** — CSS custom properties toggle with localStorage persistence
- **Accessibility** — ARIA labels, semantic HTML, keyboard-navigable forms
- **Database Migrations** — Alembic-managed schema versioning

## Architecture

```
Browser ──▶ Vite Dev Server (port 3000)
               │
               ├── proxies /api ──▶ Flask Backend (port 5000)
               │                       │
               │                       ├── /auth/login, /auth/register
               │                       ├── /dashboard
               │                       ├── /anomalies/detect
               │                       ├── /ekyc/verify
               │                       ├── /audit/trail
               │                       └── /reports/compliance
               │
               └── serves static assets (React SPA)
```

The frontend is a single-page React app. In development, Vite proxies `/api` requests to the Flask backend. In production, nginx (or your web server) handles this proxy.

### Frontend Components

| Component            | Route           | Description                              |
| -------------------- | --------------- | ---------------------------------------- |
| Login                | `/login`        | Auth form with inline validation         |
| Dashboard            | `/dashboard`    | Stats cards, alerts, anomaly list        |
| AnomalyDetection     | `/anomalies`    | Trigger ML detection on selected tickers |
| eKYCVerification     | `/ekyc`         | Submit documents for identity verification |
| AuditTrail           | `/audit`        | Paginated user activity log              |
| Reports              | `/reports`      | Generate and view compliance reports     |

### Backend Modules

| Module               | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `app.py`             | Flask routes, CORS, rate limiting, auth decorator |
| `auth.py`            | User creation, JWT token generation/validation, password strength |
| `config.py`          | Environment-based configuration with validation |
| `database.py`        | SQLite connection, schema initialization       |
| `anomaly_detection.py` | Isolation Forest model, sample data generation, risk scoring |
| `audit_trail.py`     | Action logging with paginated querying         |
| `ekyc.py`            | Document verification simulation               |

### API Endpoints

| Method | Path               | Auth Required | Description              |
| ------ | ------------------ | ------------- | ------------------------ |
| GET    | `/api/health`      | No            | Health check             |
| POST   | `/api/auth/login`  | No (rate-limited) | User login           |
| POST   | `/api/auth/register` | No (rate-limited) | User registration    |
| GET    | `/api/dashboard`   | Yes           | Dashboard overview       |
| POST   | `/api/anomalies/detect` | Yes      | Run anomaly detection    |
| POST   | `/api/ekyc/verify` | Yes           | Verify identity document |
| GET    | `/api/audit/trail` | Yes           | Paginated audit log      |
| GET    | `/api/reports/compliance` | Yes    | Generate compliance report |

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React 18, Vite 5, Bootstrap 5, React Router 6 |
| Backend  | Python 3, Flask, scikit-learn, pandas, numpy  |
| Database | SQLite                         |
| Auth     | JWT (PyJWT) + bcrypt           |
| Infra    | Docker, Docker Compose, nginx  |
| CI       | GitHub Actions (pytest + vitest) |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Setup

```bash
# 1. Environment variables
cp .env.example .env
# Generate a secure SECRET_KEY:
#   python -c "import secrets; print(secrets.token_hex(32))"

# 2. Backend
cd backend
pip install -r requirements.txt
python app.py
# → http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Login with `admin` / `admin`.

## Tests

```bash
# Backend (7 tests: health, login, register, auth, dashboard, audit)
cd backend && SECRET_KEY=test pytest tests/ -v

# Frontend (1 test: smoke test)
cd frontend && npm test
```

## Database Migrations

```bash
# Apply pending migrations
cd backend && SECRET_KEY=your-key alembic upgrade head

# Create a new migration (then edit the generated file)
SECRET_KEY=your-key alembic revision -m "description"
```

## Environment Variables

| Variable       | Required | Default                                                      | Description              |
| -------------- | -------- | ------------------------------------------------------------ | ------------------------ |
| SECRET_KEY     | Yes      | —                                                            | Flask/JWT secret (≥32B)  |
| JWT_SECRET_KEY | No       | same as SECRET_KEY                                           | JWT-specific key (≥32B)  |
| DEBUG          | No       | False                                                        | Flask debug mode         |
| API_HOST       | No       | 0.0.0.0                                                      | Backend bind address     |
| API_PORT       | No       | 5000                                                         | Backend port             |
| CORS_ORIGINS   | No       | http://localhost:3000,http://localhost:5000,http://localhost:5173 | Allowed CORS origins     |
| VITE_API_URL   | No       | /api                                                         | Frontend API base URL    |

## Project Structure

```
brokerbyte/
├── backend/                  # Flask API server
│   ├── app.py                # Route definitions
│   ├── auth.py               # JWT + password validation
│   ├── config.py             # Configuration
│   ├── database.py           # SQLite schema & connection
│   ├── anomaly_detection.py  # Isolation Forest ML
│   ├── audit_trail.py        # Action logging
│   ├── ekyc.py               # Identity verification
│   ├── requirements.txt
│   ├── alembic/              # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── tests/
│   │   └── test_api.py
│   └── data/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AnomalyDetection.jsx
│   │   │   ├── eKYCVerification.jsx
│   │   │   ├── AuditTrail.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios client
│   │   ├── styles/
│   │   │   └── App.css       # All styles + dark mode
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── pyproject.toml
└── .github/workflows/ci.yml
```
