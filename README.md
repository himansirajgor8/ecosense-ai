# EcoSense AI — Smart Community Environmental Monitor

This repository contains a full-stack application for monitoring air quality, predicting pollution, and scanning waste items for recycling guidance.

## Backend
- `backend/app.py` — Flask application with CORS
- `backend/routes/air_quality.py` — OpenAQ integration and sample fallback data
- `backend/routes/prediction.py` — pollution prediction API using a trained scikit-learn model
- `backend/model/train_model.py` — synthetic dataset generation and model training
- `backend/requirements.txt` — backend dependencies

## Frontend
- `frontend/src` — React application using Vite, Tailwind CSS, Recharts, Leaflet, and Gemini AI
- `frontend/src/components` — reusable UI components
- `frontend/src/pages` — application pages for Home, Monitor, Waste Scan, and About

## Setup
1. Install backend dependencies:
   ```powershell
   cd backend
   python -m pip install -r requirements.txt
   python model/train_model.py
   python app.py
   ```
2. Install frontend dependencies:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## Notes
- The backend proxies live OpenAQ data and serves a prediction endpoint.
- The waste scanner uses the Gemini AI API from the browser. Set `VITE_GEMINI_KEY` before running the frontend.
- Tailwind CSS is used for responsive, modern UI styling.
