import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronDown } from 'lucide-react';
import { Aviso } from '../types';
import { avisosApi } from '../lib/api';
import { parseMarkdown } from './GuidelinesAccordion';

interface AvisosAccordionProps {
  memberId: string;
}

export function AvisosAccordion({ memberId }: AvisosAccordionProps) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openOverride, setOpenOverride] = useState<Record<string, boolean>>({});
  const [localRead, setLocalRead] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    avisosApi
      .list(memberId)
      .then(list => {
        if (!cancelled) {
          setAvisos(list as Aviso[]);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (loaded && avisos.length === 0) return null;

  const isRead = (id: string) => !!localRead[id] || !!avisos.find(a => a.id === id)?.isRead;
  const isOpen = (id: string) => (id in openOverride ? openOverride[id] : !isRead(id));
  const hasUnread = avisos.some(a => !isRead(a.id));

  const toggle = (id: string) => {
    const next = !isOpen(id);
    setOpenOverride(prev => ({ ...prev, [id]: next }));
    if (next && !isRead(id)) {
      setLocalRead(prev => ({ ...prev, [id]: true }));
      avisosApi.markRead(id, memberId).catch(() => {});
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-[#F6F9F6] flex items-center gap-2">
        <Megaphone size={16} className="text-[#2E7A4A]" />
        <h3 className="text-sm font-bold text-[#1A4531] uppercase tracking-wider">Avisos</h3>
        {hasUnread && (
          <span className="inline-flex items-center text-[9px] font-bold text-white bg-[#2E7A4A] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Novo
          </span>
        )}
        {!loaded && <span className="text-[10px] text-slate-400 ml-auto">Carregando...</span>}
      </div>
      <div className="divide-y divide-slate-100">
        {avisos.map(aviso => {
          const open = isOpen(aviso.id);
          const read = isRead(aviso.id);
          return (
            <div key={aviso.id}>
              <button
                type="button"
                onClick={() => toggle(aviso.id)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {!read && (
                    <span className="inline-flex items-center text-[9px] font-bold text-white bg-[#2E7A4A] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Novo
                    </span>
                  )}
                  <span className="text-sm font-bold text-[#1A4531] truncate">{aviso.title}</span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && aviso.content && (
                <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-slate-50 bg-slate-50/30">
                  <div
                    className="prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(aviso.content) }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
