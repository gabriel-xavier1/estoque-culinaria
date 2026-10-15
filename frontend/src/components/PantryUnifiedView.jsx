import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Snowflake, 
  Scale, 
  Edit2, 
  ChevronDown, 
  ChevronUp, 
  X, 
  GraduationCap, 
  Filter, 
  Wheat, 
  Pizza, 
  Cake, 
  ChefHat,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { formatDate, formatNumber } from '../api';

const CATEGORIES = [
  'Todas',
  'Farinhas e Grãos',
  'Laticínios',
  'Carnes e Pescados',
  'Hortaliças e Folhas',
  'Frutas e Polpas',
  'Doces e Confeitaria',
  'Temperos e Especiarias',
  'Outros'
];

const COURSES = ['Padeiro', 'Pizzaiolo', 'Confeitaria', 'Cozinha Geral'];

export default function PantryUnifiedView({ 
  items = [], 
  batches = [], 
  onSaveItem, 
  onDeleteItem, 
  onRegisterConsumption, 
  onRegisterPurchase, 
  onAdjustStock,
  onFreezeBatch,
  onThawBatch,
  onDiscardBatch 
}) {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'urgent' | 'frozen'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Modais
  const [activeModal, setActiveModal] = useState(null); // 'create-item' | 'edit-item' | 'consume' | 'purchase' | 'audit' | 'freeze' | 'thaw'
  const [targetItem, setTargetItem] = useState(null);
  const [targetBatch, setTargetBatch] = useState(null);

  // Form States
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtragem
  const filteredItems = items.filter(item => {
    const matchCourse = selectedCourse === 'all' 
      ? true 
      : (item.courseList && item.courseList.includes(selectedCourse)) || (item.courses && item.courses.includes(selectedCourse));
    const matchCat = selectedCategory === 'Todas' ? true : item.category === selectedCategory;
    const matchSearch = !searchTerm 
      ? true 
      : item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const isLow = item.totalQuantity < item.minQuantity;
    const isUrgent = item.batches && item.batches.some(b => b.expirationStatus === 'Urgente' || b.expirationStatus === 'Vencido');
    const isFrozen = item.batches && item.batches.some(b => b.isFrozen);

    let matchStatus = true;
    if (statusFilter === 'low') matchStatus = isLow;
    if (statusFilter === 'urgent') matchStatus = isUrgent;
    if (statusFilter === 'frozen') matchStatus = isFrozen;

    return matchCourse && matchCat && matchSearch && matchStatus;
  });

  // Aberturas de Diálogos Rápidos
  const openItemModal = (item = null) => {
    setTargetItem(item);
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        unit: item.unit,
        minQuantity: item.minQuantity,
        storageLocation: item.storageLocation || '',
        courses: item.courseList || (item.courses ? item.courses.split(',').map(c => c.trim()) : ['Padeiro', 'Pizzaiolo']),
        notes: item.notes || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Farinhas e Grãos',
        unit: 'kg',
        minQuantity: 5,
        storageLocation: 'Despensa Seca',
        courses: ['Padeiro', 'Pizzaiolo'],
        notes: ''
      });
    }
    setActiveModal(item ? 'edit-item' : 'create-item');
  };

  const openConsume = (item) => {
    setTargetItem(item);
    setFormData({
      quantity: '',
      notes: ''
    });
    setActiveModal('consume');
  };

  const openPurchase = (item) => {
    setTargetItem(item);
    const defDate = new Date();
    defDate.setMonth(defDate.getMonth() + 2);
    setFormData({
      quantity: '',
      expirationDate: defDate.toISOString().split('T')[0],
      notes: ''
    });
    setActiveModal('purchase');
  };

  const openAudit = (item) => {
    setTargetItem(item);
    setFormData({
      physicalQuantity: item.totalQuantity || 0
    });
    setActiveModal('audit');
  };

  const openFreeze = (batch) => {
    setTargetBatch(batch);
    const defFrozen = new Date();
    defFrozen.setMonth(defFrozen.getMonth() + 3);
    setFormData({
      frozenExpirationDate: defFrozen.toISOString().split('T')[0],
      notes: 'Congelamento para pausar validade (-18°C)'
    });
    setActiveModal('freeze');
  };

  const openThaw = (batch) => {
    setTargetBatch(batch);
    const defThawed = new Date();
    defThawed.setDate(defThawed.getDate() + 2); // 48h ANVISA RDC 216
    setFormData({
      consumeUntilDate: defThawed.toISOString().split('T')[0],
      notes: 'Descongelamento sob refrigeração (4°C)'
    });
    setActiveModal('thaw');
  };

  // Submissões
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        minQuantity: parseFloat(formData.minQuantity) || 0,
        storageLocation: formData.storageLocation,
        courses: (formData.courses || []).join(', '),
        notes: formData.notes
      };
      if (onSaveItem) {
        await onSaveItem(payload, targetItem?.id);
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitConsume = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onRegisterConsumption) {
        await onRegisterConsumption({
          foodItemId: targetItem.id,
          quantity: parseFloat(formData.quantity),
          activity: 'Aula Prática de Culinária',
          responsible: 'Chef de Aula',
          reason: 'Consumo em aula',
          notes: formData.notes || 'Baixa pela despensa central'
        });
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onRegisterPurchase) {
        const todayStr = new Date().toISOString().split('T')[0];
        await onRegisterPurchase({
          foodItemId: targetItem.id,
          quantity: parseFloat(formData.quantity),
          expirationDate: formData.expirationDate,
          receivedDate: todayStr,
          purchaseDate: todayStr,
          supplier: 'Fornecedor Habitual',
          batchNumber: `LOT-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
          notes: formData.notes || 'Entrada pela despensa central'
        });
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAudit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onAdjustStock) {
        await onAdjustStock({
          foodItemId: targetItem.id,
          physicalQuantity: parseFloat(formData.physicalQuantity),
          responsible: 'Conferente da Despensa',
          reason: 'Conferência física / balança',
          notes: 'Ajuste gravado pela despensa central'
        });
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFreeze = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onFreezeBatch) {
        await onFreezeBatch({
          batchId: targetBatch.id,
          frozenExpirationDate: formData.frozenExpirationDate,
          notes: formData.notes
        });
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitThaw = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onThawBatch) {
        await onThawBatch({
          batchId: targetBatch.id,
          consumeUntilDate: formData.consumeUntilDate,
          notes: formData.notes
        });
      }
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. BARRA DE CONTROLE & BUSCA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Package className="w-4 h-4" />
              <span>Despensa Central Inteligente</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Todos os Insumos, Lotes e Frio</h2>
            <p className="text-xs text-slate-500">Tudo do alimento num só lugar: saldo, compras, lotes, validade e congelamento.</p>
          </div>

          <button
            onClick={() => openItemModal(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Alimento</span>
          </button>
        </div>

        {/* Filtros em linha */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Cursos */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'Padeiro', 'Pizzaiolo', 'Confeitaria', 'Cozinha Geral'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCourse(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCourse === c
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>

          {/* Categorias */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {/* Status */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'low'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Estoque Baixo
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'urgent' ? 'all' : 'urgent')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'urgent'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Vencendo
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'frozen' ? 'all' : 'frozen')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'frozen'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Congelados
            </button>
          </div>

          {/* Busca */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 2. GRADE DE ALIMENTOS INTELIGENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Nenhum ingrediente encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLow = item.totalQuantity < item.minQuantity;
            const isZero = item.totalQuantity === 0;
            const isExpanded = expandedItemId === item.id;
            const itemBatches = item.batches || [];
            const hasFrozen = itemBatches.some(b => b.isFrozen);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                      <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-[10px] text-slate-500">{item.category}</span>
                        {item.courseList && item.courseList.map((c, i) => (
                          <span key={i} className="text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.2 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isZero 
                        ? 'bg-red-100 text-red-800' 
                        : isLow 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {isZero ? 'Zerado' : isLow ? 'Baixo' : 'Normal'}
                    </span>
                  </div>

                  {/* Saldo & Localização */}
                  <div className="mt-3.5 flex items-baseline justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Atual</span>
                      <div className="text-xl font-extrabold text-slate-900 leading-tight">
                        {formatNumber(item.totalQuantity, item.unit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Mínimo</span>
                      <div className="text-xs font-bold text-slate-700">
                        {formatNumber(item.minQuantity, item.unit)}
                      </div>
                      {item.storageLocation && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.storageLocation}</div>
                      )}
                    </div>
                  </div>

                  {/* Resumo de Validades & Lotes */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.nearestExpirationDate ? (
                        <span>Vence: <strong>{formatDate(item.nearestExpirationDate)}</strong></span>
                      ) : (
                        <span>Sem lote registrado</span>
                      )}
                    </span>

                    {hasFrozen && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                        <Snowflake className="w-3 h-3" />
                        Congelado
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Ações no Próprio Alimento */}
                <div className="bg-slate-50/70 p-2.5 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => openConsume(item)}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Dar baixa na aula"
                    >
                      <Minus className="w-3 h-3" />
                      <span>Usar</span>
                    </button>

                    <button
                      onClick={() => openPurchase(item)}
                      className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Receber compra"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Receber</span>
                    </button>

                    <button
                      onClick={() => openAudit(item)}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Ajustar saldo na balança"
                    >
                      <Scale className="w-3 h-3 text-slate-500" />
                      <span>Pesar</span>
                    </button>

                    <button
                      onClick={() => openItemModal(item)}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Editar cadastro"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Editar</span>
                    </button>
                  </div>

                  {/* Toggle para ver os lotes */}
                  <button
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="w-full text-center py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
                  >
                    <span>{itemBatches.length} lote(s) ativo(s)</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Expansão de Lotes */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      {itemBatches.length === 0 ? (
                        <div className="text-[11px] text-slate-400 text-center py-2">Nenhum lote com saldo.</div>
                      ) : (
                        itemBatches.map((batch) => (
                          <div key={batch.id} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-bold text-slate-800">{batch.batchNumber}</div>
                              <div className="text-slate-500">
                                Saldo: <strong>{formatNumber(batch.currentQuantity, item.unit)}</strong> • Vence: {formatDate(batch.expirationDate)}
                              </div>
                              {batch.isFrozen && (
                                <div className="text-blue-600 text-[10px] flex items-center gap-1 font-semibold">
                                  <Snowflake className="w-2.5 h-2.5" />
                                  2ª Validade congelado: {formatDate(batch.effectiveExpirationDate)}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {batch.isFrozen ? (
                                <button
                                  onClick={() => openThaw(batch)}
                                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold text-[10px]"
                                  title="Descongelar sob refrigeração (ANVISA 48h)"
                                >
                                  Descongelar
                                </button>
                              ) : (
                                <button
                                  onClick={() => openFreeze(batch)}
                                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold text-[10px]"
                                  title="Pausar validade congelando a -18°C"
                                >
                                  Congelar
                                </button>
                              )}
                              {batch.expirationStatus === 'Vencido' && (
                                <button
                                  onClick={() => onDiscardBatch && onDiscardBatch(batch)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Descartar lote vencido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          MODAIS INTEGRADOS (CRIAR/EDITAR ALIMENTO, COMPRA, BAIXA, AUDITORIA, GELO)
          ========================================================================= */}

      {/* MODAL 1: CADASTRAR OU EDITAR ALIMENTO */}
      {(activeModal === 'create-item' || activeModal === 'edit-item') && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {activeModal === 'edit-item' ? 'Editar Alimento' : 'Novo Alimento no Catálogo'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Alimento:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Farinha de Trigo Especial Tipo 1"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade de Medida:</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="kg">kg (Quilograma)</option>
                    <option value="g">g (Grama)</option>
                    <option value="L">L (Litro)</option>
                    <option value="ml">ml (Mililitro)</option>
                    <option value="un">un (Unidade)</option>
                    <option value="pct">pct (Pacote)</option>
                    <option value="cx">cx (Caixa)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estoque Mínimo de Segurança:</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Local de Armazenamento:</label>
                  <input
                    type="text"
                    placeholder="Ex: Geladeira 02, Prateleira A"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cursos que Utilizam:</label>
                <div className="flex flex-wrap gap-2">
                  {COURSES.map(course => {
                    const isChecked = (formData.courses || []).includes(course);
                    return (
                      <button
                        key={course}
                        type="button"
                        onClick={() => {
                          const current = formData.courses || [];
                          const updated = isChecked ? current.filter(c => c !== course) : [...current, course];
                          setFormData({ ...formData, courses: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isChecked 
                            ? 'bg-amber-600 text-white border-amber-600' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {course}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Salvando...' : 'Gravar Alimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BAIXA RÁPIDA */}
      {activeModal === 'consume' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Baixa em Aula: {targetItem?.name}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitConsume} className="p-4 space-y-3.5">
              <div className="text-xs text-slate-500">
                Saldo disponível na despensa: <strong className="text-slate-800">{formatNumber(targetItem?.totalQuantity, targetItem?.unit)}</strong>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade Retirada ({targetItem?.unit}):</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={targetItem?.totalQuantity || 9999}
                  required
                  placeholder="Ex: 2"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl"
                  autoFocus
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Gravando...' : 'Confirmar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECEBER COMPRA */}
      {activeModal === 'purchase' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-emerald-50/70 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Receber Compra: {targetItem?.name}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPurchase} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade Recebida ({targetItem?.unit}):</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="Ex: 10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Validade:</label>
                <input
                  type="date"
                  required
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Salvando...' : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BALANÇO / PESAR */}
      {activeModal === 'audit' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Conferir Saldo: {targetItem?.name}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitAudit} className="p-4 space-y-3.5">
              <div className="text-xs text-slate-500">Saldo atual registrado: {formatNumber(targetItem?.totalQuantity, targetItem?.unit)}</div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade Física Real ({targetItem?.unit}):</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={formData.physicalQuantity}
                  onChange={(e) => setFormData({ ...formData, physicalQuantity: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold bg-white border border-slate-300 rounded-xl"
                  autoFocus
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Gravando...' : 'Gravar Saldo Real'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CONGELAR */}
      {activeModal === 'freeze' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-blue-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Congelar Lote: {targetBatch?.batchNumber}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitFreeze} className="p-4 space-y-3.5">
              <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                Ao congelar a -18°C, a 1ª validade é pausada e ativa-se a 2ª validade de congelamento seguro.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data Limite Congelado (2ª Validade):</label>
                <input
                  type="date"
                  required
                  value={formData.frozenExpirationDate}
                  onChange={(e) => setFormData({ ...formData, frozenExpirationDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Salvando...' : 'Confirmar Congelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DESCONGELAR (ANVISA RDC 216) */}
      {activeModal === 'thaw' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-blue-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Descongelar Lote: {targetBatch?.batchNumber}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitThaw} className="p-4 space-y-3.5">
              <div className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <strong>Regra ANVISA RDC 216:</strong> Alimentos descongelados sob refrigeração (4°C) devem ser consumidos nas aulas práticas em até 48 horas.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consumir até:</label>
                <input
                  type="date"
                  required
                  value={formData.consumeUntilDate}
                  onChange={(e) => setFormData({ ...formData, consumeUntilDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs">
                  {isSubmitting ? 'Salvando...' : 'Confirmar Descongelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
