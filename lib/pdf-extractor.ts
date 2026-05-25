'use client';

export async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import pdfjs
  const pdfjsLib = await import('pdfjs-dist');

  // ✅ Use local worker bundled with Next.js — avoids CDN fetch error
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }

  if (!fullText.trim()) {
    throw new Error('PDF se text nahi nikla. Ye scanned/image PDF ho sakta hai.');
  }

  return fullText.trim().slice(0, 15000);
}