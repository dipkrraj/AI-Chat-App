import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function MessageList({ messages, isPending, user }) {
  const bottomRef = useRef(null)

  // Scroll to bottom on updates
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isPending])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6 scroll-smooth">
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
