import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { formatCurrency, getMonthName } from '../../lib/utils';
import { CheckCircle, XCircle, Clock, User, Calendar, Filter, Bell } from 'lucide-react';

export function Receipts() {
  const { receipts, members, payments, approveReceipt, rejectReceipt } = useAppStore();
  const [filter, setFilter] = useState<'Todos' | 'Pendente' | 'Aprovado' | 'Rejeitado'>('Pendente');

  const filteredReceipts = filter === 'Todos' ? receipts : receipts.filter(r => r.status === filter);

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Desconhecido';
  };

  const getPaymentMonth = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    return payment?.month || '';
  };

  const handleApprove = async (receiptId: string) => {
    await approveReceipt(receiptId);
  };

  const handleReject = async (receiptId: string) => {
    await rejectReceipt(receiptId);
  };

  const pendingCount = receipts.filter(r => r.status === 'Pendente').length;

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-400" />
          <div className="flex bg-slate-100 p-1 rounded-md">
            {(['Pendente', 'Todos', 'Aprovado', 'Rejeitado'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                  filter === tab ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
                {tab === 'Pendente' && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <Bell size={14} className={pendingCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
            Alertas de Pagamento
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-medium">
              <p>Nenhum alerta {filter !== 'Todos' ? `com status "${filter}"` : 'encontrado'}.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReceipts.map(receipt => (
                <div key={receipt.id} className={`p-4 hover:bg-slate-50 transition-colors ${receipt.status === 'Pendente' ? 'bg-amber-50/50' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {receipt.status === 'Pendente' && <Bell size={12} className="text-amber-500" />}
                        <span className={
                          receipt.status === 'Aprovado' ? 'inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase' :
                          receipt.status === 'Rejeitado' ? 'inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase' :
                          'inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase'
                        }>
                          {receipt.status === 'Aprovado' ? <CheckCircle size={10} className="mr-1" /> :
                           receipt.status === 'Rejeitado' ? <XCircle size={10} className="mr-1" /> :
                           <Clock size={10} className="mr-1" />}
                          {receipt.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mb-1">{getMemberName(receipt.memberId)} informou pagamento</p>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {getMonthName(getPaymentMonth(receipt.paymentId))}
                        </span>
                        <span>Pago em: {receipt.paidAt.split('-').reverse().join('/')}</span>
                        <span className="font-bold text-slate-700">{formatCurrency(receipt.amount)}</span>
                      </div>
                      {receipt.reviewedBy && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {receipt.reviewedBy} {receipt.status === 'Aprovado' ? 'aceitou' : 'rejeitou'} em {receipt.reviewedAt?.split('T')[0].split('-').reverse().join('/')}
                        </p>
                      )}
                    </div>
                    {receipt.status === 'Pendente' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(receipt.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={10} />
                          PIX Recebido
                        </button>
                        <button
                          onClick={() => handleReject(receipt.id)}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1"
                        >
                          <XCircle size={10} />
                          Não Recebido
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
