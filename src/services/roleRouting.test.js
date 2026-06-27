import { describe, expect, it } from 'vitest'
import {
  CAREER_DIRECTOR_ROLE,
  PRACTICE_MANAGER_ROLE,
  SECRETARY_ROLE,
  STUDENT_ROLE,
  SUPERVISOR_ROLE,
  getRedirectPathForRoles,
} from './roleRouting'

describe('getRedirectPathForRoles', () => {
  it('envia estudiantes a su dashboard', () => {
    expect(getRedirectPathForRoles([STUDENT_ROLE])).toBe('/dashboard')
  })

  it('envia roles administrativos a su panel especifico', () => {
    expect(getRedirectPathForRoles([PRACTICE_MANAGER_ROLE])).toBe('/encargado')
    expect(getRedirectPathForRoles([CAREER_DIRECTOR_ROLE])).toBe('/director')
    expect(getRedirectPathForRoles([SECRETARY_ROLE])).toBe('/secretaria')
  })

  it('envia supervisores a su panel', () => {
    expect(getRedirectPathForRoles([SUPERVISOR_ROLE])).toBe('/supervisor')
  })

  it('envia roles desconocidos o vacios a landing', () => {
    expect(getRedirectPathForRoles(['Otro rol'])).toBe('/landing')
    expect(getRedirectPathForRoles([])).toBe('/landing')
  })
})
