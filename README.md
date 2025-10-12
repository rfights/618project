## 618project: Blog app (React + Vite + Express + Mongo)

This stack runs as a 3-service Docker Compose app:

- blog-frontend: Nginx serves the built React app and reverse-proxies /api/* to the backend
- blog-backend: Express API on port 3001 (CORS configured for local dev and Codespaces)
- blog-database: MongoDB

Key behavior to avoid CORS/NetworkError during signup/login:

- Frontend always calls the API using a relative base path: `/api/v1` (see `src/api/client.js`).
- In local dev (Vite), requests are proxied to `http://localhost:3001` (see `vite.config.js`).
- In Docker, Nginx proxies `/api/*` to `http://blog-backend:3001` (see `nginx.conf`). No hardcoded public hostname required.

### Run locally with Docker

```
docker compose up --build -d
```

Open the app at http://localhost:3000.

Signup and other API calls hit the backend via Nginx, so no CORS errors. If you see a 502 from Nginx, ensure the `blog-backend` container is healthy and that `nginx.conf` has `proxy_pass http://blog-backend:3001;` (no `$request_uri` suffix).

### Dev mode (hot reload)

Run backend and frontend separately outside of Docker:

```
# Backend
cd backend
npm install
npm run dev

# Frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/v1` to `http://localhost:3001` automatically.

### Tests

Backend tests:

```
cd backend
npm test
```

### Notes

- Backend CORS in `backend/src/app.js` allows localhost ports and GitHub Codespaces domains.
- The startup log shows: `Express server running on http://localhost:3001`.
