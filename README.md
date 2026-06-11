# Frontend - Gestion de Practicas DCI

React/Vite frontend for the Gestion de Practicas DCI platform.

## Local Development

```bash
npm ci
npm run dev
```

Set the local backend URL in `.env.local`:

```env
VITE_API_URL=http://localhost:8000
VITE_NOTIFICATIONS_SOURCE=simulated
```

`VITE_NOTIFICATIONS_SOURCE` defaults to `simulated`. The notification service encapsulates this mode so its storage methods can later be replaced with backend requests.

## Verification

```bash
npm run lint
npm run build
```

## Docker Image

The browser API base URL is baked into the Vite build. For the VPS deployment,
build the image with same-origin API calls:

```bash
docker build --build-arg VITE_API_URL=/api -t gestion-practicas-frontend:local .
```

The runtime Nginx proxy defaults to:

```text
API_UPSTREAM=http://backend:8000
```

Override `API_UPSTREAM` only if the backend service name or port changes inside
the Docker network.

## CI/CD

CI runs lint, build, and a Docker image build check.

CD runs from `main` and temporarily from
`feature/devops-cicd-vps-deployment`. It does not use a registry. Instead, it:

1. Builds `gestion-practicas-frontend:<commit_sha>`.
2. Exports the image with `docker save`.
3. Copies the compressed image to `/srv/team-b/releases` on the VPS.
4. Loads and retags it on the VPS as `gestion-practicas-frontend:deploy`.
5. Restarts the `frontend` service from `/srv/team-b/app/compose.prod.yml`.
