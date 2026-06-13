import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

import { ToastContext } from "./toast-context";

const TOAST_DURATION_MS = 5000;

// Estilos por variante siguiendo la paleta de marca del sistema
const VARIANTS = {
    success: {
        icon: CheckCircle2,
        iconColor: "text-green-600",
        iconBg: "bg-green-50",
        bar: "bg-green-600",
    },
    error: {
        icon: XCircle,
        iconColor: "text-red-600",
        iconBg: "bg-red-50",
        bar: "bg-red-600",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-[#d22864]",
        iconBg: "bg-[#fff0f6]",
        bar: "bg-[#d22864]",
    },
    info: {
        icon: Info,
        iconColor: "text-[#d22864]",
        iconBg: "bg-[#fff0f6]",
        bar: "bg-[#d22864]",
    },
};

const ToastCard = ({ toast, onDismiss }) => {
    const variant = VARIANTS[toast.type] ?? VARIANTS.info;
    const Icon = variant.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex items-start gap-3 w-full max-w-[380px] bg-white rounded-[20px] shadow-xl border border-gray-100 p-4 overflow-hidden pointer-events-auto"
            role="status"
        >
            <span className={`absolute left-0 top-0 h-full w-1.5 ${variant.bar}`} />

            <div className={`w-10 h-10 shrink-0 ${variant.iconBg} rounded-full flex items-center justify-center`}>
                <Icon className={variant.iconColor} size={22} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{toast.title}</p>
                {toast.message && (
                    <p className="text-gray-600 text-sm leading-snug mt-0.5">{toast.message}</p>
                )}
            </div>

            <button
                onClick={() => onDismiss(toast.id)}
                className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-gray-500"
                aria-label="Cerrar notificación"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idCounter = useRef(0);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(({ type = "info", title, message = "", duration = TOAST_DURATION_MS }) => {
        const id = ++idCounter.current;

        setToasts((prev) => [...prev, { id, type, title, message }]);

        if (duration > 0) {
            setTimeout(() => dismissToast(id), duration);
        }

        return id;
    }, [dismissToast]);

    // Patrón no bloqueante: la acción principal ya tuvo éxito y se informa,
    // pero el subsistema de notificaciones falló. El aviso es secundario
    // y nunca debe presentarse como fallo de la acción.
    const showNotificationWarning = useCallback((message) => {
        return showToast({
            type: "warning",
            title: "Acción registrada",
            message: message || "La acción se completó, pero la notificación no pudo enviarse.",
        });
    }, [showToast]);

    return (
        <ToastContext.Provider
            value={{
                showToast,
                dismissToast,
                showNotificationWarning,
            }}
        >
            {children}

            <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
