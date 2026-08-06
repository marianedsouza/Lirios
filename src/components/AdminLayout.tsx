import React, { useState } from 'react';
import { Users, LayoutDashboard, FileText, LogOut, Menu, X, Wallet, Settings as SettingsIcon, HeartHandshake } from 'lucide-react';
import { cn } from '../lib/utils';
import { Dashboard } from './Admin/Dashboard';
import { Members } from './Admin/Members';
import { Reports } from './Admin/Reports';
import { Caixa } from './Admin/Caixa';
import { Settings } from './Admin/Settings';
import { Donations } from './Admin/Donations';

interface AdminLayoutProps {
  onLogout: () => void;
}

type Tab = 'dashboard' | 'members' | 'reports' | 'caixa' | 'settings' | 'donations';

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Painel Geral', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Caixa e Despesas', id: 'caixa', icon: Wallet },
    { name: 'Membros', id: 'members', icon: Users },
    { name: 'Doações', id: 'donations', icon: HeartHandshake },
    { name: 'Relatórios', id: 'reports', icon: FileText },
    { name: 'Configurações', id: 'settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'caixa': return <Caixa />;
      case 'members': return <Members />;
      case 'donations': return <Donations />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Administrativo';
      case 'caixa': return 'Controle de Caixa e Despesas';
      case 'members': return 'Lista de Membros';
      case 'donations': return 'Doações';
      case 'reports': return 'Relatórios e Exportações';
      case 'settings': return 'Configurações do Sistema';
      default: return 'Dashboard Administrativo';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen h-dvh w-full bg-[#F6F9F6] font-sans text-slate-800 overflow-hidden">
      {/* Mobile header (in-flow) */}
      <div className="md:hidden bg-[#1A4531] text-white px-4 flex justify-between items-center h-14 shadow-md shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl font-medium font-serif tracking-tight text-white truncate">Lírios do Pântano</h1>
          <p className="text-[9px] text-[#A3BCA7] uppercase tracking-widest font-bold truncate">{getTitle()}</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-[#A3BCA7] active:bg-[#23603A] rounded transition-colors"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop para fechar o menu no mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (drawer overlay no mobile, fixa no desktop) */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 bg-[#1A4531] text-white w-64 flex flex-col transition-transform duration-300 ease-in-out z-50 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.05)]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Cabeçalho do drawer no mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#23603A] shrink-0">
          <span className="text-sm font-bold text-white">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 -mr-2 text-[#A3BCA7] active:bg-[#23603A] rounded transition-colors"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 hidden md:block">
          <h1 className="text-[26px] font-medium font-serif tracking-tight text-white">Lírios do Pântano</h1>
          <p className="text-[10px] text-[#A3BCA7] uppercase tracking-widest mt-1 font-bold">Gestão de Mensalidades</p>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-4 space-y-1 overflow-y-auto">
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
                  "w-full flex items-center space-x-3 px-3 py-3 md:py-2.5 rounded-lg transition-all",
                  activeTab === item.id
                    ? "bg-[#2E7A4A] text-white shadow-sm font-semibold"
                    : "hover:bg-[#23603A] text-[#A3BCA7] hover:text-white font-medium"
                )}
              >
                <Icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="text-[13px] flex-1 text-left">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-[#23603A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#2E7A4A] flex items-center justify-center text-xs font-bold uppercase text-white shadow-inner">AD</div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold truncate text-white">Admin Dirigente</p>
                <p className="text-[10px] text-[#A3BCA7] uppercase tracking-wider">Logado como Admin</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-[#A3BCA7] hover:text-white transition-colors" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (desktop) */}
        <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 items-center justify-between px-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0 z-10">
          <h2 className="text-[14px] font-bold text-[#1A4531] uppercase tracking-wider">{getTitle()}</h2>
          <div className="flex items-center gap-3 bg-[#EEF4F0] border border-[#A3BCA7]/30 rounded-lg px-4 py-1.5">
            <div className="text-right">
              <p className="text-[9px] font-bold text-[#2F6A4F] uppercase tracking-widest">Conta de Recebimento</p>
              <p className="text-xs font-bold text-[#1A4531]">Hellen · Mercado Pago</p>
              <p className="text-[10px] font-mono text-slate-500">ID 205810036 · App 2769633996819115</p>
            </div>
          </div>
        </header>

        {/* Content Scrollable Area — scroll único da página */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {renderContent()}
          </div>
        </div>

        {/* Bottom System Status Footer (desktop) */}
        <footer className="hidden md:flex h-8 bg-white border-t border-slate-200 px-6 items-center justify-between text-[10px] text-[#5A7A5F] shrink-0">
          <div className="flex space-x-4">
            <span className="font-medium">v1.0.0-stable</span>
            <span className="font-medium">ID Centro: LP-2023</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E7A4A] animate-pulse"></div>
            <span className="font-medium uppercase tracking-widest">Sincronizado com a nuvem</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
