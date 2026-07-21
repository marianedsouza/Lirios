import React, { useState } from 'react';
import { Member, MemberStatus } from '../../types';
import { useAppStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';

interface MemberFormProps {
  member?: Member;
  onBack: () => void;
}

export function MemberForm({ member, onBack }: MemberFormProps) {
  const { addMember, updateMember } = useAppStore();
  
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    name: member?.name || '',
    phone: member?.phone || '',
    whatsapp: member?.whatsapp || '',
    birthDate: member?.birthDate || '',
    entryDate: member?.entryDate || new Date().toISOString().split('T')[0],
    monthlyFee: member?.monthlyFee || 50,
    dueDate: member?.dueDate || 10,
    status: member?.status || 'Ativo',
    observations: member?.observations || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (member) {
      await updateMember(member.id, formData);
    } else {
      await addMember(formData);
    }
    onBack();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyFee' || name === 'dueDate' ? Number(value) : value
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {member ? 'Editar Membro' : 'Novo Membro'}
          </h2>
          <p className="text-gray-500 mt-1">Preencha os dados do membro abaixo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input 
              required
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
            <input 
              required
              type="text" 
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <input 
              type="date" 
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Ingresso *</label>
            <input 
              required
              type="date" 
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Mensalidade (R$) *</label>
            <input 
              required
              type="number" 
              min="0"
              step="0.01"
              name="monthlyFee"
              value={formData.monthlyFee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia de Vencimento *</label>
            <input 
              required
              type="number" 
              min="1"
              max="31"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situação *</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea 
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onBack}>Cancelar</Button>
          <Button type="submit">Salvar Membro</Button>
        </div>
      </form>
    </div>
  );
}
