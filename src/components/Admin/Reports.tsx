import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { generatePaymentMonth, formatCurrency, getMonthName } from '../../lib/utils';
import { Printer } from 'lucide-react';

export function Reports() {
  const { members, payments } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(generatePaymentMonth(new Date()));
  const [reportType, setReportType] = useState<'Pago' | 'Pendente' | 'Atrasado'>('Pago');

  const filteredPayments = payments.filter(p => p.month === selectedMonth && p.status === reportType);
  const totalAmount = filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">
      <div className="flex justify-between items-center shrink-0 print:hidden">
         <div></div>
         <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Printer size={14} />
            IMPRIMIR
         </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden print:shadow-none print:border-none">
        
        {/* Controls - Hidden on print */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-slate-600">Filtros de Relatório</h3>
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

        {/* Report Header - Visible only on print */}
        <div className="hidden print:block text-center pt-8 mb-8 border-b pb-4 shrink-0">
          <h1 className="text-2xl font-bold font-sans">Centro Espírita Lírios do Pântano</h1>
          <h2 className="text-lg mt-1 font-bold text-slate-600">Relatório de Mensalidades - {reportType === 'Pago' ? 'Pagos' : reportType === 'Pendente' ? 'Pendentes' : 'Atrasados'}</h2>
          <p className="text-sm text-slate-500 capitalize font-mono mt-2">Mês ref: {getMonthName(selectedMonth)}</p>
        </div>

        {/* Report Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest print:hidden">
              Resultados: {reportType === 'Pago' ? 'Pagos' : reportType === 'Pendente' ? 'Pendentes' : 'Atrasados'}
            </h3>
            <div className="text-right flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total {reportType === 'Pago' ? 'Arrecadado' : 'a Receber'}</span>
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
                  )
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
      </div>
      
      {/* Print styles */}
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
