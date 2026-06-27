export const BENEFIT_OPTIONS = [
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
  const items = Array.isArray(value)
    ? value
    : String(value || '').split(',');

  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => BENEFIT_LABELS[item] || item)
    .join(', ');
};
