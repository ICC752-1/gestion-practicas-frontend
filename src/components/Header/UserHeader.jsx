import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, LogOut, Trash2 } from 'lucide-react';
import universityLogo from '../../assets/university_logo.webp';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useNotifications } from '../../context/useNotifications';

const formatNotificationDate = (date) => new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
}).format(new Date(date));

export const UserHeader = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, source } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const notificationPanelRef = useRef(null);

  const userName = user ? `${user.first_name} ${user.last_name}` : 'Usuario';
  const userRole = user?.roles?.[0] || '';

  useEffect(() => {
    const closePanelOnOutsideClick = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', closePanelOnOutsideClick);
    return () => document.removeEventListener('mousedown', closePanelOnOutsideClick);
  }, []);

  return (
    <header className="flex w-full items-center justify-between px-10 h-20 bg-white border-b-[3px] border-[#d22864] z-50 shadow-sm sticky top-0">
      <div className="flex items-center gap-4">
        <div className="bg-[#d22864] p-1.5 rounded-xl shadow-sm">
          <img className="w-12 h-12 object-contain" alt="Universidad de La Frontera" src={universityLogo} />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <h1 className="font-bold text-[#d22864] text-xl tracking-tight">Sistema de Gestión de Prácticas</h1>
          <p className="font-semibold text-[#d22864] text-xs">Facultad de Ingeniería y Ciencias</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <Link to="/faq" className="font-bold text-[#d22864] hover:opacity-80 transition-opacity">Preguntas Frecuentes</Link>
        <Link to="#" className="font-bold text-[#d22864] hover:opacity-80 transition-opacity">Requisitos</Link>
      </nav>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationPanelRef}>
          <button
            type="button"
            onClick={() => setIsPanelOpen((current) => !current)}
            className="relative p-2 text-[#d22864] hover:bg-gray-50 rounded-full transition-colors"
            aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`}
            aria-expanded={isPanelOpen}
          >
            <Bell size={24} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 border-2 border-white rounded-full text-[10px] leading-4 text-white font-bold text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isPanelOpen && (
            <div className="absolute right-0 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-gray-900">Notificaciones</h2>
                  <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
                </div>
                {source === 'simulated' && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">Modo simulado</span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-500">No tienes notificaciones.</div>
                ) : notifications.map((notification) => (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => markAsRead(notification.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        markAsRead(notification.id);
                      }
                    }}
                    className={`group flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#d22864]/30 ${notification.readAt ? 'bg-white' : 'bg-[#fff6f9]'}`}
                  >
                    <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.readAt ? 'bg-gray-100 text-gray-400' : 'bg-[#d22864]/10 text-[#d22864]'}`}>
                      <CheckCircle2 size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-gray-900">{notification.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-600">{notification.message}</span>
                      <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {!notification.readAt && <span className="h-2 w-2 rounded-full bg-[#d22864]" aria-label="Sin leer" />}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        className="rounded-full p-1.5 text-gray-400 opacity-100 transition-all hover:bg-red-50 hover:text-red-600 md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
                        aria-label={`Eliminar notificación: ${notification.title}`}
                        title="Eliminar notificación"
                      >
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end leading-none">
            <span className="font-bold text-[#d22864] text-base">{userName}</span>
            <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{userRole}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-100 border-2 border-[#d22864] flex items-center justify-center overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} className="w-full h-full" />
          </div>
        </div>

        <button onClick={logout} className="p-2 text-[#d22864] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" title="Cerrar Sesión">
          <LogOut size={22} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
};
