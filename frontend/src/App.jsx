import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LandingPage from './components/LandingPage'
import ChatPage from './components/ChatPage'
import AuthModal from './components/AuthModal'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [token, setToken] = useState(localStorage.getItem('dp_auth_token') || null)
  const [user, setUser] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const fetchUser = async (authToken) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        handleLogout()
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      handleLogout()
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser(token)
    }
  }, [token])

  const handleAuthSuccess = (newToken) => {
    localStorage.setItem('dp_auth_token', newToken)
    setToken(newToken)
    fetchUser(newToken)
    setCurrentPage('chat')
  }

  const handleLogout = () => {
    localStorage.removeItem('dp_auth_token')
    setToken(null)
    setUser(null)
    setCurrentPage('landing')
  }

  const handleTryNow = () => {
    if (token) {
      setCurrentPage('chat')
    } else {
      setIsAuthOpen(true)
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      {currentPage === 'landing' ? (
        <LandingPage 
          user={user}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthOpen(true)}
          onNavigate={handleTryNow} 
        />
      ) : (
        <ChatPage 
          token={token} 
          user={user} 
          onLogout={handleLogout} 
          onBack={() => setCurrentPage('landing')} 
        />
      )}

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
    </QueryClientProvider>
  )
}

export default App
