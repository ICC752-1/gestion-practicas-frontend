import { LogOut } from 'lucide-react';
import universityLogo from "../../assets/university_logo.webp";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/useAuth";
import { NotificationBell } from "../Notifications/NotificationBell";
import {
  getDisplayRoleForRoles,
  getRedirectPathForRoles,
  normalizeRoleNames,
} from "../../services/roleRouting";

export const UserHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const userName = user
        ? `${user.first_name} ${user.last_name}`
        : "Usuario";

    const roleNames = normalizeRoleNames(user?.roles);
    const userRole = getDisplayRoleForRoles(roleNames);
    const dashboardPath = getRedirectPathForRoles(roleNames);

    const navItems = [
      {
        label: "Dashboard",
        to: dashboardPath,
        active: location.pathname === dashboardPath
          || location.pathname.startsWith(`${dashboardPath}/`),
      },
      {
        label: "Preguntas Frecuentes",
        to: "/faq",
        active: location.pathname === "/faq",
      },
      {
        label: "Carta de Presentación",
        to: "/cartas-presentacion",
        active: location.pathname === "/cartas-presentacion",
      },
      {
        label: "Requisitos",
        to: "#",
        active: false,
      },
    ];

    const handleLogout = () => {
        logout();
    };

    const getNavLinkClass = (isActive) => [
      "inline-flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition-colors",
      isActive
        ? "border-[#d22864] bg-[#d22864] text-white"
        : "border-transparent text-[#d22864] hover:border-[#d22864] hover:bg-[#d22864] hover:text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 flex min-h-16 w-full items-center justify-between gap-3 border-b-[3px] border-[#d22864] bg-white px-3 py-2 shadow-sm sm:min-h-20 sm:px-6 lg:px-10">
      {/* Left Section: Logo and Title */}
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:gap-4">
        <div className="flex-shrink-0 bg-[#d22864] p-1.5 rounded-xl shadow-sm">
          <img
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            alt="Universidad de La Frontera"
            src={universityLogo}
          />
        </div>
        <div className="flex min-w-0 flex-col items-start leading-tight">
          <h1 className="text-sm font-bold leading-tight tracking-tight text-[#d22864] sm:text-xl">
            Sistema de Gestión de Prácticas
          </h1>
          <p className="hidden font-semibold text-[#d22864] text-xs sm:block">
            Facultad de Ingeniería y Ciencias
          </p>
        </div>
      </div>

      {/* Center Section: Navigation */}
      <nav aria-label="Principal" className="hidden items-center gap-3 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            aria-current={item.active ? "page" : undefined}
            className={getNavLinkClass(item.active)}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right Section: User Profile & Actions */}
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
        <Link
          to={dashboardPath}
          aria-label="Volver al dashboard"
          title="Volver al dashboard"
          aria-current={navItems[0].active ? "page" : undefined}
          className={[
            "inline-flex rounded-lg px-2 py-1.5 text-xs font-bold transition-colors md:hidden sm:px-3 sm:py-2",
            navItems[0].active
              ? "bg-[#d22864] text-white"
              : "text-[#d22864] hover:bg-[#d22864] hover:text-white",
          ].join(" ")}
        >
          Dashboard
        </Link>

        <NotificationBell />

        <div className="hidden h-8 w-px bg-gray-300 sm:block"></div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden flex-col items-end leading-none sm:flex">
            <span className="font-bold text-[#d22864] text-base">{userName}</span>
            <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{userRole}</span>
          </div>
          
          <div className="relative">

              <div className="h-9 w-9 rounded-full bg-blue-100 border-2 border-[#d22864] flex items-center justify-center overflow-hidden sm:h-11 sm:w-11">
                  <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                          alt={userName}
                          className="w-full h-full"
                  />
              </div>
          </div>
        </div>

        <button onClick={handleLogout} className="p-1.5 text-[#d22864] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all sm:p-2" title="Cerrar Sesión">
          <LogOut size={22} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
};
