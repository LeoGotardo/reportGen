import { getJSZip } from "./cdnLoaders";
import { mergeConfig } from "./mergeConfig";
import { TEMPLATE_IDS } from "../hooks/useReports";

// Backup de todos os relatórios num .zip — cada pasta do app vira um diretório:
//   reportgen.json        → manifesto: ids, datas e pastas (inclusive as vazias)
//   <Pasta>/<Título>.json  → config do relatório (o mesmo JSON aceito por "Importar JSON")
//   <Título>.json          → relatórios sem pasta ficam na raiz
// Na importação a pasta vem do caminho do arquivo; o manifesto é opcional (um zip montado à mão também serve).

export const MANIFEST = "reportgen.json";
const FORMAT = "reportgen-backup";

const MB = 1024 * 1024;
// Contra arquivo malicioso (zip bomb, milhares de entradas). O localStorage guarda poucos MB,
// então nenhum backup legítimo chega perto destes números.
export const IMPORT_LIMITS = { zipBytes: 20 * MB, entries: 5000, fileBytes: 5 * MB, totalBytes: 30 * MB };

const fail = code => Object.assign(new Error(code), { code });

// eslint-disable-next-line no-control-regex
const ILLEGAL = /[\u0000-\u001f\u007f/\\:*?"<>|]/g;
const RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i; // nomes proibidos no Windows

/** Nome de arquivo/diretório válido em qualquer SO. Ponto no início esconderia o arquivo. */
function safeName(name, fallback) {
  const s = String(name ?? "").replace(ILLEGAL, "_").slice(0, 80).replace(/^[\s.]+|[\s.]+$/g, "");
  if (!s) return fallback;
  return RESERVED.test(s) ? `_${s}` : s;
}

/** `base`, `base (2)`, `base (3)`… sem diferenciar maiúsculas (Windows e macOS também não diferenciam). */
function uniqueName(used, base, ext = "") {
  let name = base;
  for (let n = 2; used.has(`${name}${ext}`.toLowerCase()); n++) name = `${base} (${n})`;
  used.add(`${name}${ext}`.toLowerCase());
  return `${name}${ext}`;
}

/** Conteúdo do backup: arquivos [{ path, text }] e diretórios (pastas vazias também viram diretório). */
export function buildBackup({ reports, folders, membership }, untitled) {
  const rootNames = new Set([MANIFEST]);
  const namesIn = new Map([["", rootNames]]);
  // Nomes de pasta não são únicos e podem sanitizar para o mesmo diretório ("a/b" e "a_b").
  const dirOf = new Map();
  for (const f of folders) {
    const dir = uniqueName(rootNames, safeName(f.name, "_"));
    dirOf.set(f.id, dir);
    namesIn.set(dir, new Set());
  }

  const files = [];
  const entries = [];
  for (const r of reports) {
    const dir = dirOf.get(membership[r.id]) ?? "";
    const name = uniqueName(namesIn.get(dir), safeName(r.config.titulo, untitled), ".json");
    const path = dir ? `${dir}/${name}` : name;
    files.push({ path, text: JSON.stringify(r.config, null, 2) });
    entries.push({ file: path, id: r.id, template: r.template, createdAt: r.createdAt, updatedAt: r.updatedAt });
  }

  const manifest = {
    format: FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    folders: folders.map(f => ({ id: f.id, name: f.name, createdAt: f.createdAt, dir: dirOf.get(f.id) })),
    reports: entries,
  };
  files.push({ path: MANIFEST, text: JSON.stringify(manifest, null, 2) });
  return { files, dirs: [...dirOf.values()] };
}

export async function downloadBackup(state, untitled, filename) {
  const JSZip = await getJSZip();
  const { files, dirs } = buildBackup(state, untitled);
  const zip = new JSZip();
  dirs.forEach(d => zip.folder(d));
  files.forEach(f => zip.file(f.path, f.text));
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// O tamanho declarado no zip pode mentir (zip bomb): conta os bytes enquanto descompacta e para no limite.
function readCapped(entry, max) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let done = false;
    const stream = entry.internalStream("uint8array");
    stream
      .on("data", chunk => {
        if (done) return;
        size += chunk.length;
        if (size > max) { done = true; stream.pause(); reject(fail("too-big")); return; }
        chunks.push(chunk);
      })
      .on("error", () => { if (!done) { done = true; reject(fail("not-zip")); } })
      .on("end", () => {
        if (done) return;
        done = true;
        const out = new Uint8Array(size);
        let at = 0;
        for (const c of chunks) { out.set(c, at); at += c.length; }
        resolve(out);
      })
      .resume();
  });
}

/**
 * Lê o .zip e devolve o plano de importação. Erros têm `code`: "too-large" (arquivo acima do limite),
 * "not-zip" (não é zip ou está corrompido), "too-big" (conteúdo descompactado/entradas acima do limite).
 */
