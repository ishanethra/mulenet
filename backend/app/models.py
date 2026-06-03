from pydantic import BaseModel, Field


class RiskBand(BaseModel):
    score: int = Field(ge=0, le=100)
    category: str


class FraudDna(BaseModel):
    velocity: int
    liquidity: int
    behavior: int
    network: int
    peer_deviation: int
    drift: int
    aml: int


class AccountRisk(BaseModel):
    account_id: str
    probability: float
    risk: RiskBand
    fraud_dna: FraudDna
    top_reasons: list[str]
    emerging_mule_risk: dict[str, int]


class CaseUpdate(BaseModel):
    account_id: str
    analyst: str
    status: str
    note: str


class CopilotQuestion(BaseModel):
    account_id: str
    question: str
