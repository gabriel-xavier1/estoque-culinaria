import React, { useState } from 'react';
import { 
  PackagePlus, 
  Search, 
  Calendar, 
  DollarSign, 
  Building, 
  PackageCheck, 
  Plus, 
  Tag,
  Clock,
  CheckCircle2,
  Snowflake,
  Printer,
  X
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../api';

export default function PurchasesModule({ items, purchases, onRegisterPurchase, onOpenPrint }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    foodItemId: items[0]?.id || '',
    purchaseDate: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0],
    supplier: '',
    quantity: '',
    unitPrice: '',
    expirationDate: '',
    batchNumber: '',
    isFrozen: false,
    frozenDate: '',
    frozenExpirationDate: '',
    notes: ''
  });

  const selectedItem = items.find(i => i.id === parseInt(formData.foodItemId));
  const totalCalculated = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unitPrice) || 0);

  const handleOpenModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultExp = new Date();
    defaultExp.setMonth(defaultExp.getMonth() + 2);
    const defaultFrozenExp = new Date();
    defaultFrozenExp.setMonth(defaultFrozenExp.getMonth() + 4);

    setFormData({
      foodItemId: items[0]?.id || '',
      purchaseDate: today,
      receivedDate: today,
      supplier: '',
      quantity: '',
      unitPrice: '',
      expirationDate: defaultExp.toISOString().split('T')[0],
      isFrozen: false,
      frozenDate: today,
      frozenExpirationDate: defaultFrozenExp.toISOString().split('T')[0],
      batchNumber: `LOT-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.foodItemId || !formData.quantity || !formData.expirationDate) {
      alert('Preencha os campos obrigatórios (Alimento, Quantidade e Data de Validade).');
      return;
    }

    onRegisterPurchase({
      foodItemId: parseInt(formData.foodItemId),
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : null,
      receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : null,
      supplier: formData.supplier.trim() || null,
      quantity: parseFloat(formData.quantity),
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
      expirationDate: new Date(formData.expirationDate),
      isFrozen: formData.isFrozen,
      frozenDate: formData.isFrozen && formData.frozenDate ? new Date(formData.frozenDate) : null,
      frozenExpirationDate: formData.isFrozen && formData.frozenExpirationDate ? new Date(formData.frozenExpirationDate) : null,
      batchNumber: formData.batchNumber.trim() || null,
      notes: formData.notes.trim() || null
    });

    setIsModalOpen(false);
  };

  const filteredPurchases = purchases.filter(p => 
    p.foodItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.batchNumber && p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSpent = filteredPurchases.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">Compras e Entradas de Estoque</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro das compras mensais com controle individual de lotes e datas de validade
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-300 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir Lista de Compras (FAT / SP)</span>
            </button>
          )}

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Compra</span>
          </button>
        </div>
      </div>

      {/* Indicadores Rápidos com Ícones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total de Entradas</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{filteredPurchases.length} compras</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Gasto Informado</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Rastreabilidade</div>
            <div className="text-xl font-bold text-amber-600 mt-1">Lotes Ativos</div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar compra por alimento, fornecedor ou lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Visualização em Cartões para Dispositivos Móveis (Mobile First) */}
      <div className="md:hidden space-y-3">
        {filteredPurchases.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Nenhuma compra registrada.
          </div>
        ) : (
          filteredPurchases.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {formatDate(p.transactionDate)}
                </span>
                <span className="font-mono text-slate-500 font-medium text-[11px]">
                  Lote: {p.batchNumber || '-'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{p.foodItemName}</h3>
                <span className="text-[11px] font-mono text-slate-400">Código: {p.foodItemCode}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-lg text-xs border border-emerald-100">
                <div>
                  <span className="text-emerald-800 block text-[11px] font-medium">Quantidade Recebida</span>
                  <span className="text-base font-bold text-emerald-700">
                    +{formatNumber(p.quantity, p.foodItemUnit)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Total Gasto</span>
                  <span className="text-sm font-bold text-slate-800">
                    {p.totalPrice ? formatCurrency(p.totalPrice) : '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Unitário: <strong>{p.unitPrice ? formatCurrency(p.unitPrice) : '-'}</strong></span>
                <span>Fornecedor: <strong>{p.responsible || '-'}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabela de Compras para Desktop e Tablets */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Recebimento</th>
                <th className="py-3 px-4">Alimento</th>
                <th className="py-3 px-4">Lote</th>
                <th className="py-3 px-4 text-right">Qtd. Recebida</th>
                <th className="py-3 px-4 text-right">Preço Unit.</th>
                <th className="py-3 px-4 text-right">Total (R$)</th>
                <th className="py-3 px-4">Fornecedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhuma compra registrada.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(p.transactionDate)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {p.foodItemName}
                      <span className="ml-1 text-[10px] text-slate-400 font-mono">({p.foodItemCode})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {p.batchNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      +{formatNumber(p.quantity, p.foodItemUnit)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {p.unitPrice ? formatCurrency(p.unitPrice) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {p.totalPrice ? formatCurrency(p.totalPrice) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.responsible || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simples de Registrar Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Registrar Compra / Entrada</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alimento Comprado *
                </label>
                <select
                  required
                  value={formData.foodItemId}
                  onChange={(e) => setFormData({ ...formData, foodItemId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit}) - Saldo atual: {formatNumber(i.totalQuantity)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Recebimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.receivedDate}
                    onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Validade do Lote *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-amber-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Opção de Congelamento Culinário (Pausa da Validade & 2ª Validade) */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isFrozen}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const defFzExp = new Date();
                      defFzExp.setMonth(defFzExp.getMonth() + 3); // +90 dias a -18°C
                      setFormData({
                        ...formData,
                        isFrozen: checked,
                        frozenDate: formData.receivedDate,
                        frozenExpirationDate: defFzExp.toISOString().split('T')[0]
                      });
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                    <Snowflake className="w-4 h-4 text-sky-600" />
                    Armazenar como Congelado (Pausar validade e definir 2ª validade)
                  </span>
                </label>

                {formData.isFrozen && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-sky-900 mb-0.5">
                        Data do Congelamento *
                      </label>
                      <input
                        type="date"
                        required={formData.isFrozen}
                        value={formData.frozenDate}
                        onChange={(e) => setFormData({ ...formData, frozenDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-sky-900 mb-0.5">
                        2ª Validade (Congelado a -18°C) *
                      </label>
                      <input
                        type="date"
                        required={formData.isFrozen}
                        value={formData.frozenExpirationDate}
                        onChange={(e) => setFormData({ ...formData, frozenExpirationDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold text-sky-950"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade Recebida ({selectedItem?.unit || 'un'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preço Unitário (R$, opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="Ex: 15.50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {totalCalculated > 0 && (
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Total: {formatCurrency(totalCalculated)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identificação do Lote
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="Ex: LOT-202610-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Fornecedor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Ex: Distribuidora Central"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
