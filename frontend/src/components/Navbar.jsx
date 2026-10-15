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
  Package,
  UtensilsCrossed,
  Zap,
  Layers,
  Sparkles,
  GraduationCap
} from 'lucide-react';

export default function Navbar({ 
  appExperience = 'integrated', 
  onSwitchExperience, 
  activeTab, 
  setActiveTab, 
  dashboardData, 
  onOpenSettings 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const expiredCount = dashboardData?.expiredCount || 0;
  const urgentCount = dashboardData?.expiringIn7DaysCount || 0;
  const totalAlerts = expiredCount + urgentCount;

  // Experiência 1: Cozinha Integrada (Aulas, Cursos & Turmas, Despensa, Folha A4)
  const integratedNavItems = [
    { id: 'kitchen-daily', label: 'Aulas & Rotina', icon: UtensilsCrossed },
    { id: 'courses', label: 'Cursos & Turmas', icon: GraduationCap },
    { 
      id: 'pantry-unified', 
      label: 'Despensa & Insumos', 
      icon: Package,
      badge: totalAlerts > 0 ? totalAlerts : null,
      badgeColor: expiredCount > 0 ? 'bg-red-500' : 'bg-amber-500'
    },
    { id: 'official-reports', label: 'Folha A4 & Relatórios', icon: Printer }
  ];

  // Experiência 2: ERP Modular Clássico (Dashboard, Cursos, Catálogo, Compras, Consumo, Validades, Relatórios, Impressão)
  const classicNavItems = [
    { id: 'dashboard', label: 'Painel Inicial', icon: LayoutDashboard },
    { id: 'courses', label: 'Cursos & Turmas', icon: GraduationCap },
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
    { id: 'print', label: 'Lista para Impressão', icon: Printer }
  ];

  const currentNavItems = appExperience === 'integrated' ? integratedNavItems : classicNavItems;

  return (
    <>
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo do Curso */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer" 
              onClick={() => setActiveTab(appExperience === 'integrated' ? 'kitchen-daily' : 'dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                    Estoque Culinária
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Aulas Práticas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                  Controle de Insumos • Princípio PVPS • Segurança Alimentar
                </p>
              </div>
            </div>

            {/* SELETOR GLOBAL DE VERSÕES DE UX (Permite comparar o app todo) */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 shadow-2xs">
                <button
                  onClick={() => onSwitchExperience && onSwitchExperience('integrated')}
                  className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    appExperience === 'integrated'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                  title="Experiência 1: 3 Áreas Unificadas, rápida e sem burocracia"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden md:inline">Versão 1: </span>
                  <span>Cozinha Integrada</span>
                </button>

                <button
                  onClick={() => onSwitchExperience && onSwitchExperience('classic')}
                  className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    appExperience === 'classic'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                  title="Experiência 2: 7 Módulos Clássicos Estilo ERP"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-200" />
                  <span className="hidden md:inline">Versão 2: </span>
                  <span>Painel Clássico</span>
                </button>
              </div>

              {/* Botão de Configurações */}
              <button
                onClick={onOpenSettings}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
                title="Configurar Alertas e Validades"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="hidden lg:inline">Prazos</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DESKTOP / TABLET (Muda conforme a versão ativa) */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? appExperience === 'integrated'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                        isActive ? 'bg-black/30' : item.badgeColor
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

      {/* NAVEGAÇÃO MÓVEL INFERIOR (BOTTOM BAR - MOBILE FIRST) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? appExperience === 'integrated'
                      ? 'text-amber-700 font-bold'
                      : 'text-indigo-700 font-bold'
                    : 'text-slate-500 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
