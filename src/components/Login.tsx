import React, { useState } from 'react';
import { Users, UserCircle, ShieldCheck } from 'lucide-react';
import { authApi } from '../lib/api';

interface LoginProps {
  onLogin: (role: 'admin' | 'member', memberId?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'member'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.admin(username, password);
      onLogin('admin');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.member(username, password);
      onLogin('member', result.id);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-50 shadow-md">
          <Users size={32} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-800 tracking-tight">
          Lírios do Pântano
        </h2>
        <p className="mt-1 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
          Controle de Mensalidades
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-lg sm:px-10">
          
          <div className="flex bg-slate-100 p-1 rounded-md mb-8">
            <button
              onClick={() => { setActiveTab('admin'); setError(''); }}
              className={`flex-1 flex items-center justify-center py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-colors ${
                activeTab === 'admin' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck size={14} className="mr-2" />
              Diretoria
            </button>
            <button
              onClick={() => { setActiveTab('member'); setError(''); }}
              className={`flex-1 flex items-center justify-center py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-colors ${
                activeTab === 'member' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCircle size={14} className="mr-2" />
              Membro
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 text-center font-medium">
              {error}
            </div>
          )}

          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Usuário</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Seu usuário"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Sua senha"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors">
                {loading ? 'Entrando...' : 'Acessar Painel'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Usuário</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Seu usuário"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Sua senha"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
