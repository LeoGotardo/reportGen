// Converte o conteúdo da área de transferência (Excel, Google Sheets, LibreOffice,
// Word...) numa grade de strings. Retorna null quando o conteúdo não é tabular,
// para que o paste normal do navegador siga (ex: parágrafo multilinha numa célula).

// Mesmos limites de server/index.js — acima disso o /export rejeita o relatório.
export const TABLE_LIMITS = { maxColunas: 10, maxLinhas: 100, maxTextLen: 8000 };

/** TSV no formato do Excel: \r\n, células com \n/\t/" vêm entre aspas com "" escapado. */
export function parseTsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  let atCellStart = true;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"' && atCellStart) { inQuotes = true; atCellStart = false; continue; }
    if (ch === "\t") { row.push(cell); cell = ""; atCellStart = true; continue; }
    if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row);
      row = []; cell = ""; atCellStart = true;
      continue;
    }
    cell += ch;
    atCellStart = false;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }

  return rows.map(r => r.map(c => c.replace(/\r\n?/g, "\n")));
}

/** Primeira <table> do HTML copiado. Respeita colspan/rowspan e <br> dentro de células. */
export function parseHtmlTable(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return null;

  const cellText = td => {
    const clone = td.cloneNode(true);
    clone.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
    clone.querySelectorAll("p, div, li").forEach(el => el.append("\n"));
    return clone.textContent
      .replace(/\u00a0/g, " ")
      .split("\n").map(l => l.replace(/[ \t]+/g, " ").trim()).join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const grid = [];
  [...table.rows].forEach((tr, ri) => {
    grid[ri] ??= [];
    let ci = 0;
    [...tr.cells].forEach(td => {
      while (grid[ri][ci] !== undefined) ci++;
      const text = cellText(td);
      const colspan = Math.max(1, Number(td.getAttribute("colspan")) || 1);
      const rowspan = Math.max(1, Number(td.getAttribute("rowspan")) || 1);
      for (let r = 0; r < rowspan; r++) {
        grid[ri + r] ??= [];
        for (let c = 0; c < colspan; c++) grid[ri + r][ci + c] = r === 0 && c === 0 ? text : "";
      }
      ci += colspan;
    });
  });
  return grid.map(r => Array.from(r, c => c ?? ""));
}

/**
 * Lê um DataTransfer. Devolve a grade quando o conteúdo veio de uma planilha/tabela
 * (HTML com <table> ou texto com tabs); null para texto comum.
 * Uma grade 1x1 é uma única célula copiada — o chamador insere o texto limpo.
 */
export function readClipboardGrid(clipboardData) {
  if (!clipboardData) return null;
  const html = clipboardData.getData("text/html");
  const text = clipboardData.getData("text/plain");

  let grid = null;
  if (html && /<table[\s>]/i.test(html)) grid = parseHtmlTable(html);
  if (!grid?.length && text && text.includes("\t")) grid = parseTsv(text);
  if (!grid?.length) return null;

  return trimEmptyRows(grid);
}

/** Remove linhas vazias só nas pontas — uma linha em branco no meio é mantida, como na planilha. */
export function trimEmptyRows(grid) {
  const filled = r => r.some(c => c.trim() !== "");
  const start = grid.findIndex(filled);
  if (start < 0) return null;
  const end = grid.findLastIndex(filled);
  return grid.slice(start, end + 1);
}

export const gridIsSingleCell = grid => grid.length === 1 && grid[0].length === 1;

/**
 * Escreve `grid` a partir de (row, col) em `table`, expandindo linhas/colunas.
 * row === -1 significa colar no cabeçalho: a 1ª linha da grade vira cabeçalho
 * e o resto entra nas linhas a partir do topo.
 * Retorna { table, truncated }.
 */
export function pasteGridIntoTable(table, grid, row, col, newColName) {
  const { maxColunas, maxLinhas, maxTextLen } = TABLE_LIMITS;
  let truncated = false;
  const clip = s => {
    if (s.length <= maxTextLen) return s;
    truncated = true;
    return s.slice(0, maxTextLen);
  };

  let headerRow = null;
  let body = grid;
  let startRow = row;
  if (row < 0) { [headerRow, ...body] = grid; startRow = 0; }

  const gridWidth = Math.max(...grid.map(r => r.length));
  const neededCols = col + gridWidth;
  const colCount = Math.min(maxColunas, Math.max(table.cabecalhos.length, neededCols));
  if (neededCols > maxColunas) truncated = true;

  const cabecalhos = Array.from({ length: colCount }, (_, i) => table.cabecalhos[i] ?? newColName(i + 1));
  // Cabeçalho é <input> de uma linha: Alt+Enter do Excel vira espaço.
  headerRow?.forEach((h, j) => { if (col + j < colCount) cabecalhos[col + j] = clip(h.replace(/\s*\r?\n\s*/g, " ")); });

  const neededRows = startRow + body.length;
  const rowCount = Math.min(maxLinhas, Math.max(table.linhas.length, neededRows));
  if (neededRows > maxLinhas) truncated = true;

  const linhas = Array.from({ length: rowCount }, (_, i) =>
    Array.from({ length: colCount }, (_, j) => table.linhas[i]?.[j] ?? ""));
  body.forEach((r, i) => {
    const ri = startRow + i;
    if (ri >= rowCount) return;
    r.forEach((c, j) => { if (col + j < colCount) linhas[ri][col + j] = clip(c); });
  });

  return { table: { ...table, cabecalhos, linhas }, truncated };
}
