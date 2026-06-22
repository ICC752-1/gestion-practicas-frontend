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

  // LÓGICA RESPONSIVA MEJORADA: Botones normales en xl, compactos en lg (para evitar que pisen el título)
  const getNavLinkClass = (isActive) => [
    "inline-flex items-center justify-center gap-1.5 rounded-lg border-2 font-bold transition-colors flex-shrink-0 text-center whitespace-nowrap",
    "px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-[11px] xl:px-3 xl:py-1.5 xl:text-sm",
    isActive
      ? "border-[#d22864] bg-[#d22864] text-white shadow-sm"
      : "border-transparent text-[#d22864] hover:border-[#d22864] hover:bg-[#d22864]/5",
  ].join(" ");

  return (
    <header
      className="sticky top-0 z-50 flex min-h-[72px] w-full items-center justify-between border-b-[3px] border-[#d22864] bg-white shadow-sm overflow-hidden"
      style={{ padding: '0.5rem clamp(0.5rem, 2vw, 2.5rem)', gap: '0.5rem' }}
    >
      {/* Forzamos una distribución equilibrada donde el título de la izquierda tiene prioridad para crecer */}
      <div className="flex lg:grid lg:grid-cols-[auto_1fr_auto] xl:grid-cols-[1fr_auto_1fr] items-center justify-between w-full gap-2 xl:gap-4">
        
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
          <div className="bg-[#d22864] rounded-xl shadow-sm flex-shrink-0 p-1.5" style={{ padding: 'clamp(4px, 0.6vw, 8px)' }}>
            <img
              style={{ width: 'clamp(44px, 4.5vw, 60px)', height: 'clamp(44px, 4.5vw, 60px)' }}
              className="object-contain"
              alt="Universidad de La Frontera"
              src={universityLogo}
            />
          </div>
          <div className="flex flex-col leading-tight pr-2">
            <h1 className="font-bold tracking-tight text-[#d22864]"
              style={{ fontSize: 'clamp(0.8rem, 2.2vw, 1.25rem)' }}
            >
              Sistema de Gestión de Prácticas
            </h1>
            <p className="font-semibold text-[#d22864] hidden sm:block mt-0.5"
              style={{ fontSize: 'clamp(0.65rem, 0.9vw, 0.75rem)' }}
            >
              Facultad de Ingeniería y Ciencias
            </p>
          </div>
        </div>

        {/* Center: Nav (Se adapta automáticamente según el tamaño de la ventana) */}
        <nav aria-label="Principal" className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
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

        {/* Right: Actions */}
        <div className="flex items-center flex-shrink-0 justify-end gap-2 xl:gap-4">

          {/* Dashboard link móvil */}
          <Link
            to={dashboardPath}
            aria-current={navItems[0].active ? "page" : undefined}
            className={[
              "inline-flex rounded-lg font-bold transition-colors lg:hidden flex-shrink-0",
              navItems[0].active ? "bg-[#d22864] text-white" : "text-[#d22864] hover:bg-[#d22864] hover:text-white",
            ].join(" ")}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            Dashboard
          </Link>

          <NotificationBell />

          <div className="h-7 w-px bg-gray-200 flex-shrink-0 hidden sm:block"></div>

          {/* Nombre y Rol */}
          <div className="hidden md:flex flex-col items-end leading-none max-w-[120px] xl:max-w-[240px] truncate">
            <span
              className="font-bold text-[#d22864] truncate w-full text-right block"
              style={{ fontSize: 'clamp(0.65rem, 1vw, 0.9rem)' }}
            >{userName}</span>
            <span
              className="text-gray-500 font-semibold uppercase tracking-wider mt-0.5"
              style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}
            >{userRole}</span>
          </div>

          {/* Avatar */}
          <div
            className="rounded-full bg-blue-100 border-2 border-[#d22864] flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ width: 'clamp(32px, 3.5vw, 42px)', height: 'clamp(32px, 3.5vw, 42px)' }}
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
            style={{ padding: '6px' }}
            title="Cerrar Sesión"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </header>
  );
};