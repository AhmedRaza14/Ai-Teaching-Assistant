import { NextRequest, NextResponse } from 'next/server';
import { generateEnglishSummary } from '@/lib/groq-client';

export async function POST(req: NextRequest) {
  try {
    const { pdfText } = await req.json();
    if (!pdfText) return NextResponse.json({ error: 'PDF text is required' }, { status: 400 });

    const points = await generateEnglishSummary(pdfText);
    return NextResponse.json({ points });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Summary generation failed' }, { status: 500 });
  }
}