import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Member } from '../../types';
import { MemberForm } from './MemberForm';
import { MemberDetails } from './MemberDetails';
import { BookOpen, Copy, Check, UserPlus, Trash2 } from 'lucide-react';

type FilterType = 'Todos' | 'Ativos' | 'Inativos' | 'Pendentes' | 'Com Atraso';

export function Members() {
  const { members, payments, settings, updateMember, deleteMember } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('Todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [viewingMember, setViewingMember] = useState<Member | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const pendingCount = members.filter(m => (m.status as string) === 'Pendente').length;

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/convite`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'Ativos') return member.status === 'Ativo';
    if (filter === 'Inativos') return member.status === 'Inativo';
    if (filter === 'Pendentes') return (member.status as string) === 'Pendente';
    if (filter === 'Com Atraso') return payments.some(p => p.memberId === member.id && p.status === 'Atrasado');
    return true;
  });

  const handleOpenForm = (member?: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingMember(undefined);
    setIsFormOpen(false);
  };

  const handleApprove = async (member: Member) => {
    await updateMember(member.id, { status: 'Ativo' });
  };

  const handleDelete = async (member: Member) => {
    if (!window.confirm(`Apagar "${member.name}" permanentemente? Todos os pagamentos associados também serão removidos.`)) return;
    await deleteMember(member.id);
  };

  if (viewingMember) {
    return <MemberDetails member={viewingMember} onBack={() => setViewingMember(undefined)} />;
  }

  if (isFormOpen) {
    return <MemberForm member={editingMember} onBack={handleCloseForm} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">

      {/* Barra de ações */}
      <div className="flex flex-wrap justify-between items-center gap-3 shrink-0">
        {/* Botão link de convite */}
        <button
          onClick={handleCopyInvite}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          {copied ? 'Link copiado!' : 'Copiar link de convite'}
        </button>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow hover:bg-emerald-700 transition-colors"
        >
          <UserPlus size={14} />
          NOVO MEMBRO
        </button>
      </div>

      {/* Aviso de membros pendentes */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 font-medium flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">{pendingCount}</span>
          {pendingCount === 1 ? 'membro aguarda aprovação.' : 'membros aguardam aprovação.'}
          <button onClick={() => setFilter('Pendentes')} className="underline text-amber-700 hover:text-amber-900">Ver pendentes</button>
        </div>
      )}

      {/* Diretrizes da Casa */}
      {settings.houseGuidelines && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={14} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-600">Diretrizes da Casa</h3>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{settings.houseGuidelines}</p>
          </div>
        </div>
      )}

      {/* Tabela de membros */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-600">Cadastro de Membros</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Pesquisar membro..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-xs border border-slate-200 rounded px-3 py-1 w-48 focus:outline-emerald-500 bg-slate-50"
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as FilterType)}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-emerald-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativos">Ativos</option>
              <option value="Inativos">Inativos</option>
              <option value="Pendentes">Pendentes</option>
              <option value="Com Atraso">Com Atraso</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Membro</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Vencimento</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Situação</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map(member => {
                const hasDelay = payments.some(p => p.memberId === member.id && p.status === 'Atrasado');
                const isPending = (member.status as string) === 'Pendente';
                return (
                  <tr key={member.id} className={`hover:bg-slate-50 ${isPending ? 'bg-amber-50/40' : hasDelay ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-bold text-slate-800">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{member.whatsapp}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                      Dia {member.dueDate}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPending ? 'bg-amber-100 text-amber-700' :
                          member.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {(member.status as string).toUpperCase()}
                        </span>
                        {hasDelay && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">ATRASADO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-3 flex-wrap items-center">
                        {isPending ? (
                          <button
                            onClick={() => handleApprove(member)}
                            className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 transition-colors"
                          >
                            Aprovar
                          </button>
                        ) : (
                          <button onClick={() => setViewingMember(member)} className="text-emerald-600 text-[10px] font-bold underline">Detalhes</button>
                        )}
                        <button onClick={() => handleOpenForm(member)} className="text-emerald-600 text-[10px] font-bold underline">Editar</button>
                        <button onClick={() => handleDelete(member)} className="text-rose-400 hover:text-rose-600 transition-colors" title="Apagar membro">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
