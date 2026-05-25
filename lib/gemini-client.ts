// // Gemini API client for Hinglish lecture generation
// const GEMINI_ENDPOINT =
//   'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// export async function generateHinglishLecture(pdfText: string): Promise<string> {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env.local');

//   const prompt = `
// Tu ek bahut friendly aur engaging teacher hai jo students ko exam ke liye padhata hai.
// Neeche diya gaya content padhkar ek detailed lecture generate kar Hinglish mein (Hindi + Urdu words, Roman script mein likhna).

// Rules:
// - Bilkul ek real teacher ki tarah baat kar: "Dekho students...", "Samajh gaye?", "Chalo ek example lete hain", "Ye point bohot important hai!"
// - Har concept clearly explain kar, examples de
// - Dry mat hona - thoda humor bhi daal
// - Lecture 400-600 words ka hona chahiye
// - SIRF Roman script use karo (Devanagari ya Arabic script mat use karo)

// PDF Content:
// ${pdfText}

// Ab lecture shuru karo:
// `;

//   const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       contents: [{ parts: [{ text: prompt }] }],
//       generationConfig: {
//         temperature: 0.8,
//         maxOutputTokens: 1024,
//       },
//     }),
//   });

//   if (!response.ok) {
//     const err = await response.json();
//     throw new Error(err?.error?.message || 'Gemini API request failed');
//   }

//   const data = await response.json();
//   return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lecture generate nahi hua. Dobara try karo.';
// }