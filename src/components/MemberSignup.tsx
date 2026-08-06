import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import logo from '../../assets/logo.png';

type Step = 'form' | 'loading' | 'success' | 'error';

export function MemberSignup() {
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim() || !form.password.trim() || !form.whatsapp.trim()) return;

    setStep('loading');
    try {
      const res = await fetch('/api/members/convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar');
      setStep('success');
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro ao enviar cadastro');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center mb-4">
            <img src={logo} alt="Logo Lírios do Pântano" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Lírios do Pântano</h1>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Formulário de Inscrição</p>
        </div>

        {step === 'success' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <CheckCircle size={48} className="text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Cadastro enviado com sucesso!</h2>
            <p className="text-sm text-slate-600">
              Seu pedido de inscrição foi recebido. Aguarde a aprovação da diretoria para conseguir acessar o portal.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Seu usuário de acesso</p>
              <p className="text-sm font-mono font-bold text-emerald-700">{form.username}</p>
              <p className="text-[10px] text-slate-400 mt-2">Use a senha que você cadastrou para entrar após a aprovação.</p>
            </div>
          </div>
        ) : step === 'error' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
            <button
              onClick={() => setStep('form')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded hover:bg-emerald-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Novo Membro</h2>
            <p className="text-gray-500 text-sm mb-6">Preencha os dados abaixo para solicitar sua inscrição</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (login) *</label>
                  <input
                    required
                    type="text"
                    name="username"
                    value={form.username}
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
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Crie uma senha de acesso"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input
                    required
                    type="tel"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="(67) 99999-9999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(67) 3333-3333"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="text"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={step === 'loading'}
                  className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {step === 'loading' ? (
                    <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                  ) : (
                    'Enviar Inscrição'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Lírios do Pântano · Sistema de Gestão de Mensalidades
        </p>
      </div>
    </div>
  );
}
