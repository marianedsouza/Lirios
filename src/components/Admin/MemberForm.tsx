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
  const { addMember, updateMember, settings } = useAppStore();
  
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    name: member?.name || '',
    username: member?.username || '',
    password: member?.password || '',
    phone: '',
    whatsapp: member?.whatsapp || '',
    birthDate: '',
    entryDate: new Date().toISOString().split('T')[0],
    monthlyFee: settings.defaultMonthlyFee,
    dueDate: settings.defaultDueDate,
    status: member?.status || 'Ativo',
    observations: '',
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
      [name]: value
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (login) *</label>
            <input 
              required
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ex: joao.silva"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
            <input 
              required
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Senha de acesso"
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
              type="text" 
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              placeholder="DD/MM/AAAA"
              maxLength={10}
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
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-xs text-slate-500">
            <strong>Mensalidade:</strong> R$ {settings.defaultMonthlyFee.toFixed(2)} | <strong>Vencimento:</strong> Dia {settings.defaultDueDate}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Valores definidos em Configurações. Para alterar, acesse Configurações.</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onBack}>Cancelar</Button>
          <Button type="submit">Salvar Membro</Button>
        </div>
      </form>
    </div>
  );
}
