import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Donation } from '../../types';
import { generatePaymentMonth, formatCurrency, getMonthName } from '../../lib/utils';
import { Printer, Users, CheckCircle, Clock, AlertTriangle, DollarSign, HeartHandshake, Trash2, TrendingDown, ListChecks, ChevronDown } from 'lucide-react';

export function Reports() {
  const { members, payments, expenses, donations, deleteDonation } = useAppStore();

  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'mensalidade' | 'doacao'>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [yearOverride, setYearOverride] = useState<Record<string, boolean>>({});

  const allPaid = payments.filter(p => p.status === 'Pago');
  const allPending = payments.filter(p => p.status === 'Pendente');
  const allDelayed = payments.filter(p => p.status === 'Atrasado');
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const paidDonations = donations.filter(d => d.status === 'Pago');
  const donorName = (donation: Donation) => {
    if (donation.memberId) {
      const member = members.find(m => m.id === donation.memberId);
      if (member) return member.name;
    }
    return donation.donorName || 'Doador anônimo';
  };

  const handleDeleteDonation = async (donation: Donation) => {
    if (!window.confirm(`Excluir doação de ${donation.donorName || donorName(donation)} (${formatCurrency(donation.amount)})?`)) return;
    await deleteDonation(donation.id);
  };

  // Filtros — mês (opcional) e período (De/Até)
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

  const monthSelected = monthFilter !== '';
  const inMonth = (m: string) => !monthSelected || m === monthFilter;
  const yearSelected = yearFilter !== '';
  const inRangeMonth = (m: string) => {
    if (fromT === null && toT === null) return true;
    const t = new Date(m + '-01T00:00:00').getTime();
    if (fromT !== null && t < fromT) return false;
    if (toT !== null && t > toT) return false;
    return true;
  };
  const listItemInFilter = (month: string, date: string | null, kind: 'mensalidade' | 'doacao') =>
    inMonth(month) &&
    (!yearSelected || month.startsWith(yearFilter)) &&
    (typeFilter === 'todos' || typeFilter === kind) &&
    (!hasDateFilter || (date ? inRange(date) : inRangeMonth(month)));

  const allMonthKeys = [...new Set([...payments.map(p => p.month), ...donations.map(d => d.month)])];
  const availableYears = [...new Set(allMonthKeys.map(m => m.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  const availableMonths = allMonthKeys
    .filter(m => !yearSelected || m.startsWith(yearFilter))
    .sort((a, b) => b.localeCompare(a));

  const filteredPaid = allPaid.filter(p => listItemInFilter(p.month, p.paymentDate, 'mensalidade'));
  const filteredPending = allPending.filter(p => listItemInFilter(p.month, null, 'mensalidade'));
  const filteredDelayed = allDelayed.filter(p => listItemInFilter(p.month, null, 'mensalidade'));
  const filteredPaidDonations = paidDonations.filter(d => listItemInFilter(d.month, d.date, 'doacao'));
  const filteredExpenses = hasDateFilter ? expenses.filter(e => inRange(e.date)) : expenses;

  const cardMensalidade = filteredPaid.reduce((a, p) => a + p.amount, 0);
  const cardSaida = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const cardReceber = filteredPending.reduce((a, p) => a + p.amount, 0);
  const cardAtrasado = filteredDelayed.reduce((a, p) => a + p.amount, 0);
  const cardDoacoes = filteredPaidDonations.reduce((a, d) => a + d.amount, 0);
  const cardTotal = cardMensalidade + cardDoacoes;

  // Lista de pagamentos e doações por ano e mês
  type ListRow = {
    key: string;
    year: string;
    month: string;
    kind: 'mensalidade' | 'doacao';
    name: string;
    status: string;
    dateLabel: string;
    amount: number;
    description?: string;
    donationId?: string;
  };
  const listRows: ListRow[] = [
    ...payments
      .filter(p => listItemInFilter(p.month, p.status === 'Pago' ? p.paymentDate : null, 'mensalidade'))
      .map(p => {
        const member = members.find(m => m.id === p.memberId);
        return {
          key: `p-${p.id}`,
          year: p.month.slice(0, 4),
          month: p.month,
          kind: 'mensalidade' as const,
          name: member?.name || 'Membro',
          status: p.status,
          dateLabel: p.status === 'Pago' && p.paymentDate
            ? p.paymentDate.split('-').reverse().join('/')
            : `Dia ${member?.dueDate ?? '—'}`,
          amount: p.amount,
        };
      }),
    ...donations
      .filter(d => listItemInFilter(d.month, d.status === 'Pago' ? d.date : null, 'doacao'))
      .map(d => ({
        key: `d-${d.id}`,
        year: d.month.slice(0, 4),
        month: d.month,
        kind: 'doacao' as const,
        name: donorName(d),
        status: d.status,
        dateLabel: d.date.split('-').reverse().join('/'),
        amount: d.amount,
        description: d.description || '',
        donationId: d.id,
      })),
  ].sort((a, b) => b.month.localeCompare(a.month));

  const listByYear = listRows.reduce<Record<string, Record<string, ListRow[]>>>((acc, r) => {
    (acc[r.year] = acc[r.year] || {});
    (acc[r.year][r.month] = acc[r.year][r.month] || []).push(r);
    return acc;
  }, {});
  const listYears = Object.keys(listByYear).sort((a, b) => b.localeCompare(a));
  const monthsOf = (year: string) => Object.keys(listByYear[year]).sort((a, b) => b.localeCompare(a));
  const isYearOpen = (year: string) => {
    const hasUnpaid = Object.values(listByYear[year]).some(ms => ms.some(r => r.status !== 'Pago'));
    return year in yearOverride ? yearOverride[year] : hasUnpaid;
  };
  const toggleYear = (year: string) => {
    setYearOverride(prev => ({ ...prev, [year]: !isYearOpen(year) }));
  };

  const statusTag = (row: ListRow) => {
    if (row.kind === 'doacao') {
      return <span className="px-1.5 py-0.5 bg-[#1A4531] text-emerald-200 rounded text-[9px] font-bold uppercase tracking-wider">Doação</span>;
    }
    if (row.status === 'Pago') return <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase tracking-wider">Pago</span>;
    if (row.status === 'Pendente') return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold uppercase tracking-wider">Pendente</span>;
    return <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold uppercase tracking-wider">Atrasado</span>;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">
      <div className="flex justify-end items-center shrink-0 print:hidden">
         <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Printer size={14} />
            IMPRIMIR
         </button>
      </div>

      {/* ─── VISÃO GERAL ─────────────────────────────────────── */}
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
            <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6] flex flex-wrap items-end gap-x-6 gap-y-3 print:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as 'todos' | 'mensalidade' | 'doacao')}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                >
                  <option value="todos">Todos</option>
                  <option value="mensalidade">Mensalidade</option>
                  <option value="doacao">Doação</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ano</label>
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                >
                  <option value="">Todos</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Mês</label>
                <select
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  className="flex-1 min-w-0 w-full sm:w-auto text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                >
                  <option value="">Todos</option>
                  {availableMonths.map(m => <option key={m} value={m}>{getMonthName(m)} {m.slice(0, 4)}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

            {/* Cards de valores */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              <div className="bg-[#EEF4F0] border border-[#A3BCA7]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-[#2E7A4A]" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mensalidade</p>
                </div>
                <p className="text-xl font-bold text-[#1A4531]">{formatCurrency(cardMensalidade)}</p>
                <p className="text-[10px] text-slate-400 mt-1">{filteredPaid.length} pagamentos confirmados</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={16} className="text-rose-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">De Saída</p>
                </div>
                <p className="text-xl font-bold text-rose-500">{formatCurrency(cardSaida)}</p>
                <p className="text-[10px] text-slate-400 mt-1">{filteredExpenses.length} despesas</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Receber</p>
                </div>
                <p className="text-xl font-bold text-amber-500">{formatCurrency(cardReceber)}</p>
                <p className="text-[10px] text-slate-400 mt-1">{filteredPending.length} pendentes</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-rose-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Atraso</p>
                </div>
                <p className="text-xl font-bold text-rose-500">{formatCurrency(cardAtrasado)}</p>
                <p className="text-[10px] text-slate-400 mt-1">{filteredDelayed.length} atrasados</p>
              </div>
              <div className="bg-[#1A4531] p-4 rounded-xl border border-[#23603A] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-2">
                  <HeartHandshake size={16} className="text-[#A3BCA7]" />
                  <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider">Doações</p>
                </div>
                <p className="text-xl font-bold text-emerald-300">{formatCurrency(cardDoacoes)}</p>
                <p className="text-[10px] text-[#A3BCA7] mt-1">{filteredPaidDonations.length} doações</p>
              </div>
              <div className="bg-[#1A4531] p-4 rounded-xl border border-[#23603A] shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-[#2E7A4A] opacity-20 blur-xl"></div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <DollarSign size={16} className="text-[#A3BCA7]" />
                  <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider">Total</p>
                </div>
                <p className="text-xl font-bold text-white relative z-10">{formatCurrency(cardTotal)}</p>
                <p className="text-[10px] text-[#A3BCA7] mt-1 relative z-10">Mensalidade + Doações</p>
              </div>
            </div>
          </div>

          {/* Pagamentos e Doações por Ano — acordeão */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col md:min-h-0 md:flex-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-[#1A4531] flex items-center justify-between gap-2 shrink-0">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ListChecks size={14} className="text-emerald-300" />
                Pagamentos e Doações por Ano
              </h3>
              <span className="text-xs font-bold text-emerald-300">
                Total: {formatCurrency(cardTotal)}
              </span>
            </div>

            {listYears.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-slate-500">Nenhum registro encontrado para este filtro.</div>
            )}

            <div className="divide-y divide-slate-100">
              {listYears.map(year => {
                const yearRows = Object.values(listByYear[year]).flat();
                const yearUnpaid = yearRows.filter(r => r.status !== 'Pago').length;
                return (
                  <div key={year}>
                    <button
                      type="button"
                      onClick={() => toggleYear(year)}
                      className="w-full px-4 py-3 bg-[#F6F9F6] flex items-center justify-between gap-3 text-left hover:bg-[#F0F6F1] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-[#1A4531]">{year}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          yearUnpaid > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-[#EEF4F0] text-[#2F6A4F]'
                        }`}>
                          {yearUnpaid > 0 ? `${yearUnpaid} em aberto` : 'Em dia'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(yearRows.reduce((a, r) => a + r.amount, 0))}</span>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${isYearOpen(year) ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isYearOpen(year) && (
                      <div className="divide-y divide-slate-100">
                        {monthsOf(year).map(month => {
                          const monthRows = listByYear[year][month];
                          return (
                            <div key={month}>
                              <div className="px-4 sm:px-6 py-2 bg-white flex items-center justify-between border-b border-slate-100">
                                <span className="text-[11px] font-bold text-[#2F6A4F] uppercase tracking-wider capitalize">{getMonthName(month)}</span>
                                <span className="text-[11px] font-bold text-slate-700">{formatCurrency(monthRows.reduce((a, r) => a + r.amount, 0))}</span>
                              </div>
                              <div className="divide-y divide-slate-50 bg-slate-50/30">
                                {monthRows.map(row => (
                                  <div key={row.key} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4 sm:px-6 py-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs font-bold text-slate-800 truncate">{row.name}</p>
                                        {statusTag(row)}
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        {row.dateLabel}
                                        {row.description ? ` · ${row.description}` : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-sm font-bold text-slate-800">{formatCurrency(row.amount)}</span>
                                      {row.donationId && (
                                        <button
                                          onClick={() => {
                                            const d = donations.find(x => x.id === row.donationId);
                                            if (d) handleDeleteDonation(d);
                                          }}
                                          className="text-rose-400 hover:text-rose-600 transition-colors"
                                          title="Excluir doação"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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

        </>
      
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
