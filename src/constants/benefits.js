export const BENEFIT_OPTIONS = [
  { id: 'sin_beneficio', label: 'Sin beneficios' },
  { id: 'locomocion', label: 'Bono locomoción' },
  { id: 'movilizacion', label: 'Movilización organización' },
  { id: 'colacion_bono', label: 'Bono colación' },
  { id: 'colacion_org', label: 'Colación organización' },
  { id: 'alojamiento', label: 'Bono alojamiento' },
  { id: 'ayuda', label: 'Ayuda económica' },
];

const BENEFIT_LABELS = Object.fromEntries(
  BENEFIT_OPTIONS.map(({ id, label }) => [id, label])
);

export const formatBenefitLabels = (value) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return 'Sin beneficios';
  
  const items = Array.isArray(value)
    ? value
    : String(value || '').split(',');

  const filtered = items.map((item) => item.trim()).filter(Boolean);
  if (filtered.length === 0) return 'Sin beneficios';
  if (filtered.includes('sin_beneficio')) return 'Sin beneficios';

  return filtered
    .map((item) => BENEFIT_LABELS[item] || item)
    .join(', ');
};