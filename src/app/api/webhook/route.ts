import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { WebhookPayload } from '@/types'

// POST /api/webhook
// Called by n8n to push incoming/outgoing WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret (set N8N_WEBHOOK_SECRET in .env)
    
    }

    const body: WebhookPayload = await req.json()

    // Validate required fields
    const { phone_number, message, direction } = body
    if (!phone_number || !message || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields: phone_number, message, direction' },
        { status: 400 }
      )
    }

    const name = body.name || phone_number
    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date()

    // 1. Upsert conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .upsert(
        {
          phone_number,
          name,
          last_message: message,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone_number', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (convError) throw convError

    // 2. Update unread count for incoming messages
    if (direction === 'incoming') {
      await supabaseAdmin.rpc('increment_unread', {
        p_phone: phone_number,
      })
    }

    // 3. Insert message
    const { data: msg, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        phone_number,
        message,
        direction,
        timestamp: timestamp.toISOString(),
      })
      .select()
      .single()

    if (msgError) throw msgError

    // 4. Ensure lead record exists
    await supabaseAdmin
      .from('leads')
      .upsert(
        { conversation_id: conversation.id, phone_number, name },
        { onConflict: 'conversation_id', ignoreDuplicates: true }
      )

    return NextResponse.json({
      success: true,
      conversation_id: conversation.id,
      message_id: msg.id,
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook]', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
