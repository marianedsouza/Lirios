import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

export function Caixa() {
  const { payments, expenses, addExpense, deleteExpense } = useAppStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });

  // Calculate totals
  const totalReceitas = payments.filter(p => p.status === 'Pago').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDespesas = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAtual = totalReceitas - totalDespesas;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;
    
    await addExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date
    });
    
    setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-0">
      <div className="flex justify-between items-center shrink-0">
         <div></div>
         <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Plus size={14} />
            NOVA DESPESA
         </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Entradas (Receitas)</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalReceitas)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Saídas (Despesas)</p>
            <p className="text-xl font-bold text-rose-600">-{formatCurrency(totalDespesas)}</p>
          </div>
        </div>
        <div className={`p-4 rounded-lg border shadow-sm flex items-center justify-between ${saldoAtual >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${saldoAtual >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Saldo Atual no Caixa</p>
            <p className={`text-xl font-bold ${saldoAtual >= 0 ? 'text-slate-800' : 'text-rose-700'}`}>{formatCurrency(saldoAtual)}</p>
          </div>
          <Wallet size={32} className={saldoAtual >= 0 ? 'text-emerald-200' : 'text-rose-200'} />
        </div>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-600">Registrar Saída (Despesa)</h3>
            <button onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Cancelar</button>
          </div>
          <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição</label>
              <input 
                type="text" 
                required 
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="Ex: Conta de Luz"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500" 
              />
            </div>
            <div className="sm:w-32">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                required 
                value={newExpense.amount}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                placeholder="0.00"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500 font-mono" 
              />
            </div>
            <div className="sm:w-40">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data</label>
              <input 
                type="date" 
                required 
                value={newExpense.date}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500 font-mono" 
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full sm:w-auto h-8 px-4 bg-slate-800 text-white text-[10px] font-bold uppercase rounded hover:bg-slate-700 transition-colors">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses History */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-600">Histórico de Despesas</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Data</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">Descrição</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 text-right">Valor</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{expense.date.split('-').reverse().join('/')}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{expense.description}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-rose-600 text-right">-{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => { if(window.confirm('Excluir esta despesa?')) deleteExpense(expense.id); }} className="text-slate-400 hover:text-rose-500 transition-colors" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">Nenhuma despesa registrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
