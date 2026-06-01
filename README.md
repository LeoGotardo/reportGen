# ReportGen

Web tool for building structured technical reports. Fill a form on the left, see a live preview on the right, export as PDF or DOCX.

## Templates

| Template | Use case |
|----------|----------|
| **Bug Report** | Security findings and vulnerabilities — severity levels (High/Medium/Low), reproduction steps, code blocks, executive summary |
| **Study Report** | Learning records — topics typed as Concept, Practice, or Summary; tables; references |
| **Changelog** | Version history — change entries typed as feat / fix / breaking / refactor / perf / style / chore; before/after code diffs |

## Export formats

- **PDF** — server-rendered via Puppeteer (A4 or Letter)
- **DOCX** — client-side via docx.js
- **Print** — browser native print on the preview HTML
- **JSON** — save and reload any report state

## Stack

- **Frontend:** React 19, Vite, Bootstrap Icons, CSS custom properties
- **Backend:** Express, Puppeteer
- **i18n:** PT / EN (switchable in the UI)

## Getting started

Install dependencies for both packages:

```bash
npm install
cd server && npm install
```

Run in development (two terminals):

```bash
# terminal 1 — frontend at localhost:5173
npm run dev

# terminal 2 — backend at localhost:3001
cd server && npm run dev
```

Build for production:

```bash
npm run build        # outputs to dist/
node server/index.js # serves dist/ and handles /export
```

## API

### `GET /health`

Returns `{ "ok": true }`. Use for uptime checks.

### `POST /export`

Generates and streams a PDF for any report template.

**Headers**

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `x-api-key` | Required only if `API_KEY` env var is set |

**Body fields**

| Field | Type | Description |
|-------|------|-------------|
| `template` | `"bugs" \| "study" \| "changelog"` | Required |
| `lang` | `"pt" \| "en"` | Language for generated PDF (default `"pt"`) |
| `formato` | `"CARTA" \| anything` | Page size — `"CARTA"` = Letter, otherwise A4 |
| `versao` | string | Version string used in the filename |
| + template fields | — | See template-specific shapes below |

**Response:** `application/pdf` stream, filename `relatorio-{template}-v{versao}.pdf`.

**Error responses**

| Status | Meaning |
|--------|---------|
| `400` | Missing/unknown template or validation failure |
| `401` | Invalid or missing `x-api-key` |
| `429` | Rate limit exceeded |
| `500` | Puppeteer PDF generation failed |

### Rate limiting

`POST /export` is limited to **20 requests per 15 minutes** per IP.

### Validation limits

| Field | Limit |
|-------|-------|
| Request body | 1 MB |
| Text fields | 8 000 characters |
| `problemas` / `topicos` | 60 items |
| `mudancas` | 100 items |
| `testes` | 60 items |
| `tabelas` | 15 tables |
| Columns per table | 10 |
| Rows per table | 100 |
| `resumoExecutivo` | 20 items |
| PDF render timeout | 25 s |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | No | If set, `/export` requires `x-api-key: <value>` header |
| `PORT` | No | Server port (default `3001`) |

## Deployment

Configured for [Render](https://render.com) via `render.yaml`. The build step installs both packages and runs `npx puppeteer browsers install chrome`. Set `API_KEY` in the Render dashboard under environment variables.

---

Made by [Leo Gotardo](https://github.com/LeoGotardo)
