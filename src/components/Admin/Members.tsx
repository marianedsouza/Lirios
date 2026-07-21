import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Member } from '../../types';
import { MemberForm } from './MemberForm';
import { MemberDetails } from './MemberDetails';

type FilterType = 'Todos' | 'Ativos' | 'Inativos' | 'Com Atraso';

export function Members() {
  const { members, payments } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('Todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  
  const [viewingMember, setViewingMember] = useState<Member | undefined>(undefined);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'Ativos') return member.status === 'Ativo';
    if (filter === 'Inativos') return member.status === 'Inativo';
    if (filter === 'Com Atraso') {
      return payments.some(p => p.memberId === member.id && p.status === 'Atrasado');
    }
    
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

  if (viewingMember) {
    return <MemberDetails member={viewingMember} onBack={() => setViewingMember(undefined)} />;
  }

  if (isFormOpen) {
    return <MemberForm member={editingMember} onBack={handleCloseForm} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">
      <div className="flex justify-between items-center shrink-0">
         <div></div>
         <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow hover:bg-emerald-700 transition-colors">
            + NOVO MEMBRO
         </button>
      </div>
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-600">Cadastro de Membros</h3>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Pesquisar membro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs border border-slate-200 rounded px-3 py-1 w-48 focus:outline-emerald-500 bg-slate-50"
            />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-emerald-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativos">Ativos</option>
              <option value="Inativos">Inativos</option>
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
                return (
                  <tr key={member.id} className={`hover:bg-slate-50 ${hasDelay ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-bold text-slate-800">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{member.whatsapp}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                      Dia {member.dueDate}
                    </td>
                    <td className="px-4 py-2.5 flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {member.status.toUpperCase()}
                      </span>
                      {hasDelay && (
                         <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">ATRASADO</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-3">
                         <button onClick={() => setViewingMember(member)} className="text-emerald-600 text-[10px] font-bold underline">Detalhes</button>
                         <button onClick={() => handleOpenForm(member)} className="text-emerald-600 text-[10px] font-bold underline">Editar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">
                    Nenhum membro encontrado com os filtros atuais.
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
