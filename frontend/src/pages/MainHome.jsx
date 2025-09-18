import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

const EntryPageWith3D = () => {
  const navigate = useNavigate();
  const [loadingText, setLoadingText] = useState('');
  const [micActive, setMicActive] = useState(false);
  const phrases = [
    "Initializing assistant interface...",
    "Syncing neural protocols...",
    "Loading holographic modules...",
    "Secure Gateway Activated"
  ];

  useEffect(() => {
    let index = 0, charIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (charIndex < phrases[index].length) {
          charIndex++;
          return phrases[index].substring(0, charIndex);
        } else {
          index = (index + 1) % phrases.length;
          charIndex = 0;
          return '';
        }
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center relative overflow-hidden px-4">
      
  {/* Always show SVG placeholder, never try to load GLB */}
  <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
    <div className="w-64 h-64 opacity-60 flex items-center justify-center">
      {/* Inline SVG placeholder so no external file is required */}
      <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#00fff0" />
            <stop offset="100%" stopColor="#822aff" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="200" rx="20" fill="url(#g1)" opacity="0.12" />
        <g transform="translate(30,40)">
          <circle cx="50" cy="30" r="22" fill="#fff" opacity="0.12" />
          <rect x="10" y="70" width="80" height="50" rx="8" fill="#fff" opacity="0.08" />
          <text x="50" y="120" textAnchor="middle" fill="#fff" fontSize="10">3D model not applied</text>
        </g>
      </svg>
    </div>
  </div>

      {/* Glass UI Panel */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_0_30px_#00fff055] rounded-2xl px-10 py-12 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00fff0] to-[#822aff] mb-6 animate-glow-text">
          Welcome to VirtualAI
        </h1>
        <p className="text-white/70 text-sm mb-8 tracking-wide">
          Sign in or create an account to access your AI assistant.
        </p>
        <div className="flex flex-col gap-4 mb-6">
          <button onClick={() => navigate('/signin')} className="w-full py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#00fff0] to-[#822aff] hover:shadow-[0_0_20px_#00fff0aa] transition-all">
            Sign In
          </button>
          <button onClick={() => navigate('/signup')} className="w-full py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#822aff] to-[#00fff0] hover:shadow-[0_0_20px_#822affaa] transition-all">
            Create Account
          </button>
        </div>
        <div className="flex items-center justify-center mt-4">
          <button onClick={() => setMicActive(a => !a)} className="relative">
            <div className={`w-12 h-12 rounded-full bg-cyan-400/30 flex items-center justify-center cursor-pointer animate-wave-button ${micActive ? 'active' : ''}`}></div>
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl">🎙️</div>
          </button>
        </div>
      </div>

      {/* Typing Assistant Line */}
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 text-white/70 text-sm font-mono animate-fade-in z-10">
        <span className="text-cyan-400">VirtualAI:</span> {loadingText}
      </div>

      {/* Floating Info Cards */}
      <div className="absolute bottom-10 left-10 z-10 flex flex-col gap-3 text-sm max-w-xs">
        {["🧠 Neural Sync Enabled","🔐 Biometric Access Secured","💬 Multi‑lingual Mode"].map((text,i)=>(
          <div key={i} className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm text-white/70 hover:bg-white/20 transition">
            {text}
          </div>
        ))}
      </div>

      <style>{`
        .animate-wave-button { animation: pulse 2s infinite; }
        .animate-wave-button.active { animation: none; box-shadow: 0 0 20px #00fff0aa; }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes glow {
          0%,100% { text-shadow: 0 0 20px #00fff088,0 0 40px #822aff55; }
          50% { text-shadow: 0 0 30px #822aff88,0 0 60px #00fff044; }
        }
        .animate-glow-text { animation: glow 3s ease-in-out infinite; }

        @keyframes fade-in {
          from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default EntryPageWith3D;
