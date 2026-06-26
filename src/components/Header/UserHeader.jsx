import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import universityLogo from "../../assets/university_logo.webp";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { NotificationBell } from "../Notifications/NotificationBell";
import { schedulingService } from "../../services/schedulingService";
import {
  getDisplayRoleForRoles,
  getRedirectPathForRoles,
  normalizeRoleNames,
} from "../../services/roleRouting";

const ADMIN_TOGGLE_ROLES = new Set([
  "Encargado de practica",
  "Director de carrera",
]);

const DIRECTOR_ROLE = "Director de carrera";

export const UserHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { showToast } = useToast();

    const userName = user
        ? `${user.first_name} ${user.last_name}`
        : "Usuario";

    const roleNames = normalizeRoleNames(user?.roles);
    const userRole = getDisplayRoleForRoles(roleNames);
    const dashboardPath = getRedirectPathForRoles(roleNames);

    const isAdminToggle = roleNames.some((role) => ADMIN_TOGGLE_ROLES.has(role));
    const isDirector = roleNames.includes(DIRECTOR_ROLE);

    const [configOpen, setConfigOpen] = useState(false);
    const [config, setConfig] = useState({
        general_consultations_enabled: false,
        internship_applications_disabled: false,
    });
    const [configLoading, setConfigLoading] = useState(false);
    const [configSaving, setConfigSaving] = useState(false);
    const configRef = useRef(null);

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
        to: "/requisitos",
        active: location.pathname === "/requisitos",
      },
    ];

    const handleLogout = () => {
        logout();
    };

    const fetchConfig = async () => {
        if (!isAdminToggle) return;
        setConfigLoading(true);
        try {
            const data = await schedulingService.getSchedulingConfig();
            setConfig({
                general_consultations_enabled: Boolean(data?.general_consultations_enabled),
                internship_applications_disabled: Boolean(data?.internship_applications_disabled),
            });
        } catch (e) {
            console.error("Failed to load scheduling config", e);
        } finally {
            setConfigLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [isAdminToggle]);

    useEffect(() => {
        if (!configOpen) return;
        const handleClickOutside = (event) => {
            if (configRef.current && !configRef.current.contains(event.target)) {
                setConfigOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [configOpen]);

    const handleToggleConsultations = async () => {
        const nextVal = !config.general_consultations_enabled;
        setConfigSaving(true);
        try {
            await schedulingService.updateSchedulingConfig({
                general_consultations_enabled: nextVal,
            });
            setConfig((prev) => ({ ...prev, general_consultations_enabled: nextVal }));
            showToast({
                type: 'success',
                title: 'Configuración actualizada',
                message: nextVal
                    ? 'Has habilitado las consultas generales.'
                    : 'Has deshabilitado las consultas generales.',
            });
        } catch (e) {
            showToast({
                type: 'error',
                title: 'No se pudo actualizar',
                message: e?.response?.data?.detail || 'Intenta nuevamente.',
            });
        } finally {
            setConfigSaving(false);
        }
    };

    const handleToggleApplications = async () => {
        const nextVal = !config.internship_applications_disabled;
        setConfigSaving(true);
        try {
            await schedulingService.updateSchedulingConfig({
                internship_applications_disabled: nextVal,
            });
            setConfig((prev) => ({ ...prev, internship_applications_disabled: nextVal }));
            showToast({
                type: 'success',
                title: 'Configuración actualizada',
                message: nextVal
                    ? 'La inscripción de prácticas fue desactivada.'
                    : 'La inscripción de prácticas fue reactivada.',
            });
        } catch (e) {
            showToast({
                type: 'error',
                title: 'No se pudo actualizar',
                message: e?.response?.data?.detail || 'Intenta nuevamente.',
            });
        } finally {
            setConfigSaving(false);
        }
    };

    // Tu getNavLinkClass responsivo: compacto en lg, normal en xl
    const getNavLinkClass = (isActive) => [
      "inline-flex items-center justify-center gap-1.5 rounded-lg border-2 font-bold transition-colors flex-shrink-0 text-center whitespace-nowrap",
      "px-2 py-1 text-xs lg:px-2 lg:py-1 lg:text-[11px] xl:px-3 xl:py-1.5 xl:text-sm",
      isActive
        ? "border-[#d22864] bg-[#d22864] text-white shadow-sm"
        : "border-transparent text-[#d22864] hover:border-[#d22864] hover:bg-[#d22864]/5",
    ].join(" ");

  return (
    <header
        className="sticky top-0 z-50 flex min-h-[72px] w-full items-center justify-between border-b-[3px] border-[#d22864] bg-white shadow-sm"
        style={{ padding: '0.5rem clamp(0.5rem, 2vw, 2.5rem)', gap: '0.5rem' }}
      >
      <div className="flex lg:grid lg:grid-cols-[auto_1fr_auto] xl:grid-cols-[1fr_auto_1fr] items-center justify-between w-full gap-2 xl:gap-4">

        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
          <div className="bg-[#d22864] rounded-xl shadow-sm flex-shrink-0" style={{ padding: 'clamp(4px, 0.6vw, 8px)' }}>
            <img
              style={{ width: 'clamp(44px, 4.5vw, 60px)', height: 'clamp(44px, 4.5vw, 60px)' }}
              className="object-contain"
              alt="Universidad de La Frontera"
              src={universityLogo}
            />
          </div>
          <div className="flex flex-col leading-tight pr-2">
            <h1
              className="font-bold tracking-tight text-[#d22864]"
              style={{ fontSize: 'clamp(0.8rem, 2.2vw, 1.25rem)' }}
            >
              Sistema de Gestión de Prácticas
            </h1>
            <p
              className="font-semibold text-[#d22864] hidden sm:block mt-0.5"
              style={{ fontSize: 'clamp(0.65rem, 0.9vw, 0.75rem)' }}
            >
              Facultad de Ingeniería y Ciencias
            </p>
          </div>
        </div>

        {/* Center: Nav — visible desde lg */}
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
        <div className="flex items-center flex-shrink-0 justify-end gap-2 xl:gap-3">

          {/* Dashboard link móvil (oculto en lg+) */}
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

          {/* Campana — completamente fuera del configRef */}
          <NotificationBell />

          <div className="h-7 w-px bg-gray-200 flex-shrink-0 hidden sm:block" />

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

          {/* Settings popover — configRef solo envuelve este bloque */}
          {isAdminToggle && (
            <div className="relative" ref={configRef}>
              <button
                onClick={() => setConfigOpen((prev) => !prev)}
                className="p-1.5 text-[#d22864] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Configuración de agendamiento"
                title="Configuración de agendamiento"
              >
                <Settings size={20} strokeWidth={2.5} />
              </button>

              {configOpen && (
                <div className="absolute right-0 mt-3 w-[320px] bg-white rounded-[20px] shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#d22864] text-base">Configuración de Agenda</h3>
                    <p className="text-xs font-semibold text-gray-400">
                      {configLoading ? 'Cargando...' : 'Gestiona la disponibilidad de citas y prácticas'}
                    </p>
                  </div>

                  <div className="px-5 py-4 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-800">Consultas Generales</p>
                        <p className="text-xs text-gray-400">Permite que estudiantes agenden consultas contigo</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleConsultations}
                        disabled={configSaving || configLoading}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none disabled:opacity-50 ${
                          config.general_consultations_enabled ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        aria-label="Alternar consultas generales"
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          config.general_consultations_enabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {isDirector && (
                      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-sm font-bold text-gray-800">Inscripción de Prácticas</p>
                          <p className="text-xs text-gray-400">Desactiva temporalmente nuevas inscripciones</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleApplications}
                          disabled={configSaving || configLoading}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none disabled:opacity-50 ${
                            config.internship_applications_disabled ? 'bg-red-500' : 'bg-gray-200'
                          }`}
                          aria-label="Alternar inscripción de prácticas"
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            config.internship_applications_disabled ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold">
                      {isDirector
                        ? 'Como Director puedes gestionar ambos ajustes.'
                        : 'Como Coordinador gestionas tus consultas generales.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Logout */}
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