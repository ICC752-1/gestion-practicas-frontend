# Pruebas automatizadas de accesibilidad

## Objetivo

Detectar infracciones automáticas de accesibilidad WCAG A y AA en las vistas
principales de la plataforma. La configuración ejecuta cada caso en un viewport
de escritorio y otro móvil.

Las vistas públicas iniciales son:

- `/landing`
- `/login`
- `/requisitos`
- `/faq`

## Instalación

Las dependencias se instalan con:

```powershell
npm ci
npx playwright install chromium
```

El navegador de Playwright se instala fuera del repositorio y no se versiona.

## Ejecución

Desde la raíz del frontend:

```powershell
npm run test:a11y
```

Si no se define otra URL, Playwright inicia Vite automáticamente en
`http://127.0.0.1:5173`. Para probar un despliegue existente:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://plataforma-ejemplo"
npm run test:a11y
```

## Informes

Cada ejecución genera archivos ignorados por Git:

- `reports/accessibility/html/index.html`
- `reports/accessibility/results.json`
- capturas y trazas para casos fallidos.

El informe puede abrirse con:

```powershell
npm run test:a11y:report
```

Cada caso adjunta el resultado completo de axe. La ejecución devuelve un código
distinto de cero cuando encuentra infracciones automáticas.

## Alcance

axe identifica problemas detectables automáticamente, como contraste, nombres
accesibles, estructura y atributos inválidos. Un resultado aprobado respalda la
evidencia automática, pero no demuestra por sí solo toda la accesibilidad de la
plataforma.

Para incorporar vistas autenticadas, agregue casos que preparen la sesión con
una cuenta demo y ejecute `AxeBuilder` después de que la vista termine de cargar.
