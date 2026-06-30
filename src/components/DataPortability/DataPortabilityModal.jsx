import { useState } from 'react';
import {
  Braces,
  Download,
  FileArchive,
  FileText,
  Loader2,
} from 'lucide-react';
import { FormModal } from '../common/FormModal';

const FORMAT_OPTIONS = [
  {
    value: 'zip',
    title: 'Paquete completo',
    description: 'Incluye informe PDF, datos JSON, manifiesto y archivos relacionados.',
    icon: FileArchive,
  },
  {
    value: 'pdf',
    title: 'Informe PDF',
    description: 'Resumen legible con datos personales, prácticas, estados y evaluaciones.',
    icon: FileText,
  },
  {
    value: 'json',
    title: 'Datos JSON',
    description: 'Copia estructurada para respaldo o procesamiento técnico.',
    icon: Braces,
  },
];

export const DataPortabilityModal = ({
  isOpen,
  isDownloading,
  onClose,
  onDownload,
}) => {
  const [format, setFormat] = useState('zip');
  const [includeDocuments, setIncludeDocuments] = useState(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    onDownload({
      format,
      includeDocuments: format === 'zip' && includeDocuments,
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      title="Descargar mis datos"
      description="Selecciona cómo quieres recibir tu información registrada en la plataforma."
      icon={Download}
      isBusy={isDownloading}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-sm font-black text-gray-900">
            Formato de exportación
          </legend>
          <div className="mt-3 grid gap-3">
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = format === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    'flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition',
                    isSelected
                      ? 'border-[#d22864] bg-[#fff8fb] ring-1 ring-[#d22864]/15'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="portability-format"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setFormat(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      isSelected
                        ? 'bg-[#d22864] text-white'
                        : 'bg-gray-100 text-gray-500',
                    ].join(' ')}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-gray-900">
                        {option.title}
                      </span>
                      {option.value === 'zip' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                          Recomendado
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-gray-500">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {format === 'zip' && (
          <label className="mt-5 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={includeDocuments}
              onChange={(event) => setIncludeDocuments(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d22864]"
            />
            <span>
              <span className="block text-sm font-black text-gray-900">
                Incluir documentos relacionados
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Agrega documentos de tus prácticas y cartas generadas por la plataforma.
              </span>
            </span>
          </label>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDownloading}
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d22864] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b01e52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Preparando descarga...
              </>
            ) : (
              <>
                <Download size={17} />
                Descargar
              </>
            )}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default DataPortabilityModal;
