import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialBugsConfig, initialChangelogConfig, initialStudyConfig } from "../constants/initialConfigs";
import { isoFromDate, toIsoDate, todayIso } from "../utils/date";
import { sanitizeConfig } from "../utils/sanitizeConfig";

// Vários relatórios por template, salvos no localStorage:
//   rg_reports_index  → { reports: [{ id, template, createdAt, updatedAt }], active: { bugs, study, changelog }, activeTemplate }
//   rg_report_<id>    → config do relatório
// Uma chave por relatório: cada edição regrava só o relatório alterado, não todos.

export const TEMPLATE_IDS = ["bugs", "study", "changelog"];

const INDEX_KEY = "rg_reports_index";
// Pastas numa chave própria: uma aba antiga que regrava o índice não apaga pastas criadas em outra aba.
//   rg_folders → { folders: [{ id, name, createdAt }], membership: { [reportId]: folderId } }
const FOLDERS_KEY = "rg_folders";
const reportKey = id => `rg_report_${id}`;
// Formato antigo (um relatório por template), migrado no primeiro carregamento.
const LEGACY_KEYS = { bugs: "rg_bugsConfig", study: "rg_studyConfig", changelog: "rg_changelogConfig" };
const LEGACY_ACTIVE_KEY = "rg_activeTemplate";

const BASE = { bugs: initialBugsConfig, study: initialStudyConfig, changelog: initialChangelogConfig };

// `data` do relatório nasce com a data de criação (editável depois).
export const blankConfig = template => ({ ...structuredClone(BASE[template]), data: todayIso() });

/**
 * Todo config que entra no app (localStorage, JSON/zip importado) passa por aqui: campos que faltam
 * (versões antigas) ganham o default e tipos errados/campos maliciosos são descartados (sanitizeConfig).
 */
function normalize(template, parsed) {
  const cfg = sanitizeConfig(template, parsed);
  // Datas aceitas em ISO ou dd/mm/aaaa (JSON importado); guardadas sempre em ISO.
  const iso = v => toIsoDate(v) ?? "";
  cfg.data = iso(cfg.data);
  if (template === "changelog") { cfg.dataInicio = iso(cfg.dataInicio); cfg.dataFim = iso(cfg.dataFim); }
  return cfg;
}

// No carregamento, um relatório problemático é pulado: nunca pode levar o app à tela de erro,
// cuja única saída é apagar todos os relatórios.
function tryNormalize(template, parsed) {
  try {
    return normalize(template, parsed);
  } catch {
    return null;
  }
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function makeReport(template, config) {
  const now = Date.now();
  const cfg = config ? normalize(template, config) : blankConfig(template);
  if (!cfg.data) cfg.data = todayIso();
  return { id: crypto.randomUUID(), template, createdAt: now, updatedAt: now, config: cfg };
}

const mostRecent = list => list.reduce((a, b) => (b.updatedAt > a.updatedAt ? b : a));

function loadStore() {
  const index = readJson(INDEX_KEY);
  const saved = new Map(); // id → config já persistido (evita regravar no 1º save)
  let reports = [];
  let active = {};
  let activeTemplate;
  let migrated = false;

  if (index && Array.isArray(index.reports)) {
    reports = index.reports.flatMap(meta => {
      if (!meta?.id || !TEMPLATE_IDS.includes(meta.template)) return [];
      const parsed = readJson(reportKey(meta.id));
      if (parsed === undefined) return []; // ausente ou corrompido: ignora em vez de derrubar o app
      const config = tryNormalize(meta.template, parsed);
      if (!config) return [];
      // Relatório salvo antes do campo existir: usa o dia em que foi criado.
      if (!config.data) config.data = isoFromDate(new Date(meta.createdAt || Date.now()));
      saved.set(meta.id, config);
      return [{ id: meta.id, template: meta.template, createdAt: meta.createdAt || 0, updatedAt: meta.updatedAt || 0, config }];
    });
    active = { ...index.active };
    activeTemplate = index.activeTemplate;

    // As chaves rg_report_* são a fonte da verdade; o índice é só metadado. Uma aba antiga
    // aberta em paralelo pode regravar um índice que não lista relatórios criados em outra
    // aba (ou o índice pode ter falhado por cota) — recupera esses relatórios órfãos.
    const listed = new Set(reports.map(r => r.id));
    const now = Date.now();
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("rg_report_")) continue;
      const id = key.slice("rg_report_".length);
      if (listed.has(id)) continue;
      const parsed = readJson(key);
      if (!TEMPLATE_IDS.includes(parsed?.template)) continue;
      const config = tryNormalize(parsed.template, parsed);
      if (!config) continue;
      if (!config.data) config.data = todayIso();
      saved.set(id, config);
      reports.push({ id, template: parsed.template, createdAt: now, updatedAt: now, config });
    }
  } else {
    for (const tmpl of TEMPLATE_IDS) {
      const parsed = readJson(LEGACY_KEYS[tmpl]);
      if (parsed === undefined) continue;
      const r = makeReport(tmpl, parsed);
      reports.push(r);
      active[tmpl] = r.id;
    }
    activeTemplate = readJson(LEGACY_ACTIVE_KEY);
    migrated = true;
  }

  // Todo template tem ao menos um relatório e um ativo válido.
  for (const tmpl of TEMPLATE_IDS) {
    const own = reports.filter(r => r.template === tmpl);
    if (!own.length) {
      const r = makeReport(tmpl);
      reports.push(r);
      active[tmpl] = r.id;
    } else if (!own.some(r => r.id === active[tmpl])) {
      active[tmpl] = mostRecent(own).id;
    }
  }
  if (!TEMPLATE_IDS.includes(activeTemplate)) activeTemplate = "bugs";

  // Pastas: descarta entradas inválidas e vínculos com relatório/pasta que não existem mais.
  const rawFolders = readJson(FOLDERS_KEY);
  const folders = (Array.isArray(rawFolders?.folders) ? rawFolders.folders : [])
    .filter(f => f && typeof f.id === "string" && typeof f.name === "string")
    .map(({ id, name, createdAt }) => ({ id, name, createdAt: createdAt || 0 }));
  const folderIds = new Set(folders.map(f => f.id));
  const reportIds = new Set(reports.map(r => r.id));
  const membership = {};
  for (const [rid, fid] of Object.entries(rawFolders?.membership || {})) {
    if (reportIds.has(rid) && folderIds.has(fid)) membership[rid] = fid;
  }

  return {
    store: { reports, active, activeTemplate, folders, membership },
    saved,
    migrated,
    indexRaw: localStorage.getItem(INDEX_KEY),
    foldersRaw: localStorage.getItem(FOLDERS_KEY),
  };
}

