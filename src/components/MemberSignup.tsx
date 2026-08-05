import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

type Step = 'form' | 'loading' | 'success' | 'error';

export function MemberSignup() {
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [username, setUsername] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim()) return;

    setStep('loading');
    try {
      const res = await fetch('/api/members/convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar');
      setUsername(data.username);
      setStep('success');
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro ao enviar cadastro');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Lírios do Pântano</h1>
          <p className="text-sm text-slate-500 mt-1">Formulário de Inscrição</p>
        </div>

        {step === 'success' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <CheckCircle size={48} className="text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Cadastro enviado!</h2>
            <p className="text-sm text-slate-600">
              Seu pedido de inscrição foi recebido. A diretoria irá analisar e você receberá seu acesso em breve.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Seu usuário provisório</p>
              <p className="text-sm font-mono font-bold text-emerald-700">{username}</p>
              <p className="text-[10px] text-slate-400 mt-2">Senha inicial: <span className="font-mono font-bold">mudar123</span></p>
              <p className="text-[10px] text-slate-400 mt-1">Aguarde a aprovação da diretoria para conseguir acessar o portal.</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-base font-bold text-slate-700 mb-6">Preencha seus dados</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome completo *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">WhatsApp *</label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="(67) 99999-9999"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(67) 3333-3333"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={step === 'loading'}
                className="w-full py-3 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {step === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Inscrição'
                )}
              </button>
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
