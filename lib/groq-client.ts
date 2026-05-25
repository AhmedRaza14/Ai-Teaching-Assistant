const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function groqRequest(messages: { role: string; content: string }[], model = 'llama-3.1-8b-instant'): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in .env.local');

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
  model,
  messages,
  max_tokens: 8192,  // ✅ much higher limit
  temperature: 0.7,
}),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Groq API request failed');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Response generate nahi hua.';
}

// ✅ Hinglish lecture — now using Groq instead of Gemini (free!)
export async function generateHinglishLecture(pdfText: string): Promise<string> {
  return await groqRequest(
    [
      {
        role: 'system',
        content: `Tu ek bahut friendly aur engaging teacher hai jo students ko exam ke liye padhata hai.
Hinglish mein baat kar (Hindi + Urdu words, Roman script mein — Devanagari ya Arabic script bilkul mat use karo).
Bilkul ek real teacher ki tarah: "Dekho students...", "Samajh gaye?", "Chalo ek example lete hain", "Ye point bohot important hai!"
Har concept clearly explain kar, real life examples de, thoda humor bhi daal.
Lecture 1100-1200 words ka hona chahiye. Lecture poora complete karo — beech mein bilkul mat roko. SIRF Roman script.`,
      },
      {
        role: 'user',
        content: `Is PDF content ke baare mein ek detailed lecture do. Lecture complete karo, beech mein mat rokna:\n\n${pdfText.slice(0, 8000)}`,
      },
    ],
    'llama-3.3-70b-versatile' // Bigger model for better lecture quality
  );
}

// ✅ English summary — Groq
export async function generateEnglishSummary(pdfText: string): Promise<string[]> {
  const result = await groqRequest([
    {
      role: 'system',
      content:
        'You are a helpful study assistant. Summarize content into detailed bullet points at a 6th-grade reading level. Each point should be 2-3 sentences long with examples where possible. Return ONLY a JSON array of strings, no explanation, no markdown, no backticks. Example: ["Point 1 with detail", "Point 2 with detail"]',
    },
    {
      role: 'user',
      content: `Summarize this in exactly 10 detailed bullet points. Each point must explain the concept clearly with an example:\n\n${pdfText.slice(0, 8000)}`,
    },
  ], 'llama-3.3-70b-versatile');  // ✅ bigger model, higher limit


  try {
    const cleaned = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [result];
  } catch {
    return result
      .split('\n')
      .filter((line) => line.trim().length > 5)
      .slice(0, 10);
  }
}

// ✅ Chat Q&A — Groq
export async function answerQuestion(
  question: string,
  pdfText: string,
  chatHistory: { role: string; content: string }[]
): Promise<string> {
  return await groqRequest([
    {
      role: 'system',
      content: `Tu ek helpful teacher hai. PDF content ke basis par questions ka jawab de Hinglish mein (Roman script only).
Short, clear aur friendly jawab de. PDF content:\n\n${pdfText.slice(0, 4000)}`,
    },
    ...chatHistory.slice(-6),
    { role: 'user', content: question },
  ]);
}