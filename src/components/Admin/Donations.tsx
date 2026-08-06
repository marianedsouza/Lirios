import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Donation } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { HeartHandshake, Check, Trash2 } from 'lucide-react';

export function Donations() {
  const { members, donations, addDonation, updateDonation, deleteDonation } = useAppStore();

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    memberId: '',
    donorName: '',
    description: '',
    status: 'Pendente' as Donation['status'],
  });

  const paidDonations = donations.filter(d => d.status === 'Pago');
  const pendingDonations = donations.filter(d => d.status === 'Pendente');
  const totalPaid = paidDonations.reduce((acc, d) => acc + d.amount, 0);
  const totalPending = pendingDonations.reduce((acc, d) => acc + d.amount, 0);

  const donorLabel = (donation: Donation) => {
    if (donation.memberId) {
      const member = members.find(m => m.id === donation.memberId);
      if (member) return member.name;
    }
    return donation.donorName || 'Doador anônimo';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!amount || amount <= 0) return;

    await addDonation({
      amount,
      date: form.date,
      memberId: form.memberId || null,
      donorName: form.memberId ? '' : form.donorName.trim(),
      description: form.description.trim(),
      status: form.status,
    });

    setForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      memberId: '',
      donorName: '',
      description: '',
      status: 'Pendente',
    });
  };

  const toggleStatus = async (donation: Donation) => {
    await updateDonation(donation.id, { status: donation.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  const handleDelete = async (donation: Donation) => {
    if (!window.confirm(`Excluir doação de ${formatCurrency(donation.amount)}?`)) return;
    await deleteDonation(donation.id);
  };

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doações Recebidas</p>
          <p className="text-xl md:text-2xl font-bold text-[#2E7A4A]">{formatCurrency(totalPaid)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{paidDonations.length} confirmada(s)</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-amber-50/30">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{pendingDonations.length} pendente(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Formulário de registro */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-5 h-fit">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <HeartHandshake size={18} className="text-[#2E7A4A]" />
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Registrar Doação</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membro (opcional)</label>
              <select
                name="memberId"
                value={form.memberId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">— Doação avulsa —</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do doador (avulsa)</label>
              <input
                type="text"
                name="donorName"
                value={form.donorName}
                onChange={handleChange}
                placeholder="Ex: Visitante da casa"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Ex: Doação para reforma"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#2E7A4A] hover:bg-[#23603A] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              <HeartHandshake size={14} />
              Registrar Doação
            </button>
          </form>
        </div>

        {/* Lista de doações */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-[#F6F9F6]">
            <h3 className="text-[12px] font-bold text-[#1A4531] uppercase tracking-wider">Histórico de Doações ({donations.length})</h3>
          </div>

          <div className="divide-y divide-slate-50">
            {donations.map(donation => (
              <div key={donation.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{donorLabel(donation)}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {donation.date.split('-').reverse().join('/')}
                    {donation.description ? ` · ${donation.description}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-800 mb-1">{formatCurrency(donation.amount)}</p>
                  <div className="flex items-center justify-end gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      donation.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {donation.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => toggleStatus(donation)}
                      className="text-emerald-600 hover:text-emerald-800 transition-colors"
                      title={donation.status === 'Pago' ? 'Marcar como pendente' : 'Marcar como pago'}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(donation)}
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                      title="Excluir doação"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {donations.length === 0 && (
              <div className="px-4 py-10 text-center text-xs text-slate-500">
                Nenhuma doação registrada ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
