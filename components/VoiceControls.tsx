'use client';
import { Play, Pause, Square, Gauge } from 'lucide-react';

interface VoiceControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function VoiceControls({
  isPlaying, isPaused, speed, onPlay, onPause, onStop, onSpeedChange
}: VoiceControlsProps) {
  const speeds = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Play/Pause button */}
      <button
        onClick={isPlaying && !isPaused ? onPause : onPlay}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all active:scale-95"
      >
        {isPlaying && !isPaused ? (
          <><Pause size={16} /> Pause</>
        ) : (
          <><Play size={16} /> {isPaused ? 'Resume' : 'Play'}</>
        )}
      </button>

      {/* Stop button */}
      {(isPlaying || isPaused) && (
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
        >
          <Square size={16} /> Stop
        </button>
      )}

      {/* Speed controls */}
      <div className="flex items-center gap-1 ml-2">
        <Gauge size={14} className="text-gray-500" />
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 text-xs rounded font-mono transition-all ${
              speed === s
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-100'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}