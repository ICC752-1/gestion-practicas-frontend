import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, Calendar, FileText, Mail, PlayCircle, UserPlus } from 'lucide-react';

import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import Dashboard from '../../components/CoordinatorDashboard/Dashboard';
import { useCoordinatorDashboard } from '../../hooks/useCoordinatorDashboard';
import { useAuth } from '../../context/useAuth';
import { getAdminBasePathForRoles, getDisplayRoleForRoles } from '../../services/roleRouting';
import { schedulingService } from '../../services/schedulingService';
import { InterviewSchedulingPage } from '../InterviewScheduling/InterviewSchedulingPage';
import { PresentationLettersPanel } from '../PresentationLetters/PresentationLettersPage';
import { InductionAdminPanel } from '../Induction/InductionAdminPage';
import { StudentAccountsPanel } from '../StudentAccounts/StudentAccountsPage';

const buildTabs = (basePath, pendingRequestsCount) => [
  {
    id: 'requests',
    label: 'Solicitudes',
    to: basePath,
    icon: FileText,
    badge: null,
    match: (pathname) => pathname === basePath,
  },
  {
    id: 'agenda',
    label: 'Agenda y consultas',
    to: `${basePath}/agenda`,
    icon: Calendar,
    badge: pendingRequestsCount,
    match: (pathname) => pathname === `${basePath}/agenda`,
  },
  {
    id: 'letters',
    label: 'Cartas de presentación',
    to: `${basePath}/cartas-presentacion`,
    icon: Mail,
    badge: null,
    match: (pathname) => pathname === `${basePath}/cartas-presentacion`,
  },
  {
    id: 'induction',
    label: 'Inducción',
    to: `${basePath}/induccion`,
    icon: PlayCircle,
    badge: null,
    match: (pathname) => pathname === `${basePath}/induccion`,
  },
  {
    id: 'students',
    label: 'Vinculación de estudiantes',
    to: `${basePath}/estudiantes`,
    icon: UserPlus,
    badge: null,
    match: (pathname) => pathname === `${basePath}/estudiantes`,
  },
];

const getTabEntryMotion = () => ({
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.12 },
});

export const CoordinatorDashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { stats, students, loading, error, refreshData } = useCoordinatorDashboard();

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Encargado";
  const userRole = getDisplayRoleForRoles(user?.roles);
  const basePath = getAdminBasePathForRoles(user?.roles);
  const tabs = buildTabs(basePath, pendingRequestsCount);
  const activeTab = tabs.find((tab) => tab.match(location.pathname))?.id || 'requests';

  const fetchSchedulingMeta = async () => {
    try {
      const requests = await schedulingService.getPendingRequests();
      setPendingRequestsCount(requests.length);
    } catch (e) {
      console.error("Failed to load scheduling meta on dashboard", e);
    }
  };

  useEffect(() => {
    fetchSchedulingMeta();
  }, []);

  const renderActivePanel = () => {
    if (activeTab === 'agenda') {
      return <InterviewSchedulingPage embedded />;
    }

    if (activeTab === 'letters') {
      return <PresentationLettersPanel />;
    }

    if (activeTab === 'induction') {
      return <InductionAdminPanel />;
    }

    if (activeTab === 'students') {
      return <StudentAccountsPanel />;
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader2 className="w-12 h-12 text-ufro-primary animate-spin" />
          <p className="text-gray-500 font-medium">Cargando información del dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
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
      );
    }

    return (
      <Dashboard
        stats={stats}
        students={students}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <nav
          aria-label="Panel administrativo de prácticas"
          className="flex flex-wrap justify-center gap-2 rounded-3xl border border-gray-100 bg-white p-2 shadow-sm"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.match(location.pathname);

            return (
              <Link
                key={tab.id}
                to={tab.to}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors',
                  isActive
                    ? 'bg-[#d22864] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#d22864]',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={[
                    'ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-black',
                    isActive ? 'bg-white text-[#d22864]' : 'bg-red-500 text-white',
                  ].join(' ')}>
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            {...getTabEntryMotion()}
          >
            {renderActivePanel()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default CoordinatorDashboardPage;
