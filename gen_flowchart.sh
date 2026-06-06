#!/bin/bash
MERMAID_CODE=$(cat << 'INNER_EOF'
flowchart TD
    classDef data_source fill:#1f2937,stroke:#6366f1,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef ingest fill:#374151,stroke:#8b5cf6,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef ml_core fill:#111827,stroke:#10b981,stroke-width:3px,color:#fff,rx:8,ry:8
    classDef viz fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef action fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fff,rx:8,ry:8
    subgraph Sources [1. External Data Sources & Feeds]
        BankData[(Cross-Channel Bank Data)]:::data_source
        TMSAlerts[(TMS / Fraud Alerts)]:::data_source
        GovtAlerts[(Govt Cyber Fraud Tickets)]:::data_source
        RegFeeds[(Real-Time Regulatory Feeds)]:::data_source
    end
    subgraph Ingestion [2. Data Ingestion API]
        FastAPI[Python FastAPI Server]:::ingest
    end
    subgraph MLEngine [3. AI / ML Detection Engine]
        XGB[Stacking Ensemble + Temporal Learning]:::ml_core
        GNN[Continual Graph Learning]:::ml_core
        SHAP[SHAP & LIME Explainability]:::ml_core
    end
    subgraph Client [4. Investigator Dashboard]
        UI[React / Next.js Command Center]:::viz
        NetworkViz[Interactive Node Topologies]:::viz
        Copilot[Gen-AI Compliance Copilot]:::viz
    end
    subgraph Outputs [5. Threat Prevention]
        Freeze[Prevent Fraudulent Circulation]:::action
        SAR[Auto-Generate SAR]:::action
    end
    BankData --> FastAPI
    TMSAlerts --> FastAPI
    GovtAlerts --> FastAPI
    RegFeeds --> FastAPI
    FastAPI --> XGB
    FastAPI --> GNN
    XGB --> SHAP
    GNN --> SHAP
    XGB --> UI
    SHAP --> UI
    GNN --> NetworkViz
    SHAP --> Copilot
    UI --> Freeze
    UI --> SAR
    Copilot --> SAR
INNER_EOF
)
ENCODED=$(echo -n "$MERMAID_CODE" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s -o /Users/nethra/.gemini/antigravity/brain/38ea0513-0f9b-4d67-af91-06cdb648b9fb/artifacts/proper_flowchart.png "https://mermaid.ink/img/${ENCODED}?type=png&theme=dark"

MERMAID_CODE2=$(cat << 'INNER_EOF2'
flowchart TD
    classDef tech fill:#1f2937,stroke:#3b82f6,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef ml fill:#111827,stroke:#10b981,stroke-width:2px,color:#fff,rx:8,ry:8
    classDef host fill:#374151,stroke:#8b5cf6,stroke-width:2px,color:#fff,rx:8,ry:8

    subgraph Presentation [1. Frontend / Client]
        Next[Next.js & React]:::tech
        Tailwind[Tailwind CSS]:::tech
        Recharts[Recharts Data Viz]:::tech
    end

    subgraph Backend [2. Server / API Gateway]
        Python[Python 3 Runtime]:::tech
        FastAPI[FastAPI REST Framework]:::tech
        Pandas[Pandas Data Pipeline]:::tech
    end

    subgraph Intelligence [3. Core AI & ML Engine]
        XGB[Stacking Ensemble + Temporal Learning]:::ml
        GNN[Continual Graph Learning]:::ml
        SHAP[SHAP/LIME Explainable AI]:::ml
    end

    subgraph Hosting [4. Cloud Infrastructure]
        Vercel[Vercel Edge Network]:::host
        Render[Render Cloud Instances]:::host
    end

    Presentation <-->|REST JSON| Backend
    Backend <--> Intelligence
    
    Vercel -.->|Hosts| Presentation
    Render -.->|Hosts| Backend
INNER_EOF2
)
ENCODED2=$(echo -n "$MERMAID_CODE2" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s -o /Users/nethra/.gemini/antigravity/brain/38ea0513-0f9b-4d67-af91-06cdb648b9fb/artifacts/tech_stack_flowchart.png "https://mermaid.ink/img/${ENCODED2}?type=png&theme=dark"
