// ============================================
// MULTI-API CLIENT — 6 key fallback system
// Order: Groq1 → Groq2 → Cerebras1 → Cerebras2 → Mistral1 → Mistral2
// ============================================

const GROQ_ENDPOINT      = 'https://api.groq.com/openai/v1/chat/completions';
const CEREBRAS_ENDPOINT  = 'https://api.cerebras.ai/v1/chat/completions';
const MISTRAL_ENDPOINT   = 'https://api.mistral.ai/v1/chat/completions';

interface Message {
  role: string;
  content: string;
}

// ✅ Generic OpenAI-compatible request function
async function tryAPI(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: Message[],
  apiName: string
): Promise<string | null> {
  if (!apiKey) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 8192,
        temperature: 0.7,
      }),
    });

    if (response.status === 429 || !response.ok) {
      console.log(`❌ ${apiName} failed (${response.status}), trying next...`);
      return null;
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || null;
    if (result) console.log(`✅ ${apiName} succeeded!`);
    return result;

  } catch (err) {
    console.log(`❌ ${apiName} error, trying next...`);
    return null;
  }
}

// ✅ MAIN SMART REQUEST — tries all 6 keys in order
async function smartRequest(
  messages: Message[],
  groqModel = 'llama-3.3-70b-versatile'
): Promise<string> {

  // All providers in fallback order
  const providers = [
    // 🥇 Groq Key 1
    () => tryAPI(
      GROQ_ENDPOINT,
      process.env.GROQ_API_KEY_1 || '',
      groqModel,
      messages,
      'Groq Key-1'
    ),
    // 🥈 Groq Key 2
    () => tryAPI(
      GROQ_ENDPOINT,
      process.env.GROQ_API_KEY_2 || '',
      groqModel,
      messages,
      'Groq Key-2'
    ),
    // 🥉 Cerebras Key 1
    () => tryAPI(
      CEREBRAS_ENDPOINT,
      process.env.CEREBRAS_API_KEY_1 || '',
      'llama-3.3-70b',
      messages,
      'Cerebras Key-1'
    ),
    // 4️⃣ Cerebras Key 2
    () => tryAPI(
      CEREBRAS_ENDPOINT,
      process.env.CEREBRAS_API_KEY_2 || '',
      'llama-3.3-70b',
      messages,
      'Cerebras Key-2'
    ),
    // 5️⃣ Mistral Key 1
    () => tryAPI(
      MISTRAL_ENDPOINT,
      process.env.MISTRAL_API_KEY_1 || '',
      'mistral-small-latest',
      messages,
      'Mistral Key-1'
    ),
    // 6️⃣ Mistral Key 2
    () => tryAPI(
      MISTRAL_ENDPOINT,
      process.env.MISTRAL_API_KEY_2 || '',
      'mistral-small-latest',
      messages,
      'Mistral Key-2'
    ),
  ];

  // Try each provider one by one
  for (const provider of providers) {
    const result = await provider();
    if (result) return result;
  }

  throw new Error('Tamam 6 APIs fail ho gayi! Thodi der baad try karo.');
}

// ============================================
// FEATURE FUNCTIONS
// ============================================

// 🎓 Hinglish Lecture
export async function generateHinglishLecture(pdfText: string): Promise<string> {
  return await smartRequest(
    [
      {
        role: 'system',
        content: `Tu ek bahut friendly aur engaging teacher hai jo students ko exam ke liye padhata hai.
Hinglish mein baat kar (Hindi + Urdu words, Roman script mein — Devanagari ya Arabic script bilkul mat use karo).
Bilkul ek real teacher ki tarah: "Dekho students...", "Samajh gaye?", "Chalo ek example lete hain", "Ye point bohot important hai!"
Har concept clearly explain kar, real life examples de, thoda humor bhi daal.
Lecture 600-900 words ka hona chahiye. Lecture poora complete karo beech mein mat roko. SIRF Roman script.`,
      },
      {
        role: 'user',
        content: `Is PDF content ke baare mein ek detailed lecture do:\n\n${pdfText.slice(0, 4000)}`,
      },
    ],
    'llama-3.3-70b-versatile'
  );
}

// 📋 English Summary
export async function generateEnglishSummary(pdfText: string): Promise<string[]> {
  const result = await smartRequest(
    [
      {
        role: 'system',
        content:
          'You are a helpful study assistant. Summarize content into detailed bullet points at a 6th-grade reading level. Each point should be 2-3 sentences long with examples where possible. Return ONLY a JSON array of strings, no explanation, no markdown, no backticks. Example: ["Point 1 with detail", "Point 2 with detail"]',
      },
      {
        role: 'user',
        content: `Summarize this in exactly 10 detailed bullet points. Each point must explain the concept clearly with an example:\n\n${pdfText.slice(0, 4000)}`,
      },
    ],
    'llama-3.3-70b-versatile'
  );

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

// 💬 Chat Q&A
export async function answerQuestion(
  question: string,
  pdfText: string,
  chatHistory: { role: string; content: string }[]
): Promise<string> {
  return await smartRequest(
    [
      {
        role: 'system',
        content: `Tu ek helpful teacher hai. PDF content ke basis par questions ka jawab de Hinglish mein (Roman script only).
Short, clear aur friendly jawab de. PDF content:\n\n${pdfText.slice(0, 4000)}`,
      },
      ...chatHistory.slice(-6),
      { role: 'user', content: question },
    ],
    'llama-3.1-8b-instant'
  );
}