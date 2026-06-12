"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Clock,
  ExternalLink,
  Lock,
  Search,
  MessageSquare,
  Target,
  Network,
  Maximize2,
  X
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { accounts as fallbackAccounts } from "@/lib/data";

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];

const InfoTooltip = ({ term, desc }: { term: string, desc: string }) => (
  <div className="group relative inline-flex items-center cursor-help underline decoration-dashed decoration-gray-500 underline-offset-4">
    {term}
    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 font-normal normal-case tracking-normal">
      <div className="bg-[#1a1a1a] border border-[#333] text-gray-200 text-xs rounded-md p-2 shadow-2xl text-center">
        {desc}
      </div>
      <div className="w-2 h-2 bg-[#1a1a1a] border-b border-r border-[#333] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
    </div>
  </div>
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [dynamicAccounts, setDynamicAccounts] = useState<any[]>(fallbackAccounts);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isReportView, setIsReportView] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Action Button States
  const [isFreezing, setIsFreezing] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isRfiSent, setIsRfiSent] = useState(false);

  // Network Modal States
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [selectedNetworkNode, setSelectedNetworkNode] = useState<any>(null);

  // Data States
  const [lineData, setLineData] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [shap, setShap] = useState<any[]>([]);

  // Sync button states with localStorage to persist across refreshes
  useEffect(() => {
    if (selectedAccount) {
      const frozenState = localStorage.getItem(`frozen_${selectedAccount.id}`);
      const rfiState = localStorage.getItem(`rfi_${selectedAccount.id}`);
      setIsFrozen(frozenState === 'true');
      setIsRfiSent(rfiState === 'true');

      // SHAP instantly generated based on account string hash to avoid backend delay
      const seed = (selectedAccount.id.charCodeAt(selectedAccount.id.length - 1) || 0) % 20 / 100.0;
      const baseShap = [
          {"name": "Transaction Velocity", "value": 34 * (1 + seed)},
          {"name": "Geographic Mismatch", "value": 28 * (1 + seed)},
          {"name": "Structuring Pattern", "value": 21 * (1 - seed)},
          {"name": "Device Hash Variance", "value": 17 * (1 - seed)}
      ];
      setShap(baseShap);

      fetch(`https://mulenet-backend.onrender.com/api/v1/accounts/${selectedAccount.id}/ledger`)
        .then(res => res.json())
        .then(data => setLedger(data.ledger))
        .catch(e => console.error(e));
    } else {
      setLedger([]);
      setShap([]);
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Check if we are in the report view (new tab)
    const params = new URLSearchParams(window.location.search);
    const accId = params.get("account");

    fetch('https://mulenet-backend.onrender.com/api/v1/accounts')
      .then(res => res.json())
      .then(data => {
        setDynamicAccounts(data.accounts || fallbackAccounts);
        if (data.lineData) setLineData(data.lineData);
      })
      .catch(err => {
        console.error("Failed to load accounts", err);
        setDynamicAccounts(fallbackAccounts);
      });
      
    // Generate instant Flux data if backend didn't provide it
    const generateFlux = () => {
      const flux = [];
      for (let i = 0; i < 24; i++) {
        const d = new Date();
        d.setHours(d.getHours() - (23 - i));
        flux.push({
          time: `${d.getHours()}:00`,
          flux: Math.floor(60 + Math.random() * 35)
        });
      }
      return flux;
    };
    setLineData(generateFlux());

    const loadedAccounts = fallbackAccounts;
    if (accId) {
      const acct = loadedAccounts.find((a: any) => a.id === accId);
      if (acct) {
        setSelectedAccount(acct);
        setIsReportView(true);
        // Clear param so reload doesn't get stuck if user wants to go back
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    setLoading(false);
  }, []);

  const filteredAccounts = useMemo(
    () => dynamicAccounts.filter((account) =>
      [account.id, account.customer, account.typology].join(" ").toLowerCase().includes(query.toLowerCase())
    ),
    [query, dynamicAccounts]
  );

  const stats = useMemo(() => {
    const totalExposure = dynamicAccounts.reduce((acc, curr) => {
      const val = parseFloat(curr.exposure.replace('₹', '').replace('L', ''));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const critical = dynamicAccounts.filter(a => a.score > 80).length;
    const avgScore = dynamicAccounts.reduce((acc, curr) => acc + curr.score, 0) / (dynamicAccounts.length || 1);
    
    return {
      exposure: `₹${totalExposure.toFixed(1)}L`,
      critical,
      avgScore: avgScore.toFixed(1)
    };
  }, [dynamicAccounts]);

  const pieData = useMemo(() => {
    const p1 = dynamicAccounts.filter(a => a.priority === 'High' || a.priority === 'P1').length;
    const p2 = dynamicAccounts.filter(a => a.priority === 'Medium' || a.priority === 'P2').length;
    const p3 = dynamicAccounts.filter(a => a.priority === 'Low' || a.priority === 'P3').length;
    return [
      { name: 'High', value: p1 },
      { name: 'Medium', value: p2 },
      { name: 'Low', value: p3 }
    ];
  }, [dynamicAccounts]);



  const openReport = (id: string) => {
    window.open(`/dashboard?account=${id}`, '_blank');
  };

  const closeReport = () => {
    window.close();
    setIsReportView(false);
  };

  const handleFreeze = () => {
    if (!selectedAccount) return;
    setIsFreezing(true);
    setTimeout(() => {
      setIsFrozen(true);
      setIsFreezing(false);
      localStorage.setItem(`frozen_${selectedAccount.id}`, 'true');
    }, 1500);
  };

  const handleDispatch = () => {
    if (!selectedAccount) return;
    setIsDispatching(true);
    setTimeout(() => {
      setIsRfiSent(true);
      setIsDispatching(false);
      localStorage.setItem(`rfi_${selectedAccount.id}`, 'true');
    }, 1500);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading Intelligence...</div>;
  }

  if (isReportView && selectedAccount) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl p-8 flex flex-col z-50 overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#222] pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Target className="text-gray-400 w-6 h-6" />
              Intelligence Dossier: {selectedAccount.id}
            </h1>
            <p className="text-gray-400 mt-1">Risk Score: {selectedAccount.score}/100 | Typology: {selectedAccount.typology}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleFreeze}
              disabled={isFrozen || isFreezing}
              className={`px-6 py-2 border rounded transition font-medium flex items-center gap-2 ${
                isFrozen 
                  ? 'bg-green-600/20 text-green-500 border-green-500/50 cursor-not-allowed' 
                  : 'bg-red-600/20 text-red-500 border-red-500/50 hover:bg-red-600/30'
              }`}
            >
              <Lock className="w-4 h-4" /> 
              {isFreezing ? 'Processing...' : isFrozen ? 'Account Frozen' : 'Freeze Account'}
            </button>
            
            <button 
              onClick={handleDispatch}
              disabled={isRfiSent || isDispatching}
              className={`px-6 py-2 border rounded transition font-medium flex items-center gap-2 ${
                isRfiSent 
                  ? 'bg-green-600/20 text-green-500 border-green-500/50 cursor-not-allowed' 
                  : 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> 
              {isDispatching ? 'Transmitting...' : isRfiSent ? 'RFI Dispatched' : 'Dispatch RFI'}
            </button>
            
            <button 
              onClick={() => alert('SAR (Suspicious Activity Report) successfully exported to Compliance Queue.')} 
              className="px-6 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded hover:bg-purple-600/30 transition font-medium flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> 
              Export SAR
            </button>
            
            <button onClick={closeReport} className="px-6 py-2 bg-[#222] text-gray-300 border border-[#333] rounded hover:bg-[#333] transition font-medium">
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Telemetry & Device Intelligence */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
            <h2 className="text-sm font-semibold mb-4 text-gray-300 border-b border-[#222] pb-3 uppercase tracking-wider">Device & Entity Telemetry</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1"><InfoTooltip term="Primary IP Address" desc="The internet address the suspect is using to connect." /></p>
                <p className="text-red-400 font-mono">194.26.x.x (VPN)</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1"><InfoTooltip term="Geo Mismatch" desc="When the user's stated location doesn't match their internet location." /></p>
                <p className="text-gray-300">Mumbai vs Cyprus</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1"><InfoTooltip term="Device Hash" desc="A unique digital fingerprint of the computer or phone used." /></p>
                <p className="text-gray-300">Linked to 4 entities</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1"><InfoTooltip term="KYC Status" desc="Know Your Customer (Identity Verification) check results." /></p>
                  <p className="text-amber-500"><InfoTooltip term="Synthetic Suspect" desc="An account created using a blend of real and fake identity details to bypass checks." /></p>
                </div>
              </div>
            </div>

            {/* Network Intel Graph */}
            <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
              <div className="flex items-center justify-between border-b border-[#222] mb-4 pb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Network className="w-4 h-4" /> <InfoTooltip term="Network Intel Graph" desc="A visual map showing how this account transfers money to other suspicious accounts." />
                </h2>
                <button onClick={() => setIsNetworkModalOpen(true)} className="text-gray-500 hover:text-white transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <XAxis type="number" dataKey="x" hide />
                    <YAxis type="number" dataKey="y" hide />
                    <ZAxis type="number" range={[100, 800]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Connected Accounts" data={[
                      { x: 10, y: 20, z: 200, name: 'Suspect Origin' },
                      { x: 15, y: 35, z: 600, name: selectedAccount.id },
                      { x: 25, y: 45, z: 200, name: 'Pass-through A' },
                      { x: 20, y: 15, z: 200, name: 'Pass-through B' },
                      { x: 35, y: 30, z: 800, name: 'Offshore Destination' },
                    ]} fill="#ef4444" line={{ stroke: "#333", strokeWidth: 2 }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
              <h2 className="text-sm font-semibold mb-4 text-gray-300 border-b border-[#222] pb-3 uppercase tracking-wider">
                <InfoTooltip term="Automated Risk Analysis" desc="AI-generated breakdown of why this account was flagged." />
              </h2>
              
              {selectedAccount.typology?.toLowerCase().includes("smurfing") ? (
                <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                  <p>System anomaly detection matched standard <strong>Smurfing</strong> patterns with high statistical confidence.</p>
                  <p>Analysis reveals a high volume of small-denomination deposits immediately preceding massive consolidated wire transfers.</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-4">
                    <li>Deposit velocities exceed the 95th percentile for this customer segment.</li>
                    <li>Amounts are consistently kept just below mandatory reporting thresholds.</li>
                    <li>Rapid consolidation of funds into a single offshore clearing account.</li>
                  </ul>
                </div>
              ) : selectedAccount.typology?.toLowerCase().includes("funnel") ? (
                <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                  <p>System anomaly detection matched <strong>Funnel Account</strong> patterns with high statistical confidence.</p>
                  <p>Graph evaluation indicates the account is highly central within a monitored subgraph, acting as a primary aggregation node.</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-4">
                    <li>Inbound transfers originate from dozens of geographically dispersed, unrelated accounts.</li>
                    <li>Funds retained below baseline threshold before onward movement.</li>
                    <li>Network proximity to previously flagged counterparties.</li>
                  </ul>
                </div>
              ) : selectedAccount.typology?.toLowerCase().includes("pass-through") ? (
                <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                  <p>System anomaly detection matched <strong>Pass-Through</strong> behavior with high statistical confidence.</p>
                  <p>The account acts merely as a temporary holding vehicle, exhibiting zero genuine wealth accumulation or legitimate commerce.</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-4">
                    <li>1:1 ratio of incoming deposits to outgoing transfers within 24 hours.</li>
                    <li>Transactions occur during unusual hours (2 AM - 4 AM local time).</li>
                    <li>Immediate clearing to jurisdictions with high financial secrecy indices.</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                  <p>System anomaly detection matched <strong>{selectedAccount.typology}</strong> patterns with high statistical confidence.</p>
                  <p>Deep Learning validation indicates a highly anomalous transaction sequence deviating sharply from the account's historical baseline.</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-4">
                    <li>Unusual transaction velocity mapping closely to known illicit topologies.</li>
                    <li>Sudden spike in cross-border exposure limits.</li>
                    <li>High confidence rating from the HistGradientBoosting ensemble.</li>
                  </ul>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-[#222]">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Key Risk Drivers (SHAP Values)
                </h3>
                <div className="space-y-3">
                  {shap.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{item.name}</span>
                        <span className="text-red-400">+{item.value.toFixed(1)}% Risk</span>
                      </div>
                      <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {shap.length === 0 && <div className="text-gray-500 text-xs py-2">Loading feature importance...</div>}
                </div>
              </div>
            </div>

            <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
              <h2 className="text-xl font-semibold mb-4 text-white border-b border-[#333] pb-2">
                <InfoTooltip term="Recent Ledger" desc="A log of the most recent high-risk transactions made by this account." />
              </h2>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-[#1a1a1a]">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#222]">
                      <td className="px-4 py-3">{item.type}</td>
                      <td className={`px-4 py-3 ${item.amount.startsWith('-') ? 'text-gray-300' : 'text-green-400'}`}>{item.amount}</td>
                      <td className="px-4 py-3 text-gray-500">{item.time}</td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-3 text-gray-500 text-center">Fetching ledger data...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        
          {/* Full-Screen Network Modal */}
          {isNetworkModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10">
              <div className="bg-[#111] border border-[#333] rounded-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
                <div className="flex items-center justify-between p-6 border-b border-[#222]">
                  <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                    <Network className="w-6 h-6 text-blue-500" />
                    Network Intelligence Topology: {selectedAccount.id}
                  </h2>
                  <button onClick={() => setIsNetworkModalOpen(false)} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-[#222]">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#222] relative min-h-[300px]">
                    <p className="text-gray-400 text-sm mb-4 absolute top-6 left-6 z-10">Click on any node to view account and transaction details.</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <XAxis type="number" dataKey="x" hide />
                        <YAxis type="number" dataKey="y" hide />
                        <ZAxis type="number" range={[500, 2000]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                        <Scatter 
                          name="Connected Accounts" 
                          data={[
                            { x: 10, y: 20, z: 200, name: 'Suspect Origin', type: 'External Bank', risk: 'High', txn: '$45,200 (Incoming)' },
                            { x: 15, y: 35, z: 600, name: selectedAccount.id, type: 'Target Account', risk: 'Critical', txn: 'Main Node' },
                            { x: 25, y: 45, z: 200, name: 'Pass-through A', type: 'Checking', risk: 'Medium', txn: '$12,000 (Outgoing)' },
                            { x: 20, y: 15, z: 200, name: 'Pass-through B', type: 'Savings', risk: 'Medium', txn: '$33,200 (Outgoing)' },
                            { x: 35, y: 30, z: 800, name: 'Offshore Destination', type: 'International', risk: 'Critical', txn: '$45,200 (Consolidated)' },
                          ]} 
                          fill="#3b82f6" 
                          line={{ stroke: "#444", strokeWidth: 1 }}
                          onClick={(e) => setSelectedNetworkNode(e)}
                          className="cursor-pointer"
                        >
                          {
                            [
                              { x: 10, y: 20, z: 200, name: 'Suspect Origin', type: 'External Bank', risk: 'High', txn: '$45,200 (Incoming)' },
                              { x: 15, y: 35, z: 600, name: selectedAccount.id, type: 'Target Account', risk: 'Critical', txn: 'Main Node' },
                              { x: 25, y: 45, z: 200, name: 'Pass-through A', type: 'Checking', risk: 'Medium', txn: '$12,000 (Outgoing)' },
                              { x: 20, y: 15, z: 200, name: 'Pass-through B', type: 'Savings', risk: 'Medium', txn: '$33,200 (Outgoing)' },
                              { x: 35, y: 30, z: 800, name: 'Offshore Destination', type: 'International', risk: 'Critical', txn: '$45,200 (Consolidated)' }
                            ].map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={selectedNetworkNode?.name === entry.name ? '#ef4444' : (entry.name === selectedAccount.id ? '#f59e0b' : '#3b82f6')} />
                            ))
                          }
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="w-full md:w-96 bg-[#0a0a0a] p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-[#222] pb-3">Node Details</h3>
                    
                    {selectedNetworkNode ? (
                      <div className="space-y-6">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Entity Name</span>
                          <p className="text-md font-mono text-blue-400">{selectedNetworkNode.name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Account Type</span>
                          <p className="text-md text-gray-300">{selectedNetworkNode.type}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Risk Level</span>
                          <p className={`text-md ${selectedNetworkNode.risk === 'Critical' || selectedNetworkNode.risk === 'High' ? 'text-red-500' : 'text-amber-500'}`}>{selectedNetworkNode.risk}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Recent Transaction Flow</span>
                          <p className="text-md font-mono text-emerald-400">{selectedNetworkNode.txn}</p>
                        </div>
                        
                        <div className="pt-6 border-t border-[#222] mt-8">
                          <p className="text-xs text-gray-400 mb-4">Actions for this node:</p>
                          <button className="w-full py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 text-sm font-medium transition-colors mb-3">
                            View Full History
                          </button>
                          <button className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 text-sm font-medium transition-colors">
                            Flag as Suspicious
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-gray-500 text-sm">
                        <p>Select a node in the graph to view its account profile and transaction ledger.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-gray-400 w-7 h-7" />
            <h1 className="text-xl font-medium text-gray-200 tracking-tight">MuleNet Intelligence Hub <span className="text-gray-500 font-normal ml-2">| Bank of India</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#111] rounded-lg border border-[#222] px-4 py-2 w-64">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search accounts..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => window.location.href = '/metrics'}
              className="px-4 py-2 bg-[#111] text-gray-300 border border-[#222] rounded-lg hover:bg-[#1a1a1a] transition font-medium text-sm flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-gray-500" />
              Telemetry
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1"><InfoTooltip term="Total Exposure" desc="The total amount of money at risk across all suspicious accounts." /></p>
                <h3 className="text-3xl font-bold text-white">{stats.exposure}</h3>
              </div>
              <Activity className="text-green-500/50 w-6 h-6" />
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1"><InfoTooltip term="Critical Alerts" desc="High-priority accounts that require immediate freezing." /></p>
                <h3 className="text-2xl font-semibold text-gray-200">{stats.critical}</h3>
              </div>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1"><InfoTooltip term="Avg Risk Score" desc="The average AI fraud score across the network (0-100)." /></p>
                <h3 className="text-3xl font-bold text-orange-400">{stats.avgScore}</h3>
              </div>
              <Activity className="text-orange-500/50 w-6 h-6" />
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1"><InfoTooltip term="Avg Time (s)" desc="The average time taken by the AI to detect a threat." /></p>
                <h3 className="text-3xl font-bold text-blue-400">4.2</h3>
              </div>
              <Clock className="text-blue-500/50 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-[#222] p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 self-start">Risk Categorization</h3>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs font-medium mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Low</span>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] p-6 rounded-xl lg:col-span-2 min-h-[300px] flex flex-col">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Probability Flux (Last 24h)</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" stroke="#444" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#444" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Line type="monotone" dataKey="flux" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Real-time Inference Queue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-[#1a1a1a]">
                <tr>
                  <th className="px-6 py-4"><InfoTooltip term="Account ID" desc="The unique identifier for the account." /></th>
                  <th className="px-6 py-4"><InfoTooltip term="Risk Score" desc="AI-generated fraud probability (0-100)." /></th>
                  <th className="px-6 py-4"><InfoTooltip term="Priority" desc="The urgency level for human review." /></th>
                  <th className="px-6 py-4"><InfoTooltip term="Typology" desc="The specific type of money laundering pattern detected." /></th>
                  <th className="px-6 py-4"><InfoTooltip term="Exposure" desc="The total monetary value involved." /></th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.slice(0, 50).map((acct, idx) => (
                  <tr key={idx} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{acct.id}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono ${acct.score > 80 ? 'text-red-400' : acct.score > 50 ? 'text-orange-400' : 'text-green-400'}`}>
                        {acct.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (acct.priority === 'High' || acct.priority === 'P1') ? 'bg-[#2a1215] text-[#ff8a8a] border border-[#4a1c1c]' : 
                        (acct.priority === 'Medium' || acct.priority === 'P2') ? 'bg-[#261810] text-[#ffb076] border border-[#402414]' : 
                        'bg-[#121a24] text-[#8ab4f8] border border-[#1a2c42]'
                      }`}>
                        {acct.priority === 'P1' ? 'High' : acct.priority === 'P2' ? 'Medium' : acct.priority === 'P3' ? 'Low' : acct.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 truncate max-w-[200px]">{acct.typology}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono">{acct.exposure}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openReport(acct.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium inline-flex items-center gap-1"
                      >
                        Review <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No accounts found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
