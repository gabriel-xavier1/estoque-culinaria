import React, { useState } from 'react';
import { 
  Flame, 
  Minus, 
  Sparkles, 
  AlertTriangle, 
  Trash2, 
  Search, 
  BookOpen, 
  UserCheck, 
  Calendar,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';
import { formatNumber, formatDate } from '../api';

const REASONS = [
  'Consumo em aula',
  'Perda por vencimento',
  'Deterioração',
  'Descarte',
  'Ajuste de inventário'
];

export default function ConsumptionModule({ items, transactions, onRegisterConsumption }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState('Todos');

  // Form State
  const [formData, setFormData] = useState({
    foodItemId: items[0]?.id || '',
    foodBatchId: '',
    quantity: '',
    transactionDate: new Date().toISOString().split('T')[0],
    activity: '',
    responsible: '',
    reason: 'Consumo em aula',
    notes: ''
  });

  const selectedItem = items.find(i => i.id === parseInt(formData.foodItemId));
  const availableBatches = (selectedItem?.batches || []).filter(b => b.currentQuantity > 0);
  const pvpsBatch = availableBatches[0];

  const handleOpenModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      foodItemId: items[0]?.id || '',
      foodBatchId: '',
      quantity: '',
      transactionDate: today,
      activity: 'Aula Prática de Gastronomia',
      responsible: '',
      reason: 'Consumo em aula',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(formData.quantity);
    if (!formData.foodItemId || isNaN(qty) || qty <= 0) {
      alert('Informe uma quantidade válida maior que zero.');
      return;
    }

    if (!selectedItem) return;

    if (formData.foodBatchId) {
      const targetBatch = availableBatches.find(b => b.id === parseInt(formData.foodBatchId));
      if (!targetBatch || qty > targetBatch.currentQuantity) {
        alert(`A quantidade solicitada (${qty} ${selectedItem.unit}) excede o saldo deste lote.`);
        return;
      }
    } else {
      if (qty > selectedItem.totalQuantity) {
        alert(`Saldo insuficiente! A quantidade solicitada (${qty} ${selectedItem.unit}) é maior que o saldo em estoque (${selectedItem.totalQuantity} ${selectedItem.unit}).`);
        return;
      }
    }

    onRegisterConsumption({
      foodItemId: parseInt(formData.foodItemId),
      foodBatchId: formData.foodBatchId ? parseInt(formData.foodBatchId) : null,
      quantity: qty,
      transactionDate: formData.transactionDate ? new Date(formData.transactionDate) : null,
      activity: formData.activity.trim() || null,
      responsible: formData.responsible.trim() || null,
      reason: formData.reason,
      notes: formData.notes.trim() || null
    });

    setIsModalOpen(false);
  };

  const consumptionTransactions = transactions.filter(t => t.transactionType === 'Saida');

  const filteredTransactions = consumptionTransactions.filter(t => {
    const matchSearch = t.foodItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (t.activity && t.activity.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (t.responsible && t.responsible.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchReason = selectedReasonFilter === 'Todos' || t.reason === selectedReasonFilter;
    return matchSearch && matchReason;
  });

  const totalClassConsumption = filteredTransactions
    .filter(t => t.reason === 'Consumo em aula')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const totalLosses = filteredTransactions
    .filter(t => t.reason !== 'Consumo em aula')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Consumo e Saídas de Alimentos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro dos ingredientes utilizados nas aulas práticas e prevenção de perdas (PVPS)
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <Minus className="w-4 h-4" />
          <span>Registrar Saída</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Registros de Saída</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{filteredTransactions.length} saídas</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Consumo em Aula Prática</div>
            <div className="text-xl font-bold text-indigo-700 mt-1">{formatNumber(totalClassConsumption)} un/kg</div>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Perdas & Descartes</div>
            <div className={`text-xl font-bold mt-1 ${totalLosses > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
              {formatNumber(totalLosses)} un/kg
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar por alimento, aula prática ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedReasonFilter}
            onChange={(e) => setSelectedReasonFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="Todos">Todos os Motivos</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualização em Cartões para Dispositivos Móveis (Mobile First) */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Nenhuma saída registrada.
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const isWaste = t.reason !== 'Consumo em aula';

            return (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {formatDate(t.transactionDate)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    isWaste ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {isWaste ? <Trash2 className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                    {t.reason}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t.foodItemName}</h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Lote: {t.batchNumber || 'PVPS Automático'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-rose-50/60 rounded-lg text-xs border border-rose-100">
                  <div>
                    <span className="text-rose-800 block text-[11px] font-medium">Quantidade Retirada</span>
                    <span className="text-base font-bold text-rose-700">
                      -{formatNumber(t.quantity, t.foodItemUnit)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">Aula / Atividade</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {t.activity || 'Consumo Geral'}
                    </span>
                  </div>
                </div>

                {t.responsible && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Responsável:</span>
                    <span className="font-semibold text-slate-700">{t.responsible}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tabela de Saídas para Desktop e Tablets */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Alimento</th>
                <th className="py-3 px-4">Lote</th>
                <th className="py-3 px-4 text-right">Qtd. Retirada</th>
                <th className="py-3 px-4">Motivo</th>
                <th className="py-3 px-4">Aula / Atividade</th>
                <th className="py-3 px-4">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhuma saída registrada.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isWaste = t.reason !== 'Consumo em aula';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(t.transactionDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {t.foodItemName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {t.batchNumber || 'PVPS Auto'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                        -{formatNumber(t.quantity, t.foodItemUnit)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isWaste 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {isWaste ? <Trash2 className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                          {t.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t.activity || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {t.responsible || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simples de Saída */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">Registrar Saída / Consumo</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alimento Utilizado *
                </label>
                <select
                  required
                  value={formData.foodItemId}
                  onChange={(e) => setFormData({ ...formData, foodItemId: e.target.value, foodBatchId: '' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit}) - Saldo disponível: {formatNumber(i.totalQuantity)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destaque PVPS */}
              {pvpsBatch && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Regra PVPS Automática:</strong> Será consumido prioritariamente o lote mais próximo do vencimento (<strong>{pvpsBatch.batchNumber}</strong>, vence em {formatDate(pvpsBatch.expirationDate)}).
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade Utilizada ({selectedItem?.unit || 'un'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder={`Máx: ${formatNumber(selectedItem?.totalQuantity || 0)}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">Saldo atual: {formatNumber(selectedItem?.totalQuantity || 0, selectedItem?.unit)}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motivo da Saída *
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Curso / Aula Prática
                  </label>
                  <input
                    type="text"
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    placeholder="Ex: Aula de Padeiro - Pães Artesanais"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Padeiro', 'Pizzaiolo', 'Confeitaria', 'Cozinha Geral'].map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, activity: `Aula de ${c}` })}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium"
                      >
                        +{c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável (Chef/Monitor)
                  </label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Ex: Chef Carlos"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedItem || selectedItem.totalQuantity <= 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs"
                >
                  Confirmar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
