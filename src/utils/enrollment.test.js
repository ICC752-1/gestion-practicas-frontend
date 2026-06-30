import { describe, expect, it } from 'vitest';

import {
  analyzeEnrollment,
  cleanEnrollment,
  getEnrollmentError,
} from './enrollment';

describe('enrollment utilities', () => {
  it('derives the RUT and admission year from a valid enrollment', () => {
    expect(analyzeEnrollment('12345678523')).toMatchObject({
      enrollment: '12345678523',
      rut: '12.345.678-5',
      admissionYear: 2023,
      isRutValid: true,
      isAdmissionYearValid: true,
      isValid: true,
    });
  });

  it('keeps only digits while typing', () => {
    expect(cleanEnrollment('12.345.678-5-23')).toBe('12345678523');
  });

  it('reports RUT and admission-year errors independently', () => {
    expect(getEnrollmentError('12345678423')).toContain('RUT');
    expect(getEnrollmentError('12345678514')).toContain('2015');
  });
});
