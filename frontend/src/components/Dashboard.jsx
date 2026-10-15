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
  Scale,
  Plus,
  Minus,
  Check,
  X,
  Search
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../api';

const COURSES_CONFIG = [
  { id: 'all', name: 'Todos os Cursos', icon: GraduationCap, color: 'text-slate-700' },
  { id: 'Padeiro', name: 'Padeiro', icon: Wheat, color: 'text-amber-700' },
  { id: 'Pizzaiolo', name: 'Pizzaiolo', icon: Pizza, color: 'text-orange-600' },
  { id: 'Confeitaria', name: 'Confeitaria', icon: Cake, color: 'text-pink-600' },
  { id: 'Cozinha Geral', name: 'Cozinha Geral', icon: ChefHat, color: 'text-indigo-600' }
];

export default function Dashboard({ 
  data, 
  items = [], 
  onNavigate, 
  onRegisterConsumption, 
  onRegisterPurchase, 
  onAdjustStock,
  onDiscardBatch 
}) {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [viewMode, setViewMode] = useState('attention'); // 'attention' | 'all-items'
  const [searchFilter, setSearchFilter] = useState('');

  // Estados dos Modais Rápidos de 1 Toque
  const [quickActionModal, setQuickActionModal] = useState(null); // 'consume' | 'purchase' | 'audit' | null
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [actionQuantity, setActionQuantity] = useState('');
  const [actionExpDate, setActionExpDate] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="text-xs text-slate-500 font-medium">Carregando bancada da cozinha...</p>
      </div>
    );
  }

  // Filtragem dos Alimentos e Lotes pelo Curso Selecionado
  const filteredItems = items.filter(item => {
    const matchesCourse = selectedCourse === 'all' 
      ? true 
      : (item.courseList && item.courseList.includes(selectedCourse)) || (item.courses && item.courses.includes(selectedCourse));
    const matchesSearch = !searchFilter 
      ? true 
      : item.name.toLowerCase().includes(searchFilter.toLowerCase()) || (item.category && item.category.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCourse && matchesSearch;
  });

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

  // Abertura dos diálogos rápidos
  const openQuickConsume = (item) => {
    setSelectedFoodItem(item || filteredItems[0] || items[0]);
    setActionQuantity('');
    setActionNotes('');
    setQuickActionModal('consume');
  };

  const openQuickPurchase = (item) => {
    setSelectedFoodItem(item || filteredItems[0] || items[0]);
    setActionQuantity('');
    // Data padrão: 2 meses à frente
    const defDate = new Date();
    defDate.setMonth(defDate.getMonth() + 2);
    setActionExpDate(defDate.toISOString().split('T')[0]);
    setActionNotes('');
    setQuickActionModal('purchase');
  };

  const openQuickAudit = (item) => {
    setSelectedFoodItem(item);
    setActionQuantity(item?.totalQuantity || '');
    setActionNotes('');
    setQuickActionModal('audit');
  };

  // Submissão Rápida de Saída em Aula (Menos de 10 segundos)
  const handleQuickConsumeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFoodItem || !actionQuantity || parseFloat(actionQuantity) <= 0) return;
    
    setIsSubmitting(true);
    try {
      if (onRegisterConsumption) {
        await onRegisterConsumption({
          foodItemId: selectedFoodItem.id,
          quantity: parseFloat(actionQuantity),
          activity: selectedCourse !== 'all' ? `Aula Prática - ${selectedCourse}` : 'Aula Prática de Culinária',
          responsible: 'Chef de Aula',
          reason: 'Consumo em aula',
          notes: actionNotes || 'Baixa rápida pela bancada do dia'
        });
      }
      setQuickActionModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão Rápida de Entrada de Compra (Menos de 15 segundos)
  const handleQuickPurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFoodItem || !actionQuantity || parseFloat(actionQuantity) <= 0 || !actionExpDate) return;

    setIsSubmitting(true);
    try {
      if (onRegisterPurchase) {
        const todayStr = new Date().toISOString().split('T')[0];
        await onRegisterPurchase({
          foodItemId: selectedFoodItem.id,
          quantity: parseFloat(actionQuantity),
          expirationDate: actionExpDate,
          receivedDate: todayStr,
          purchaseDate: todayStr,
          supplier: 'Fornecedor Habitual',
          batchNumber: `LOT-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
          notes: actionNotes || 'Entrada rápida de compras mensais'
        });
      }
      setQuickActionModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão Rápida de Ajuste / Balanço
  const handleQuickAuditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFoodItem || actionQuantity === '') return;

    setIsSubmitting(true);
    try {
      if (onAdjustStock) {
        await onAdjustStock({
          foodItemId: selectedFoodItem.id,
          physicalQuantity: parseFloat(actionQuantity),
          responsible: 'Chef / Monitor de Bancada',
          reason: 'Conferência rápida de despensa',
          notes: actionNotes || 'Ajuste de conferência diária'
        });
      }
      setQuickActionModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Data formatada de hoje
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-5">
      {/* 1. CABEÇALHO DO DIA (LIMPO & OBJETIVO) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <ChefHat className="w-4 h-4" />
              <span>Bancada Diária • 5 Minutos por Dia</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize mt-0.5">
              {todayFormatted}
            </h1>
          </div>

          {/* Status Geral da Cozinha */}
          <div>
            {data.expiredCount > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{data.expiredCount} lote(s) vencido(s) para descarte</span>
              </div>
            ) : data.lowStockCount > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{data.lowStockCount} insumo(s) abaixo do mínimo</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Despensa em Ordem</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerta de Descarte Imediato (Se houver vencido) */}
        {data.expiredCount > 0 && (
          <div className="mt-3 pt-3 border-t border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-red-50/70 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 sm:p-4 rounded-b-2xl">
            <span className="text-xs text-red-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <strong>Regra ANVISA:</strong> Alimentos vencidos não podem ir para as bancadas de aula.
            </span>
            <button
              onClick={() => onNavigate('expiration')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Descartar no Sistema</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. SELETOR DE CURSO DIRETO (Padeiro, Pizzaiolo, Confeitaria, Cozinha Geral) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Selecione a Turma / Curso da Aula:</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Filtra imediatamente a despensa da aula
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {COURSES_CONFIG.map((course) => {
            const Icon = course.icon;
            const isSelected = selectedCourse === course.id;
            const courseCount = course.id === 'all' 
              ? items.length 
              : items.filter(i => (i.courseList && i.courseList.includes(course.id)) || (i.courses && i.courses.includes(course.id))).length;

            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : course.color}`} />
                <span>{course.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {courseCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AS DUAS AÇÕES PRINCIPAIS DE 1 TOQUE (Mobile First) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Ação 1: Baixa Rápida de Aula */}
        <button
          onClick={() => openQuickConsume(null)}
          className="group text-left bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-4 rounded-2xl shadow-xs hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Dar Baixa na Aula</div>
              <div className="text-[11px] text-amber-100 mt-0.5">Retirar insumos usados nas receitas</div>
            </div>
          </div>
          <span className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
            <Plus className="w-4 h-4 text-white" />
          </span>
        </button>

        {/* Ação 2: Entrada Rápida de Compra */}
        <button
          onClick={() => openQuickPurchase(null)}
          className="group text-left bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl shadow-xs hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Chegou Compra</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dar entrada rápida em novos pacotes</div>
            </div>
          </div>
          <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
          </span>
        </button>

        {/* Ação 3: Imprimir Lista Oficial (SP / FAT) */}
        <button
          onClick={() => onNavigate('print')}
          className="group text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-2xl shadow-xs hover:shadow-sm transition-all flex items-center justify-between sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Lista Oficial para Impressão</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Folha A4 oficial Governo SP & Fundação FAT</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4. SELETOR DE MODO DA BANCADA: "O que precisa de atenção" VS "Todos os Insumos" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('attention')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'attention'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Atenção Hoje (PVPS & Falta)
          </button>
          <button
            onClick={() => setViewMode('all-items')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'all-items'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos os Ingredientes da Aula ({filteredItems.length})
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* 5. CONTEÚDO PRINCIPAL: MODO ATENÇÃO HOJE (PVPS & COMPRAS) */}
      {viewMode === 'attention' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* BLOCO 1: O QUE USAR PRIMEIRO HOJE (REGRA PVPS) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    O que Usar Primeiro (Regra PVPS)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Alimentos que vencem mais cedo para gastar nas receitas
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 sm:p-3 divide-y divide-slate-100 flex-1">
              {filteredBatches.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-1" />
                  Nenhum insumo urgente para este curso.
                </div>
              ) : (
                filteredBatches.map((batch) => {
                  const isExpired = batch.expirationStatus === 'Vencido';
                  const isUrgent = batch.expirationStatus === 'Urgente';
                  const correspondingItem = items.find(i => i.id === batch.foodItemId);

                  return (
                    <div key={batch.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {batch.foodItemName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Saldo: <strong className="text-slate-800">{formatNumber(batch.currentQuantity, batch.foodItemUnit)}</strong> • Vence: {formatDate(batch.expirationDate)}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Vencido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 text-orange-600" />
                            {batch.daysUntilExpiration}d
                          </span>
                        )}

                        <button
                          onClick={() => openQuickConsume(correspondingItem)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Usar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* BLOCO 2: O QUE ESTÁ FALTANDO (ESTOQUE BAIXO) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    O que Precisa Comprar (Estoque Baixo)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Abaixo da quantidade mínima para as próximas aulas
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 sm:p-3 divide-y divide-slate-100 flex-1">
              {filteredLowStock.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-1" />
                  Estoque completo e seguro para as aulas.
                </div>
              ) : (
                filteredLowStock.map((item) => {
                  const deficit = Math.max(0, item.minQuantity - item.totalQuantity);
                  return (
                    <div key={item.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Tem: <strong className="text-amber-800">{formatNumber(item.totalQuantity, item.unit)}</strong> • Mín: {formatNumber(item.minQuantity, item.unit)}
                          {deficit > 0 && <span className="text-red-600 font-semibold ml-1">(Faltam {formatNumber(deficit, item.unit)})</span>}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => openQuickPurchase(item)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Receber
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 6. CONTEÚDO ALTERNATIVO: GRADE DE TODOS OS INGREDIENTES DA AULA */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Nenhum ingrediente encontrado com os filtros atuais.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isLow = item.totalQuantity < item.minQuantity;
              const isZero = item.totalQuantity === 0;

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">{item.category}</span>
                          {item.courseList && item.courseList.map((c, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isZero 
                          ? 'bg-red-100 text-red-800' 
                          : isLow 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {isZero ? 'Zerado' : isLow ? 'Baixo' : 'Normal'}
                      </span>
                    </div>

                    {/* Saldo Grande */}
                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Saldo em estoque</div>
                        <div className="text-xl font-extrabold text-slate-900">
                          {formatNumber(item.totalQuantity, item.unit)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Mínimo: {formatNumber(item.minQuantity, item.unit)}</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Botões Rápidos de Ação no próprio Cartão */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => openQuickConsume(item)}
                      className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Registrar saída na aula"
                    >
                      <Minus className="w-3 h-3" />
                      <span>Usar</span>
                    </button>
                    <button
                      onClick={() => openQuickPurchase(item)}
                      className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Registrar compra recebida"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Receber</span>
                    </button>
                    <button
                      onClick={() => openQuickAudit(item)}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Conferir balanço real na balança"
                    >
                      <Scale className="w-3 h-3 text-slate-500" />
                      <span>Pesar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================================
          MODAIS RÁPIDOS DE 1 TOQUE (EMBUTIDOS DIRETAMENTE NO DASHBOARD)
          ========================================================================= */}

      {/* MODAL 1: BAIXA RÁPIDA DE AULA (Menos de 10 segundos) */}
      {quickActionModal === 'consume' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">Dar Baixa na Aula</h3>
              </div>
              <button 
                onClick={() => setQuickActionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickConsumeSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qual ingrediente foi usado?
                </label>
                <select
                  value={selectedFoodItem?.id || ''}
                  onChange={(e) => {
                    const item = items.find(i => i.id === parseInt(e.target.value));
                    setSelectedFoodItem(item);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Saldo: {formatNumber(i.totalQuantity, i.unit)})
                    </option>
                  ))}
                </select>
                {selectedFoodItem && (
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Disponível para aula: <strong>{formatNumber(selectedFoodItem.totalQuantity, selectedFoodItem.unit)}</strong></span>
                    <span>Regra PVPS: abate lote mais antigo</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade Retirada ({selectedFoodItem?.unit || 'kg'}):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={selectedFoodItem?.totalQuantity || 9999}
                  required
                  placeholder="Ex: 2.5"
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />

                {/* Botões Rápidos de Quantidade */}
                <div className="flex gap-1.5 mt-2">
                  {[0.5, 1, 2, 5].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setActionQuantity(qty.toString())}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      {qty} {selectedFoodItem?.unit || 'kg'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observação ou Turma (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aula prática matutina"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !actionQuantity || parseFloat(actionQuantity) <= 0}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Gravando...' : 'Confirmar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENTRADA RÁPIDA DE COMPRA (Menos de 15 segundos) */}
      {quickActionModal === 'purchase' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-emerald-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Receber Compra / Entrada</h3>
              </div>
              <button 
                onClick={() => setQuickActionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPurchaseSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qual ingrediente chegou?
                </label>
                <select
                  value={selectedFoodItem?.id || ''}
                  onChange={(e) => {
                    const item = items.find(i => i.id === parseInt(e.target.value));
                    setSelectedFoodItem(item);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Atual: {formatNumber(i.totalQuantity, i.unit)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade Recebida ({selectedFoodItem?.unit || 'kg'}):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="Ex: 10"
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />

                {/* Botões Rápidos de Quantidade */}
                <div className="flex gap-1.5 mt-2">
                  {[2, 5, 10, 20].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setActionQuantity(qty.toString())}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      +{qty} {selectedFoodItem?.unit || 'kg'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data de Validade da Embalagem:
                </label>
                <input
                  type="date"
                  required
                  value={actionExpDate}
                  onChange={(e) => setActionExpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />

                {/* Atalhos de Validade */}
                <div className="flex gap-1.5 mt-2">
                  {[
                    { label: '+30 dias', days: 30 },
                    { label: '+60 dias', days: 60 },
                    { label: '+180 dias', days: 180 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + preset.days);
                        setActionExpDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !actionQuantity || parseFloat(actionQuantity) <= 0 || !actionExpDate}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Salvando...' : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFERÊNCIA RÁPIDA / PESAGEM NA BALANÇA */}
      {quickActionModal === 'audit' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Conferir Saldo Real na Balança</h3>
              </div>
              <button 
                onClick={() => setQuickActionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAuditSubmit} className="p-4 space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Alimento:</div>
                <div className="text-base font-bold text-slate-900">{selectedFoodItem?.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Saldo atual no sistema: <strong>{formatNumber(selectedFoodItem?.totalQuantity, selectedFoodItem?.unit)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade Física Real Pesada / Contada ({selectedFoodItem?.unit || 'kg'}):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || actionQuantity === ''}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Ajustando...' : 'Gravar Conferência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
