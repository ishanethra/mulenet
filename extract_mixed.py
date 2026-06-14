import pandas as pd
import json
import random

print("Loading dataset...")
df = pd.read_csv("DataSet.csv", low_memory=False)

target_col = "F3924"
df[target_col] = pd.to_numeric(df[target_col], errors="coerce")

# Get 81 critical alerts
critical_df = df[df[target_col] == 1.0].copy()

# Get 319 non-fraud alerts to make it 400 total (4 pages of 100)
normal_df = df[df[target_col] != 1.0].head(319).copy()

print(f"Found {len(critical_df)} critical alerts and adding {len(normal_df)} normal alerts.")

accounts = []

typologies = [
    "Structuring / Smurfing", 
    "Dormancy break", 
    "Peer deviation", 
    "Pass-through / Funnel", 
    "Rapid outbound flow", 
    "Crypto conversion", 
    "Offshore transfer"
]

# Process criticals
for idx, row in critical_df.iterrows():
    exposureVal = float(row.get("F1", 0) if not pd.isna(row.get("F1", 0)) else (idx % 50))
    exposure = f"₹{(exposureVal/3).toFixed(1)}Cr" if exposureVal > 50 else f"₹{(exposureVal * 2.5 + 40):.1f}L"
    
    accounts.append({
        "id": f"AC-DB-{100000 + idx}",
        "type": str(row.get("F3886", "Retail")),
        "date": str(row.get("F3887", "2023-10-27")),
        "region": str(row.get("F3888", "Urban")),
        "occupation": str(row.get("F3889", "Salaried")),
        "gender": str(row.get("F3891", "M")),
        "segment": str(row.get("F3893", "Mass")),
        "age": float(row.get("F3894", 35)) if not pd.isna(row.get("F3894")) else 35,
        "score": 80 + random.randint(0, 18), # 80-98 High
        "status": "High",
        "exposure": f"₹{(random.uniform(2.5, 12.0)):.1f}Cr",
        "typology": typologies[idx % len(typologies)],
        "rawFeatures": {}
    })

# Process normals
for idx, row in normal_df.iterrows():
    score = random.randint(15, 65)
    status = "Medium" if score >= 40 else "Low"
    
    accounts.append({
        "id": f"AC-DB-{100000 + idx}",
        "type": str(row.get("F3886", "Retail")),
        "date": str(row.get("F3887", "2023-10-27")),
        "region": str(row.get("F3888", "Urban")),
        "occupation": str(row.get("F3889", "Salaried")),
        "gender": str(row.get("F3891", "M")),
        "segment": str(row.get("F3893", "Mass")),
        "age": float(row.get("F3894", 35)) if not pd.isna(row.get("F3894")) else 35,
        "score": score,
        "status": status,
        "exposure": f"₹{(random.uniform(4.5, 80.0)):.1f}L",
        "typology": typologies[idx % len(typologies)],
        "rawFeatures": {}
    })

# Shuffle so they are mixed!
random.seed(42)
random.shuffle(accounts)

with open("public/critical_alerts.json", "w") as f:
    json.dump(accounts, f)

print("Saved mixed accounts to critical_alerts.json with", len(accounts), "rows!")
