import React, { useState } from 'react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import Dashboard from '../../components/coordinador/Dashboard';
import Management from '../../components/coordinador/Management';
import { useCoordinatorDashboard } from '../../hooks/useCoordinatorDashboard';

export const CoordinatorDashboardPage = () => {
  const [view, setView] = useState('dashboard');
  const { students, updateStudentStatus } = useCoordinatorDashboard();

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName="Coordinador FICA" userRole="Coordinador" />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        {view === 'dashboard' ? (
          <Dashboard 
            students={students} 
            onNavigateToManagement={() => setView('management')} 
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
