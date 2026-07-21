import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { generatePaymentMonth, formatCurrency, getMonthName } from '../../lib/utils';
import { Printer, Users, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';

export function Reports() {
  const { members, payments, expenses } = useAppStore();
  const [view, setView] = useState<'mes' | 'geral'>('geral');
  const [selectedMonth, setSelectedMonth] = useState(generatePaymentMonth(new Date()));
  const [reportType, setReportType] = useState<'Pago' | 'Pendente' | 'Atrasado'>('Pago');

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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recebido</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCollected)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{allPaid.length} pagamentos confirmados</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-amber-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Receber</p>
              </div>
              <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalPending)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{allPending.length} pendentes</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Atraso</p>
              </div>
              <p className="text-2xl font-bold text-rose-500">{formatCurrency(totalDelayed)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{allDelayed.length} atrasados</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm bg-emerald-50/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-emerald-700" />
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Saldo Geral</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalReceived)}</p>
              <p className="text-[10px] text-slate-400 mt-1">Recebido - Despesas ({formatCurrency(totalExpenses)})</p>
            </div>
          </div>

          {/* Totals by Status per Month */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-600">Totais por Mês</h3>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Mês</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-center">Pago</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-center">Pendente</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-center">Atrasado</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-right">Valor Pago</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-right">Valor Pendente</th>
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
                          <span className="text-xs font-bold text-emerald-600">{mPaid.length}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold text-amber-500">{mPending.length}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold text-rose-500">{mDelayed.length}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-600">
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
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-800 uppercase">Total Geral</td>
                    <td className="px-4 py-2.5 text-center text-xs font-bold text-emerald-600">{allPaid.length}</td>
                    <td className="px-4 py-2.5 text-center text-xs font-bold text-amber-500">{allPending.length}</td>
                    <td className="px-4 py-2.5 text-center text-xs font-bold text-rose-500">{allDelayed.length}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-600">{formatCurrency(totalCollected)}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold text-amber-500">{formatCurrency(totalPending + totalDelayed)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Despesas */}
          {expenses.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-600">Despesas ({expenses.length})</h3>
              </div>
              <div className="overflow-y-auto max-h-60">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Descrição</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Data</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-right">Valor</th>
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
      )}

      {/* ─── POR MÊS ─────────────────────────────────────────── */}
      {view === 'mes' && (
        <>
          <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden print:shadow-none print:border-none">
            
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-slate-600">Filtros</h3>
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div className="flex space-x-1 bg-slate-100 p-1 rounded">
                {([
                  { value: 'Pago' as const, label: 'Pagos' },
                  { value: 'Pendente' as const, label: 'Pendentes' },
                  { value: 'Atrasado' as const, label: 'Atrasados' },
                ]).map(type => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${
                      reportType === type.value 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
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

            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest print:hidden">
                {reportType === 'Pago' ? 'Pagos' : reportType === 'Pendente' ? 'Pendentes' : 'Atrasados'}
              </h3>
              <div className="text-right flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 sticky top-0 z-10 print:static">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Membro</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">WhatsApp</th>
                     {reportType === 'Pago' ? (
                      <>
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Data Pgto</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Forma</th>
                      </>
                    ) : (
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Vencimento</th>
                    )}
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-right">Valor</th>
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
