import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Donation } from '../../types';
import { formatCurrency, generatePaymentMonth, getMonthName } from '../../lib/utils';
import { HeartHandshake, Trash2, User } from 'lucide-react';

export function Donations() {
  const { members, donations, deleteDonation } = useAppStore();

  const [view, setView] = useState<'geral' | 'mes'>('geral');
  const [selectedMonth, setSelectedMonth] = useState(generatePaymentMonth(new Date()));

  const filteredDonations = donations.filter(d =>
    view === 'mes' ? d.month === selectedMonth : true
  );

  const paidDonations = filteredDonations.filter(d => d.status === 'Pago');
  const totalPaid = paidDonations.reduce((acc, d) => acc + d.amount, 0);

  const grouped = members
    .map(member => ({
      member,
      list: paidDonations
        .filter(d => d.memberId === member.id)
        .sort((a, b) => b.month.localeCompare(a.month)),
    }))
    .filter(g => g.list.length > 0)
    .sort((a, b) => {
      const aTotal = a.list.reduce((acc, d) => acc + d.amount, 0);
      const bTotal = b.list.reduce((acc, d) => acc + d.amount, 0);
      return bTotal - aTotal;
    });

  const anonymous = paidDonations.filter(d => !d.memberId);

  const handleDelete = async (donation: Donation) => {
    if (!window.confirm(`Excluir doação de ${formatCurrency(donation.amount)} (${getMonthName(donation.month)})?`)) return;
    await deleteDonation(donation.id);
  };

  return (
    <div className="space-y-4">
      {/* Filtro Mês atual / Geral */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
          <button
            onClick={() => setView('geral')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === 'geral'
                ? 'bg-[#1A4531] text-white shadow-sm'
                : 'text-slate-500 hover:text-[#1A4531]'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setView('mes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === 'mes'
                ? 'bg-[#1A4531] text-white shadow-sm'
                : 'text-slate-500 hover:text-[#1A4531]'
            }`}
          >
            Mês Atual
          </button>
        </div>
        {view === 'mes' && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mês</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold text-[#1A4531] border-none outline-none bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Doado</p>
          <p className="text-xl md:text-2xl font-bold text-[#2E7A4A]">{formatCurrency(totalPaid)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{paidDonations.length} doação(ões)</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-[#F6F9F6]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doadores</p>
          <p className="text-xl md:text-2xl font-bold text-[#1A4531]">{grouped.length + (anonymous.length > 0 ? 1 : 0)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{grouped.length} membro(s){anonymous.length > 0 ? ' + avulsos' : ''}</p>
        </div>
      </div>

      {/* Membros que doaram */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex items-center justify-between">
          <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake size={14} className="text-[#2E7A4A]" />
            Membros que Doaram ({grouped.length})
          </h3>
          {view === 'mes' && (
            <span className="text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider">
              {getMonthName(selectedMonth)}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-50">
          {grouped.map(({ member, list }) => {
            const total = list.reduce((acc, d) => acc + d.amount, 0);
            return (
              <div key={member.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{list.length} doação(ões)</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#2E7A4A] shrink-0">{formatCurrency(total)}</p>
                </div>

                <div className="mt-3 space-y-2">
                  {list.map(donation => (
                    <div key={donation.id} className="flex items-center justify-between gap-3 pl-11">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 capitalize">{getMonthName(donation.month)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {donation.date.split('-').reverse().join('/')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-800">{formatCurrency(donation.amount)}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          PAGO
                        </span>
                        <button
                          onClick={() => handleDelete(donation)}
                          className="text-rose-400 hover:text-rose-600 transition-colors"
                          title="Excluir doação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {anonymous.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                    <User size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Doadores avulsos</p>
                    <p className="text-[10px] text-slate-400">{anonymous.length} doação(ões)</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#2E7A4A] shrink-0">
                  {formatCurrency(anonymous.reduce((acc, d) => acc + d.amount, 0))}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {anonymous.map(donation => (
                  <div key={donation.id} className="flex items-center justify-between gap-3 pl-11">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{donation.donorName || 'Doador anônimo'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {donation.date.split('-').reverse().join('/')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-800">{formatCurrency(donation.amount)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        PAGO
                      </span>
                      <button
                        onClick={() => handleDelete(donation)}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                        title="Excluir doação"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grouped.length === 0 && anonymous.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-slate-500">
              Nenhuma doação confirmada ainda. As doações são lançadas na página de detalhes do membro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
