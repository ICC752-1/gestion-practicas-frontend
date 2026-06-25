import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrivateRoute } from './PrivateRoute'
import { useAuth } from '../context/useAuth'
import { STUDENT_ROLE, SUPERVISOR_ROLE } from '../services/roleRouting'

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

const renderProtectedRoute = () => {
  // MemoryRouter permite probar redirecciones de React Router sin navegador real.
  render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/private"
          element={
            <PrivateRoute allowedRoles={[STUDENT_ROLE]}>
              <p>Contenido privado</p>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    // Estado base: usuario anonimo; cada caso sobrescribe solo lo que necesita.
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    })
  })

  it('redirige a login cuando no hay sesion', () => {
    renderProtectedRoute()

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('renderiza contenido protegido con rol permitido', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { roles: [STUDENT_ROLE] },
    })

    renderProtectedRoute()

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
  })

  it('muestra acceso denegado con rol no permitido', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { roles: [SUPERVISOR_ROLE] },
    })

    renderProtectedRoute()

    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })
})