const serializeFolders = s => JSON.stringify({ version: 1, folders: s.folders, membership: s.membership });

const withoutKey = (obj, key) => {
  if (!(key in obj)) return obj;
  const next = { ...obj };
  delete next[key];
  return next;
};

const serializeIndex = s => JSON.stringify({
  version: 1,
  reports: s.reports.map(({ id, template, createdAt, updatedAt }) => ({ id, template, createdAt, updatedAt })),
  active: s.active,
  activeTemplate: s.activeTemplate,
});

// JSON com chaves ordenadas: compara configs sem depender da ordem dos campos.
const stableJson = v => JSON.stringify(v, (_, x) => (
  x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x
));

// Relatório nunca editado: igual ao em branco do template, fora a data.
const isPristine = r => stableJson({ ...r.config, data: "" }) === stableJson({ ...normalize(r.template, blankConfig(r.template)), data: "" });

/**
 * Junta um backup (plano de utils/backup.js) ao que já existe: só adiciona, nunca sobrescreve nem apaga
 * o que o usuário tem. Relatório com o mesmo id e o mesmo conteúdo é pulado — reimportar não duplica.
 */
function mergeBackup(s, plan) {
  const now = Date.now();
  const folders = [...s.folders];
  const membership = { ...s.membership };

  // Pasta do backup → pasta local: mesmo id, senão mesmo nome (só entre as que já existiam,
  // para duas pastas homônimas do backup não virarem uma), senão uma pasta nova.
  const folderFor = new Map();
  let foldersAdded = 0;
  for (const f of plan.folders) {
    const local = folders.find(x => x.id === f.id) || s.folders.find(x => x.name === f.name);
    if (local) { folderFor.set(f.key, local.id); continue; }
    const folder = { id: f.id || crypto.randomUUID(), name: f.name, createdAt: f.createdAt || now };
    folders.push(folder);
    folderFor.set(f.key, folder.id);
    foldersAdded++;
  }

  const byId = new Map(s.reports.map(r => [r.id, r]));
  const added = [];
  let skipped = 0;
  for (const item of plan.reports) {
    const config = normalize(item.template, item.config);
    if (!config.data) config.data = isoFromDate(new Date(item.createdAt || now));
    const existing = item.id ? byId.get(item.id) : undefined;
    // O local passa pelo mesmo caminho do exportado (JSON → normalize): campo undefined/ausente
    // no config em memória não pode fazer o mesmo relatório parecer diferente.
    if (existing && stableJson(normalize(existing.template, JSON.parse(JSON.stringify(existing.config)))) === stableJson(config)) {
      skipped++;
      continue;
    }
    const r = {
      id: item.id && !existing ? item.id : crypto.randomUUID(),
      template: item.template,
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || item.createdAt || now,
      config,
    };
    byId.set(r.id, r);
    added.push(r);
    const folderId = item.folderKey && folderFor.get(item.folderKey);
    if (folderId) membership[r.id] = folderId;
  }

  // Navegador novo: o relatório em branco que cada template ganha não fica sobrando ao lado dos importados.
  let reports = [...s.reports, ...added];
  const active = { ...s.active };
  for (const tmpl of TEMPLATE_IDS) {
    const own = s.reports.filter(r => r.template === tmpl);
    if (!added.some(r => r.template === tmpl) || own.length !== 1 || membership[own[0].id] || !isPristine(own[0])) continue;
    reports = reports.filter(r => r !== own[0]);
    if (active[tmpl] === own[0].id) active[tmpl] = mostRecent(reports.filter(r => r.template === tmpl)).id;
  }

  return { store: { ...s, reports, active, folders, membership }, added: added.length, skipped, foldersAdded };
}

