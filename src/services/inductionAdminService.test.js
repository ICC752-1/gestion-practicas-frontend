import { afterEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import {
  getInductionAdminErrorMessage,
  inductionAdminService,
} from './inductionAdminService';

const okResponse = (config, data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

describe('inductionAdminService', () => {
  afterEach(() => {
    api.defaults.adapter = undefined;
    localStorage.clear();
  });

  it('traduce errores tecnicos de URL de video', () => {
    const message = getInductionAdminErrorMessage({
      response: {
        data: {
          detail: [
            {
              msg: 'Value error, video_url must be an absolute HTTP(S) URL',
            },
          ],
        },
      },
    });

    expect(message).toBe(
      'Ingresa una URL completa del video que comience con http:// o https://.'
    );
  });

  it('activa una version usando el endpoint de publicacion', async () => {
    api.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('post');
      expect(config.url).toBe('/induction/admin/versions/8/publish');
      return okResponse(config, { id: 8, is_active: true });
    });

    const response = await inductionAdminService.activate(8);

    expect(response.is_active).toBe(true);
  });
});
