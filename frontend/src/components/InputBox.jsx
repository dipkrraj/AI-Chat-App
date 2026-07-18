import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

function InputBox({ onSend, disabled }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  // Keep cursor focused when the text box becomes active
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center space-x-3"
    >
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? "Waiting for AI..." : "Type a message..."}
          disabled={disabled}
          className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm rounded-xl px-4 py-3.5 pr-12 text-gray-100 placeholder-gray-500 outline-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
      >
        <span>Send</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}

export default InputBox
