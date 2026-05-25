'use client';
import { useState } from 'react';
import { BookOpen, Loader2, Volume2 } from 'lucide-react';
import VoiceControls from './VoiceControls';

interface LecturePlayerProps {
  pdfText: string;
}

export default function LecturePlayer({ pdfText }: LecturePlayerProps) {
  const [lecture, setLecture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const utteranceRef = { current: null as SpeechSynthesisUtterance | null };

  const generateLecture = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLecture(data.lecture);
    } catch (err: any) {
      setError(err.message || 'Lecture generate nahi hua');
    } finally {
      setIsLoading(false);
    }
  };

  const playWithWebSpeech = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = speed;
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePlay = async () => {
    if (!lecture) return;
    // Try Smallest AI first, fallback to Web Speech
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lecture }),
      });
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('audio')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = speed;
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        return;
      }
    } catch {}
    // Fallback: Web Speech API
    playWithWebSpeech(lecture);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <BookOpen className="text-orange-500" size={20} />
        Hinglish Lecture (by Gemini)
      </h2>

      {!lecture ? (
        <button
          onClick={generateLecture}
          disabled={isLoading || !pdfText}
          className="w-full py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 className="animate-spin" size={20} /> Lecture ban raha hai...</> : <><Volume2 size={20} /> 🎓 Teach Me Like a Teacher!</>}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-xl border border-orange-200 dark:border-orange-800 max-h-64 overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{lecture}</p>
          </div>
          <VoiceControls
            isPlaying={isPlaying} isPaused={isPaused} speed={speed}
            onPlay={handlePlay} onPause={handlePause} onStop={handleStop}
            onSpeedChange={(s) => { setSpeed(s); if (isPlaying) { handleStop(); setTimeout(handlePlay, 100); } }}
          />
          <button onClick={generateLecture} className="text-xs text-orange-500 hover:underline">
            🔄 Dobara generate karo
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-red-500 text-sm">⚠️ {error}</p>}
    </div>
  );
}