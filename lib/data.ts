export const kpis = [
  { label: "Critical accounts", value: "184", delta: "+12.4%", tone: "critical" },
  { label: "Mule rings", value: "27", delta: "+5 today", tone: "warning" },
  { label: "PR-AUC", value: "0.914", delta: "ensemble", tone: "stable" },
  { label: "SAR drafts", value: "41", delta: "ready", tone: "stable" }
];

export const organizationDataset = {
  filename: "DataSet.csv",
  displayName: "organization dataset.csv",
  rows: "9,082",
  features: "3,924",
  target: "F3924",
  source: "Problem statement dataset provided by the organization"
};

export const accounts = [
  {
    id: "AC-842917",
    customer: "N. Krishnan",
    segment: "Self-employed",
    score: 94,
    priority: "P1",
    exposure: "₹48.2L",
    typology: "Pass-through + funnel",
    ring: "#14",
    analyst: "Maya Iyer"
  },
  {
    id: "AC-278104",
    customer: "A. Sharma",
    segment: "Student",
    score: 88,
    priority: "P1",
    exposure: "₹12.7L",
    typology: "Structuring",
    ring: "#09",
    analyst: "Unassigned"
  },
  {
    id: "AC-665032",
    customer: "S. Ahmed",
    segment: "Unemployed",
    score: 77,
    priority: "P2",
    exposure: "₹8.1L",
    typology: "Dormancy break",
    ring: "#21",
    analyst: "Rohit Menon"
  },
  {
    id: "AC-391775",
    customer: "P. Nair",
    segment: "Salaried",
    score: 62,
    priority: "P2",
    exposure: "₹5.4L",
    typology: "Peer deviation",
    ring: "None",
    analyst: "Maya Iyer"
  }
];

export const fraudDna = [
  { metric: "Velocity", value: 91 },
  { metric: "Liquidity", value: 82 },
  { metric: "Behavior", value: 76 },
  { metric: "Network", value: 94 },
  { metric: "Peer Dev.", value: 88 },
  { metric: "Drift", value: 79 },
  { metric: "AML", value: 92 }
];

export const typologies = [
  { name: "Pass-through", score: 96, detail: "Median retention time: 2h 47m" },
  { name: "Layering", score: 84, detail: "A -> B -> C -> D depth observed" },
  { name: "Structuring", score: 72, detail: "49 repeated credits below threshold" },
  { name: "Circular flow", score: 41, detail: "Weak 3-node return path" },
  { name: "Funnel account", score: 91, detail: "38 senders, 2 withdrawals" },
  { name: "Dormancy break", score: 67, detail: "221-day inactivity ended abruptly" }
];

export const modelMetrics = [
  { name: "ROC-AUC", value: 0.962 },
  { name: "PR-AUC", value: 0.914 },
  { name: "Precision", value: 0.872 },
  { name: "Recall", value: 0.829 },
  { name: "F1", value: 0.85 }
];

export const featureImportance = [
  { feature: "Transaction Velocity (24h)", value: 0.94 },
  { feature: "Device Fingerprint Risk", value: 0.89 },
  { feature: "Retention Time", value: 0.87 },
  { feature: "Geo-Distance from Primary", value: 0.85 },
  { feature: "Darkweb Exposure Score", value: 0.82 },
  { feature: "Peer Risk Ratio", value: 0.80 },
  { feature: "Structuring Pattern Conf.", value: 0.79 },
  { feature: "Beneficiary Watchlist Prox.", value: 0.77 },
  { feature: "Network PageRank", value: 0.75 },
  { feature: "High-Risk Juris. Volume", value: 0.73 },
  { feature: "Rapid Pass-through Rate", value: 0.68 },
  { feature: "Dormancy Break Indicator", value: 0.65 },
  { feature: "Atypical Counterparties", value: 0.62 },
  { feature: "Cross-border Swift Freq.", value: 0.59 },
  { feature: "Funnel Account Hub Score", value: 0.55 },
  { feature: "Shared IP Address Flag", value: 0.52 },
  { feature: "Virtual Number Usage", value: 0.49 },
  { feature: "Crypto Exchange Links", value: 0.45 },
  { feature: "Off-hours Activity Spike", value: 0.41 },
  { feature: "Micro-deposit Count", value: 0.38 },
  { feature: "Multi-account Login", value: 0.35 },
];

export const networkNodes = [
  { id: "AC-842917", x: 52, y: 48, r: 15, risk: 94 },
  { id: "AC-118204", x: 30, y: 25, r: 9, risk: 81 },
  { id: "AC-776420", x: 72, y: 31, r: 8, risk: 67 },
  { id: "AC-551029", x: 78, y: 67, r: 10, risk: 88 },
  { id: "AC-229015", x: 37, y: 72, r: 7, risk: 54 },
  { id: "AC-900331", x: 18, y: 55, r: 6, risk: 43 }
];

export const networkEdges = [
  ["AC-842917", "AC-118204"],
  ["AC-842917", "AC-776420"],
  ["AC-842917", "AC-551029"],
  ["AC-842917", "AC-229015"],
  ["AC-229015", "AC-900331"],
  ["AC-118204", "AC-551029"]
];
