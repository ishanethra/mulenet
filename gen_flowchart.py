import base64
import urllib.request

mermaid_code = """flowchart TD
    classDef data_source fill:#1f2937,stroke:#6366f1,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef ingest fill:#374151,stroke:#8b5cf6,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef ml_core fill:#111827,stroke:#10b981,stroke-width:3px,color:#fff,rx:8,ry:8
    classDef viz fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef action fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fff,rx:8,ry:8
    subgraph Sources [1. External Data Sources & Feeds]
        HackathonData[(Official Dataset)]:::data_source
        TMSAlerts[(TMS / Fraud Alerts)]:::data_source
        GovtAlerts[(Govt Cyber Fraud Tickets)]:::data_source
    end
    subgraph Ingestion [2. Data Ingestion & Engineering]
        FastAPI[Python FastAPI Server]:::ingest
        FeatEng[Feature Engineering: F115 - F3894]:::ingest
    end
    subgraph MLEngine [3. AI / ML Classification Engine]
        Ensemble[Stacking Ensemble: Predict F3924]:::ml_core
        GNN[Continual Graph Learning]:::ml_core
        SHAP[SHAP Explainability]:::ml_core
    end
    subgraph Client [4. AlertMind Dashboard]
        UI[React / Next.js Command Center]:::viz
        NetworkViz[Interactive Node Topologies]:::viz
        Copilot[Gen-AI Compliance Copilot]:::viz
    end
    subgraph Outputs [5. Threat Prevention]
        Freeze[Prevent Fraudulent Circulation]:::action
        SAR[Auto-Generate SAR]:::action
    end
    HackathonData --> FastAPI
    TMSAlerts --> FastAPI
    GovtAlerts --> FastAPI
    FastAPI --> FeatEng
    FeatEng --> Ensemble
    FeatEng --> GNN
    Ensemble --> SHAP
    GNN --> SHAP
    Ensemble --> UI
    SHAP --> UI
    GNN --> NetworkViz
    SHAP --> Copilot
    UI --> Freeze
    UI --> SAR
    Copilot --> SAR
"""

encoded = base64.b64encode(mermaid_code.encode('utf-8')).decode('utf-8')
url = f"https://mermaid.ink/img/{encoded}?theme=dark&bgColor=242424"
output_path = "/Users/nethra/.gemini/antigravity/brain/38ea0513-0f9b-4d67-af91-06cdb648b9fb/artifacts/proper_flowchart.png"

try:
    urllib.request.urlretrieve(url, output_path)
    print("Flowchart downloaded successfully")
except Exception as e:
    print(f"Failed to download flowchart: {e}")
