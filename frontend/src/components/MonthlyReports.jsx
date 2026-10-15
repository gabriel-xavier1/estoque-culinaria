import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Table, 
  Flame, 
  AlertTriangle, 
  PackagePlus, 
  DollarSign, 
  TrendingUp,
  Package,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../api';

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export default function MonthlyReports({ reportData, month, year, onMonthChange, onYearChange }) {
  const [activeSubTab, setActiveSubTab] = useState('currentStock');

  if (!reportData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const exportToCSV = () => {
    let rows = [];
    let filename = `Relatorio_${activeSubTab}_${reportData.monthName}_${year}.csv`;

    if (activeSubTab === 'currentStock') {
      rows.push(['Codigo', 'Alimento', 'Categoria', 'Quantidade Atual', 'Unidade', 'Estoque Minimo', 'Situacao', 'Valor Estimado (R$)', 'Local']);
      reportData.currentStock.forEach(s => {
        rows.push([
          `"${s.code}"`,
          `"${s.name}"`,
          `"${s.category}"`,
          s.currentQuantity,
          s.unit,
          s.minQuantity,
          s.status,
          s.estimatedValue.toFixed(2),
          `"${s.storageLocation || ''}"`
        ]);
      });
    } else if (activeSubTab === 'consumption') {
      rows.push(['Codigo', 'Alimento', 'Categoria', 'Consumo em Aula', 'Perdas e Descartes', 'Total Saidas', 'Unidade', 'Comparacao Mes Anterior']);
      reportData.consumption.forEach(c => {
        rows.push([
          `"${c.code}"`,
          `"${c.name}"`,
          `"${c.category}"`,
          c.consumedQuantity,
          c.wasteQuantity,
          c.totalOutQuantity,
          c.unit,
          c.differencePercentage !== null ? `${c.differencePercentage}%` : 'Sem historico'
        ]);
      });
    } else if (activeSubTab === 'expiration') {
      rows.push(['Alimento', 'Lote', 'Data Validade', 'Status', 'Saldo Atual', 'Fornecedor']);
      const allAlerts = [...reportData.expiredBatches, ...reportData.batchesExpiring7Days, ...reportData.batchesExpiring30Days];
      allAlerts.forEach(b => {
        rows.push([
          `"${b.foodItemName}"`,
          `"${b.batchNumber}"`,
          formatDate(b.expirationDate),
          b.expirationStatus,
          b.currentQuantity,
          `"${b.supplier || ''}"`
        ]);
      });
    } else if (activeSubTab === 'purchases') {
      rows.push(['Data Recebimento', 'Alimento', 'Codigo', 'Lote', 'Quantidade', 'Unidade', 'Preco Unitario', 'Valor Total', 'Fornecedor']);
      reportData.purchases.forEach(p => {
        rows.push([
          formatDate(p.receivedDate),
          `"${p.foodItemName}"`,
          `"${p.foodItemCode}"`,
          `"${p.batchNumber || ''}"`,
          p.quantity,
          p.foodItemUnit,
          p.unitPrice ? p.unitPrice.toFixed(2) : '',
          p.totalPrice ? p.totalPrice.toFixed(2) : '',
          `"${p.supplier || ''}"`
        ]);
      });
    }

    const csvContent = '\uFEFF' + rows.map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Relatórios Mensais Automáticos - {reportData.monthName} / {year}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {reportData.schoolName} • Cálculos atualizados automaticamente pelas movimentações do estoque
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor Mês/Ano */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 ml-1" />
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* 4 Sub-abas com Ícones Claros */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('currentStock')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === 'currentStock'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>1. Estoque Atual</span>
        </button>

        <button
          onClick={() => setActiveSubTab('consumption')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === 'consumption'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>2. Consumo em Aulas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expiration')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === 'expiration'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>3. Validade & Perdas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('purchases')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === 'purchases'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>4. Compras do Mês</span>
        </button>
      </div>

      {/* 1. RELATÓRIO DE ESTOQUE ATUAL */}
      {activeSubTab === 'currentStock' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-700" />
              <div>
                <span className="text-xs text-slate-500">Valor Estimado do Estoque Atual</span>
                <div className="text-xl font-bold text-slate-900">{formatCurrency(reportData.currentStockTotalValue)}</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              {reportData.currentStock.length} alimentos cadastrados
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Código</th>
                    <th className="py-2.5 px-4">Alimento</th>
                    <th className="py-2.5 px-4">Categoria</th>
                    <th className="py-2.5 px-4 text-right">Saldo Atual</th>
                    <th className="py-2.5 px-4 text-right">Estoque Mínimo</th>
                    <th className="py-2.5 px-4">Situação</th>
                    <th className="py-2.5 px-4">Validade Próxima</th>
                    <th className="py-2.5 px-4 text-right">Valor Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.currentStock.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-slate-500">{row.code}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">{row.name}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.category}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatNumber(row.currentQuantity, row.unit)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-500">{formatNumber(row.minQuantity, row.unit)}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.status === 'Vencido' ? 'bg-red-100 text-red-700' :
                          row.status === 'Zerado' ? 'bg-red-50 text-red-700' :
                          row.status === 'Baixo' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">{formatDate(row.nearestExpiration)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-800">{formatCurrency(row.estimatedValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. RELATÓRIO DE CONSUMO */}
      {activeSubTab === 'consumption' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Utilizado em Aula</span>
                <div className="text-xl font-bold text-indigo-700 mt-1">{formatNumber(reportData.totalConsumedQuantity)} un/kg</div>
              </div>
              <Flame className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Descartes / Perdas</span>
                <div className="text-xl font-bold text-rose-600 mt-1">{formatNumber(reportData.totalLossesQuantity)} un/kg</div>
              </div>
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Custo Total Consumido</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(reportData.totalConsumedValue)}</div>
              </div>
              <DollarSign className="w-5 h-5 text-slate-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Alimento</th>
                    <th className="py-2.5 px-4">Categoria</th>
                    <th className="py-2.5 px-4 text-right">Consumo em Aula</th>
                    <th className="py-2.5 px-4 text-right">Perdas/Descartes</th>
                    <th className="py-2.5 px-4 text-right">Total Saídas</th>
                    <th className="py-2.5 px-4 text-right">Mês Anterior</th>
                    <th className="py-2.5 px-4 text-right">Variação %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.consumption.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Nenhum consumo registrado neste mês de referência.
                      </td>
                    </tr>
                  ) : (
                    reportData.consumption.map((c) => (
                      <tr key={c.foodItemId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{c.name}</td>
                        <td className="py-2.5 px-4 text-slate-600">{c.category}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-indigo-700">{formatNumber(c.consumedQuantity, c.unit)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-rose-600">{formatNumber(c.wasteQuantity, c.unit)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatNumber(c.totalOutQuantity, c.unit)}</td>
                        <td className="py-2.5 px-4 text-right text-slate-500">{c.previousMonthQuantity > 0 ? formatNumber(c.previousMonthQuantity, c.unit) : '-'}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-700">
                          {c.differencePercentage !== null ? `${c.differencePercentage > 0 ? '+' : ''}${c.differencePercentage}%` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. RELATÓRIO DE VALIDADE */}
      {activeSubTab === 'expiration' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <span className="text-xs font-bold text-red-800">Lotes Vencidos</span>
              <div className="text-xl font-bold text-red-900 mt-1">{reportData.expiredBatches.length} lotes</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <span className="text-xs font-bold text-orange-800">Vencendo em até 7 Dias</span>
              <div className="text-xl font-bold text-orange-900 mt-1">{reportData.batchesExpiring7Days.length} lotes</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800">Vencendo em até 30 Dias</span>
              <div className="text-xl font-bold text-amber-900 mt-1">{reportData.batchesExpiring30Days.length} lotes</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Alimento</th>
                    <th className="py-2.5 px-4">Lote</th>
                    <th className="py-2.5 px-4">Validade</th>
                    <th className="py-2.5 px-4">Situação</th>
                    <th className="py-2.5 px-4 text-right">Saldo Restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...reportData.expiredBatches, ...reportData.batchesExpiring7Days, ...reportData.batchesExpiring30Days].length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhum lote crítico no momento.
                      </td>
                    </tr>
                  ) : (
                    [...reportData.expiredBatches, ...reportData.batchesExpiring7Days, ...reportData.batchesExpiring30Days].map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{b.foodItemName}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{b.batchNumber}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{formatDate(b.expirationDate)}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            b.expirationStatus === 'Vencido' ? 'bg-red-100 text-red-700' :
                            b.expirationStatus === 'Urgente' ? 'bg-orange-100 text-orange-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {b.expirationStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatNumber(b.currentQuantity, b.foodItemUnit)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. RELATÓRIO DE COMPRAS */}
      {activeSubTab === 'purchases' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Entradas no Mês</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{reportData.purchases.length} compras</div>
              </div>
              <PackagePlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Volume Total Comprado</span>
                <div className="text-xl font-bold text-emerald-700 mt-1">{formatNumber(reportData.totalPurchasedQuantity)} un/kg</div>
              </div>
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Total Investido</span>
                <div className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(reportData.totalPurchasedValue)}</div>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Recebimento</th>
                    <th className="py-2.5 px-4">Alimento</th>
                    <th className="py-2.5 px-4">Lote</th>
                    <th className="py-2.5 px-4 text-right">Qtd. Adquirida</th>
                    <th className="py-2.5 px-4 text-right">Valor Total (R$)</th>
                    <th className="py-2.5 px-4">Fornecedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.purchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhuma compra registrada neste mês.
                      </td>
                    </tr>
                  ) : (
                    reportData.purchases.map((p) => (
                      <tr key={p.transactionId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-600 font-medium">{formatDate(p.receivedDate)}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{p.foodItemName}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{p.batchNumber || '-'}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700">+{formatNumber(p.quantity, p.foodItemUnit)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-800">{p.totalPrice ? formatCurrency(p.totalPrice) : '-'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{p.supplier || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
