<h1 align="center"><em>Gestión de Prácticas Frontend</em></h1>

<div align="center">
  <p>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    </a>
    <a href="https://vite.dev">
      <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    </a>
    <a href="https://reactrouter.com">
      <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router">
    </a>
    <a href="https://vitest.dev">
      <img src="https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest">
    </a>
    <a href="https://www.docker.com">
      <img src="https://img.shields.io/badge/Docker-Nginx-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
    </a>
  </p>
</div>

## Descripción

Frontend del sistema de gestión de prácticas. Implementa la interfaz web para estudiantes, roles administrativos, supervisores y usuarios institucionales, consumiendo la API REST del backend mediante servicios centralizados.

## Funcionalidades Principales

- Autenticación local y Google OAuth.
- Rutas protegidas por sesión y rol.
- Panel de estudiante y seguimiento de prácticas.
- Registro, edición y anulación de solicitudes.
- Dashboard administrativo y revisión de prácticas.
- Gestión documental y notificaciones.
- Agenda de entrevistas y presentaciones.
- Autoevaluación y evaluación de supervisor.
- Administración de usuarios y reportes según rol.

## Requisitos

- Node.js 20.19+
- npm
- Backend disponible para llamadas API locales

## Ejecución Local

Instalar dependencias:

```bash
npm ci
```

Configurar la URL local del backend en `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Por defecto, Vite expone la aplicación en:

- Frontend: `http://localhost:5173`
- Backend esperado: `http://localhost:8000`

## Verificación

```bash
npm run lint
npm run build
npm test
```

La suite actual usa Vitest y React Testing Library para cubrir rutas protegidas, contexto de autenticación, cliente API, redirección por rol y flujo básico de registro.

## Docker

La URL base de la API se incorpora durante el build de Vite. Para despliegue con proxy Nginx hacia el backend:

```bash
docker build --build-arg VITE_API_URL=/api -t gestion-practicas-frontend:local .
```

En runtime, Nginx redirige `/api/` hacia:

```text
API_UPSTREAM=http://backend:8000
```

Sobrescribir `API_UPSTREAM` solo si cambia el nombre o puerto del servicio backend dentro de la red Docker.

## Documentación

La documentación técnica y funcional del frontend se mantiene en el repositorio de documentación del proyecto: `gestion-practicas-docs`.

Ahí se documentan la arquitectura frontend, autenticación, cliente API, rutas, roles y estrategia de pruebas.
