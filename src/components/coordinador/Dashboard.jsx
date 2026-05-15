import { Search, Users, Clock, AlertCircle, CheckCircle, ClipboardCheck, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ students, onNavigateToManagement, onNavigateToScheduling }) {
  const stats = [
    { label: 'Total', value: students.length, icon: Users, color: 'text-[#B5305F]' },
    { label: 'En curso', value: students.filter(s => s.estado === 'En curso').length, icon: Clock, color: 'text-red-500' },
    { label: 'Pendientes', value: students.filter(s => s.estado === 'Pendiente Inicio' || s.estado === 'Pendiente Finalización').length, icon: AlertCircle, color: 'text-[#B5305F]' },
    { label: 'Finalizadas', value: students.filter(s => s.estado === 'Finalizada').length, icon: CheckCircle, color: 'text-red-500' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente Inicio': return 'bg-[#B5305F]';
      case 'Pendiente Finalización': return 'bg-amber-500';
      case 'En curso': return 'bg-[#B5305F]'; 
      case 'Finalizada': return 'bg-emerald-500';
      case 'Inicio Rechazado': return 'bg-red-500';
      case 'Finalización Rechazada': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-10 lg:px-12 py-8">
      <header>
        <h2 className="text-3xl font-bold text-[#B5305F] mb-1">Panel Coordinador</h2>
        <p className="text-xl text-gray-400 font-medium italic">Bienvenido/a, Carlos Rivera</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-800 tracking-tight">{stat.value}</p>
            </div>
            <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
          </motion.div>
        ))}
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToManagement}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <ClipboardCheck className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Gestión de Prácticas</h3>
            <p className="text-sm text-gray-400">Aprobar o rechazar solicitudes</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToScheduling}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <Calendar className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Configurar Horarios</h3>
            <p className="text-sm text-gray-400">Gestionar horario disponibles para entrevistas</p>
          </div>
        </motion.button>
      </div>

      {/* Students Table */}
      <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-2xl font-bold text-[#B5305F]">Lista de Estudiantes</h3>
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar estudiante..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-[#B5305F]/20 focus:border-[#B5305F] transition-all text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-y border-gray-100">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-800">Estudiante</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-800">Carrera</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-800">Empresa</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-800">Estado</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-800">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-800">{student.nombre}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-600 italic">{student.carrera}</td>
                  <td className="px-8 py-5 text-sm text-gray-600">{student.empresa}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-white text-xs font-semibold ${getStatusColor(student.estado)}`}>
                      {student.estado}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-[#B5305F] hover:underline text-sm font-bold transition-all">
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
