# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
```bash
npm run dev       # dev server at localhost:5173
npm run build     # production build → dist/
npm run lint      # eslint
npm run preview   # preview production build
```

### Server
```bash
cd server && npm run dev    # node --watch (auto-restart)
cd server && npm start      # production
```

### Full stack (production-like)
```bash
npm run build && node server/index.js   # server serves dist/ as static + handles /export
```

## Architecture

Two separate npm packages — root (Vite/React frontend) and `server/` (Express backend).

**How they connect:** In production the Express server in `server/index.js` serves the built `dist/` folder as static files and exposes `/export` for PDF generation via Puppeteer. In development, Vite dev server and Express run independently; the frontend calls `POST /export` on the Express server (port 3001).

### Frontend (`src/`)

Three report templates: **bugs**, **study**, **changelog**. Each has three files:
- `components/{Template}Editor.jsx` — left-panel form
- `components/{Template}Preview.jsx` — right-panel live preview
- `server/utils/exportUtils.js` — server-side HTML builder for PDF rendering

`App.jsx` gets all report state from `src/hooks/useReports.js`: multiple reports per template, managed in `components/ReportsModal.jsx` (create / open / rename / duplicate / delete). Persistence is `localStorage`: `rg_reports_index` (report metadata + active report per template + active template) and one `rg_report_<id>` key per report config; only changed reports are rewritten (debounced, flushed on `pagehide`). Folders (single level, shared across templates) live in a separate `rg_folders` key (`folders` + `membership` reportId→folderId) so a stale tab rewriting the index can't drop them; both keys are only rewritten when their serialized value changes. Old single-config keys (`rg_bugsConfig`, …) are migrated on first load. Each template always has at least one report. Editor/preview are keyed by report id so per-card UI state doesn't leak between reports.

Key shared pieces:
- `src/constants/initialConfigs.js` — default state shapes for each template
- `src/constants/templates.js` — template metadata (label, icon, etc.)
- `src/contexts/LangContext.jsx` — i18n context (`useLang()` hook, `t` translation function)
- `src/i18n/index.js` — translation strings for `pt` and `en`
- `src/utils/exportUtils.js` — client-side HTML builders (used for browser print preview)
- `src/utils/buildDocxBlob.js` — DOCX export
- `src/utils/cdnLoaders.js` — lazy CDN script loading for export deps

Translation strings are duplicated: `src/i18n/index.js` (frontend) and `server/utils/i18n.js` (backend). Both must stay in sync when adding new keys.

### Server (`server/`)

`server/index.js` — single Express app:
- `POST /export` — receives report JSON, validates it, builds HTML via `server/utils/exportUtils.js`, renders PDF with Puppeteer, streams back as `application/pdf`
- `GET /schema` — serves `report-schema.json` (root), the LLM-facing field reference for all three templates. Keep it in sync with `src/constants/initialConfigs.js`, the enums in `src/constants/templates.js`, and the `LIMITS` in `server/index.js`
- `GET *` — SPA fallback to `dist/index.html`
- Rate limit: 20 requests / 15 min on `/export`
- Optional API key auth via `API_KEY` env var (`x-api-key` header)

`server/utils/exportUtils.js` mirrors the logic of `src/utils/exportUtils.js` but runs server-side. Both build self-contained HTML strings (inline CSS, no external deps) so Puppeteer renders them without network calls.

### Deployment

Deployed on Render (`render.yaml`). Build installs both packages and installs Puppeteer's Chrome. `API_KEY` env var is set in Render dashboard.
