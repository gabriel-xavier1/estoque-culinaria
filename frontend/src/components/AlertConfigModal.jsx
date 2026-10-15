import React, { useState } from 'react';
import { Settings, X, Check, Sliders, Building, AlertCircle } from 'lucide-react';

export default function AlertConfigModal({ config, onClose, onSave }) {
  const [formData, setFormData] = useState({
    urgentDays: config?.urgentDays || 7,
    attentionDays: config?.attentionDays || 30,
    schoolName: config?.schoolName || 'Curso de Culinária & Gastronomia Prática'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...config,
      urgentDays: parseInt(formData.urgentDays) || 7,
      attentionDays: parseInt(formData.attentionDays) || 30,
      schoolName: formData.schoolName.trim() || 'Curso de Culinária'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Configuração de Alertas de Validade</h3>
              <p className="text-xs text-slate-500">Personalize os prazos de aviso e o nome da instituição</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Curso / Escola de Culinária
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="Ex: Ateliê Gastronômico & Escola de Culinária"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <span className="text-[10px] text-slate-400">Exibido no cabeçalho dos relatórios e listas de impressão.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-orange-700 mb-1">
                Alerta Urgente (Dias)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={formData.urgentDays}
                onChange={(e) => setFormData({ ...formData, urgentDays: e.target.value })}
                className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-lg text-xs font-bold text-orange-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Padrão: 7 dias (atenção prioritária).</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">
                Alerta de Atenção (Dias)
              </label>
              <input
                type="number"
                min="2"
                max="180"
                required
                value={formData.attentionDays}
                onChange={(e) => setFormData({ ...formData, attentionDays: e.target.value })}
                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Padrão: 30 dias (programar uso).</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Regra de Segurança:</span> Lotes cuja validade já expirou serão sempre sinalizados como <strong className="text-red-700 font-bold inline-flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-red-600 inline" /> Vencido</strong> e destacados em vermelho, independentemente dos dias configurados.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
