import React from 'react';
import { useAppStore } from '../../store/useStore';
import { generatePaymentMonth, formatCurrency, getMonthName } from '../../lib/utils';
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 shrink-0">
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
        <div className="bg-white p-2 md:p-3 rounded-2xl border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-amber-50/30">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Pendentes</p>
          <p className="text-lg md:text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
        </div>
        <div className="bg-white p-2 md:p-3 rounded-2xl border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-rose-50/30">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Atrasados</p>
          <p className="text-lg md:text-2xl font-bold text-rose-600">{delayedPayments.length}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-[#1A4531] p-3 md:p-4 rounded-2xl border border-[#23603A] shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-[#2E7A4A] opacity-20 blur-xl"></div>
          <p className="text-[10px] font-bold text-[#A3BCA7] uppercase tracking-wider mb-1 relative z-10">Arrecadado</p>
          <p className="text-xl md:text-2xl font-bold text-white relative z-10">{formatCurrency(collectedAmount)}</p>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0">

        {/* Monitor de Pagamentos — cards no mobile */}
        <div className="lg:hidden bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6]">
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Monitor de Pagamentos Recentes</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {sortedPayments.map(payment => {
              const member = members.find(m => m.id === payment.memberId);
              if (!member) return null;
              return (
                <div key={payment.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{member.whatsapp}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{paymentDateLabel(payment, member)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800 mb-1">{formatCurrency(payment.amount)}</p>
                    {statusBadge(payment.status)}
                  </div>
                </div>
              );
            })}
            {sortedPayments.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-slate-500">Nenhum pagamento registrado.</div>
            )}
          </div>
        </div>

        {/* Member/Payment List (70%) — tabela no desktop */}
        <div className="hidden lg:flex lg:w-2/3 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex-col min-h-[300px] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#F6F9F6]">
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Monitor de Pagamentos Recentes</h3>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Membro</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Data/Pgto</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Valor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#2F6A4F] uppercase tracking-wider border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedPayments.map(payment => {
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
                        {paymentDateLabel(payment, member)}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-2.5">{statusBadge(payment.status)}</td>
                    </tr>
                  );
                })}
                {sortedPayments.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">Nenhum pagamento registrado.</td></tr>
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
