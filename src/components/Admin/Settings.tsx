import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, Save, DollarSign, BookOpen } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';

export function Settings() {
  const { settings, updateSettings } = useAppStore();
  
  const [pixKey, setPixKey] = useState(settings.pixKey);
  const [bankName, setBankName] = useState(settings.bankName);
  const [accountName, setAccountName] = useState(settings.accountName);
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(settings.defaultMonthlyFee.toString());
  const [houseGuidelines, setHouseGuidelines] = useState(settings.houseGuidelines);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPixKey(settings.pixKey);
    setBankName(settings.bankName);
    setAccountName(settings.accountName);
    setDefaultMonthlyFee(settings.defaultMonthlyFee.toString());
    setHouseGuidelines(settings.houseGuidelines);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pixKey,
      bankName,
      accountName,
      defaultMonthlyFee: parseFloat(defaultMonthlyFee) || 0,
      houseGuidelines,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-6 min-h-0 overflow-y-auto">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Conta de Recebimento (PIX) */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden shrink-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Building className="text-emerald-600" size={20} />
            <h3 className="text-sm font-bold text-slate-700">Conta de Recebimento (PIX)</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-w-2xl">
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
            </div>
          </div>
        </div>

        {/* Valor da Mensalidade */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden shrink-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <DollarSign className="text-emerald-600" size={20} />
            <h3 className="text-sm font-bold text-slate-700">Valor da Mensalidade</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor Padrão (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={defaultMonthlyFee}
                  onChange={e => setDefaultMonthlyFee(e.target.value)}
                  className="w-full max-w-xs text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Este valor será usado como padrão ao cadastrar novos membros.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diretrizes da Casa */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden shrink-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <BookOpen className="text-emerald-600" size={20} />
            <h3 className="text-sm font-bold text-slate-700">Diretrizes da Casa</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Regras e Orientações</label>
                <textarea 
                  value={houseGuidelines}
                  onChange={e => setHouseGuidelines(e.target.value)}
                  rows={8}
                  placeholder="Digite as diretrizes e regras da casa aqui..."
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-emerald-500 resize-none" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Estas diretrizes poderão ser visualizadas pelos membros no portal.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="shrink-0 pb-6">
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Save size={14} />
            {saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
