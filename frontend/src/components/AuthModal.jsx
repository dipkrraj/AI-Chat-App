import React, { useState, useEffect } from 'react'
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleClientId, setGoogleClientId] = useState('')

  // 1. Fetch Google Client ID on mount to initialize Google One Tap
  useEffect(() => {
    if (!isOpen) return
    
    const fetchClientId = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/google/client-id`)
        if (res.ok) {
          const data = await res.json()
          if (data.client_id) {
            setGoogleClientId(data.client_id)
          }
        }
      } catch (err) {
        console.error('Failed to load Google Auth configuration:', err)
      }
    }
    fetchClientId()
  }, [isOpen])

  // 2. Initialize Google Sign-In button once client ID is fetched and container is rendered
  useEffect(() => {
    if (!googleClientId || !isOpen) return

    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        })
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'filled_blue',
            size: 'large',
            width: '100%',
            shape: 'rectangular',
            text: 'continue_with',
          }
        )
      }
    }

    // Small delay to ensure the DOM target element is available
    const timer = setTimeout(initGoogle, 100)
    return () => clearTimeout(timer)
  }, [googleClientId, activeTab, isOpen])

  const handleGoogleCredentialResponse = async (response) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      if (res.ok) {
        const data = await res.json()
        onSuccess(data.access_token)
        onClose()
      } else {
        const errData = await res.json()
        setError(errData.detail || 'Google Sign-In failed.')
      }
    } catch (err) {
      setError('A connection error occurred with authentication services.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password || (activeTab === 'signup' && !username)) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register'
    const payload = activeTab === 'login' 
      ? { email, password } 
      : { username, email, password }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        onSuccess(data.access_token)
        onClose()
        // Reset fields
        setEmail('')
        setUsername('')
        setPassword('')
      } else {
        const errData = await res.json()
        setError(errData.detail || 'Authentication failed. Please verify credentials.')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#04060b]/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Modal Frame */}
      <div className="relative w-full max-w-md bg-[#0b0e17]/90 border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 animate-float">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 mt-2">
          <img src="/logo.png" className="w-10 h-10 object-contain mx-auto mb-3" alt="Logo" />
          <h2 className="text-xl font-bold font-display text-white">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 font-light">
            {activeTab === 'login' ? 'Sign in to access your chat sessions' : 'Start chatting with models in seconds'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/[0.08] mb-5">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'login' 
                ? 'text-indigo-400 border-b-2 border-indigo-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'signup' 
                ? 'text-indigo-400 border-b-2 border-indigo-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center space-x-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-relaxed font-light">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm rounded-xl pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 outline-hidden transition-all duration-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm rounded-xl pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 outline-hidden transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm rounded-xl pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 outline-hidden transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed mt-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{activeTab === 'login' ? 'Log In' : 'Register Account'}</span>
            )}
          </button>
        </form>

        {/* Google OAuth Separator */}
        {googleClientId && (
          <>
            <div className="flex items-center my-5 text-gray-500">
              <div className="flex-1 h-[1px] bg-white/[0.08]"></div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-3 select-none">Or Continue With</span>
              <div className="flex-1 h-[1px] bg-white/[0.08]"></div>
            </div>

            <div id="google-signin-btn" className="w-full overflow-hidden rounded-xl border border-white/10 transition-all duration-200 hover:border-white/20"></div>
          </>
        )}

      </div>
    </div>
  )
}

export default AuthModal
