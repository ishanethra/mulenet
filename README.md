# MULENET

MULENET is a financial crime intelligence platform demo for mule account detection, AML typology analysis, graph investigation, case management, SAR drafting, and model monitoring.

## What is included

- Next.js 15, TypeScript, TailwindCSS, shadcn-style UI primitives, Recharts, Framer Motion.
- FastAPI backend with dataset upload, automatic cleaning, feature selection, imbalance-aware ensemble training, account risk scoring, AML typology detection, graph analytics, copilot, cases, SAR PDF, and adversarial simulation endpoints.
- PostgreSQL schema for accounts, transactions, model runs, risk scores, and AML cases.
- Docker and Docker Compose setup.

## Dataset contract

The organization-provided problem statement dataset is included in the project root as `DataSet.csv` and is treated by MULENET as the default `dataset.csv` source for training and demonstration.

The dataset has 9,082 rows, 3,924 features, and target column `F3924`.

- `0` means legitimate account.
- `1` means mule or suspicious account.
- `"NA"` strings are converted to missing values.

Automatic cleaning removes duplicate columns, constant columns, columns with more than 85% missing values, parsed date columns, and highly correlated numeric columns. It then imputes missing values, encodes categorical fields, and trains against the top 300 available features.

The backend resolves both `DataSet.csv` and `dataset.csv`. To override the path, set `ORGANIZATION_DATASET_PATH`.

## Local development

```bash
npm install
npm run dev
```

In another terminal:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:

- Web: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

## Docker

```bash
docker compose up --build
```

## Key API endpoints

- `POST /datasets/train` uploads and trains on the dataset.
- `GET /datasets/organization` summarizes the organization-provided `DataSet.csv`.
- `POST /datasets/organization/train` trains directly on the organization-provided `DataSet.csv`.
- `GET /accounts/{account_id}/risk` returns probability, risk score, Fraud DNA, top reasons, and emerging mule forecast.
- `POST /transactions/typologies` analyzes transaction CSV/XLSX files for AML typologies and graph signals.
- `POST /cases` records case assignment, notes, and status.
- `POST /copilot` returns an investigator-facing explanation grounded in risk context.
- `GET /sar/{account_id}.pdf` exports a SAR draft.
- `POST /simulation/adversarial` returns synthetic criminal strategy simulation results.

## Production notes

For real bank deployment, add authentication, RBAC, immutable audit logs, model registry storage, PII controls, encryption, queue-based training jobs, regulator-approved model validation, SAR jurisdiction templates, human approval workflow, and transaction monitoring integrations.
