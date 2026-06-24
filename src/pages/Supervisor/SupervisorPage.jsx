import { useCallback, useEffect, useState } from "react";
import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import { supervisorEvaluationService } from "../../services/supervisorEvaluationService";

const StatCard = ({ title, count }) => (
  <div className="bg-white rounded-2xl p-6 border-l-4 border-brand-medium shadow-sm hover:shadow-md transition-shadow">
    <h4 className="text-gray-500 text-sm font-medium mb-2">{title}</h4>
    <p className="text-brand-medium text-4xl font-bold">{count}</p>
  </div>
);

const StudentCard = ({ name, orgName, career, status, dates }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-light transition-colors group shadow-sm hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-lg text-gray-800 group-hover:text-brand-medium transition-colors">{name}</h4>
        <p className="text-sm text-gray-500">{orgName}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        status === 'completed'
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }`}>
        {status === 'completed' ? 'Evaluada' : 'Pendiente'}
      </span>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-600 font-medium">{career}</p>
      <p className="mt-1 text-xs text-gray-400 font-semibold">{dates}</p>
    </div>
  </div>
);

export const SupervisorPage = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Supervisor';
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await supervisorEvaluationService.getMyAssignments();
      setAssignments(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar las prácticas asignadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAssignments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAssignments]);

  const completedCount = assignments.filter((assignment) => assignment.evaluation_submitted).length;
  const pendingCount = assignments.length - completedCount;

  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      <UserHeader userName={userName} userRole="Supervisor" />

      <main className="max-w-5xl mx-auto w-full px-4 py-12 space-y-12 flex-grow">
        {/* Title Section */}
        <section>
          <h2 className="text-brand-medium font-bold text-3xl mb-1">Panel Supervisor</h2>
          <p className="text-brand-light text-xl font-medium tracking-tight">Bienvenido/a, {userName}</p>
        </section>

        {/* Important Info Section */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
          <h3 className="text-brand-medium font-bold text-2xl text-center mb-8">Información importante</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard title="Estudiantes asignados" count={assignments.length} />
            <StatCard title="En proceso" count={pendingCount} />
            <StatCard title="Evaluaciones pendientes" count={pendingCount} />
            <StatCard title="Completadas" count={completedCount} />
          </div>
          <div className="mt-6 rounded-2xl border border-brand-light/20 bg-brand-light/5 px-5 py-4 text-sm text-gray-600">
            <p className="font-bold text-brand-medium">Evaluación solo por enlace seguro</p>
            <p className="mt-1">
              Este panel es informativo. Para completar una evaluación, use el enlace de un solo uso enviado al correo registrado por la coordinación.
            </p>
          </div>
        </section>

        {/* Assigned Students Grid */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
          <h3 className="text-brand-medium font-bold text-2xl text-center mb-10">Estudiantes asignados</h3>
          {loading && (
            <p className="text-center text-gray-500 font-semibold">Cargando prácticas asignadas...</p>
          )}
          {error && !loading && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          {!loading && !error && assignments.length === 0 && (
            <p className="text-center text-gray-500 font-semibold">
              No hay prácticas asociadas a su correo de supervisor.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!loading && !error && assignments.map((assignment) => (
              <StudentCard
                key={assignment.internship_id}
                name={assignment.student_name}
                orgName={assignment.org_name}
                career={assignment.internship_type}
                status={assignment.evaluation_submitted ? 'completed' : 'pending'}
                dates={`${assignment.start_date} al ${assignment.end_date}`}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SupervisorPage;
