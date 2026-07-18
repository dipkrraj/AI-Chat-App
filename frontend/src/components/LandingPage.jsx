import React, { useState, useEffect } from 'react'
import { 
  Bot, User, Sparkles, Terminal, Layers, ArrowRight, 
  Paperclip, ArrowUp, Maximize, Sun, RotateCcw, Cpu, 
  Database, Zap, ArrowLeftRight, MessageSquareCode, Github
} from 'lucide-react'

const DEMO_STEPS = [
  {
    prompt: "Which model writes better React code?",
    response: `To compare, let's look at writing a custom hook:

1. GPT-4: Focuses on clean, standard patterns, providing optimal hooks with concise comments.
2. Claude: Excels at detailed explanations, edge-case coverage, and security-first code structuring.

Both are powerful; choose GPT-4 for speed and Claude for comprehensive architecture.`
  }
]

function LandingPage({ user, onLogout, onOpenAuth, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [promptText, setPromptText] = useState('')
  const [responseText, setResponseText] = useState('')
  const [isTypingPrompt, setIsTypingPrompt] = useState(true)
  const [isWaitingAI, setIsWaitingAI] = useState(false)
  const [isStreamingResponse, setIsStreamingResponse] = useState(false)

  // Typing effect engine
  useEffect(() => {
    let timer
    const step = DEMO_STEPS[currentStep]

    if (isTypingPrompt) {
      if (promptText.length < step.prompt.length) {
        timer = setTimeout(() => {
          setPromptText(step.prompt.slice(0, promptText.length + 1))
        }, 40)
      } else {
        setIsTypingPrompt(false)
        setIsWaitingAI(true)
        timer = setTimeout(() => {
          setIsWaitingAI(false)
          setIsStreamingResponse(true)
        }, 800)
      }
    } else if (isStreamingResponse) {
      if (responseText.length < step.response.length) {
        timer = setTimeout(() => {
          // Stream chunks of text at a time for code blocks to make it look realistic
          const increment = step.response.startsWith('import') ? 4 : 2
          setResponseText(step.response.slice(0, responseText.length + increment))
        }, 15)
      } else {
        setIsStreamingResponse(false)
        // Hold for 3 seconds before next cycle
        timer = setTimeout(() => {
          setPromptText('')
          setResponseText('')
          setIsTypingPrompt(true)
          setCurrentStep((prev) => (prev + 1) % DEMO_STEPS.length)
        }, 4000)
      }
    }

    return () => clearTimeout(timer)
  }, [currentStep, promptText, responseText, isTypingPrompt, isWaitingAI, isStreamingResponse])

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-100 flex flex-col selection:bg-violet-600/30">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-auto h-[500px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20vh] right-1/4 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-white/[0.04] bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
          <span className="text-lg font-bold tracking-tight font-display bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            DVerse
          </span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#integrations" className="hover:text-white transition-colors duration-200">Integrations</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1 transition-colors duration-200">
            <Github className="w-4 h-4" /> Github
          </a>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
              {user.picture ? (
                <>
                  <img 
                    src={user.picture} 
                    alt={user.username} 
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center" style={{ display: 'none' }}>
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-gray-200">{user.username}</span>
              <button 
                onClick={onLogout}
                className="text-[10px] text-gray-500 hover:text-white uppercase tracking-wider font-bold transition-colors duration-200 cursor-pointer border-l border-white/10 pl-2.5 ml-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl w-full mx-auto px-6 pt-16 md:pt-24 flex flex-col items-center text-center relative z-10">
        
        {/* Multi-Model Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-600/10 border border-violet-500/20 rounded-full text-violet-400 text-[11px] font-semibold tracking-wide animate-pulse-slow">
          <Cpu className="w-3.5 h-3.5" />
          <span>Supports GPT, Claude, Gemini, Llama & More</span>
        </div>

        {/* Subtitle */}
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mt-6 mb-2">Multi-Model AI Chat</span>

        {/* Brand Main Title */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent max-w-4xl leading-tight sm:leading-none">
          One Chat.<br />Multiple AI Models.
        </h2>
        
        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl font-light">
          DVerse lets you chat with multiple AI models from a single interface. Choose the model that fits your task, continue previous conversations, and keep your chat history in one place.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onNavigate}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Chatting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a 
            href="#features"
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-200 font-semibold text-sm flex items-center justify-center transition-all duration-200"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Mockup Conversational UI Preview (matching Ruixen AI shape) */}
      <section className="max-w-4xl w-full mx-auto px-6 mt-16 md:mt-24 flex flex-col items-center relative z-20">
        
        {/* Glow backdrop behind mock */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* Main Interface Frame */}
        <div className="w-full h-[450px] flex flex-col bg-[#0b0e17]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 relative z-10 animate-float">
          
          {/* Header Controls */}
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
            {/* Pill button matching the screenshot */}
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full">
              <Maximize className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
              <Sun className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
              <RotateCcw className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">DP-VITE-INSTANT</span>
            </div>
          </div>

          {/* Chat content container with streaming text simulation */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 flex flex-col justify-start">
            
            {/* User message block */}
            {promptText && (
              <div className="flex justify-end items-start space-x-2">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md rounded-tr-xs">
                  <p className="text-xs font-light leading-relaxed">{promptText}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
                  <User className="w-3.5 h-3.5 text-indigo-300" />
                </div>
              </div>
            )}

            {/* AI waiting typing indicator */}
            {isWaitingAI && (
              <div className="flex justify-start items-end space-x-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md mb-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-xs shadow-md">
                  <div className="flex items-center space-x-1.5 h-4">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* AI response bubble */}
            {responseText && (
              <div className="flex justify-start items-start space-x-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-gray-200 shadow-md rounded-tl-xs">
                  <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap font-light text-gray-300">
                    {responseText}
                  </pre>
                </div>
              </div>
            )}

          </div>

          {/* Prompt input footer matching the screenshot exactly */}
          <div className="p-4 border-t border-white/[0.08] bg-white/[0.01]">
            <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 flex flex-col justify-between min-h-[90px] relative transition-all duration-300 focus-within:border-indigo-500/50">
              <span className="text-xs text-gray-500 font-light select-none">
                Type your request...
              </span>
              
              <div className="flex items-center justify-between mt-4">
                <Paperclip className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors duration-200" />
                
                <button 
                  disabled
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="max-w-6xl w-full mx-auto px-6 py-24 md:py-32 relative z-30">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h3 className="text-2xl sm:text-4xl font-bold font-display">Engineered for Developer Speed</h3>
          <p className="text-gray-400 mt-4 font-light text-sm sm:text-base">
            Everything you need in a modern, lightweight AI integration. Built without bloat, engineered for latency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl shadow-xl hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold font-display text-white">Sub-Second Latency</h4>
            <p className="text-gray-400 text-xs sm:text-sm font-light mt-3 leading-relaxed">
              Query LLM endpoints instantly through Groq's high-speed inference engine, resolving responses in milliseconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl shadow-xl hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold font-display text-white">SQL Conversation Memory</h4>
            <p className="text-gray-400 text-xs sm:text-sm font-light mt-3 leading-relaxed">
              Automatic conversational database buffering and intelligent history summarization that keeps cost low while remembering context.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl shadow-xl hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold font-display text-white">Model Selector Switch</h4>
            <p className="text-gray-400 text-xs sm:text-sm font-light mt-3 leading-relaxed">
              Switch models dynamically in the header dropdown list, targeting local mock modes, Groq, or OpenRouter free models on-the-fly.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Grid Section */}
      <section id="integrations" className="max-w-6xl w-full mx-auto px-6 py-12 border-t border-white/[0.04] relative z-30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">Integrate DVerse Anywhere</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-light mt-4 leading-relaxed">
              Expose routes easily through our FastAPI backend. Connect your chat platform with popular communication and development tools out-of-the-box.
            </p>
          </div>
          
          {/* Integration Bubbles */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {['Slack', 'Discord', 'Vite', 'FastAPI', 'Github', 'SQLite', 'Groq', 'Python'].map((name, i) => (
              <div 
                key={i}
                className="px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center text-xs font-semibold text-gray-300 shadow-md hover:border-white/10 hover:bg-white/[0.04] hover:text-white transition-all duration-200 cursor-default"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Prominent Try Now CTA */}
      <section className="max-w-5xl w-full mx-auto px-6 py-24 z-30 relative">
        <div className="w-full p-8 md:p-16 rounded-3xl bg-gradient-to-r from-indigo-950/20 via-violet-950/30 to-indigo-950/20 border border-white/10 relative overflow-hidden flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="absolute -top-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]"></div>
          
          <h3 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Ready to chat with the future?
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm font-light mt-4 max-w-lg leading-relaxed">
            Create conversation threads, change active models, and experience advanced conversational design in seconds.
          </p>
          
          <button 
            onClick={onNavigate}
            className="mt-8 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Chatting Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.04] bg-[#05080e] py-8 text-center text-xs text-gray-500 relative z-30">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} DVerse Platform. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#features" className="hover:text-gray-300">Features</a>
            <a href="#integrations" className="hover:text-gray-300">Integrations</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-gray-300">Open Source</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
