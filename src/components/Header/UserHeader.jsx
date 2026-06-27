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

    if (isAdminToggle) {
      navItems.splice(1, 0, {
        label: "Administrar inducción",
        to: "/induccion/admin",
        active: location.pathname === "/induccion/admin",
      });
    }

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

    // Cierra el popover al hacer click fuera
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

          {/* Settings popover for admin roles (Encargado / Director) */}
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
                    {/* Consultas Generales toggle */}
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
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            config.general_consultations_enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Inscripción de Prácticas toggle (sólo Director) */}
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
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              config.internship_applications_disabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
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
