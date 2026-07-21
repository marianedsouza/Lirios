import React, { useState } from 'react';
import { Member, Payment, PaymentMethod } from '../../types';
import { useAppStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, getMonthName } from '../../lib/utils';
import { ArrowLeft, Check, Calendar, Phone, MessageSquare } from 'lucide-react';

interface MemberDetailsProps {
  member: Member;
  onBack: () => void;
}

export function MemberDetails({ member, onBack }: MemberDetailsProps) {
  const { getMemberPayments, registerPayment } = useAppStore();
  const payments = getMemberPayments(member.id);
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPayment) {
      registerPayment(selectedPayment.id, paymentMethod, paymentDate);
      setSelectedPayment(null);
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
            <Badge variant={member.status === 'Ativo' ? 'success' : 'default'} className="mt-2">
              {member.status}
            </Badge>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-gray-600">
              <Phone size={16} className="mr-3 text-gray-400" />
              {member.phone || 'Sem telefone'}
            </div>
            <div className="flex items-center text-gray-600">
              <MessageSquare size={16} className="mr-3 text-gray-400" />
              {member.whatsapp}
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
          
          {selectedPayment ? (
            <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100 mb-6">
              <h4 className="font-semibold text-emerald-900 mb-4 flex items-center">
                <Check className="mr-2" size={18} />
                Registrar Pagamento: {getMonthName(selectedPayment.month)}
              </h4>
              <form onSubmit={handleRegisterPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Data do Pagamento</label>
                    <input 
                      type="date" 
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1">Forma de Pagamento</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedPayment(null)}>Cancelar</Button>
                  <Button type="submit">Confirmar Pagamento</Button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="space-y-3">
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
                
                <div className="flex items-center justify-between sm:justify-end sm:space-x-4 w-full sm:w-auto">
                  <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                  {payment.status !== 'Pago' && (
                    <Button size="sm" onClick={() => setSelectedPayment(payment)}>
                      Registrar
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
      </div>
    </div>
  );
}
