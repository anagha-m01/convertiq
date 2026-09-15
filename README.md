# ConvertIQ — Customer Conversion Prediction & Marketing Analytics

ConvertIQ is an end-to-end, production-ready machine learning platform that predicts customer conversion propensity in digital marketing campaigns while surfacing deep exploratory data analytics, feature correlations, and demographic insights.

---

## Key Highlights

- **Leakage-Free ML Pipeline**: Integrated data preprocessing (`ColumnTransformer` with `StandardScaler` and `OneHotEncoder`) and `SMOTE` oversampling strictly inside cross-validated training splits.
- **Tackling the "Accuracy Paradox"**: Handled severe **7.1 : 1 class imbalance** (87.65% converters vs 12.35% non-converters). Rather than relying on misleading raw accuracy, model selection was driven by **Macro F1-Score**, **Balanced Accuracy**, and **Minority Recall**.
- **Comprehensive 7-Model Benchmark**: Evaluated Logistic Regression, KNN, Decision Trees, Random Forest, Gradient Boosting, SVC, and AdaBoost on an identical holdout split ($N = 1,600$).
- **High-Performance FastAPI Backend**: Validated by strict **Pydantic v2** schemas with custom range constraints and automated unit tests via **pytest**.
- **Interactive React (Vite) Dashboard**: Diagnostic visualizations including dynamic confusion matrices, feature correlation heatmaps, ad spend tiers, and real-time lead propensity scoring.

---

## Machine Learning Diagnostics & Benchmark

### The Accuracy Paradox
With **87.65%** of the dataset representing converted customers, a naive majority-class baseline achieves **87.62% accuracy** while capturing **0%** of non-converting customers.

While models like Random Forest and Gradient Boosting scored high raw accuracy (89.6% - 90.1%), they suffered from a severe minority-class blindspot (missing ~60% to 67% of non-converters). **AdaBoost + SMOTE** was selected as the deployed champion model because it achieved the highest balanced diagnostic capability and captured over half of all minority non-converters.

### 7-Model Holdout Benchmark ($N = 1,600$)

| Model | Raw Accuracy | Balanced Acc | Class 0 Recall (Minority) | Macro F1 | ROC-AUC | PR-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **AdaBoost + SMOTE** 🏆 | **88.56%** | **72.22%** | **50.51%** | **0.7286** | **0.7941** | **0.9471** |
| **Gradient Boosting** | 90.13% | 68.78% | 40.40% | 0.7242 | 0.7920 | 0.9464 |
| **Random Forest** | 89.63% | 65.45% | 33.33% | 0.6929 | 0.7917 | 0.9500 |
| **SVC** | 82.00% | 66.52% | 45.96% | 0.6409 | 0.7257 | 0.9350 |
| **Decision Tree** | 78.88% | 64.96% | 46.46% | 0.6131 | 0.6969 | 0.9256 |
| **Logistic Regression** | 73.56% | 71.04% | 67.68% | 0.6096 | 0.7683 | 0.9445 |
| **KNN** | 64.06% | 62.36% | 60.10% | 0.5259 | 0.6489 | 0.9132 |

### Final AdaBoost Classification Report

| Cohort | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **Class 0 (Non-Converter)** | 54.05% | 50.51% | 0.5222 | 198 |
| **Class 1 (Converter)** | 93.07% | 93.94% | 0.9350 | 1,402 |
| **Macro Average** | **73.56%** | **72.22%** | **0.7286** | 1,600 |
| **Weighted Average** | **88.25%** | **88.56%** | **0.8839** | 1,600 |

---

## Tech Stack & Architecture

- **Backend API**: Python 3.10, FastAPI 0.116, Uvicorn, Pydantic v2
- **Machine Learning**: scikit-learn 1.7, imbalanced-learn (SMOTE), pandas, numpy, joblib
- **Testing**: pytest 9.1, httpx
- **Frontend**: React 18, Vite 8, Recharts, Vanilla CSS
- **Deployment Targets**: Render (FastAPI backend), Vercel (React frontend)

---

## Project Structure

```
convertiq/
├── backend/
│   ├── app/
│   │   ├── artifacts/         # Serialized pipelines (joblib) & precomputed metrics (JSON)
│   │   ├── routers/           # API routes: prediction, analytics, model_info
│   │   ├── schemas/           # Pydantic validation schemas
│   │   └── main.py            # FastAPI entry point & CORS configuration
│   ├── tests/
│   │   └── test_api.py        # Automated test suite (health, predict, validation, CORS)
│   ├── training/
│   │   ├── data.csv           # 8,000 multi-channel customer records
│   │   └── train.py           # Training and pipeline serialization script
│   ├── evaluate_dataset.py    # Detailed evaluation & classification report generator
│   ├── test_profiles.py       # Validation script across customer personas
│   └── requirements.txt       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # Heatmap, Demographics, AdSpend, ModelDiagnostics
│   │   ├── pages/             # Dashboard, Predictor
│   │   ├── services/          # Axios API client
│   │   ├── App.jsx            # Tab routing
│   │   └── styles.css         # Modern dark-mode styling system
│   ├── package.json
│   └── vite.config.js
├── pytest.ini                 # Pytest configuration
└── README.md
```

---

## Quickstart & Local Setup

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API interactive documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Run Automated Tests
```bash
# From the project root:
pytest
```
Runs 6 automated tests covering:
- Health checks & model loading confirmation
- Analytics endpoints data integrity
- Model metrics structure verification
- Prediction inference across strong and weak lead personas
- Pydantic validation boundaries (HTTP 422 rejections on out-of-bounds fields)
- CORS header configuration

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and confirmation of model load status |
| `GET` | `/api/analytics/full` | Full aggregated analytics payload (overview, channels, demographics, spend) |
| `GET` | `/api/model/metrics` | Model diagnostic metrics (confusion matrix, precision, recall, F1, ROC-AUC) |
| `GET` | `/api/model/compare` | Multi-algorithm benchmark comparison data |
| `POST` | `/api/predict` | Real-time conversion prediction for prospective customer profiles |

#### Sample Prediction Request (`POST /api/predict`):
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

#### Response:
```json
{
  "prediction": 1,
  "label": "Likely to Convert",
  "probability": 0.5965,
  "model_name": "AdaBoostClassifier"
}
```

---

## Production Deployment

- **Frontend (Vercel)**: Set root directory to `frontend`. Configure environment variable `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`.
- **Backend (Render)**: Set root directory to `backend`. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Configure environment variable `ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`.
