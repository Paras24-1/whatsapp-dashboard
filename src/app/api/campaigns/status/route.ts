import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/campaigns/status
// Called by n8n after sending each message to update delivery status
export async function PATCH(req: NextRequest) {
  try {
    const { campaign_id, phone, status, error: errMsg } = await req.json()

    if (!campaign_id || !phone || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Update contact status
    await supabaseAdmin
      .from('campaign_contacts')
      .update({
        status,
        error: errMsg || null,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      })
      .eq('campaign_id', campaign_id)
      .eq('phone', phone)

    // Recalculate campaign totals
    const { data: counts } = await supabaseAdmin
      .from('campaign_contacts')
      .select('status')
      .eq('campaign_id', campaign_id)

    if (counts) {
      const sent      = counts.filter((c) => c.status === 'sent').length
      const delivered = counts.filter((c) => c.status === 'delivered').length
      const failed    = counts.filter((c) => c.status === 'failed').length
      const pending   = counts.filter((c) => c.status === 'pending').length
      const total     = counts.length

      const isComplete = pending === 0

      await supabaseAdmin
        .from('campaigns')
        .update({
          sent,
          delivered,
          failed,
          status: isComplete ? 'completed' : 'sending',
          completed_at: isComplete ? new Date().toISOString() : null,
        })
        .eq('id', campaign_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
