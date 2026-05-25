'use client';
import { useState, useEffect } from 'react';
import { Moon, Sun, GraduationCap } from 'lucide-react';
import PdfUploader from '@/components/PdfUploader';
import LecturePlayer from '@/components/LecturePlayer';
import SummaryBox from '@/components/SummaryBox';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [pdfText, setPdfText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <main className="min-h-screen hero-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">AI Teacher</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini • Groq • Smallest AI</p>
            </div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-center">
        <h2 className="text-4xl font-display font-bold mb-3">
          Apna PDF Upload Karo,<br />
          <span className="text-orange-500">Teacher Ban Jaayega AI!</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Upload any study PDF → Get a Hinglish lecture in your teacher's voice, an English summary, and a chat assistant — all for free!
        </p>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 gap-6">
        {/* PDF Upload — full width */}
        <PdfUploader onTextExtracted={(text, name) => { setPdfText(text); setFileName(name); }} />

        {pdfText && (
          <>
            {/* Lecture + Summary side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LecturePlayer pdfText={pdfText} />
              <SummaryBox pdfText={pdfText} />
            </div>

            {/* Chat — full width */}
            <ChatInterface pdfText={pdfText} />
          </>
        )}

        {!pdfText && (
          <div className="card text-center py-12 text-gray-400">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Pehle PDF upload karo upar 👆</p>
            <p className="text-sm mt-1">Lecture, summary aur chat sab activate ho jaayenge!</p>
          </div>
        )}
      </div>
    </main>
  );
}