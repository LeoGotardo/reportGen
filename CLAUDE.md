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

There is no automated test runner. `src/utils/testSuite.js` / `TestSuiteSection.jsx` are the bug report's "test suite" *feature* (a table of test cases inside the report), not tests. `npm run lint` covers both packages (`server/**` gets Node globals).

## Architecture

Two separate npm packages — root (Vite/React frontend) and `server/` (Express backend).

**How they connect:** they don't, at runtime. The UI is fully client-side: PDF (pdfmake), DOCX (docx.js), JSZip are loaded from CDN on demand (`src/utils/cdnLoaders.js`), so every export button needs internet but not the server. The Express server exists for external callers (the `report-gen` Claude Code skill, LLMs): `POST /export` renders PDF with Puppeteer and `GET /schema` documents the payload. In production it also serves `dist/` as static. In dev, only start the server to work on those routes. `VITE_*` vars in `.env.example` are unused by `src/`.

### Frontend (`src/`)

Three report templates: **bugs**, **study**, **changelog**. Each template is rendered by six independent pieces of code, so a new/changed field must reach all of them:
- `components/{Template}Editor.jsx` — left-panel form
- `components/{Template}Preview.jsx` — right-panel live preview (React)
- `src/utils/pdfBuilders.js` — `bugsPdf` / `studyPdf` / `changelogPdf`, pdfmake doc definitions for the UI's PDF button
- `src/utils/buildDocxBlob.js` — one function branching on `activeTemplate`
- `src/utils/exportUtils.js` — HTML builders for "open/download HTML" and browser print
- `server/utils/exportUtils.js` — HTML builders for Puppeteer (`/export`)

Plus, for the field itself: defaults in `initialConfigs.js` (and `SPECS` in `sanitizeConfig.js` for lists/enums), server validators + `LIMITS` in `server/index.js`, `report-schema.json`, and both i18n files.

Prose fields accept markdown (`**bold**`, `*italic*`, `` `code` ``, `[text](https://…)`, `- ` lines → bullets, GFM pipe tables; no `_`). `src/utils/markdown.js` has `parseBlocks` (text → `{ text }` / `{ head, rows }` table blocks) and `parseMarkdown` (inline tokens); every renderer maps those: `<Md text>` in previews, `mdHtml` in both HTML builders (escapes every token, links only http/https/mailto), `withMd` in `pdfBuilders.js` (every `style: "body"` node; flatMaps tables into sibling nodes; use `prefix` instead of concatenating a label into `text`), `BodyText` in `buildDocxBlob.js` (returns `[Paragraph | Table]`, so call sites `push(...BodyText(v))`; special paragraphs like `BulletItem` and the changelog note use `splitLead`: text before the first table stays in them, the rest follows). `markdown.js` runs on every prose field of the public `/export`, so keep its regexes linear (no overlapping quantifiers like `\s*\|?\s*`): worst case today is ~2 ms per 8000-char field. Because tables are blocks, markdown containers are `<div>`, never `<p>`; the table header color comes from `--md-primary`, set on the root of each preview and on the HTML `<body>`. Table-cell contexts use the inline-only variants (`<Md inline>`, `mdInlineHtml`, `mdPdf`, `DataCell(..., { md: true })`). Code fields (`<pre>`, `mono`), titles and table cells stay literal, except changelog `impacto` (markdown in its table cell too); `study.topicos[].resumo` only appears in a table, so it is literal. The server imports it straight from `../../src/utils/markdown.js`, so that file must stay free of browser/Vite deps.

