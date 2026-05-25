import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'hindi-female-1' } = await req.json();
    const apiKey = process.env.SMALLEST_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'SMALLEST_AI_API_KEY not set', fallback: true }, { status: 200 });
    }

    const response = await fetch('https://api.smallest.ai/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text: text.slice(0, 2000), voice, speed: 1.0 }),
    });

    if (!response.ok) {
      // Return fallback flag so frontend uses Web Speech API
      return NextResponse.json({ error: 'TTS failed', fallback: true }, { status: 200 });
    }

    // Stream audio back to client
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, fallback: true }, { status: 200 });
  }
}