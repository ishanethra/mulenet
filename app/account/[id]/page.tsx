"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AccountPortal() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const accountId = decodeURIComponent(id);

  const { data: accountsData } = useSWR(`https://mulenet-backend.onrender.com/accounts/list`, fetcher);
  const { data: copilotData } = useSWR(accountId ? `https://mulenet-backend.onrender.com/copilot?account_id=${accountId}` : null, fetcher);
  const { data: riskData } = useSWR(accountId ? `https://mulenet-backend.onrender.com/accounts/${accountId}/risk` : null, fetcher);

  const [chatMessages, setChatMessages] = useState<{sender: 'investigator' | 'customer', text: string, time: string}[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const account = accountsData?.accounts?.find((a: any) => a.id === accountId);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setChatMessages(prev => [...prev, {sender: 'investigator', text: currentMessage, time}]);
    setCurrentMessage("");

    // Simulate customer reply
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setChatMessages(prev => [...prev, {
        sender: 'customer', 
        text: "I am collecting the requested documents now and will upload them shortly. Please do not freeze my account.", 
        time: replyTime
      }]);
    }, 4000);
  };

  // Generate fake transactions
  const generateTransactions = () => {
    let txs = [];
    let hoursAgo = 1;
    for(let i=0; i<15; i++) {
      hoursAgo += Math.floor(Math.random() * 5);
      const isDeposit = Math.random() > 0.6;
      txs.push({
        id: `TX-${i}`,
        type: isDeposit ? 'INCOMING NEFT' : 'OUTGOING UPI',
        amount: `₹${Math.floor(Math.random() * 90000) + 1000}.00`,
        sign: isDeposit ? '+' : '-',
        hoursAgo: `${hoursAgo}H AGO`
      });
    }
    return txs;
  };
  const [transactions] = useState(generateTransactions());

  if (!account) {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ccc] font-sans flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="px-4 py-2 bg-[#111] border border-[#333] rounded hover:bg-[#222] transition-colors font-mono text-sm">
              &larr; BACK TO COMMAND CENTER
            </button>
          </Link>
          <h1 className="text-2xl font-light tracking-wide text-white">ACCOUNT PORTAL: <span className="font-mono text-[#60a5fa]">{accountId}</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-[#777] uppercase tracking-widest font-mono">Risk Status</div>
            <div className={`text-xl font-bold font-mono ${account.score > 80 ? 'text-red-400' : 'text-amber-400'}`}>
              SCORE {account.score}/100
            </div>
          </div>
          <div className="size-12 rounded-full border border-[#333] flex items-center justify-center bg-[#111]">
            <span className="text-lg">🕵️</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-[calc(100vh-120px)]">
        
        {/* Left Column: AI Copilot & Typology */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 flex-1 overflow-y-auto">
            <h2 className="text-xs uppercase tracking-widest text-[#777] font-mono mb-4 border-b border-[#222] pb-2">Why is this suspicious?</h2>
            {copilotData ? (
              <div className="space-y-4">
                <div className="text-blue-400 font-mono text-sm bg-blue-900/10 p-3 rounded border border-blue-900/30">
                  <span className="font-bold">DETECTED TYPOLOGY:</span> {account.typology.toUpperCase()}
                </div>
                <div dangerouslySetInnerHTML={{ __html: copilotData.answer.replace(/\\n/g, '<br/>') }} className="text-sm leading-relaxed prose prose-invert prose-p:text-[#ccc] prose-strong:text-white" />
              </div>
            ) : (
              <div className="animate-pulse flex gap-2 items-center text-[#555] font-mono text-sm">
                <div className="size-2 bg-[#555] rounded-full"></div> Analyzing telemetry...
              </div>
            )}
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5">
             <h2 className="text-xs uppercase tracking-widest text-[#777] font-mono mb-4 border-b border-[#222] pb-2">Primary Risk Drivers</h2>
             <ul className="space-y-3 font-mono text-xs">
                {riskData ? riskData.top_reasons.map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 text-red-300">
                    <span className="text-[#555]">-</span> {r}
                  </li>
                )) : <li className="text-[#555]">Loading drivers...</li>}
             </ul>
          </div>
        </div>

        {/* Middle Column: Transaction Ledger */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 flex flex-col h-full">
          <h2 className="text-xs uppercase tracking-widest text-[#777] font-mono mb-4 border-b border-[#222] pb-2">Transaction Ledger</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-[#111] rounded border border-[#222] hover:border-[#444] transition-colors">
                <div>
                  <div className="text-xs font-mono text-[#888]">{tx.hoursAgo}</div>
                  <div className="text-sm font-semibold text-[#ddd]">{tx.type}</div>
                </div>
                <div className={`font-mono text-right ${tx.sign === '-' ? 'text-red-400' : 'text-green-400'}`}>
                  {tx.sign}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Customer RFI Chat */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 flex flex-col h-full relative">
          <div className="absolute top-0 right-0 p-2">
            <span className="bg-red-900/30 text-red-400 border border-red-900/50 text-[9px] px-2 py-1 rounded font-mono uppercase tracking-widest">Live RFI Portal</span>
          </div>
          <h2 className="text-xs uppercase tracking-widest text-[#777] font-mono mb-4 border-b border-[#222] pb-2">Customer Communication</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {chatMessages.length === 0 && (
              <div className="h-full flex items-center justify-center text-[#555] font-mono text-xs text-center px-6">
                Open a secure Request For Information (RFI) channel with the account holder.
              </div>
            )}
            
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'investigator' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-[#666] font-mono mb-1">{msg.sender === 'investigator' ? 'YOU (BANK)' : 'CUSTOMER'} - {msg.time}</span>
                <div className={`px-4 py-2 rounded-lg text-sm max-w-[85%] ${
                  msg.sender === 'investigator' 
                  ? 'bg-[#2563eb] text-white rounded-br-none' 
                  : 'bg-[#222] text-[#ccc] border border-[#333] rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="mt-auto">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type RFI request message..."
                className="flex-1 bg-[#111] border border-[#333] rounded p-3 text-sm text-white focus:outline-none focus:border-[#60a5fa] font-mono"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded transition-colors font-mono uppercase text-sm tracking-widest font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
