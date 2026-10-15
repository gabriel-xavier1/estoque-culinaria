import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ShoppingCart, 
  UtensilsCrossed,
  Printer, 
  ChevronRight,
  GraduationCap,
  Wheat,
  Pizza,
  Cake,
  ChefHat,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../api';

const COURSES_CONFIG = [
  { id: 'all', name: 'Todos os Cursos', icon: GraduationCap, color: 'text-slate-700' },
  { id: 'Padeiro', name: 'Padeiro', icon: Wheat, color: 'text-amber-700' },
  { id: 'Pizzaiolo', name: 'Pizzaiolo', icon: Pizza, color: 'text-orange-600' },
  { id: 'Confeitaria', name: 'Confeitaria', icon: Cake, color: 'text-pink-600' },
  { id: 'Cozinha Geral', name: 'Cozinha Geral', icon: ChefHat, color: 'text-indigo-600' }
];

export default function Dashboard({ data, onNavigate, onOpenPurchaseModal, onOpenConsumptionModal }) {
  const [selectedCourse, setSelectedCourse] = useState('all');

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="text-xs text-slate-500 font-medium">Carregando painel da cozinha...</p>
      </div>
    );
  }

  // Filtragem por curso selecionado
  const filteredBatches = selectedCourse === 'all'
    ? (data.urgentBatches || [])
    : (data.urgentBatches || []).filter(b => 
        (b.foodItemCourseList && b.foodItemCourseList.includes(selectedCourse)) ||
        (b.foodItemCourses && b.foodItemCourses.includes(selectedCourse))
      );

  const filteredLowStock = selectedCourse === 'all'
    ? (data.lowStockItems || [])
    : (data.lowStockItems || []).filter(item => 
        (item.courseList && item.courseList.includes(selectedCourse)) ||
        (item.courses && item.courses.includes(selectedCourse))
      );

  // Formatação de data em português
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const hasIssues = data.expiredCount > 0 || data.lowStockCount > 0 || data.expiringIn7DaysCount > 0;

  return (
    <div className="space-y-6">
      {/* 1. TOPO: Identificação Limpa e Status da Cozinha */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <ChefHat className="w-4 h-4" />
              <span>Curso de Culinária & Gastronomia • Controle de Estoque</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 capitalize">
              {todayFormatted}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão simplificada de insumos, compras mensais e consumo em aulas práticas.
            </p>
          </div>

          {/* Status Geral da Cozinha */}
          <div className="shrink-0">
            {data.expiredCount > 0 ? (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Atenção Sanitária</div>
                  <div className="text-[11px] text-red-600 font-medium">
                    {data.expiredCount} {data.expiredCount === 1 ? 'lote vencido para descarte' : 'lotes vencidos para descarte'}
                  </div>
                </div>
              </div>
            ) : data.lowStockCount > 0 ? (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Reposição Necessária</div>
                  <div className="text-[11px] text-amber-700 font-medium">
                    {data.lowStockCount} {data.lowStockCount === 1 ? 'insumo com estoque baixo' : 'insumos com estoque baixo'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Cozinha em Ordem</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Todos os insumos dentro da validade</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerta Prioritário se houver lote vencido */}
        {data.expiredCount > 0 && (
          <div className="mt-4 pt-4 border-t border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50/60 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-2xl">
            <div className="flex items-start gap-2.5 text-xs text-red-800">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regra ANVISA:</strong> Existem alimentos que ultrapassaram a data de validade. 
                Eles foram isolados e não devem ser levados para as bancadas de aula.
              </span>
            </div>
            <button
              onClick={() => onNavigate('expiration')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ver e Descartar Lotes</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. GRANDES BOTÕES DE AÇÃO PRÁTICA (Mobile First) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Ação 1: Registrar Saída em Aula */}
        <button
          onClick={onOpenConsumptionModal}
          className="group text-left bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full">
              Aula Prática
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-base font-bold leading-tight">Baixa de Ingredientes na Aula</h2>
            <p className="text-xs text-amber-100 mt-1">
              Registrar consumo imediato nas bancadas de Padeiro, Pizzaiolo ou Confeitaria.
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
            <span>Abrir formulário de baixa</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Ação 2: Registrar Compra / Recebimento */}
        <button
          onClick={onOpenPurchaseModal}
          className="group text-left bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Compras Mensais
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-base font-bold text-slate-800 leading-tight">Nova Compra ou Recebimento</h2>
            <p className="text-xs text-slate-500 mt-1">
              Dar entrada em novos lotes de farinha, queijo, carnes e suprimentos.
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-all">
            <span>Registrar entrada de insumo</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Ação 3: Imprimir Lista com Logos Oficiais (SP / FAT) */}
        <button
          onClick={() => onNavigate('print')}
          className="group text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] flex flex-col justify-between sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              Folha Oficial A4
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-base font-bold text-slate-800 leading-tight">Lista para Compras e Conferência</h2>
            <p className="text-xs text-slate-500 mt-1">
              Formato com cabeçalho oficial do Governo de SP e Fundação FAT.
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:translate-x-1 transition-all">
            <span>Visualizar folha de impressão</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 3. FILTRO POR CURSO DE CULINÁRIA (Para responder à necessidade do usuário) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Filtrar Informações por Curso de Culinária
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Veja exatamente os ingredientes necessários para cada turma
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {COURSES_CONFIG.map((course) => {
            const Icon = course.icon;
            const isSelected = selectedCourse === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : course.color}`} />
                <span>{course.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. OS 2 PILARES DA COZINHA (O que usar hoje vs O que precisa comprar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PILAR 1: Regra PVPS - O que Usar Primeiro nas Aulas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  O que Usar Primeiro (Regra PVPS)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Primeiro que Vence, Primeiro que Sai • Prioridade para as receitas de hoje
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('expiration')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 shrink-0"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 divide-y divide-slate-100 flex-1">
            {filteredBatches.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">Tudo em dia com as validades!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nenhum insumo urgente para {selectedCourse === 'all' ? 'os cursos' : `o curso ${selectedCourse}`}.
                </p>
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const isExpired = batch.expirationStatus === 'Vencido';
                const isUrgent = batch.expirationStatus === 'Urgente';

                return (
                  <div key={batch.id} className="p-2.5 sm:p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {batch.foodItemName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            Lote: {batch.batchNumber}
                          </span>
                          {/* Badges de Cursos */}
                          {batch.foodItemCourseList && batch.foodItemCourseList.map((c, i) => (
                            <span key={i} className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Disponível: <strong className="text-slate-800">{formatNumber(batch.currentQuantity, batch.foodItemUnit)}</strong> • Vencimento: {formatDate(batch.expirationDate)}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Vencido</span>
                          </span>
                        ) : isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            <span>{batch.daysUntilExpiration} dias</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{batch.daysUntilExpiration} dias</span>
                          </span>
                        )}

                        <button
                          onClick={onOpenConsumptionModal}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                        >
                          Usar na aula &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PILAR 2: Falta Comprar - Estoque Baixo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  O que Precisa Comprar (Estoque Baixo)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Insumos que atingiram o limite mínimo para as próximas turmas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 inline-flex items-center gap-1 shrink-0"
            >
              Ver catálogo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 divide-y divide-slate-100 flex-1">
            {filteredLowStock.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">Estoque completo e abastecido!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nenhum ingrediente em falta para {selectedCourse === 'all' ? 'os cursos' : `o curso ${selectedCourse}`}.
                </p>
              </div>
            ) : (
              filteredLowStock.map((item) => {
                const isZero = item.stockStatus === 'Zerado' || item.totalQuantity === 0;
                const deficit = Math.max(0, item.minQuantity - item.totalQuantity);

                return (
                  <div key={item.id} className="p-2.5 sm:p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {item.category}
                          </span>
                          {/* Badges de Cursos */}
                          {item.courseList && item.courseList.map((c, i) => (
                            <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Atual: <strong className={isZero ? 'text-red-700 font-bold' : 'text-amber-800'}>{formatNumber(item.totalQuantity, item.unit)}</strong> • Mínimo necessário: {formatNumber(item.minQuantity, item.unit)}
                          {deficit > 0 && (
                            <span className="text-red-600 font-semibold ml-1">
                              (Faltam {formatNumber(deficit, item.unit)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isZero 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isZero ? 'Esgotado' : 'Estoque Baixo'}</span>
                        </span>

                        <button
                          onClick={onOpenPurchaseModal}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          Adicionar à compra &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. RESUMO DE INDICADORES (Apenas 4 números diretos e essenciais) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Cadastrado */}
        <div 
          onClick={() => onNavigate('catalog')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Insumos Cadastrados</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{data.totalItems}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ingredientes no catálogo</div>
        </div>

        {/* Card 2: Estoque Baixo */}
        <div 
          onClick={() => onNavigate('catalog')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Abaixo do Mínimo</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800">{data.lowStockCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Precisam de compra</div>
        </div>

        {/* Card 3: Validades Críticas */}
        <div 
          onClick={() => onNavigate('expiration')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vencendo em 7 dias</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-800">{data.expiringIn7DaysCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Priorizar no cardápio</div>
        </div>

        {/* Card 4: Consumo em Aula */}
        <div 
          onClick={() => onNavigate('consumption')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Consumo no Mês</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-900">{formatNumber(data.totalConsumptionThisMonth)} un/kg</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Utilizados nas aulas</div>
        </div>
      </div>

      {/* 6. ATIVIDADES RECENTES (Compacto e legível em celulares) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Últimas Movimentações na Cozinha</h3>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
          >
            Ver relatórios <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {(!data.recentTransactions || data.recentTransactions.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma movimentação registrada recentemente.
            </div>
          ) : (
            data.recentTransactions.slice(0, 5).map((tx) => {
              const isEntry = tx.transactionType === 'Entrada';
              const isLoss = tx.reason?.toLowerCase().includes('perda') || tx.reason?.toLowerCase().includes('descarte');

              return (
                <div key={tx.id} className="p-3 sm:p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isEntry 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : isLoss 
                          ? 'bg-rose-50 text-rose-700' 
                          : 'bg-amber-50 text-amber-700'
                    }`}>
                      {isEntry ? (
                        <ArrowDownCircle className="w-4 h-4" />
                      ) : isLoss ? (
                        <Trash2 className="w-4 h-4" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {tx.foodItemName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {tx.activity || tx.reason} {tx.responsible && `• ${tx.responsible}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs sm:text-sm font-bold ${
                      isEntry ? 'text-emerald-700' : 'text-slate-800'
                    }`}>
                      {isEntry ? '+' : '-'}{formatNumber(tx.quantity, tx.foodItemUnit)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatDate(tx.transactionDate)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
