import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ShieldCheck, Flower2 } from 'lucide-react';
import { authApi } from '../lib/api';
import logo from '../../assets/logo.png';
import fundoDesk from '../../assets/fundo-Desk.png';
import fundoCel from '../../assets/fundo-Cel.png';

interface LoginProps {
  onLogin: (role: 'admin' | 'member', memberId?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Tenta admin primeiro
      try {
        await authApi.admin(username, password);
        onLogin('admin');
        return;
      } catch {
        // não é admin, tenta membro
      }
      const result = await authApi.member(username, password);
      onLogin('member', result.id);
    } catch (err: any) {
      setError('Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-[#F6F9F6]">
      {/* Imagem de Fundo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="hidden md:block relative w-full h-full">
          <img 
            src={fundoDesk} 
            alt="Fundo Desktop" 
            className="w-full h-full object-cover"
          />
          {/* Overlay verdinho suave para desktop igual ao mobile */}
          <div className="absolute inset-0 bg-[#EBF2EC]/60 mix-blend-multiply"></div>
        </div>
        <img 
          src={fundoCel} 
          alt="Fundo Mobile" 
          className="block md:hidden w-full h-full object-cover"
        />
        {/* Camada degradê verdinha (forte embaixo, transparente em cima) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#D6E6DB] via-[#EBF2EC]/50 to-transparent mix-blend-multiply"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mx-auto h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] flex items-center justify-center">
          <img src={logo} alt="Logo Lírios do Pântano" className="w-full h-full object-contain" />
        </div>
        <h2 className="mt-2 sm:mt-6 text-[28px] sm:text-[36px] font-medium text-[#1A4531] font-serif tracking-tight leading-tight">Lírios do Pântano</h2>
        
        <div className="flex items-center justify-center mt-2 sm:mt-3 mb-1 sm:mb-2 opacity-70">
          <div className="h-[1px] w-12 bg-[#8C9A8E] opacity-50"></div>
          <Flower2 size={16} className="mx-3 text-[#5A7A5F]" />
          <div className="h-[1px] w-12 bg-[#8C9A8E] opacity-50"></div>
        </div>
        
        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-[#2F6A4F] font-semibold uppercase tracking-[0.15em]">Controle de Mensalidades</p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 w-full max-w-[400px] mx-auto">
        <div className="bg-white py-6 px-6 sm:py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:px-10 w-full">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-[#EEF4F0] flex items-center justify-center mr-3">
                  <User size={15} className="text-[#2F6A4F]" strokeWidth={2.5} />
                </div>
                <label className="block text-[12px] font-bold uppercase text-[#2F6A4F] tracking-wider">Usuário</label>
              </div>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:border-[#2F6A4F] focus:ring-1 focus:ring-[#2F6A4F] text-slate-700 placeholder-slate-400 bg-white shadow-sm transition-all"
                placeholder="Seu usuário"
              />
            </div>
            <div>
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-[#EEF4F0] flex items-center justify-center mr-3">
                  <Lock size={15} className="text-[#2F6A4F]" strokeWidth={2.5} />
                </div>
                <label className="block text-[12px] font-bold uppercase text-[#2F6A4F] tracking-wider">Senha</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:border-[#2F6A4F] focus:ring-1 focus:ring-[#2F6A4F] text-slate-700 placeholder-slate-400 bg-white shadow-sm transition-all"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#2F6A4F] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="pt-1 sm:pt-2">
              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#2E7A4A] hover:bg-[#23603A] active:bg-[#1A4529] disabled:opacity-70 text-white font-bold text-[14px] uppercase tracking-[0.1em] rounded-xl transition-all shadow-[0_4px_14px_rgba(46,122,74,0.3)] flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <div className="bg-white px-3 flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#1A4531]" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-5 flex items-center justify-center text-[11px] sm:text-[12px] text-slate-600 font-medium text-center leading-snug">
            <ShieldCheck size={14} className="text-[#1A4531] mr-1.5 flex-shrink-0" strokeWidth={2} />
            <span>Acesso restrito. Sistema exclusivo para Dirigentes e Membros do Grupo da Casa de Amparo Lírios do Pântano</span>
          </div>
        </div>
      </div>
    </div>
  );
}
