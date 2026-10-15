import React, { useState } from 'react';
import { 
  ChefHat, 
  LayoutDashboard, 
  Apple, 
  PackagePlus, 
  Flame, 
  CalendarClock, 
  FileText, 
  Printer, 
  SlidersHorizontal,
  AlertTriangle,
  MoreHorizontal,
  X,
  ClipboardCheck
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, dashboardData, onOpenSettings }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const expiredCount = dashboardData?.expiredCount || 0;
  const urgentCount = dashboardData?.expiringIn7DaysCount || 0;
  const totalAlerts = expiredCount + urgentCount;

  // Os 7 menus exatos solicitados no item 10 da especificação
  const navItems = [
    { id: 'dashboard', label: 'Painel Inicial', icon: LayoutDashboard },
    { id: 'catalog', label: 'Cadastro de Alimentos', icon: Apple },
    { id: 'purchases', label: 'Compras e Entradas', icon: PackagePlus },
    { id: 'consumption', label: 'Consumo e Saídas', icon: Flame },
    { 
      id: 'expiration', 
      label: 'Controle de Validade', 
      icon: CalendarClock,
      badge: totalAlerts > 0 ? totalAlerts : null,
      badgeColor: expiredCount > 0 ? 'bg-red-500' : 'bg-amber-500'
    },
    { id: 'reports', label: 'Relatórios Mensais', icon: FileText },
    { id: 'print', label: 'Lista para Impressão', icon: Printer },
  ];

  // Abas principais para a barra móvel inferior (Mobile Bottom Bar)
  const mobileBottomItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'catalog', label: 'Alimentos', icon: Apple },
    { id: 'purchases', label: 'Entradas', icon: PackagePlus },
    { id: 'consumption', label: 'Saídas', icon: Flame },
    { 
      id: 'expiration', 
      label: 'Validades', 
      icon: CalendarClock,
      badge: totalAlerts > 0 ? totalAlerts : null,
      badgeColor: expiredCount > 0 ? 'bg-red-500' : 'bg-amber-500'
    },
  ];

  const isMoreActive = activeTab === 'reports' || activeTab === 'print' || activeTab === 'audit';

  return (
    <>
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-15 sm:h-16">
            {/* Logo e Nome do Curso */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-slate-900 tracking-tight">Estoque de Culinária</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Aulas Práticas
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">Gestão Simples de Alimentos & Validades (PVPS)</p>
              </div>
            </div>

            {/* Atalhos Rápidos no Topo */}
            <div className="flex items-center gap-2">
              {expiredCount > 0 && (
                <button 
                  onClick={() => setActiveTab('expiration')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0" />
                  <span>{expiredCount} <span className="hidden sm:inline">{expiredCount === 1 ? 'vencido' : 'vencidos'}</span></span>
                </button>
              )}

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium border border-slate-200 transition-colors"
                title="Configurar Prazos de Validade"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Configurações</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7 Menus Principais no Desktop / Tablet */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <nav className="flex space-x-1 py-1" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                        isActive ? 'bg-amber-700' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Mobile First UX para Cozinha) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-1 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-lg transition-colors ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                  {item.badge && (
                    <span className={`absolute -top-1 -right-2.5 w-4 h-4 text-[9px] font-bold rounded-full text-white flex items-center justify-center ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Botão "Mais" para Relatórios, Impressão e Configurações */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-lg transition-colors ${
              isMoreActive || isMobileMenuOpen ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-tight">Mais</span>
          </button>
        </div>
      </nav>

      {/* Sheet / Menu "Mais" no Mobile */}
      {isMobileMenuOpen && (
        <div className="no-print md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-4 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Mais Opções de Estoque</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-semibold ${
                  activeTab === 'reports' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Relatórios Mensais</div>
                  <div className="text-[11px] text-slate-400 font-normal">Consumo, compras, perdas e saldo mensal</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('print');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-semibold ${
                  activeTab === 'print' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Lista para Impressão</div>
                  <div className="text-[11px] text-slate-400 font-normal">Layout limpo A4 para prancheta e conferência</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Prazos de Alerta</div>
                  <div className="text-[11px] text-slate-400 font-normal">Ajustar dias para alertas de validade (7d / 30d)</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
