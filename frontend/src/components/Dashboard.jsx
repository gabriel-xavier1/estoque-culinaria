import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BarChart3, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DashboardExpress from './DashboardExpress';
import DashboardManager from './DashboardManager';

export default function Dashboard(props) {
  // Versão 1: 'express' (5 minutos por dia / Mobile First)
  // Versão 2: 'management' (Painel Executivo / Coordenação e Gestão)
  const [uxVersion, setUxVersion] = useState(() => {
    return localStorage.getItem('culinary_ux_version') || 'express';
  });

  const handleSwitchVersion = (version) => {
    setUxVersion(version);
    localStorage.setItem('culinary_ux_version', version);
  };

  return (
    <div className="space-y-4">
      {/* SELETOR INTERATIVO DE VERSÕES DE UX (Permite alternar e comparar em tempo real) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 sm:p-3.5 rounded-2xl shadow-sm border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Comparador de Experiência (UX)
              </div>
              <div className="text-xs text-slate-300">
                Selecione abaixo para alternar instantaneamente entre as 2 abordagens:
              </div>
            </div>
          </div>

          {/* Toggle Pills das 2 Versões */}
          <div className="bg-slate-950/80 p-1 rounded-xl inline-flex items-center gap-1 border border-slate-700/80 self-start sm:self-auto">
            <button
              onClick={() => handleSwitchVersion('express')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                uxVersion === 'express'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Versão 1: Bancada Rápida (5 Min)</span>
              {uxVersion === 'express' && <Check className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <button
              onClick={() => handleSwitchVersion('management')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                uxVersion === 'management'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Versão 2: Painel de Gestão</span>
              {uxVersion === 'management' && <Check className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Legenda Explicativa da Versão Ativa */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
          {uxVersion === 'express' ? (
            <span>
              <strong className="text-amber-400">Versão 1 ativa:</strong> Focada no chef na cozinha. Botões gigantes de saída e entrada rápida em 10 segundos, cards de ingredientes com toque rápido e zero burocracia.
            </span>
          ) : (
            <span>
              <strong className="text-indigo-400">Versão 2 ativa:</strong> Focada na coordenação e compras. Indicadores financeiros em R$, tabelas estruturadas de cronograma PVPS, reposição e auditoria.
            </span>
          )}
          <span className="hidden md:inline-block text-[10px] text-slate-500">
            Pode alternar a qualquer momento
          </span>
        </div>
      </div>

      {/* RENDERIZAÇÃO DA VERSÃO ESCOLHIDA */}
      {uxVersion === 'express' ? (
        <DashboardExpress {...props} />
      ) : (
        <DashboardManager {...props} />
      )}
    </div>
  );
}
