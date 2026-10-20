import { CHANGE_TYPES } from "../constants/templates";
import { formatDate } from "./date";
import { normalizeResult, suiteCounts, SUITE_RESULT_COLORS } from "./testSuite";

export function h(c) { return c?.startsWith("#") ? c : `#${c}`; }

// Só logo embutido (data:image/…): uma URL externa vinda de JSON importado faria o navegador buscá-la.
export async function logoToDataUrl(src) {
  return typeof src === "string" && src.startsWith("data:image/") ? src : null;
}

function pdfStyles(primary) {
  return {
    h1:      { fontSize: 22, bold: true, margin: [0, 0, 0, 6] },
    h2:      { fontSize: 15, bold: true, margin: [0, 16, 0, 8] },
    sub:     { fontSize: 13, margin: [0, 0, 0, 10] },
    over:    { fontSize: 8, bold: true, characterSpacing: 2, color: "#aaa", margin: [0, 0, 0, 6] },
    meta:    { fontSize: 10, color: "#888", margin: [0, 0, 0, 4] },
    body:    { fontSize: 11, color: "#333", lineHeight: 1.6, margin: [0, 0, 0, 6] },
    lbl:     { fontSize: 9, bold: true, characterSpacing: 1, color: "#999", margin: [0, 10, 0, 4] },
    code:    { fontSize: 9, color: "#d4d4d4", background: "#1e1e1e", margin: [0, 4, 0, 8], preserveLeadingSpaces: true, lineHeight: 1.5 },
    th:      { fontSize: 10, bold: true, color: "#fff", fillColor: primary, margin: [4, 6, 4, 6] },
    td:      { fontSize: 10, color: "#333", margin: [4, 5, 4, 5] },
  };
}

function rule(primary) {
  return { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 3, lineColor: primary }], margin: [0, 8, 0, 24] };
}

