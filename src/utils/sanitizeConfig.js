import {
  initialBugsConfig, initialChangelogConfig, initialStudyConfig,
  emptyBugProblem, emptyBugTest, emptyChange, emptyStudyTopic, emptySuiteTest, emptyTable,
} from "../constants/initialConfigs";
import { CHANGE_TYPES, SEV, STUDY_TYPES } from "../constants/templates";
import { normalizeResult } from "./testSuite";

// Config vindo de fora (JSON/zip importado, localStorage antigo ou adulterado) → só os campos que o app
// conhece, cada um com o tipo esperado. Um arquivo malicioso não pode travar o editor (objeto onde se
// espera texto, item null) nem injetar HTML/URL via cor ou logo. Percorre as chaves do formato, nunca as
// do arquivo: "__proto__" e campos desconhecidos ficam de fora. Valor válido passa intacto, então um
// config salvo pelo próprio app sai igual ao que entrou. Nunca lança.

const MAX_ITEMS = 1000;
const MAX_COLS = 50;
const MAX_ROWS = 1000;

const isObj = v => v !== null && typeof v === "object" && !Array.isArray(v);
const own = (o, k) => (isObj(o) && Object.hasOwn(o, k) ? o[k] : undefined);

const text = (v, def = "") => (typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : def);
const texts = (v, def) => (Array.isArray(v) ? v.slice(0, MAX_ITEMS).map(x => text(x)) : structuredClone(def));
const validId = v => (typeof v === "string" && v !== "" && v.length <= 100) || Number.isFinite(v);

// Hex parcial (0–8 dígitos) é aceito: o editor grava a cor enquanto a pessoa digita.
const color = (v, def) => (typeof v === "string" && /^#?[0-9a-f]{0,8}$/i.test(v) ? v : def);
// Só imagem embutida em base64: sem URL externa, sem aspas, sem script.
export const isSafeLogo = v => typeof v === "string" && /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/]+={0,2}$/i.test(v);

// Enum: valor exato passa; variação de caixa/acento ("media", "Prática") vira a chave certa; resto → padrão.
const fold = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const oneOf = (allowed, def) => v => {
  if (typeof v !== "string") return def;
  if (Object.hasOwn(allowed, v)) return v;
  return Object.keys(allowed).find(k => fold(k) === fold(v.trim())) ?? def;
};

/** Mantém só as chaves de `shape`, com o tipo do valor padrão; `custom[k]` trata os casos especiais. */
function conform(raw, shape, custom = {}) {
  const out = {};
  for (const [k, def] of Object.entries(shape)) {
    const v = own(raw, k);
    out[k] =
      Object.hasOwn(custom, k) ? custom[k](v, def) :
      k === "id"               ? (validId(v) ? v : def) :
      typeof def === "string"  ? text(v, def) :
      Array.isArray(def)       ? texts(v, def) :
      isObj(def)               ? conform(v, def) :
      def;
  }
  return out;
}

/** Lista de itens: descarta o que não é objeto e conforma cada item ao formato do item novo. */
const items = (make, custom) => v => (Array.isArray(v)
  ? v.filter(isObj).slice(0, MAX_ITEMS).map(x => conform(x, make(), custom))
  : []);

const tables = items(emptyTable, {
  cabecalhos: (v, def) => (Array.isArray(v) ? v.slice(0, MAX_COLS).map(x => text(x)) : structuredClone(def)),
  linhas: (v, def) => (Array.isArray(v)
    ? v.slice(0, MAX_ROWS).map(row => (Array.isArray(row) ? row.slice(0, MAX_COLS).map(x => text(x)) : []))
    : structuredClone(def)),
});

const common = (template, base) => ({
  template: () => template,
  formato: oneOf({ ABNT: 1, CARTA: 1 }, base.formato),
  cores: v => Object.fromEntries(Object.entries(base.cores).map(([k, def]) => [k, color(own(v, k), def)])),
  logo: v => (isSafeLogo(v) ? v : null),
  tabelas: tables,
});

const SPECS = {
  bugs: [initialBugsConfig, {
    problemas: items(emptyBugProblem, { severity: oneOf(SEV, "ALTA") }),
    testes: items(emptyBugTest),
    suiteTestes: items(emptySuiteTest, { resultado: v => normalizeResult(v) }),
  }],
  study: [initialStudyConfig, {
    topicos: items(emptyStudyTopic, { tipo: oneOf(STUDY_TYPES, "CONCEITO") }),
  }],
  changelog: [initialChangelogConfig, {
    mudancas: items(emptyChange, { tipo: oneOf(CHANGE_TYPES, "feat") }),
  }],
};

export function sanitizeConfig(template, raw) {
  const [base, custom] = Object.hasOwn(SPECS, template) ? SPECS[template] : SPECS.bugs;
  return conform(raw, base, { ...common(base.template, base), ...custom });
}
