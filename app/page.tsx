"use client";

import { ArrowRight, ShieldAlert, Activity, Network } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-gray-400 w-8 h-8" />
          <h1 className="text-2xl font-medium text-white tracking-tight">MuleNet <span className="text-gray-500 font-normal ml-2">| Bank of India</span></h1>
        </div>
        <Link 
          href="/dashboard"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-lg shadow-blue-900/20 flex items-center gap-2"
        >
          Launch Hub <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-sm text-gray-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Systems Online | TRL 4 Validated
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            Next-Generation <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Fraud Intelligence
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            MuleNet deploys deep learning ensembles and real-time graph analysis to detect, trace, and neutralize sophisticated money laundering networks before funds cross borders.
          </p>

          <div className="pt-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-gray-200 font-semibold rounded-xl transition text-lg"
            >
              Enter Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-32 text-left">
          <div className="bg-[#111] border border-[#222] p-8 rounded-2xl">
            <Activity className="w-8 h-8 text-blue-500 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3">Maximum Recall AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our HistGradientBoosting + Deep Learning (MLP) ensemble is tuned for maximum recall, guaranteeing zero false negatives so no illicit transfers slip through.
            </p>
          </div>
          
          <div className="bg-[#111] border border-[#222] p-8 rounded-2xl">
            <Network className="w-8 h-8 text-indigo-500 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3">Topological Tracing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time NetworkX graph generation maps out entire mule rings and pass-through accounts, analyzing subgraph centrality instantly.
            </p>
          </div>

          <div className="bg-[#111] border border-[#222] p-8 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-rose-500 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3">Enterprise Scale</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Designed for extreme memory efficiency. Operates on pure Next.js and FastAPI with optimized sklearn dependencies to guarantee zero-latency responses.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-[#222]">
        &copy; 2026 Bank of India | Internal Prototype (TRL-4)
      </footer>
    </div>
  );
}
