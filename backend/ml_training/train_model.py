"""
Train a RandomForest productivity classifier.

Loads training_data.csv, engineers TF-IDF features from combined
app_name + window_title text, trains a RandomForestClassifier,
and saves the model + vectorizer as .pkl files.

Run: python train_model.py
"""

import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score


def main():
    # ── 1. Load data ─────────────────────────────────────────────────
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "training_data.csv")

    print(f"[1/5] Loading training data from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"       Loaded {len(df)} examples across {df['category'].nunique()} categories\n")

    # ── 2. Feature engineering ───────────────────────────────────────
    print("[2/5] Feature engineering: combining app_name + window_title (lowercase)")
    df["combined_text"] = (df["app_name"].str.lower() + " " + df["window_title"].str.lower())

    X = df["combined_text"]
    y = df["category"]

    # ── 3. Train/test split ──────────────────────────────────────────
    print("[3/5] Splitting data: 80% train / 20% test")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"       Train: {len(X_train)} | Test: {len(X_test)}\n")

    # ── 4. TF-IDF vectorization ──────────────────────────────────────
    print("[4/5] Fitting TfidfVectorizer (max_features=500)")
    vectorizer = TfidfVectorizer(max_features=500)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    print(f"       Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"       Feature matrix shape: {X_train_tfidf.shape}\n")

    # ── 5. Train RandomForest ────────────────────────────────────────
    print("[5/5] Training RandomForestClassifier (n_estimators=100, random_state=42)")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train_tfidf, y_train)
    print("       Training complete!\n")

    # ── 6. Evaluate ──────────────────────────────────────────────────
    y_pred = model.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)

    print("=" * 60)
    print("  CLASSIFICATION REPORT")
    print("=" * 60)
    print(classification_report(y_test, y_pred))
    print("=" * 60)
    print(f"  FINAL TEST ACCURACY: {accuracy * 100:.2f}%")
    print("=" * 60)

    # ── 7. Save model + vectorizer ───────────────────────────────────
    model_path = os.path.join(script_dir, "productivity_model.pkl")
    vectorizer_path = os.path.join(script_dir, "tfidf_vectorizer.pkl")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"\n[OK] Model saved to:      {model_path}")
    print(f"[OK] Vectorizer saved to: {vectorizer_path}")

    # File sizes
    model_size = os.path.getsize(model_path) / 1024
    vec_size = os.path.getsize(vectorizer_path) / 1024
    print(f"\n     Model size:      {model_size:.1f} KB")
    print(f"     Vectorizer size: {vec_size:.1f} KB")


if __name__ == "__main__":
    main()
