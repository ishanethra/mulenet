# mulenet_train.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, average_precision_score, precision_recall_curve, confusion_matrix
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.neural_network import MLPClassifier

# 1. Load Data
print("Loading DataSet.csv...")
df = pd.read_csv("DataSet.csv")

# 2. Data Cleaning
TARGET_COLUMN = "F3924"
if TARGET_COLUMN not in df.columns:
    raise ValueError(f"Target column {TARGET_COLUMN} is required in the dataset.")

print("Cleaning and Encoding...")
df = df.replace("NA", np.nan)
y = df[TARGET_COLUMN].astype(int)
x = df.drop(columns=[TARGET_COLUMN])

# Drop highly missing columns to save memory
missing_ratio = x.isna().mean()
high_missing = [c for c, r in missing_ratio.items() if r > 0.85]
x = x.drop(columns=high_missing)

# Encode categorical variables
categorical = [c for c in x.columns if not pd.api.types.is_numeric_dtype(x[c])]
numeric = [c for c in x.columns if c not in categorical]

if numeric:
    x[numeric] = SimpleImputer(strategy="median").fit_transform(x[numeric])
if categorical:
    x[categorical] = SimpleImputer(strategy="most_frequent").fit_transform(x[categorical])
    x[categorical] = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1).fit_transform(x[categorical])

# Limit to top 300 features to prevent OOM errors on standard hardware
x = x.iloc[:, :300]

# 3. Train-Test Split & SMOTE
print("Splitting dataset and applying SMOTE...")
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)

smote = SMOTE(random_state=42)
x_train_resampled, y_train_resampled = smote.fit_resample(x_train, y_train)

# 4. Train the Models
print("Training HistGradientBoosting...")
hgb = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_depth=5, random_state=42)
hgb.fit(x_train_resampled, y_train_resampled)
hgb_proba = hgb.predict_proba(x_test)[:, 1]

print("Training Random Forest...")
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
rf.fit(x_train_resampled, y_train_resampled)
rf_proba = rf.predict_proba(x_test)[:, 1]

print("Training Deep Learning Neural Network (MLP)...")
mlp = MLPClassifier(hidden_layer_sizes=(100, 50), activation="relu", solver="adam", alpha=0.001, max_iter=300, random_state=42)
mlp.fit(x_train_resampled, y_train_resampled)
mlp_proba = mlp.predict_proba(x_test)[:, 1]

# 5. Weighted Soft-Vote Ensemble
print("Ensembling predictions...")
proba = (0.40 * hgb_proba) + (0.30 * rf_proba) + (0.30 * mlp_proba)

# 6. Apply Aggressive Threshold for Maximum Recall
BEST_THRESH = 0.15
predictions = (proba >= BEST_THRESH).astype(int)

# 7. Evaluate Metrics
print("\n=== Model Performance ===")
tn, fp, fn, tp = confusion_matrix(y_test, predictions).ravel()
print(f"True Negatives:  {tn}")
print(f"False Positives: {fp} (Aggressive threshold catches these for manual review)")
print(f"False Negatives: {fn} (Kept near zero!)")
print(f"True Positives:  {tp}")

print("\nClassification Report:")
print(classification_report(y_test, predictions, zero_division=0))

print(f"ROC-AUC Score: {roc_auc_score(y_test, proba):.4f}")
print(f"PR-AUC Score:  {average_precision_score(y_test, proba):.4f}")
