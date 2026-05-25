'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2, MessageSquare, Volume2 } from 'lucide-react';
import { ChatMessage } from '@/types';

export default function ChatInterface({ pdfText }: { pdfText: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          pdfText,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.answer || data.error, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Kuch error aaya. Dobara try karo!', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="card animate-fade-in flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="text-orange-500" size={20} />
          Ask Questions (Groq — Fast!)
        </h2>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-[200px] max-h-80 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">PDF upload karo aur koi bhi sawaal poochho! 🙋</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm relative group ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white rounded-tr-sm'
                : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button onClick={() => speakText(msg.content)} className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full p-1 shadow-sm">
                  <Volume2 size={10} className="text-orange-500" />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <Loader2 className="animate-spin text-orange-500" size={16} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Kuch bhi poochho PDF ke baare mein..."
          disabled={!pdfText}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-orange-400 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || !pdfText}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}