'use client'

import { useState } from 'react'
import { Conversation, Lead, Stage } from '@/types'
import {
  Phone, User, Calendar, Bed, Users, DollarSign,
  FileText, ChevronDown, ChevronUp, Save, Edit3
} from 'lucide-react'

const STAGES: Stage[] = ['new', 'interested', 'booking', 'confirmed', 'cancelled', 'completed']

const STAGE_COLORS: Record<Stage, string> = {
  new:        'bg-gray-200 text-gray-700',
  interested: 'bg-blue-200 text-blue-800',
  booking:    'bg-amber-200 text-amber-800',
  confirmed:  'bg-green-200 text-green-800',
  cancelled:  'bg-red-200 text-red-800',
  completed:  'bg-purple-200 text-purple-800',
}

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Presidential Suite', 'Pool View', 'Garden View']

interface Props {
  conversation: Conversation | null
  lead: Lead | null
  onLeadUpdate?: (updates: Partial<Lead>) => void
}

export default function LeadPanel({ conversation, lead, onLeadUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState<Partial<Lead>>({})
  const [open, setOpen]       = useState({ contact: true, booking: true, notes: true })

  if (!conversation) {
    return (
      <aside className="h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-400">No conversation selected</p>
      </aside>
    )
  }

  const data = { ...lead, ...form }

  const startEdit = () => {
    setForm({
      name:         lead?.name         || conversation.name,
      stage:        lead?.stage        || conversation.stage,
      checkin_date: lead?.checkin_date  || '',
      checkout_date:lead?.checkout_date || '',
      room_type:    lead?.room_type     || '',
      num_guests:   lead?.num_guests    || undefined,
      budget:       lead?.budget        || '',
      notes:        lead?.notes         || '',
    })
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversation.id, ...form }),
    })
    onLeadUpdate?.(form)
    setEditing(false)
    setSaving(false)
  }

  const toggle = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <aside className="h-full flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Lead Info</h2>
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg"
              >Cancel</button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 px-2 py-1 rounded-lg"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        {/* Stage badge */}
        {editing ? (
          <select
            value={form.stage || lead?.stage || 'new'}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as Stage }))}
            className="mt-2 text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-full focus:outline-none"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        ) : (
          <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${STAGE_COLORS[data.stage as Stage] || STAGE_COLORS.new}`}>
            {(data.stage || 'new').charAt(0).toUpperCase() + (data.stage || 'new').slice(1)}
          </span>
        )}
      </div>

      {/* Contact Section */}
      <Section title="Contact" icon={<User className="w-3.5 h-3.5" />} open={open.contact} onToggle={() => toggle('contact')}>
        <Field label="Name" icon={<User className="w-3.5 h-3.5" />}>
          {editing ? (
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          ) : (
            <span>{data.name || conversation.name}</span>
          )}
        </Field>
        <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
          <span className="font-mono">{conversation.phone_number}</span>
        </Field>
      </Section>

      {/* Booking Section */}
      <Section title="Booking" icon={<Calendar className="w-3.5 h-3.5" />} open={open.booking} onToggle={() => toggle('booking')}>
        <Field label="Check-in" icon={<Calendar className="w-3.5 h-3.5" />}>
          {editing ? (
            <input type="date" value={form.checkin_date || ''} onChange={(e) => setForm((f) => ({ ...f, checkin_date: e.target.value }))}
              className="w-full text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none" />
          ) : (
            <span>{data.checkin_date || '—'}</span>
          )}
        </Field>
        <Field label="Check-out" icon={<Calendar className="w-3.5 h-3.5" />}>
          {editing ? (
            <input type="date" value={form.checkout_date || ''} onChange={(e) => setForm((f) => ({ ...f, checkout_date: e.target.value }))}
              className="w-full text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none" />
          ) : (
            <span>{data.checkout_date || '—'}</span>
          )}
        </Field>
        <Field label="Room" icon={<Bed className="w-3.5 h-3.5" />}>
          {editing ? (
            <select value={form.room_type || ''} onChange={(e) => setForm((f) => ({ ...f, room_type: e.target.value }))}
              className="w-full text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none">
              <option value="">Select type</option>
              {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : (
            <span>{data.room_type || '—'}</span>
          )}
        </Field>
        <Field label="Guests" icon={<Users className="w-3.5 h-3.5" />}>
          {editing ? (
            <input type="number" min={1} value={form.num_guests || ''} onChange={(e) => setForm((f) => ({ ...f, num_guests: parseInt(e.target.value) }))}
              className="w-full text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none" />
          ) : (
            <span>{data.num_guests || '—'}</span>
          )}
        </Field>
        <Field label="Budget" icon={<DollarSign className="w-3.5 h-3.5" />}>
          {editing ? (
            <input type="text" value={form.budget || ''} placeholder="e.g. ₹5000/night" onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              className="w-full text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none" />
          ) : (
            <span>{data.budget || '—'}</span>
          )}
        </Field>
      </Section>

      {/* Notes Section */}
      <Section title="Notes" icon={<FileText className="w-3.5 h-3.5" />} open={open.notes} onToggle={() => toggle('notes')}>
        {editing ? (
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Add notes about this lead..."
            rows={4}
            className="w-full text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
            {data.notes || 'No notes yet.'}
          </p>
        )}
      </Section>
    </aside>
  )
}

function Section({
  title, icon, open, onToggle, children,
}: {
  title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <span className="flex items-center gap-1.5">{icon}{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="px-4 pb-3 space-y-2.5">{children}</div>}
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5 text-gray-400">
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="text-xs text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )
}
