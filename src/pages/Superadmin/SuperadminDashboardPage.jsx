import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, UsersRound } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/useAuth';
import { getDisplayRoleForRoles } from '../../services/roleRouting';
import { SuperadminAuditPanel } from './SuperadminAuditPanel';
import { SuperadminUsersPanel } from './SuperadminUsersPage';

const tabs = [
  {
    label: 'Usuarios',
    to: '/superadmin/usuarios',
    icon: UsersRound,
    match: (pathname) => pathname === '/superadmin/usuarios',
  },
  {
    label: 'Auditoría',
    to: '/superadmin/auditoria',
    icon: ShieldCheck,
    match: (pathname) => pathname === '/superadmin/auditoria',
  },
];

const getTabEntryMotion = () => ({
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.12 },
});

export const SuperadminDashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Superadmin';
  const userRole = getDisplayRoleForRoles(user?.roles);
  const activeTab = location.pathname === '/superadmin/auditoria'
    ? 'audit'
    : 'users';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader userName={userName} userRole={userRole} />

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
        <nav
          aria-label="Panel Superadmin"
          className="mb-6 flex flex-wrap justify-center gap-2 rounded-3xl border border-gray-100 bg-white p-2 shadow-sm"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.match(location.pathname);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-colors',
                  isActive
                    ? 'bg-[#d22864] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#d22864]',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            {...getTabEntryMotion()}
          >
            {activeTab === 'audit' ? <SuperadminAuditPanel /> : <SuperadminUsersPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default SuperadminDashboardPage;
