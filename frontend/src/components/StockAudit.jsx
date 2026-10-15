import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { formatNumber, formatDate } from '../api';

export default function StockAudit({ items, onAdjustStock }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(items[0] || null);
  const [physicalCount, setPhysicalCount] = useState('');
  const [responsible, setResponsible] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item) => {
    setSelectedItem(item);
    setPhysicalCount(item.totalQuantity.toString());
    setIsSuccess(false);
  };

  const currentSystemQty = selectedItem?.totalQuantity || 0;
  const countedQty = parseFloat(physicalCount) || 0;
  const diff = countedQty - currentSystemQty;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (diff === 0) {
      alert('A quantidade contada é exatamente igual ao saldo registrado no sistema. Nenhum ajuste necessário.');
      return;
    }

    onAdjustStock({
      foodItemId: selectedItem.id,
      physicalQuantity: countedQty,
      responsible: responsible.trim() || 'Estoquista de Aulas',
      reason: 'Conferência física',
      notes: notes.trim() || 'Ajuste de inventário pós-conferência'
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800">Conferência Física de Estoque</h2>
        <p className="text-xs text-slate-500">
          Compare as quantidades físicas encontradas nas prateleiras e geladeiras com os saldos registrados no sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Quick Item Selector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Selecione o Alimento
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto space-y-1">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full p-2.5 text-left rounded-lg transition-colors flex items-center justify-between text-xs ${
                  selectedItem?.id === item.id 
                    ? 'bg-amber-50 border border-amber-200 font-bold text-amber-950' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div>{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.code} • {item.storageLocation || 'Despensa'}</div>
                </div>
                <span className="font-bold">
                  {formatNumber(item.totalQuantity, item.unit)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Comparison and Adjustment Form */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          {selectedItem ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{selectedItem.name}</span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {selectedItem.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Categoria: {selectedItem.category} • Local: {selectedItem.storageLocation || 'Não especificado'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Saldo Atual no Sistema</span>
                  <div className="text-2xl font-bold text-slate-800">
                    {formatNumber(currentSystemQty, selectedItem.unit)}
                  </div>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Saldo no Sistema</span>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">
                    {formatNumber(currentSystemQty, selectedItem.unit)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Contagem Física</span>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">
                    {formatNumber(countedQty, selectedItem.unit)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Divergência / Ajuste</span>
                  <div className={`text-lg font-bold mt-0.5 ${diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                    {diff > 0 ? `+${formatNumber(diff, selectedItem.unit)} (Sobra)` : diff < 0 ? `${formatNumber(diff, selectedItem.unit)} (Falta)` : 'Exato (Sem divergência)'}
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade Encontrada Fisicamente ({selectedItem.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400">
                    Digite a quantidade real que você contou na prateleira ou geladeira.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável pela Contagem
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex: Chef Helena, Estoquista Marcos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justificativa / Observações da Divergência
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Quebra de embalagem não registrada ou porção excedente de mise en place..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Estoque ajustado com sucesso e movimentação de auditoria registrada!</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={diff === 0}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Gravar Ajuste no Sistema</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Selecione um alimento à esquerda para iniciar a conferência física.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
