import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contaxt/UserContext';

const VirtualAIHomePage = () => {
  const navigate = useNavigate();
  const { userdata, getGeminiResponse } = useContext(UserContext);

  const [loadingText, setLoadingText] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [chat, setChat] = useState([]);
  
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

  // Show welcome message after 1.5 seconds
  const welcomeTimer = setTimeout(() => setShowWelcomeMessage(true), 1500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(welcomeTimer);
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';

    r.onstart = () => setIsRecording(true);
    r.onend = () => setIsRecording(false);
    r.onerror = (e) => {
      console.error('Speech recognition error', e);
      setIsRecording(false);
    };
    r.onresult = (ev) => {
      const t = ev.results[0][0].transcript.trim();
      if (t) {
        setChat(c => [...c, { from: 'user', text: t }]);
        // send to backend
        (async () => {
          try {
            const res = await getGeminiResponse(t);
            if (res && res.response) {
              setChat(c => [...c, { from: 'assistant', text: res.response }]);
              if (res.redirectUrl) window.open(res.redirectUrl, '_blank');
            } else {
              setChat(c => [...c, { from: 'assistant', text: "Sorry, I didn't get that." }]);
            }
          } catch (err) {
            console.error('Gemini request failed', err);
            setChat(c => [...c, { from: 'assistant', text: 'Sorry, something went wrong.' }]);
          }
        })();
      }
    };
    setRecognition(r);
    return () => {
      try { r.stop(); } catch (e) {}
    };
  }, [getGeminiResponse]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top left, rgba(17,24,39,0.75), rgba(4,6,14,1) 40%), linear-gradient(180deg, #030412 0%, #050814 100%)' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ boxShadow: '0 0 30px rgba(99,102,241,0.12)', border: '2px solid rgba(124,58,237,0.18)', background: 'radial-gradient(circle at 30% 30%, rgba(124,58,237,0.18), rgba(14,165,233,0.08))' }}>
            V
          </div>
          <div>
            <div className="text-white font-bold text-xl">VirtualAI</div>
            <div className="text-[#00ffff] text-xs">Home Assistant</div>
          </div>
        </div>
        
          <div className="flex items-center gap-4">
          <div className="bg-[#091220]/70 backdrop-blur-sm border border-indigo-600/10 rounded-xl px-4 py-3">
            <span className="text-indigo-300 text-xs font-mono">IQ LEVEL</span>
            <div className="text-white font-bold">∞++</div>
          </div>
          
          <button className="text-white px-6 py-3 rounded-xl font-semibold transition-all" style={{ background: 'linear-gradient(90deg, rgba(108,52,231,1), rgba(236,72,153,1))', boxShadow: '0 8px 30px rgba(124,58,237,0.18)' }}>
            Core
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-5xl">
          
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-[#0080ff] to-[#ff6b35] animate-gradient-text">
                AI Universe
              </span>
            </h1>
            <p className="text-white/80 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Your intelligent assistant ecosystem is ready to revolutionize your workflow. 
              Choose your journey and begin the transformation.
            </p>
          </div>

          {/* Main Chat Interface */}
          <div className="bg-gradient-to-br from-[#071026]/60 to-[#081018]/40 backdrop-blur-xl rounded-3xl p-10 mb-12 max-w-4xl mx-auto shadow-2xl" style={{ border: '1px solid rgba(99,102,241,0.06)' }}>
            
            {/* Chat Header */}
            <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(255,107,53,0.08))', boxShadow: '0 6px 30px rgba(99,102,241,0.06)' }}>
                <div className="w-8 h-8 rounded-full bg-[#041027] flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#00ffcc] rounded-full animate-pulse"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00ff88] rounded-full border-2" style={{ borderColor: '#041027' }}></div>
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{userdata?.assistantName || 'Nova Assistant'}</div>
                <div className="text-[#00ffff] text-sm">{userdata?.assistantName ? 'Ready to assist' : 'Sign in to personalize'}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                <span className="text-[#00ff88] text-sm font-medium">Online</span>
              </div>
            </div>
            
            {/* Chat Messages rendered from state */}
            <div className="space-y-6 mb-10">
              {chat.length === 0 ? (
                <div className="text-center text-white/70 py-8">{showWelcomeMessage ? (userdata ? `Hello ${userdata.name || 'user'}, ask me anything.` : 'Sign in to start interacting with Nova.') : loadingText || '...'}</div>
              ) : (
                chat.map((m, idx) => (
                  <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.from === 'assistant' && (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mr-4" style={{ background: 'linear-gradient(90deg,#8b5cf6,#ff6b35)' }}>{(userdata?.assistantName||'N')[0]}</div>
                    )}
                    <div className={`${m.from === 'user' ? 'text-[#041027]' : 'text-white'} px-6 py-4 rounded-2xl max-w-2xl shadow-lg`} style={{ background: m.from === 'user' ? 'linear-gradient(90deg,#00ffff,#0080ff)' : 'linear-gradient(90deg,#8b5cf6,#6366f1)' }}> 
                      <div className="text-xs opacity-70 mb-1 font-medium">{m.from === 'user' ? 'You' : (userdata?.assistantName || 'Nova')}</div>
                      <div className="leading-relaxed">{m.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-6">
              <div className="flex gap-6">
                <button 
                  onClick={() => navigate('/signin')} 
                  className="flex-1 py-5 px-8 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                  style={{ background: 'linear-gradient(90deg,#00ffff,#0080ff)', boxShadow: '0 12px 50px rgba(0,255,255,0.06)' }}
                >
                  Sign In to Continue
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="flex-1 py-5 px-8 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                  style={{ background: 'linear-gradient(90deg,#8b5cf6,#6366f1)', boxShadow: '0 12px 50px rgba(139,92,246,0.06)' }}
                >
                  Create New Account
                </button>
              </div>

              
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[ 
              { 
                icon: "🧠", 
                title: "Neural Sync Enabled", 
                desc: "Advanced AI processing with quantum-level intelligence capabilities for seamless integration", 
                status: "Active",
                gradient: "from-[#00ffff] to-[#0080ff]"
              },
              { 
                icon: "🔐", 
                title: "Biometric Access Secured", 
                desc: "Multi-layer security protocols with quantum encryption and biometric verification", 
                status: "Secured",
                gradient: "from-[#8b5cf6] to-[#6366f1]"
              },
              { 
                icon: "💬", 
                title: "Multi-lingual Mode", 
                desc: "Global communication support with real-time translation and cultural adaptation", 
                status: "Ready",
                gradient: "from-[#ff6b35] to-[#ff8500]"
              }
              ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-br from-[#071026]/60 to-[#081018]/40 backdrop-blur-xl rounded-2xl p-8 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2 group cursor-pointer shadow-xl"
                style={{ border: '1px solid rgba(99,102,241,0.04)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className={`text-xs font-bold px-3 py-2 rounded-full bg-gradient-to-r ${feature.gradient} text-white`}>
                    {feature.status}
                  </div>
                </div>
                <div className="text-white font-bold text-xl mb-4 group-hover:text-[#00ffff] transition-colors">
                  {feature.title}
                </div>
                <div className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
  <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl animate-float opacity-60" style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.08), transparent 40%)' }}></div>
  <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full blur-3xl animate-float-delayed opacity-60" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 40%)' }}></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.05), transparent 40%)' }}></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0 animate-grid-flow"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-text {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }
        .animate-gradient-text { 
          background-size: 200% 200%;
          animation: gradient-text 4s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-30px) rotate(2deg); opacity: 0.8; }
          50% { transform: translateY(-15px) rotate(-1deg); opacity: 1; }
          75% { transform: translateY(-45px) rotate(1deg); opacity: 0.7; }
        }
        .animate-float { 
          animation: float 20s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float 20s ease-in-out infinite reverse; 
          animation-delay: -10s; 
        }
        
        @keyframes grid-flow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        .animate-grid-flow {
          animation: grid-flow 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VirtualAIHomePage;