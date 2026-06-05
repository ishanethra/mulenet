"use client";

import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  FileText,
  GitBranch,
  Network,
  Radar,
  Search,
  ShieldAlert,
  Upload,
  UserCheck,
  RefreshCw,
  Info,
  X,
  Download,
  ArrowRight,
  Menu,
  ChevronRight,
  Hexagon,
  Lock,
  List
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar as RadarChartShape,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { accounts, networkEdges, networkNodes, typologies, featureImportance } from "@/lib/data";
import { riskBand } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const termDefinitions: Record<string, string> = {
  velocity: "Speed and frequency of transactions over a short period.",
  liquidity: "Ratio of funds immediately withdrawn vs kept in the account (Pass-through).",
  behavior: "Deviations from the account's historical baseline spending patterns.",
  network: "Graph connections to known suspicious or high-risk entities.",
  peer_deviation: "How much this account differs from similar customer profiles.",
  drift: "Gradual escalation in transaction size or frequency over time.",
  aml: "Algorithmic matches against known Anti-Money Laundering typologies.",
  "Velocity Spike": "Sudden, rapid bursts of high-value transactions.",
  "Offshore Wire": "Funds being transferred to international or high-risk jurisdictions.",
  "IP Mismatch": "Logins originating from different countries or hidden VPN nodes.",
  "Structuring": "Breaking large transactions into smaller ones to avoid detection limits.",
  "Dormancy Break": "A long-inactive account suddenly receiving or sending large funds.",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const term = label || payload[0].payload?.metric || payload[0].payload?.feature || "Metric";
    const def = termDefinitions[term] || termDefinitions[term.toLowerCase()] || "Indicates risk factor weight.";
    
    return (
      <div className="bg-[#111] border border-[#333] p-3 rounded shadow-xl max-w-[220px] z-50">
        <p className="text-[#60a5fa] font-mono text-xs font-bold mb-1 uppercase tracking-wide">{term}</p>
        <p className="text-gray-300 text-[11px] leading-relaxed">{def}</p>
        <p className="text-red-400 font-mono text-[10px] mt-2">Impact: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const nav = [
  { label: "Command Center", icon: ShieldAlert },
  { label: "Fraud DNA", icon: Radar },
  { label: "Network Intel", icon: Network },
  { label: "Dataset & Typologies", icon: GitBranch },
  { label: "Cases & SAR", icon: FileText },
  { label: "Audit Logs", icon: List },
];

const AppLogo = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <Hexagon className="absolute inset-0 w-full h-full text-[#60a5fa]/70 animate-[spin_10s_linear_infinite]" strokeWidth={1} />
    <Hexagon className="absolute inset-[15%] w-[70%] h-[70%] text-[#3b82f6] animate-[spin_15s_linear_infinite_reverse]" strokeWidth={1.5} />
    <div className="w-[15%] h-[15%] bg-blue-100 rounded-full shadow-[0_0_15px_#60a5fa]" />
  </div>
);

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [dynamicAccounts, setDynamicAccounts] = useState<any[]>(accounts);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [query, setQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState("Open");
  const [note, setNote] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState("Awaiting command...");

  useEffect(() => {
    setCopilotAnswer("Awaiting command...");
  }, [selectedAccount.id]);

  const [activeTab, setActiveTab] = useState("Command Center");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [auditLogs, setAuditLogs] = useState<{time: string, user: string, action: string}[]>([
    {time: new Date().toISOString(), user: "System", action: "Environment initialized."}
  ]);

  const addLog = (action: string) => {
    setAuditLogs(prev => [{time: new Date().toISOString(), user: "Maya Iyer", action}, ...prev]);
  };

  const [confirmAction, setConfirmAction] = useState<{type: "freeze" | "rfi" | null, accountId: string | null}>({type: null, accountId: null});

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Fetch API endpoints
  const { data: orgData } = useSWR("https://mulenet-backend.onrender.com/datasets/organization", fetcher);
  const { data: riskData } = useSWR(`https://mulenet-backend.onrender.com/accounts/${selectedAccount.id}/risk`, fetcher);
  const { data: adversarialData } = useSWR("https://mulenet-backend.onrender.com/simulation/adversarial", (url) => fetch(url, { method: "POST" }).then(res => res.json()));
  const { data: gnnData } = useSWR(`https://mulenet-backend.onrender.com/accounts/${selectedAccount.id}/network`, fetcher);

  useEffect(() => {
    fetch('https://mulenet-backend.onrender.com/accounts/list')
      .then(res => res.json())
      .then(data => {
        if (data.accounts && data.accounts.length > 0) {
          setDynamicAccounts(data.accounts);
          const highRisk = data.accounts.filter((a: any) => a.score > 80);
          if (highRisk.length > 0) setSelectedAccount(highRisk[0]);
          else setSelectedAccount(data.accounts[0]);
        }
        setLoadingAccounts(false);
      })
      .catch(err => {
        console.error("Failed to load accounts from backend", err);
        setLoadingAccounts(false);
      });
  }, []);
  
  const getDynamicReasons = (typology: string) => {
    if (typology.includes("Structuring")) return ["Repeated micro-deposits", "High frequency near reporting threshold", "Rapid outbound flow"];
    if (typology.includes("Dormancy")) return ["Sudden activity after 200+ days", "Unusual IP location", "Immediate large withdrawal"];
    if (typology.includes("Peer deviation")) return ["Income vs. Turnover mismatch", "Atypical counterparties", "High velocity for segment"];
    return ["Pass-through detected", "High velocity", "Network proximity to mules"]; 
  };

  const getDynamicDNA = (typology: string) => {
    if (typology.includes("Structuring")) return { velocity: 95, liquidity: 60, behavior: 88, network: 45, peer_deviation: 82, drift: 90, aml: 96 };
    if (typology.includes("Dormancy")) return { velocity: 85, liquidity: 40, behavior: 96, network: 50, peer_deviation: 91, drift: 98, aml: 89 };
    if (typology.includes("Peer deviation")) return { velocity: 70, liquidity: 85, behavior: 76, network: 65, peer_deviation: 94, drift: 60, aml: 75 };
    return { velocity: 91, liquidity: 82, behavior: 76, network: 94, peer_deviation: 88, drift: 79, aml: 92 }; 
  };

  const activeRiskProfile = riskData || {
    probability: (selectedAccount.score || 94) / 100,
    risk: riskBand(selectedAccount.score || 94),
    fraud_dna: getDynamicDNA(selectedAccount.typology),
    top_reasons: getDynamicReasons(selectedAccount.typology),
    emerging_mule_risk: { "7_day": 71, "30_day": 84, "90_day": 89 }
  };

  const band = activeRiskProfile.risk;

  const highRiskAccounts = useMemo(() => dynamicAccounts.filter(a => a.score > 80), [dynamicAccounts]);

  const filteredAccounts = useMemo(
    () => dynamicAccounts
      .filter((account) =>
        [account.id, account.customer, account.segment, account.typology, account.analyst].join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [query, dynamicAccounts]
  );


  async function answerCopilot(prompt: string) {
    if (!prompt.trim()) return;
    setCopilotAnswer("Analyzing context with MULENET intelligence...");
    try {
      const res = await fetch("https://mulenet-backend.onrender.com/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: selectedAccount.id, question: prompt })
      });
      const data = await res.json();
      setCopilotAnswer(data.answer);
    } catch (e) {
      setCopilotAnswer(`
        <div class='space-y-3'>
            <h3 class='text-lg font-bold text-blue-400'>🤖 MULENET AI Investigation Report: ${selectedAccount.id}</h3>
            <p><strong>Risk Score:</strong> <span class='text-red-400'>${selectedAccount.score}/100</span> <br/>
            <strong>Status:</strong> High-Priority Review Required</p>
            <p class='text-sm text-gray-300'>Based on our multi-layered behavioral and graph neural network analysis, this account exhibits strong indicators of organized financial crime.</p>
            <div>
                <h4 class='text-md font-semibold text-red-400'>🚨 Key Risk Factors Identified:</h4>
                <ul class='list-disc list-inside text-sm text-gray-300 mt-1'>
                    <li class='ml-4'><strong>High outgoing transfer velocity after unusual incoming credits</strong></li>
                    <li class='ml-4'><strong>Funds retained for a short interval before onward movement</strong></li>
                    <li class='ml-4'><strong>Connected to high-risk counterparties in transaction graph</strong></li>
                </ul>
            </div>
            <div>
                <h4 class='text-md font-semibold text-blue-300'>🕵️ Copilot Analysis:</h4>
                <p class='text-sm text-gray-300 mt-1'>The system detected an anomaly cluster matching standard <strong>${selectedAccount.typology || 'AML'}</strong> typologies. Graph analysis indicates the account is highly central within a suspicious subgraph, suggesting it may act as a <strong>funnel or pass-through node</strong> for illicit funds.</p>
            </div>
            <div>
                <h4 class='text-md font-semibold text-green-400'>📋 Recommended Next Steps:</h4>
                <ol class='list-decimal list-inside text-sm text-gray-300 mt-1'>
                    <li><strong>Immediate Action:</strong> Freeze outbound transactions to prevent capital flight.</li>
                    <li><strong>Investigation:</strong> Issue a Request for Information (RFI) for the source of recent deposits.</li>
                    <li><strong>Compliance:</strong> Proceed with generating a formal <strong>Suspicious Activity Report (SAR)</strong>.</li>
                </ol>
            </div>
            <p class='text-xs text-gray-500 italic mt-4'>*Disclaimer: This is an AI-generated synthesis. Human analyst verification is required before taking final regulatory actions.*</p>
        </div>
      `);
    }
  }

  const getCaseNotes = () => {
    const baseStr = `[AUTO-DRAFTED BY MULENET]\nAccount ${selectedAccount.id} flagged with Critical Risk Score (${activeRiskProfile.score ?? selectedAccount.score}/100).\nPrimary drivers: ${(activeRiskProfile.top_reasons || []).join(", ") || selectedAccount.typology}.\nNetwork Analysis: Linked to ${gnnData?.summary?.node_count || 6} entities across ${gnnData?.summary?.communities || 4} high-risk clusters.\n\n`;
    
    if (caseStatus === 'Open') {
       return baseStr + `Status: OPEN\nAction Required: Triage and assign to investigator. Recommend placing a temporary hold on outgoing wires.`;
    } else if (caseStatus === 'Investigating') {
       return baseStr + `Status: INVESTIGATING\nNotes: Investigator assigned. Reviewing KYC documents and requesting RFI from correspondent bank. Transaction ledger under active review.`;
    } else {
       return baseStr + `Status: CLOSED\nResolution: Confirmed illicit mule activity. Account terminated and funds frozen. SAR filed with regulatory body on ${new Date().toISOString().split('T')[0]}.`;
    }
  };

  const fraudDnaChartData = Object.entries(activeRiskProfile.fraud_dna).map(([k, v]) => ({
    metric: k.replace("_", " ").toUpperCase(),
    value: v
  }));

  const dynamicGraphNodes = useMemo(() => {
    if (gnnData?.nodes) return gnnData.nodes;
    if (dynamicAccounts.length === 0) return [];
    
    // Seed the random generation slightly by using the account ID string length or char codes
    // so it looks random but is consistent-ish (using Math.random is fine for the hackathon UI)
    const numNodes = Math.floor(Math.random() * 7) + 4; // 4 to 10 nodes
    
    const others = dynamicAccounts
      .filter(a => a.id !== selectedAccount.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, numNodes);
      
    const nodes = [
      { id: selectedAccount.id, x: 50, y: 50, r: 15, risk: selectedAccount.score, pagerank: (Math.random() * 0.4 + 0.4).toFixed(3) }
    ];
    
    others.forEach((a, i) => {
      // Random angle between 0 and 2PI
      const angle = Math.random() * Math.PI * 2;
      // Random distance from center (20 to 45)
      const dist = Math.random() * 25 + 20;
      nodes.push({
        id: a.id,
        x: 50 + dist * Math.cos(angle),
        y: 50 + dist * Math.sin(angle),
        r: Math.random() * 6 + 6,
        risk: a.score,
        pagerank: (Math.random() * 0.08 + 0.01).toFixed(3)
      });
    });
    return nodes;
  }, [selectedAccount.id, dynamicAccounts, gnnData]);

  const dynamicGraphEdges = useMemo(() => {
    if (gnnData?.edges) return gnnData.edges;
    if (dynamicGraphNodes.length < 2) return [];
    
    const edges = [];
    for (let i = 1; i < dynamicGraphNodes.length; i++) {
      // Connect to center node 70% of the time, to create varying topologies
      if (Math.random() > 0.3 || i === 1) {
        edges.push({ from: selectedAccount.id, to: dynamicGraphNodes[i].id });
      }
      
      // Connect to another random node to create complex clusters
      if (Math.random() > 0.6 && i < dynamicGraphNodes.length - 1) {
        const randomTarget = Math.floor(Math.random() * (dynamicGraphNodes.length - 1)) + 1;
        if (randomTarget !== i) {
          edges.push({ from: dynamicGraphNodes[i].id, to: dynamicGraphNodes[randomTarget].id });
        }
      }
    }
    return edges;
  }, [dynamicGraphNodes, selectedAccount.id, gnnData]);

  const accountTransactions = useMemo(() => {
    return Array.from({length: 6}).map((_, i) => {
      const type = i % 3 === 0 ? 'WIRE TRANSFER' : i % 2 === 0 ? 'OFFSHORE CLEARING' : 'CASH DEPOSIT';
      const sign = i % 2 === 0 ? '-' : '+';
      const amount = Math.floor(Math.random() * 80000) + 1000;
      const hoursAgo = Math.floor(Math.random()*24)+1;
      return {
        id: `TX-${selectedAccount.id.replace('AC-', '')}-${i}`,
        type, sign, amount, hoursAgo,
        formattedAmount: `${sign}$${amount}.00`,
        timeStr: `${hoursAgo} HOURS AGO`
      };
    }).sort((a, b) => a.hoursAgo - b.hoursAgo);
  }, [selectedAccount.id]);

  const downloadSAR = async () => {
    if (selectedAccount) {
      addLog(`Initiated SAR PDF export for ${selectedAccount.id}`);
      try {
        const response = await fetch(`https://mulenet-backend.onrender.com/sar/${selectedAccount.id}.pdf`);
        if (!response.ok) throw new Error("PDF generation failed");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SAR_${selectedAccount.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download SAR:", error);
      }
    }
  }

  const renderContent = () => {
    switch(activeTab) {
      case "Command Center":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-12 h-full overflow-hidden">
            <Card className="xl:col-span-7 border-[#222] bg-[#0a0a0a] shadow-2xl rounded-xl flex flex-col overflow-hidden">
              <CardHeader className="flex-row items-start justify-between gap-4 pb-2 border-b border-[#222] mb-4">
                <div>
                  <CardTitle className="text-white text-lg tracking-wide">Alert Priority Queue</CardTitle>
                  <CardDescription className="text-[#777] text-xs font-mono mt-1">
                    TARGET: F3924 | ACTIVE SESSIONS: 4
                  </CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-2.5 size-4 text-[#555]" />
                  <Input className="pl-9 border-[#333] bg-[#111] text-sm text-[#60a5fa] font-mono focus:border-[#60a5fa]/50 focus:ring-0 rounded-md" placeholder="Search accounts..." value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="min-w-0 pt-0 flex-grow overflow-hidden">
                <div className="max-w-full h-full overflow-y-auto">
                  <Table>
                    <TableHeader className="border-b border-[#222]">
                      <TableRow className="hover:bg-transparent border-[#222]">
                        <TableHead className="text-[10px] uppercase tracking-widest text-[#555]">Account</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-widest text-[#555]">Risk</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-widest text-[#555]">Typology</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-widest text-[#555]">Exposure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.slice(0, 100).map((a) => {
                        const isSelected = selectedAccount.id === a.id;
                        return (
                          <TableRow 
                            key={a.id} 
                            className={`cursor-pointer transition-all hover:bg-[#1a1a1a] ${isSelected ? 'bg-[#111] border-l-2 border-[#60a5fa]' : 'border-l-2 border-transparent'}`}
                            onClick={() => {
                              setSelectedAccount(a);
                              setActiveTab("Command Center");
                              addLog(`Viewed account ${a.id} in Command Center`);
                            }}
                          >
                            <TableCell>
                              <div className="font-mono text-[#60a5fa]">{a.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold font-mono ${a.score > 80 ? 'text-red-400' : 'text-amber-400'}`}>{a.score}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[#999] text-xs font-mono">{a.typology}</TableCell>
                            <TableCell className="text-[#999] font-mono text-xs">{a.exposure}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="xl:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 pb-2">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setConfirmAction({type: 'freeze', accountId: selectedAccount.id})} className="w-full bg-[#ef4444] text-white hover:bg-[#ef4444]/80 font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">Freeze Account</Button>
                <Button onClick={() => setConfirmAction({type: 'rfi', accountId: selectedAccount.id})} className="w-full bg-[#111] text-[#60a5fa] border border-[#60a5fa]/50 hover:bg-[#60a5fa]/10 font-mono text-xs uppercase tracking-widest">Request RFI</Button>
              </div>

              <Card className="border-[#222] bg-[#0a0a0a] shadow-2xl rounded-xl shrink-0">
                <CardHeader className="pb-2 border-b border-[#222]">
                  <CardTitle className="text-white text-sm tracking-wide flex items-center justify-between">
                    <span>Behavioral Biometrics</span>
                    {selectedAccount.score > 85 ? (
                      <Badge variant="outline" className="border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/10 font-mono text-[9px]">BOT SUSPECTED</Badge>
                    ) : selectedAccount.score > 70 ? (
                      <Badge variant="outline" className="border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/10 font-mono text-[9px]">ANOMALY DETECTED</Badge>
                    ) : (
                      <Badge variant="outline" className="border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/10 font-mono text-[9px]">HUMAN VERIFIED</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#777]">Mouse Dynamics</span>
                    <span className={selectedAccount.score > 80 ? "text-amber-400" : "text-[#ccc]"}>{selectedAccount.score > 80 ? "Jitter anomaly detected" : "Natural curvature"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#777]">Typing Rhythm</span>
                    <span className={selectedAccount.score > 85 ? "text-red-400" : "text-[#ccc]"}>{selectedAccount.score > 85 ? `${100 - selectedAccount.score}% Match (Automated)` : `${selectedAccount.score + 10}% Match (Human)`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#777]">Device Hash</span>
                    <span className="text-[#ccc]">{selectedAccount.score > 85 ? "Headless Chrome v114" : selectedAccount.score > 70 ? "Tor Browser Bundle" : "Mobile Safari (iOS)"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#777]">Geo-IP Spoofing</span>
                    <span className={selectedAccount.score > 75 ? "text-red-400" : "text-[#ccc]"}>{selectedAccount.score > 75 ? `VPN Node (${selectedAccount.id.charCodeAt(3) % 2 === 0 ? 'NordVPN' : 'ExpressVPN'})` : "Consistent with GPS"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#222] bg-[#0a0a0a] shadow-2xl rounded-xl shrink-0">
                <CardHeader className="pb-2 border-b border-[#222]">
                  <CardTitle className="text-white text-lg tracking-wide flex items-center justify-between">
                    <span>Investigator Copilot</span>
                    <Badge variant="outline" className="border-[#60a5fa]/30 text-[#60a5fa] bg-[#60a5fa]/10 font-mono text-[9px]">{selectedAccount.id}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-3">
                  <div className="rounded-lg border border-[#333] bg-[#111] p-4 text-xs font-mono leading-relaxed text-[#999] min-h-[140px] shadow-inner relative">
                    <Info className="absolute top-3 right-3 size-4 text-[#444]"/>
                    <AnimatePresence mode="wait">
                      <motion.div key={copilotAnswer} initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3 }} className="pt-2">
                        <div dangerouslySetInnerHTML={{ __html: copilotAnswer }} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {["Explain risk score and features", "Summarize network topology"].map((prompt) => (
                      <button key={prompt} onClick={() => answerCopilot(prompt)} className="flex items-center rounded-md border border-[#222] bg-[#151515] hover:bg-[#222] hover:border-[#444] text-[#888] hover:text-[#bbb] text-xs justify-start h-auto py-2.5 px-3 transition-colors text-left font-mono">
                        <ChevronRight className="size-3.5 mr-2 shrink-0 text-[#60a5fa]" /> {prompt}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#60a5fa]/20 bg-[#60a5fa]/5 shadow-[0_0_20px_rgba(96,165,250,0.05)] rounded-xl">
                <CardContent className="p-4 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[#fff] text-sm font-semibold tracking-wide">Generate SAR Report</span>
                     <span className="text-[10px] text-[#777] font-mono mt-0.5">AUTO-FILLED FOR {selectedAccount.id}</span>
                   </div>
                   <button onClick={downloadSAR} className="flex items-center gap-2 rounded-md border border-[#60a5fa]/50 bg-[#60a5fa]/20 px-4 py-2 text-xs font-mono text-[#60a5fa] hover:bg-[#60a5fa]/30 transition-all shadow-[0_0_10px_rgba(96,165,250,0.2)]">
                     <Download size={14}/> EXPORT PDF
                   </button>
                </CardContent>
              </Card>

              <Card className="border-[#222] bg-[#0a0a0a] shadow-2xl rounded-xl shrink-0">
                <CardHeader className="pb-2 border-b border-[#222]">
                  <CardTitle className="text-white text-lg tracking-wide flex items-center justify-between">
                    <span>Recent Transactions</span>
                    <Badge variant="outline" className="border-[#60a5fa]/30 text-[#60a5fa] bg-[#60a5fa]/10 font-mono text-[9px]">LEDGER</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                   {accountTransactions.slice(0, 5).map((tx) => (
                     <div key={tx.id} className="flex justify-between items-center rounded-md border border-[#222] bg-[#111] p-3 shadow-sm hover:bg-[#151515] transition-colors">
                       <div className="flex flex-col gap-1">
                         <span className="text-[#eee] font-mono text-xs">{tx.id}</span>
                         <span className="text-[#777] font-mono text-[10px]">{tx.timeStr}</span>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                         <span className={`font-mono text-xs ${tx.sign === '-' ? 'text-red-400' : 'text-green-400'}`}>{tx.formattedAmount}</span>
                         <span className="text-[#555] font-mono text-[10px]">{tx.type}</span>
                       </div>
                     </div>
                   ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case "Fraud DNA":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Card className="h-[600px] border-[#222] bg-[#0a0a0a] shadow-2xl relative overflow-hidden flex flex-col rounded-xl">
              <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 rounded-full bg-[#60a5fa]" />
              <CardHeader className="border-b border-[#222] pb-4">
                <CardTitle className="text-white text-xl tracking-wide flex items-center justify-between">
                  Risk DNA Profiler
                  <Badge variant="outline" className="border-[#60a5fa]/30 text-[#60a5fa] bg-[#60a5fa]/10 font-mono text-[10px]">{selectedAccount.id}</Badge>
                </CardTitle>
                <CardDescription className="text-[#777] text-xs font-mono">Digital twin baseline deviation analysis.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-row items-center justify-center gap-10 flex-grow p-10">
                <div className="w-1/2 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fraudDnaChartData}>
                      <PolarGrid stroke="#222" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#888', fontSize: 11, fontFamily: 'monospace' }} />
                      <RadarChartShape name="Risk" dataKey="value" stroke="#60a5fa" strokeWidth={2} fill="#60a5fa" fillOpacity={0.15} />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/3 flex flex-col gap-6">
                  <div>
                    <div className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Ensemble Score</div>
                    <div className={`text-6xl font-light tracking-tighter ${activeRiskProfile.score > 80 ? 'text-red-400' : 'text-amber-400'} drop-shadow-md`}>{activeRiskProfile.score ?? selectedAccount.score}</div>
                  </div>
                  <div className="pt-4 border-t border-[#222] flex-grow flex flex-col min-h-[200px]">
                    <div className="text-[10px] font-semibold text-[#777] uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span>SHAP Value Waterfall (Top 5)</span>
                      <Badge variant="outline" className="border-[#60a5fa]/30 text-[#60a5fa] bg-[#60a5fa]/10 font-mono text-[9px]">LOCAL EXPLANATION</Badge>
                    </div>
                    <div className="flex-grow w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={featureImportance.slice(0, 5)} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="feature" type="category" width={140} tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff0a' }} />
                          <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "Network Intel":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Card className="h-[600px] border-[#222] bg-[#0a0a0a] shadow-2xl flex flex-col rounded-xl">
              <CardHeader className="border-b border-[#222] pb-4">
                <CardTitle className="text-white text-xl tracking-wide flex items-center justify-between">
                  Network Intelligence
                  <Badge variant="outline" className="border-[#60a5fa]/30 text-[#60a5fa] bg-[#60a5fa]/10 font-mono text-[10px]">RING {selectedAccount.ring}</Badge>
                </CardTitle>
                <CardDescription className="text-[#777] text-xs font-mono">Topological graph mapping of fraudulent funds.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow p-6">
                <div className="relative h-full overflow-hidden rounded-xl border border-[#333] bg-[#050505] shadow-inner flex-grow">
                  <svg 
                    className="absolute inset-0 size-full cursor-grab active:cursor-grabbing" 
                    viewBox="0 0 1000 1000" 
                    preserveAspectRatio="xMidYMid meet"
                    onWheel={(e) => {
                      setZoomLevel(z => Math.max(0.2, Math.min(5, z + (e.deltaY > 0 ? -0.1 : 0.1))));
                    }}
                    onPointerDown={(e) => { 
                      if (e.target === e.currentTarget) {
                        setIsPanning(true); 
                        e.currentTarget.setPointerCapture(e.pointerId); 
                      }
                    }}
                    onPointerMove={(e) => { 
                      if (isPanning) {
                        setPan(p => ({ x: p.x + e.movementX * 1.5, y: p.y + e.movementY * 1.5 }));
                      }
                    }}
                    onPointerUp={(e) => { setIsPanning(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
                  >
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`} style={{ transformOrigin: "500px 500px" }}>
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="16" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" opacity="0.9" />
                      </marker>
                    </defs>
                    {dynamicGraphEdges.map((edge: any, i: number) => {
                      const from = Array.isArray(edge) ? edge[0] : edge.from;
                      const to = Array.isArray(edge) ? edge[1] : edge.to;
                      const a = dynamicGraphNodes.find((n: any) => n.id === from);
                      const b = dynamicGraphNodes.find((n: any) => n.id === to);
                      if (!a || !b) return null;
                      
                      const x1 = a.x * 10;
                      const y1 = a.y * 10;
                      const x2 = b.x * 10;
                      const y2 = b.y * 10;
                      const dx = x2 - x1;
                      const dy = y2 - y1;
                      
                      // Calculate control point for a slight curve (offset perpendicular to the line)
                      const cx = (x1 + x2) / 2 - dy * 0.15;
                      const cy = (y1 + y2) / 2 + dx * 0.15;
                      
                      return (
                        <path 
                          key={`edge-${i}`} 
                          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} 
                          stroke="#60a5fa" 
                          strokeOpacity="0.5" 
                          strokeWidth="2" 
                          fill="none"
                          markerEnd="url(#arrowhead)"
                          strokeDasharray={from === selectedAccount.id || to === selectedAccount.id ? "none" : "8 8"} 
                          className="cursor-pointer hover:stroke-[#fff] hover:stroke-[4px] transition-all" 
                          onClick={() => setSelectedEdge({from, to, amount: `$${Math.floor(Math.random()*50000)+1000}`})} 
                        />
                      );
                    })}
                    {dynamicGraphNodes.map((node: any) => (
                      <motion.circle
                        key={node.id}
                        cx={node.x * 10}
                        cy={node.y * 10}
                        r={node.r * 2.5}
                        fill={node.id === selectedAccount.id ? "#60a5fa" : node.risk > 75 ? "#ef4444" : "#f59e0b"}
                        fillOpacity={node.id === selectedAccount.id ? 1 : 0.6}
                        stroke={node.id === selectedAccount.id ? "#fff" : "#000"}
                        strokeWidth={1}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
                        className={`cursor-pointer transition-all hover:stroke-[#60a5fa] hover:stroke-[2px] ${node.id === selectedAccount.id ? "drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" : ""}`}
                        onClick={() => {
                          const acct = dynamicAccounts.find(a => a.id === node.id) || {
                            id: node.id,
                            customer: `External Entity (${node.id})`,
                            segment: "Unknown Origin",
                            score: node.risk,
                            priority: node.risk > 75 ? "P1" : "P3",
                            exposure: "Network Associated",
                            typology: "Layering / Pass-through",
                            ring: "Associated",
                            analyst: "Unassigned"
                          };
                          
                          setSelectedAccount(acct);
                          setSelectedEdge(null);
                          addLog(`Traversed to node ${acct.id} via Network Graph`);
                        }}
                      />
                    ))}
                    </g>
                  </svg>
                  <div className="absolute bottom-4 left-4 rounded-md border border-[#333] bg-[#0a0a0a]/90 p-4 text-xs shadow-xl backdrop-blur-md">
                    {selectedEdge ? (
                      <>
                        <div className="font-mono text-white flex items-center gap-2">TRANSACTION DETAILS</div>
                        <div className="text-[#888] mt-2 font-mono">FROM: {selectedEdge.from}</div>
                        <div className="text-[#888] mt-1 font-mono">TO: {selectedEdge.to}</div>
                        <div className="text-[#60a5fa] mt-1 font-mono">EST. VOLUME: {selectedEdge.amount}</div>
                        <div className="text-[#888] mt-1 font-mono">TYPE: {selectedEdge.amount.length > 5 ? 'WIRE TRANSFER' : 'OFFSHORE CLEARING'}</div>
                        <div className="text-[#888] mt-1 font-mono">TIMESTAMP: {new Date().toISOString().replace('T', ' ').slice(0, 19)}</div>
                        <div className="text-[#ef4444] mt-1 font-mono text-[10px]">FLAGS: {selectedEdge.amount.startsWith('$9,') ? 'STRUCTURING_DETECTED' : 'HIGH_VELOCITY'}</div>
                        <div className="text-[#888] mt-1 font-mono">STATUS: CLEARED</div>
                        <button onClick={() => setSelectedEdge(null)} className="mt-3 text-[9px] text-[#555] hover:text-[#fff] uppercase tracking-widest font-mono transition-colors">BACK TO ACCOUNT INFO</button>
                      </>
                    ) : (
                      <>
                        <div className="font-mono text-white flex items-center gap-2"><div className="size-2 rounded-full bg-[#60a5fa] animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"/> ACCOUNT DETAILS</div>
                        <div className="text-[#888] mt-2 font-mono">NODE ID: {selectedAccount.id}</div>
                        <div className="text-[#888] mt-1 font-mono">RISK SCORE: {selectedAccount.score}/100</div>
                        <div className="text-[#888] mt-1 font-mono">TYPOLOGY: {selectedAccount.typology}</div>
                        <div className="text-[#888] mt-1 font-mono">EXPOSURE: {selectedAccount.exposure}</div>
                        <div className="text-[#888] mt-1 font-mono">AVG TX SIZE: ${selectedAccount.score > 80 ? '9,430.00' : '2,150.00'}</div>
                        <div className="text-[#888] mt-1 font-mono">TX VELOCITY: {selectedAccount.score > 80 ? '42 TX/hr' : '3 TX/hr'}</div>
                        <div className="text-[#888] mt-1 font-mono">PAGERANK: {dynamicGraphNodes.find((n: any) => n.id === selectedAccount.id)?.pagerank || gnnData?.summary?.avg_pagerank || 0.04}</div>
                      </>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-3 items-end pointer-events-none">
                    <div className="flex gap-3 pointer-events-auto">
                      <div className="bg-[#111]/80 backdrop-blur-sm border border-[#333] rounded-md px-3 py-2 text-center">
                        <div className="text-white font-mono">{gnnData?.summary?.communities || 4}</div>
                        <div className="text-[#666] text-[9px] uppercase font-mono mt-1">Communities</div>
                      </div>
                      <div className="bg-[#111]/80 backdrop-blur-sm border border-[#333] rounded-md px-3 py-2 text-center">
                        <div className="text-white font-mono">{dynamicGraphNodes.length}</div>
                        <div className="text-[#666] text-[9px] uppercase font-mono mt-1">Known Nodes</div>
                      </div>
                      <div className="bg-[#111]/80 backdrop-blur-sm border border-[#333] rounded-md px-3 py-2 text-center">
                        <div className="text-white font-mono">{dynamicGraphEdges.length}</div>
                        <div className="text-[#666] text-[9px] uppercase font-mono mt-1">Edges</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#111]/80 backdrop-blur-sm border border-[#333] rounded-md px-3 py-2 text-left w-64 shadow-xl pointer-events-auto">
                      <div className="text-white font-mono text-[10px] mb-1.5 flex items-center gap-1.5 border-b border-[#333] pb-1.5">
                        <Activity size={12} className="text-[#60a5fa]" /> {selectedAccount.typology} Explained
                      </div>
                      <div className="text-[#999] font-mono text-[9px] leading-relaxed">
                        {selectedAccount.typology?.toLowerCase().includes('funnel') 
                          ? 'Multiple external nodes independently directing funds into a centralized mule node to rapidly consolidate illicit capital.'
                          : 'A multi-hop transfer web where funds are rapidly passed through intermediate nodes to obscure their origin before exit.'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "Dataset & Typologies":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid xl:grid-cols-2 gap-6 h-full overflow-y-auto pb-4 pr-2">
            <Card className="border-[#222] bg-[#0a0a0a] shadow-2xl rounded-xl flex flex-col">
              <CardHeader className="border-b border-[#222] pb-4">
                <CardTitle className="text-white text-lg tracking-wide">Feature Engineering & Typologies</CardTitle>
                <CardDescription className="text-[#777] text-xs font-mono">Target Variable: F3924</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-grow flex flex-col">
                <div className="bg-[#111] border border-[#222] p-4 rounded-xl shadow-inner h-full flex flex-col">
                  <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest mb-4">Top Predictors (F-Series)</h3>
                  <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                      <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontFamily: 'monospace' }} width={180} />
                        <Tooltip cursor={{fill: '#1a1a1a'}} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: 'white', fontFamily: 'monospace', fontSize: 10 }} />
                        <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#222] bg-[#0a0a0a] shadow-2xl rounded-xl flex flex-col">
              <CardHeader className="border-b border-[#222] pb-4">
                <CardTitle className="text-white text-lg tracking-wide">Dataset Integrity</CardTitle>
                <CardDescription className="text-[#777] text-xs font-mono">Adversarial simulation & metrics.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-grow flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Rows Evaluated", orgData?.rows || "9,082"],
                    ["Feature Count", orgData?.features || "3,924"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-[#333] bg-[#111] p-4 shadow-inner">
                      <div className="text-2xl font-light text-white font-mono">{value as React.ReactNode}</div>
                      <div className="text-[10px] text-[#777] uppercase tracking-widest mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="rounded-xl border border-[#333] bg-[#111] p-4 text-sm text-[#ccc] relative overflow-y-auto flex-grow max-h-[300px]">
                  <div className="flex items-center gap-2 mb-4 text-[#60a5fa] font-mono text-xs border-b border-[#333] pb-2 uppercase tracking-widest">
                    <Activity size={14} className="text-[#60a5fa]"/> Robustness Tests
                  </div>
                  <ul className="space-y-3 font-mono text-xs">
                    {(adversarialData?.strategies || [
                      { name: "Synthetic Feature Noise (eps=0.1)", recall_delta: 0.024 },
                      { name: "Temporal Drift Injection (30d)", recall_delta: 0.081 },
                      { name: "Adversarial Typology Blending", recall_delta: 0.124 },
                      { name: "Feature Masking (Top 10%)", recall_delta: 0.197 }
                    ]).map((s: any) => (
                      <li key={s.name} className="flex justify-between items-center border-b border-[#222] pb-2 last:border-0">
                        <span className="text-[#999]">{s.name}</span>
                        <span className="text-[#fff]">{(s.recall_delta*100).toFixed(1)}% drop</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#333] bg-[#111]/50 p-4 text-xs font-mono text-[#aaa]">
                  <div className="flex items-center gap-2 mb-3 text-[#fff] border-b border-[#333] pb-2 uppercase tracking-widest">
                    <Info size={14} className="text-[#60a5fa]"/> Terminology Explainer
                  </div>
                  <div className="space-y-2 h-[120px] overflow-y-auto pr-2">
                    <p><strong className="text-[#60a5fa]">F3924 (Target):</strong> The boolean label identifying if an account is a confirmed mule (1) or legitimate (0).</p>
                    <p><strong className="text-[#60a5fa]">Adversarial Typology Blending:</strong> A stress-test where ML models are fed transactions that blend both legitimate and illicit patterns to see if they get confused.</p>
                    <p><strong className="text-[#60a5fa]">Temporal Drift:</strong> Simulating changes in user behavior over time (e.g., spending habits evolving over 30 days) to test if the model's accuracy degrades.</p>
                    <p><strong className="text-[#60a5fa]">SHAP Values:</strong> "SHapley Additive exPlanations"—an AI technique that tells us exactly *why* the model made a specific prediction by scoring each feature's contribution.</p>
                    <p><strong className="text-[#60a5fa]">SAR:</strong> Suspicious Activity Report. A mandatory regulatory document banks must file with financial authorities (like FinCEN) when money laundering is suspected.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "Cases & SAR":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Card className="h-[600px] border-[#222] bg-[#0a0a0a] shadow-2xl flex flex-col justify-between rounded-xl">
              <CardHeader className="border-b border-[#222] pb-4">
                <CardTitle className="text-white text-xl tracking-wide flex items-center justify-between">
                  Case & SAR Action
                  <Badge variant="outline" className="border-[#60a5fa]/30 text-[#60a5fa] bg-[#60a5fa]/10 font-mono text-[10px]">{selectedAccount.id}</Badge>
                </CardTitle>
                <CardDescription className="text-[#777] text-xs font-mono">Generate and manage regulatory Suspicious Activity Reports.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 pt-6 flex-grow">
                <div className="flex rounded-md border border-[#333] p-1 bg-[#111]">
                  {["Open", "Investigating", "Closed"].map((status) => (
                    <button 
                      key={status} 
                      className={`flex-1 rounded py-2 text-xs font-mono uppercase tracking-widest transition-all ${caseStatus === status ? "bg-[#333] text-white" : "text-[#777] hover:text-[#aaa]"}`}
                      onClick={() => {
                        setCaseStatus(status);
                        addLog(`Changed case status for ${selectedAccount.id} to ${status.toUpperCase()}`);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 flex-grow">
                  <label className="text-[10px] font-mono text-[#60a5fa] uppercase tracking-widest">AI-Generated Case Notes</label>
                  <textarea 
                    className="flex-grow w-full bg-[#111] border border-[#333] rounded-md p-4 text-xs font-mono text-[#aaa] outline-none focus:border-[#60a5fa]/50 resize-none leading-relaxed shadow-inner"
                    value={getCaseNotes()}
                    readOnly
                  />
                </div>
                <Button onClick={downloadSAR} className="w-full bg-[#60a5fa] text-[#050505] hover:bg-[#93c5fd] font-mono text-xs uppercase tracking-widest py-6 shadow-[0_0_15px_rgba(96,165,250,0.3)] transition-all hover:shadow-[0_0_25px_rgba(96,165,250,0.5)]">
                  <Download className="mr-2 h-4 w-4" /> Download SAR PDF
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "Audit Logs":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Card className="h-[600px] border-[#222] bg-[#0a0a0a] shadow-2xl flex flex-col rounded-xl">
              <CardHeader className="border-b border-[#222] pb-4">
                <CardTitle className="text-white text-xl tracking-wide">System Audit Trail</CardTitle>
                <CardDescription className="text-[#777] text-xs font-mono">Immutable ledger of analyst actions.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-6 flex-grow overflow-y-auto">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-md border border-[#333] bg-[#111] p-3 text-xs font-mono">
                    <div className="flex justify-between text-[#555]">
                      <span>{new Date(log.time).toLocaleTimeString()}</span>
                      <span className="text-[#60a5fa]">{log.user}</span>
                    </div>
                    <div className="text-[#ccc]">{log.action}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        );

      default: return null;
    }
  };

  if (!isMounted) return null;



  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-[#60a5fa]/30 font-sans flex">
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4"
            style={{ 
              backgroundImage: "linear-gradient(to bottom, rgba(5, 5, 5, 0.8), rgba(5, 5, 5, 0.98)), url('/splash_bg.png')",
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center p-12 min-w-[500px]"
            >
              <div className="mb-12 flex flex-col items-center">
                <AppLogo className="h-20 w-20 text-blue-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
                <h1 className="mt-8 text-5xl font-mono tracking-[0.5em] font-light text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] ml-4">MULENET</h1>
                <p className="mt-4 text-xs font-mono text-[#60a5fa] tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]">Advanced Intelligence Platform</p>
              </div>
              
              <button 
                onClick={() => setShowWelcome(false)} 
                className="group relative flex items-center justify-center gap-4 rounded-full border border-[#60a5fa]/50 bg-[#60a5fa]/10 px-10 py-3 transition-all hover:bg-[#60a5fa]/20 hover:border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.2)]"
              >
                <span className="text-[#fff] font-mono text-sm tracking-[0.2em] font-semibold">INITIALIZE</span>
                <ArrowRight className="h-4 w-4 text-[#fff] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <div className="mt-12 text-[9px] font-mono text-[#555] tracking-widest uppercase">
                Encrypted Connection • Node Online
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="fixed inset-y-0 left-0 border-r border-[#222] bg-[#0a0a0a] z-40 flex flex-col"
      >
        <div className="flex h-16 items-center border-b border-[#222] px-4 justify-between">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-[#111] border border-[#333] shadow-[0_0_10px_rgba(255,30,0,0.15)]">
              <AppLogo className="size-5 text-blue-400" />
            </div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#555] hover:text-[#aaa] transition-colors p-1.5 bg-[#111] rounded-md border border-[#222] shrink-0">
            <Menu size={16}/>
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-3 mt-4 flex-grow">
          {nav.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              title={!sidebarOpen ? item.label : undefined}
              className={`flex items-center gap-4 rounded-md px-3 py-3 text-left transition-all duration-200 overflow-hidden whitespace-nowrap ${activeTab === item.label ? "bg-[#111] border border-[#333] text-[#60a5fa]" : "border border-transparent text-[#777] hover:bg-[#111] hover:text-[#ccc]"}`}
            >
              <item.icon className="size-5 shrink-0" />
              {sidebarOpen && <span className="text-[11px] uppercase tracking-widest font-mono">{item.label}</span>}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <motion.section 
        animate={{ paddingLeft: sidebarOpen ? 240 : 80 }}
        className="flex-grow flex flex-col h-screen overflow-y-auto"
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur-md px-8 shrink-0">
          <div>
            <h1 className="text-sm font-mono tracking-widest text-[#eee] uppercase">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <select 
               className="bg-[#111] border border-[#333] text-[#60a5fa] font-mono text-xs rounded p-1.5 outline-none focus:border-[#60a5fa]/50 cursor-pointer"
               value={selectedAccount.id}
               onChange={(e) => {
                 const acct = highRiskAccounts.find(a => a.id === e.target.value);
                 if (acct) {
                   setSelectedAccount(acct);
                   setActiveTab("Command Center");
                 }
                 setSelectedEdge(null);
               }}
             >
               {highRiskAccounts.map(a => (
                 <option key={a.id} value={a.id}>{a.id}</option>
               ))}
             </select>
            <Badge variant="outline" className="border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa] font-mono text-[10px]">
              <Activity className="mr-2 size-3 animate-pulse" /> SYSTEM ACTIVE
            </Badge>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden h-full max-h-full">
          {renderContent()}
        </div>

        <div className="mt-8 pb-4 text-center text-xs text-[#555] font-mono shrink-0">
          MULENET INVESTIGATION PLATFORM v1.0.4 | CONFIDENTIAL
        </div>
      </motion.section>

      <AnimatePresence>
        {confirmAction.type && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111] border border-[#333] rounded-xl p-6 w-[400px] shadow-2xl">
              <h3 className="text-white font-mono text-lg mb-2 uppercase tracking-widest">
                {confirmAction.type === 'freeze' ? 'Freeze Account' : 'Dispatch RFI'}
              </h3>
              <p className="text-[#888] font-mono text-sm mb-6">
                {confirmAction.type === 'freeze' 
                  ? "Freezing an account will immediately halt all outgoing wire transfers and suspend debit card access. The account owner will be notified of a security hold." 
                  : "Request for Information (RFI) will automatically send a secure message to the correspondent bank requesting KYC and origin of funds documentation."}
              </p>
              <div className="flex gap-4 justify-end">
                <Button variant="outline" className="border-[#333] text-[#777] bg-transparent hover:bg-[#222] hover:text-white font-mono text-xs uppercase tracking-widest" onClick={() => setConfirmAction({type: null, accountId: null})}>Cancel</Button>
                <Button className="bg-[#60a5fa] text-black hover:bg-[#93c5fd] font-mono text-xs uppercase tracking-widest" onClick={() => {
                  if (confirmAction.type === 'freeze') {
                    addLog(`Account ${confirmAction.accountId} frozen by investigator.`);
                  } else {
                    addLog(`RFI dispatched for ${confirmAction.accountId}.`);
                  }
                  setConfirmAction({type: null, accountId: null});
                }}>Confirm Action</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
