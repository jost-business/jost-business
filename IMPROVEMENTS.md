# Improvements & Roadmap

This file tracks completed work, planned features and ideas across the jost-business monorepo and its related projects.

---

## Context / Architecture

- **Monorepo**: Nx workspace at `D:\projects\jost-business` (Angular 21, Nx 22)
- **Production server**: Contabo VPS — `167.86.87.165` — Nuremberg, Germany
- **Domain**: `jost.business` (GoDaddy, nameservers: `ns17/18.domaincontrol.com`)
- **Reverse proxy**: nginx running in Docker on the server
- **Docker**: All apps run via `docker-compose.yml` on `jost-network`
- **Current Docker services**: shell (3000), finance (3001), about-me (3002), playground (3003), travel (3004), nginx (80/443)
- **PWA**: `countdown.jost.business` → GitHub Pages from `apps/pwa-countdown/` in this repo
- **GitHub org**: `jost-business` — repo is public
- **Shared lib**: `libs/ui/countdown` — `CountdownComponent` used by travel + pwa-countdown
- **DB tool access**: PostgreSQL will be exposed on port 5432 for DBeaver/TablePlus

---

## Completed

### pwa-countdown (apps/pwa-countdown)
- [x] Countdown PWA migrated from standalone repo into monorepo
- [x] Shared `CountdownComponent` extracted to `libs/ui/countdown` (used by travel + pwa)
- [x] Custom heart icon (rose color on dark wine background) for home screen + favicon
- [x] Dark romantic theme (glassmorphism, rose palette)
- [x] PWA installable on Android (auto banner) and iOS (manual via Safari share sheet)
- [x] Service worker configured — offline support, silent background updates
- [x] Custom domain: `countdown.jost.business` (GoDaddy CNAME → jost-business.github.io)
- [x] CI/CD: GitHub Actions deploys to GitHub Pages on push to `apps/pwa-countdown/**`
- [x] Celebration screen on August 16, 2026 (day of the trip)
- [x] Local notification on the day of the trip (client-side only)

---

## In Progress / Planned

### PostgreSQL Database (docker-compose)
- [ ] Add `postgres:17-alpine` service to `docker-compose.yml` on `jost-network`
- [ ] Add persistent volume `postgres_data`
- [ ] Expose port `5432` for external DB tool access (DBeaver / TablePlus)
- [ ] Credentials managed via `.env` file (not committed)

### API Service (apps/api)
- [ ] Nx Node.js app scaffolded: `nx generate @nx/node:app api`
- [ ] Express or Fastify backend in TypeScript
- [ ] Exposed via nginx at `api.jost.business`
- [ ] Docker container added to `docker-compose.yml`

#### API Route Structure
```
/jost-business/travel         GET  – get all travel entries
/jost-business/travel         POST – create travel entry

/pwa/notification             GET  – get notification history
/pwa/notification             POST – log app open event (replaces ntfy.sh)
```

### PWA → API Integration
- [ ] Replace the removed `ntfy.sh` call in `app.ts` with:
  ```typescript
  fetch('https://api.jost.business/pwa/notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'app_open', timestamp: new Date() })
  }).catch(() => {});
  ```
- [ ] API stores event in PostgreSQL
- [ ] API sends a push notification or email to the owner

### Docker Automated Deployment
- [ ] GitHub Actions workflow for Contabo server apps (about-me, travel, shell, etc.)
- [ ] On push → SSH into server → `git pull && docker compose up -d --build <service>`
- [ ] Requires: SSH private key stored as GitHub secret

### Travel App Refactor
- [ ] Update `apps/travel` countdown component to use `libs/ui/countdown` (shared lib)
- [ ] Remove duplicate `adventure-countdown.component.ts`

### Future Ideas
- [ ] iOS "Add to Home Screen" hint banner in the PWA (Safari only, shown once)
- [ ] Show trip duration (days together) in the countdown
- [ ] Small photo gallery of previous trips in the travel app
- [ ] API endpoints for future PWA projects under `/pwa/<project>/...` namespace
