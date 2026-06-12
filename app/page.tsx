"use client";

import { ArrowRight, ShieldAlert, Activity, Network } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-hidden flex flex-col justify-center">
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0"></div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500 w-8 h-8" />
          <span className="font-bold text-2xl tracking-wider text-white">MULENET</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Systems Online | TRL 4 Validated
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
        
        {/* Left Column: Text & CTA */}
        <div className="space-y-8">
          <div className="inline-block px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            AI-Powered Anti-Money Laundering
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Next-Generation <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">Fraud Intelligence</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
            Deploy advanced Graph Neural Networks and Temporal Learning to detect highly sophisticated money mule rings with Maximum Recall and Zero False Negatives.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <Link 
              href="/dashboard"
              className="group relative px-8 py-4 bg-white text-black font-semibold rounded-lg overflow-hidden flex items-center gap-3 transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                Enter Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="/metrics"
              className="px-8 py-4 bg-[#111] text-gray-300 font-semibold rounded-lg border border-[#333] hover:bg-[#222] hover:text-white transition flex items-center gap-3"
            >
              <Activity className="w-5 h-5" />
              View Telemetry
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-6 pt-12 border-t border-[#222] mt-12">
            <div>
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <Network className="w-5 h-5 text-indigo-400" /> Continuous GNN
              </div>
              <p className="text-sm text-gray-500">Maps multi-hop transaction topology to expose hidden rings instantly.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <ShieldAlert className="w-5 h-5 text-red-400" /> Maximum Recall
              </div>
              <p className="text-sm text-gray-500">Ensemble tuned to 99.98% recall. Not a single mule escapes detection.</p>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Explainer Avatar */}
        <div className="relative h-[600px] hidden lg:flex items-center justify-center">
          <div className="absolute w-full h-full animate-float animate-glow flex items-center justify-center">
            <Image 
              src="/3d-avatar.png" 
              alt="AI Investigation Explainer" 
              width={600} 
              height={800} 
              className="object-contain drop-shadow-2xl z-20"
              priority
            />
          </div>
          
          {/* Floating UI Elements around Avatar */}
          <div className="absolute top-20 right-10 bg-[#111]/80 backdrop-blur-md border border-[#333] p-4 rounded-xl shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Activity className="text-red-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Risk Confidence</p>
                <p className="text-sm font-bold text-white">99.8% Precision</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-32 left-0 bg-[#111]/80 backdrop-blur-md border border-[#333] p-4 rounded-xl shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Network className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Subgraph Detected</p>
                <p className="text-sm font-bold text-white">Funneling Layer 3</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
