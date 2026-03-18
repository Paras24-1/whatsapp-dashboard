import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')?.replace('+', '')

    const apiKey  = process.env.GOOGLE_SHEETS_API_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID
    const gid     = process.env.GOOGLE_SHEET_GID || '0'

    if (!apiKey || !sheetId) {
      return NextResponse.json({ error: 'Missing Google Sheets config' }, { status: 500 })
    }

    // Fetch all rows from the sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:L?key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    if (!data.values || data.values.length === 0) {
      return NextResponse.json({ error: 'No data in sheet' }, { status: 404 })
    }

    // First row = headers
    const headers: string[] = data.values[0]
    const rows = data.values.slice(1)

    // Find row matching phone number
    const phoneIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes('phone')
    )

    let matchedRow = null

    if (phone && phoneIndex !== -1) {
      matchedRow = rows.find((row: string[]) => {
        const rowPhone = (row[phoneIndex] || '').replace(/\D/g, '')
        const searchPhone = phone.replace(/\D/g, '')
        return rowPhone.endsWith(searchPhone) || searchPhone.endsWith(rowPhone)
      })
    }

    if (!matchedRow) {
      return NextResponse.json({ error: 'No matching lead found' }, { status: 404 })
    }

    // Map row to object using headers
    const lead: Record<string, string> = {}
    headers.forEach((header: string, i: number) => {
      lead[header] = matchedRow[i] || ''
    })

    return NextResponse.json(lead)
  } catch (err) {
    console.error('[sheets]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
