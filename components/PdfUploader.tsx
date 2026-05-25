'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdf-extractor';

interface PdfUploaderProps {
  onTextExtracted: (text: string, fileName: string) => void;
}

export default function PdfUploader({ onTextExtracted }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Sirf PDF files allowed hain! / Only PDF files allowed!');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File 20MB se choti honi chahiye / File must be under 20MB');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      setUploadedFile(file.name);
      onTextExtracted(text, file.name);
    } catch (err: any) {
      setError(err.message || 'PDF read karne mein error aaya');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FileText className="text-orange-500" size={20} />
        Step 1: Upload Your PDF
      </h2>

      {uploadedFile ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <FileText className="text-green-500" size={20} />
          <span className="text-green-700 dark:text-green-300 text-sm font-medium flex-1 truncate">{uploadedFile}</span>
          <button
            onClick={() => { setUploadedFile(null); onTextExtracted('', ''); }}
            className="text-green-500 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-400 bg-orange-50 dark:bg-orange-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <p className="text-sm text-gray-500">PDF se text nikaal rahe hain...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="text-orange-400" size={32} />
              <p className="font-semibold text-gray-700 dark:text-gray-300">PDF yahan drop karo ya click karo</p>
              <p className="text-xs text-gray-400">Max 20MB • PDF only</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}