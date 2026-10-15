import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sun, 
  Sunset, 
  Moon, 
  Clock, 
  Wheat, 
  Pizza, 
  Cake, 
  ChefHat, 
  Printer, 
  UtensilsCrossed, 
  Plus, 
  Check, 
  Users, 
  Package, 
  BookOpen, 
  X,
  Edit2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { formatNumber } from '../api';

export const INITIAL_COURSES = [
  {
    id: 'Padeiro',
    name: 'Padeiro',
    title: 'Padeiro: Panificação Artesanal e Confeitaria Básica',
    icon: Wheat,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Técnicas de fermentação biológica e natural (levain), sova, modelagem de pães artesanais, baguetes, focaccias e pães doces.',
    shifts: [
      { id: 'manha', label: 'Manhã', period: 'Matutino', time: '08:00 às 12:00', instructor: 'Prof. Carlos André' },
      { id: 'tarde', label: 'Tarde', period: 'Vespertino', time: '13:00 às 17:00', instructor: 'Chef Helena' },
      { id: 'noite', label: 'Noite', period: 'Noturno', time: '18:00 às 22:00', instructor: 'Prof. Marcos Souza' }
    ]
  },
  {
    id: 'Pizzaiolo',
    name: 'Pizzaiolo',
    title: 'Pizzaiolo: Preparo de Pizzas Clássicas e Forneria',
    icon: Pizza,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Massas de longa maturação, hidratação de farinhas, molhos clássicos pomodoro, técnicas de abertura, forneria e coberturas nobres.',
    shifts: [
      { id: 'manha', label: 'Manhã', period: 'Matutino', time: '08:00 às 12:00', instructor: 'Chef Helena' },
      { id: 'tarde', label: 'Tarde', period: 'Vespertino', time: '13:00 às 17:00', instructor: 'Prof. Carlos André' },
      { id: 'noite', label: 'Noite', period: 'Noturno', time: '18:00 às 22:00', instructor: 'Chef Giovanni' }
    ]
  },
  {
    id: 'Confeitaria',
    name: 'Confeitaria',
    title: 'Confeiteiro: Sobremesas, Chocolataria e Pastelaria Fina',
    icon: Cake,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Massas folhadas e quebradiças, cremes clássicos (pâtissière, diplomata), mousses, temperagem de chocolate nobre e finalizações.',
    shifts: [
      { id: 'manha', label: 'Manhã', period: 'Matutino', time: '08:00 às 12:00', instructor: 'Chef Mariana' },
      { id: 'tarde', label: 'Tarde', period: 'Vespertino', time: '13:00 às 17:00', instructor: 'Chef Mariana' },
      { id: 'noite', label: 'Noite', period: 'Noturno', time: '18:00 às 22:00', instructor: 'Profª Letícia' }
    ]
  },
  {
    id: 'Cozinha Geral',
    name: 'Cozinha Geral',
    title: 'Cozinheiro: Técnicas Culinárias Fundamentais e Salgados',
    icon: ChefHat,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Cortes clássicos franceses, fundos e caldos básicos, cocção de carnes e pescados, massas frescas, arrozes e boas práticas sanitárias.',
    shifts: [
      { id: 'manha', label: 'Manhã', period: 'Matutino', time: '08:00 às 12:00', instructor: 'Chef Helena' },
      { id: 'tarde', label: 'Tarde', period: 'Vespertino', time: '13:00 às 17:00', instructor: 'Chef Roberto' },
      { id: 'noite', label: 'Noite', period: 'Noturno', time: '18:00 às 22:00', instructor: 'Chef Roberto' }
    ]
  }
];

