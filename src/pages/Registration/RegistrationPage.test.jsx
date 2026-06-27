import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RegistrationPage } from './RegistrationPage'
import { internshipService } from '../../services/internshipService'

vi.mock('../../components/Header/UserHeader', () => ({
  UserHeader: () => <header>Header</header>,
}))

vi.mock('../../components/Footer/Footer', () => ({
  Footer: () => <footer>Footer</footer>,
}))

vi.mock('../../components/Registration/RegistrationStepper', () => ({
  RegistrationStepper: ({ currentStep }) => <p>Paso actual {currentStep}</p>,
}))

vi.mock('../../components/Registration/RegistrationInfoCard', () => ({
  RegistrationInfoCard: ({ title }) => <h1>{title}</h1>,
}))

vi.mock('../../components/Registration/StudentInfoForm', () => ({
  StudentInfoForm: ({ onNext }) => (
    // Cada mock entrega los datos minimos que RegistrationPage acumula por paso.
    <button type="button" onClick={() => onNext({ internship_period: '2026-1', internship_type: 'Práctica de Estudio I' })}>
      Continuar estudiante
    </button>
  ),
}))

vi.mock('../../components/Registration/OrganizationInfoForm', () => ({
  OrganizationInfoForm: ({ onNext }) => (
    <button type="button" onClick={() => onNext({ org_name: 'Empresa', sector: 'Tecnologia', address: 'Calle 1', city: 'Temuco', org_phone: '+56911111111', web: 'https://empresa.cl' })}>
      Continuar organizacion
    </button>
  ),
}))

vi.mock('../../components/Registration/SupervisorInfoForm', () => ({
  SupervisorInfoForm: ({ onNext }) => (
    <button type="button" onClick={() => onNext({ supervisorName: 'Supervisora', supervisorProfession: 'Ingeniera', supervisorPosition: 'Jefa', supervisorDepartment: 'TI', supervisorEmail: 'supervisora@empresa.cl', supervisorPhone: '+56922222222' })}>
      Continuar supervisor
    </button>
  ),
}))

vi.mock('../../components/Registration/PracticeDetailsForm', () => ({
  PracticeDetailsForm: ({ onNext }) => (
    <button type="button" onClick={() => onNext({ startDate: '2026-03-01', endDate: '2026-04-30', startTime: '09:00', endTime: '18:00', days: ['Lunes', 'Martes'], practiceType: 'Presencial', internship_address: 'Oficina 1' })}>
      Continuar detalles
    </button>
  ),
}))

vi.mock('../../components/Registration/ActivitiesForm', () => ({
  ActivitiesForm: ({ onNext }) => (
    <button type="button" onClick={() => onNext({ act_description: 'Desarrollo de software', ben_description: ['Almuerzo'], amount: '10000' })}>
      Enviar solicitud
    </button>
  ),
}))

vi.mock('../../components/Registration/RegistrationSuccess', () => ({
  RegistrationSuccess: ({ internshipId }) => <p>Solicitud creada {internshipId}</p>,
}))

vi.mock('../../context/useToast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

vi.mock('../../services/internshipService', () => ({
  internshipService: {
    createInternship: vi.fn(),
  },
}))

const completeRegistrationFlow = async () => {
  // Avanza por los cinco pasos usando formularios mockeados para probar solo la pagina contenedora.
  fireEvent.click(screen.getByText('Continuar estudiante'))
  fireEvent.click(screen.getByText('Continuar organizacion'))
  fireEvent.click(screen.getByText('Continuar supervisor'))
  fireEvent.click(screen.getByText('Continuar detalles'))
  fireEvent.click(screen.getByText('Enviar solicitud'))
}

describe('RegistrationPage', () => {
  it('muestra el primer paso del formulario al iniciar', () => {
    render(<RegistrationPage />)

    expect(screen.getByText('Información Personal')).toBeInTheDocument()
    expect(screen.getByText('Paso actual 1')).toBeInTheDocument()
    expect(screen.queryByText(/Solicitud creada/)).not.toBeInTheDocument()
  })

  it('crea la solicitud y muestra exito al completar el flujo', async () => {
    internshipService.createInternship.mockResolvedValue({
      id: 42,
      created_at: '2026-06-25',
    })

    render(<RegistrationPage />)
    await completeRegistrationFlow()

    await waitFor(() => {
      expect(internshipService.createInternship).toHaveBeenCalledWith(expect.objectContaining({
        org_name: 'Empresa',
        supervisor_email: 'supervisora@empresa.cl',
        internship_type: 'Práctica de Estudio I',
      }))
    })
    expect(screen.getByText('Solicitud creada 42')).toBeInTheDocument()
  })

  it('muestra error y no muestra exito cuando falla el envio', async () => {
    // El componente registra el error en consola; el mock mantiene limpia la salida del test.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    internshipService.createInternship.mockRejectedValue({
      response: { status: 409, data: { detail: 'Solicitud duplicada' } },
    })

    render(<RegistrationPage />)
    await completeRegistrationFlow()

    await waitFor(() => {
      expect(screen.getByText('Error al registrar')).toBeInTheDocument()
    })
    expect(screen.getByText('Solicitud duplicada')).toBeInTheDocument()
    expect(screen.queryByText(/Solicitud creada/)).not.toBeInTheDocument()
  })
})
