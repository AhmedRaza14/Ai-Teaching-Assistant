export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LectureState {
  text: string;
  isLoading: boolean;
  error: string | null;
}

export interface SummaryState {
  points: string[];
  isLoading: boolean;
  error: string | null;
}

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  currentText: string | null;
}

export interface AppState {
  pdfText: string | null;
  fileName: string | null;
  lecture: LectureState;
  summary: SummaryState;
  voice: VoiceState;
  chat: ChatMessage[];
  isDark: boolean;
}