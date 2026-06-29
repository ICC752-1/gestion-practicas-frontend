import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

const TONE_META = {
  primary: {
    icon: CheckCircle2,
    iconClassName: 'text-[#d22864]',
    iconWrapperClassName: 'bg-[#fff0f6]',
    confirmClassName: 'bg-[#d22864] text-white hover:bg-[#b01e52]',
  },
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-emerald-600',
    iconWrapperClassName: 'bg-emerald-50',
    confirmClassName: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  danger: {
    icon: AlertTriangle,
    iconClassName: 'text-red-600',
    iconWrapperClassName: 'bg-red-50',
    confirmClassName: 'bg-red-600 text-white hover:bg-red-700',
  },
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  tone = 'primary',
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const meta = TONE_META[tone] || TONE_META.primary;
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${meta.iconWrapperClassName}`}>
              <Icon className={meta.iconClassName} size={24} />
            </span>
            <h2 id="confirm-dialog-title" className="text-lg font-black text-gray-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar dialogo"
          >
            <X size={18} />
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm leading-6 text-gray-600">
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${meta.confirmClassName}`}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfirmDialog;