`App.jsx` gets all report state from `src/hooks/useReports.js`: multiple reports per template, managed in `components/ReportsModal.jsx` (create / open / rename / duplicate / delete). Persistence is `localStorage`: `rg_reports_index` (report metadata + active report per template + active template) and one `rg_report_<id>` key per report config; only changed reports are rewritten (debounced, flushed on `pagehide`). Folders (single level, shared across templates) live in a separate `rg_folders` key (`folders` + `membership` reportId→folderId) so a stale tab rewriting the index can't drop them; both keys are only rewritten when their serialized value changes. Old single-config keys (`rg_bugsConfig`, …) are migrated on first load. Full backup lives in `src/utils/backup.js` (JSZip via CDN): export writes a `.zip` with one directory per folder, one `<title>.json` per report (unfiled at the root) and a `reportgen.json` manifest (ids, timestamps, original folder names, empty folders); import (`importBackup` in the hook) only adds — same id + same config is skipped, so re-importing doesn't duplicate. Import limits (zip size, entry count, bytes counted while inflating against zip bombs) are `IMPORT_LIMITS` there.

Every config entering the app (localStorage load, JSON import, zip import) goes through `normalize` → `src/utils/sanitizeConfig.js`: it walks the default shape from `initialConfigs.js`, so **fields not in the defaults are dropped**. New string/string-array fields work by adding them to the defaults; new lists of objects or enums also need an entry in `SPECS` there. Colors must be hex, `logo` a base64 `data:image/…` URL. Each template always has at least one report. Editor/preview are keyed by report id so per-card UI state doesn't leak between reports.

Key shared pieces:
- `src/constants/initialConfigs.js` — default state shapes for each template
- `src/constants/templates.js` — template metadata (label, icon, etc.)
- `src/contexts/lang.js` — `LangContext` + `useLang()` (`{ lang, setLang, t }`); `LangContext.jsx` holds only `<LangProvider>`. Contexts live in component-free files (`lang.js`, `previewNav.js`) so React fast refresh keeps working.
- `src/contexts/previewNav.js` — `goTo(anchor)`: editor buttons scroll the preview to the element with matching `data-anchor` (per section and per card `item:<id>`)
- `src/i18n/index.js` — translation strings for `pt` and `en`

Translation strings are duplicated: `src/i18n/index.js` (frontend) and `server/utils/i18n.js` (backend). Both must stay in sync when adding new keys.

Server `LIMITS` are mirrored client-side so the UI never builds a report `/export` would reject: `TABLE_LIMITS` in `src/utils/parseClipboardTable.js` (Excel/HTML paste into tables) and `SUITE_LIMITS` in `src/utils/testSuite.js` (`maxSuiteTestes: 200`). Change them together.

### Server (`server/`)

`server/index.js` — single Express app:
- `POST /export` — receives report JSON, validates it, builds HTML via `server/utils/exportUtils.js`, renders PDF with Puppeteer, streams back as `application/pdf`
- `GET /schema` — serves `report-schema.json` (root), the LLM-facing field reference for all three templates. Keep it in sync with `src/constants/initialConfigs.js`, the enums in `src/constants/templates.js`, and the `LIMITS` in `server/index.js` — nothing fails when they drift. Rate limit and API key are mounted on `/export` only, so `/schema` and `/health` are public. The UI's "copy schema" button (`JsonOutput.jsx`) imports the JSON into the bundle instead of fetching it
- `GET *` — SPA fallback to `dist/index.html`
- Rate limit: 20 requests / 15 min on `/export`
- Optional API key auth via `API_KEY` env var (`x-api-key` header)

The HTML is built from untrusted JSON, so Puppeteer runs with JavaScript disabled and aborts every request that isn't a `data:` URL (no SSRF even if escaping fails), and validate/build errors return 400 instead of crashing the process.

`server/utils/exportUtils.js` mirrors the logic of `src/utils/exportUtils.js` but runs server-side; every interpolated value goes through `esc` (text), `coresOf` (hex colors) or `safeLogo`. Both build self-contained HTML strings (inline CSS, no external deps) so Puppeteer renders them without network calls.

### Deployment

Deployed on Render (`render.yaml`). Build installs both packages and installs Puppeteer's Chrome. `API_KEY` env var is set in Render dashboard.
