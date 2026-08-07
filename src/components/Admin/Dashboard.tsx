import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { generatePaymentMonth, formatCurrency, getMonthName } from '../../lib/utils';
import { BirthdayAlert } from './BirthdayAlert';
import { RefreshCw } from 'lucide-react';

export function Dashboard() {
  const { members, payments, donations, refreshData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };
  
  const currentMonth = generatePaymentMonth(new Date());
  const currentMonthPayments = payments.filter(p => p.month === currentMonth);
  
  const activeMembers = members.filter(m => m.status === 'Ativo').length;
  
  const paidPayments = currentMonthPayments.filter(p => p.status === 'Pago');
  const pendingPayments = currentMonthPayments.filter(p => p.status === 'Pendente');
  const delayedPayments = currentMonthPayments.filter(p => p.status === 'Atrasado');

  const collectedAmount = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const expectedAmount = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const paidDonations = donations.filter(d => d.status === 'Pago');
  const currentMonthPaidDonations = paidDonations.filter(d => d.month === currentMonth);
  const monthDonated = currentMonthPaidDonations.reduce((acc, d) => acc + d.amount, 0);
  const totalMonthCollected = collectedAmount + monthDonated;

  const donorNameFor = (d: { memberId: string | null; donorName: string }) => {
    const member = members.find(m => m.id === d.memberId);
    return member ? member.name : d.donorName || 'Doador anônimo';
  };

  const progressPercent = expectedAmount > 0 ? Math.min(100, (collectedAmount / expectedAmount) * 100) : 0;

  const sortedPayments = currentMonthPayments.slice().sort((a, b) => {
    const sA = a.status === 'Atrasado' ? 0 : a.status === 'Pendente' ? 1 : 2;
    const sB = b.status === 'Atrasado' ? 0 : b.status === 'Pendente' ? 1 : 2;
    return sA - sB;
  });

  const paymentDateLabel = (payment: any, member: any) =>
    payment.paymentDate
      ? payment.paymentDate.split('-').reverse().join('/')
      : `${member.dueDate}/${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}`;

  const statusBadge = (status: string) => {
    if (status === 'Pago') return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">PAGO</span>;
    if (status === 'Pendente') return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">PENDENTE</span>;
    return <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">ATRASADO</span>;
  };

  const monitorRows = [
    ...currentMonthPaidDonations.map(d => ({
      key: `d-${d.id}`,
      kind: 'doacao' as const,
      name: donorNameFor(d),
      whatsapp: '',
      dateLabel: d.date.split('-').reverse().join('/'),
      amount: d.amount,
      status: 'Pago',
    })),
    ...sortedPayments.map(p => {
      const member = members.find(m => m.id === p.memberId);
      if (!member) return null;
      return {
        key: `p-${p.id}`,
        kind: 'mensalidade' as const,
        name: member.name,
        whatsapp: member.whatsapp,
        dateLabel: paymentDateLabel(p, member),
        amount: p.amount,
        status: p.status,
      };
    }).filter(Boolean) as Array<{ key: string; kind: 'doacao' | 'mensalidade'; name: string; whatsapp: string; dateLabel: string; amount: number; status: string }>,
  ];

  return (
    <>
      {/* Birthday Alert */}
      <BirthdayAlert />

      {/* Month Label */}
      <div className="shrink-0">
        <p className="text-[10px] font-bold text-[#2F6A4F] uppercase tracking-widest">
          Resumo do Mês: {getMonthName(currentMonth)}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Membros</p>
          <p className="text-xl md:text-2xl font-bold text-[#1A4531]">{members.length}</p>
          <p className="text-[10px] text-[#2F6A4F] mt-1 font-bold">● {activeMembers} Ativos</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pagos</p>
          <p className="text-xl md:text-2xl font-bold text-[#2E7A4A]">{paidPayments.length}</p>
          <div className="w-full bg-[#EEF4F0] h-1.5 mt-2 rounded-full overflow-hidden">
            <div className="bg-[#2E7A4A] h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-amber-50/30">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-rose-50/30">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Atrasados</p>
          <p className="text-xl md:text-2xl font-bold text-rose-600">{delayedPayments.length}</p>
        </div>
      </div>

      {/* Arrecadado no mês — Mensalidade | Doação | Total */}
      <div className="bg-[#1A4531] rounded-2xl border border-[#23603A] shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-3 py-3 md:px-5 md:py-4 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-[#2E7A4A] opacity-20 blur-2xl"></div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 relative z-10">
          <div className="bg-[#23603A]/40 border border-white/10 rounded-xl px-2 py-2.5 md:py-3 text-center min-w-0">
            <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1">Mensalidade</p>
            <p className="text-sm md:text-xl font-bold text-white whitespace-nowrap tabular-nums">{formatCurrency(collectedAmount)}</p>
          </div>
          <div className="bg-[#23603A]/40 border border-white/10 rounded-xl px-2 py-2.5 md:py-3 text-center min-w-0">
            <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1">Doação</p>
            <p className="text-sm md:text-xl font-bold text-emerald-300 whitespace-nowrap tabular-nums">{formatCurrency(monthDonated)}</p>
          </div>
          <div className="bg-[#2E7A4A]/60 border border-[#A3BCA7]/30 rounded-xl px-2 py-2.5 md:py-3 text-center shadow-inner min-w-0">
            <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1">Total</p>
            <p className="text-sm md:text-xl font-bold text-white whitespace-nowrap tabular-nums">{formatCurrency(totalMonthCollected)}</p>
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0">

        {/* Monitor de Pagamentos — cards no mobile */}
        <div className="lg:hidden bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex items-center justify-between gap-3">
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Monitor de Pagamentos Recentes</h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[10px] font-bold text-[#2F6A4F] hover:text-[#1A4531] transition-colors disabled:opacity-50 shrink-0"
              title="Atualizar dados"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {monitorRows.map(row => (
              <div key={row.key} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800 truncate">{row.name}</p>
                  </div>
                  {row.whatsapp && <p className="text-[10px] text-slate-400 font-mono truncate">{row.whatsapp}</p>}
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{row.dateLabel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-800 mb-1">{formatCurrency(row.amount)}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    {statusBadge(row.status)}
                    {row.kind === 'doacao' && (
                      <span className="px-1.5 py-0.5 bg-[#1A4531] text-emerald-200 rounded text-[9px] font-bold uppercase tracking-wider">Doação</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {monitorRows.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-slate-500">Nenhum pagamento registrado.</div>
            )}
          </div>
        </div>

        {/* Member/Payment List (70%) — tabela no desktop */}
        <div className="hidden lg:flex lg:w-2/3 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex-col min-h-[300px] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#F6F9F6]">
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Monitor de Pagamentos Recentes</h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[10px] font-bold text-[#2F6A4F] hover:text-[#1A4531] transition-colors disabled:opacity-50 shrink-0"
              title="Atualizar dados"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Membro</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Tipo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Data/Pgto</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Valor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monitorRows.map(row => {
                  const isAtrasado = row.status === 'Atrasado';
                  return (
                    <tr key={row.key} className={`hover:bg-slate-50 ${isAtrasado ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="text-xs font-bold text-slate-800">{row.name}</div>
                        {row.whatsapp && <div className="text-[10px] text-slate-400 font-mono">{row.whatsapp}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.kind === 'mensalidade' && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mensalidade</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                        {row.dateLabel}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {statusBadge(row.status)}
                          {row.kind === 'doacao' && (
                            <span className="px-2 py-0.5 bg-[#1A4531] text-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">Doação</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {monitorRows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">Nenhum pagamento registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick View / Analytics (30%) */}
        <div className="lg:w-1/3 flex flex-col space-y-4 shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col">
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Volume por Status</h3>
            <div className="space-y-4 flex-1 mt-2">
              <div className="flex h-8 w-full rounded-xl overflow-hidden shadow-inner">
                <div className="bg-[#2E7A4A]" style={{ width: `${(paidPayments.length / Math.max(1, currentMonthPayments.length)) * 100}%` }} title="Pagos"></div>
                <div className="bg-amber-400" style={{ width: `${(pendingPayments.length / Math.max(1, currentMonthPayments.length)) * 100}%` }} title="Pendentes"></div>
                <div className="bg-rose-500" style={{ width: `${(delayedPayments.length / Math.max(1, currentMonthPayments.length)) * 100}%` }} title="Atrasados"></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#2F6A4F] font-bold uppercase tracking-wider pt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#2E7A4A] rounded-full inline-block shadow-sm"></span> Pagos</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block shadow-sm"></span> Pendentes</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block shadow-sm"></span> Atrasados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
