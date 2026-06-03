import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { students, updateStudentStatus } = useCoordinatorDashboard();

  const userName = user ? `${user.first_name} ${user.last_name}` : "Coordinador";
  
  // Forzamos el rol a "Coordinador" para la visualización, independientemente de cómo venga del backend,
  // ya que el usuario solicitó mantener este nombre de rol específicamente.
  const userRole = "Coordinador";

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        {view === 'dashboard' ? (
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
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CoordinatorDashboardPage;
