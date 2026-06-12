# Datos temporales del dashboard de estudiante para Sprint 11

## Progreso total

El backend no entrega actualmente la cantidad de prácticas requeridas ni un porcentaje de avance global. El frontend utiliza temporalmente **4 prácticas aprobadas** como requisito total.

- Solo las prácticas con estado `Aprobada` aportan al progreso total.
- Una práctica pendiente, en revisión o rechazada no incrementa el porcentaje total.
- El cálculo aplicado es: `min(prácticas aprobadas, 4) / 4 * 100`.

## Avance administrativo individual

La barra individual representa avance dentro del proceso de revisión, no avance total de carrera. Mientras backend no entregue etapas configurables, se usa el siguiente mapeo temporal:

| Estado | Avance visual |
| --- | ---: |
| Pendiente | 25% |
| En revisión DIRAE | 50% |
| En revisión administrativa | 75% |
| Aprobada | 100% |
| Rechazada | 0% |

Una práctica rechazada se muestra en 0% para evitar interpretar que completa requisitos académicos.

## Pendiente para Sprint 11

Solicitar al backend o configuración institucional:

- Cantidad oficial de prácticas requeridas por estudiante o plan de estudios.
- Etapas oficiales del proceso y su orden.
- Porcentaje o regla de avance por etapa, si corresponde.

Cuando estos datos estén disponibles, se debe reemplazar la configuración de `src/constants/internshipProgress.js` sin modificar los componentes visuales.
