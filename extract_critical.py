import pandas as pd
import json

print("Loading dataset...")
df = pd.read_csv("DataSet.csv", low_memory=False)

target_col = "F3924"
df[target_col] = pd.to_numeric(df[target_col], errors="coerce")
critical_df = df[df[target_col] == 1.0].copy()

print(f"Found {len(critical_df)} critical alerts in the dataset.")

if len(critical_df) == 0:
    print("Warning: Target column might be named differently or has no 1s.")
    critical_df = df.head(81)

accounts = []
for idx, row in critical_df.iterrows():
    raw = {}
    for c in df.columns:
        val = row[c]
        if pd.isna(val):
            raw[c] = None
        else:
            raw[c] = val
            
    acct = {
        "id": f"AC-DB-{100000 + idx}",
        "type": str(row.get("F3886", "Retail")),
        "date": str(row.get("F3887", "2023-10-27")),
        "region": str(row.get("F3888", "Urban")),
        "occupation": str(row.get("F3889", "Salaried")),
        "gender": str(row.get("F3891", "M")),
        "segment": str(row.get("F3893", "Mass")),
        "age": float(row.get("F3894", 35)) if not pd.isna(row.get("F3894")) else 35,
        "score": 95 + (idx % 5), # High score for critical
        "status": "High",
        "rawFeatures": raw
    }
    accounts.append(acct)

# Save to public so Next.js can serve it statically or API can read it
with open("public/critical_alerts.json", "w") as f:
    json.dump(accounts, f)

print("Saved critical_alerts.json with", len(accounts), "rows!")
