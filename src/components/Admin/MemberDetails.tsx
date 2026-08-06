import React, { useState } from 'react';
import { Member, Payment } from '../../types';
import { useAppStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, getMonthName, generatePaymentMonth } from '../../lib/utils';
import { paymentsApi, donationsApi } from '../../lib/api';
import { ArrowLeft, Calendar, MessageSquare, CreditCard, HeartHandshake } from 'lucide-react';

interface MemberDetailsProps {
  member: Member;
  onBack: () => void;
}

export function MemberDetails({ member, onBack }: MemberDetailsProps) {
  const { getMemberPayments, donations, addDonation } = useAppStore();
  const payments = getMemberPayments(member.id);
  const memberDonations = donations.filter(d => d.memberId === member.id);

  const [mpLoading, setMpLoading] = useState<string | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);

  const [donationMonth, setDonationMonth] = useState(generatePaymentMonth(new Date()));
  const [donationAmount, setDonationAmount] = useState('');
  const [mpDonationLoading, setMpDonationLoading] = useState(false);
  const [mpDonationError, setMpDonationError] = useState<string | null>(null);

  const monthPaidDonations = memberDonations.filter(d => d.month === donationMonth && d.status === 'Pago');
  const monthDonationTotal = monthPaidDonations.reduce((acc, d) => acc + d.amount, 0);
  const monthPayment = payments.find(p => p.month === donationMonth);
  const monthlyFeeForMonth = monthPayment?.amount ?? member.monthlyFee;
  const monthTotal = monthlyFeeForMonth + monthDonationTotal;

  const handleMercadoPago = async (payment: Payment) => {
    setMpLoading(payment.id!);
    setMpError(null);
    try {
      const { init_point } = await paymentsApi.mercadopago(payment.id!);
      window.open(init_point, '_blank');
    } catch (e: any) {
      setMpError(e.message || 'Erro ao gerar link do Mercado Pago');
    } finally {
      setMpLoading(null);
    }
  };

  const handleDonationMercadoPago = async () => {
    const amount = parseFloat(donationAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setMpDonationError('Informe um valor válido para a doação.');
      return;
    }
    setMpDonationLoading(true);
    setMpDonationError(null);
    try {
      const donation = await addDonation({
        memberId: member.id,
        donorName: member.name,
        description: 'Doação',
        amount,
        date: new Date().toISOString().split('T')[0],
        month: donationMonth,
        status: 'Pendente',
      });
      const { init_point } = await donationsApi.mercadopago(donation.id);
      window.open(init_point, '_blank');
    } catch (e: any) {
      setMpDonationError(e.message || 'Erro ao gerar link do Mercado Pago');
    } finally {
      setMpDonationLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Detalhes do Membro</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
          <div className="text-center pb-4 border-b border-gray-100">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-800 text-2xl font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
            <Badge
              variant={member.status === 'Ativo' ? 'success' : member.status === 'Dirigente' ? 'outline' : 'default'}
              className={`mt-2 ${member.status === 'Dirigente' ? 'bg-violet-100 text-violet-700 border border-violet-200' : ''}`}
            >
              {member.status}
            </Badge>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-gray-600">
              <MessageSquare size={16} className="mr-3 text-gray-400" />
              {member.whatsapp}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-3 text-gray-400" />
              {member.birthDate ? `Nascimento: ${member.birthDate}` : 'Nascimento: Não informado'}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-3 text-gray-400" />
              Entrada: {member.entryDate ? member.entryDate.split('-').reverse().join('/') : '—'}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-3 text-gray-400" />
              Dia de Vencimento: {member.dueDate}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-gray-500">Mensalidade</span>
              <span className="font-semibold text-gray-900">{formatCurrency(member.monthlyFee)}</span>
            </div>
          </div>
          {member.observations && (
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-500 mb-1 font-medium">Observações</p>
              <p className="text-sm text-gray-700">{member.observations}</p>
            </div>
          )}
        </div>

        {/* Payments History */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Controle de Mensalidades</h3>

          <div className="space-y-3">
            {mpError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {mpError}
              </div>
            )}
            {payments.map(payment => (
              <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="mb-3 sm:mb-0">
                  <p className="font-medium text-gray-900 capitalize">{getMonthName(payment.month)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={
                      payment.status === 'Pago' ? 'success' : 
                      payment.status === 'Atrasado' ? 'destructive' : 'warning'
                    }>
                      {payment.status}
                    </Badge>
                    {payment.status === 'Pago' && (
                      <span className="text-xs text-gray-500">
                        em {payment.paymentDate?.split('-').reverse().join('/')} via {payment.method}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                  {payment.status !== 'Pago' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMercadoPago(payment)}
                      disabled={mpLoading === payment.id}
                      title="Gerar link de pagamento via Mercado Pago"
                    >
                      <CreditCard size={13} className="mr-1" />
                      {mpLoading === payment.id ? 'Gerando...' : 'Mercado Pago'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhuma mensalidade gerada.</p>
            )}
          </div>
        </div>

        {/* Donations */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HeartHandshake size={18} className="text-emerald-600" />
              Controle de Doações
            </h3>
            <span className="text-xs text-gray-500">Valor aberto · pagamento via Mercado Pago</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês de referência</label>
              <input
                type="month"
                value={donationMonth}
                onChange={(e) => setDonationMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da doação *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleDonationMercadoPago}
                disabled={mpDonationLoading}
                className="w-full py-2 px-3 bg-[#00A8E8] hover:bg-[#0090C8] text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CreditCard size={15} />
                {mpDonationLoading ? 'Gerando...' : 'Gerar Link Mercado Pago'}
              </button>
            </div>
          </div>

          {mpDonationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {mpDonationError}
            </div>
          )}

          <div className="space-y-3">
            {monthPaidDonations.length > 0 ? (
              monthPaidDonations.map(donation => (
                <div key={donation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">Doação confirmada</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="success">Pago</Badge>
                      <span className="text-xs text-gray-500">
                        em {donation.date.split('-').reverse().join('/')}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(donation.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma doação confirmada para este mês.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-2">
            <span className="text-sm text-gray-600">Total de {getMonthName(donationMonth)}</span>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Mensalidade: {formatCurrency(monthlyFeeForMonth)}
                {monthDonationTotal > 0 ? ` + Doações: ${formatCurrency(monthDonationTotal)}` : ''}
              </p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(monthTotal)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
