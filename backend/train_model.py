"""Train and persist the HealthGuard AI educational screening model."""

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from utils.preprocessing import build_feature_matrix, feature_names_from_frame


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "sympscan" / "Diseases_and_Symptoms_dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "disease_model.pkl"
METADATA_PATH = MODEL_DIR / "metadata.json"


def train() -> None:
    frame = pd.read_csv(DATASET_PATH)
    frame.columns = [column.strip() for column in frame.columns]
    target_column = next(column for column in frame.columns if column.strip().lower() in {"disease", "diseases", "label", "target"})
    frame[target_column] = frame[target_column].astype(str).str.strip()
    frame = frame.dropna(subset=[target_column]).reset_index(drop=True)

    feature_names = feature_names_from_frame(frame)
    features = build_feature_matrix(frame, feature_names)
    labels = frame[target_column]

    classifier = RandomForestClassifier(
        n_estimators=80,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )
    metrics: dict[str, object] = {"available": False, "reason": "Evaluation not attempted."}

    try:
        train_x, test_x, train_y, test_y = train_test_split(
            features, labels, test_size=0.2, random_state=42, stratify=labels
        )
        classifier.fit(train_x, train_y)
        predictions = classifier.predict(test_x)
        report = classification_report(test_y, predictions, output_dict=True, zero_division=0)
        metrics = {
            "available": True,
            "accuracy": round(float(accuracy_score(test_y, predictions)), 4),
            "test_records": int(len(test_y)),
            "macro_f1": round(float(report["macro avg"]["f1-score"]), 4),
            "note": "Holdout metrics can be optimistic because this public dataset contains repeated symptom patterns.",
        }
    except ValueError as error:
        metrics = {"available": False, "reason": str(error)}
        classifier.fit(features, labels)

    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump({"model": classifier, "features": feature_names}, MODEL_PATH)
    metadata = {
        "dataset_name": "SympScan Diseases and Symptoms Dataset",
        "dataset_source": "backend/dataset/sympscan/Diseases_and_Symptoms_dataset.csv",
        "dataset_license": "See the Kaggle dataset page for the publisher's current license and terms.",
        "records": int(len(frame)),
        "feature_count": len(feature_names),
        "class_count": int(labels.nunique()),
        "classes": sorted(labels.unique().tolist()),
        "features": feature_names,
        "algorithm": "Random Forest Classifier",
        "metrics": metrics,
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Loaded {len(frame)} records, {len(feature_names)} symptoms, {labels.nunique()} classes.")
    print(f"Saved model to {MODEL_PATH}")
    print(f"Evaluation: {metrics}")


if __name__ == "__main__":
    train()