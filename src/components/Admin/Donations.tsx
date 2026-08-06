import React from 'react';
import { useAppStore } from '../../store/useStore';
import { Donation } from '../../types';
import { formatCurrency, getMonthName } from '../../lib/utils';
import { HeartHandshake, Check, Trash2, User } from 'lucide-react';

export function Donations() {
  const { members, donations, updateDonation, deleteDonation } = useAppStore();

  const paidDonations = donations.filter(d => d.status === 'Pago');
  const pendingDonations = donations.filter(d => d.status === 'Pendente');
  const totalPaid = paidDonations.reduce((acc, d) => acc + d.amount, 0);
  const totalPending = pendingDonations.reduce((acc, d) => acc + d.amount, 0);

  const grouped = members
    .map(member => ({
      member,
      list: donations
        .filter(d => d.memberId === member.id)
        .sort((a, b) => b.month.localeCompare(a.month)),
    }))
    .filter(g => g.list.length > 0)
    .sort((a, b) => {
      const aTotal = a.list.reduce((acc, d) => acc + d.amount, 0);
      const bTotal = b.list.reduce((acc, d) => acc + d.amount, 0);
      return bTotal - aTotal;
    });

  const anonymous = donations.filter(d => !d.memberId);

  const toggleStatus = async (donation: Donation) => {
    await updateDonation(donation.id, { status: donation.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  const handleDelete = async (donation: Donation) => {
    if (!window.confirm(`Excluir doação de ${formatCurrency(donation.amount)} (${getMonthName(donation.month)})?`)) return;
    await deleteDonation(donation.id);
  };

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doações Confirmadas</p>
          <p className="text-xl md:text-2xl font-bold text-[#2E7A4A]">{formatCurrency(totalPaid)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{paidDonations.length} doação(ões)</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-amber-50/30">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{pendingDonations.length} pendente(s)</p>
        </div>
      </div>

      {/* Membros que doaram */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex items-center justify-between">
          <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake size={14} className="text-[#2E7A4A]" />
            Membros que Doaram ({grouped.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-50">
          {grouped.map(({ member, list }) => {
            const total = list.reduce((acc, d) => acc + d.amount, 0);
            const paid = list.filter(d => d.status === 'Pago').length;
            return (
              <div key={member.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{list.length} doação(ões) · {paid} confirmada(s)</p>
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          donation.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {donation.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => toggleStatus(donation)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors"
                          title={donation.status === 'Pago' ? 'Marcar como pendente' : 'Marcar como pago'}
                        >
                          <Check size={14} />
                        </button>
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        donation.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {donation.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => toggleStatus(donation)}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        title={donation.status === 'Pago' ? 'Marcar como pendente' : 'Marcar como pago'}
                      >
                        <Check size={14} />
                      </button>
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
              Nenhuma doação registrada ainda. As doações são lançadas na página de detalhes do membro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
