import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import Dashboard from '../../components/CoordinatorDashboard/Dashboard';
import Management from '../../components/CoordinatorDashboard/Management';
import { useCoordinatorDashboard } from '../../hooks/useCoordinatorDashboard';

import { useAuth } from '../../context/useAuth';

export const CoordinatorDashboardPage = () => {
  const [view, setView] = useState('dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, loading, error, updateStudentStatus, refreshData } = useCoordinatorDashboard();

  const userName = user ? `${user.first_name} ${user.last_name}` : "Coordinador";
  
  // Forzamos el rol a "Coordinador" para la visualización, independientemente de cómo venga del backend,
  // ya que el usuario solicitó mantener este nombre de rol específicamente.
  const userRole = "Coordinador";

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
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
          view === 'dashboard' ? (
            <Dashboard 
              students={students} 
              onNavigateToManagement={() => setView('management')} 
              onNavigateToScheduling={() => navigate('/entrevistas')}
            />
          ) : (
            <Management 
              students={students} 
              onUpdateStatus={updateStudentStatus} 
              onBack={() => setView('dashboard')} 
            />
          )
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CoordinatorDashboardPage;
