import { afterEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { presentationLetterService } from './presentationLetterService';

const okResponse = (config, data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

describe('presentationLetterService', () => {
  afterEach(() => {
    api.defaults.adapter = undefined;
    localStorage.clear();
  });

  it('solicita la previsualizacion PDF con la edicion actual', async () => {
    const payload = {
      title: 'Carta de presentación',
      minimum_hours: 168,
    };
    const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' });

    api.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('post');
      expect(config.url).toBe(
        '/presentation-letters/templates/Pr%C3%A1ctica%20de%20Estudio%20I/preview',
      );
      expect(JSON.parse(config.data)).toEqual(payload);
      expect(config.responseType).toBe('blob');
      return okResponse(config, pdf);
    });

    const response = await presentationLetterService.previewTemplate(
      'Práctica de Estudio I',
      payload,
    );

    expect(response).toBe(pdf);
  });
});
