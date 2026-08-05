import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface GuidelinesAccordionProps {
  text: string;
}

/** Converte markdown simples (# título, **bold**, *itálico*, \n) para HTML seguro */
function parseMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => {
      // Título (# Texto)
      if (/^###\s/.test(line)) return `<h4 class="text-sm font-bold text-slate-800 mt-3 mb-1">${line.replace(/^###\s/, '')}</h4>`;
      if (/^##\s/.test(line))  return `<h3 class="text-base font-bold text-slate-900 mt-4 mb-1">${line.replace(/^##\s/, '')}</h3>`;
      if (/^#\s/.test(line))   return `<h2 class="text-lg font-bold text-emerald-800 mt-4 mb-2 border-b border-emerald-100 pb-1">${line.replace(/^#\s/, '')}</h2>`;
      // Linha vazia
      if (line.trim() === '') return '<br/>';
      // Bold e itálico inline
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return `<p class="text-sm text-slate-700 leading-relaxed">${formatted}</p>`;
    })
    .join('');
}

export function GuidelinesAccordion({ text }: GuidelinesAccordionProps) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-bold text-slate-600">Diretrizes da Casa</span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-slate-400" />
          : <ChevronDown size={16} className="text-slate-400" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100">
          <div
            className="prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
          />
        </div>
      )}
    </div>
  );
}
