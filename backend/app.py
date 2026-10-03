"""Flask REST API for the HealthGuard AI educational prototype."""

import json
from functools import lru_cache
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from utils.preprocessing import feature_names_from_frame, normalize_symptom


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "sympscan" / "Diseases_and_Symptoms_dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "disease_model.pkl"
METADATA_PATH = BASE_DIR / "models" / "metadata.json"
DESCRIPTION_PATH = BASE_DIR / "dataset" / "symptom_description.csv"
PRECAUTION_PATH = BASE_DIR / "dataset" / "symptom_precaution.csv"
MIN_SYMPTOMS = 4
MAX_SYMPTOMS = 6
MIN_PREDICTION_CONFIDENCE = 0.65

app = Flask(__name__)
CORS(app)


def load_metadata() -> dict:
    if not METADATA_PATH.exists():
        return {}
    return json.loads(METADATA_PATH.read_text(encoding="utf-8"))


def load_model_bundle() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model is not trained yet. Run python train_model.py first.")
    return joblib.load(MODEL_PATH)


@lru_cache(maxsize=1)
def dataset_frame() -> pd.DataFrame:
    frame = pd.read_csv(DATASET_PATH)
    target_column = next(column for column in frame.columns if column.strip().lower() in {"disease", "diseases", "label", "target"})
    return frame.rename(columns={target_column: "Disease"})


@lru_cache(maxsize=1)
def dataset_features() -> tuple[str, ...]:
    return tuple(feature_names_from_frame(dataset_frame()))


@lru_cache(maxsize=1)
def dataset_classes() -> tuple[str, ...]:
    return tuple(sorted(dataset_frame()["Disease"].astype(str).str.strip().unique()))


def chart_data(metadata: dict) -> dict:
    frame = dataset_frame()
    disease_counts = frame["Disease"].value_counts()
    symptoms = dataset_features()
    symptom_frequency = {symptom: 0 for symptom in symptoms}
    if any(column.lower().startswith("symptom_") for column in frame.columns):
        for column in frame.columns:
            if column.lower().startswith("symptom_"):
                for value in frame[column].dropna():
                    key = normalize_symptom(value)
                    if key in symptom_frequency:
                        symptom_frequency[key] += 1
    else:
        for symptom in symptoms:
            source_column = next((column for column in frame.columns if normalize_symptom(column) == symptom), None)
            if source_column:
                symptom_frequency[symptom] = int(pd.to_numeric(frame[source_column], errors="coerce").fillna(0).sum())
    top_symptoms = dict(sorted(symptom_frequency.items(), key=lambda item: item[1], reverse=True)[:12])
    return {
        "disease_distribution": {str(key): int(value) for key, value in disease_counts.items()},
        "symptom_frequency": top_symptoms,
    }


@lru_cache(maxsize=1)
def disease_symptoms() -> dict[str, list[str]]:
    frame = dataset_frame()
    symptom_columns = [column for column in frame.columns if column.lower().startswith("symptom_")]
    wide_binary = not symptom_columns
    if wide_binary:
        symptom_columns = [column for column in frame.columns if column != "Disease"]
    mapping: dict[str, set[str]] = {}
    if wide_binary:
        binary_frame = frame[symptom_columns].apply(pd.to_numeric, errors="coerce").fillna(0).astype(bool)
        for disease, group in binary_frame.groupby(frame["Disease"].astype(str).str.strip()):
            mapping[disease] = {normalize_symptom(column) for column in group.columns[group.any(axis=0)]}
    else:
        for disease, group in frame.groupby(frame["Disease"].astype(str).str.strip()):
            mapping[disease] = {normalize_symptom(value) for value in group[symptom_columns].to_numpy().ravel() if normalize_symptom(value)}
    return {disease: sorted(symptoms) for disease, symptoms in sorted(mapping.items())}


def library_data(metadata: dict) -> list[dict]:
    descriptions = {}
    precautions = {}
    if DESCRIPTION_PATH.exists():
        description_frame = pd.read_csv(DESCRIPTION_PATH)
        descriptions = dict(zip(description_frame.iloc[:, 0].astype(str).str.strip().str.casefold(), description_frame.iloc[:, 1].astype(str).str.strip()))
    if PRECAUTION_PATH.exists():
        precaution_frame = pd.read_csv(PRECAUTION_PATH)
        for _, row in precaution_frame.iterrows():
            items = [str(value).strip() for value in row.iloc[1:].tolist() if str(value).strip() and str(value).lower() != "nan"]
            precautions[str(row.iloc[0]).strip().casefold()] = items
    model_items = [
        {
            "name": disease,
            "description": descriptions.get(disease.casefold(), "This disease class comes from the SympScan dataset."),
            "precautions": precautions.get(disease.casefold(), []),
            "guidance": "Seek qualified medical advice when symptoms are severe, persistent, or concerning.",
            "source_type": "model_class",
        }
        for disease in dataset_classes()
    ]
    return model_items