export async function readBackupZip(file) {
  if (file.size > IMPORT_LIMITS.zipBytes) throw fail("too-large");
  const JSZip = await getJSZip();
  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw fail("not-zip");
  }
  const all = Object.values(zip.files);
  if (all.length > IMPORT_LIMITS.entries) throw fail("too-big");
  const dirs = all.filter(e => e.dir).map(e => e.name);
  const decoder = new TextDecoder();
  const files = [];
  let total = 0;
  // Um por vez: para no primeiro arquivo que estoura o limite em vez de descompactar tudo em paralelo.
  for (const e of all.filter(e => !e.dir && /\.json$/i.test(e.name) && !isJunk(clean(e.name)))) {
    const bytes = await readCapped(e, Math.min(IMPORT_LIMITS.fileBytes, IMPORT_LIMITS.totalBytes - total));
    total += bytes.length;
    files.push({ path: e.name, text: decoder.decode(bytes) });
  }
  return parseBackup(files, dirs);
}

const parseJson = text => {
  try { return JSON.parse(text.replace(/^\uFEFF/, "")); } catch { return undefined; }
};
const timestamp = v => (Number.isFinite(v) && v > 0 ? v : null);
// Ids viram sufixo de chave do localStorage e chave de objeto: só o formato que o próprio app gera
// (crypto.randomUUID). Hex e hífen nunca coincidem com "__proto__", "constructor" etc.
const safeId = v => (typeof v === "string" && /^[0-9a-f-]{1,64}$/i.test(v) ? v : null);
const clean = p => p.replace(/\\/g, "/").replace(/\/+$/, "");
// Lixo que o SO acrescenta ao recompactar (macOS: __MACOSX/ e ._arquivo).
const isJunk = p => p.split("/").some(seg => seg === "__MACOSX" || seg.startsWith("."));

/**
 * Entradas do zip → { folders: [{ key, id, name, createdAt }], reports: [{ id, template, createdAt, updatedAt, config, folderKey }], invalid }.
 * `key` é o diretório da pasta no zip; `invalid` conta os .json que não são relatório.
 */
export function parseBackup(rawFiles, rawDirs = []) {
  const files = rawFiles.map(f => ({ ...f, path: clean(f.path) })).filter(f => !isJunk(f.path));
  const dirs = rawDirs.map(clean).filter(d => d && !isJunk(d));

  // Manifesto em qualquer nível: o zip recompactado pelo SO pode embrulhar tudo num diretório.
  const depth = p => p.split("/").length;
  const manifestFile = files
    .filter(f => f.path.split("/").pop() === MANIFEST)
    .sort((a, b) => depth(a.path) - depth(b.path))[0];
  const parsed = manifestFile && parseJson(manifestFile.text);
  const manifest = parsed?.format === FORMAT ? parsed : null;
  const root = manifest ? manifestFile.path.slice(0, -MANIFEST.length) : "";
  const rel = p => (p.startsWith(root) ? p.slice(root.length) : null);

  const metaByFile = new Map((Array.isArray(manifest?.reports) ? manifest.reports : [])
    .filter(m => typeof m?.file === "string")
    .map(m => [m.file, m]));
  const folderByDir = new Map((Array.isArray(manifest?.folders) ? manifest.folders : [])
    .filter(f => typeof f?.dir === "string" && typeof f.name === "string" && f.name.trim())
    .map(f => [f.dir, f]));

  const folders = new Map(); // diretório → pasta
  const addFolder = dir => {
    if (!dir || folders.has(dir)) return;
    const m = folderByDir.get(dir);
    folders.set(dir, {
      key: dir,
      id: safeId(m?.id),
      name: (m ? m.name : dir).slice(0, 120),
      createdAt: timestamp(m?.createdAt),
    });
  };
  // App tem um nível de pasta só: vale o primeiro diretório do caminho.
  const topDir = p => (p.includes("/") ? p.split("/")[0] : null);

  folderByDir.forEach((_, dir) => addFolder(dir));
  for (const d of dirs) {
    const r = rel(`${d}/`);
    if (r) addFolder(r.split("/")[0]);
  }

  const reports = [];
  let invalid = 0;
  for (const f of files) {
    if (manifest && f === manifestFile) continue;
    const r = rel(f.path);
    if (r == null) continue; // fora do diretório do backup
    const config = parseJson(f.text);
    if (!config || typeof config !== "object" || Array.isArray(config) || !TEMPLATE_IDS.includes(config.template)) {
      invalid++;
      continue;
    }
    const meta = metaByFile.get(r);
    // Arquivo exportado pelo app volta como saiu; arquivo de fora (LLM, editado à mão) passa
    // pelo mesmo conserto de "Importar JSON" — itens sem `detalhe` derrubariam o editor.
    // A limpeza de tipos/campos maliciosos vem depois, no normalize do useReports.
    let fixed;
    try {
      fixed = meta ? config : mergeConfig(config);
    } catch {
      invalid++;
      continue;
    }
    const folderKey = topDir(r);
    addFolder(folderKey);
    reports.push({
      id: safeId(meta?.id),
      template: config.template,
      createdAt: timestamp(meta?.createdAt),
      updatedAt: timestamp(meta?.updatedAt),
      config: fixed,
      folderKey,
    });
  }

  return { folders: [...folders.values()], reports, invalid };
}
