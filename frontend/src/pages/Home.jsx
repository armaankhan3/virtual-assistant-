import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contaxt/UserContext';

// AudioStatus component: shows assistant name, online status, and voice command UI
const AudioStatus = ({ assistantName, listening, command }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-[#0a0a0f] via-[#181c2f] to-[#0f0026] rounded-3xl shadow-2xl p-6 md:p-8 min-h-[340px] min-w-[260px] md:min-h-[400px] md:min-w-[320px] relative overflow-hidden">
    {/* Animated background grid */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#00fff0" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    {/* Floating particles */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i * 0.3}s`
          }}
        />
      ))}
    </div>

    {/* Status header */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
      <div className="relative">
        <span className="px-6 py-2 rounded-full bg-gradient-to-r from-lime-300 via-cyan-300 to-lime-300 text-black font-bold text-sm mb-3 shadow-lg backdrop-blur-sm">
          {assistantName || 'AI BUDDY'}
        </span>
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-lime-400 to-cyan-400 opacity-50 blur-sm animate-pulse"></div>
      </div>
      <div className="flex items-center gap-3 text-lime-400 text-xs font-semibold bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-400/30">
        <div className="relative">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse block"></span>
          <span className="absolute inset-0 w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
        </div>
        <span>NEURAL LINK ACTIVE</span>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-1 h-3 bg-lime-400 rounded-sm animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}></div>
          ))}
        </div>
      </div>
    </div>

    {/* Animated orb */}
    <div className="flex items-center justify-center my-8 md:my-10 relative">
      {/* Outer ring */}
      <div className="absolute w-44 h-44 md:w-48 md:h-48 rounded-full border border-cyan-400/20 animate-spin" style={{animationDuration: '20s'}}></div>
      <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full border border-purple-400/20 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
      {/* Main orb */}
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#822aff] via-[#00fff0] to-[#191819] blur-[1px] animate-pulse relative flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-purple-500/30 to-cyan-400/30 ${listening ? 'animate-ping' : ''}`}></div>
        {/* Inner orb */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-transparent via-white/10 to-transparent backdrop-blur-sm">
          <svg width="100%" height="100%" viewBox="0 0 180 180" className="animate-spin" style={{animationDuration: '8s'}}>
            <defs>
              <radialGradient id="orb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#822aff" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#00fff0" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="pulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00fff0" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#822aff" stopOpacity="0.2" />
              </radialGradient>
            </defs>
            <ellipse cx="90" cy="90" rx="70" ry="70" fill="url(#orb)" />
            {listening && <ellipse cx="90" cy="90" rx="60" ry="60" fill="url(#pulse)" className="animate-pulse" />}
          </svg>
        </div>
        {/* Core indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 ${listening ? 'animate-spin' : 'animate-pulse'}`}> 
            <div className="w-full h-full rounded-full bg-gradient-to-r from-white/50 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* Orbiting elements */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-spin"
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${i * 90}deg) translateX(60px)`,
            animationDuration: `${6 + i}s`,
            animationDirection: i % 2 ? 'reverse' : 'normal'
          }}
        />
      ))}
    </div>

    {/* Command display */}
    <div className="text-center mb-10 min-h-[40px] flex flex-col items-center justify-center relative w-full px-6 md:px-12">
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 md:p-10 border border-cyan-400/30 max-w-lg mx-auto w-full shadow-lg">
        <div className="text-xl md:text-3xl font-semibold text-white mb-2 tracking-wide">
          {command || 'Initializing neural interface...'}
        </div>
        {command && (
          <div className="flex justify-center gap-3 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Home = () => {
  const { userdata,getGeminiResponse } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [listening, setListening] = useState(true); // Always listening
  const [command, setCommand] = useState('');

  useEffect(() => {
    if (!userdata || !userdata.assistantImage || !userdata.assistantName) {
      navigate('/customize');
    }
  }, [userdata, navigate]);

  if (!userdata || !userdata.assistantImage || !userdata.assistantName) return null;

 const speakCommand = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.name === 'Google US English') || null;
    window.speechSynthesis.speak(utterance);
  }


  useEffect(() => {
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (speechRecognition) {
      const recognition = new speechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let isActive = true;
      recognition.onstart = () => setListening(true);
      recognition.onend = () => {
        setListening(false);
        if (isActive) recognition.start(); 
      };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        if (
          transcript.toLowerCase().includes((userdata.assistantName || '').toLowerCase())
        ) {
          setCommand(transcript);
        }
      };
      recognition.start();
      return () => {
        isActive = false;
        recognition.abort();
      };
    }
  }, [userdata.assistantName]);

  // Speak the assistant's response when a new command is detected and processed
  useEffect(() => {
    if (command) {
      // Call Gemini API and speak the response
      (async () => {
        try {
          const geminiRes = await getGeminiResponse(command);
          if (geminiRes && geminiRes.response) {
            speakCommand(geminiRes.response);
          }
        } catch (err) {
          // Optionally handle error
        }
      })();
    }
    // eslint-disable-next-line
  }, [command]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white gap-8 p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Left: Enhanced Assistant details */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mb-12 md:mb-0 relative z-10">
        <div className="relative mb-8">
          {/* Image glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-30 animate-pulse blur-lg"></div>
          <img
            src={userdata.assistantImage}
            alt={userdata.assistantName}
            className="relative w-40 h-40 rounded-full object-cover border-4 border-cyan-400/60 shadow-2xl bg-white"
          />
          {/* Status ring */}
          <div className="absolute -inset-2 rounded-full border-2 border-lime-400/50 animate-spin" style={{animationDuration: '3s'}}></div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
            {userdata.assistantName}
          </h1>
          <div className="mb-6">
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">{userdata.description}</p>
          </div>
          {/* System stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30">
              <div className="text-cyan-400 font-semibold">UPTIME</div>
              <div className="text-white">∞ Days</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30">
              <div className="text-purple-400 font-semibold">QUERIES</div>
              <div className="text-white">47.2M+</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-lime-400/30">
              <div className="text-lime-400 font-semibold">IQ LEVEL</div>
              <div className="text-white">∞++</div>
            </div>
          </div>
          <button
            className="relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#822aff] via-[#00fff0] to-[#822aff] text-white font-bold text-lg shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 group overflow-hidden"
            onClick={() => navigate('/customize')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative">⚡ Customize Neural Core</span>
          </button>
        </div>
      </div>

      {/* Right: AudioStatus (no mic button, always listening) */}
      <div className="flex-1 flex items-center justify-center w-full max-w-xl relative z-10 min-w-[340px] min-h-[540px] md:min-w-[420px] md:min-h-[600px]">
        <AudioStatus
          assistantName={userdata.assistantName}
          listening={true} // Always listening
          command={command}
        />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;