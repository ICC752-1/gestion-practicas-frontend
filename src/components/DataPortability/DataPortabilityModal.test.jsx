import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataPortabilityModal } from './DataPortabilityModal';

describe('DataPortabilityModal', () => {
  it('descarga el paquete completo con documentos por defecto', () => {
    const onDownload = vi.fn();

    render(
      <DataPortabilityModal
        isOpen
        isDownloading={false}
        onClose={vi.fn()}
        onDownload={onDownload}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }));

    expect(onDownload).toHaveBeenCalledWith({
      format: 'zip',
      includeDocuments: true,
    });
  });

  it('permite solicitar solamente el informe PDF', () => {
    const onDownload = vi.fn();

    render(
      <DataPortabilityModal
        isOpen
        isDownloading={false}
        onClose={vi.fn()}
        onDownload={onDownload}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Informe PDF/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }));

    expect(onDownload).toHaveBeenCalledWith({
      format: 'pdf',
      includeDocuments: false,
    });
    expect(
      screen.queryByRole('checkbox', { name: /Incluir documentos relacionados/ }),
    ).not.toBeInTheDocument();
  });
});
