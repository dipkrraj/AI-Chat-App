import React from 'react'
import { Bot, User } from 'lucide-react'

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-2`}>
      
      {/* Bot Avatar (aligned to the left) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
          <Bot className="w-4.5 h-4.5 text-white" />
        </div>
      )}
      
      {/* Bubble Content */}
      <div className={`max-w-[78%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-lg border ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-500/10 rounded-tr-xs' 
          : 'bg-white/[0.04] border-white/[0.06] text-gray-200 rounded-tl-xs'
      }`}>
        {/* Render markdown-like list layout in pure HTML cleanly if there is a bullet list, otherwise simple paragraph */}
        <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>

      {/* User Avatar (aligned to the right) */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
          <User className="w-4.5 h-4.5 text-indigo-300" />
        </div>
      )}
      
    </div>
  )
}

export default MessageBubble
