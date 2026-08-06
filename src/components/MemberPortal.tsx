import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { Payment } from '../types';
import { formatCurrency, getMonthName, generatePaymentMonth } from '../lib/utils';
import { LogOut, Calendar, MessageSquare, CheckCircle, Clock, AlertTriangle, BookOpen, CreditCard, HeartHandshake, ChevronDown } from 'lucide-react';
import { GuidelinesAccordion } from './GuidelinesAccordion';
import { BirthdayAlert } from './Admin/BirthdayAlert';

interface MemberPortalProps {
  memberId: string;
  onLogout: () => void;
}

export function MemberPortal({ memberId, onLogout }: MemberPortalProps) {
  const { members, settings, getMemberPayments, getMemberReceipts, refreshPayments, donations, addDonation } = useAppStore();
  const [mpLoading, setMpLoading] = useState<string | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);

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

  const handleDonation = async () => {
    const amount = parseFloat(donationAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setDonationError('Informe um valor válido para a doação.');
      return;
    }
    setDonationLoading(true);
    setDonationError(null);
    try {
      const donation = await addDonation({
        memberId,
        donorName: member.name,
        description: 'Doação',
        amount,
        date: new Date().toISOString().split('T')[0],
        month: generatePaymentMonth(new Date()),
        status: 'Pendente',
      });
      const res = await fetch(`/api/donations/${donation.id}/mercadopago`, { method: 'POST' });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setDonationError(data.error || 'Erro ao gerar link de pagamento');
      }
    } catch (err) {
      setDonationError('Erro de comunicação com o servidor');
    } finally {
      setDonationLoading(false);
    }
  };

  const memberDonations = donations
    .filter(d => d.memberId === memberId && d.status === 'Pago')
    .sort((a, b) => b.month.localeCompare(a.month));

  const groupedByYear = payments
    .slice()
    .sort((a, b) => b.month.localeCompare(a.month))
    .reduce<Record<string, Payment[]>>((acc, p) => {
      const year = p.month.slice(0, 4);
      (acc[year] = acc[year] || []).push(p);
      return acc;
    }, {});
  const years = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  const [yearOverride, setYearOverride] = useState<Record<string, boolean>>({});
  const isYearOpen = (year: string) => {
    const hasUnpaid = groupedByYear[year].some(p => p.status !== 'Pago');
    return year in yearOverride ? yearOverride[year] : hasUnpaid;
  };
  const toggleYear = (year: string) => {
    setYearOverride(prev => ({ ...prev, [year]: !isYearOpen(year) }));
  };

  return (
    <div className="min-h-screen bg-[#F6F9F6] flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="h-16 bg-[#1A4531] text-white shadow-md z-10 shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium font-serif tracking-tight">Lírios do Pântano</h1>
            <p className="text-[#A3BCA7] text-[10px] uppercase tracking-widest font-bold mt-0.5">Portal do Membro</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-[#A3BCA7] hover:text-white transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Erro Mercado Pago */}
        {mpError && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700 font-medium">
            {mpError}
          </div>
        )}

        {/* Sucesso de pagamento (retorno do MP) */}
        {paymentSuccess && (
          <div className="bg-[#EEF4F0] border border-[#A3BCA7]/40 rounded-lg p-4 flex items-start gap-3 shadow-sm">
            <CheckCircle size={20} className="text-[#2E7A4A] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[#1A4531]">Pagamento realizado com sucesso!</h3>
              <p className="text-[#2F6A4F] text-xs mt-1">
                Seu pagamento foi confirmado pelo Mercado Pago. O status abaixo já foi atualizado.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center">
          <div className="w-16 h-16 bg-[#EEF4F0] rounded-full flex items-center justify-center text-[#1A4531] text-2xl font-bold shrink-0 shadow-inner">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#1A4531]">Olá, {member.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-mono text-slate-500">
              <div className="flex items-center"><Calendar size={14} className="mr-1.5 text-[#A3BCA7]" /> Venc: Dia {member.dueDate}</div>
              <div className="flex items-center"><MessageSquare size={14} className="mr-1.5 text-[#A3BCA7]" /> {member.whatsapp}</div>
            </div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto p-4 bg-[#EEF4F0] border border-[#A3BCA7]/30 rounded-xl">
            <p className="text-[10px] font-bold text-[#2F6A4F] uppercase tracking-widest mb-1">Sua Mensalidade</p>
            <p className="text-2xl font-bold text-[#1A4531]">{formatCurrency(member.monthlyFee)}</p>
          </div>
        </div>

        {/* Aniversariantes do mês */}
        <BirthdayAlert />

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

        {/* Diretrizes da casa — acordeão fechado */}
        {settings.houseGuidelines && (
          <GuidelinesAccordion text={settings.houseGuidelines} />
        )}

        {/* Lista de mensalidades */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-[#F6F9F6]">
            <h3 className="text-sm font-bold text-[#1A4531] uppercase tracking-wider">Seu Histórico de Mensalidades</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {years.map(year => {
              const yearPayments = groupedByYear[year];
              const unpaidCount = yearPayments.filter(p => p.status !== 'Pago').length;
              const open = isYearOpen(year);
              return (
                <div key={year} className={open ? '' : ''}>
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#1A4531]">{year}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        unpaidCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-[#EEF4F0] text-[#2F6A4F]'
                      }`}>
                        {unpaidCount > 0 ? `${unpaidCount} em aberto` : 'Em dia'}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="border-t border-slate-50 divide-y divide-slate-50 bg-slate-50/30">
                      {yearPayments.map(payment => {
                        const receipt = getReceiptStatus(payment.id);
                        return (
                          <div key={payment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                            <div className="mb-2 sm:mb-0">
                              <p className="font-bold text-slate-800 capitalize text-sm mb-1">{getMonthName(payment.month)}</p>
                              <div className="flex items-center">
                                {payment.status === 'Pago' ? (
                                  <span className="inline-flex items-center text-[10px] font-bold text-[#2F6A4F] bg-[#EEF4F0] px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    <CheckCircle size={12} className="mr-1" /> PAGO EM {payment.paymentDate?.split('-').reverse().join('/')}
                                  </span>
                                ) : payment.status === 'Atrasado' ? (
                                  <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    <AlertTriangle size={12} className="mr-1" /> ATRASADO
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
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

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                              <span className="font-bold text-slate-800 text-sm">{formatCurrency(payment.amount)}</span>
                              {payment.status !== 'Pago' && (
                                <button
                                  onClick={() => handleMercadoPago(payment.id!)}
                                  disabled={mpLoading === payment.id}
                                  className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2.5 bg-[#2E7A4A] hover:bg-[#23603A] text-white rounded-xl shadow-[0_4px_14px_rgba(46,122,74,0.3)] disabled:opacity-50 transition-all w-full sm:w-auto sm:min-w-[160px]"
                                >
                                  <CreditCard size={14} />
                                  {mpLoading === payment.id ? 'Aguarde...' : 'Pagar agora'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {years.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm font-medium">
                <p>Nenhuma mensalidade registrada até o momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Doação */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-[#F6F9F6] flex items-center gap-2">
            <HeartHandshake size={16} className="text-[#2E7A4A]" />
            <h3 className="text-sm font-bold text-[#1A4531] uppercase tracking-wider">Sua Doação</h3>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-xs text-slate-500 mb-4">
              Contribua com um valor livre para a casa. O pagamento é feito com segurança pelo Mercado Pago.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-[#2F6A4F] uppercase tracking-widest mb-1.5">
                  Valor da doação
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-800 focus:outline-[#2E7A4A] focus:ring-1 focus:ring-[#2E7A4A]"
                />
              </div>
              <button
                onClick={handleDonation}
                disabled={donationLoading}
                className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2.5 bg-[#00A8E8] hover:bg-[#0090C8] text-white rounded-xl shadow disabled:opacity-50 transition-all w-full"
              >
                <HeartHandshake size={14} />
                {donationLoading ? 'Aguarde...' : 'Fazer doação'}
              </button>
            </div>

            {donationError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 font-medium">
                {donationError}
              </div>
            )}

            {memberDonations.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[10px] font-bold text-[#2F6A4F] uppercase tracking-widest mb-3">
                  Doações confirmadas ({memberDonations.length})
                </p>
                <div className="space-y-2">
                  {memberDonations.map(donation => (
                    <div key={donation.id} className="flex items-center justify-between px-3 py-2.5 bg-[#F6F9F6] border border-[#EEF4F0] rounded-lg">
                      <div>
                        <p className="text-xs font-bold text-slate-800 capitalize">{getMonthName(donation.month)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{donation.date.split('-').reverse().join('/')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2E7A4A]">{formatCurrency(donation.amount)}</span>
                        <span className="inline-flex items-center text-[10px] font-bold text-[#2F6A4F] bg-[#EEF4F0] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <CheckCircle size={11} className="mr-1" /> Pago
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
