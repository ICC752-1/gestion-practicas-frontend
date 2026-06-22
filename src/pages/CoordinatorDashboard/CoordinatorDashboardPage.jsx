import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Settings, Clock, ArrowRight } from 'lucide-react';
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

  const [generalConfig, setGeneralConfig] = useState({ general_consultations_enabled: false });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [metaLoading, setMetaLoading] = useState(true);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Encargado";
  const userRole = getDisplayRoleForRoles(user?.roles);

  const fetchSchedulingMeta = async () => {
    try {
      const config = await schedulingService.getSchedulingConfig();
      setGeneralConfig(config);
      
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

  const handleToggleConsultations = async () => {
    const nextVal = !generalConfig.general_consultations_enabled;
    try {
      await schedulingService.updateSchedulingConfig({ general_consultations_enabled: nextVal });
      setGeneralConfig(prev => ({ ...prev, general_consultations_enabled: nextVal }));
    } catch (e) {
      console.error("Failed to toggle consultations", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl space-y-6">
        
        {/* Scheduling Quick Widget */}
        {!loading && !metaLoading && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-[#d22864] flex-shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Configuración de Consultas Generales</h3>
                <p className="text-sm text-gray-400">Activa o desactiva la posibilidad de que estudiantes agenden consultas presenciales individuales contigo.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">
                  {generalConfig.general_consultations_enabled ? 'Habilitadas' : 'Deshabilitadas'}
                </span>
                <button
                  type="button"
                  onClick={handleToggleConsultations}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    generalConfig.general_consultations_enabled ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      generalConfig.general_consultations_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Pending Requests Badge */}
              <button
                onClick={() => navigate('/entrevistas')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-ufro-primary hover:bg-opacity-95 text-white font-bold text-xs transition shadow-md shadow-ufro-primary/10"
              >
                <Clock className="w-4 h-4" />
                <span>Solicitudes pendientes: {pendingRequestsCount}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
