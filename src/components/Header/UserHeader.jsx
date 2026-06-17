import { LogOut } from 'lucide-react';
import universityLogo from "../../assets/university_logo.webp";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/useAuth";
import { NotificationBell } from "../Notifications/NotificationBell";
import { getRedirectPathForRoles } from "../../services/roleRouting";

export const UserHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const userName = user
        ? `${user.first_name} ${user.last_name}`
        : "Usuario";

    const userRole = user?.roles?.[0] || "";
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
    <header style={{ minHeight: '4rem' }} className="sticky top-0 z-50 flex w-full items-center justify-between border-b-[3px] border-[#d22864] bg-white shadow-sm overflow-hidden"
      style={{ padding: '0.5rem clamp(0.75rem, 3vw, 2.5rem)' }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] flex-shrink-0 min-w-0">
        <div className="bg-[#d22864] rounded-xl shadow-sm flex-shrink-0" style={{ padding: 'clamp(4px, 0.8vw, 8px)' }}>
          <img
            style={{ width: 'clamp(28px, 4vw, 48px)', height: 'clamp(28px, 4vw, 48px)' }}
            className="object-contain"
            alt="Universidad de La Frontera"
            src={universityLogo}
          />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="font-bold tracking-tight text-[#d22864] truncate"
            style={{ fontSize: 'clamp(0.7rem, 2.5vw, 1.25rem)' }}
          >
            Sistema de Gestión de Prácticas
          </h1>
          <p className="font-semibold text-[#d22864] truncate"
            style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}
          >
            Facultad de Ingeniería y Ciencias
          </p>
        </div>
      </div>

      {/* Center: Nav */}
      <nav aria-label="Principal" className="hidden items-center gap-3 md:flex flex-shrink-0">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            aria-current={item.active ? "page" : undefined}
            className={getNavLinkClass(item.active)}
            style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)' }}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 'clamp(0.4rem, 1.5vw, 1.5rem)' }}>
        <Link
          to={dashboardPath}
          aria-current={navItems[0].active ? "page" : undefined}
          className={[
            "inline-flex rounded-lg font-bold transition-colors md:hidden",
            navItems[0].active ? "bg-[#d22864] text-white" : "text-[#d22864] hover:bg-[#d22864] hover:text-white",
          ].join(" ")}
          style={{ padding: 'clamp(4px, 0.8vw, 8px) clamp(6px, 1vw, 12px)', fontSize: 'clamp(0.65rem, 1vw, 0.75rem)' }}
        >
          Dashboard
        </Link>

        <NotificationBell />

        <div className="h-8 w-px bg-gray-300 flex-shrink-0"></div>

        <div className="flex flex-col items-end leading-none min-w-0" style={{ maxWidth: 'clamp(80px, 15vw, 220px)' }}>
          <span className="font-bold text-[#d22864] truncate w-full text-right"
            style={{ fontSize: 'clamp(0.65rem, 1.3vw, 0.9rem)' }}
          >{userName}</span>
          <span className="text-gray-500 font-semibold uppercase tracking-wider"
            style={{ fontSize: 'clamp(0.55rem, 0.8vw, 0.625rem)' }}
          >{userRole}</span>
        </div>

        <div className="rounded-full bg-blue-100 border-2 border-[#d22864] flex items-center justify-center overflow-hidden flex-shrink-0"
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