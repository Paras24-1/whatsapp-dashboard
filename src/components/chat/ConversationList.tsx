'use client'

import { useState } from 'react'
import { Conversation, Stage } from '@/types'
import { useConversations } from '@/hooks'
import { formatDistanceToNow } from 'date-fns'
import { Search, Filter, Wifi } from 'lucide-react'

const STAGES: Stage[] = ['new', 'interested', 'booking', 'confirmed', 'cancelled', 'completed']

const STAGE_COLORS: Record<Stage, string> = {
  new:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  interested: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  booking:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  completed:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

interface Props {
  selectedId: string | null
  onSelect: (conv: Conversation) => void
}

export default function ConversationList({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [stage,  setStage]  = useState('')
  const [unread, setUnread] = useState(false)

  const { conversations, loading } = useConversations({ search, stage, unread })

  return (
    <aside className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Inbox</h1>
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Wifi className="w-3 h-3" />
            Live
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => setUnread((u) => !u)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              unread
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            <span>No conversations found</span>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedId}
              onClick={() => onSelect(conv)}
            />
          ))
        )}
      </div>
    </aside>
  )
}

function ConversationItem({
  conversation: conv,
  isSelected,
  onClick,
}: {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}) {
  const initials = conv.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const timeAgo = formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-gray-50 dark:border-gray-900 ${
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-l-emerald-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>
        {!conv.ai_mode && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-400 border-2 border-white dark:border-gray-950 flex items-center justify-center">
            <span className="block w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-medium truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
            {conv.name}
          </span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
          {conv.phone_number}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {conv.last_message || 'No messages yet'}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STAGE_COLORS[conv.stage as Stage] || STAGE_COLORS.new}`}>
            {conv.stage}
          </span>
        </div>
      </div>

      {/* Unread badge */}
      {conv.unread_count > 0 && (
        <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
          {conv.unread_count > 99 ? '99+' : conv.unread_count}
        </span>
      )}
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-900">
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
            <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </>
  )
}
