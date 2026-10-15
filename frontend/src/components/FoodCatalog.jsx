import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  X,
  Apple,
  Sparkles,
  ClipboardCheck,
  Package,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { formatNumber, formatDate, formatCurrency } from '../api';

const CATEGORIES = [
  'Todos',
  'Farinhas e Grãos',
  'Laticínios',
  'Ovos e Laticínios',
  'Carnes e Aves',
  'Pescados e Frutos do Mar',
  'Hortaliças e Folhas',
  'Frutas',
  'Temperos e Condimentos',
  'Óleos e Gorduras',
  'Outros'
];

const COURSES = [
  'Todos',
  'Padeiro',
  'Pizzaiolo',
  'Confeitaria',
  'Cozinha Geral'
];

const AVAILABLE_COURSE_OPTIONS = [
  'Padeiro',
  'Pizzaiolo',
  'Confeitaria',
  'Cozinha Geral'
];

const UNITS = ['kg', 'g', 'L', 'ml', 'un', 'pct', 'cx'];

export default function FoodCatalog({ items, onSaveItem, onDeleteItem, onAdjustStock }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCourse, setSelectedCourse] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingBatchesItem, setViewingBatchesItem] = useState(null);
  const [auditItem, setAuditItem] = useState(null);
  const [auditCount, setAuditCount] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Farinhas e Grãos',
    unit: 'kg',
    minQuantity: '',
    storageLocation: '',
    courses: ['Padeiro', 'Pizzaiolo'],
    notes: ''
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.code.toLowerCase().includes(search.toLowerCase()) ||
                          (item.storageLocation && item.storageLocation.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === 'Todos' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchCourse = selectedCourse === 'Todos' || 
        (item.courses && item.courses.toLowerCase().includes(selectedCourse.toLowerCase())) ||
        (item.courseList && item.courseList.some(c => c.toLowerCase().includes(selectedCourse.toLowerCase())));

      return matchSearch && matchCategory && matchCourse;
    });
  }, [items, search, selectedCategory, selectedCourse]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      category: 'Farinhas e Grãos',
      unit: 'kg',
      minQuantity: '',
      storageLocation: '',
      courses: ['Padeiro', 'Pizzaiolo'],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const initialCourses = item.courseList && item.courseList.length > 0
      ? item.courseList
      : (item.courses ? item.courses.split(',').map(s => s.trim()) : ['Padeiro', 'Pizzaiolo']);

    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      minQuantity: item.minQuantity,
      storageLocation: item.storageLocation || '',
      courses: initialCourses,
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSaveItem({
      ...formData,
      courses: Array.isArray(formData.courses) ? formData.courses.join(', ') : (formData.courses || 'Padeiro, Pizzaiolo'),
      minQuantity: parseFloat(formData.minQuantity) || 0
    }, editingItem?.id);

    setIsModalOpen(false);
  };

  const handleOpenAuditModal = (item) => {
    setAuditItem(item);
    setAuditCount(item.totalQuantity.toString());
  };

  const handleConfirmAudit = (e) => {
    e.preventDefault();
    if (!auditItem) return;
    const count = parseFloat(auditCount);
    if (isNaN(count) || count < 0) {
      alert('Informe uma quantidade válida.');
      return;
    }
    onAdjustStock({
      foodItemId: auditItem.id,
      physicalQuantity: count,
      responsible: 'Professor/Estoquista',
      reason: 'Conferência física',
      notes: 'Ajuste de inventário realizado no catálogo'
    });
    setAuditItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-800">Catálogo e Cadastro de Alimentos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingredientes catalogados por categoria e <strong>cursos que utilizam cada material</strong> (Padeiro, Pizzaiolo, Confeitaria...)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Alimento</span>
        </button>
      </div>

      {/* Barra de Filtros com Busca, Categoria e CURSO */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar alimento por nome, código ou local de armazenamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filtro por Curso (Padeiro, Pizzaiolo, Confeitaria...) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-amber-50/70 border border-amber-300 rounded-lg text-xs text-amber-950 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c === 'Todos' ? 'Todos os Cursos' : `Curso: ${c}`}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualização em Cartões para Dispositivos Móveis (Mobile First) */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Nenhum alimento encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLow = item.stockStatus === 'Baixo' || item.stockStatus === 'Zerado';
            const isExpired = item.stockStatus === 'Vencido';
            const courseList = item.courseList && item.courseList.length > 0 
              ? item.courseList 
              : (item.courses ? item.courses.split(',').map(s => s.trim()) : ['Padeiro', 'Pizzaiolo']);

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                {/* Cabeçalho do Card: Código, Categoria e Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </div>

                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      Vencido
                    </span>
                  ) : item.stockStatus === 'Zerado' ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700">
                      Zerado
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Baixo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Normal
                    </span>
                  )}
                </div>

                {/* Nome do Alimento e Cursos que utilizam */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                  {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                  
                  {/* Badges dos Cursos que utilizam este insumo */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Cursos:</span>
                    {courseList.map((courseName) => (
                      <span key={courseName} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        {courseName}
                      </span>
                    ))}
                  </div>

                  {item.storageLocation && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.storageLocation}</span>
                    </div>
                  )}
                </div>

                {/* Saldo Atual e Estoque Mínimo */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Saldo em Estoque</span>
                    <span className={`text-base font-bold ${item.totalQuantity <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatNumber(item.totalQuantity)} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">Estoque Mínimo</span>
                    <span className="text-slate-700 font-semibold">
                      {formatNumber(item.minQuantity)} {item.unit}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação Touch (Mínimo 40px) */}
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setViewingBatchesItem(item)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                    title="Ver Lotes e Validades (PVPS)"
                  >
                    <Layers className="w-4 h-4 mb-0.5 text-amber-600" />
                    <span className="text-[10px] font-semibold">Lotes</span>
                  </button>

                  <button
                    onClick={() => handleOpenAuditModal(item)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                    title="Conferência Física Rápida"
                  >
                    <ClipboardCheck className="w-4 h-4 mb-0.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold">Conferir</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                    title="Editar Alimento"
                  >
                    <Edit2 className="w-4 h-4 mb-0.5 text-blue-600" />
                    <span className="text-[10px] font-semibold">Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o alimento "${item.name}"?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 transition-colors"
                    title="Excluir Alimento"
                  >
                    <Trash2 className="w-4 h-4 mb-0.5 text-rose-600" />
                    <span className="text-[10px] font-semibold">Excluir</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabela de Alimentos para Desktop e Tablets */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Alimento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Cursos que Utilizam</th>
                <th className="py-3 px-4 text-right">Saldo Atual</th>
                <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4">Armazenamento</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhum alimento encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stockStatus === 'Baixo' || item.stockStatus === 'Zerado';
                  const isExpired = item.stockStatus === 'Vencido';
                  const courseList = item.courseList && item.courseList.length > 0 
                    ? item.courseList 
                    : (item.courses ? item.courses.split(',').map(s => s.trim()) : ['Padeiro', 'Pizzaiolo']);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                        {item.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                        {item.notes && <div className="text-[11px] text-slate-400 mt-0.5">{item.notes}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {courseList.map((c) => (
                            <span key={c} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold text-sm ${item.totalQuantity <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {formatNumber(item.totalQuantity)} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium">
                        {formatNumber(item.minQuantity)} {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            Lote Vencido
                          </span>
                        ) : item.stockStatus === 'Zerado' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700">
                            Zerado
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Estoque Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.storageLocation ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.storageLocation}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingBatchesItem(item)}
                            title="Ver Lotes e Validades (PVPS)"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAuditModal(item)}
                            title="Conferência Física Rápida"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar Alimento"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir o alimento "${item.name}"?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            title="Excluir Alimento"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal Simples de Cadastro / Edição com Seleção de Cursos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingItem ? 'Editar Cadastro do Alimento' : 'Novo Alimento'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código (Auto)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="ALIM-014"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Alimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Farinha de Trigo Especial"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SELEÇÃO DOS CURSOS QUE UTILIZAM ESTE INSUMO */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>Cursos que utilizam este insumo * (Ex: Padeiro precisa de muita farinha)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                  {AVAILABLE_COURSE_OPTIONS.map((c) => {
                    const isChecked = Array.isArray(formData.courses) && formData.courses.includes(c);
                    return (
                      <label key={c} className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let newCourses = Array.isArray(formData.courses) ? [...formData.courses] : [];
                            if (e.target.checked) {
                              if (!newCourses.includes(c)) newCourses.push(c);
                            } else {
                              newCourses = newCourses.filter(item => item !== c);
                            }
                            setFormData({ ...formData, courses: newCourses });
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>{c}</span>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Permite gerar listas de compras e conferência de estoque separadas por curso.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medida *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Mínimo Desejado
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    placeholder="Ex: 5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Local de Armazenamento
                  </label>
                  <input
                    type="text"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    placeholder="Ex: Geladeira 1, Despensa B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Uso para massas de pão e pizzas de fermentação lenta..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs transition-colors"
                >
                  {editingItem ? 'Salvar Alterações' : 'Salvar Alimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Simples de Conferência Física Rápida */}
      {auditItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Conferência Física de Saldo</h3>
              </div>
              <button onClick={() => setAuditItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAudit} className="p-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500">Alimento:</span>
                <div className="font-bold text-slate-800 text-sm">{auditItem.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Saldo atual registrado: <strong>{formatNumber(auditItem.totalQuantity, auditItem.unit)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade Real Contada ({auditItem.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={auditCount}
                  onChange={(e) => setAuditCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuditItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Confirmar Contagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Lotes e PVPS */}
      {viewingBatchesItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Lotes do Alimento: {viewingBatchesItem.name}
                </h3>
              </div>
              <button onClick={() => setViewingBatchesItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2.5">
              {(!viewingBatchesItem.batches || viewingBatchesItem.batches.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Nenhum lote ativo registrado.
                </div>
              ) : (
                viewingBatchesItem.batches.map((batch, idx) => (
                  <div key={batch.id} className={`p-3 rounded-xl border text-xs ${idx === 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono">{batch.batchNumber}</span>
                      <span>{formatNumber(batch.currentQuantity, viewingBatchesItem.unit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 mt-1 text-[11px]">
                      <span>Validade: <strong>{formatDate(batch.expirationDate)}</strong></span>
                      {idx === 0 && <span className="text-amber-700 font-bold">1º a Sair (PVPS)</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingBatchesItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
