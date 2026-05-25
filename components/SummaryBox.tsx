'use client';
import { useState } from 'react';
import { ListChecks, Loader2 } from 'lucide-react';

export default function SummaryBox({ pdfText }: { pdfText: string }) {
  const [points, setPoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPoints(data.points);
    } catch (err: any) {
      setError(err.message || 'Summary generate nahi hua');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ListChecks className="text-orange-500" size={20} />
        English Summary (by Groq)
      </h2>

      {points.length === 0 ? (
        <button
          onClick={generateSummary}
          disabled={isLoading || !pdfText}
          className="w-full py-2 px-4 rounded-lg border-2 border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 className="animate-spin" size={16} /> Summary ban rahi hai...</> : '📋 Generate English Summary'}
        </button>
      ) : (
        <ul className="space-y-2">
          {points.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-red-500 text-sm">⚠️ {error}</p>}
    </div>
  );
}