import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Save } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export function Settings() {
  const [pixKey, setPixKey] = useState('55292931829');
  const [bankName, setBankName] = useState('Nubank');
  const [accountName, setAccountName] = useState('Hugo Daniel Ribeiro Nantes');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-6 min-h-0">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden shrink-0">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Building className="text-emerald-600" size={20} />
          <h3 className="text-sm font-bold text-slate-700">Conta de Recebimento (PIX)</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instituição Bancária</label>
                <input 
                  type="text" 
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Titular da Conta</label>
                <input 
                  type="text" 
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chave PIX de Recebimento</label>
              <input 
                type="text" 
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500 font-mono" 
              />
              <p className="text-[10px] text-slate-400 mt-1">Os membros realizarão as transferências para esta chave.</p>
            </div>
            <div className="pt-2">
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Save size={14} />
                {saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
