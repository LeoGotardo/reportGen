// Suíte de testes: copiar (TSV + HTML, abre no Excel/Sheets) e colar de volta.
import { emptySuiteTest } from "../constants/initialConfigs.js";

// Mesmos limites de server/index.js.
export const SUITE_LIMITS = { maxRows: 200, maxTextLen: 8000 };

const fold = s => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

/** Resultado em qualquer idioma/variação → PASS | FAIL | UNTESTED. */
export function normalizeResult(v) {
  const s = fold(v);
  if (/^(pass|passed|passou|ok|aprovado|sucesso|success|✓|✔)$/.test(s)) return "PASS";
  if (/^(fail|failed|falhou|falha|erro|error|reprovado|nok|nao passou|✗|✘)$/.test(s)) return "FAIL";
  return "UNTESTED";
}

/** Próximo ID visível: continua a maior numeração existente (TC-007 → TC-008). */
export function nextCodigo(rows) {
  let best = null;
  for (const r of rows) {
    const m = String(r.codigo ?? "").match(/^(.*?)(\d+)$/);
    if (m && (!best || +m[2] > best.n)) best = { prefix: m[1], n: +m[2], width: m[2].length };
  }
  if (!best) return `TC-${String(rows.length + 1).padStart(3, "0")}`;
  return `${best.prefix}${String(best.n + 1).padStart(best.width, "0")}`;
}

const tsvCell = s => (/[\t\n\r"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const htmlCell = s => s
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  // sem o mso-data-placement o Excel quebra cada <br> numa linha nova da planilha
  .replace(/\r?\n/g, '<br style="mso-data-placement:same-cell">');

/** headers: [ID, Título, Descrição, Resultado]; resultLabel: valor → texto exibido. */
export function serializeSuite(rows, headers, resultLabel) {
  const grid = [headers, ...rows.map(r => [r.codigo, r.titulo, r.descricao, resultLabel(r.resultado)].map(v => String(v ?? "")))];
  const tsv = grid.map(r => r.map(tsvCell).join("\t")).join("\r\n");
  const [head, ...body] = grid;
  const html = `<table><thead><tr>${head.map(h => `<th>${htmlCell(h)}</th>`).join("")}</tr></thead>`
    + `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${htmlCell(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return { tsv, html };
}

const HEADER_ALIASES = {
  codigo: ["id", "codigo", "cod", "test id", "id do teste", "case id", "tc"],
  titulo: ["titulo", "title", "teste", "test", "nome", "name", "caso de teste", "test case"],
  descricao: ["descricao", "description", "desc", "detalhes", "details", "passos", "steps"],
  resultado: ["resultado", "result", "status", "situacao", "estado"],
};
const fieldForHeader = h => Object.keys(HEADER_ALIASES).find(f => HEADER_ALIASES[f].includes(fold(h)));

/**
 * Grade colada (Excel, Sheets, outra suíte copiada) → linhas da suíte.
 * Com cabeçalho reconhecido (pt ou en), mapeia por nome; sem cabeçalho, por posição
 * (ID, Título, Descrição, Resultado). Uma coluna só vira lista de títulos.
 */
export function parseSuiteGrid(grid) {
  const { maxRows, maxTextLen } = SUITE_LIMITS;
  let truncated = false;
  const clip = v => {
    const s = String(v ?? "");
    if (s.length <= maxTextLen) return s;
    truncated = true;
    return s.slice(0, maxTextLen);
  };

  let body = grid;
  let map; // índice da coluna → campo
  const headerFields = (grid[0] || []).map(fieldForHeader);
  if (headerFields.filter(Boolean).length >= 2) {
    map = headerFields;
    body = grid.slice(1);
  } else {
    const width = Math.max(0, ...grid.map(r => r.length));
    map = width === 1 ? ["titulo"] : ["codigo", "titulo", "descricao", "resultado"];
  }

  const rows = [];
  for (const r of body) {
    if (!r.some(c => String(c ?? "").trim())) continue;
    if (rows.length >= maxRows) { truncated = true; break; }
    const row = emptySuiteTest();
    map.forEach((field, ci) => {
      if (!field || r[ci] === undefined) return;
      row[field] = field === "resultado" ? normalizeResult(r[ci]) : clip(String(r[ci]).trim());
    });
    rows.push(row);
  }
  return { rows, truncated };
}

export function suiteCounts(rows) {
  const c = { PASS: 0, FAIL: 0, UNTESTED: 0 };
  for (const r of rows) c[normalizeResult(r.resultado)]++;
  return c;
}

// Cores dos resultados no documento (fundo branco).
export const SUITE_RESULT_COLORS = { PASS: "#16a34a", FAIL: "#dc2626", UNTESTED: "#6b7280" };
