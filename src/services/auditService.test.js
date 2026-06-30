import { afterEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { auditService, cleanAuditParams } from './auditService';

const okResponse = (config, data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

describe('auditService', () => {
  afterEach(() => {
    api.defaults.adapter = undefined;
    localStorage.clear();
  });

  it('limpia parametros vacios antes de consultar eventos', () => {
    expect(cleanAuditParams({
      search: 'usuario',
      action: '',
      entity: null,
      actor_id: undefined,
      entity_id: 0,
      without_actor: false,
      limit: 15,
    })).toEqual({
      search: 'usuario',
      entity_id: 0,
      limit: 15,
    });
  });

  it('consulta el listado de auditoria con filtros activos', async () => {
    api.defaults.adapter = vi.fn(async (config) => {
      expect(config.url).toBe('/audit/events');
      expect(config.params).toEqual({
        search: 'usuario',
        without_actor: true,
        limit: 15,
        offset: 0,
      });
      return okResponse(config, { items: [], total: 0 });
    });

    const response = await auditService.listEvents({
      search: 'usuario',
      without_actor: true,
      limit: 15,
      offset: 0,
    });

    expect(response.total).toBe(0);
  });

  it('consulta el detalle de un evento', async () => {
    api.defaults.adapter = vi.fn(async (config) => {
      expect(config.url).toBe('/audit/events/12');
      return okResponse(config, { id: 12 });
    });

    const response = await auditService.getEvent(12);

    expect(response.id).toBe(12);
  });
});
