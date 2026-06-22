import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import Dashboard from '../../components/CoordinatorDashboard/Dashboard';
import { useCoordinatorDashboard } from '../../hooks/useCoordinatorDashboard';
import { useAuth } from '../../context/useAuth';
import { getDisplayRoleForRoles } from '../../services/roleRouting';
import { schedulingService } from '../../services/schedulingService';

export const CoordinatorDashboardPage = () => {
  const [statusFilter, setStatusFilter] = useState('submitted');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, students, loading, error, refreshData } = useCoordinatorDashboard(statusFilter);

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [metaLoading, setMetaLoading] = useState(true);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Encargado";
  const userRole = getDisplayRoleForRoles(user?.roles);

  const fetchSchedulingMeta = async () => {
    try {
      const requests = await schedulingService.getPendingRequests();
      setPendingRequestsCount(requests.length);
    } catch (e) {
      console.error("Failed to load scheduling meta on dashboard", e);
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulingMeta();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl space-y-6">
        
        {/* Pending Requests Quick Widget */}
        {!loading && !metaLoading && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-[#d22864] flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Solicitudes de Agendamiento</h3>
                <p className="text-sm text-gray-400">Revisa y responde las solicitudes pendientes de los estudiantes.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/entrevistas')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-ufro-primary hover:bg-opacity-95 text-white font-bold text-xs transition shadow-md shadow-ufro-primary/10"
            >
              <Clock className="w-4 h-4" />
              <span>Solicitudes pendientes: {pendingRequestsCount}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Loader2 className="w-12 h-12 text-ufro-primary animate-spin" />
            <p className="text-gray-500 font-medium">Cargando información del dashboard...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Error al cargar datos</h3>
            <p className="text-gray-500 text-center max-w-md">{error}</p>
            <button 
              onClick={refreshData}
              className="mt-4 px-6 py-2 bg-ufro-primary text-white rounded-xl hover:bg-opacity-90 transition-all font-medium"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <Dashboard
            stats={stats}
            students={students}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CoordinatorDashboardPage;
