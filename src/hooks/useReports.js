import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialBugsConfig, initialChangelogConfig, initialStudyConfig } from "../constants/initialConfigs";
import { isoFromDate, toIsoDate, todayIso } from "../utils/date";

// Vários relatórios por template, salvos no localStorage:
//   rg_reports_index  → { reports: [{ id, template, createdAt, updatedAt }], active: { bugs, study, changelog }, activeTemplate }
//   rg_report_<id>    → config do relatório
// Uma chave por relatório: cada edição regrava só o relatório alterado, não todos.

export const TEMPLATE_IDS = ["bugs", "study", "changelog"];

const INDEX_KEY = "rg_reports_index";
const reportKey = id => `rg_report_${id}`;
// Formato antigo (um relatório por template), migrado no primeiro carregamento.
const LEGACY_KEYS = { bugs: "rg_bugsConfig", study: "rg_studyConfig", changelog: "rg_changelogConfig" };
const LEGACY_ACTIVE_KEY = "rg_activeTemplate";

const BASE = { bugs: initialBugsConfig, study: initialStudyConfig, changelog: initialChangelogConfig };

// `data` do relatório nasce com a data de criação (editável depois).
export const blankConfig = template => ({ ...structuredClone(BASE[template]), data: todayIso() });

/** Completa campos que faltam (relatórios salvos por versões antigas) com os defaults do template. */
function normalize(template, parsed) {
  const base = BASE[template];
  const src = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  // Datas aceitas em ISO ou dd/mm/aaaa (JSON importado); guardadas sempre em ISO.
  const iso = v => toIsoDate(v) ?? "";
  const cfg = { ...structuredClone(base), ...src, template, cores: { ...base.cores, ...(src.cores || {}) }, data: iso(src.data) };
  if (template === "changelog") { cfg.dataInicio = iso(src.dataInicio); cfg.dataFim = iso(src.dataFim); }
  return cfg;
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
      const config = normalize(meta.template, parsed);
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
      const config = normalize(parsed.template, parsed);
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

  return { store: { reports, active, activeTemplate }, saved, migrated, indexRaw: localStorage.getItem(INDEX_KEY) };
}

const serializeIndex = s => JSON.stringify({
  version: 1,
  reports: s.reports.map(({ id, template, createdAt, updatedAt }) => ({ id, template, createdAt, updatedAt })),
  active: s.active,
  activeTemplate: s.activeTemplate,
});

export function useReports() {
  const [initial] = useState(loadStore);
  const [store, setStore] = useState(initial.store);
  const [saveError, setSaveError] = useState(null);

  const storeRef = useRef(store);
  const savedRef = useRef(initial.saved);
  const migratedRef = useRef(initial.migrated);
  const indexRef = useRef(initial.indexRaw); // último índice gravado/lido — evita regravar sem mudança
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

  const createReport = useCallback((template, config) => {
    const r = makeReport(template, config);
    setStore(s => ({ ...s, reports: [...s.reports, r], active: { ...s.active, [template]: r.id }, activeTemplate: template }));
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
      return { ...s, reports: [...s.reports, copy], active: { ...s.active, [src.template]: copyId }, activeTemplate: src.template };
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
      return { ...s, reports, active };
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
    saveError,
    dismissSaveError: () => setSaveError(null),
  };
}
