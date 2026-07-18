import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bot, RefreshCw, Cpu, ChevronDown, ArrowLeft } from 'lucide-react'
import MessageList from './MessageList'
import InputBox from './InputBox'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function ChatPage({ token, user, onLogout, onBack }) {
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant')
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Lock body scroll in chat dashboard to prevent page overflow
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 1. Fetch available models and conversation state on mount
  useEffect(() => {
    if (!token) return

    const initializeChat = async () => {
      try {
        setIsLoadingHistory(true)
        // Fetch models
        const modelsRes = await fetch(`${API_BASE}/api/models`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (modelsRes.status === 401) {
          onLogout()
          return
        }
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json()
          setModels(modelsData)
        }

        // Fetch conversations
        const convRes = await fetch(`${API_BASE}/api/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (convRes.status === 401) {
          onLogout()
          return
        }
        
        let activeConvId = conversationId

        if (convRes.ok) {
          const convs = await convRes.json()
          if (convs.length > 0) {
            const targetConv = conversationId ? convs.find(c => c.id === conversationId) : convs[0]
            if (targetConv) {
              activeConvId = targetConv.id
              setConversationId(targetConv.id)
              setSelectedModel(targetConv.model || 'llama-3.1-8b-instant')
            }
          } else {
            // Automatically seed a new conversation session for this user
            const createRes = await fetch(`${API_BASE}/api/conversations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ title: 'First Chat Session', model: 'llama-3.1-8b-instant' })
            })
            if (createRes.status === 401) {
              onLogout()
              return
            }
            if (createRes.ok) {
              const newConv = await createRes.json()
              activeConvId = newConv.id
              setConversationId(newConv.id)
              setSelectedModel(newConv.model || 'llama-3.1-8b-instant')
            }
          }
        }

        // Fetch message history for the active conversation session
        if (activeConvId) {
          const msgRes = await fetch(`${API_BASE}/api/conversations/${activeConvId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (msgRes.status === 401) {
            onLogout()
            return
          }
          if (msgRes.ok) {
            const msgData = await msgRes.json()
            const mappedMessages = msgData.map(m => ({
              role: m.sender,
              content: m.content
            }))
            setMessages(mappedMessages)
          }
        }
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    initializeChat()
  }, [token])

  // 2. Mutation to change the AI Model in the database
  const updateModelMutation = useMutation({
    mutationFn: async (newModel) => {
      if (!conversationId) return
      const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/model`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ model: newModel }),
      })
      if (response.status === 401) {
        onLogout()
        throw new Error('Session expired')
      }
      if (!response.ok) {
        throw new Error('Failed to update model')
      }
      return response.json()
    },
    onSuccess: (data) => {
      setSelectedModel(data.model)
    },
    onError: (err) => {
      alert("Error updating model: " + err.message)
    }
  })

  // 3. Mutation to send message and trigger AI response
  const chatMutation = useMutation({
    mutationFn: async (text) => {
      if (!conversationId) {
        throw new Error('No active conversation session')
      }
      const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sender: 'user', content: text }),
      })
      
      if (response.status === 401) {
        onLogout()
        throw new Error('Session expired')
      }
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      if (data) {
        setMessages((prev) => [...prev, { role: data.sender, content: data.content }])
      }
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I couldn\'t process that message. Please verify the backend server is running and try again.' 
        }
      ])
    }
  })

  const handleSendMessage = (text) => {
    if (!text.trim() || !conversationId) return

    // Immediately append the user message locally
    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    
    // Trigger mutation
    chatMutation.mutate(text)
  }

  const handleModelChange = (modelId) => {
    updateModelMutation.mutate(modelId)
  }

  const handleClearChat = async () => {
    if (!conversationId) return
    if (window.confirm("Are you sure you want to clear this conversation? This will permanently delete all messages from the database.")) {
      try {
        const res = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          setMessages([{ role: 'assistant', content: 'Conversation cleared! How can I help you now?' }])
        } else {
          alert('Failed to clear conversation from database.')
        }
      } catch (err) {
        console.error('Failed to clear conversation:', err)
        alert('Network error when clearing conversation.')
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0f1d] to-[#05070f] text-gray-100 lg:p-4 p-2 sm:p-6 md:p-8 justify-center items-center">
      {/* Premium Outer Card Container */}
      <div className="w-full max-w-4xl h-[85vh] md:h-[80vh] flex flex-col bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <header className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/15 bg-white/[0.02]">
          {/* Left Side: Brand & Navigation */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-3">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-lg p-1 bg-gradient-to-tr from-[#111827] to-[#1f2937]">
                  <img src="/logo.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" alt="Logo" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#111827] rounded-full"></span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold tracking-wide font-display bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  DverseAI
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" /> Sync Enabled
                </p>
              </div>
            </div>

            {/* Mobile Actions: Clear Chat (Inline) */}
            <div className="flex items-center sm:hidden">
              <button 
                onClick={handleClearChat}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
                title="Clear Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Right Side: Model Switcher & User Details */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 sm:space-x-4 border-t border-white/[0.04] sm:border-0 pt-2 sm:pt-0">
            {/* Model Switcher Dropdown */}
            <div className="relative flex items-center flex-1 sm:flex-initial">
              <select 
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={updateModelMutation.isPending}
                className="w-full sm:w-auto appearance-none bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl pl-3 pr-10 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:border-indigo-500/50 cursor-pointer transition-all duration-200"
              >
                {models.map((m) => (
                  <option 
                    key={m.id} 
                    value={m.id} 
                    disabled={!m.active && m.id !== 'mock'} 
                    className="bg-[#111827] text-gray-300 disabled:text-gray-600"
                  >
                    {m.name} {!m.active && m.id !== 'mock' ? ' (keys missing)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Desktop Actions: Clear Chat */}
            <div className="hidden sm:flex items-center">
              <button 
                onClick={handleClearChat}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
                title="Clear Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Message Container Area */}
        <MessageList 
          messages={messages} 
          isPending={chatMutation.isPending} 
          user={user}
          onSelectSuggestion={handleSendMessage}
          isLoading={isLoadingHistory}
        />

        {/* Input Box Area */}
        <InputBox 
          onSend={handleSendMessage} 
          disabled={chatMutation.isPending || isLoadingHistory || !conversationId} 
        />
        
      </div>
    </div>
  )
}

export default ChatPage
