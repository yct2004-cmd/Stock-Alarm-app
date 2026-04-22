# PulseMarkets

A production-quality stock alert mobile app for iPhone.

## Tech Stack

**Mobile (mobile/):** React Native + Expo SDK 54 + TypeScript, React Navigation 7, Zustand, TanStack Query v5, React Hook Form + Zod, AsyncStorage, react-native-chart-kit, Expo Notifications

**Backend (backend/):** FastAPI + SQLAlchemy + pandas + yfinance, SQLite, Expo Push Notifications

## Project Structure

- `backend/` — FastAPI service, alert engine, background polling job
- `mobile/` — Full Expo app (PulseMarkets)

## Quick Start

### 1) Run Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend health check:

```bash
curl http://127.0.0.1:8000/health
```

### 2) Run Mobile

```bash
cd mobile
npm install
npx expo start
```

If you run on a real phone, set `mobile/app.json` -> `expo.extra.apiBaseUrl`
to your computer LAN IP (for example `http://192.168.1.10:8000/api/v1`).

## Key APIs

- `POST /api/v1/alerts`
- `GET /api/v1/alerts`
- `PATCH /api/v1/alerts/{id}/toggle`
- `DELETE /api/v1/alerts/{id}`
- `POST /api/v1/devices/register`
- `POST /api/v1/devices/test-push`
- `GET /api/v1/market/ticker/{ticker}`

## Push Verification

1. Open app on phone and allow notifications.
2. Ensure backend receives `/devices/register`.
3. Send a manual test push:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/devices/test-push \
  -H "Content-Type: application/json" \
  -d '{"title":"MVP Test","body":"Push pipeline works"}'
```

## Run Tests (Backend)

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Included minimal tests:

- Market session classification rules
- Alert schema validation rules
