import { LogOut } from 'lucide-react';
import universityLogo from "../../assets/university_logo.webp";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/useAuth";
import { NotificationBell } from "../Notifications/NotificationBell";
import { getDisplayRoleForRoles, getRedirectPathForRoles } from "../../services/roleRouting";

export const UserHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const userName = user
        ? `${user.first_name} ${user.last_name}`
        : "Usuario";

    const userRole = getDisplayRoleForRoles(user?.roles);
    const dashboardPath = getRedirectPathForRoles(user?.roles);

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

    <header
      className="sticky top-0 z-50 flex min-h-[72px] w-full items-center justify-between border-b-[3px] border-[#d22864] bg-white shadow-sm overflow-hidden"
      style={{ padding: '0.5rem clamp(0.5rem, 2vw, 2.5rem)', gap: 'clamp(0.25rem, 1vw, 1rem)'  }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] flex-shrink-0 min-w-0">
        <div className="bg-[#d22864] rounded-xl shadow-sm flex-shrink-0" style={{ padding: 'clamp(4px, 0.8vw, 8px)' }}>
          <img
            style={{ width: 'clamp(48px, 5vw, 64px)', height: 'clamp(48px, 5vw, 64px)' }}
            className="object-contain"
            alt="Universidad de La Frontera"
            src={universityLogo}
          />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="font-bold tracking-tight text-[#d22864] truncate"
            style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1.25rem)' }}
          >
            Sistema de Gestión de Prácticas
          </h1>
          <p className="font-semibold text-[#d22864] truncate hidden sm:block"
            style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}
          >
            Facultad de Ingeniería y Ciencias
          </p>
        </div>
      </div>

      {/* Center: Nav - solo desktop */}
      <nav aria-label="Principal" className="hidden lg:flex items-center flex-shrink-0"
        style={{ gap: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            aria-current={item.active ? "page" : undefined}
            className={getNavLinkClass(item.active)}
            style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)', padding: 'clamp(4px, 0.5vw, 6px) clamp(8px, 1vw, 12px)' }}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 'clamp(0.4rem, 1.5vw, 1.5rem)' }}>

        {/* Dashboard link solo cuando nav está oculto */}
        <Link
          to={dashboardPath}
          aria-current={navItems[0].active ? "page" : undefined}
          className={[
            "inline-flex rounded-lg font-bold transition-colors lg:hidden flex-shrink-0",
            navItems[0].active ? "bg-[#d22864] text-white" : "text-[#d22864] hover:bg-[#d22864] hover:text-white",
          ].join(" ")}
          style={{ padding: 'clamp(4px, 0.8vw, 8px) clamp(6px, 1.5vw, 12px)', fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)' }}
        >
          Dashboard
        </Link>

        <NotificationBell />

        <div className="h-8 w-px bg-gray-300 flex-shrink-0 hidden sm:block"></div>

        {/* Nombre - oculto en pantallas pequeñas */}
        <div className="hidden md:flex flex-col items-end leading-none min-w-0"
          style={{ maxWidth: 'clamp(100px, 14vw, 220px)' }}
        >
          <span
            className="font-bold text-[#d22864] truncate w-full text-right block"
            style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)' }}
          >{userName}</span>
          <span
            className="text-gray-500 font-semibold uppercase tracking-wider"
            style={{ fontSize: 'clamp(0.55rem, 0.8vw, 0.625rem)' }}
          >{userRole}</span>
        </div>

        {/* Avatar */}
        <div
          className="rounded-full bg-blue-100 border-2 border-[#d22864] flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ width: 'clamp(32px, 4vw, 44px)', height: 'clamp(32px, 4vw, 44px)' }}
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
            alt={userName}
            className="w-full h-full"
          />
        </div>

        <button
          onClick={handleLogout}
          className="text-[#d22864] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all flex-shrink-0"
          style={{ padding: 'clamp(4px, 0.5vw, 8px)' }}
          title="Cerrar Sesión"
        >
          <LogOut size={20} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
};
