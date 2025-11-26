import streamlit as st
import os
import glob
import pandas as pd
import pickle
import joblib
import matplotlib.pyplot as plt
from pathlib import Path

st.set_page_config(page_title="Zomato Sentiment Lens", layout="wide")

st.title("Zomato Sentiment Lens — Streamlit Deployment")
st.markdown("Upload reviews or type a review to get a sentiment prediction. The app will attempt to auto-detect model files in the repository.")

# Helper: find model and vectorizer
def find_files(base_dir="."):
    patterns = ["**/*.pkl", "**/*.joblib", "**/*.model", "**/*.sav"]
    found = []
    for p in patterns:
        found.extend(Path(base_dir).glob(p))
    return [str(x) for x in found]

def try_load_model(path):
    try:
        if path.endswith((".joblib", ".jl")):
            return joblib.load(path)
        else:
            with open(path, "rb") as f:
                return pickle.load(f)
    except Exception as e:
        st.warning(f"Failed to load {path}: {e}")
        return None

# locate candidate files
candidates = find_files(".")
st.sidebar.header("Detected files in repo")
if candidates:
    for c in candidates[:30]:
        st.sidebar.write(c)
else:
    st.sidebar.write("No .pkl/.joblib files detected in repo root. If your model is elsewhere, place it in the repo directory.")

# Attempt to choose model and vectorizer
model = None
vectorizer = None
chosen_model_path = None
chosen_vectorizer_path = None

# select model
for c in candidates:
    low = c.lower()
    if any(k in low for k in ("model", "clf", "classifier", "sentiment", "ensemble")):
        m = try_load_model(c)
        if m is not None:
            model = m
            chosen_model_path = c
            break

if model is None and candidates:
    m = try_load_model(candidates[0])
    if m is not None:
        model = m
        chosen_model_path = candidates[0]

# select vectorizer
for c in candidates:
    low = c.lower()
    if any(k in low for k in ("vector", "tfidf", "count", "vect", "transform")):
        v = try_load_model(c)
        if v is not None:
            vectorizer = v
            chosen_vectorizer_path = c
            break

st.sidebar.markdown("**Model path:**")
st.sidebar.write(chosen_model_path or "No model loaded")
st.sidebar.markdown("**Vectorizer path:**")
st.sidebar.write(chosen_vectorizer_path or "No vectorizer loaded")

# fallback sentiment
def rule_sentiment(text):
    text = text.lower()
    pos_words = ["good","great","excellent","amazing","loved","love","nice","best","fantastic","delicious","recommend"]
    neg_words = ["bad","terrible","worst","awful","hate","hated","disgusting","poor","rude","slow","expensive"]
    score = sum(1 for w in pos_words if w in text) - sum(1 for w in neg_words if w in text)
    if score > 0: return "positive"
    if score < 0: return "negative"
    return "neutral"

# prediction wrapper
def predict_text(text):
    if model is not None:
        try:
            if vectorizer is not None:
                X = vectorizer.transform([text])
                pred = model.predict(X)
            else:
                try:
                    pred = model.predict([text])
                except Exception:
                    if hasattr(model, "predict_proba"):
                        pred = model.predict([text])
                    else:
                        pred = [str(model)]
            label = pred[0] if isinstance(pred, (list,tuple)) else pred
            return str(label)
        except Exception as e:
            st.warning(f"Model prediction failed, fallback enabled: {e}")
            return rule_sentiment(text)
    else:
        return rule_sentiment(text)

# Single prediction
st.header("Single review prediction")
txt = st.text_area("Type or paste one review here", height=150)
if st.button("Predict single review"):
    if not txt.strip():
        st.error("Please type a review first.")
    else:
        label = predict_text(txt.strip())
        st.success(f"Predicted sentiment: **{label}**")

# Batch prediction
st.header("Batch prediction (CSV)")
uploaded = st.file_uploader("Upload CSV", type=["csv"])
if uploaded is not None:
    df = pd.read_csv(uploaded)
    st.write("Preview:")
    st.dataframe(df.head())

    text_col = None
    for col in df.columns:
        if col.lower() in ("review","review_text","text","comment","comments"):
            text_col = col
            break

    if text_col is None:
        object_cols = [c for c in df.columns if df[c].dtype == "object"]
        if object_cols:
            text_col = max(object_cols, key=lambda c: df[c].astype(str).str.len().mean())

    if text_col is None:
        st.error("Couldn't find a text column.")
    else:
        st.write(f"Using column: **{text_col}**")
        df["predicted_sentiment"] = df[text_col].astype(str).apply(predict_text)

        st.write("Results:")
        st.dataframe(df.head())

        counts = df["predicted_sentiment"].value_counts()
        fig, ax = plt.subplots()
        counts.plot(kind="bar", ax=ax)
        ax.set_xlabel("Sentiment")
        ax.set_ylabel("Count")
        ax.set_title("Prediction distribution")
        st.pyplot(fig)

        csv_bytes = df.to_csv(index=False).encode("utf-8")
        st.download_button("Download predictions CSV", csv_bytes, "predictions.csv", "text/csv")

st.info("If your own trained model is not loaded, add its .pkl/.joblib file to this repo.")
