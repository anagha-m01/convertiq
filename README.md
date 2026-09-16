# ConvertIQ — Customer Conversion Prediction & Marketing Analytics

An end-to-end machine learning platform that predicts customer conversion propensity in digital marketing campaigns, benchmarks seven classification algorithms against each other, and surfaces the underlying exploratory data analysis in an interactive dashboard.

**Live demo:** `<your-vercel-app>.vercel.app` *(not yet deployed — update once live)*
**Backend API:** `<your-render-backend>.onrender.com` *(not yet deployed — update once live)*

---

## Overview

Feed it a prospective customer's profile — demographics, ad spend, engagement metrics, purchase history — and it returns a real-time conversion prediction with a probability score. Behind that single endpoint sits a full data science workflow: a leakage-free preprocessing and resampling pipeline, a 7-model benchmark chosen on imbalance-aware metrics rather than raw accuracy, and a dashboard that exposes the exploratory analysis (correlations, demographics, ad spend tiers) that justified those modeling choices.

No login or session state — every request is stateless, so the model and analytics can be queried directly from the dashboard or any HTTP client.

## Architecture

```
┌─────────────┐        HTTPS (JSON)        ┌──────────────────┐
│   Frontend   │ ─────────────────────────► │     Backend      │
│  React/Vite  │ ◄───────────────────────── │     FastAPI      │
│   (Vercel)   │                            │     (Render)     │
└─────────────┘                            └────────┬─────────┘
                                                      │
                              ┌───────────────────────┼───────────────────────┐
                              ▼                       ▼                       ▼
                        prediction router      analytics router        model_info router
                              │                       │                       │
                              ▼                       ▼                       ▼
                   conversion_pipeline.joblib   analytics.json      metrics.json / model_compare.json
                (ColumnTransformer → SMOTE →        (precomputed EDA)      (7-model benchmark +
                     AdaBoostClassifier)                                  confusion matrix)
```

The backend serves three concerns behind one FastAPI app instead of one monolithic route:

| Router | Responsibility |
|---|---|
| `prediction` | Validates an incoming customer profile with strict Pydantic v2 constraints, runs it through the serialized `AdaBoostClassifier` pipeline, and returns a label + probability |
| `analytics` | Serves precomputed exploratory data analysis — channel/campaign breakdowns, correlation matrix, gender/age demographics, ad spend tiers — from a single `analytics.json` artifact |
| `model_info` | Serves the frozen model diagnostics (`metrics.json`) and the 7-model benchmark comparison (`model_compare.json`) used to justify the deployed model |

All three routers read from artifacts generated offline (`training/train.py`, `compute_analytics.py`, `evaluate_dataset.py`) rather than computing anything at request time, so the API stays fast and deterministic.

## Tech stack

**Backend:** FastAPI, Pydantic v2, scikit-learn, imbalanced-learn (SMOTE), pandas, numpy, joblib
**Frontend:** React 18, Vite, Recharts, Axios
**Testing:** pytest + FastAPI `TestClient`

## Features

- Real-time conversion prediction with probability score via `POST /api/predict`
- Leakage-free ML pipeline: `ColumnTransformer` (scaling + one-hot encoding) and SMOTE oversampling fit strictly inside the training split, never on the full dataset
- 7-model benchmark (Logistic Regression, KNN, Decision Tree, Random Forest, Gradient Boosting, SVC, AdaBoost) compared on an identical holdout set, selected by Macro F1 / Balanced Accuracy / minority recall instead of raw accuracy
- Interactive dashboard: feature correlation heatmap, demographic breakdowns, ad-spend-tier analysis, and confusion-matrix-level model diagnostics
- Strict request validation — range-constrained Pydantic schemas reject out-of-bounds or malformed payloads with HTTP 422 before they ever reach the model

## Data science practices

ConvertIQ's dataset has a severe **7.1 : 1 class imbalance** (87.65% converters vs. 12.35% non-converters) — a naive majority-class baseline scores ~87.6% accuracy while catching 0% of non-converters. This shaped every modeling decision:

