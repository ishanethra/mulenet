export const kpis = [
  { label: "Critical accounts", value: "184", delta: "+12.4%", tone: "critical" },
  { label: "Mule rings", value: "27", delta: "+5 today", tone: "warning" },
  { label: "PR-AUC", value: "0.914", delta: "ensemble", tone: "stable" },
  { label: "SAR drafts", value: "41", delta: "ready", tone: "stable" }
];

export const organizationDataset = {
  filename: "DataSet.csv",
  displayName: "organization dataset.csv",
  rows: "9,482,104",
  features: "3,924",
  target: "F3924",
  source: "Enterprise-grade problem statement dataset"
};

// Generate a robust offline fallback dataset so the UI never looks empty
const generateFallbackAccounts = () => {
  const segments = ["Retail", "Corporate", "Student", "Self-employed", "MSME"];
  const typologies = ["Pass-through + funnel", "Structuring", "Dormancy break", "Peer deviation", "Velocity burst", "Smurfing", "Synthetic Identity"];
  const analysts = ["Maya Iyer", "Rohit Menon", "Priya Sharma", "Unassigned"];
  
  const list = [];
  
  // High risk
  for(let i=0; i<40; i++) {
    list.push({
      id: `AC-${Math.floor(Math.random() * 900000) + 100000}`,
      customer: `Customer ${i+1}`,
      segment: segments[Math.floor(Math.random() * segments.length)],
      score: Math.floor(Math.random() * 20) + 80,
      priority: "High",
      exposure: `₹${(Math.random() * 90 + 10).toFixed(1)}L`,
      typology: typologies[Math.floor(Math.random() * typologies.length)],
      ring: `#${Math.floor(Math.random() * 20) + 1}`,
      analyst: analysts[Math.floor(Math.random() * analysts.length)]
    });
  }
  
  // Medium/Low risk
  for(let i=0; i<160; i++) {
    list.push({
      id: `AC-${Math.floor(Math.random() * 900000) + 100000}`,
      customer: `Customer ${i+41}`,
      segment: segments[Math.floor(Math.random() * segments.length)],
      score: Math.floor(Math.random() * 60) + 10,
      priority: Math.random() > 0.5 ? "P2" : "P3",
      exposure: `₹${(Math.random() * 20 + 1).toFixed(1)}L`,
      typology: "Natural curvature",
      ring: "None",
      analyst: "Unassigned"
    });
  }
  
  // Make sure we have the specific AC-980419 they are used to
  list.unshift({
    id: "AC-980419",
    customer: "N. Krishnan",
    segment: "Self-employed",
    score: 94,
    priority: "High",
    exposure: "₹48.2L",
    typology: "Pass-through + funnel",
    ring: "#14",
    analyst: "Maya Iyer"
  });
  
  return list.sort((a, b) => b.score - a.score);
};

export const accounts = generateFallbackAccounts();

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
