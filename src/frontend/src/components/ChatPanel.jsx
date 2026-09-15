import { useState, useRef, useEffect } from 'react'

const API_BASE = ''  // proxied by Vite to http://localhost:8000

/**
 * ChatPanel — IBM Bob conversational interface.
 *
 * Posts user messages to POST /api/chat.
 * The backend team connects this endpoint to IBM Bob / watsonx.ai.
 * If the endpoint is unavailable a friendly error is shown.
 */

const EXAMPLE_PROMPTS = [
  'Show me emerging safety signals',
  'Explain this PRR result',
  'What are the gaps in Module 3?',
  'Summarize adverse events for Ibuprofen',
  'Which CTD sections are missing?',
]

async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function BotIcon() {
  return (
    <div className="w-7 h-7 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813
             a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813
             a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>
  )
}

export default function ChatPanel({ onClose, currentMode }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      text: "Hi! I'm IBM Bob. I can help you analyze drug safety signals and check regulatory submission readiness. What would you like to explore?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatError, setChatError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed) return

    setInput('')
    setChatError(null)
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const data = await sendChatMessage(trimmed)
      const reply = data?.reply ?? data?.message ?? JSON.stringify(data)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }])
    } catch (err) {
      // Backend chat endpoint not yet connected — show friendly error
      setChatError(
        err.message.includes('Failed to fetch')
          ? 'IBM Bob is not connected yet. The backend team is wiring this up. Try again soon!'
          : `Could not reach IBM Bob: ${err.message}`
      )
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: '⚠️ IBM Bob is not available right now. The /api/chat endpoint is not yet connected.',
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BotIcon />
          <div>
            <div className="text-sm font-semibold text-slate-900">IBM Bob</div>
            <div className="text-xs text-slate-500">AI Assistant &bull; watsonx.ai</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close chat"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <BotIcon />}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : msg.isError
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <BotIcon />
            <div className="bg-slate-100 rounded-xl rounded-bl-sm px-3 py-2">
              <span className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Example prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="section-label mb-2">Try asking</p>
          <div className="flex flex-col gap-1.5">
            {EXAMPLE_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-left text-xs px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50
                           text-slate-600 hover:text-blue-700 border border-slate-200
                           hover:border-blue-200 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-200">
        {chatError && (
          <p className="text-xs text-red-600 mb-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {chatError}
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            className="flex-1 input-field resize-none text-sm min-h-[40px] max-h-32 py-2"
            placeholder="Ask IBM Bob anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3 self-end"
            aria-label="Send"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876
                   L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-center">
          Powered by IBM Bob &amp; watsonx.ai
        </p>
      </div>
    </div>
  )
}
