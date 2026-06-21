import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCircle2, XCircle, Send, FileText, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/useAuth';

// Etiquetas e iconos por tipo de evento según contrato del backend
const EVENT_META = {
  internship_approved: { label: 'Solicitud de práctica aprobada', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  internship_rejected: { label: 'Solicitud de práctica rechazada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  internship_derived: { label: 'Expediente DIRAE derivado', icon: Send, color: 'text-[#d22864]', bg: 'bg-[#fff0f6]' },
  requirement_status_changed: { label: 'Cambio en requisito', icon: FileText, color: 'text-[#d22864]', bg: 'bg-[#fff0f6]' },
  custom: { label: 'Notificación', icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const NotificationBell = () => {
  const { isAuthenticated, token } = useAuth();
  const notificationsEnabled = isAuthenticated && Boolean(token);
  const { notifications, loading, error, unreadCount, markAllAsRead, markAsRead, refresh } = useNotifications(10, notificationsEnabled);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Cierra el panel al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      refresh();
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        className="relative p-1 text-[#d22864] hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
        aria-label="Notificaciones"
      >
        <Bell size={24} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-[360px] bg-white rounded-[20px] shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-[#d22864] text-base">Notificaciones</h3>
                <p className="text-xs font-semibold text-gray-400">
                  {unreadCount === 0 ? 'Sin pendientes de lectura' : `${unreadCount} sin leer`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Marcar todas como leídas"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={refresh}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
                  aria-label="Actualizar notificaciones"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            <div className="max-h-[340px] overflow-y-auto">
              {loading && notifications.length === 0 && (
                <p className="px-5 py-8 text-center text-gray-500 text-sm">Cargando notificaciones...</p>
              )}

              {error && !loading && (
                <div className="px-5 py-8 text-center">
                  <p className="text-gray-500 text-sm mb-3">No se pudieron cargar las notificaciones.</p>
                  <button
                    onClick={refresh}
                    className="text-[#d22864] font-semibold text-sm hover:underline cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!loading && !error && notifications.length === 0 && (
                <p className="px-5 py-8 text-center text-gray-500 text-sm">
                  No tienes notificaciones por ahora.
                </p>
              )}

              {!error && notifications.map((notification) => {
                const meta = EVENT_META[notification.event_type] ?? EVENT_META.custom;
                const Icon = meta.icon;

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors ${notification.is_read ? 'bg-white' : 'bg-[#fff8fb]'}`}
                  >
                    <div className={`w-9 h-9 shrink-0 ${meta.bg} rounded-full flex items-center justify-center`}>
                      <Icon className={meta.color} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{meta.label}</p>
                      <p className="text-sm text-gray-800 font-semibold truncate">{notification.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(notification.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {notification.status === 'failed' && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Fallida
                        </span>
                      )}
                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="text-[10px] font-bold text-[#d22864] hover:underline"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
