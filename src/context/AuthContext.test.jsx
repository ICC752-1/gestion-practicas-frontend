import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: {
    getMe: vi.fn(),
  },
}))

const AuthState = () => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <p>Cargando sesion</p>

  return (
    <div>
      <p>{isAuthenticated ? 'Sesion autenticada' : 'Sesion anonima'}</p>
      <p>{user?.email || 'Sin usuario'}</p>
    </div>
  )
}

describe('AuthProvider', () => {
  it('restaura una sesion valida con token local', async () => {
    localStorage.setItem('token', 'access-token')
    // getMe representa la restauracion de usuario que hace AuthProvider al montar.
    authService.getMe.mockResolvedValue({
      email: 'student@example.com',
      roles: ['Estudiante'],
    })

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesion autenticada')).toBeInTheDocument()
    })
    expect(screen.getByText('student@example.com')).toBeInTheDocument()
  })

  it('descarta una sesion invalida con token local', async () => {
    localStorage.setItem('token', 'access-token')
    localStorage.setItem('refresh_token', 'refresh-token')
    // Si /auth/me falla, el contexto debe limpiar cualquier token persistido.
    authService.getMe.mockRejectedValue(new Error('invalid session'))

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesion anonima')).toBeInTheDocument()
    })
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})
