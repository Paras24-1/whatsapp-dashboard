'use client'

import { useState } from 'react'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow      from '@/components/chat/ChatWindow'
import LeadPanel       from '@/components/chat/LeadPanel'
import { Conversation, Lead } from '@/types'
import { Moon, Sun, MessageSquare } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function DashboardPage() {
  const [selected, setSelected]     = useState<Conversation | null>(null)
  const [lead, setLead]             = useState<Lead | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, setTheme }         = useTheme()

  const handleSelect = async (conv: Conversation) => {
    setSelected(conv)
    // Fetch lead for this conversation
    const res = await fetch(`/api/leads?conversation_id=${conv.id}`)
    if (res.ok) {
      const data = await res.json()
      setLead(data)
    }
  }

  const handleLeadUpdate = (updates: Partial<Lead>) => {
    setLead((prev) => prev ? { ...prev, ...updates } : null)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Top bar */}
      <header className="h-12 flex items-center justify-between px-4 bg-emerald-600 dark:bg-emerald-800 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm tracking-tight">WhatsApp Dashboard</span>
          <span className="text-emerald-200 text-xs">· Hotel AI Agent</span>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          title="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Conversation list — fixed width */}
        <div className="w-80 shrink-0 flex flex-col overflow-hidden">
          <ConversationList
  selectedId={selected?.id ?? null}
  onSelect={handleSelect}
  onDelete={(id) => {
    if (selected?.id === id) setSelected(null)
  }}
/>

        </div>

        {/* CENTER: Chat window — flexible */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <ChatWindow
            conversation={selected}
            onAIToggle={(id, mode) => {
              if (selected?.id === id) {
                setSelected((prev) => prev ? { ...prev, ai_mode: mode } : null)
              }
            }}
          />
        </div>

        {/* RIGHT: Lead metadata — fixed width */}
        <div className="w-72 shrink-0 flex flex-col overflow-hidden">
          <LeadPanel
            conversation={selected}
            lead={lead}
            onLeadUpdate={handleLeadUpdate}
          />
        </div>
      </div>
    </div>
  )
}
