import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Donation } from '../../types';
import { generatePaymentMonth, formatCurrency, getMonthName } from '../../lib/utils';
import { Printer, Users, CheckCircle, Clock, AlertTriangle, DollarSign, HeartHandshake, Trash2, Search } from 'lucide-react';

export function Reports() {
  const { members, payments, expenses, donations, deleteDonation } = useAppStore();
  const [view, setView] = useState<'mes' | 'geral'>('geral');
  const [selectedMonth, setSelectedMonth] = useState(generatePaymentMonth(new Date()));
  const [reportType, setReportType] = useState<'Pago' | 'Pendente' | 'Atrasado'>('Pago');

  const [donationView, setDonationView] = useState<'geral' | 'mes'>('geral');
  const [donationMonth, setDonationMonth] = useState(generatePaymentMonth(new Date()));
  const [donationSearch, setDonationSearch] = useState('');

  const [monthFilter, setMonthFilter] = useState(generatePaymentMonth(new Date()));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredPayments = view === 'mes'
    ? payments.filter(p => p.month === selectedMonth && p.status === reportType)
    : payments.filter(p => p.status === reportType);
  const totalAmount = filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const allPaid = payments.filter(p => p.status === 'Pago');
  const allPending = payments.filter(p => p.status === 'Pendente');
  const allDelayed = payments.filter(p => p.status === 'Atrasado');
  const totalCollected = allPaid.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = allPending.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDelayed = allDelayed.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceived = totalCollected - totalExpenses;

  const paidDonations = donations.filter(d => d.status === 'Pago');
  const donationMonths = [...new Set(paidDonations.map(d => d.month))].sort().reverse();
  const donationsByMonth = donationMonths.map(month => {
    const list = paidDonations.filter(d => d.month === month);
    return {
      month,
      count: list.length,
      total: list.reduce((acc, d) => acc + d.amount, 0),
    };
  });
  const donorName = (donation: Donation) => {
    if (donation.memberId) {
      const member = members.find(m => m.id === donation.memberId);
      if (member) return member.name;
    }
    return donation.donorName || 'Doador anônimo';
  };

  const scopePaidDonations = donationView === 'mes'
    ? paidDonations.filter(d => d.month === donationMonth)
    : paidDonations;
  const scopeDonationTotal = scopePaidDonations.reduce((acc, d) => acc + d.amount, 0);
  const scopeMensalidadeTotal = donationView === 'mes'
    ? payments.filter(p => p.month === donationMonth && p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0)
    : totalCollected;
  const scopeCombinedTotal = scopeMensalidadeTotal + scopeDonationTotal;

  const searchTerm = donationSearch.trim().toLowerCase();
  const searchedDonations = scopePaidDonations.filter(d =>
    !searchTerm ||
    donorName(d).toLowerCase().includes(searchTerm) ||
    (d.description || '').toLowerCase().includes(searchTerm)
  ).sort((a, b) => b.date.localeCompare(a.date));
  const searchedDonationTotal = searchedDonations.reduce((acc, d) => acc + d.amount, 0);

  const handleDeleteDonation = async (donation: Donation) => {
    if (!window.confirm(`Excluir doação de ${donation.donorName || donorName(donation)} (${formatCurrency(donation.amount)})?`)) return;
    await deleteDonation(donation.id);
  };

  // Receitas — Mensalidades e Doações
  const monthMensalidade = payments
    .filter(p => p.month === monthFilter && p.status === 'Pago')
    .reduce((a, p) => a + p.amount, 0);
  const monthDoacao = paidDonations
    .filter(d => d.month === monthFilter)
    .reduce((a, d) => a + d.amount, 0);
  const monthTotal = monthMensalidade + monthDoacao;

  const fromT = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : null;
  const toT = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null;
  const inRange = (dateStr: string | null) => {
    if (!dateStr) return false;
    const t = new Date(dateStr + 'T00:00:00').getTime();
    if (fromT !== null && t < fromT) return false;
    if (toT !== null && t > toT) return false;
    return true;
  };
  const hasDateFilter = fromT !== null || toT !== null;
  const geralMensalidade = (hasDateFilter ? allPaid.filter(p => inRange(p.paymentDate)) : allPaid)
    .reduce((a, p) => a + p.amount, 0);
  const geralDoacao = (hasDateFilter ? paidDonations.filter(d => inRange(d.date)) : paidDonations)
    .reduce((a, d) => a + d.amount, 0);
  const geralTotal = geralMensalidade + geralDoacao;

  const monthsWithPayments = [...new Set(payments.map(p => p.month))].sort().reverse();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">
      <div className="flex justify-between items-center shrink-0 print:hidden">
         <div className="flex bg-slate-100 p-1 rounded-md">
           {([
             { value: 'geral' as const, label: 'Geral' },
             { value: 'mes' as const, label: 'Por Mês' },
           ]).map(t => (
             <button
               key={t.value}
               onClick={() => setView(t.value)}
               className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                 view === t.value ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               {t.label}
             </button>
           ))}
         </div>
         <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Printer size={14} />
            IMPRIMIR
         </button>
      </div>

      {/* ─── VISÃO GERAL ─────────────────────────────────────── */}
      {view === 'geral' && (
        <>
          {/* Receitas — Mensalidades e Doações */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-slate-100 bg-[#1A4531]">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-300" />
                Receitas · Mensalidades e Doações
              </h3>
            </div>

            {/* Filtros */}
            <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex flex-col sm:flex-row flex-wrap items-end gap-2 print:hidden">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mês</label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">De</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                />
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Até</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                />
              </div>
              {hasDateFilter && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase"
                >
                  Limpar período
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              {/* Mês Atual */}
              <div className="bg-[#F6F9F6] border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider">Mês Atual</p>
                  <span className="text-[10px] font-bold text-[#2F6A4F] bg-white border border-slate-200 px-2 py-0.5 rounded capitalize">
                    {getMonthName(monthFilter)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mensalidade</p>
                    <p className="text-sm md:text-base font-bold text-[#1A4531] whitespace-nowrap tabular-nums">{formatCurrency(monthMensalidade)}</p>
                  </div>
                  <div className="text-center min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doação</p>
                    <p className="text-sm md:text-base font-bold text-[#2E7A4A] whitespace-nowrap tabular-nums">{formatCurrency(monthDoacao)}</p>
                  </div>
                  <div className="text-center min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="text-sm md:text-base font-bold text-slate-800 whitespace-nowrap tabular-nums">{formatCurrency(monthTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Geral */}
              <div className="bg-[#1A4531] border border-[#23603A] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider">Geral</p>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase">
                    {hasDateFilter ? 'Período filtrado' : 'Todo o período'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center min-w-0">
                    <p className="text-[9px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1">Mensalidade</p>
                    <p className="text-sm md:text-base font-bold text-white whitespace-nowrap tabular-nums">{formatCurrency(geralMensalidade)}</p>
                  </div>
                  <div className="text-center min-w-0">
                    <p className="text-[9px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1">Doação</p>
                    <p className="text-sm md:text-base font-bold text-emerald-300 whitespace-nowrap tabular-nums">{formatCurrency(geralDoacao)}</p>
                  </div>
                  <div className="text-center min-w-0">
                    <p className="text-[9px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1">Total</p>
                    <p className="text-sm md:text-base font-bold text-white whitespace-nowrap tabular-nums">{formatCurrency(geralTotal)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-[#2E7A4A]" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recebido</p>
              </div>
              <p className="text-2xl font-bold text-[#2E7A4A]">{formatCurrency(totalCollected)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{allPaid.length} pagamentos confirmados</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-amber-50/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-amber-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Receber</p>
              </div>
              <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalPending)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{allPending.length} pendentes</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-rose-50/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Atraso</p>
              </div>
              <p className="text-2xl font-bold text-rose-500">{formatCurrency(totalDelayed)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{allDelayed.length} atrasados</p>
            </div>
            <div className="bg-[#1A4531] p-4 rounded-2xl border border-[#23603A] shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-[#2E7A4A] opacity-20 blur-xl"></div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <DollarSign size={16} className="text-[#A3BCA7]" />
                <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider">Saldo Geral</p>
              </div>
              <p className="text-2xl font-bold text-white relative z-10">{formatCurrency(totalReceived)}</p>
              <p className="text-[10px] text-[#A3BCA7] mt-1 relative z-10">Recebido - Despesas ({formatCurrency(totalExpenses)})</p>
            </div>
          </div>

          {/* Totals by Status per Month */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col md:min-h-0 md:flex-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 shrink-0 bg-[#F6F9F6]">
              <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Totais por Mês</h3>
            </div>
            <div className="overflow-x-auto md:flex-1 md:overflow-y-auto">
              
              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100">
                {monthsWithPayments.map(month => {
                  const monthPayments = payments.filter(p => p.month === month);
                  const mPaid = monthPayments.filter(p => p.status === 'Pago');
                  const mPending = monthPayments.filter(p => p.status === 'Pendente');
                  const mDelayed = monthPayments.filter(p => p.status === 'Atrasado');
                  return (
                    <div key={month} className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#1A4531] capitalize">{getMonthName(month)}</span>
                        <span className="text-[11px] font-bold text-[#2E7A4A] bg-[#EEF4F0] px-2.5 py-1 rounded-md">
                          {formatCurrency(mPaid.reduce((a, c) => a + c.amount, 0))}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#EEF4F0] rounded-lg p-2 border border-[#EEF4F0]">
                          <p className="text-[9px] text-[#2F6A4F] uppercase font-bold tracking-wider mb-0.5">Pago</p>
                          <p className="text-xs font-bold text-[#1A4531]">{mPaid.length}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2 border border-amber-100/50">
                          <p className="text-[9px] text-amber-600 uppercase font-bold tracking-wider mb-0.5">Pendente</p>
                          <p className="text-xs font-bold text-amber-600">{mPending.length}</p>
                        </div>
                        <div className="bg-rose-50 rounded-lg p-2 border border-rose-100/50">
                          <p className="text-[9px] text-rose-600 uppercase font-bold tracking-wider mb-0.5">Atraso</p>
                          <p className="text-xs font-bold text-rose-600">{mDelayed.length}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">A Receber</span>
                        <span className="text-xs font-bold text-amber-500">
                          {formatCurrency(mPending.reduce((a, c) => a + c.amount, 0) + mDelayed.reduce((a, c) => a + c.amount, 0))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View */}
              <table className="hidden md:table w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Mês</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-center">Pago</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-center">Pendente</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-center">Atrasado</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-right">Valor Pago</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-right">Valor Pendente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {monthsWithPayments.map(month => {
                    const monthPayments = payments.filter(p => p.month === month);
                    const mPaid = monthPayments.filter(p => p.status === 'Pago');
                    const mPending = monthPayments.filter(p => p.status === 'Pendente');
                    const mDelayed = monthPayments.filter(p => p.status === 'Atrasado');
                    return (
                      <tr key={month} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-800 capitalize">{getMonthName(month)}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold text-[#2E7A4A]">{mPaid.length}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold text-amber-500">{mPending.length}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold text-rose-500">{mDelayed.length}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold text-[#2E7A4A]">
                          {formatCurrency(mPaid.reduce((a, c) => a + c.amount, 0))}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold text-amber-500">
                          {formatCurrency(mPending.reduce((a, c) => a + c.amount, 0) + mDelayed.reduce((a, c) => a + c.amount, 0))}
                        </td>
                      </tr>
                    );
                  })}
                  {monthsWithPayments.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">Nenhum pagamento registrado.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-[#F6F9F6] border-t border-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-[11px] font-bold text-[#1A4531] uppercase tracking-wider">Total Geral</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-[#2E7A4A]">{allPaid.length}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-amber-500">{allPending.length}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-rose-500">{allDelayed.length}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-[#2E7A4A]">{formatCurrency(totalCollected)}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-amber-500">{formatCurrency(totalPending + totalDelayed)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Despesas */}
          {expenses.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden shrink-0">
              <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6]">
                <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Despesas ({expenses.length})</h3>
              </div>
              <div className="overflow-x-auto md:max-h-60 md:overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Descrição</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Data</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-xs font-bold text-slate-800">{exp.description}</td>
                        <td className="px-4 py-2 text-[10px] text-slate-500 font-mono">{exp.date.split('-').reverse().join('/')}</td>
                        <td className="px-4 py-2 text-xs font-bold text-rose-600 text-right">{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-xs font-bold text-slate-800 uppercase">Total Despesas</td>
                      <td className="px-4 py-2 text-xs font-bold text-rose-600 text-right">{formatCurrency(totalExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Doações */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-slate-100 bg-[#1A4531] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake size={14} className="text-emerald-300" />
                Doações e Contribuições
              </h3>
              <span className="text-xs font-bold text-emerald-300">
                Total: {formatCurrency(scopeCombinedTotal)}
              </span>
            </div>

            {/* Filtros */}
            <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex flex-col sm:flex-row flex-wrap items-center gap-2">
              <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
                <button
                  onClick={() => setDonationView('geral')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    donationView === 'geral'
                      ? 'bg-[#1A4531] text-white shadow-sm'
                      : 'text-slate-500 hover:text-[#1A4531]'
                  }`}
                >
                  Geral
                </button>
                <button
                  onClick={() => setDonationView('mes')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    donationView === 'mes'
                      ? 'bg-[#1A4531] text-white shadow-sm'
                      : 'text-slate-500 hover:text-[#1A4531]'
                  }`}
                >
                  Mês Atual
                </button>
              </div>
              {donationView === 'mes' && (
                <input
                  type="month"
                  value={donationMonth}
                  onChange={e => setDonationMonth(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                />
              )}
              <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                <Search size={13} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Pesquisar doador..."
                  value={donationSearch}
                  onChange={e => setDonationSearch(e.target.value)}
                  className="flex-1 text-xs border-none outline-none bg-transparent"
                />
              </div>
            </div>

            {donationView === 'geral' && donationsByMonth.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="px-4 py-2 bg-[#EEF4F0]">
                  <p className="text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider">Doações por Mês</p>
                </div>
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-50">
                    {donationsByMonth.map(group => (
                      <tr key={group.month} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-xs font-bold text-slate-800 capitalize">{getMonthName(group.month)}</td>
                        <td className="px-4 py-2 text-[10px] text-slate-500">{group.count} doação(ões)</td>
                        <td className="px-4 py-2 text-xs font-bold text-[#2E7A4A] text-right">{formatCurrency(group.total)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="px-4 py-2 text-[10px] font-bold text-slate-800 uppercase">Total</td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-xs font-bold text-[#2E7A4A] text-right">{formatCurrency(scopeDonationTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="overflow-x-auto md:max-h-60 md:overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Doador</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Descrição</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Mês</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Data</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-right">Valor</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {searchedDonations.map(donation => (
                    <tr key={donation.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-xs font-bold text-slate-800">{donorName(donation)}</td>
                      <td className="px-4 py-2 text-[10px] text-slate-500">{donation.description || '—'}</td>
                      <td className="px-4 py-2 text-[10px] text-slate-600 font-mono capitalize">{getMonthName(donation.month)}</td>
                      <td className="px-4 py-2 text-[10px] text-slate-500 font-mono">{donation.date.split('-').reverse().join('/')}</td>
                      <td className="px-4 py-2 text-xs font-bold text-[#2E7A4A] text-right">{formatCurrency(donation.amount)}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleDeleteDonation(donation)}
                          className="text-rose-400 hover:text-rose-600 transition-colors"
                          title="Excluir doação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {searchedDonations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">Nenhuma doação encontrada para este filtro.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold text-slate-800 uppercase">Total</td>
                    <td className="px-4 py-2 text-xs font-bold text-[#2E7A4A] text-right">{formatCurrency(searchedDonationTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── POR MÊS ─────────────────────────────────────────── */}
      {view === 'mes' && (
        <>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col md:flex-1 md:min-h-0 overflow-hidden print:shadow-none print:border-none">
            
            <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Filtros</h3>
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A] font-mono flex-1 sm:flex-none"
                />
              </div>
              <div className="flex space-x-1 bg-[#EEF4F0] p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                {([
                  { value: 'Pago' as const, label: 'Pagos' },
                  { value: 'Pendente' as const, label: 'Pendentes' },
                  { value: 'Atrasado' as const, label: 'Atrasados' },
                ]).map(type => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                      reportType === type.value 
                        ? 'bg-white text-[#1A4531] shadow-sm' 
                        : 'text-[#2F6A4F] hover:text-[#1A4531]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden print:block text-center pt-8 mb-8 border-b pb-4 shrink-0">
              <h1 className="text-2xl font-bold font-sans">Centro Espírita Lírios do Pântano</h1>
              <h2 className="text-lg mt-1 font-bold text-slate-600">Relatório de Mensalidades - {reportType === 'Pago' ? 'Pagos' : reportType === 'Pendente' ? 'Pendentes' : 'Atrasados'}</h2>
              <p className="text-sm text-slate-500 capitalize font-mono mt-2">Mês ref: {getMonthName(selectedMonth)}</p>
            </div>

            <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-[#2F6A4F] uppercase tracking-widest print:hidden">
                {reportType === 'Pago' ? 'Pagos' : reportType === 'Pendente' ? 'Pendentes' : 'Atrasados'}
              </h3>
              <div className="text-right flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                <span className="text-lg font-bold text-[#2E7A4A]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="overflow-x-auto md:flex-1 md:overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-white sticky top-0 z-10 print:static shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Membro</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">WhatsApp</th>
                     {reportType === 'Pago' ? (
                      <>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Data Pgto</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Forma</th>
                      </>
                    ) : (
                      <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Vencimento</th>
                    )}
                    <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.map(payment => {
                    const member = members.find(m => m.id === payment.memberId);
                    if (!member) return null;
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50 print:border-b print:border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{member.name}</td>
                        <td className="px-4 py-2.5 text-[10px] text-slate-500 font-mono">{member.whatsapp}</td>
                        {reportType === 'Pago' ? (
                          <>
                            <td className="px-4 py-2.5 text-xs text-slate-600 font-mono">{payment.paymentDate?.split('-').reverse().join('/')}</td>
                            <td className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase">{payment.method}</td>
                          </>
                        ) : (
                          <td className="px-4 py-2.5 text-xs text-slate-600 font-mono">Dia {member.dueDate}</td>
                        )}
                        <td className="px-4 py-2.5 text-right text-xs font-bold text-slate-800">{formatCurrency(payment.amount)}</td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                        Nenhum registro encontrado para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          main, .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto !important;
            overflow: visible !important;
            visibility: visible;
          }
          .bg-white * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