export function bugsPdf(config, logo, t) {
  const primary = h(config.cores.primaria);
  const sevC = { ALTA: h(config.cores.altaSev), MÉDIA: h(config.cores.mediaSev), BAIXA: h(config.cores.baixaSev) };
  const c = [];

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: t.doc_bugs_overline, style: "over" });
  c.push({ text: config.titulo || "Relatório", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: [`${t.doc_bugs_fieldAuthor}: ${config.autor || "—"}`, `${t.doc_bugs_fieldVersion}: ${config.versao}`, formatDate(config.data) && `${t.doc_common_date}: ${formatDate(config.data)}`, config.formato].filter(Boolean).join("  |  "), style: "meta" });
  c.push(rule(primary));

  if (config.resumoExecutivo?.some(v => v.trim())) {
    c.push({ text: t.doc_bugs_execSummary, style: "h2", color: primary });
    config.resumoExecutivo.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  if (config.problemas?.length) {
    c.push({ text: t.doc_bugs_problemsTable, style: "h2", color: primary });
    c.push({
      table: {
        headerRows: 1, widths: [30, "*", 65, "*"],
        body: [
          ["#", t.doc_bugs_thProblem, t.doc_bugs_thSeverity, t.doc_bugs_thResolution].map(v => ({ text: v, style: "th" })),
          ...config.problemas.map((p, i) => [
            { text: String(i + 1), style: "td", fillColor: i % 2 ? "#f8f8fb" : "#fff" },
            { text: p.titulo, style: "td", fillColor: i % 2 ? "#f8f8fb" : "#fff" },
            { text: p.severity, style: "td", color: sevC[p.severity] || sevC.ALTA, bold: true, fillColor: i % 2 ? "#f8f8fb" : "#fff" },
            { text: p.resolucao, style: "td", fillColor: i % 2 ? "#f8f8fb" : "#fff" },
          ]),
        ],
      },
      layout: { hLineColor: () => "#eee", vLineColor: () => "#eee" },
      margin: [0, 0, 0, 24],
    });

    c.push({ text: t.doc_bugs_problemsDetail, style: "h2", color: primary });
    config.problemas.forEach((p, i) => {
      const sc = sevC[p.severity] || sevC.ALTA;
      const d = p.detalhe || {};
      c.push({ text: `${i + 1}. ${p.titulo}`, bold: true, fontSize: 13, color: primary, margin: [0, 12, 0, 2] });
      c.push({ text: p.severity, bold: true, color: sc, fontSize: 10, margin: [0, 0, 0, 6] });
      if (p.resumo) c.push({ text: p.resumo, style: "body" });
      if (p.comoReproduzir?.trim()) { c.push({ text: t.doc_bugs_fieldHowToReproduce.toUpperCase(), style: "lbl" }); c.push({ text: p.comoReproduzir, style: "body" }); }
      const sec  = (l, arr) => { if (arr?.some(v => v.trim())) { c.push({ text: l, style: "lbl" }); arr.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" })); } };
      const csec = (l, arr) => { if (arr?.some(v => v.trim())) { c.push({ text: l, style: "lbl" }); arr.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "code" })); } };
      sec(t.doc_bugs_fieldWhere.toUpperCase(), d.ondeOcorre);
      csec(t.doc_bugs_fieldCode.toUpperCase(), d.codigoOnde);
      sec(t.doc_bugs_fieldWhy.toUpperCase(), d.porqueProblema);
      sec(t.doc_bugs_fieldResText.toUpperCase(), d.textoResolucao);
      csec(t.doc_bugs_fieldResCode.toUpperCase(), d.codigoResolucao);
      if (d.testesPassam?.some(v => v.trim())) { c.push({ text: t.doc_bugs_fieldTestsPass.toUpperCase(), style: "lbl", color: "#22c55e" }); d.testesPassam.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "code", color: "#86efac" })); }
    });
  }

  if (config.testes?.length) {
    c.push({ text: t.doc_bugs_testsSection, style: "h2", color: "#16a34a" });
    config.testes.forEach((ts, i) => {
      c.push({ text: `${i + 1}. ${ts.titulo}`, bold: true, fontSize: 12, color: "#16a34a", margin: [0, 8, 0, 2] });
      if (ts.descricao?.trim()) { c.push({ text: t.doc_bugs_testFieldWhat.toUpperCase(), style: "lbl" }); c.push({ text: ts.descricao, style: "body" }); }
      if (ts.como?.trim())      { c.push({ text: t.doc_bugs_testFieldHow.toUpperCase(), style: "lbl" }); c.push({ text: ts.como, style: "body" }); }
      if (ts.codigo?.some(v => v.trim())) ts.codigo.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "code" }));
    });
  }

  if (config.suiteTestes?.length) {
    const label = k => (k === "UNTESTED" ? t.doc_suite_untested : k);
    const counts = suiteCounts(config.suiteTestes);
    c.push({ text: t.doc_bugs_suiteSection, style: "h2", color: primary });
    c.push({
      text: [`${t.doc_suite_total}: ${config.suiteTestes.length}`, ...["PASS", "FAIL", "UNTESTED"].map(k => ({ text: `     ${counts[k]} ${label(k)}`, color: SUITE_RESULT_COLORS[k] }))],
      fontSize: 9, bold: true, color: "#888", margin: [0, 0, 0, 8],
    });
    c.push({
      table: {
        headerRows: 1, widths: [55, "*", "*", 70],
        body: [
          [t.doc_suite_thId, t.doc_suite_thTest, t.doc_suite_thDesc, t.doc_suite_thResult].map(v => ({ text: v, style: "th" })),
          ...config.suiteTestes.map((s, i) => {
            const fillColor = i % 2 ? "#f8f8fb" : "#fff";
            const res = normalizeResult(s.resultado);
            return [
              { text: s.codigo || "—", style: "td", fillColor, color: "#555" },
              { text: s.titulo || "—", style: "td", fillColor, bold: true },
              { text: s.descricao || "—", style: "td", fillColor },
              { text: label(res), style: "td", fillColor, bold: true, color: SUITE_RESULT_COLORS[res] },
            ];
          }),
        ],
      },
      layout: { hLineColor: () => "#eee", vLineColor: () => "#eee" },
      margin: [0, 0, 0, 24],
    });
  }

  if (config.tabelas?.length) {
    c.push({ text: t.doc_common_tables, style: "h2", color: primary });
    config.tabelas.forEach(tb => {
      if (tb.titulo) c.push({ text: tb.titulo, bold: true, fontSize: 12, margin: [0, 8, 0, 4] });
      if (tb.cabecalhos?.length) {
        c.push({
          table: {
            headerRows: 1,
            widths: tb.cabecalhos.map(() => "*"),
            body: [
              tb.cabecalhos.map(col => ({ text: col, style: "th" })),
              ...tb.linhas.map((row, ri) => row.map(cell => ({ text: cell || "—", style: "td", fillColor: ri % 2 ? "#f8f8fb" : "#fff" }))),
            ],
          },
          layout: { hLineColor: () => "#eee", vLineColor: () => "#eee" },
          margin: [0, 0, 0, 16],
        });
      }
    });
  }

  if (config.conclusao?.some(v => v.trim())) {
    c.push({ text: t.doc_bugs_conclusion, style: "h2", color: primary });
    config.conclusao.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}

