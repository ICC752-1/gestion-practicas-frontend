import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import api from './api'

const okResponse = (config) => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('api client', () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it('adjunta Authorization cuando existe access token', async () => {
    localStorage.setItem('token', 'access-token')
    // El adapter evita llamadas HTTP reales y devuelve la config final de Axios.
    api.defaults.adapter = vi.fn(async (config) => okResponse(config))

    const response = await api.get('/protected')

    expect(response.config.headers.Authorization).toBe('Bearer access-token')
  })

  it('limpia la sesion cuando un 401 no puede renovarse', async () => {
    // Evita que jsdom intente navegar al asignar window.location.href.
    window.history.pushState({}, '', '/login')
    localStorage.setItem('token', 'access-token')
    localStorage.setItem('refresh_token', 'refresh-token')
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'))
    // Simula que cualquier request protegida recibe 401 desde el backend.
    api.defaults.adapter = vi.fn(async (config) => Promise.reject({
      config,
      response: { status: 401 },
    }))

    await expect(api.get('/protected')).rejects.toBeTruthy()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})
