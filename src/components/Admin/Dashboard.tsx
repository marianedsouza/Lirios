import React from 'react';
import { useAppStore } from '../../store/useStore';
import { generatePaymentMonth, formatCurrency } from '../../lib/utils';
import { BirthdayAlert } from './BirthdayAlert';

export function Dashboard() {
  const { members, payments } = useAppStore();
  
  const currentMonth = generatePaymentMonth(new Date());
  const currentMonthPayments = payments.filter(p => p.month === currentMonth);
  
  const activeMembers = members.filter(m => m.status === 'Ativo').length;
  
  const paidPayments = currentMonthPayments.filter(p => p.status === 'Pago');
  const pendingPayments = currentMonthPayments.filter(p => p.status === 'Pendente');
  const delayedPayments = currentMonthPayments.filter(p => p.status === 'Atrasado');

  const collectedAmount = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const expectedAmount = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const progressPercent = expectedAmount > 0 ? Math.min(100, (collectedAmount / expectedAmount) * 100) : 0;

  return (
    <>
      {/* Birthday Alert */}
      <BirthdayAlert />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Membros</p>
          <p className="text-2xl font-bold text-slate-800">{members.length}</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">● {activeMembers} Ativos</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pagos (Mês)</p>
          <p className="text-2xl font-bold text-emerald-600">{paidPayments.length}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-amber-500">{pendingPayments.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Aguardando vencimento</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Atrasados</p>
          <p className="text-2xl font-bold text-rose-500">{delayedPayments.length}</p>
          <p className="text-[10px] text-rose-400 mt-1 font-bold italic underline">Ação necessária</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm bg-emerald-50/30">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Arrecadado</p>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(collectedAmount)}</p>
          <p className="text-[10px] text-slate-400 mt-1 italic">Meta: {formatCurrency(expectedAmount)}</p>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Member/Payment List (70%) */}
        <div className="lg:w-2/3 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-[300px] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-slate-600">Monitor de Pagamentos Recentes</h3>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Membro</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Data/Pgto</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Valor</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentMonthPayments.slice().sort((a,b) => {
                  const sA = a.status === 'Atrasado' ? 0 : a.status === 'Pendente' ? 1 : 2;
                  const sB = b.status === 'Atrasado' ? 0 : b.status === 'Pendente' ? 1 : 2;
                  return sA - sB;
                }).map(payment => {
                  const member = members.find(m => m.id === payment.memberId);
                  if (!member) return null;
                  
                  const isAtrasado = payment.status === 'Atrasado';
                  return (
                    <tr key={payment.id} className={`hover:bg-slate-50 ${isAtrasado ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="text-xs font-bold text-slate-800">{member.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{member.whatsapp}</div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                        {payment.paymentDate ? payment.paymentDate.split('-').reverse().join('/') : `${member.dueDate}/${currentMonth.split('-')[1]}/${currentMonth.split('-')[0]}`}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-2.5">
                        {payment.status === 'Pago' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">PAGO</span>}
                        {payment.status === 'Pendente' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">PENDENTE</span>}
                        {payment.status === 'Atrasado' && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">ATRASADO</span>}
                      </td>
                    </tr>
                  )
                })}
                {currentMonthPayments.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">Nenhum pagamento registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick View / Analytics (30%) */}
        <div className="lg:w-1/3 flex flex-col space-y-4 shrink-0">
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-600 mb-4">Volume por Status</h3>
            <div className="space-y-4 flex-1">
              <div className="flex h-8 w-full rounded overflow-hidden">
                <div className="bg-emerald-500" style={{ width: `${(paidPayments.length / Math.max(1, currentMonthPayments.length)) * 100}%` }} title="Pagos"></div>
                <div className="bg-amber-400" style={{ width: `${(pendingPayments.length / Math.max(1, currentMonthPayments.length)) * 100}%` }} title="Pendentes"></div>
                <div className="bg-rose-500" style={{ width: `${(delayedPayments.length / Math.max(1, currentMonthPayments.length)) * 100}%` }} title="Atrasados"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span> Pagos</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span> Pendentes</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full inline-block"></span> Atrasados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
