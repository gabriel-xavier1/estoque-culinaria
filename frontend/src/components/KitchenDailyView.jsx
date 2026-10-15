import React, { useState } from 'react';
import { 
  ChefHat, 
  UtensilsCrossed, 
  ShoppingCart, 
  Printer, 
  GraduationCap, 
  Wheat, 
  Pizza, 
  Cake, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import { formatDate, formatNumber } from '../api';

const COURSES_CONFIG = [
  { id: 'all', name: 'Todos os Cursos', icon: GraduationCap, color: 'text-slate-700' },
  { id: 'Padeiro', name: 'Padeiro', icon: Wheat, color: 'text-amber-700' },
  { id: 'Pizzaiolo', name: 'Pizzaiolo', icon: Pizza, color: 'text-orange-600' },
  { id: 'Confeitaria', name: 'Confeitaria', icon: Cake, color: 'text-pink-600' },
  { id: 'Cozinha Geral', name: 'Cozinha Geral', icon: ChefHat, color: 'text-indigo-600' }
];

export default function KitchenDailyView({ 
  data, 
  items = [], 
  onNavigate, 
  onRegisterConsumption, 
  onRegisterPurchase,
  onDiscardBatch 
}) {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [quickActionModal, setQuickActionModal] = useState(null); // 'consume' | 'purchase' | null
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [actionQuantity, setActionQuantity] = useState('');
  const [actionExpDate, setActionExpDate] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data) return null;

  // Filtragem
  const filteredItems = items.filter(item => {
    return selectedCourse === 'all' 
      ? true 
      : (item.courseList && item.courseList.includes(selectedCourse)) || (item.courses && item.courses.includes(selectedCourse));
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

  const openQuickConsume = (item) => {
    setSelectedFoodItem(item || filteredItems[0] || items[0]);
    setActionQuantity('');
    setActionNotes('');
    setQuickActionModal('consume');
  };

  const openQuickPurchase = (item) => {
    setSelectedFoodItem(item || filteredItems[0] || items[0]);
    setActionQuantity('');
    const defDate = new Date();
    defDate.setMonth(defDate.getMonth() + 2);
    setActionExpDate(defDate.toISOString().split('T')[0]);
    setActionNotes('');
    setQuickActionModal('purchase');
  };

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
          notes: actionNotes || 'Baixa de aula prática diária'
        });
      }
      setQuickActionModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          notes: actionNotes || 'Entrada rápida de compras'
        });
      }
      setQuickActionModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-4">
      {/* 1. STATUS OPERACIONAL DO DIA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <ChefHat className="w-4 h-4" />
            <span>Rotina da Cozinha • Aulas Práticas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize mt-0.5">{todayFormatted}</h2>
          <p className="text-xs text-slate-500">Dê baixa no que gastou nas bancadas e receba compras em menos de 10 segundos.</p>
        </div>

        <div>
          {data.expiredCount > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{data.expiredCount} lote(s) vencido(s)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cozinha Segura e em Ordem</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. SELETOR DE CURSO DIRETO */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            Turma da Aula de Hoje:
          </span>
          <span className="text-[11px] text-slate-400 font-normal">Filtra imediatamente a despensa da turma</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {COURSES_CONFIG.map((course) => {
            const Icon = course.icon;
            const isSelected = selectedCourse === course.id;
            const count = course.id === 'all' 
              ? items.length 
              : items.filter(i => (i.courseList && i.courseList.includes(course.id)) || (i.courses && i.courses.includes(course.id))).length;

            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : course.color}`} />
                <span>{course.name}</span>
                <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AS DUAS AÇÕES DE 1 TOQUE (GRANDES, MOBILE-FIRST) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => openQuickConsume(null)}
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Dar Baixa na Aula</div>
              <div className="text-[11px] text-amber-100 mt-0.5">Retirar ingredientes usados hoje</div>
            </div>
          </div>
          <Plus className="w-4 h-4 text-white shrink-0" />
        </button>

        <button
          onClick={() => openQuickPurchase(null)}
          className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Chegou Compra</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Receber novos pacotes</div>
            </div>
          </div>
          <Plus className="w-4 h-4 text-slate-500 shrink-0" />
        </button>

        <button
          onClick={() => onNavigate('print')}
          className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Folha A4 (SP / FAT)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Imprimir lista oficial para compras</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* 4. OS DOIS PILARES ESSENCIAIS: PVPS (USAR HOJE) E ESTOQUE BAIXO (COMPRAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BLOCO 1: REGRA PVPS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">O que Usar Primeiro (Regra PVPS)</h3>
                <p className="text-[11px] text-slate-500">Lotes mais antigos para consumir nas receitas de hoje</p>
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-3 divide-y divide-slate-100 flex-1">
            {filteredBatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-1" />
                Nenhum lote crítico no momento para este curso.
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const correspondingItem = items.find(i => i.id === batch.foodItemId);
                const isExpired = batch.expirationStatus === 'Vencido';

                return (
                  <div key={batch.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{batch.foodItemName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Saldo: <strong className="text-slate-800">{formatNumber(batch.currentQuantity, batch.foodItemUnit)}</strong> • Vence: {formatDate(batch.expirationDate)}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isExpired ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {isExpired ? 'Vencido' : `${batch.daysUntilExpiration} dias`}
                      </span>

                      {isExpired ? (
                        <button
                          onClick={() => onDiscardBatch && onDiscardBatch(batch)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Descartar
                        </button>
                      ) : (
                        <button
                          onClick={() => openQuickConsume(correspondingItem)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Usar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BLOCO 2: O QUE PRECISA COMPRAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">O que Precisa Comprar (Estoque Baixo)</h3>
                <p className="text-[11px] text-slate-500">Insumos abaixo da quantidade mínima recomendada</p>
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-3 divide-y divide-slate-100 flex-1">
            {filteredLowStock.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-1" />
                Estoque 100% abastecido para as turmas.
              </div>
            ) : (
              filteredLowStock.map((item) => {
                const deficit = Math.max(0, item.minQuantity - item.totalQuantity);
                return (
                  <div key={item.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Tem: <strong className="text-amber-800">{formatNumber(item.totalQuantity, item.unit)}</strong> • Mín: {formatNumber(item.minQuantity, item.unit)}
                        {deficit > 0 && <span className="text-red-600 font-semibold ml-1">(Faltam {formatNumber(deficit, item.unit)})</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => openQuickPurchase(item)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shrink-0 transition-colors"
                    >
                      Receber
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: BAIXA RÁPIDA DE AULA */}
      {quickActionModal === 'consume' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">Dar Baixa na Aula</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickConsumeSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ingrediente usado:</label>
                <select
                  value={selectedFoodItem?.id || ''}
                  onChange={(e) => setSelectedFoodItem(items.find(i => i.id === parseInt(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Saldo: {formatNumber(i.totalQuantity, i.unit)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade ({selectedFoodItem?.unit || 'kg'}):</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={selectedFoodItem?.totalQuantity || 9999}
                  required
                  placeholder="Ex: 2.5"
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl"
                  autoFocus
                />
                <div className="flex gap-1.5 mt-2">
                  {[0.5, 1, 2, 5].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setActionQuantity(qty.toString())}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                    >
                      {qty} {selectedFoodItem?.unit || 'kg'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setQuickActionModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting || !actionQuantity || parseFloat(actionQuantity) <= 0} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Gravando...' : 'Confirmar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECEBER COMPRA */}
      {quickActionModal === 'purchase' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-emerald-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Receber Compra / Entrada</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickPurchaseSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ingrediente que chegou:</label>
                <select
                  value={selectedFoodItem?.id || ''}
                  onChange={(e) => setSelectedFoodItem(items.find(i => i.id === parseInt(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Atual: {formatNumber(i.totalQuantity, i.unit)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade ({selectedFoodItem?.unit || 'kg'}):</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="Ex: 10"
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Validade:</label>
                <input
                  type="date"
                  required
                  value={actionExpDate}
                  onChange={(e) => setActionExpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setQuickActionModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting || !actionQuantity || parseFloat(actionQuantity) <= 0 || !actionExpDate} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Salvando...' : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
