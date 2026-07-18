import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { Bot } from 'lucide-react'

const SUGGESTIONS = [
  { title: "React hook click outside", prompt: "Write a React hook to detect clicks outside a container." },
  { title: "Quantum computing", prompt: "Explain quantum computing in simple terms for a beginner." },
  { title: "Database timeouts", prompt: "Help me debug a python SQLAlchemy connection pool timeout issue." },
  { title: "SaaS Launch Email", prompt: "Write a short, engaging marketing email for a SaaS product launch." }
]

function MessageList({ messages, isPending, user, onSelectSuggestion, isLoading }) {
  const bottomRef = useRef(null)

  // Scroll to bottom on updates
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isPending])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-start px-6 py-6 space-y-6 overflow-hidden select-none">
        {/* Skeleton Bubble 1 (Left/Assistant) */}
        <div className="flex justify-start items-start space-x-2 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0"></div>
          <div className="space-y-2 max-w-[60%]">
            <div className="h-4 bg-white/5 rounded-md w-24"></div>
            <div className="h-3 bg-white/5 rounded-md w-48"></div>
          </div>
        </div>

        {/* Skeleton Bubble 2 (Right/User) */}
        <div className="flex justify-end items-start space-x-2 animate-pulse">
          <div className="space-y-2 max-w-[50%] flex flex-col items-end">
            <div className="h-4 bg-white/5 rounded-md w-32"></div>
            <div className="h-3 bg-white/5 rounded-md w-20"></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0"></div>
        </div>

        {/* Skeleton Bubble 3 (Left/Assistant) */}
        <div className="flex justify-start items-start space-x-2 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0"></div>
          <div className="space-y-2 max-w-[70%]">
            <div className="h-4 bg-white/5 rounded-md w-40"></div>
            <div className="h-3 bg-white/5 rounded-md w-64"></div>
            <div className="h-3 bg-white/5 rounded-md w-52"></div>
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none max-w-lg mx-auto space-y-6">
        {/* Glow behind logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl animate-pulse-slow"></div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center border border-white/10 shadow-2xl relative z-10 animate-float">
            <Bot className="w-8 h-8 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold font-display bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome to DVerse Chat
          </h2>
          <p className="text-xs text-gray-400 font-light mt-1.5 max-w-sm leading-relaxed">
            Your multi-model AI dashboard. Select a model above and select a starter prompt below to begin chatting.
          </p>
        </div>

        {/* Suggestion Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion && onSelectSuggestion(sug.prompt)}
              className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-left text-xs text-gray-300 hover:border-indigo-500/30 hover:bg-white/[0.04] hover:text-white transition-all duration-200 shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <span className="font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors duration-200">
                {sug.title}
              </span>
              <span className="text-gray-500 text-[10px] mt-1 font-light line-clamp-1">
                {sug.prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto lg:px-4 px-2 py-6 sm:px-6 space-y-6 scroll-smooth">
      {messages.map((message, index) => (
        <MessageBubble 
          key={index} 
          message={message} 
          user={user}
        />
      ))}
      
      {/* Bot Typing Indicator */}
      {isPending && (
        <div className="flex justify-start items-end space-x-2">
          <div className="max-w-[85%] bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-xs shadow-md">
            <div className="flex items-center space-x-1.5 h-5">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
