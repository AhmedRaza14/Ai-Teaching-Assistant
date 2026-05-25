import { NextRequest, NextResponse } from 'next/server';
import { generateHinglishLecture } from '@/lib/groq-client';  // ← changed import

export async function POST(req: NextRequest) {
  try {
    const { pdfText } = await req.json();
    if (!pdfText) return NextResponse.json({ error: 'PDF text is required' }, { status: 400 });

    const lecture = await generateHinglishLecture(pdfText);
    return NextResponse.json({ lecture });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lecture generation failed' }, { status: 500 });
  }
}