export default function CoursesModule({ 
  items = [], 
  onNavigate, 
  onOpenConsumptionModal,
  onSelectCourseShiftForPrint 
}) {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('culinary_courses_list');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [selectedShiftFilter, setSelectedShiftFilter] = useState('all'); // 'all' | 'manha' | 'tarde' | 'noite'
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Salvar no storage quando mudar
  const saveCourses = (newCourses) => {
    setCourses(newCourses);
    localStorage.setItem('culinary_courses_list', JSON.stringify(newCourses));
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newCourse = {
      id: newCourseName.trim(),
      name: newCourseName.trim(),
      title: `Curso de ${newCourseName.trim()}`,
      icon: GraduationCap,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      description: newCourseDesc.trim() || 'Aulas práticas de gastronomia e culinária.',
      shifts: [
        { id: 'manha', label: 'Manhã', period: 'Matutino', time: '08:00 às 12:00', instructor: 'Instrutor Manhã' },
        { id: 'tarde', label: 'Tarde', period: 'Vespertino', time: '13:00 às 17:00', instructor: 'Instrutor Tarde' },
        { id: 'noite', label: 'Noite', period: 'Noturno', time: '18:00 às 22:00', instructor: 'Instrutor Noite' }
      ]
    };

    const updated = [...courses, newCourse];
    saveCourses(updated);
    setNewCourseName('');
    setNewCourseDesc('');
    setIsAddCourseModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. CABEÇALHO DO MÓDULO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <GraduationCap className="w-4 h-4" />
            <span>Grade Pedagógica de Culinária</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Cursos & Turmas Ativas (Manhã, Tarde e Noite)
          </h1>
          <p className="text-xs text-slate-500">
            Cada curso opera em 3 turnos diários. Acompanhe os insumos dedicados e horários de aula.
          </p>
        </div>

        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Curso</span>
        </button>
      </div>

      {/* 2. BARRA DE VISÃO DOS 3 TURNOS DIÁRIOS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Horários Oficiais das Turmas (3 Turnos por Curso):
          </span>
          <span className="text-[11px] text-slate-400 font-normal">Filtre por turno para ver o cronograma</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Turno Manhã */}
          <button
            onClick={() => setSelectedShiftFilter(selectedShiftFilter === 'manha' ? 'all' : 'manha')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedShiftFilter === 'manha'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Sun className="w-4 h-4 text-amber-600" />
                Turma da Manhã
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                08:00 - 12:00
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Período Matutino • Práticas de café, panificação e pré-preparo</p>
          </button>

          {/* Turno Tarde */}
          <button
            onClick={() => setSelectedShiftFilter(selectedShiftFilter === 'tarde' ? 'all' : 'tarde')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedShiftFilter === 'tarde'
                ? 'bg-orange-50/80 border-orange-300 ring-2 ring-orange-500/20'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800">
                <Sunset className="w-4 h-4 text-orange-600" />
                Turma da Tarde
              </span>
              <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded">
                13:00 - 17:00
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Período Vespertino • Forneria, sobremesas e confecção</p>
          </button>

          {/* Turno Noite */}
          <button
            onClick={() => setSelectedShiftFilter(selectedShiftFilter === 'noite' ? 'all' : 'noite')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedShiftFilter === 'noite'
                ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                <Moon className="w-4 h-4 text-indigo-600" />
                Turma da Noite
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                18:00 - 22:00
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Período Noturno • Pratos quentes, massas e fornadas finais</p>
          </button>
        </div>
      </div>

      {/* 3. LISTA COMPLETA DOS CURSOS & SUAS 3 TURMAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map((course) => {
          const Icon = course.icon || GraduationCap;
          // Insumos pertencentes a este curso
          const courseItems = items.filter(i => 
            (i.courseList && i.courseList.includes(course.name)) || 
            (i.courses && i.courses.includes(course.name))
          );
          const lowStockInCourse = courseItems.filter(i => i.totalQuantity < i.minQuantity).length;

          return (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between hover:border-amber-300 transition-all"
            >
              <div>
                {/* Header do Curso */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {course.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {course.title || `Curso Profissionalizante de ${course.name}`}
                      </div>
                    </div>
                  </div>

                  {lowStockInCourse > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {lowStockInCourse} insumo(s) baixo
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {course.description}
                </p>

                {/* As 3 Turmas do Curso */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Horário das 3 Turmas Ativas:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {course.shifts && course.shifts.map((shift) => {
                      const ShiftIcon = shift.id === 'manha' ? Sun : shift.id === 'tarde' ? Sunset : Moon;
                      const isHighlighted = selectedShiftFilter === shift.id;

                      return (
                        <div 
                          key={shift.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            isHighlighted
                              ? 'bg-amber-50 border-amber-300 font-bold'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <ShiftIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>{shift.label}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 mt-0.5">{shift.time}</div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate">{shift.instructor}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Insumos Principais do Curso */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-400">
                      Insumos do Curso ({courseItems.length}):
                    </span>
                    <button 
                      onClick={() => onNavigate && onNavigate('pantry-unified')}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Ver na despensa &rarr;
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {courseItems.slice(0, 5).map(item => (
                      <span 
                        key={item.id} 
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          item.totalQuantity < item.minQuantity
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.name}: <strong>{formatNumber(item.totalQuantity, item.unit)}</strong>
                      </span>
                    ))}
                    {courseItems.length > 5 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                        +{courseItems.length - 5} outros
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação Direta no Card do Curso */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (onSelectCourseShiftForPrint) {
                      onSelectCourseShiftForPrint(course.name, 'Tarde');
                    } else if (onNavigate) {
                      onNavigate('print');
                    }
                  }}
                  className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir Folha A4</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenConsumptionModal) {
                      onOpenConsumptionModal(courseItems[0] || null);
                    } else if (onNavigate) {
                      onNavigate('consumption');
                    }
                  }}
                  className="flex-1 py-2 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Baixa de Aula</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA CADASTRAR NOVO CURSO */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">Novo Curso de Culinária</h3>
              </div>
              <button onClick={() => setIsAddCourseModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Curso:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salgadeiro Profissional, Chocolatier..."
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição / Ementa das Aulas:</label>
                <textarea
                  rows="3"
                  placeholder="Descreva as técnicas ensinadas e preparações práticas..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  As 3 turmas padrão serão geradas automaticamente:
                </div>
                <div className="text-[11px] text-amber-800">
                  • <strong>Manhã:</strong> 08:00 às 12:00<br/>
                  • <strong>Tarde:</strong> 13:00 às 17:00<br/>
                  • <strong>Noite:</strong> 18:00 às 22:00
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Salvar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
