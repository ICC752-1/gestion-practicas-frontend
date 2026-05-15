import { Search, ArrowLeft, Check, X, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Management({ students, onUpdateStatus, onBack }) {
  const [filterMode, setFilterMode] = useState('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCarrera, setSelectedCarrera] = useState('Todas');
  const [selectedEmpresa, setSelectedEmpresa] = useState('Todas');

  const carreras = ['Todas', ...new Set(students.map(s => s.carrera))];
  const empresas = ['Todas', ...new Set(students.map(s => s.empresa))];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCarrera = selectedCarrera === 'Todas' || s.carrera === selectedCarrera;
    const matchesEmpresa = selectedEmpresa === 'Todas' || s.empresa === selectedEmpresa;
    
    let matchesStatus = true;
    if (filterMode === 'inicio') matchesStatus = s.estado === 'Pendiente Inicio';
    else if (filterMode === 'termino') matchesStatus = s.estado === 'Pendiente Finalización';
    
    return matchesSearch && matchesCarrera && matchesEmpresa && matchesStatus;
  });

  const clearFilters = () => {
    setSelectedCarrera('Todas');
    setSelectedEmpresa('Todas');
    setSearchTerm('');
  };

  const getBorderColor = (status) => {
    if (status === 'Pendiente Inicio') return 'border-l-[#B5305F]';
    if (status === 'Pendiente Finalización') return 'border-l-amber-500';
    if (status === 'Finalizada') return 'border-l-emerald-500';
    if (status === 'En curso') return 'border-l-blue-500';
    return 'border-l-gray-300';
  };

  const getBadgeColor = (status) => {
    if (status === 'Pendiente Inicio') return 'border-[#B5305F] text-[#B5305F]';
    if (status === 'Pendiente Finalización') return 'border-amber-500 text-amber-500';
    if (status === 'Finalizada') return 'border-emerald-500 text-emerald-500';
    return 'border-gray-200 text-gray-400';
  };

  return (
    <div className="space-y-6 lg:px-12 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-[#B5305F] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold underline-offset-4 group-hover:underline">Volver al Panel</span>
          </button>
          <h2 className="text-3xl font-bold text-[#B5305F] mb-1 font-display">Gestión de Prácticas</h2>
          <p className="text-gray-400 font-medium italic">Revisión coordinada de procesos académicos</p>
        </div>
      </header>

      {/* Search and Filters Card */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-[#B5305F]/20 focus:border-[#B5305F] transition-all text-sm font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${showAdvanced ? 'bg-[#B5305F] text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            <Filter className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            <span>Filtros Avanzados</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Carrera</label>
                    <select 
                      value={selectedCarrera}
                      onChange={(e) => setSelectedCarrera(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5305F]/20 focus:border-[#B5305F]"
                    >
                      {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Empresa</label>
                    <select 
                      value={selectedEmpresa}
                      onChange={(e) => setSelectedEmpresa(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5305F]/20 focus:border-[#B5305F]"
                    >
                      {empresas.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-bold text-[#B5305F] hover:underline"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab-style State Filters */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <button 
            onClick={() => setFilterMode('inicio')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${filterMode === 'inicio' ? 'bg-[#B5305F] text-white border-[#B5305F] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-[#B5305F]/50'}`}
          >
            Validar Inicio ({students.filter(s => s.estado === 'Pendiente Inicio').length})
          </button>
          <button 
            onClick={() => setFilterMode('termino')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${filterMode === 'termino' ? 'bg-white text-amber-600 border-amber-200' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-500/50'} ${filterMode === 'termino' ? 'ring-2 ring-amber-500/20 bg-amber-50' : ''}`}
          >
            Aprobar Término ({students.filter(s => s.estado === 'Pendiente Finalización').length})
          </button>
          <button 
            onClick={() => setFilterMode('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${filterMode === 'all' ? 'bg-gray-800 text-white border-gray-800 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-800/50'}`}
          >
            Historial Completo
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, i) => (
              <motion.div 
                key={student.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all border-l-4 ${getBorderColor(student.estado)}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{student.nombre}</h3>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${getBadgeColor(student.estado)}`}>
                      {student.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{student.email}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                      <p className="text-xs text-gray-500 italic font-medium">{student.carrera}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                      <p className="text-xs text-gray-500 font-medium">Empresa: <span className="font-bold">{student.empresa}</span></p>
                    </div>
                  </div>
                </div>

                {/* Actions strictly for pending items */}
                {(student.estado === 'Pendiente Inicio' || student.estado === 'Pendiente Finalización') && (
                  <div className="flex items-center gap-3 shrink-0">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-3 text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors group flex items-center gap-2"
                      onClick={() => onUpdateStatus(
                        student.id, 
                        student.estado === 'Pendiente Inicio' ? 'inicio' : 'termino', 
                        'reject'
                      )}
                    >
                      <X className="w-5 h-5" />
                      <span className="text-sm font-bold">Rechazar</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-3 bg-[#B5305F] text-white rounded-xl shadow-lg border-2 border-transparent hover:bg-[#902048] transition-all flex items-center gap-2"
                      onClick={() => onUpdateStatus(
                        student.id, 
                        student.estado === 'Pendiente Inicio' ? 'inicio' : 'termino', 
                        'approve'
                      )}
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-bold">Aprobar</span>
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
            >
              <div className="max-w-xs mx-auto">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">No hay solicitudes en esta sección</h3>
                <p className="text-sm text-gray-400">Todo está al día por ahora.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
