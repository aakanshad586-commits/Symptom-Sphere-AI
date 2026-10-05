# SymptomSphere AI

SymptomSphere AI is an educational disease symptom classification prototype for the Foundation of Artificial Intelligence and Data Science mini-project at Nutan Maharashtra Institute of Engineering and Technology, Pune.

It demonstrates a complete flow: symptom selection in a vanilla JavaScript dashboard, binary feature encoding, a Random Forest model in Python, and a Flask REST API. It is **not a medical diagnostic tool** and must not be used to make healthcare decisions.

## Features

- Responsive public project website and dashboard.
- Searchable symptom checker populated from the trained model metadata, with a focused 4-6 symptom input range.
- Dataset-backed statistics and Chart.js visualizations.
- Educational health library based on the dataset's description and precaution files.
- Separate common-condition reference notes for fever, common cold, and general viral infection; these are not used as model classes.
- Model insights page with actual training metadata and measured holdout metrics.
- Flask endpoints with validation, CORS, and clear backend errors.

## Technology

- Frontend: HTML5, CSS3, vanilla JavaScript, Chart.js, Font Awesome.
- Backend: Python, Flask, Flask-CORS, Pandas, NumPy, Scikit-learn, Joblib.
- Model: Random Forest Classifier.

## Dataset

The project uses the **SympScan Diseases and Symptoms Dataset** stored at `backend/dataset/sympscan/Diseases_and_Symptoms_dataset.csv`. It contains disease labels and binary symptom columns used by the training pipeline. The separate symptom description and precaution files provide educational reference content only.

The source data contains repeated symptom patterns and synthetic or simplified records. The training pipeline uses the SympScan symptom columns as binary features. The checker accepts 4-6 symptoms to keep screening inputs focused. Therefore, a high holdout score is not evidence of clinical accuracy.

## Folder structure

```text
Symptom-Sphere-AI/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── app.py
│   ├── train_model.py
│   ├── requirements.txt
│   ├── dataset/
│   │   ├── sympscan/
│   │   │   └── Diseases_and_Symptoms_dataset.csv
│   │   ├── symptom_description.csv
│   │   ├── symptom_precaution.csv
│   │   └── common_conditions.json
│   ├── models/
│   │   ├── disease_model.pkl
│   │   └── metadata.json
│   └── utils/preprocessing.py
├── README.md
└── .gitignore
```

## Run locally

Open PowerShell in the repository folder.

1. Create and activate a virtual environment:

```powershell
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
python -m pip install -r backend\requirements.txt
```

3. Train the model (also needed after changing the dataset):

```powershell
python backend\train_model.py
```

4. Start the website and API together:

```powershell
python backend\app.py
```

Open http://127.0.0.1:5000. Keep the backend terminal running while using the site. Flask serves both the frontend and API, so opening `frontend\index.html` directly is not needed. If you prefer a separate frontend server on port 5500, the frontend automatically uses the local API on port 5000.

## Deploy on Render

The included `render.yaml` configures a single Render web service that serves the frontend and API from the same HTTPS origin. Push the repository to GitHub, create a new Blueprint on Render, and select the repository. Render installs the backend dependencies and trains the ignored model artifact and dataset summaries during the build, then starts Flask with Gunicorn. Once deployment is complete, open the Render service URL on every device; do not open `frontend/index.html` directly on another device, because a local HTML file points its API requests at that device's own `localhost`.

If the dashboard reports that the backend is unavailable, check that `https://your-service.onrender.com/api/health` returns `{"status":"ok"}`. After pulling changes to the training pipeline, retrain locally with `python backend\\train_model.py`; Render runs this step automatically on deployment.

The model file is intentionally excluded from Git; do not remove that ignore rule or commit generated model artifacts. The training dataset must remain in the repository so Render can rebuild the model. If you deploy the static frontend separately instead, set the `api-base-url` meta tag in `frontend/index.html` to the backend origin (for example, `https://your-api.example.com`); configure that backend to allow requests from the frontend origin.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Backend status |
| GET | `/api/dataset-info` | Dataset counts, labels, symptoms, and source |
| GET | `/api/symptoms` | Supported symptom vocabulary |
| GET | `/api/health-library` | Educational condition information |
| GET | `/api/model-info` | Algorithm, status, preprocessing, and measured metrics |
| GET | `/api/charts` | Disease distribution and symptom frequency |
| POST | `/api/predict` | Predict from `{"symptoms":["itching","skin_rash"]}` |

Prediction responses intentionally do not include confidence percentages. The system returns a class label as an educational screening output only.

## Demonstration flow

Start on the landing page, open **Launch dashboard**, show the live record/class/symptom counts, inspect the charts, select four to six symptoms, and run **Analyze symptoms**. Then show **Prediction results**, **Model insights**, and the source dataset in the README. Explain that preprocessing normalizes labels and converts the selected symptoms into a binary feature vector.

## Limitations and future scope

This is a classroom prototype using a public dataset that is not expert-reviewed for clinical use. It does not collect personal information, store patient records, prescribe medication, or replace a qualified healthcare professional. Future work could include larger expert-reviewed data, stronger external validation, multilingual support, and expert-reviewed educational content.