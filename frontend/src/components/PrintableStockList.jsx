import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  Filter, 
  ShoppingCart, 
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Clock,
  Sparkles,
  ClipboardList,
  Edit3,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { formatDate, formatNumber, formatCurrency } from '../api';

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

const COURSE_MAP = {
  'Todos': 'Cursos de Culinária & Gastronomia Prática',
  'Padeiro': 'Padeiro: Panificação e Massas Artesanais',
  'Pizzaiolo': 'Pizzaiolo: Preparo de Pizzas',
  'Confeitaria': 'Confeitaria: Bolos, Doces e Sobremesas',
  'Cozinha Geral': 'Cozinha Geral & Técnicas Gastronômicas'
};

export default function PrintableStockList({ items, schoolName }) {
  // Tipo de Lista: 'purchases' (Lista de Compras) ou 'inventory' (Geral de Estoque)
  const [listType, setListType] = useState('purchases');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCourse, setSelectedCourse] = useState('Pizzaiolo');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [onlyNeedsPurchase, setOnlyNeedsPurchase] = useState(true);

  // Dados Institucionais do Cabeçalho (Conforme foto da Fundação FAT & Governo do Estado de SP)
  const [headerInfo, setHeaderInfo] = useState({
    curso: 'Pizzaiolo: Preparo de Pizzas',
    periodo: 'Tarde',
    horario: '13:00 às 17:30',
    inicioFim: '06/07/2026 à 17/07/2026',
    local: 'Praça da Cidadania de Guarulhos',
    instrutor: 'Chef Responsável / Instrutor'
  });

  const [isEditingHeader, setIsEditingHeader] = useState(false);

  const handleCourseFilterChange = (course) => {
    setSelectedCourse(course);
    setHeaderInfo(prev => ({
      ...prev,
      curso: COURSE_MAP[course] || (course === 'Todos' ? 'Cursos Gerais de Culinária' : `Curso de ${course}`)
    }));
  };

  // Filtragem dos Itens por Categoria, Situação e CURSO
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCat = selectedCategory === 'Todos' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchStatus = selectedStatus === 'Todos' || item.stockStatus.toLowerCase() === selectedStatus.toLowerCase();
      
      const matchCourse = selectedCourse === 'Todos' || 
        (item.courses && item.courses.toLowerCase().includes(selectedCourse.toLowerCase())) ||
        (item.courseList && item.courseList.some(c => c.toLowerCase().includes(selectedCourse.toLowerCase())));

      // Se estiver no modo Lista de Compras e com o filtro ativo, focar nos itens que precisam de compra
      const needsPurchase = item.totalQuantity <= item.minQuantity || item.stockStatus === 'Baixo' || item.stockStatus === 'Zerado';
      const matchPurchaseFilter = listType === 'purchases' && onlyNeedsPurchase ? needsPurchase : true;

      return matchCat && matchStatus && matchCourse && matchPurchaseFilter;
    });
  }, [items, selectedCategory, selectedStatus, selectedCourse, listType, onlyNeedsPurchase]);

  const currentDate = new Date();
  const formattedEmissionDate = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const monthYearReference = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows = [];

    if (listType === 'purchases') {
      rows.push(['Item', 'Codigo', 'Categoria', 'Cursos', 'Saldo Atual', 'Estoque Minimo', 'Qtd a Comprar', 'Unidade', 'Fornecedor Habitual', 'Conferencia']);
      filteredItems.forEach(i => {
        const toBuy = Math.max(0, (i.minQuantity * 1.5) - i.totalQuantity);
        rows.push([
          `"${i.name}"`,
          `"${i.code}"`,
          `"${i.category}"`,
          `"${i.courses || 'Geral'}"`,
          i.totalQuantity,
          i.minQuantity,
          toBuy > 0 ? toBuy.toFixed(1) : (i.minQuantity - i.totalQuantity > 0 ? (i.minQuantity - i.totalQuantity).toFixed(1) : 0),
          i.unit,
          `"${i.storageLocation || ''}"`,
          '""'
        ]);
      });
    } else {
      rows.push(['Codigo', 'Nome do Alimento', 'Categoria', 'Cursos', 'Saldo em Estoque', 'Unidade', 'Validade Mais Proxima', 'Situacao', 'Local de Armazenamento', 'Conferencia Manual']);
      filteredItems.forEach(i => {
        rows.push([
          `"${i.code}"`,
          `"${i.name}"`,
          `"${i.category}"`,
          `"${i.courses || 'Geral'}"`,
          i.totalQuantity,
          i.unit,
          formatDate(i.nearestExpirationDate),
          i.stockStatus,
          `"${i.storageLocation || ''}"`,
          '""'
        ]);
      });
    }

    const csvContent = '\uFEFF' + rows.map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${listType === 'purchases' ? 'Lista_de_Compras_FAT_SP' : 'Lista_Estoque_FAT_SP'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controles de Tela (Ocultos na impressão física @media print) */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-800">
              {listType === 'purchases' ? 'Lista de Compras de Insumos (Oficial)' : 'Lista Geral de Estoque para Conferência'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Layout oficial formatado para impressão A4 com os logotipos do <strong>Governo do Estado de São Paulo</strong> e da <strong>Fundação FAT</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor do Tipo de Lista */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setListType('purchases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                listType === 'purchases' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Lista de Compras</span>
            </button>
            <button
              onClick={() => setListType('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                listType === 'inventory' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Conferência de Estoque</span>
            </button>
          </div>

          <button
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>{isEditingHeader ? 'Salvar Cabeçalho' : 'Editar Cabeçalho'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Folha A4</span>
          </button>
        </div>
      </div>

      {/* Editor Rápido dos Dados Institucionais (Opcional) */}
      {isEditingHeader && (
        <div className="no-print bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Editar Informações do Cabeçalho Oficial (FAT / Governo SP)</span>
            <span className="text-[11px] font-normal text-amber-700">Preencha conforme a turma das aulas práticas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nome do Curso:</label>
              <input
                type="text"
                value={headerInfo.curso}
                onChange={(e) => setHeaderInfo({ ...headerInfo, curso: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Período e Horário:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Período"
                  value={headerInfo.periodo}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, periodo: e.target.value })}
                  className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Horário"
                  value={headerInfo.horario}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, horario: e.target.value })}
                  className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Local da Unidade:</label>
              <input
                type="text"
                value={headerInfo.local}
                onChange={(e) => setHeaderInfo({ ...headerInfo, local: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Início e Fim do Curso / Mês:</label>
              <input
                type="text"
                value={headerInfo.inicioFim}
                onChange={(e) => setHeaderInfo({ ...headerInfo, inicioFim: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instrutor / Chef Responsável:</label>
              <input
                type="text"
                value={headerInfo.instrutor}
                onChange={(e) => setHeaderInfo({ ...headerInfo, instrutor: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros na Tela com FILTRO DE CURSO EM DESTAQUE */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        {/* SELEÇÃO DO CURSO (Padeiro, Pizzaiolo, Confeitaria...) */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-slate-800">Filtrar por Curso:</span>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-amber-500"
          >
            <option value="Todos">Todos os Cursos</option>
            <option value="Padeiro">Padeiro (Farinhas, Fermentos, Pães)</option>
            <option value="Pizzaiolo">Pizzaiolo (Farinhas, Mussarela, Molhos)</option>
            <option value="Confeitaria">Confeitaria (Nata, Chocolates, Gotas)</option>
            <option value="Cozinha Geral">Cozinha Geral (Carnes, Pescados, Arroz)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Categoria:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {listType === 'purchases' ? (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyNeedsPurchase}
              onChange={(e) => setOnlyNeedsPurchase(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
            />
            <span className="font-semibold text-slate-700">Apenas insumos que precisam de compra (Abaixo do Mínimo / Zerados)</span>
          </label>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Situação:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
            >
              <option value="Todos">Todas</option>
              <option value="Normal">Normal</option>
              <option value="Baixo">Estoque Baixo</option>
              <option value="Zerado">Zerado</option>
              <option value="Vencido">Lote Vencido</option>
            </select>
          </div>
        )}
      </div>

      {/* =========================================================================
          FOLHA OFICIAL FORMATADA PARA IMPRESSÃO A4 (IDÊNTICA À FOTO FAT & GOVERNO SP)
          ========================================================================= */}
      <div className="print-only-container bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none">
        
        {/* CABEÇALHO INSTITUCIONAL OFICIAL COM LOGOS (GOVERNO DO ESTADO DE SP & FUNDAÇÃO FAT) */}
        <div className="border-2 border-slate-900 mb-4 bg-white">
          <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-900">
            
            {/* Bloco 1: Logo Governo do Estado de São Paulo */}
            <div className="sm:w-1/4 p-2 sm:p-2.5 flex flex-col items-center justify-center bg-white min-h-[84px]">
              <img 
                src="/logo-sp.png" 
                alt="Governo do Estado de São Paulo" 
                className="h-16 sm:h-[68px] max-w-[90%] w-auto object-contain"
              />
            </div>

            {/* Bloco 2: Logo Fundação FAT */}
            <div className="sm:w-1/4 p-2 sm:p-2.5 flex flex-col items-center justify-center bg-white min-h-[84px]">
              <img 
                src="/logo-fat.png" 
                alt="Fundação FAT" 
                className="h-8 sm:h-[36px] max-w-[85%] w-auto object-contain"
              />
            </div>

            {/* Bloco 3: Dados Oficiais do Documento e do Curso */}
            <div className="sm:w-2/4 p-2.5 flex flex-col justify-center text-[11px] leading-tight text-slate-900 bg-white">
              <div className="font-extrabold text-sm sm:text-base tracking-tight uppercase border-b border-slate-400 pb-1 mb-1 text-slate-900">
                {listType === 'purchases' 
                  ? 'LISTA DE COMPRAS - INSUMOS E ALIMENTOS' 
                  : 'FOLHA DE ESTOQUE & CONFERÊNCIA FÍSICA'}
              </div>
              <div className="space-y-0.5">
                <div><strong>CURSO:</strong> {headerInfo.curso}</div>
                <div className="flex flex-wrap gap-x-3">
                  <span><strong>PERÍODO:</strong> {headerInfo.periodo}</span>
                  <span><strong>HORÁRIO:</strong> {headerInfo.horario}</span>
                </div>
                <div><strong>INÍCIO E FIM:</strong> {headerInfo.inicioFim}</div>
                <div><strong>LOCAL:</strong> {headerInfo.local}</div>
                <div className="text-[10px] text-slate-600 pt-0.5 border-t border-slate-200 mt-0.5 flex justify-between">
                  <span><strong>DATA DE EMISSÃO:</strong> {formattedEmissionDate}</span>
                  <span><strong>MÊS REF:</strong> <span className="capitalize">{monthYearReference}</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TABELA 1: MODO LISTA DE COMPRAS (INSUMOS PARA AULAS PRÁTICAS) */}
        {listType === 'purchases' ? (
          <table className="w-full text-left text-xs border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900 text-[11px] uppercase">
                <th className="py-1.5 px-2 border border-slate-900 w-8 text-center">Nº</th>
                <th className="py-1.5 px-2 border border-slate-900">Alimento / Insumo</th>
                <th className="py-1.5 px-2 border border-slate-900 w-24">Categoria</th>
                <th className="py-1.5 px-2 border border-slate-900 w-28">Cursos que Usam</th>
                <th className="py-1.5 px-2 border border-slate-900 text-right w-18">Saldo Atual</th>
                <th className="py-1.5 px-2 border border-slate-900 text-right w-18">Estoque Mín.</th>
                <th className="py-1.5 px-2 border border-slate-900 text-right w-22 bg-amber-100/80 font-extrabold">Qtd. Comprar</th>
                <th className="py-1.5 px-2 border border-slate-900 w-10 text-center">Un.</th>
                <th className="py-1.5 px-2 border border-slate-900 w-24">Situação</th>
                <th className="py-1.5 px-2 border border-slate-900 w-40 text-center">Conferência / Recebimento</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 border border-slate-900">
                    Nenhum insumo necessita de compra para o curso selecionado ({selectedCourse}).
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const deficit = Math.max(0, item.minQuantity - item.totalQuantity);
                  const suggestedBuy = deficit > 0 ? (item.minQuantity * 1.5 - item.totalQuantity) : (item.minQuantity || 1);
                  const qtyToBuy = Math.max(1, Math.ceil(suggestedBuy));

                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="py-1.5 px-2 border border-slate-900 text-center font-bold text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Cód: {item.code} {item.notes && `• ${item.notes}`}</div>
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900 text-[11px] text-slate-700">
                        {item.category}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900 text-[10px] font-semibold text-slate-800">
                        {item.courses || 'Geral'}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900 text-right font-medium">
                        {formatNumber(item.totalQuantity)}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900 text-right text-slate-600 font-medium">
                        {formatNumber(item.minQuantity)}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900 text-right font-extrabold text-sm text-slate-900 bg-amber-50">
                        {formatNumber(qtyToBuy)}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900 text-center font-semibold text-slate-800">
                        {item.unit}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900">
                        {item.totalQuantity <= 0 ? (
                          <span className="font-bold text-red-700 inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>Zerado</span>
                          </span>
                        ) : item.totalQuantity <= item.minQuantity ? (
                          <span className="font-bold text-amber-700 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Estoque Baixo</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Regular</span>
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-900">
                        <div className="h-5 flex items-center justify-between text-[9px] text-slate-500">
                          <span>[  ] Comprado</span>
                          <span>Qtd: _____</span>
                          <span>Visto: ____</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          /* TABELA 2: MODO LISTA GERAL DE ESTOQUE E CONFERÊNCIA FÍSICA */
          <table className="w-full text-left text-xs border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900 text-[11px] uppercase">
                <th className="py-1.5 px-2 border border-slate-900 w-8 text-center">Nº</th>
                <th className="py-1.5 px-2 border border-slate-900 w-16">Código</th>
                <th className="py-1.5 px-2 border border-slate-900">Alimento / Insumo</th>
                <th className="py-1.5 px-2 border border-slate-900 w-24">Categoria</th>
                <th className="py-1.5 px-2 border border-slate-900 w-28">Cursos</th>
                <th className="py-1.5 px-2 border border-slate-900 text-right w-18">Saldo</th>
                <th className="py-1.5 px-2 border border-slate-900 w-10 text-center">Un.</th>
                <th className="py-1.5 px-2 border border-slate-900 w-22">Validade PVPS</th>
                <th className="py-1.5 px-2 border border-slate-900 w-22">Situação</th>
                <th className="py-1.5 px-2 border border-slate-900 w-24">Armazenamento</th>
                <th className="py-1.5 px-2 border border-slate-900 w-32 text-center">Conferência Física</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-1.5 px-2 border border-slate-900 text-center font-bold text-slate-700">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 font-mono text-slate-600">
                    {item.code}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 text-[11px] text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 text-[10px] font-semibold text-slate-800">
                    {item.courses || 'Geral'}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 text-right font-bold text-slate-800">
                    {formatNumber(item.totalQuantity)}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 text-center text-slate-600">
                    {item.unit}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 whitespace-nowrap text-slate-800">
                    {formatDate(item.nearestExpirationDate)}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 font-semibold">
                    {item.stockStatus}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 text-[10px] text-slate-600">
                    {item.storageLocation || '-'}
                  </td>
                  <td className="py-1.5 px-2 border border-slate-900 text-center">
                    <div className="h-5 flex items-end justify-between text-[9px] text-slate-500">
                      <span>Qtd: _____</span>
                      <span>[  ] OK</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* RODAPÉ OFICIAL DE ASSINATURAS E CARIMBO */}
        <div className="mt-8 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-800">
          <div>
            <div className="h-10 border-b border-slate-700"></div>
            <div className="pt-1 font-bold">{headerInfo.instrutor}</div>
            <div className="text-[10px] text-slate-500">Instrutor / Chef de Cozinha</div>
          </div>

          <div>
            <div className="h-10 border-b border-slate-700"></div>
            <div className="pt-1 font-bold">Coordenação Pedagógica</div>
            <div className="text-[10px] text-slate-500">Fundação FAT • Acompanhamento</div>
          </div>

          <div>
            <div className="h-10 border-b border-slate-700"></div>
            <div className="pt-1 font-bold">Responsável pelo Recebimento</div>
            <div className="text-[10px] text-slate-500">Data: ____/____/________</div>
          </div>
        </div>

      </div>
    </div>
  );
}
