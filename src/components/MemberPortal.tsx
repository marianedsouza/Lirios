import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { formatCurrency, getMonthName } from '../lib/utils';
import { LogOut, Calendar, MessageSquare, CheckCircle, Clock, AlertTriangle, BookOpen, CreditCard } from 'lucide-react';

interface MemberPortalProps {
  memberId: string;
  onLogout: () => void;
}

export function MemberPortal({ memberId, onLogout }: MemberPortalProps) {
  const { members, settings, getMemberPayments, getMemberReceipts, refreshPayments } = useAppStore();
  const [mpLoading, setMpLoading] = useState<string | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Detecta retorno do Mercado Pago via query string ?payment=success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment') || params.get('status') || params.get('collection_status');
    if (status === 'success' || status === 'approved') {
      setPaymentSuccess(true);
      // Recarrega pagamentos do banco para refletir o status atualizado pelo webhook
      refreshPayments();
      // Limpa a query string da URL sem recarregar a página
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshPayments]);

  const member = members.find(m => m.id === memberId);
  const payments = getMemberPayments(memberId);
  const memberReceipts = getMemberReceipts(memberId);

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

  const getReceiptStatus = (paymentId: string) => {
    return memberReceipts.find(r => r.paymentId === paymentId);
  };

  const handleMercadoPago = async (paymentId: string) => {
    setMpLoading(paymentId);
    setMpError(null);
    try {
      const res = await fetch(`/api/payments/${paymentId}/mercadopago`, { method: 'POST' });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setMpError(data.error || 'Erro ao gerar link de pagamento');
      }
    } catch (err) {
      setMpError('Erro de comunicação com o servidor');
    } finally {
      setMpLoading(null);
    }
  };

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

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Erro Mercado Pago */}
        {mpError && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700 font-medium">
            {mpError}
          </div>
        )}

        {/* Sucesso de pagamento (retorno do MP) */}
        {paymentSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
            <CheckCircle size={20} className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Pagamento realizado com sucesso!</h3>
              <p className="text-emerald-700 text-xs mt-1">
                Seu pagamento foi confirmado pelo Mercado Pago. O status abaixo já foi atualizado.
              </p>
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
              <div className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-400" /> Venc: Dia {member.dueDate}</div>
              <div className="flex items-center"><MessageSquare size={14} className="mr-1.5 text-slate-400" /> {member.whatsapp}</div>
            </div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto p-4 bg-emerald-50 border border-emerald-100 rounded">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Sua Mensalidade</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(member.monthlyFee)}</p>
          </div>
        </div>

        {/* Aviso de pendências */}
        {pendingPayments.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded p-4 flex items-start space-x-4 shadow-sm">
            <div className="text-rose-500 mt-0.5"><AlertTriangle size={20} /></div>
            <div>
              <h3 className="text-sm font-bold text-rose-900">Atenção com suas mensalidades</h3>
              <p className="text-rose-700 text-xs mt-1">
                Você possui {pendingPayments.length} mensalidade(s) em aberto.
              </p>
            </div>
          </div>
        )}

        {/* Diretrizes da casa */}
        {settings.houseGuidelines && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-600">Diretrizes da Casa</h3>
            </div>
            <div className="p-6">
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {settings.houseGuidelines}
              </div>
            </div>
          </div>
        )}

        {/* Lista de mensalidades */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-600">Seu Histórico de Mensalidades</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {payments.slice().reverse().map(payment => {
              const receipt = getReceiptStatus(payment.id);
              return (
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
                    {receipt && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Comprovante:{' '}
                        <span className={
                          receipt.status === 'Aprovado' ? 'text-emerald-600 font-bold' :
                          receipt.status === 'Rejeitado' ? 'text-rose-600 font-bold' :
                          'text-amber-600 font-bold'
                        }>
                          {receipt.status === 'Aprovado' ? 'Aprovado' :
                           receipt.status === 'Rejeitado' ? 'Rejeitado' : 'Aguardando validação'}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
                    <span className="font-bold text-slate-800 text-sm">{formatCurrency(payment.amount)}</span>
                    {payment.status !== 'Pago' && (
                      <button
                        onClick={() => handleMercadoPago(payment.id!)}
                        disabled={mpLoading === payment.id}
                        className="flex items-center gap-2 text-[11px] font-bold uppercase px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors min-w-[160px] justify-center"
                      >
                        <CreditCard size={14} />
                        {mpLoading === payment.id ? 'Aguarde...' : 'Pagar agora'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
