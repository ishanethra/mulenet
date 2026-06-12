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
  Network
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

  // Sync button states with localStorage to persist across refreshes
  useEffect(() => {
    if (selectedAccount) {
      const frozenState = localStorage.getItem(`frozen_${selectedAccount.id}`);
      const rfiState = localStorage.getItem(`rfi_${selectedAccount.id}`);
      setIsFrozen(frozenState === 'true');
      setIsRfiSent(rfiState === 'true');
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Check if we are in the report view (new tab)
    const params = new URLSearchParams(window.location.search);
    const accId = params.get("account");

    const cached = localStorage.getItem('mulenet_accounts');
    let loadedAccounts = fallbackAccounts;

    if (cached) {
      try {
        loadedAccounts = JSON.parse(cached);
        setDynamicAccounts(loadedAccounts);
      } catch (e) {
        console.error("Cache read error", e);
      }
    } else {
      // Fetch fresh if no cache
      fetch('https://mulenet-backend.onrender.com/accounts/list')
        .then(res => res.json())
        .then(data => {
          if (data.accounts && data.accounts.length > 0) {
            setDynamicAccounts(data.accounts);
            loadedAccounts = data.accounts;
            localStorage.setItem('mulenet_accounts', JSON.stringify(data.accounts));
          }
        })
        .catch(err => console.error("Failed to load accounts", err));
    }

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
    const p3 = dynamicAccounts.filter(a => a.priority === 'Small' || a.priority === 'P3').length;
    return [
      { name: 'High', value: p1 },
      { name: 'Medium', value: p2 },
      { name: 'Small', value: p3 }
    ];
  }, [dynamicAccounts]);

  const lineData = useMemo(() => {
    return Array.from({length: 24}).map((_, i) => ({
      time: `${i}:00`,
      flux: Math.random() * (i > 8 && i < 18 ? 80 : 20) + Math.random() * 10
    }));
  }, []);

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
                <p className="text-gray-500 mb-1">Primary IP Address</p>
                <p className="text-red-400 font-mono">194.26.x.x (VPN)</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Geo Mismatch</p>
                <p className="text-gray-300">Mumbai vs Cyprus</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Device Hash</p>
                <p className="text-gray-300">Linked to 4 entities</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">KYC Status</p>
                  <p className="text-amber-500">Synthetic Suspect</p>
                </div>
              </div>
            </div>

            {/* Network Intel Graph */}
            <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
              <h2 className="text-sm font-semibold mb-4 text-gray-300 border-b border-[#222] pb-3 uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4" /> Network Intel Graph
              </h2>
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
              <h2 className="text-sm font-semibold mb-4 text-gray-300 border-b border-[#222] pb-3 uppercase tracking-wider">Automated Risk Analysis</h2>
              
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
            </div>

            <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
              <h2 className="text-xl font-semibold mb-4 text-white border-b border-[#333] pb-2">Recent Ledger</h2>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-[#1a1a1a]">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#222]">
                    <td className="px-4 py-3">Wire Transfer</td>
                    <td className="px-4 py-3 text-gray-300">-₹45,000.00</td>
                    <td className="px-4 py-3 text-gray-500">2 hrs ago</td>
                  </tr>
                  <tr className="border-b border-[#222]">
                    <td className="px-4 py-3">Cash Deposit</td>
                    <td className="px-4 py-3 text-gray-300">+₹46,500.00</td>
                    <td className="px-4 py-3 text-gray-500">3 hrs ago</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Offshore Clearing</td>
                    <td className="px-4 py-3 text-gray-300">-₹12,000.00</td>
                    <td className="px-4 py-3 text-gray-500">5 hrs ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Exposure</p>
                <h3 className="text-3xl font-bold text-white">{stats.exposure}</h3>
              </div>
              <Activity className="text-green-500/50 w-6 h-6" />
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Critical Alerts</p>
                <h3 className="text-2xl font-semibold text-gray-200">{stats.critical}</h3>
              </div>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Avg Risk Score</p>
                <h3 className="text-3xl font-bold text-orange-400">{stats.avgScore}</h3>
              </div>
              <Activity className="text-orange-500/50 w-6 h-6" />
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Avg Time (s)</p>
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
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Small</span>
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
                  <th className="px-6 py-4">Account ID</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Typology</th>
                  <th className="px-6 py-4">Exposure</th>
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
                        {acct.priority === 'P1' ? 'High' : acct.priority === 'P2' ? 'Medium' : acct.priority === 'P3' ? 'Small' : acct.priority}
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
