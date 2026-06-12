import csv
import json
import random
import os

print("Loading DataSet.csv...")

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

print("Generating accounts...")
with open('DataSet.csv', 'r') as csvfile:
    reader = csv.reader(csvfile)
    headers = next(reader)
    
    target_idx = -1
    for i, h in enumerate(headers):
        if 'F3924' in h:
            target_idx = i
            break
            
    idx = 0
    for row in reader:
        if not row or len(row) <= target_idx:
            continue
            
        try:
            target = int(float(row[target_idx])) if target_idx != -1 else random.choice([0, 1])
        except ValueError:
            target = random.choice([0, 1])
            
        score = random.randint(80, 99) if target == 1 else random.randint(10, 75)
        
        account_id = f"AC-{random.randint(100000, 999999)}"
        exposure = f"${random.randint(10, 999)}K" if score < 70 else f"${random.uniform(1.0, 10.0):.1f}M"
        
        try:
            account_type = row[target_idx - 38]
            date_opened = row[target_idx - 36]
            region = "Urban" if row[target_idx - 34] == "U" else "Rural" if row[target_idx - 34] == "R" else row[target_idx - 34]
            occupation = row[target_idx - 33].title()
            gender = row[target_idx - 32]
            segment = row[target_idx - 31].title()
            age = row[target_idx - 30]
        except IndexError:
            account_type = "Unknown"
            date_opened = "Unknown"
            region = "Unknown"
            occupation = "Unknown"
            gender = "U"
            segment = "Retail"
            age = "0"
            
        account = {
            "id": account_id,
            "customer": f"Entity-{idx+1}",
            "score": score,
            "typology": random.choice(typologies),
            "exposure": exposure,
            "ring": f"{random.randint(1, 15):02d}",
            "accountType": account_type,
            "dateOpened": date_opened,
            "region": region,
            "occupation": occupation,
            "gender": gender,
            "segment": segment,
            "age": age
        }
        accounts.append(account)
        idx += 1
        
        if idx >= 1500:
            break

output_path = 'public/accounts.json'
os.makedirs('public', exist_ok=True)
with open(output_path, 'w') as f:
    json.dump(accounts, f)

print(f"Generated {len(accounts)} accounts and saved to {output_path}")
