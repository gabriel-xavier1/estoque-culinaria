import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ArrowDownCircle, 
  Flame, 
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import PrintableStockList from './PrintableStockList';
import MonthlyReports from './MonthlyReports';
import { formatDate, formatNumber, formatCurrency } from '../api';

export default function PrintReportsUnifiedView({ 
  items = [], 
  schoolName, 
  reportData, 
  month, 
  year, 
  onMonthChange, 
  onYearChange,
  transactions = [],
  initialCourse,
  initialShift
}) {
  const [subTab, setSubTab] = useState('print'); // 'print' | 'monthly' | 'audit'

  return (
    <div className="space-y-4">
      {/* SELETOR DAS 3 SUB-ÁREAS DE RELATÓRIO */}
      <div className="no-print bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Impressão & Balanço</div>
          <h2 className="text-lg font-bold text-slate-900">Documentos Oficiais e Fechamento</h2>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl inline-flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('print')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'print'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Folha Oficial A4 (SP / FAT)</span>
          </button>

          <button
            onClick={() => setSubTab('monthly')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'monthly'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Balanço Mensal (R$)</span>
          </button>

          <button
            onClick={() => setSubTab('audit')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'audit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Auditoria de Aulas</span>
          </button>
        </div>
      </div>

      {/* SUB-ABA 1: FOLHA OFICIAL PARA IMPRESSÃO A4 (GOVERNO SP & FAT) */}
      {subTab === 'print' && (
        <PrintableStockList 
          items={items} 
          schoolName={schoolName}
          initialCourse={initialCourse}
          initialShift={initialShift}
        />
      )}

      {/* SUB-ABA 2: RELATÓRIOS MENSAIS E FINANCEIROS */}
      {subTab === 'monthly' && (
        <MonthlyReports 
          reportData={reportData}
          month={month}
          year={year}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
      )}

      {/* SUB-ABA 3: AUDITORIA DE TODAS AS MOVIMENTAÇÕES */}
      {subTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Histórico de Movimentações (Entradas e Saídas em Aulas)</h3>
              <p className="text-xs text-slate-500">Rastreabilidade completa de todas as receitas, lotes e professores.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Alimento</th>
                  <th className="py-2.5 px-3">Quantidade</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3">Aula / Motivo</th>
                  <th className="py-2.5 px-3">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhuma movimentação registrada até o momento.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
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
                        <td className="py-2 px-3 font-mono text-slate-500">{tx.batchNumber || '-'}</td>
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
      )}
    </div>
  );
}
