import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { useAuth } from '../../context/useAuth';
import { getDisplayRoleForRoles } from '../../services/roleRouting';

export const SuperadminUsersPage = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Superadmin';
  const userRole = getDisplayRoleForRoles(user?.roles);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserHeader userName={userName} userRole={userRole} />
      <main className="flex-grow container mx-auto max-w-4xl px-4 py-12">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-[#d22864]">Superadmin</p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">Administración de usuarios</h1>
          <p className="mt-4 text-gray-600">
            Esta ruta queda reservada para administración técnica de cuentas y roles.
            Superadmin no obtiene permisos académicos implícitos.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SuperadminUsersPage;
