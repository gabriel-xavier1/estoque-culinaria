import React, { useState } from 'react';
import { 
  CalendarClock, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Trash2, 
  SlidersHorizontal, 
  Search, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Snowflake, 
  Droplets, 
  X, 
  Calendar,
  Check
} from 'lucide-react';
import { formatDate, formatNumber } from '../api';

export default function ExpirationTracker({ batches, alertConfig, onOpenConfig, onDiscardBatch, onFreezeBatch, onThawBatch }) {
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals de Congelamento e Descongelamento
  const [freezingBatch, setFreezingBatch] = useState(null);
  const [thawingBatch, setThawingBatch] = useState(null);

  // Form states para congelamento
  const [freezeData, setFreezeData] = useState({
    frozenDate: new Date().toISOString().split('T')[0],
    frozenExpirationDate: '',
    notes: 'Congelado a -18°C para conservação'
  });

  // Form states para descongelamento
  const [thawData, setThawData] = useState({
    thawedDate: new Date().toISOString().split('T')[0],
    consumeUntilDate: '',
    notes: 'Descongelado sob refrigeração (≤5°C) para aula prática'
  });

  const expiredBatches = batches.filter(b => b.expirationStatus === 'Vencido');
  const urgentBatches = batches.filter(b => b.expirationStatus === 'Urgente');
  const attentionBatches = batches.filter(b => b.expirationStatus === 'Atencao');
  const regularBatches = batches.filter(b => b.expirationStatus === 'Regular');
  const frozenBatchesCount = batches.filter(b => b.isFrozen).length;

  const filteredBatches = batches.filter(b => {
    const matchSearch = b.foodItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = selectedFilter === 'Todos' 
      ? true 
      : selectedFilter === 'Congelados' 
        ? b.isFrozen 
        : b.expirationStatus === selectedFilter;
    return matchSearch && matchFilter;
  });

  const handleOpenFreeze = (batch) => {
    const today = new Date().toISOString().split('T')[0];
    const defFzExp = new Date();
    defFzExp.setMonth(defFzExp.getMonth() + 3); // Padrão culinário: +90 dias a -18°C

    setFreezingBatch(batch);
    setFreezeData({
      frozenDate: today,
      frozenExpirationDate: defFzExp.toISOString().split('T')[0],
      notes: 'Congelado a -18°C. Validade original pausada.'
    });
  };

  const handleConfirmFreeze = (e) => {
    e.preventDefault();
    if (!freezingBatch || !freezeData.frozenExpirationDate) return;
    onFreezeBatch({
      batchId: freezingBatch.id,
      frozenDate: new Date(freezeData.frozenDate),
      frozenExpirationDate: new Date(freezeData.frozenExpirationDate),
      notes: freezeData.notes
    });
    setFreezingBatch(null);
  };

  const handleOpenThaw = (batch) => {
    const today = new Date().toISOString().split('T')[0];
    const anvisaExp = new Date();
    anvisaExp.setDate(anvisaExp.getDate() + 2); // Padrão ANVISA RDC 216: 24h a 48h após descongelar em geladeira

    setThawingBatch(batch);
    setThawData({
      thawedDate: today,
      consumeUntilDate: anvisaExp.toISOString().split('T')[0],
      notes: 'Descongelado sob refrigeração. Uso imediato em até 48h conforme RDC 216.'
    });
  };

  const handleConfirmThaw = (e) => {
    e.preventDefault();
    if (!thawingBatch || !thawData.consumeUntilDate) return;
    onThawBatch({
      batchId: thawingBatch.id,
      thawedDate: new Date(thawData.thawedDate),
      consumeUntilDate: new Date(thawData.consumeUntilDate),
      notes: thawData.notes
    });
    setThawingBatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-slate-800">Controle de Validade dos Alimentos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organização por ordem de vencimento (PVPS) com controle de <strong>Congelamento (Pausa de Validade & 2ª Validade)</strong>
          </p>
        </div>

        <button
          onClick={onOpenConfig}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start md:self-auto border border-slate-300"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Prazos de Alerta ({alertConfig.urgentDays}d / {alertConfig.attentionDays}d)</span>
        </button>
      </div>

      {/* Alerta Sanitário de Alimentos Vencidos */}
      {expiredBatches.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-900">
                Alerta Sanitário: {expiredBatches.length} {expiredBatches.length === 1 ? 'lote com validade vencida' : 'lotes com validade vencida'}
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Alimentos vencidos não são recomendados nem seguros para consumo nas aulas práticas. Providencie o descarte.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Filtro com Ícones e Badge de Congelados */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'Vencido' ? 'Todos' : 'Vencido')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedFilter === 'Vencido'
              ? 'bg-red-100 border-red-400 ring-2 ring-red-400'
              : 'bg-red-50/70 border-red-200 hover:bg-red-100/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-800">
            <span className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Vencidos</span>
            </span>
          </div>
          <div className="text-xl font-bold text-red-900 mt-1">{expiredBatches.length} lotes</div>
          <div className="text-[10px] text-red-600 mt-0.5">Não usar nas aulas</div>
        </button>

        <button
          onClick={() => setSelectedFilter(selectedFilter === 'Urgente' ? 'Todos' : 'Urgente')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedFilter === 'Urgente'
              ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-400'
              : 'bg-orange-50/70 border-orange-200 hover:bg-orange-100/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-orange-800">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Até {alertConfig.urgentDays} Dias</span>
            </span>
          </div>
          <div className="text-xl font-bold text-orange-900 mt-1">{urgentBatches.length} lotes</div>
          <div className="text-[10px] text-orange-700 mt-0.5">Atenção prioritária</div>
        </button>

        <button
          onClick={() => setSelectedFilter(selectedFilter === 'Atencao' ? 'Todos' : 'Atencao')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedFilter === 'Atencao'
              ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400'
              : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Até {alertConfig.attentionDays} Dias</span>
            </span>
          </div>
          <div className="text-xl font-bold text-amber-900 mt-1">{attentionBatches.length} lotes</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Programar nas aulas</div>
        </button>

        <button
          onClick={() => setSelectedFilter(selectedFilter === 'Regular' ? 'Todos' : 'Regular')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedFilter === 'Regular'
              ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Regular</span>
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-900 mt-1">{regularBatches.length} lotes</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">&gt; {alertConfig.attentionDays} dias</div>
        </button>

        {/* Card Exclusivo de Congelados */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'Congelados' ? 'Todos' : 'Congelados')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedFilter === 'Congelados'
              ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-400'
              : 'bg-sky-50/70 border-sky-200 hover:bg-sky-100/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-sky-800">
            <span className="flex items-center gap-1.5">
              <Snowflake className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Congelados</span>
            </span>
          </div>
          <div className="text-xl font-bold text-sky-900 mt-1">{frozenBatchesCount} lotes</div>
          <div className="text-[10px] text-sky-700 mt-0.5">Validade Pausada</div>
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar por ingrediente ou lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {selectedFilter !== 'Todos' && (
          <button
            onClick={() => setSelectedFilter('Todos')}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 whitespace-nowrap"
          >
            Ver Todos
          </button>
        )}
      </div>

      {/* Visualização em Cartões para Dispositivos Móveis (Mobile First) */}
      <div className="md:hidden space-y-3">
        {filteredBatches.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Nenhum lote corresponde aos filtros aplicados.
          </div>
        ) : (
          filteredBatches.map((batch, index) => {
            const isExpired = batch.expirationStatus === 'Vencido';
            const isUrgent = batch.expirationStatus === 'Urgente';
            const isAttention = batch.expirationStatus === 'Atencao';
            const isFrozen = batch.isFrozen;

            return (
              <div 
                key={batch.id} 
                className={`p-4 rounded-xl border shadow-xs space-y-3 transition-colors ${
                  isExpired 
                    ? 'bg-red-50/50 border-red-200' 
                    : isUrgent 
                      ? 'bg-orange-50/40 border-orange-200' 
                      : isFrozen 
                        ? 'bg-sky-50/30 border-sky-200' 
                        : 'bg-white border-slate-200'
                }`}
              >
                {/* Cabeçalho do Card: Posição PVPS, Lote e Estado */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    {index === 0 && !isExpired && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        <Sparkles className="w-3 h-3" />
                        1º PVPS
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-600">
                      Lote: {batch.batchNumber}
                    </span>
                  </div>

                  {isFrozen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      <Snowflake className="w-3 h-3 text-sky-600" />
                      Congelado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      Fresco
                    </span>
                  )}
                </div>

                {/* Nome do Alimento e Saldo */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{batch.foodItemName}</h3>
                    {batch.storageLocation && (
                      <span className="text-[11px] text-slate-500">Local: {batch.storageLocation}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Saldo</span>
                    <span className="text-base font-bold text-slate-800">
                      {formatNumber(batch.currentQuantity, batch.foodItemUnit)}
                    </span>
                  </div>
                </div>

                {/* Duas Validades: 1ª Validade e 2ª Validade */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-white/80 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">1ª Validade (Original)</span>
                    <span className={`text-xs ${isFrozen ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}`}>
                      {formatDate(batch.expirationDate)}
                    </span>
                    {isFrozen && (
                      <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                        Pausada em {formatDate(batch.frozenDate)}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">2ª Validade (Congelado)</span>
                    {isFrozen && batch.frozenExpirationDate ? (
                      <div>
                        <span className="font-bold text-sky-950 text-xs">
                          {formatDate(batch.frozenExpirationDate)}
                        </span>
                        <div className="text-[10px] text-sky-600 font-medium">Validade Ativa</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Não congelado</span>
                    )}
                  </div>
                </div>

                {/* Status do Prazo */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3.5 h-3.5" />
                        Vencido ({Math.abs(batch.daysUntilExpiration)}d)
                      </span>
                    ) : isUrgent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-orange-100 text-orange-800">
                        <Clock className="w-3.5 h-3.5" />
                        Vence em {batch.daysUntilExpiration} dias (Urgente)
                      </span>
                    ) : isAttention ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vence em {batch.daysUntilExpiration} dias
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vence em {batch.daysUntilExpiration} dias
                      </span>
                    )}
                  </div>

                  {/* Ação Culinária em Botão Touch */}
                  <div>
                    {isExpired ? (
                      <button
                        onClick={() => {
                          if (confirm(`Confirmar descarte e baixa sanitária do lote vencido "${batch.batchNumber}"?`)) {
                            onDiscardBatch(batch);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Descartar</span>
                      </button>
                    ) : !isFrozen ? (
                      <button
                        onClick={() => handleOpenFreeze(batch)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                        <span>Congelar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenThaw(batch)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Droplets className="w-3.5 h-3.5 text-amber-600" />
                        <span>Descongelar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabela com as DUAS Validades e Controle de Congelamento (Desktop e Tablets) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">PVPS</th>
                <th className="py-3 px-4">Alimento</th>
                <th className="py-3 px-4">Lote</th>
                <th className="py-3 px-4">Estado / Armazenamento</th>
                <th className="py-3 px-4">1ª Validade (Original)</th>
                <th className="py-3 px-4">2ª Validade (Congelado)</th>
                <th className="py-3 px-4">Situação PVPS</th>
                <th className="py-3 px-4 text-right">Saldo</th>
                <th className="py-3 px-4 text-center">Ações Culinárias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhum lote corresponde aos filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch, index) => {
                  const isExpired = batch.expirationStatus === 'Vencido';
                  const isUrgent = batch.expirationStatus === 'Urgente';
                  const isAttention = batch.expirationStatus === 'Atencao';
                  const isFrozen = batch.isFrozen;

                  return (
                    <tr 
                      key={batch.id} 
                      className={`transition-colors ${
                        isExpired 
                          ? 'bg-red-50/50' 
                          : isUrgent 
                            ? 'bg-orange-50/30' 
                            : isFrozen 
                              ? 'bg-sky-50/20 hover:bg-sky-50/40' 
                              : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-400">#{index + 1}</span>
                          {index === 0 && !isExpired && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                              <Sparkles className="w-3 h-3" />
                              1º PVPS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {batch.foodItemName}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {batch.batchNumber}
                      </td>

                      {/* Estado de Conservação */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isFrozen ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            <Snowflake className="w-3 h-3 text-sky-600" />
                            Congelado (-18°C)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                            Resfriado / Fresco
                          </span>
                        )}
                      </td>

                      {/* 1ª Validade Original */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs ${isFrozen ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}`}>
                          {formatDate(batch.expirationDate)}
                        </span>
                        {isFrozen && (
                          <div className="text-[10px] text-sky-700 font-semibold">
                            Pausada em {formatDate(batch.frozenDate)}
                          </div>
                        )}
                      </td>

                      {/* 2ª Validade (Congelado) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isFrozen && batch.frozenExpirationDate ? (
                          <div>
                            <span className="font-bold text-sky-950 text-xs">
                              {formatDate(batch.frozenExpirationDate)}
                            </span>
                            <div className="text-[10px] text-sky-600">Validade Ativa</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Situação do Prazo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3" />
                            Vencido ({Math.abs(batch.daysUntilExpiration)}d)
                          </span>
                        ) : isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3" />
                            {batch.daysUntilExpiration} dias (Urgente)
                          </span>
                        ) : isAttention ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            {batch.daysUntilExpiration} dias
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {batch.daysUntilExpiration} dias
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {formatNumber(batch.currentQuantity, batch.foodItemUnit)}
                      </td>

                      {/* Ações: Descartar / Congelar / Descongelar */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isExpired ? (
                            <button
                              onClick={() => {
                                if (confirm(`Confirmar descarte e baixa sanitária do lote vencido "${batch.batchNumber}"?`)) {
                                  onDiscardBatch(batch);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors shadow-2xs"
                              title="Descartar produto vencido"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Descartar</span>
                            </button>
                          ) : !isFrozen ? (
                            <button
                              onClick={() => handleOpenFreeze(batch)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded text-[11px] font-semibold transition-colors"
                              title="Congelar para pausar a validade original e estender o prazo"
                            >
                              <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                              <span>Congelar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenThaw(batch)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-semibold transition-colors"
                              title="Descongelar sob refrigeração para utilizar na aula"
                            >
                              <Droplets className="w-3.5 h-3.5 text-amber-600" />
                              <span>Descongelar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Congelar Lote */}
      {freezingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-sky-50">
              <div className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-sm">Congelar Lote (Pausar Validade)</h3>
              </div>
              <button onClick={() => setFreezingBatch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFreeze} className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500">Alimento:</span>
                <div className="font-bold text-slate-800 text-sm">{freezingBatch.foodItemName}</div>
                <div className="text-xs text-slate-600 mt-1">
                  Lote: <strong className="font-mono">{freezingBatch.batchNumber}</strong> • Saldo: {formatNumber(freezingBatch.currentQuantity, freezingBatch.foodItemUnit)}
                </div>
                <div className="text-xs text-amber-800 mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Validade original de resfriado: <strong>{formatDate(freezingBatch.expirationDate)}</strong> (será pausada pelo congelamento a -18°C).
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Congelamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={freezeData.frozenDate}
                    onChange={(e) => setFreezeData({ ...freezeData, frozenDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2ª Validade (Congelado) *
                  </label>
                  <input
                    type="date"
                    required
                    value={freezeData.frozenExpirationDate}
                    onChange={(e) => setFreezeData({ ...freezeData, frozenExpirationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-300 rounded-lg text-xs font-bold text-sky-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={freezeData.notes}
                  onChange={(e) => setFreezeData({ ...freezeData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFreezingBatch(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Congelamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Descongelar Lote */}
      {thawingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">Descongelar Lote para Aula</h3>
              </div>
              <button onClick={() => setThawingBatch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmThaw} className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500">Alimento:</span>
                <div className="font-bold text-slate-800 text-sm">{thawingBatch.foodItemName}</div>
                <div className="text-xs text-slate-600 mt-1">
                  Lote: <strong className="font-mono">{thawingBatch.batchNumber}</strong>
                </div>
                <div className="text-xs text-indigo-900 mt-1 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                  <strong>Boas Práticas ANVISA:</strong> O descongelamento deve ser feito em geladeira (≤ 5°C). Após descongelado, não pode ser recongelado cru e deve ser consumido em até 48 horas.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Descongelamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={thawData.thawedDate}
                    onChange={(e) => setThawData({ ...thawData, thawedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consumir Até (Prazo Final) *
                  </label>
                  <input
                    type="date"
                    required
                    value={thawData.consumeUntilDate}
                    onChange={(e) => setThawData({ ...thawData, consumeUntilDate: e.target.value })}
                    className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-lg text-xs font-bold text-amber-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setThawingBatch(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Descongelamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