def no_match_information(symptoms: list[str]) -> tuple[list[str], list[str]]:
    """Return cautious educational possibilities and comfort measures for abstained results."""
    possibilities = [
        "A mild, self-limited viral illness",
        "Minor irritation or an allergic reaction",
        "Temporary effects from fatigue, stress, dehydration, or environmental exposure",
        "A cause that is not represented in this educational dataset",
    ]
    comfort_measures = [
        "Rest and drink suitable fluids",
        "Avoid known irritants and monitor whether symptoms improve",
        "Do not start antibiotics or other treatment without qualified medical advice",
    ]
    if any(symptom in symptoms for symptom in ["fever", "chills", "shivering"]):
        comfort_measures.insert(1, "Monitor your temperature and note whether the fever persists or worsens")
    if any(symptom in symptoms for symptom in ["itching", "skin_rash", "redness_of_eyes"]):
        comfort_measures.insert(1, "Avoid scratching or rubbing the affected area and stop any newly irritating product")
    if any(symptom in symptoms for symptom in ["cough", "congestion", "sore_throat", "runny_nose"]):
        comfort_measures.insert(1, "Use gentle humidified air and avoid smoke or other respiratory irritants")
    return possibilities, comfort_measures


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "HealthGuard AI backend is running"})


@app.get("/api/dataset-info")
def dataset_info():
    metadata = load_metadata()
    frame = dataset_frame()
    features = dataset_features()
    classes = dataset_classes()
    return jsonify({
        "dataset_name": "SympScan Diseases and Symptoms Dataset",
        "dataset_source": str(DATASET_PATH),
        "records": int(len(frame)),
        "symptoms": list(features),
        "classes": list(classes),
        "feature_count": len(features),
        "class_count": len(classes),
        "disease_symptoms": disease_symptoms(),
    })


@app.get("/api/symptoms")
def symptoms():
    return jsonify({"symptoms": list(dataset_features())})


@app.get("/api/health-library")
def health_library():
    return jsonify({"items": library_data(load_metadata())})


@app.get("/api/model-info")
def model_info():
    metadata = load_metadata()
    return jsonify({
        "model_name": metadata.get("algorithm", "Random Forest Classifier"),
        "model_status": "ready" if MODEL_PATH.exists() else "not_trained",
        "feature_count": len(dataset_features()),
        "class_count": len(dataset_classes()),
        "metrics": metadata.get("metrics", {"available": False}),
        "preprocessing": ["Read the SympScan symptom columns", "Encode the dataset vocabulary as binary features", "Require 4-6 symptoms for focused screening", "Abstain when model confidence is below 65%", "Stratified 80/20 holdout when possible"],
    })


@app.get("/api/charts")
def charts():
    return jsonify(chart_data(load_metadata()))


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    selected = payload.get("symptoms")
    if not isinstance(selected, list) or not selected:
        return jsonify({"success": False, "error": f"Select {MIN_SYMPTOMS} to {MAX_SYMPTOMS} supported symptoms."}), 400
    bundle = load_model_bundle()
    supported = set(bundle["features"])
    normalized = list(dict.fromkeys(normalize_symptom(item) for item in selected if normalize_symptom(item)))
    if len(normalized) < MIN_SYMPTOMS:
        return jsonify({"success": False, "error": f"Select at least {MIN_SYMPTOMS} symptoms for a more reliable screening result."}), 400
    if len(normalized) > MAX_SYMPTOMS:
        return jsonify({"success": False, "error": f"Select no more than {MAX_SYMPTOMS} symptoms so the result stays focused."}), 400
    unsupported = [item for item in normalized if item not in supported]
    if unsupported:
        return jsonify({"success": False, "error": f"Unsupported symptom(s): {', '.join(unsupported)}"}), 400
    row = pd.DataFrame([[1 if symptom in normalized else 0 for symptom in bundle["features"]]], columns=bundle["features"])
    probabilities = bundle["model"].predict_proba(row)[0]
    best_probability = float(max(probabilities))
    prediction = str(bundle["model"].classes_[probabilities.argmax()])
    if best_probability < MIN_PREDICTION_CONFIDENCE:
        possibilities, comfort_measures = no_match_information(normalized)
        return jsonify({
            "success": True,
            "status": "no_clear_match",
            "predicted_class": "NO DISEASE FOUND",
            "selected_symptoms": normalized,
            "is_demo": False,
            "message": "This is an uncertain educational result, not a diagnosis. It does not mean you are in immediate danger. Seek urgent medical care for severe trouble breathing, chest pain, fainting, sudden confusion, or rapidly worsening symptoms.",
            "description": "The symptoms may be mild, temporary, related to a minor infection or irritation, or outside this dataset.",
            "possible_causes": possibilities,
            "comfort_measures": comfort_measures,
            "precautions": [],
            "guidance": "Monitor how you feel and seek qualified medical advice if symptoms are severe, worsening, or persistent.",
        })
    disease_info = next((item for item in library_data(load_metadata()) if item["name"] == prediction), {})
    return jsonify({
        "success": True,
        "predicted_class": prediction,
        "selected_symptoms": normalized,
        "is_demo": False,
        "message": "Educational screening output only. This is not a medical diagnosis.",
        "description": disease_info.get("description", "Educational reference content is not available for this class."),
        "precautions": disease_info.get("precautions", []),
        "guidance": disease_info.get("guidance", "Seek qualified medical advice when symptoms are severe, persistent, or concerning."),
    })


@app.errorhandler(FileNotFoundError)
def missing_model(error):
    return jsonify({"success": False, "error": str(error)}), 503


@app.errorhandler(Exception)
def unexpected_error(error):
    app.logger.exception("Unhandled API error")
    return jsonify({"success": False, "error": "The backend could not complete that request."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)