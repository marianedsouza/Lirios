import React, { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { formatCurrency, getMonthName } from '../lib/utils';
import { LogOut, Calendar, MessageSquare, CheckCircle, Clock, AlertTriangle, X, QrCode, Copy } from 'lucide-react';

interface MemberPortalProps {
  memberId: string;
  onLogout: () => void;
}

export function MemberPortal({ memberId, onLogout }: MemberPortalProps) {
  const { members, getMemberPayments } = useAppStore();
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);

  const member = members.find(m => m.id === memberId);
  const payments = getMemberPayments(memberId);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4 font-bold">Membro não encontrado.</p>
          <button onClick={onLogout} className="text-emerald-600 font-bold underline">Voltar</button>
        </div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status !== 'Pago');
  
  const selectedPixPayment = payments.find(p => p.id === pixPaymentId);
  // Manual PIX code simulation
  const pixCode = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${selectedPixPayment?.amount.toString().replace('.','').padStart(4, '0')}5802BR5926HUGO DANIEL RIBEIRO NANTES6009SAO PAULO62070503***63041A2B`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="h-16 bg-emerald-900 text-white shadow-md z-10 shrink-0">
        <div className="max-w-4xl mx-auto px-6 h-full flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lírios do Pântano</h1>
            <p className="text-emerald-300 text-[10px] uppercase tracking-widest font-bold mt-0.5">Portal do Membro</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 text-emerald-400 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 space-y-6 relative">
        
        {/* PIX Modal */}
        {pixPaymentId && selectedPixPayment && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 flex flex-col items-center relative">
              <button onClick={() => setPixPaymentId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Pagamento via PIX</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider font-bold">Mensalidade: {getMonthName(selectedPixPayment.month)}</p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-col items-center w-full">
                <div className="w-48 h-48 bg-white border border-slate-200 rounded flex items-center justify-center mb-4 relative">
                  <QrCode size={120} className="text-slate-300" />
                  <span className="absolute text-[10px] font-bold text-slate-400">QR CODE AQUI</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mb-2">{formatCurrency(selectedPixPayment.amount)}</p>
                <div className="text-[10px] text-slate-500 font-mono text-center space-y-1">
                  <p><strong>Chave PIX:</strong> 55292931829</p>
                  <p><strong>Nome:</strong> Hugo Daniel Ribeiro Nantes</p>
                  <p><strong>Banco:</strong> Nubank</p>
                </div>
              </div>

              <div className="w-full">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Pix Copia e Cola (Simulação)</p>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={pixCode} className="flex-1 bg-slate-100 border border-slate-200 rounded px-3 py-2 text-[10px] font-mono text-slate-600 truncate focus:outline-none" />
                  <button 
                    onClick={() => { navigator.clipboard.writeText(pixCode); alert('Código copiado!'); }}
                    className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded transition-colors shrink-0"
                    title="Copiar código"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-6 italic">Após o pagamento, envie o comprovante para a diretoria no WhatsApp.</p>
            </div>
          </div>
        )}

        
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 text-2xl font-bold shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">Olá, {member.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-mono text-slate-500">
              <div className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-400"/> Venc: Dia {member.dueDate}</div>
              <div className="flex items-center"><MessageSquare size={14} className="mr-1.5 text-slate-400"/> {member.whatsapp}</div>
            </div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto p-4 bg-emerald-50 border border-emerald-100 rounded">
             <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Sua Mensalidade</p>
             <p className="text-2xl font-bold text-slate-800">{formatCurrency(member.monthlyFee)}</p>
          </div>
        </div>

        {/* Notices */}
        {pendingPayments.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded p-4 flex items-start space-x-4 shadow-sm">
             <div className="text-rose-500 mt-0.5"><AlertTriangle size={20} /></div>
             <div>
               <h3 className="text-sm font-bold text-rose-900">Atenção com suas mensalidades</h3>
               <p className="text-rose-700 text-xs mt-1">
                 Você possui {pendingPayments.length} mensalidade(s) em aberto. Por favor, regularize sua situação com a diretoria.
               </p>
             </div>
          </div>
        )}

        {/* Payments List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-600">Seu Histórico de Mensalidades</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {payments.slice().reverse().map(payment => (
              <div key={payment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                <div className="mb-2 sm:mb-0">
                  <p className="font-bold text-slate-800 capitalize text-sm mb-1">{getMonthName(payment.month)}</p>
                  <div className="flex items-center">
                    {payment.status === 'Pago' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                        <CheckCircle size={12} className="mr-1" /> PAGO EM {payment.paymentDate?.split('-').reverse().join('/')}
                      </span>
                    ) : payment.status === 'Atrasado' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                        <AlertTriangle size={12} className="mr-1" /> ATRASADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                        <Clock size={12} className="mr-1" /> PENDENTE
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
                  <span className="font-bold text-slate-800 text-sm">{formatCurrency(payment.amount)}</span>
                  {payment.status !== 'Pago' && (
                    <button 
                      onClick={() => setPixPaymentId(payment.id)}
                      className="text-[10px] font-bold uppercase px-3 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors shrink-0"
                    >
                      Pagar via PIX
                    </button>
                  )}
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm font-medium">
                <p>Nenhuma mensalidade registrada até o momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
