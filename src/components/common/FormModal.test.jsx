import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormModal } from './FormModal';

describe('FormModal', () => {
  it('renders its content and closes from the close button', () => {
    const onClose = vi.fn();

    render(
      <FormModal isOpen title="Crear cuenta" onClose={onClose}>
        <p>Formulario de prueba</p>
      </FormModal>,
    );

    expect(screen.getByRole('dialog', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Formulario de prueba')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar formulario' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close while an operation is in progress', () => {
    const onClose = vi.fn();

    render(
      <FormModal isOpen isBusy title="Crear cuenta" onClose={onClose}>
        <p>Formulario de prueba</p>
      </FormModal>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
