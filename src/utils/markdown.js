// Markdown inline dos campos de prosa: **negrito**, *itálico*, `código`, [texto](https://…)
// e linhas começando com "- " viram "• ". Sem "_" (texto técnico cheio de snake_case).
// Devolve tokens; cada renderer (preview, HTML, pdfmake, docx) monta o seu formato.
// Também importado pelo servidor (server/utils/exportUtils.js): sem dependência de browser.

// Abertura/fechamento de * e ** não colam em letra/número: "2*3*4" e "a**b" ficam literais.
const RE = /`([^`\n]+)`|(?<![\w*])\*\*(?=\S)([^*\n]*?\S)\*\*(?![\w*])|(?<![\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])|\[([^[\]\n]+)\]\(([^)\s]+)\)/g;
const SAFE_URL = /^(https?:\/\/|mailto:)/i;

export function parseMarkdown(src) {
  const text = String(src ?? "").replace(/^([ \t]*)[-*][ \t]+(?=\S)/gm, "$1• ");
  const out = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    const [raw, code, bold, italic, label, url] = m;
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    if (code) out.push({ text: code, code: true });
    else if (bold) out.push({ text: bold, bold: true });
    else if (italic) out.push({ text: italic, italic: true });
    else if (SAFE_URL.test(url)) out.push({ text: label, href: url });
    else out.push({ text: raw }); // javascript:, data: etc. ficam como texto
    last = m.index + raw.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

// Tabelas GFM: linha com "|", linha delimitadora (|---|:--:|) com o mesmo nº de colunas, e
// linhas seguintes com "|" até uma linha sem "|". "\|" é pipe literal. Alinhamento (:--:) é ignorado.
const DELIM = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/; // testado com trim()
const hasPipe = l => /(?<!\\)\|/.test(l);
const cells = l => l.trim().replace(/^\|/, "").replace(/(?<!\\)\|$/, "").split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, "|"));

/** Texto → blocos: { text } (markdown inline, ver parseMarkdown) ou { head, rows } (tabela; células com markdown inline). */
export function parseBlocks(src) {
  const lines = String(src ?? "").split(/\r?\n/);
  const out = [];
  let buf = [];
  const flush = () => {
    // Linhas vazias das pontas saem pelo array: /\n+$/ num texto cheio de "\n" é O(n²).
    while (buf.length && !buf[0]) buf.shift();
    while (buf.length && !buf[buf.length - 1]) buf.pop();
    if (buf.length) out.push({ text: buf.join("\n") });
    buf = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const head = hasPipe(lines[i]) && cells(lines[i]);
    const delim = lines[i + 1];
    if (!head || delim === undefined || !delim.includes("|") || !DELIM.test(delim.trim()) || cells(delim).length !== head.length) {
      buf.push(lines[i]);
      continue;
    }
    const rows = [];
    for (i += 2; i < lines.length && lines[i].trim() && hasPipe(lines[i]); i++) {
      const r = cells(lines[i]);
      rows.push(head.map((_, c) => r[c] ?? ""));
    }
    i--;
    flush();
    out.push({ head, rows });
  }
  flush();
  return out;
}

const esc = v => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
export const MD_CODE_STYLE = "background:#f0f0f3;color:#c7254e;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:.92em";
// Mesmo visual das tabelas do relatório; a cor vem de --md-primary, definida na raiz do documento.
const TH = "color:#fff;padding:9px 14px;text-align:left;font-weight:700;background:var(--md-primary,#1F3864)";
const TD = "padding:8px 14px;border-bottom:1px solid #eee;color:#333;vertical-align:top";

/** Prosa com blocos (tabelas) — o container precisa ser <div>, não <p>. */
export function mdHtml(src) {
  return parseBlocks(src).map(b => !b.head ? mdInlineHtml(b.text) :
    `<table style="width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 12px;page-break-inside:avoid"><thead><tr>${
      b.head.map(h => `<th style="${TH}">${mdInlineHtml(h)}</th>`).join("")}</tr></thead><tbody>${
      b.rows.map((r, i) => `<tr style="background:${i % 2 ? "#f8f8fb" : "#fff"}">${r.map(c => `<td style="${TD}">${mdInlineHtml(c)}</td>`).join("")}</tr>`).join("")
    }</tbody></table>`).join("");
}

/** Só markdown inline (para células de tabela do relatório). */
export function mdInlineHtml(src) {
  return parseMarkdown(src).map(({ text, bold, italic, code, href }) => {
    const s = esc(text).replace(/\n/g, "<br>");
    if (bold)   return `<strong>${s}</strong>`;
    if (italic) return `<em>${s}</em>`;
    if (code)   return `<code style="${MD_CODE_STYLE}">${s}</code>`;
    if (href)   return `<a href="${esc(href)}" style="color:inherit;text-decoration:underline">${s}</a>`;
    return s;
  }).join("");
}

export function mdPdf(src) {
  return parseMarkdown(src).map(({ text, bold, italic, code, href }) =>
    code ? { text, background: "#f0f0f3", color: "#c7254e" }
         : { text, bold, italics: italic, link: href, decoration: href ? "underline" : undefined });
}
