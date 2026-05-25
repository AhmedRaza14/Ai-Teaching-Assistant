'use client';
import { useState, useRef } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // ✅ Smart voice — tries multiple voices, falls back gracefully
  const playWithWebSpeech = (text: string, playbackSpeed: number = speed) => {
    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.volume = 1;
    utterance.pitch = 1;

    // ✅ Get all available voices
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // ✅ Try to find best voice — priority order
    const preferredVoice =
      voices.find(v => v.lang === 'hi-IN') ||           // Hindi India
      voices.find(v => v.lang.startsWith('hi')) ||       // Any Hindi
      voices.find(v => v.lang === 'ur-PK') ||            // Urdu Pakistan
      voices.find(v => v.lang === 'ur') ||               // Any Urdu
      voices.find(v => v.lang === 'en-IN') ||            // English India accent
      voices.find(v => v.lang.startsWith('en')) ||       // Any English
      voices[0];                                          // Whatever is available

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
      console.log('Using voice:', preferredVoice.name, preferredVoice.lang);
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    // ✅ Small delay fixes Chrome bug where speech doesnt start
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);

    setIsPlaying(true);
  };

  const handlePlay = async () => {
    if (!lecture) return;

    // ✅ If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // ✅ Try Smallest AI first
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
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(url);
        audio.playbackRate = speed;
        audioRef.current = audio;
        audio.play();
        setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        return;
      }
    } catch (e) {
      console.log('Smallest AI failed, using Web Speech API');
    }

    // ✅ Fallback: Web Speech API
    // voices load hone ka wait karo
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        playWithWebSpeech(lecture);
      };
    } else {
      playWithWebSpeech(lecture);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    // Web speech mein speed change ke liye restart karna padta hai
    if (isPlaying && !audioRef.current) {
      handleStop();
      setTimeout(() => playWithWebSpeech(lecture, newSpeed), 200);
    }
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <BookOpen className="text-orange-500" size={20} />
        Hinglish Lecture (by Groq)
      </h2>

      {!lecture ? (
        <button
          onClick={generateLecture}
          disabled={isLoading || !pdfText}
          className="w-full py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading
            ? <><Loader2 className="animate-spin" size={20} /> Lecture ban raha hai...</>
            : <><Volume2 size={20} /> 🎓 Teach Me Like a Teacher!</>
          }
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-xl border border-orange-200 dark:border-orange-800 max-h-64 overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{lecture}</p>
          </div>

          {/* ✅ Voice status indicator */}
          {isPlaying && (
            <div className="flex items-center gap-2 text-orange-500 text-sm">
              <span className="animate-pulse">🔊</span>
              <span>Bol raha hai... sun lo!</span>
            </div>
          )}

          <VoiceControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            speed={speed}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onSpeedChange={handleSpeedChange}
          />

          <button
            onClick={() => { handleStop(); setLecture(''); }}
            className="text-xs text-orange-500 hover:underline"
          >
            🔄 Dobara generate karo
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-red-500 text-sm">⚠️ {error}</p>}
    </div>
  );
}