#!/bin/bash
MERMAID_CODE=$(cat << 'INNER_EOF'
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
        XGB[XGBoost Risk Models]:::ml
        GNN[NetworkX Graph Models]:::ml
        SHAP[SHAP Explainable AI]:::ml
    end

    subgraph Hosting [4. Cloud Infrastructure]
        Vercel[Vercel Edge Network]:::host
        Render[Render Cloud Instances]:::host
    end

    Presentation <-->|REST JSON| Backend
    Backend <--> Intelligence
    
    Vercel -.->|Hosts| Presentation
    Render -.->|Hosts| Backend
INNER_EOF
)
ENCODED=$(echo -n "$MERMAID_CODE" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s -o /Users/nethra/.gemini/antigravity/brain/38ea0513-0f9b-4d67-af91-06cdb648b9fb/artifacts/tech_stack_flowchart.png "https://mermaid.ink/img/${ENCODED}?type=png&theme=dark"
file /Users/nethra/.gemini/antigravity/brain/38ea0513-0f9b-4d67-af91-06cdb648b9fb/artifacts/tech_stack_flowchart.png
