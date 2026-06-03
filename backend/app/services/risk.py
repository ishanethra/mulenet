from __future__ import annotations

import hashlib
from dataclasses import dataclass


def risk_category(score: int) -> str:
    if score <= 25:
        return "Safe"
    if score <= 50:
        return "Monitor"
    if score <= 75:
        return "High Risk"
    return "Critical"


def stable_score(seed: str, floor: int = 35, ceiling: int = 98) -> int:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    value = int(digest[:8], 16)
    return floor + (value % (ceiling - floor + 1))


@dataclass(frozen=True)
class RiskProfile:
    probability: float
    score: int
    fraud_dna: dict[str, int]
    reasons: list[str]
    emerging: dict[str, int]


def generate_profile(account_id: str) -> RiskProfile:
    score = stable_score(account_id)
    probability = round(score / 100, 4)
    fraud_dna = {
        "velocity": min(100, score + 3),
        "liquidity": max(0, score - 8),
        "behavior": max(0, score - 13),
        "network": min(100, score + 5),
        "peer_deviation": max(0, score - 6),
        "drift": max(0, score - 15),
        "aml": min(100, score + 1),
    }
    reasons = [
        "High outgoing transfer velocity after unusual incoming credits",
        "Funds retained for a short interval before onward movement",
        "Connected to high-risk counterparties in transaction graph",
        "Peer risk ratio exceeds similar customer cohort baseline",
        "Behavior drift from learned digital twin profile",
    ]
    emerging = {
        "7_day": min(100, score - 18),
        "30_day": min(100, score - 7),
        "90_day": min(100, score - 2),
    }
    return RiskProfile(probability=probability, score=score, fraud_dna=fraud_dna, reasons=reasons, emerging=emerging)
