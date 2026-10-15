import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  Printer, 
  GraduationCap, 
  Wheat, 
  Pizza, 
  Cake, 
  ChefHat, 
  ArrowDownCircle, 
  Flame, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../api';

const COURSES_CONFIG = [
  { id: 'all', name: 'Todos os Cursos', icon: GraduationCap },
  { id: 'Padeiro', name: 'Padeiro', icon: Wheat },
  { id: 'Pizzaiolo', name: 'Pizzaiolo', icon: Pizza },
  { id: 'Confeitaria', name: 'Confeitaria', icon: Cake },
  { id: 'Cozinha Geral', name: 'Cozinha Geral', icon: ChefHat }
];

export default function DashboardManager({ 
  data, 
  items = [], 
  onNavigate, 
  onOpenPurchaseModal, 
  onOpenConsumptionModal,
  onDiscardBatch 
}) {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  if (!data) return null;

  // Filtragem
  const filteredItems = items.filter(i => {
    const matchCourse = selectedCourse === 'all' 
      ? true 
      : (i.courseList && i.courseList.includes(selectedCourse)) || (i.courses && i.courses.includes(selectedCourse));
    const matchSearch = !tableSearch 
      ? true 
      : i.name.toLowerCase().includes(tableSearch.toLowerCase()) || (i.category && i.category.toLowerCase().includes(tableSearch.toLowerCase()));
    return matchCourse && matchSearch;
  });

  const filteredBatches = selectedCourse === 'all'
    ? (data.urgentBatches || [])
    : (data.urgentBatches || []).filter(b => 
        (b.foodItemCourseList && b.foodItemCourseList.includes(selectedCourse)) ||
        (b.foodItemCourses && b.foodItemCourses.includes(selectedCourse))
      );

  const filteredLowStock = selectedCourse === 'all'
    ? (data.lowStockItems || [])
    : (data.lowStockItems || []).filter(i => 
        (i.courseList && i.courseList.includes(selectedCourse)) ||
        (i.courses && i.courses.includes(selectedCourse))
      );

  // Cálculos de Gestão
  const totalCourseValue = filteredItems.reduce((acc, curr) => acc + (curr.estimatedTotalValue || 0), 0);
  const totalCourseItems = filteredItems.length;
  const lowStockCourseCount = filteredItems.filter(i => i.totalQuantity < i.minQuantity).length;
  const fulfillmentRate = totalCourseItems > 0 
    ? Math.round(((totalCourseItems - lowStockCourseCount) / totalCourseItems) * 100) 
    : 100;

  return (
    <div className="space-y-5">
      {/* 1. CABEÇALHO EXECUTIVO & METAS DA COORDENAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Building2 className="w-4 h-4" />
              <span>Versão 2 • Painel de Gestão e Governança da Cozinha</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Relatório Operacional e Balanço do Estoque</h2>
            <p className="text-xs text-slate-500">Supervisão técnica de compras mensais, controle PVPS e indicadores financeiros em R$.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('print')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Folha A4 Oficial</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span>Fechamento Mensal</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs de Alto Nível de Gestão */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Valor Total Estimado</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalCourseValue || data.totalStockEstimatedValue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Custo de mercadoria em despensa</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Nível de Abastecimento</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              {fulfillmentRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{totalCourseItems - lowStockCourseCount} de {totalCourseItems} acima do mín.</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Necessidade de Compra</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-800 mt-1">
              {lowStockCourseCount} itens
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Abaixo da margem de segurança</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Consumo do Mês</span>
              <Flame className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-indigo-900 mt-1">
              {formatNumber(data.totalConsumptionThisMonth)} un/kg
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Gastos em aulas práticas</div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FILTRO POR CURSO E BUSCA */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 uppercase mr-1">Filtrar Curso:</span>
          {COURSES_CONFIG.map((course) => {
            const Icon = course.icon;
            const isSelected = selectedCourse === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{course.name}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar nos relatórios..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 3. QUADRO 1: GESTÃO PVPS & CRONOGRAMA DE VENCIMENTO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cronograma PVPS (Prioridade de Consumo por Lote)</h3>
              <p className="text-[11px] text-slate-500">Ordenado rigorosamente pela proximidade da data de vencimento</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('expiration')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            Gestão completa de frio & validade <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Lote</th>
                <th className="py-2.5 px-3">Alimento / Insumo</th>
                <th className="py-2.5 px-3">Cursos</th>
                <th className="py-2.5 px-3">Saldo Atual</th>
                <th className="py-2.5 px-3">Vencimento</th>
                <th className="py-2.5 px-3">Prazo</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Nenhum lote crítico registrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isExpired = batch.expirationStatus === 'Vencido';
                  return (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{batch.batchNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{batch.foodItemName}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {batch.foodItemCourseList && batch.foodItemCourseList.map((c, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {formatNumber(batch.currentQuantity, batch.foodItemUnit)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatDate(batch.expirationDate)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Vencido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 text-orange-600" />
                            {batch.daysUntilExpiration} dias
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {isExpired ? (
                          <button
                            onClick={() => onDiscardBatch && onDiscardBatch(batch)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Descartar
                          </button>
                        ) : (
                          <button
                            onClick={onOpenConsumptionModal}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Usar em Aula
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. QUADRO 2: REPOSIÇÃO E COMPRAS DO MÊS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quadro de Reposição e Compras Mensais</h3>
              <p className="text-[11px] text-slate-500">Insumos abaixo da quantidade mínima recomendada para as turmas</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('print')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            Ver lista para compras <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Alimento / Insumo</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Cursos</th>
                <th className="py-2.5 px-3">Saldo Atual</th>
                <th className="py-2.5 px-3">Estoque Mínimo</th>
                <th className="py-2.5 px-3">Falta Comprar</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLowStock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Todos os alimentos estão devidamente abastecidos.
                  </td>
                </tr>
              ) : (
                filteredLowStock.map((item) => {
                  const deficit = Math.max(0, item.minQuantity - item.totalQuantity);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{item.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.courseList && item.courseList.map((c, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-800">
                        {formatNumber(item.totalQuantity, item.unit)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {formatNumber(item.minQuantity, item.unit)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-red-600">
                        {formatNumber(deficit, item.unit)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={onOpenPurchaseModal}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Comprar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. HISTÓRICO DE AUDITORIA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Auditoria das Últimas Movimentações na Despensa</h3>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
          >
            Ver relatório mensal completo <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Alimento</th>
                <th className="py-2.5 px-3">Quantidade</th>
                <th className="py-2.5 px-3">Motivo / Atividade</th>
                <th className="py-2.5 px-3">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!data.recentTransactions || data.recentTransactions.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">Nenhuma movimentação recente registrada.</td>
                </tr>
              ) : (
                data.recentTransactions.map((tx) => {
                  const isEntry = tx.transactionType === 'Entrada';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDate(tx.transactionDate)}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isEntry ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {isEntry ? <ArrowDownCircle className="w-3 h-3 text-emerald-600" /> : <Flame className="w-3 h-3 text-amber-600" />}
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{tx.foodItemName}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">
                        {isEntry ? '+' : '-'}{formatNumber(tx.quantity, tx.foodItemUnit)}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{tx.activity || tx.reason}</td>
                      <td className="py-2 px-3 text-slate-500">{tx.responsible || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
