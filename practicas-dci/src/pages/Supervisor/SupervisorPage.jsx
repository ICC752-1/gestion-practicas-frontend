import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "motion/react";

const StatCard = ({ title, count }) => (
  <div className="bg-white rounded-2xl p-6 border-l-4 border-brand-medium shadow-sm hover:shadow-md transition-shadow">
    <h4 className="text-gray-500 text-sm font-medium mb-2">{title}</h4>
    <p className="text-brand-medium text-4xl font-bold">{count}</p>
  </div>
);

const StudentCard = ({ name, email, career, status }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-light transition-colors group cursor-pointer shadow-sm hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-lg text-gray-800 group-hover:text-brand-medium transition-colors">{name}</h4>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        status === 'available' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {status === 'available' ? 'Disponible' : 'Completada'}
      </span>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-600 font-medium">{career}</p>
    </div>
    <div className="mt-4 flex justify-end">
      <button className="text-sm font-bold text-brand-medium hover:text-brand-light transition-colors">
        Ver detalles →
      </button>
    </div>
  </div>
);

export const SupervisorPage = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      <UserHeader userName="Roberto S." userRole="Supervisor" />

      <main className="max-w-5xl mx-auto w-full px-4 py-12 space-y-12 flex-grow">
        {/* Title Section */}
        <section>
          <h2 className="text-brand-medium font-bold text-3xl mb-1">Panel Supervisor</h2>
          <p className="text-brand-light text-xl font-medium tracking-tight">Bienvenido/a, Roberto Sáez</p>
        </section>

        {/* Important Info Section */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
          <h3 className="text-brand-medium font-bold text-2xl text-center mb-8">Información importante</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard title="Estudiantes asignados" count="2" />
            <StatCard title="En proceso" count="1" />
            <StatCard title="Evaluaciones disponibles" count="1" />
            <StatCard title="Completadas" count="1" />
          </div>
        </section>

        {/* Assigned Students Grid */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
          <h3 className="text-brand-medium font-bold text-2xl text-center mb-10">Estudiantes asignados</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentCard 
              name="Maria Gómez" 
              email="m.gomez12@ufromail.cl" 
              career="Ingeniería Civil Informática" 
              status="available"
            />
            <StudentCard 
              name="Luis Espinoza" 
              email="l.espinoza22@ufromail.cl" 
              career="Ingeniería Informática" 
              status="completed"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SupervisorPage;
