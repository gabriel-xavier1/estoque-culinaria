import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FoodCatalog from './components/FoodCatalog';
import PurchasesModule from './components/PurchasesModule';
import ConsumptionModule from './components/ConsumptionModule';
import ExpirationTracker from './components/ExpirationTracker';
import MonthlyReports from './components/MonthlyReports';
import PrintableStockList from './components/PrintableStockList';
import StockAudit from './components/StockAudit';
import AlertConfigModal from './components/AlertConfigModal';
import { api } from './api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Core Data
  const [dashboardData, setDashboardData] = useState(null);
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    urgentDays: 7,
    attentionDays: 30,
    schoolName: 'Escola de Culinária & Gastronomia Prática'
  });

  // Report Month / Year
  const today = new Date();
  const [reportMonth, setReportMonth] = useState(today.getMonth() + 1);
  const [reportYear, setReportYear] = useState(today.getFullYear());
  const [reportData, setReportData] = useState(null);

  // Settings Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load All Application Data
  const loadData = useCallback(async () => {
    try {
      const [dash, foodItems, batchList, txList, cfg, rpt] = await Promise.all([
        api.getDashboard(),
        api.getItems(),
        api.getBatches(true),
        api.getTransactions(),
        api.getConfig(),
        api.getMonthlyReport(reportMonth, reportYear)
      ]);

      setDashboardData(dash);
      setItems(foodItems);
      setBatches(batchList);
      setTransactions(txList);
      if (cfg) setAlertConfig(cfg);
      setReportData(rpt);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      showToast('Erro ao conectar com o backend: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [reportMonth, reportYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSaveItem = async (itemData, id) => {
    try {
      if (id) {
        await api.updateItem(id, itemData);
        showToast('Alimento atualizado com sucesso!');
      } else {
        await api.createItem(itemData);
        showToast('Novo alimento cadastrado com sucesso!');
      }
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      showToast('Alimento excluído com sucesso!');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRegisterPurchase = async (purchaseData) => {
    try {
      await api.registerPurchase(purchaseData);
      showToast('Compra e novo lote registrados com sucesso! Saldo atualizado.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRegisterConsumption = async (consumptionData) => {
    try {
      await api.registerConsumption(consumptionData);
      showToast('Saída registrada com sucesso! Saldo recalculado automaticamente.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDiscardBatch = async (batch) => {
    try {
      await api.registerConsumption({
        foodItemId: batch.foodItemId,
        foodBatchId: batch.id,
        quantity: batch.currentQuantity,
        reason: 'Perda por vencimento',
        activity: 'Descarte Sanitário',
        responsible: 'Chef Responsável',
        notes: `Baixa de lote vencido em ${new Date(batch.expirationDate).toLocaleDateString('pt-BR')}`
      });
      showToast(`Lote ${batch.batchNumber} descartado e baixa registrada com sucesso.`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustStock = async (adjustmentData) => {
    try {
      await api.adjustStock(adjustmentData);
      showToast('Conferência gravada! Estoque ajustado com movimentação de auditoria.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleFreezeBatch = async (freezeData) => {
    try {
      await api.freezeBatch(freezeData);
      showToast('Lote congelado com sucesso! 2ª Validade ativada e 1ª pausada.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleThawBatch = async (thawData) => {
    try {
      await api.thawBatch(thawData);
      showToast('Lote descongelado com sucesso! Validade pós-descongelamento definida.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      const updated = await api.updateConfig(newConfig);
      setAlertConfig(updated);
      showToast('Configurações de alerta e curso atualizadas!');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMonthChange = async (newMonth) => {
    setReportMonth(newMonth);
    try {
      const rpt = await api.getMonthlyReport(newMonth, reportYear);
      setReportData(rpt);
    } catch (err) {
      showToast('Erro ao carregar relatório: ' + err.message, 'error');
    }
  };

  const handleYearChange = async (newYear) => {
    setReportYear(newYear);
    try {
      const rpt = await api.getMonthlyReport(reportMonth, newYear);
      setReportData(rpt);
    } catch (err) {
      showToast('Erro ao carregar relatório: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-0">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardData={dashboardData}
        onOpenSettings={() => setIsConfigModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
            <p className="text-xs text-slate-500 font-medium">Carregando estoque de culinária...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                data={dashboardData}
                onNavigate={setActiveTab}
                onOpenPurchaseModal={() => setActiveTab('purchases')}
                onOpenConsumptionModal={() => setActiveTab('consumption')}
              />
            )}

            {activeTab === 'catalog' && (
              <FoodCatalog
                items={items}
                onSaveItem={handleSaveItem}
                onDeleteItem={handleDeleteItem}
                onAdjustStock={handleAdjustStock}
                onSelectForPurchase={() => setActiveTab('purchases')}
                onSelectForConsumption={() => setActiveTab('consumption')}
              />
            )}

            {activeTab === 'purchases' && (
              <PurchasesModule
                items={items}
                purchases={transactions.filter(t => t.transactionType === 'Entrada')}
                onRegisterPurchase={handleRegisterPurchase}
                onOpenPrint={() => setActiveTab('print')}
              />
            )}

            {activeTab === 'consumption' && (
              <ConsumptionModule
                items={items}
                transactions={transactions}
                onRegisterConsumption={handleRegisterConsumption}
              />
            )}

            {activeTab === 'expiration' && (
              <ExpirationTracker
                batches={batches}
                alertConfig={alertConfig}
                onOpenConfig={() => setIsConfigModalOpen(true)}
                onDiscardBatch={handleDiscardBatch}
                onFreezeBatch={handleFreezeBatch}
                onThawBatch={handleThawBatch}
              />
            )}

            {activeTab === 'reports' && (
              <MonthlyReports
                reportData={reportData}
                month={reportMonth}
                year={reportYear}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
              />
            )}

            {activeTab === 'print' && (
              <PrintableStockList
                items={items}
                schoolName={alertConfig.schoolName}
              />
            )}

            {activeTab === 'audit' && (
              <StockAudit
                items={items}
                onAdjustStock={handleAdjustStock}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (hidden in print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>Sistema de Controle de Estoque de Alimentos • Curso de Culinária & Gastronomia Prática • Princípio PVPS</p>
      </footer>

      {/* Settings Modal */}
      {isConfigModalOpen && (
        <AlertConfigModal
          config={alertConfig}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}
