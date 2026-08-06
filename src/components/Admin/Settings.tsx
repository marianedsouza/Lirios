import React, { useState, useEffect, useRef } from 'react';
import { Save, DollarSign, BookOpen, Bold, Italic, Heading, Megaphone, Trash2, Pencil } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { GuidelinesAccordion } from '../GuidelinesAccordion';
import { Aviso } from '../../types';

export function Settings() {
  const { settings, updateSettings, avisos, addAviso, updateAviso, deleteAviso } = useAppStore();

  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(settings.defaultMonthlyFee.toString());
  const [defaultDueDate, setDefaultDueDate] = useState(settings.defaultDueDate.toString());
  const [houseGuidelines, setHouseGuidelines] = useState(settings.houseGuidelines);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [avisoTitle, setAvisoTitle] = useState('');
  const [avisoContent, setAvisoContent] = useState('');
  const [editingAvisoId, setEditingAvisoId] = useState<string | null>(null);
  const [avisoSaving, setAvisoSaving] = useState(false);

  useEffect(() => {
    setDefaultMonthlyFee(settings.defaultMonthlyFee.toString());
    setDefaultDueDate(settings.defaultDueDate.toString());
    setHouseGuidelines(settings.houseGuidelines);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      defaultMonthlyFee: parseFloat(defaultMonthlyFee) || 0,
      defaultDueDate: parseInt(defaultDueDate) || 10,
      houseGuidelines,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = houseGuidelines.slice(start, end) || 'texto';
    const newValue =
      houseGuidelines.slice(0, start) +
      prefix + selected + suffix +
      houseGuidelines.slice(end);
    setHouseGuidelines(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const insertHeading = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = houseGuidelines.slice(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const newValue = houseGuidelines.slice(0, lineStart) + '# ' + houseGuidelines.slice(lineStart);
    setHouseGuidelines(newValue);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(lineStart + 2, lineStart + 2); }, 0);
  };

  const startEditAviso = (aviso: Aviso) => {
    setEditingAvisoId(aviso.id);
    setAvisoTitle(aviso.title);
    setAvisoContent(aviso.content);
  };

  const cancelEditAviso = () => {
    setEditingAvisoId(null);
    setAvisoTitle('');
    setAvisoContent('');
  };

  const handleSaveAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avisoTitle.trim()) return;
    setAvisoSaving(true);
    try {
      if (editingAvisoId) {
        await updateAviso(editingAvisoId, { title: avisoTitle.trim(), content: avisoContent });
      } else {
        await addAviso({ title: avisoTitle.trim(), content: avisoContent });
      }
      cancelEditAviso();
    } finally {
      setAvisoSaving(false);
    }
  };

  const handleDeleteAviso = async (aviso: Aviso) => {
    if (!window.confirm(`Excluir o aviso "${aviso.title}"?`)) return;
    await deleteAviso(aviso.id);
    if (editingAvisoId === aviso.id) cancelEditAviso();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Mensalidade e Vencimento */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <DollarSign className="text-emerald-600" size={20} />
            <h3 className="text-sm font-bold text-slate-700">Mensalidade</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor Padrão (R$)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={defaultMonthlyFee}
                    onChange={e => setDefaultMonthlyFee(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dia de Vencimento</label>
                  <input
                    type="number" min="1" max="31"
                    value={defaultDueDate}
                    onChange={e => setDefaultDueDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Valor e vencimento padrão para novos membros.</p>
            </div>
          </div>
        </div>

        {/* Diretrizes da Casa */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BookOpen className="text-emerald-600" size={20} />
              <h3 className="text-sm font-bold text-slate-700">Diretrizes da Casa</h3>
            </div>
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase transition-colors"
            >
              {preview ? 'Editar' : 'Pré-visualizar'}
            </button>
          </div>
          <div className="p-6 max-w-2xl space-y-3">
            {!preview ? (
              <>
                {/* Toolbar de formatação */}
                <div className="flex items-center gap-1 border border-slate-200 rounded px-2 py-1 bg-slate-50 w-fit">
                  <button
                    type="button"
                    onClick={() => wrapSelection('**', '**')}
                    title="Negrito (**texto**)"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapSelection('*', '*')}
                    title="Itálico (*texto*)"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
                  >
                    <Italic size={13} />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={insertHeading}
                    title="Título (# Texto)"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
                  >
                    <Heading size={13} />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={houseGuidelines}
                  onChange={e => setHouseGuidelines(e.target.value)}
                  rows={10}
                  placeholder={"# Título principal\n\n**Regra 1:** Descrição da regra.\n\n*Observação:* Texto em itálico.\n\n## Subtítulo\n\nMais texto aqui..."}
                  className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500 resize-none leading-relaxed"
                />
                <p className="text-[10px] text-slate-400">
                  Use <code className="bg-slate-100 px-1 rounded"># Título</code>, <code className="bg-slate-100 px-1 rounded">**negrito**</code> e <code className="bg-slate-100 px-1 rounded">*itálico*</code>.
                </p>
              </>
            ) : (
              <GuidelinesAccordion text={houseGuidelines} />
            )}
          </div>
        </div>

        <div className="pb-6">
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Save size={14} />
            {saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
          </button>
        </div>
      </form>

      {/* Avisos */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Megaphone className="text-emerald-600" size={20} />
          <h3 className="text-sm font-bold text-slate-700">Avisos</h3>
        </div>
        <div className="p-6 max-w-2xl space-y-4">
          <p className="text-[10px] text-slate-400">
            Os avisos aparecem no portal do membro. Avisos novos (não lidos) ficam abertos para cada membro até serem lidos.
          </p>

          <div className="space-y-2">
            {avisos.length === 0 && (
              <p className="text-xs text-slate-400">Nenhum aviso criado ainda.</p>
            )}
            {avisos.map(aviso => (
              <div key={aviso.id} className="border border-slate-100 rounded-lg p-3 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{aviso.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {aviso.createdAt ? new Date(aviso.createdAt).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditAviso(aviso)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 uppercase transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAviso(aviso)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase transition-colors"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSaveAviso} className="space-y-3 border-t border-slate-100 pt-4">
            <input
              type="text"
              value={avisoTitle}
              onChange={e => setAvisoTitle(e.target.value)}
              placeholder="Título do aviso"
              className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500"
            />
            <textarea
              value={avisoContent}
              onChange={e => setAvisoContent(e.target.value)}
              rows={4}
              placeholder={"Conteúdo do aviso. Você pode usar # Título, **negrito** e *itálico*."}
              className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500 resize-none leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={avisoSaving || !avisoTitle.trim()}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {editingAvisoId ? 'Salvar Alterações' : 'Criar Aviso'}
              </button>
              {editingAvisoId && (
                <button
                  type="button"
                  onClick={cancelEditAviso}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
