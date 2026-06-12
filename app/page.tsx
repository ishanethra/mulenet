"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ShieldAlert, Activity, Network, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  // Auto-start on load
  const [isStarted, setIsStarted] = useState(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const storyFrames = [
    "Hello. I am your MuleNet AI Investigator.",
    "Right now, criminal syndicates are laundering billions through hidden 'Mule' accounts.",
    "Traditional rules-based engines fail to detect these sprawling networks. They are simply too slow.",
    "But MuleNet uses Graph Neural Networks to map these unseen topologies instantly.",
    "We achieve Maximum Recall with zero false negatives. No one escapes our detection.",
    "System is armed. Initiating secure handoff to your dashboard."
  ];

  const avatarPositions = [
    { right: '5%', bottom: '5%', scale: 1 },       // Step 0: Initial Right
    { right: '15%', bottom: '5%', scale: 1.05 },   // Step 1: Moving slightly left
    { right: '5%', bottom: '8%', scale: 0.95 },    // Step 2: Back right, slightly up
    { right: '10%', bottom: '5%', scale: 1.1 },    // Step 3: Step forward
    { right: '5%', bottom: '5%', scale: 1 },       // Step 4: Final Right
    { right: '5%', bottom: '5%', scale: 1 }        // Step 5
  ];

  // Wait for voices to load to prevent male-voice fallback on first tick
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoicesLoaded(true);
    };
    loadVoices();
    if (window.speechSynthesis !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (!isStarted || !voicesLoaded) return;

    // Speak the current frame
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(storyFrames[storyStep]);
      
      const voices = window.speechSynthesis.getVoices();
      let chosenVoice;
      
      if (selectedVoiceURI) {
        chosenVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      } else {
        chosenVoice = voices.find(v => {
          const n = v.name.toLowerCase();
          return n.includes('samantha') || n.includes('zira') || n.includes('victoria') || n.includes('female') || n.includes('google us english');
        });
        
        // Lock it only if we actually found a female voice, otherwise we might lock a temporary male fallback
        if (chosenVoice) {
          setSelectedVoiceURI(chosenVoice.voiceURI);
        } else {
          chosenVoice = voices[0]; // fallback
        }
      }

      if (chosenVoice) utterance.voice = chosenVoice;
      
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    const timer = setInterval(() => {
      setStoryStep((prev) => {
        if (prev < storyFrames.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => router.push('/dashboard'), 3000);
          return prev;
        }
      });
    }, 5000); // 5 seconds per frame to allow time to speak
    return () => {
      clearInterval(timer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [router, storyFrames.length, storyStep, isStarted, voicesLoaded, selectedVoiceURI]);

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
            Systems Online
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

          <div className="flex items-center gap-6 pt-4 z-50 relative">
            <div className="px-8 py-4 bg-green-500/10 text-green-400 font-semibold rounded-lg border border-green-500/30 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Briefing in Progress...
            </div>
            
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-[#111] text-gray-300 font-semibold rounded-lg border border-[#333] hover:bg-[#222] hover:text-white transition flex items-center gap-3 cursor-pointer"
            >
              Skip to Dashboard <ArrowRight className="w-5 h-5" />
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

      </main>

      {/* Roaming Animated Explainer Avatar (Hidden until started) */}
      <div 
        className={`absolute z-50 transition-all duration-[2000ms] ease-in-out flex items-end pointer-events-none ${isStarted ? 'opacity-100' : 'opacity-0 scale-95 translate-y-10'}`}
        style={{
          right: isStarted ? (avatarPositions[storyStep]?.right || '10%') : '-20%',
          bottom: avatarPositions[storyStep]?.bottom || '5%',
          transform: `scale(${avatarPositions[storyStep]?.scale || 1})`
        }}
      >
        {/* The 3D Human Avatar */}
        <div className="relative animate-float pointer-events-auto">
          {/* Background Glow attached to avatar */}
          <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"></div>
          
          {/* Audio Visualizer Waves under avatar indicating speaking */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-1 opacity-60">
             {[...Array(8)].map((_, i) => (
               <div 
                 key={i} 
                 className="w-1.5 bg-blue-400 rounded-full" 
                 style={{ 
                   height: isStarted ? `${20 + Math.random() * 30}px` : '4px',
                   animation: isStarted ? `pulse ${0.2 + Math.random() * 0.3}s infinite alternate` : 'none',
                   transition: 'height 0.2s'
                 }}
               ></div>
             ))}
          </div>

          <Image 
            src="/3d-avatar.png" 
            alt="AI Investigation Explainer" 
            width={450} 
            height={600} 
            className="object-contain mix-blend-screen drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] relative z-20"
            priority
          />
        </div>
      </div>
    </div>
  );
}
