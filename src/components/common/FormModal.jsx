import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const FormModal = ({
  isOpen,
  title,
  description,
  icon: Icon,
  isBusy = false,
  onClose,
  children,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isBusy) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBusy, isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fff0f6] text-[#d22864]">
                <Icon size={22} />
              </span>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="text-xl font-black text-gray-900">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#d22864] hover:text-[#d22864] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar formulario"
          >
            <X size={19} />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
};

export default FormModal;
