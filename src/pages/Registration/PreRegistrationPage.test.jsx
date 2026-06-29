import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreRegistrationPage } from './PreRegistrationPage';
import { internshipService } from '../../services/internshipService';

vi.mock('../../components/Header/UserHeader', () => ({
  UserHeader: () => <header>Header</header>,
}));

vi.mock('../../components/Footer/Footer', () => ({
  Footer: () => <footer>Footer</footer>,
}));

vi.mock('../../services/internshipService', () => ({
  internshipService: {
    getRegistrationEligibility: vi.fn(),
    getInductionContent: vi.fn(),
    submitInductionAttempt: vi.fn(),
  },
}));

describe('PreRegistrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mantiene videos y cuestionario colapsado tras aprobar la induccion', async () => {
    internshipService.getRegistrationEligibility.mockResolvedValue({
      has_induction: true,
      can_create_request: true,
      has_school_insurance: true,
      next_step: 'Puedes continuar al formulario.',
    });
    internshipService.getInductionContent.mockResolvedValue({
      title: 'Inducción de práctica',
      description: 'Contenido obligatorio',
      min_score: 1,
      videos: [{
        id: 1,
        title: 'Video de seguridad',
        video_url: 'https://example.com/video',
        order: 1,
      }],
      questions: [{
        id: 10,
        question_text: '¿Cuál es el primer paso?',
        options: ['Informar al supervisor', 'Ignorar el incidente'],
        order: 1,
      }],
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/inscripcion']}>
        <PreRegistrationPage embedded />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Inducción aprobada')).toHaveLength(2);
    });

    expect(screen.getByText('Video de seguridad')).toBeInTheDocument();

    const summary = screen.getByText('Cuestionario de inducción').closest('summary');
    const details = summary.closest('details');

    expect(details).not.toHaveAttribute('open');

    fireEvent.click(summary);

    expect(details).toHaveAttribute('open');
    expect(screen.getByRole('group', { name: /Cuál es el primer paso/ })).toBeInTheDocument();
    screen.getAllByRole('radio').forEach((option) => {
      expect(option).toBeDisabled();
    });
    expect(screen.queryByRole('button', { name: 'Enviar cuestionario' })).not.toBeInTheDocument();
  });
});
