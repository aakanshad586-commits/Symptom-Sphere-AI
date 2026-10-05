"""Utilities for turning the dataset's symptom columns into model features."""

import re
from typing import Iterable

import pandas as pd


SYMPTOM_ALIASES = {
    "abdominal_pain": "abdominal_pain",
    "belly_pain": "abdominal_pain",
    "stomach_pain": "abdominal_pain",
    "high_fever": "fever",
    "mild_fever": "fever",
}


def normalize_symptom(value: object) -> str:
    """Return a stable, display-friendly key for a symptom value."""
    if pd.isna(value):
        return ""
    text = re.sub(r"\s+", " ", str(value).strip().lower())
    normalized = text.replace(" _", "_").replace(" ", "_")
    return SYMPTOM_ALIASES.get(normalized, normalized)


def symptom_columns(frame: pd.DataFrame) -> list[str]:
    """Find symptom slot columns while excluding the disease target."""
    slot_columns = [column for column in frame.columns if column.lower().startswith("symptom_")]
    if slot_columns:
        return slot_columns
    return [column for column in frame.columns if column.lower() not in {"disease", "diseases", "label", "target"}]


def build_feature_matrix(frame: pd.DataFrame, feature_names: Iterable[str]) -> pd.DataFrame:
    """Encode each row as a binary vector over the known symptom vocabulary."""
    names = list(feature_names)
    source_columns = symptom_columns(frame)
    if not any(column.lower().startswith("symptom_") for column in frame.columns):
        values = frame[source_columns].apply(pd.to_numeric, errors="coerce")
        valid_values = frame[source_columns].isna() | values.isin((0, 1))
        if valid_values.to_numpy().all():
            values = values.fillna(0)
            values.columns = [normalize_symptom(column) for column in source_columns]
            values = values.T.groupby(level=0, sort=False).max().T
            return values.reindex(columns=names, fill_value=0).astype("uint8")

    matrix = pd.DataFrame(0, index=frame.index, columns=names, dtype=int)
    for column in source_columns:
        for index, value in frame[column].items():
            binary_value = pd.to_numeric(value, errors="coerce")
            normalized_column = normalize_symptom(column)
            if binary_value in (0, 1) and normalized_column in matrix.columns:
                if binary_value == 1:
                    matrix.at[index, normalized_column] = 1
                continue
            symptom = normalize_symptom(value)
            if symptom in matrix.columns:
                matrix.at[index, symptom] = 1
    return matrix


def feature_names_from_frame(frame: pd.DataFrame) -> list[str]:
    """Collect unique normalized symptoms in a stable alphabetical order."""
    if not any(column.lower().startswith("symptom_") for column in frame.columns):
        return sorted(normalize_symptom(column) for column in symptom_columns(frame))
    values: set[str] = set()
    for column in symptom_columns(frame):
        values.update(normalize_symptom(value) for value in frame[column].dropna())
    values.discard("")
    return sorted(values)