export function useReports() {
  const [initial] = useState(loadStore);
  const [store, setStore] = useState(initial.store);
  const [saveError, setSaveError] = useState(null);

  const storeRef = useRef(store);
  const savedRef = useRef(initial.saved);
  const migratedRef = useRef(initial.migrated);
  const indexRef = useRef(initial.indexRaw); // último índice gravado/lido — evita regravar sem mudança
  const foldersRef = useRef(initial.foldersRaw);
  const timerRef = useRef(null);

  const saveNow = useCallback(() => {
    clearTimeout(timerRef.current);
    const s = storeRef.current;
    const saved = savedRef.current;
    try {
      // Remoções primeiro: liberam espaço antes de gravar.
      const live = new Set(s.reports.map(r => r.id));
      for (const id of [...saved.keys()]) {
        if (!live.has(id)) { localStorage.removeItem(reportKey(id)); saved.delete(id); }
      }
      for (const r of s.reports) {
        if (saved.get(r.id) === r.config) continue;
        localStorage.setItem(reportKey(r.id), JSON.stringify(r.config));
        saved.set(r.id, r.config);
      }
      // Só grava o índice se mudou: uma aba que apenas foi ocultada/fechada não
      // sobrescreve o índice mais novo escrito por outra aba.
      const index = serializeIndex(s);
      if (index !== indexRef.current) {
        localStorage.setItem(INDEX_KEY, index);
        indexRef.current = index;
      }
      const folders = serializeFolders(s);
      if (folders !== foldersRef.current) {
        localStorage.setItem(FOLDERS_KEY, folders);
        foldersRef.current = folders;
      }
      // Só apaga o formato antigo depois que o novo foi gravado com sucesso.
      if (migratedRef.current) {
        [...Object.values(LEGACY_KEYS), LEGACY_ACTIVE_KEY].forEach(k => localStorage.removeItem(k));
        migratedRef.current = false;
      }
      setSaveError(null);
    } catch (err) {
      const quota = err?.name === "QuotaExceededError" || err?.name === "NS_ERROR_DOM_QUOTA_REACHED" || err?.code === 22;
      setSaveError({ kind: quota ? "quota" : "unknown", at: Date.now() });
    }
  }, []);

  useEffect(() => {
    storeRef.current = store;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveNow, 500);
  }, [store, saveNow]);

  // Fechar/ocultar a aba dentro da janela do debounce não pode perder a última edição.
  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === "hidden") saveNow(); };
    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", saveNow);
      document.removeEventListener("visibilitychange", onVisibility);
      saveNow();
    };
  }, [saveNow]);

  const updateReportConfig = useCallback((id, updater) => setStore(s => ({
    ...s,
    reports: s.reports.map(r => {
      if (r.id !== id) return r;
      const config = typeof updater === "function" ? updater(r.config) : updater;
      return config === r.config ? r : { ...r, config, updatedAt: Date.now() };
    }),
  })), []);

  const activeTemplate = store.activeTemplate;
  const activeId = store.active[activeTemplate];
  const activeReport = store.reports.find(r => r.id === activeId);

  // Preso ao id do relatório (não a "quem estiver ativo"): uma escrita assíncrona
  // — ex. FileReader do logo — iniciada antes de trocar de relatório cai no relatório certo.
  const setConfig = useMemo(() => updater => updateReportConfig(activeId, updater), [activeId, updateReportConfig]);

  const createReport = useCallback((template, config, folderId = null) => {
    const r = makeReport(template, config);
    setStore(s => ({
      ...s,
      reports: [...s.reports, r],
      active: { ...s.active, [template]: r.id },
      activeTemplate: template,
      membership: folderId && s.folders.some(f => f.id === folderId) ? { ...s.membership, [r.id]: folderId } : s.membership,
    }));
    return r.id;
  }, []);

  const duplicateReport = useCallback((id, titleSuffix) => {
    const copyId = crypto.randomUUID();
    setStore(s => {
      const src = s.reports.find(r => r.id === id);
      if (!src) return s;
      const now = Date.now();
      const config = structuredClone(src.config);
      if (config.titulo?.trim()) config.titulo = `${config.titulo} ${titleSuffix}`;
      config.data = todayIso(); // cópia é um relatório novo: data de hoje
      const copy = { id: copyId, template: src.template, createdAt: now, updatedAt: now, config };
      const folderId = s.membership[id]; // cópia fica na mesma pasta
      return {
        ...s,
        reports: [...s.reports, copy],
        active: { ...s.active, [src.template]: copyId },
        activeTemplate: src.template,
        membership: folderId ? { ...s.membership, [copyId]: folderId } : s.membership,
      };
    });
  }, []);

  const deleteReport = useCallback(id => {
    const fallback = { id: crypto.randomUUID(), now: Date.now() };
    setStore(s => {
      const target = s.reports.find(r => r.id === id);
      if (!target) return s;
      const tmpl = target.template;
      let reports = s.reports.filter(r => r.id !== id);
      let own = reports.filter(r => r.template === tmpl);
      if (!own.length) {
        // Template nunca fica vazio: o último excluído vira um relatório em branco.
        const blank = { id: fallback.id, template: tmpl, createdAt: fallback.now, updatedAt: fallback.now, config: blankConfig(tmpl) };
        reports = [...reports, blank];
        own = [blank];
      }
      const active = s.active[tmpl] === id ? { ...s.active, [tmpl]: mostRecent(own).id } : s.active;
      return { ...s, reports, active, membership: withoutKey(s.membership, id) };
    });
  }, []);

  const openReport = useCallback(id => setStore(s => {
    const r = s.reports.find(x => x.id === id);
    if (!r) return s;
    return { ...s, activeTemplate: r.template, active: { ...s.active, [r.template]: id } };
  }), []);

  const selectTemplate = useCallback(template => {
    if (TEMPLATE_IDS.includes(template)) setStore(s => ({ ...s, activeTemplate: template }));
  }, []);

  const renameReport = useCallback((id, titulo) => updateReportConfig(id, c => (c.titulo === titulo ? c : { ...c, titulo })), [updateReportConfig]);

  // Pastas: um nível só, compartilhadas entre templates. Mover não altera updatedAt.
  const createFolder = useCallback(name => {
    const folder = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    setStore(s => ({ ...s, folders: [...s.folders, folder] }));
    return folder.id;
  }, []);

  const renameFolder = useCallback((id, name) => setStore(s => ({
    ...s,
    folders: s.folders.map(f => (f.id === id && f.name !== name ? { ...f, name } : f)),
  })), []);

  // Excluir a pasta nunca exclui relatórios: eles voltam para "Sem pasta".
  const deleteFolder = useCallback(id => setStore(s => ({
    ...s,
    folders: s.folders.filter(f => f.id !== id),
    membership: Object.fromEntries(Object.entries(s.membership).filter(([, fid]) => fid !== id)),
  })), []);

  const moveReport = useCallback((reportId, folderId) => setStore(s => {
    if (!folderId) return { ...s, membership: withoutKey(s.membership, reportId) };
    if (!s.folders.some(f => f.id === folderId) || s.membership[reportId] === folderId) return s;
    return { ...s, membership: { ...s.membership, [reportId]: folderId } };
  }), []);

  // Calcula sobre o estado atual para devolver o resumo na hora; se algo mudou antes de
  // aplicar, refaz o merge sobre o estado novo em vez de sobrescrevê-lo.
  const importBackup = useCallback(plan => {
    const base = storeRef.current;
    const { store: next, ...summary } = mergeBackup(base, plan);
    if (summary.added || summary.foldersAdded) setStore(s => (s === base ? next : mergeBackup(s, plan).store));
    return summary;
  }, []);

  return {
    reports: store.reports,
    active: store.active,
    activeTemplate,
    activeReport,
    config: activeReport.config,
    setConfig,
    createReport,
    duplicateReport,
    deleteReport,
    openReport,
    selectTemplate,
    renameReport,
    folders: store.folders,
    membership: store.membership,
    createFolder,
    renameFolder,
    deleteFolder,
    moveReport,
    importBackup,
    saveError,
    dismissSaveError: () => setSaveError(null),
  };
}
