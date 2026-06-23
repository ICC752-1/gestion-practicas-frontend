/**
 * Utilidades de fecha/hora para el frontend.
 *
 * El backend almacena todos los timestamps como UTC naive (sin designador de
 * zona horaria). Al parsear con `new Date(str)`, JavaScript los trata como
 * hora local del navegador, causando un desfase de 4 horas en Chile (UTC-4).
 *
 * Usar `parseUTCDateTime` para timestamps del servidor y las funciones de
 * formato correspondientes.
 */

/**
 * Parsea un string de datetime UTC-naive del servidor añadiéndole 'Z' para
 * que JS lo interprete como UTC y lo convierta a hora local al mostrarlo.
 *
 * @param {string|null|undefined} value - ISO datetime string del servidor.
 * @returns {Date|null}
 */
export const parseUTCDateTime = (value) => {
  if (!value) return null;
  // Si ya tiene información de zona horaria, usar tal cual
  if (
    value.endsWith('Z') ||
    value.includes('+') ||
    (value.includes('-') && value.lastIndexOf('-') > 10)
  ) {
    return new Date(value);
  }
  // Añadir 'Z' para indicar UTC
  return new Date(value + 'Z');
};

/**
 * Formatea una fecha de calendario (YYYY-MM-DD) como fecha local.
 * Las fechas de calendario son locales (inicio de práctica, etc.) y NO deben
 * tratarse como UTC.
 *
 * @param {string|null|undefined} value - Fecha en formato YYYY-MM-DD.
 * @returns {string}
 */
export const formatLocalDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value + 'T00:00:00').toLocaleDateString('es-CL');
};

/**
 * Formatea un timestamp UTC del servidor como fecha+hora en hora local.
 *
 * @param {string|null|undefined} value - ISO datetime string del servidor (UTC).
 * @returns {string}
 */
export const formatUTCDateTime = (value) => {
  if (!value) return 'Sin fecha';
  const d = parseUTCDateTime(value);
  if (!d || isNaN(d.getTime())) return 'Sin fecha';
  return d.toLocaleString('es-CL');
};

/**
 * Formatea un timestamp UTC del servidor como solo fecha en hora local.
 *
 * @param {string|null|undefined} value - ISO datetime string del servidor (UTC).
 * @returns {string}
 */
export const formatUTCDate = (value) => {
  if (!value) return 'Sin fecha';
  const d = parseUTCDateTime(value);
  if (!d || isNaN(d.getTime())) return 'Sin fecha';
  return d.toLocaleDateString('es-CL');
};