export function changelogPdf(config, logo, t) {
  const primary = h(config.cores.primaria);
  const c = [];
  const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];
  const grouped = {};
  config.mudancas?.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: t.doc_changelog_overline, style: "over" });
  c.push({ text: config.titulo || "Changelog", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: [config.projeto && `${t.doc_changelog_fieldProject}: ${config.projeto}`, config.autor && `${t.doc_changelog_fieldAuthor}: ${config.autor}`, `${t.doc_changelog_fieldVersion}: ${config.versao}`, formatDate(config.data) && `${t.doc_common_date}: ${formatDate(config.data)}`].filter(Boolean).join("  |  "), style: "meta" });
  c.push(rule(primary));

  if (config.descricao?.some(v => v.trim())) {
    c.push({ text: t.doc_changelog_overview, style: "h2", color: primary });
    config.descricao.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  if (config.mudancas?.length) {
    c.push({ text: t.doc_changelog_table, style: "h2", color: primary });
    c.push({
      table: {
        headerRows: 1, widths: [25, 55, "*", 100, 70],
        body: [
          ["#", t.doc_changelog_thType, t.doc_changelog_thChange, t.doc_changelog_thFile, t.doc_changelog_thImpact].map(v => ({ text: v, style: "th" })),
          ...config.mudancas.map((m, i) => {
            const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
            return [
              { text: String(i + 1), style: "td", fillColor: i % 2 ? "#f8f9fb" : "#fff" },
              { text: info.label, style: "td", color: info.color, bold: true, fillColor: i % 2 ? "#f8f9fb" : "#fff" },
              { text: m.titulo, style: "td", fillColor: i % 2 ? "#f8f9fb" : "#fff" },
              { text: m.arquivo || "—", style: "td", fontSize: 8, fillColor: i % 2 ? "#f8f9fb" : "#fff" },
              { text: m.impacto || "—", style: "td", fontSize: 9, fillColor: i % 2 ? "#f8f9fb" : "#fff" },
            ];
          }),
        ],
      },
      layout: { hLineColor: () => "#eee", vLineColor: () => "#eee" },
      margin: [0, 0, 0, 24],
    });

    c.push({ text: t.doc_changelog_detail, style: "h2", color: primary });
    typeOrder.filter(tp => grouped[tp]?.length).forEach(tipo => {
      const info = CHANGE_TYPES[tipo];
      c.push({ text: `${info.label} (${grouped[tipo].length})`, bold: true, color: info.color, margin: [0, 10, 0, 6] });
      grouped[tipo].forEach(m => {
        c.push({ text: m.titulo, bold: true, fontSize: 12, margin: [0, 4, 0, 2] });
        if (m.arquivo)             c.push({ text: m.arquivo, style: "code", fontSize: 9 });
        if (m.descricao?.trim())   c.push({ text: m.descricao, style: "body" });
        if (m.motivacao?.trim())   c.push({ text: `${t.doc_changelog_fieldMotiv}: ${m.motivacao}`, style: "body", italics: true });
        if (m.impacto?.trim())     c.push({ text: `${t.doc_changelog_fieldImpact}: ${m.impacto}`, style: "body", italics: true });
        if (m.codigoAntes?.trim()) c.push({ text: `${t.doc_changelog_fieldBefore}:\n${m.codigoAntes}`, style: "code" });
        if (m.codigoDepois?.trim())c.push({ text: `${t.doc_changelog_fieldAfter}:\n${m.codigoDepois}`, style: "code" });
        if (m.notas?.trim())       c.push({ text: `${t.doc_docx_notePrefix}${m.notas}`, style: "body", color: "#D97706" });
      });
    });
  }

  if (config.resumo?.some(v => v.trim())) {
    c.push({ text: t.doc_changelog_summary, style: "h2", color: primary });
    config.resumo.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}

export function studyPdf(config, logo, t) {
  const primary = h(config.cores.primaria);
  const tC = { CONCEITO: h(config.cores.concept), PRÁTICA: h(config.cores.practice), RESUMO: h(config.cores.summary) };
  const c = [];

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: t.doc_study_overline, style: "over" });
  c.push({ text: config.titulo || "Estudo", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: [`${t.doc_study_fieldStudent}: ${config.autor || "—"}`, `${t.doc_study_fieldVersion}: ${config.versao}`, formatDate(config.data) && `${t.doc_common_date}: ${formatDate(config.data)}`].filter(Boolean).join("  |  "), style: "meta" });
  c.push(rule(primary));

  if (config.introducao?.some(v => v.trim())) {
    c.push({ text: t.doc_study_intro, style: "h2", color: primary });
    config.introducao.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  if (config.topicos?.length) {
    c.push({ text: t.doc_study_topicsTable, style: "h2", color: primary });
    c.push({
      table: {
        headerRows: 1, widths: [25, "*", 65, "*"],
        body: [
          ["#", t.doc_study_thTopic, t.doc_study_thType, t.doc_study_thSummary].map(v => ({ text: v, style: "th" })),
          ...config.topicos.map((p, i) => {
            const tc = tC[p.tipo] || tC.CONCEITO;
            return [
              { text: String(i + 1), style: "td", fillColor: i % 2 ? "#f8f8fb" : "#fff" },
              { text: p.titulo, style: "td", fillColor: i % 2 ? "#f8f8fb" : "#fff" },
              { text: p.tipo, style: "td", color: tc, bold: true, fillColor: i % 2 ? "#f8f8fb" : "#fff" },
              { text: p.resumo, style: "td", fillColor: i % 2 ? "#f8f8fb" : "#fff" },
            ];
          }),
        ],
      },
      layout: { hLineColor: () => "#eee", vLineColor: () => "#eee" },
      margin: [0, 0, 0, 24],
    });

    c.push({ text: t.doc_study_topicsDetail, style: "h2", color: primary });
    config.topicos.forEach((p, i) => {
      const tc = tC[p.tipo] || tC.CONCEITO;
      const d = p.detalhe || {};
      c.push({ text: `${i + 1}. ${p.titulo}`, bold: true, fontSize: 13, color: primary, margin: [0, 12, 0, 2] });
      c.push({ text: p.tipo, bold: true, color: tc, fontSize: 10, margin: [0, 0, 0, 6] });
      if (d.explicacao?.some(v => v.trim())) { c.push({ text: t.doc_study_fieldExplanation.toUpperCase(), style: "lbl" }); d.explicacao.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" })); }
      if (d.exemplos?.some(v => v.trim()))   { c.push({ text: t.doc_study_fieldExamples.toUpperCase(), style: "lbl" }); d.exemplos.filter(v => v.trim()).forEach(v => c.push({ text: `• ${v}`, style: "body" })); }
      if (d.codigo?.some(v => v.trim()))     { c.push({ text: t.doc_study_fieldCode.toUpperCase(), style: "lbl" }); d.codigo.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "code" })); }
    });
  }

  if (config.conclusao?.some(v => v.trim())) {
    c.push({ text: t.doc_study_conclusion, style: "h2", color: primary });
    config.conclusao.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}