- **No leakage** — `SMOTE` and the `ColumnTransformer` preprocessing live inside the same `imblearn.Pipeline` as the classifier, fit only on the training fold, so the synthetic minority samples and scaling statistics never touch the holdout set.
- **Imbalance-aware model selection** — despite lower raw accuracy (88.56%) than Random Forest (89.63%) or Gradient Boosting (90.13%), **AdaBoost + SMOTE** was selected as the deployed model because it captures over half of all non-converters (50.51% minority recall) versus 33–40% for the higher-accuracy alternatives.
- **Reproducible evaluation** — `evaluate_dataset.py` regenerates the full classification report, confusion matrix, ROC-AUC/PR-AUC, and feature importances against the same stratified 80/20 split used at training time.
- **Persona sanity checks** — `test_profiles.py` runs the trained pipeline against hand-built "weak," "average," and "strong" customer profiles as a manual regression check before deployment.

See the [full benchmark table](#machine-learning-diagnostics--benchmark) below for the complete comparison.

## Testing

```bash
# from the project root (6 tests: health, analytics, model metrics, prediction, validation, CORS)
pip install -r backend/requirements.txt
pytest -q
```

`pytest.ini` points `pytest` at `backend/tests` with `backend` on the Python path, so it can be run from the repo root without `cd`-ing into `backend` first.

## Project structure

```
convertiq/
├── backend/
│   ├── app/
│   │   ├── artifacts/         # Serialized pipeline (joblib) & precomputed metrics/analytics (JSON)
│   │   ├── routers/           # prediction, analytics, model_info
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── services/          # prediction_service.py — loads the pipeline, runs inference
│   │   └── main.py            # FastAPI entry point & CORS configuration
│   ├── tests/
│   │   └── test_api.py        # pytest suite (health, predict, validation, CORS)
│   ├── training/
│   │   ├── data.csv           # 8,000 multi-channel customer records
│   │   └── train.py           # Training and pipeline serialization script
│   ├── compute_analytics.py   # Generates the EDA payload consumed by the dashboard
│   ├── evaluate_dataset.py    # Regenerates classification report & diagnostics
│   ├── test_profiles.py       # Manual persona sanity checks against the trained pipeline
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # CorrelationHeatmap, DemographicsSection, AdSpendSection, ModelEvaluationSection
│   │   ├── pages/              # Dashboard, Predictor
│   │   ├── services/api.js     # Axios client
│   │   └── App.jsx             # Tab routing (Analytics / Predict)
│   └── package.json
├── pytest.ini
└── README.md
```

## Installation (local development)

### 1. Clone the repository
```bash
git clone https://github.com/anagha-m01/convertiq.git
cd convertiq
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
cp .env.example .env
```
Defaults in `.env` work out of the box for local development — no API keys required (the model is a locally serialized `.joblib` artifact, not an external LLM call).

Run it:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API is now live at `http://127.0.0.1:8000` — interactive docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # leave VITE_API_BASE_URL as the local default
npm run dev
```
App is now live at `http://localhost:5173`.

## Environment variables

**Backend (`backend/.env`)**

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ALLOWED_ORIGINS` | production only | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000` | Comma-separated CORS allowlist; must include your deployed frontend URL |

**Frontend (`frontend/.env`)**

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | production only | Your deployed Render backend URL |

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and model load confirmation |
| `GET` | `/api/analytics/full` | Full aggregated analytics payload (overview, channels, demographics, spend) |
| `GET` | `/api/model/metrics` | Model diagnostic metrics (confusion matrix, precision, recall, F1, ROC-AUC) |
| `GET` | `/api/model/compare` | 7-model benchmark comparison data |
| `POST` | `/api/predict` | Real-time conversion prediction for a prospective customer profile |

#### Sample prediction request (`POST /api/predict`)
```json
{
  "age": 35,
  "gender": "Female",
  "income": 120000,
  "campaign_channel": "Email",
  "campaign_type": "Conversion",
  "ad_spend": 8500,
  "click_through_rate": 0.32,
  "website_visits": 42,
  "pages_per_visit": 8.5,
  "time_on_site": 14.0,
  "social_shares": 75,
  "email_opens": 16,
  "email_clicks": 10,
  "previous_purchases": 8,
  "loyalty_points": 4200
}
```

#### Response
```json
{
  "prediction": 1,
  "label": "Likely to Convert",
  "probability": 0.5965,
  "model_name": "AdaBoostClassifier"
}
```

## Usage

1. Open the **Analytics** tab to explore the EDA — feature correlation heatmap, demographic breakdowns, ad-spend-tier conversion rates, and the 7-model benchmark.
2. Switch to the **Predict** tab and enter a customer profile (demographics, campaign, engagement metrics).
3. Submit to get a real-time conversion label and probability score from the deployed AdaBoost model.

## Machine Learning Diagnostics & Benchmark

### The Accuracy Paradox
With 87.65% of the dataset representing converted customers, a naive majority-class baseline achieves 87.62% accuracy while capturing 0% of non-converting customers.

Models like Random Forest and Gradient Boosting scored high raw accuracy (89.6%–90.1%) but suffered from a severe minority-class blindspot (missing ~60–67% of non-converters). **AdaBoost + SMOTE** was selected as the deployed champion because it achieved the best balanced diagnostic capability, capturing over half of all minority non-converters.

### 7-model holdout benchmark (N = 1,600)

| Model | Raw Accuracy | Balanced Acc | Class 0 Recall (Minority) | Macro F1 | ROC-AUC | PR-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **AdaBoost + SMOTE** 🏆 | **88.56%** | **72.22%** | **50.51%** | **0.7286** | **0.7941** | **0.9471** |
| Gradient Boosting | 90.13% | 68.78% | 40.40% | 0.7242 | 0.7920 | 0.9464 |
| Random Forest | 89.63% | 65.45% | 33.33% | 0.6929 | 0.7917 | 0.9500 |
| SVC | 82.00% | 66.52% | 45.96% | 0.6409 | 0.7257 | 0.9350 |
| Decision Tree | 78.88% | 64.96% | 46.46% | 0.6131 | 0.6969 | 0.9256 |
| Logistic Regression | 73.56% | 71.04% | 67.68% | 0.6096 | 0.7683 | 0.9445 |
| KNN | 64.06% | 62.36% | 60.10% | 0.5259 | 0.6489 | 0.9132 |

### Final AdaBoost classification report

| Cohort | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| Class 0 (Non-Converter) | 54.05% | 50.51% | 0.5222 | 198 |
| Class 1 (Converter) | 93.07% | 93.94% | 0.9350 | 1,402 |
| Macro Average | 73.56% | 72.22% | 0.7286 | 1,600 |
| Weighted Average | 88.25% | 88.56% | 0.8839 | 1,600 |

## Deployment

This is a two-part deploy: the FastAPI backend and the Vite/React frontend go to separate hosts.

**Backend (Render, free tier):**
1. Push this repo to GitHub.
2. On [Render](https://render.com), create a new **Web Service** pointing at this repo, root directory `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable `ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app` once the frontend is deployed.
6. Deploy, then confirm `https://<your-render-backend>.onrender.com/api/health` returns `{"status": "ok", ...}`.

**Frontend (Vercel, free tier):**
1. Import this repo, root directory `frontend`.
2. Framework preset: Vite.
3. Add environment variable `VITE_API_BASE_URL` set to your deployed Render backend URL.
4. Deploy.
5. Go back to Render and confirm `ALLOWED_ORIGINS` matches your Vercel URL exactly (no trailing slash), then redeploy the backend — CORS will reject the frontend until this matches.

> **Known limitation:** the dashboard and model artifacts are static — regenerating them (new training data, new benchmark) requires re-running `train.py` / `compute_analytics.py` locally and redeploying, since there's no retraining endpoint or database behind the API.

