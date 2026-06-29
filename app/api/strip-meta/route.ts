import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mime = file.type

    // Process with sharp — strips all metadata
    const stripped = await sharp(buffer).withMetadata({}).toBuffer()

    return new NextResponse(new Uint8Array(stripped), {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="clean_${file.name}"`,
      },
    })
  } catch (err) {
    console.error('strip-meta error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
