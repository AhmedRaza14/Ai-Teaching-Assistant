import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/groq-client';

export async function POST(req: NextRequest) {
  try {
    const { question, pdfText, chatHistory } = await req.json();
    if (!question || !pdfText) {
      return NextResponse.json({ error: 'Question and PDF text are required' }, { status: 400 });
    }

    const answer = await answerQuestion(question, pdfText, chatHistory || []);
    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to answer question' }, { status: 500 });
  }
}