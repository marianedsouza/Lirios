import React, { useState } from 'react';
import { Users, LayoutDashboard, FileText, LogOut, Menu, X, Wallet, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Dashboard } from './Admin/Dashboard';
import { Members } from './Admin/Members';
import { Reports } from './Admin/Reports';
import { Caixa } from './Admin/Caixa';
import { Settings } from './Admin/Settings';

interface AdminLayoutProps {
  onLogout: () => void;
}

type Tab = 'dashboard' | 'members' | 'reports' | 'caixa' | 'settings';

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Painel Geral', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Caixa e Despesas', id: 'caixa', icon: Wallet },
    { name: 'Cadastro de Membros', id: 'members', icon: Users },
    { name: 'Relatórios', id: 'reports', icon: FileText },
    { name: 'Configurações', id: 'settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'caixa': return <Caixa />;
      case 'members': return <Members />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Administrativo';
      case 'caixa': return 'Controle de Caixa e Despesas';
      case 'members': return 'Cadastro e Controle de Membros';
      case 'reports': return 'Relatórios e Exportações';
      case 'settings': return 'Configurações do Sistema';
      default: return 'Dashboard Administrativo';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden bg-emerald-900 text-emerald-50 p-4 flex justify-between items-center shadow-md z-20 absolute w-full">
        <h1 className="text-xl font-bold tracking-tight text-white">Lírios do Pântano</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 bg-emerald-900 text-emerald-50 w-64 flex flex-col transition-transform duration-300 ease-in-out z-10 shrink-0",
        mobileMenuOpen ? "translate-x-0 pt-16 md:pt-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold tracking-tight text-white">Lírios do Pântano</h1>
          <p className="text-xs text-emerald-300 uppercase tracking-widest mt-1">Gestão de Mensalidades</p>
        </div>
        
        <nav className="flex-1 px-4 py-8 md:py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === item.id 
                    ? "bg-emerald-800 text-white" 
                    : "hover:bg-emerald-800 text-emerald-200"
                )}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold uppercase text-white">AD</div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold truncate text-white">Admin Dirigente</p>
                <p className="text-[10px] text-emerald-400">Logado como Admin</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-emerald-400 hover:text-white transition-colors" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0 min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h2 className="text-lg font-semibold text-slate-700 italic">{getTitle()}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Último Acesso</p>
              <p className="text-xs font-mono text-emerald-600">Hoje</p>
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto overflow-x-hidden flex flex-col">
           {renderContent()}
        </div>

        {/* Bottom System Status Footer */}
        <footer className="h-8 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <div className="flex space-x-4">
            <span>v1.0.0-stable</span>
            <span>ID Centro: LP-2023</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="font-medium">Sincronizado com a nuvem</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
