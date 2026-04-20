import React, { useState } from "react";
import { Bi } from "./Bi";
import { buildBugsHtml, buildStudyHtml, buildChangelogHtml } from "../utils/exportUtils";
import { CHANGE_TYPES } from "../constants/templates";
import { useLang } from "../contexts/LangContext";

// ─── CDN loaders ─────────────────────────────────────────────────────────────

function loadScript(id, src) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement("script");
    s.id = id; s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function getPdfMake() {
  await loadScript("pdfmake-core", "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js");
  await loadScript("pdfmake-fonts", "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js");
  return window.pdfMake;
}

async function getDocx() {
  await loadScript("docx-js", "https://unpkg.com/docx@8.5.0/build/index.umd.js");
  return window.docx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function h(c) { return c?.startsWith("#") ? c : `#${c}`; }

async function logoToDataUrl(src) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  return new Promise(res => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      res(c.toDataURL("image/png"));
    };
    img.onerror = () => res(null);
    img.src = src;
  });
}

// ─── PDF styles ──────────────────────────────────────────────────────────────

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

// ─── PDF — Bugs ──────────────────────────────────────────────────────────────

function bugsPdf(config, logo, t) {
  const primary = h(config.cores.primaria);
  const sevC = { ALTA: h(config.cores.altaSev), MÉDIA: h(config.cores.mediaSev), BAIXA: h(config.cores.baixaSev) };
  const c = [];

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: t.doc_bugs_overline, style: "over" });
  c.push({ text: config.titulo || "Relatório", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: `${t.doc_bugs_fieldAuthor}: ${config.autor || "—"}  |  ${t.doc_bugs_fieldVersion}: ${config.versao}  |  ${config.formato}`, style: "meta" });
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
      const sec  = (l, arr) => { if (arr?.some(v => v.trim())) { c.push({ text: l, style: "lbl" }); arr.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" })); } };
      const csec = (l, arr) => { if (arr?.some(v => v.trim())) { c.push({ text: l, style: "lbl" }); arr.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "code" })); } };
      sec(t.doc_bugs_fieldWhere.toUpperCase(), d.ondeOcorre);
      csec(t.doc_bugs_fieldCode.toUpperCase(), d.codigoOnde);
      sec(t.doc_bugs_fieldWhy.toUpperCase(), d.porqueProblema);
      sec(t.doc_bugs_fieldResText.toUpperCase(), d.textoResolucao);
      csec(t.doc_bugs_fieldResCode.toUpperCase(), d.codigoResolucao);
    });
  }

  if (config.conclusao?.some(v => v.trim())) {
    c.push({ text: t.doc_bugs_conclusion, style: "h2", color: primary });
    config.conclusao.filter(v => v.trim()).forEach(v => c.push({ text: v, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}

// ─── PDF — Changelog ─────────────────────────────────────────────────────────

function changelogPdf(config, logo, t) {
  const primary = h(config.cores.primaria);
  const c = [];
  const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];
  const grouped = {};
  config.mudancas?.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: t.doc_changelog_overline, style: "over" });
  c.push({ text: config.titulo || "Changelog", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: [config.projeto && `${t.doc_changelog_fieldProject}: ${config.projeto}`, config.autor && `${t.doc_changelog_fieldAuthor}: ${config.autor}`, `${t.doc_changelog_fieldVersion}: ${config.versao}`].filter(Boolean).join("  |  "), style: "meta" });
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

// ─── PDF — Study ─────────────────────────────────────────────────────────────

function studyPdf(config, logo, t) {
  const primary = h(config.cores.primaria);
  const tC = { CONCEITO: h(config.cores.concept), PRÁTICA: h(config.cores.practice), RESUMO: h(config.cores.summary) };
  const c = [];

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: t.doc_study_overline, style: "over" });
  c.push({ text: config.titulo || "Estudo", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: `${t.doc_study_fieldStudent}: ${config.autor || "—"}  |  ${t.doc_study_fieldVersion}: ${config.versao}`, style: "meta" });
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

// ─── DOCX helpers ────────────────────────────────────────────────────────────

function hexToDocxColor(hex) {
  // docx-js expects 6-char hex without '#'
  return (hex || "000000").replace("#", "").toUpperCase().padStart(6, "0");
}

function makeDocxBorder(color = "CCCCCC") {
  const c = hexToDocxColor(color);
  return { style: "single", size: 1, color: c };
}

function makeDocxTableBorders(color = "CCCCCC") {
  const b = makeDocxBorder(color);
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
}

// ─── DOCX builder — main ─────────────────────────────────────────────────────

async function buildDocxBlob(config, activeTemplate, t) {
  const docx = await getDocx();
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, PageNumber, Header, Footer, PageBreak,
    LevelFormat, TabStopType, TabStopPosition,
  } = docx;

  // ── Page geometry ──────────────────────────────────────────────────────────
  // A4: 11906 × 16838 DXA  |  CARTA: 12240 × 15840 DXA
  const isLetter  = config.formato === "CARTA";
  const pageW     = isLetter ? 12240 : 11906;
  const marginLR  = 1134; // ~2 cm
  const marginTB  = 1134;
  const contentW  = pageW - marginLR * 2; // usable width in DXA

  // ── Color palette ──────────────────────────────────────────────────────────
  const primary   = hexToDocxColor(config.cores.primaria);
  const secondary = hexToDocxColor(config.cores.secundaria);

  // ── Numbering config (bullets) ─────────────────────────────────────────────
  const numberingConfig = {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } },
        }],
      },
    ],
  };

  // ── Paragraph factories ────────────────────────────────────────────────────

  const Br = () => new Paragraph({ children: [new TextRun({ text: "" })] });

  const MetaLine = (text) => new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 18, color: "888888", font: "Arial" })],
  });

  const SectionTitle = (text, colorHex = primary) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: colorHex, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 26, color: colorHex, font: "Arial" })],
  });

  const SubTitle = (text, colorHex = primary) => new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, color: colorHex, font: "Arial" })],
  });

  const FieldLabel = (text) => new Paragraph({
    spacing: { before: 140, after: 40 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 16, color: "999999", font: "Arial" })],
  });

  const BodyText = (text) => new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: String(text || ""), size: 22, font: "Arial", color: "333333" })],
  });

  const CodeBlock = (text) => new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { fill: hexToDocxColor(config.cores.codeBg || "1E1E1E"), type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
    children: [new TextRun({
      text: String(text || ""),
      font: "Courier New", size: 18,
      color: hexToDocxColor(config.cores.codeText || "D4D4D4"),
    })],
  });

  const BulletItem = (text) => new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: String(text || ""), size: 22, font: "Arial", color: "333333" })],
  });

  const SeverityBadge = (sev) => {
    const colors = {
      ALTA:  hexToDocxColor(config.cores.altaSev  || "C00000"),
      MÉDIA: hexToDocxColor(config.cores.mediaSev || "C55A11"),
      BAIXA: hexToDocxColor(config.cores.baixaSev || "375623"),
    };
    const c = colors[sev] || colors.ALTA;
    return new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: `  ${sev}  `, bold: true, size: 18, color: c, font: "Arial" })],
    });
  };

  // ── Table factories ────────────────────────────────────────────────────────

  const cellBorder = makeDocxTableBorders("DDDDDD");

  const HeaderCell = (text, widthDxa, colorHex = primary) => new TableCell({
    borders: cellBorder,
    shading: { fill: colorHex, type: ShadingType.CLEAR },
    width: { size: widthDxa, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, size: 18, color: "FFFFFF", font: "Arial" })],
    })],
  });

  const DataCell = (text, widthDxa, opts = {}) => new TableCell({
    borders: cellBorder,
    shading: { fill: opts.fill || "FFFFFF", type: ShadingType.CLEAR },
    width: { size: widthDxa, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({
        text: String(text || "—"),
        size: opts.size || 20,
        font: opts.mono ? "Courier New" : "Arial",
        bold: opts.bold || false,
        color: opts.color || "333333",
      })],
    })],
  });

  // ── Header & Footer ────────────────────────────────────────────────────────

  const docHeader = new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: primary, space: 4 } },
        spacing: { after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: config.titulo || "Relatório", bold: true, size: 18, color: primary, font: "Arial" }),
          new TextRun({ text: `\tv${config.versao}`, size: 16, color: "AAAAAA", font: "Arial" }),
        ],
      }),
    ],
  });

  const docFooter = new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } },
        spacing: { before: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: config.autor || "", size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ text: `\t${t.doc_docx_page} `, size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ text: t.doc_docx_of, size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "AAAAAA", font: "Arial" }),
        ],
      }),
    ],
  });

  // ── Cover page ─────────────────────────────────────────────────────────────

  const coverChildren = [];

  // Vertical spacer at top
  for (let i = 0; i < 6; i++) coverChildren.push(Br());

  // Template label
  const templateLabels = { bugs: t.doc_cover_bugs, study: t.doc_cover_study, changelog: t.doc_cover_changelog };
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: templateLabels[activeTemplate] || "RELATÓRIO TÉCNICO", size: 16, color: "AAAAAA", bold: true, font: "Arial" })],
  }));

  // Main title
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: primary, space: 8 } },
    children: [new TextRun({ text: config.titulo || "Relatório", size: 52, bold: true, color: primary, font: "Arial" })],
  }));

  // Subtitle
  if (config.subtitulo) {
    coverChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 120 },
      children: [new TextRun({ text: config.subtitulo, size: 28, color: secondary, font: "Arial" })],
    }));
  }

  for (let i = 0; i < 4; i++) coverChildren.push(Br());

  // Meta info block
  const metaLines = [
    config.autor    ? `Autor: ${config.autor}` : null,
    `Versão: ${config.versao}`,
    config.formato  ? `Formato: ${config.formato}` : null,
    activeTemplate === "changelog" && config.projeto     ? `Projeto: ${config.projeto}` : null,
    activeTemplate === "changelog" && config.repositorio ? `Repositório: ${config.repositorio}` : null,
    activeTemplate === "changelog" && config.dataInicio  ? `Período: ${config.dataInicio}${config.dataFim ? ` → ${config.dataFim}` : ""}` : null,
  ].filter(Boolean);

  metaLines.forEach(line => {
    coverChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: line, size: 20, color: "555555", font: "Arial" })],
    }));
  });

  // Page break after cover
  coverChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ── Content sections ───────────────────────────────────────────────────────

  const contentChildren = [];

  // ── BUGS ──────────────────────────────────────────────────────────────────
  if (activeTemplate === "bugs") {
    const sevColors = {
      ALTA:  hexToDocxColor(config.cores.altaSev  || "C00000"),
      MÉDIA: hexToDocxColor(config.cores.mediaSev || "C55A11"),
      BAIXA: hexToDocxColor(config.cores.baixaSev || "375623"),
    };

    // Resumo Executivo
    if (config.resumoExecutivo?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_bugs_execSummary));
      config.resumoExecutivo.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
      contentChildren.push(Br());
    }

    // Tabela de problemas
    if (config.problemas?.length) {
      contentChildren.push(SectionTitle(t.doc_bugs_problemsTable));

      const colW = [
        Math.round(contentW * 0.05),  // #
        Math.round(contentW * 0.33),  // Problema
        Math.round(contentW * 0.14),  // Severidade
        Math.round(contentW * 0.48),  // Resolução
      ];

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          HeaderCell("#", colW[0], primary),
          HeaderCell(t.doc_bugs_thProblem, colW[1], primary),
          HeaderCell(t.doc_bugs_thSeverity, colW[2], primary),
          HeaderCell(t.doc_bugs_thResolution, colW[3], primary),
        ],
      });

      const dataRows = config.problemas.map((p, i) => {
        const fill = i % 2 ? "F8F8FB" : "FFFFFF";
        const sc = sevColors[p.severity] || sevColors.ALTA;
        return new TableRow({
          children: [
            DataCell(String(i + 1), colW[0], { fill, color: "BBBBBB", bold: true }),
            DataCell(p.titulo, colW[1], { fill }),
            DataCell(p.severity, colW[2], { fill, bold: true, color: sc }),
            DataCell(p.resolucao, colW[3], { fill }),
          ],
        });
      });

      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow, ...dataRows],
      }));

      contentChildren.push(Br());

      // Detalhamento
      contentChildren.push(SectionTitle(t.doc_bugs_problemsDetail));

      config.problemas.forEach((p, i) => {
        const sc = sevColors[p.severity] || sevColors.ALTA;
        const d  = p.detalhe || {};

        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 60 },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: sc, space: 8 } },
          indent: { left: 200 },
          children: [
            new TextRun({ text: `${i + 1}.  `, bold: true, size: 22, color: sc, font: "Arial" }),
            new TextRun({ text: p.titulo || t.noTitle, bold: true, size: 22, color: "1A1A2E", font: "Arial" }),
          ],
        }));

        contentChildren.push(SeverityBadge(p.severity));

        if (p.resumo?.trim()) {
          contentChildren.push(FieldLabel(t.doc_bugs_fieldDesc));
          contentChildren.push(BodyText(p.resumo));
        }

        const sec  = (label, arr) => {
          if (!arr?.some(v => v.trim())) return;
          contentChildren.push(FieldLabel(label));
          arr.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
        };
        const codeSec = (label, arr) => {
          if (!arr?.some(v => v.trim())) return;
          contentChildren.push(FieldLabel(label));
          arr.filter(v => v.trim()).forEach(block =>
            block.split("\n").forEach(line => contentChildren.push(CodeBlock(line)))
          );
          contentChildren.push(Br());
        };

        sec(t.doc_bugs_fieldWhere, d.ondeOcorre);
        codeSec(t.doc_bugs_fieldCode, d.codigoOnde);
        sec(t.doc_bugs_fieldWhy, d.porqueProblema);
        sec(t.doc_bugs_fieldResText, d.textoResolucao);
        codeSec(t.doc_bugs_fieldResCode, d.codigoResolucao);

        contentChildren.push(Br());
      });
    }

    // Conclusão
    if (config.conclusao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_bugs_conclusion));
      config.conclusao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
    }
  }

  // ── CHANGELOG ─────────────────────────────────────────────────────────────
  if (activeTemplate === "changelog") {
    const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];
    const grouped   = {};
    config.mudancas?.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

    // Visão Geral
    if (config.descricao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_changelog_overview));
      config.descricao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
      contentChildren.push(Br());
    }

    // Tabela de mudanças
    if (config.mudancas?.length) {
      contentChildren.push(SectionTitle(t.doc_changelog_table));

      const colW = [
        Math.round(contentW * 0.05),
        Math.round(contentW * 0.12),
        Math.round(contentW * 0.35),
        Math.round(contentW * 0.28),
        Math.round(contentW * 0.20),
      ];

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          HeaderCell("#", colW[0], primary),
          HeaderCell(t.doc_changelog_thType, colW[1], primary),
          HeaderCell(t.doc_changelog_thChange, colW[2], primary),
          HeaderCell(t.doc_changelog_thFile, colW[3], primary),
          HeaderCell(t.doc_changelog_thImpact, colW[4], primary),
        ],
      });

      const dataRows = config.mudancas.map((m, i) => {
        const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
        const fill = i % 2 ? "F8F9FB" : "FFFFFF";
        const tc   = hexToDocxColor(info.color);
        return new TableRow({
          children: [
            DataCell(String(i + 1), colW[0], { fill, color: "BBBBBB", bold: true }),
            DataCell(info.label, colW[1], { fill, bold: true, color: tc }),
            DataCell(m.titulo, colW[2], { fill }),
            DataCell(m.arquivo || "—", colW[3], { fill, mono: true, size: 16 }),
            DataCell(m.impacto || "—", colW[4], { fill, size: 18 }),
          ],
        });
      });

      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow, ...dataRows],
      }));

      contentChildren.push(Br());

      // Detalhamento por tipo
      contentChildren.push(SectionTitle(t.doc_changelog_detail));

      typeOrder.filter(tp => grouped[tp]?.length).forEach(tipo => {
        const info = CHANGE_TYPES[tipo];
        const tc   = hexToDocxColor(info.color);

        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({ text: `${info.label}`, bold: true, size: 24, color: tc, font: "Arial" }),
            new TextRun({ text: `  (${grouped[tipo].length})`, size: 20, color: "888888", font: "Arial" }),
          ],
        }));

        grouped[tipo].forEach(m => {
          contentChildren.push(new Paragraph({
            spacing: { before: 160, after: 60 },
            border: { left: { style: BorderStyle.SINGLE, size: 12, color: tc, space: 8 } },
            indent: { left: 200 },
            children: [new TextRun({ text: m.titulo || t.noTitle, bold: true, size: 22, color: "1A1A2E", font: "Arial" })],
          }));

          if (m.arquivo) {
            contentChildren.push(new Paragraph({
              indent: { left: 200 },
              spacing: { before: 40, after: 60 },
              children: [new TextRun({ text: m.arquivo, font: "Courier New", size: 18, color: "666666" })],
            }));
          }

          if (m.descricao?.trim()) contentChildren.push(BodyText(m.descricao));

          if (m.motivacao?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldMotiv));
            contentChildren.push(BodyText(m.motivacao));
          }

          if (m.impacto?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldImpact));
            contentChildren.push(BodyText(m.impacto));
          }

          if (m.codigoAntes?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldBefore));
            m.codigoAntes.split("\n").forEach(line => contentChildren.push(CodeBlock(line)));
            contentChildren.push(Br());
          }

          if (m.codigoDepois?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldAfter));
            m.codigoDepois.split("\n").forEach(line => contentChildren.push(CodeBlock(line)));
            contentChildren.push(Br());
          }

          if (m.notas?.trim()) {
            contentChildren.push(new Paragraph({
              spacing: { before: 60, after: 60 },
              shading: { fill: "FFFBEB", type: ShadingType.CLEAR },
              indent: { left: 200 },
              children: [
                new TextRun({ text: t.doc_docx_notePrefix, bold: true, size: 20, color: "D97706", font: "Arial" }),
                new TextRun({ text: m.notas, size: 20, color: "555555", font: "Arial" }),
              ],
            }));
          }

          contentChildren.push(Br());
        });
      });
    }

    // Resumo final
    if (config.resumo?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_changelog_summary));
      config.resumo.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
    }
  }

  // ── STUDY ─────────────────────────────────────────────────────────────────
  if (activeTemplate === "study") {
    const typeColors = {
      CONCEITO: hexToDocxColor(config.cores.concept  || "f59e0b"),
      PRÁTICA:  hexToDocxColor(config.cores.practice || "10b981"),
      RESUMO:   hexToDocxColor(config.cores.summary  || "6366f1"),
    };

    // Introdução
    if (config.introducao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_study_intro));
      config.introducao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
      contentChildren.push(Br());
    }

    // Tabela de tópicos
    if (config.topicos?.length) {
      contentChildren.push(SectionTitle(t.doc_study_topicsTable));

      const colW = [
        Math.round(contentW * 0.05),
        Math.round(contentW * 0.38),
        Math.round(contentW * 0.12),
        Math.round(contentW * 0.45),
      ];

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          HeaderCell("#", colW[0], primary),
          HeaderCell(t.doc_study_thTopic, colW[1], primary),
          HeaderCell(t.doc_study_thType, colW[2], primary),
          HeaderCell(t.doc_study_thSummary, colW[3], primary),
        ],
      });

      const dataRows = config.topicos.map((tp, i) => {
        const fill = i % 2 ? "F8F8FB" : "FFFFFF";
        const tc   = typeColors[tp.tipo] || typeColors.CONCEITO;
        return new TableRow({
          children: [
            DataCell(String(i + 1), colW[0], { fill, color: "BBBBBB", bold: true }),
            DataCell(tp.titulo, colW[1], { fill }),
            DataCell(tp.tipo, colW[2], { fill, bold: true, color: tc }),
            DataCell(tp.resumo, colW[3], { fill }),
          ],
        });
      });

      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow, ...dataRows],
      }));

      contentChildren.push(Br());

      // Desenvolvimento
      contentChildren.push(SectionTitle(t.doc_study_topicsDetail));

      config.topicos.forEach((tp, i) => {
        const tc = typeColors[tp.tipo] || typeColors.CONCEITO;
        const d  = tp.detalhe || {};

        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 60 },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: tc, space: 8 } },
          indent: { left: 200 },
          children: [
            new TextRun({ text: `${i + 1}.  `, bold: true, size: 22, color: tc, font: "Arial" }),
            new TextRun({ text: tp.titulo || t.noTitle, bold: true, size: 22, color: "1A1A2E", font: "Arial" }),
          ],
        }));

        contentChildren.push(new Paragraph({
          spacing: { before: 40, after: 80 },
          children: [new TextRun({ text: `  ${tp.tipo}  `, bold: true, size: 18, color: tc, font: "Arial" })],
        }));

        if (d.explicacao?.some(v => v.trim())) {
          contentChildren.push(FieldLabel(t.doc_study_fieldExplanation));
          d.explicacao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
        }

        if (d.exemplos?.some(v => v.trim())) {
          contentChildren.push(FieldLabel(t.doc_study_fieldExamples));
          d.exemplos.filter(v => v.trim()).forEach(v => contentChildren.push(BulletItem(v)));
          contentChildren.push(Br());
        }

        if (d.codigo?.some(v => v.trim())) {
          contentChildren.push(FieldLabel(t.doc_study_fieldCode));
          d.codigo.filter(v => v.trim()).forEach(block =>
            block.split("\n").forEach(line => contentChildren.push(CodeBlock(line)))
          );
          contentChildren.push(Br());
        }

        contentChildren.push(Br());
      });
    }

    // Conclusão
    if (config.conclusao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_study_conclusion));
      config.conclusao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
    }
  }

  // ── Assemble document ──────────────────────────────────────────────────────

  const doc = new Document({
    numbering: numberingConfig,
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22, color: "333333" } },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 52, bold: true, font: "Arial", color: primary },
          paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: primary },
          paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: "1A1A2E" },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
        },
      ],
    },
    sections: [
      {
        // Cover page section — no header/footer
        properties: {
          page: {
            size: { width: pageW, height: isLetter ? 15840 : 16838 },
            margin: { top: marginTB, right: marginLR, bottom: marginTB, left: marginLR },
          },
        },
        children: coverChildren,
      },
      {
        // Content section — with header/footer
        properties: {
          page: {
            size: { width: pageW, height: isLetter ? 15840 : 16838 },
            margin: { top: marginTB + 300, right: marginLR, bottom: marginTB + 300, left: marginLR },
          },
        },
        headers: { default: docHeader },
        footers: { default: docFooter },
        children: contentChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExportPanel({ config, activeTemplate }) {
  const { t } = useLang();
  const [status, setStatus]       = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const getHtml = () =>
    activeTemplate === "study"     ? buildStudyHtml(config, t) :
    activeTemplate === "changelog" ? buildChangelogHtml(config, t) :
                                     buildBugsHtml(config, t);

  const run = async (label, fn) => {
    setStatus("loading"); setStatusMsg(label);
    try {
      await fn();
      setStatus("done"); setStatusMsg(t.done);
      setTimeout(() => setStatus(null), 2200);
    } catch (e) {
      console.error(e);
      setStatus("error"); setStatusMsg(e.message || t.unexpectedError);
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const handlePdf = () => run(t.loadingPdfmake, async () => {
    const pm = await getPdfMake();
    setStatusMsg(t.generatingPdf);
    const logo = await logoToDataUrl(config.logo);
    const def  =
      activeTemplate === "study"     ? studyPdf(config, logo, t) :
      activeTemplate === "changelog" ? changelogPdf(config, logo, t) :
                                       bugsPdf(config, logo, t);
    pm.createPdf(def).download(`relatorio-${activeTemplate}-v${config.versao || "1"}.pdf`);
  });

  const handleDocx = () => run(t.loadingDocx, async () => {
    setStatusMsg(t.generatingDocx);
    const blob = await buildDocxBlob(config, activeTemplate, t);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${activeTemplate}-v${config.versao || "1"}.docx`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  const handleHtml = () => run(t.opening, async () => {
    const w = window.open("", "_blank");
    if (!w) throw new Error(t.popupBlocked);
    w.document.write(getHtml()); w.document.close();
  });

  const handleDownloadHtml = () => run(t.preparingHtml, async () => {
    const blob = new Blob([getHtml()], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${activeTemplate}-v${config.versao || "1"}.html`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  const templateLabel = t[`tmpl_${activeTemplate}_label`] || activeTemplate;

  return (
    <div style={{ padding: "44px 40px", maxWidth: 520, margin: "0 auto" }}>

      {status === "loading" && (
        <div className="export-overlay">
          <div className="export-spinner" />
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--disp)" }}>{statusMsg}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>{t.waitMsg}</div>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 84, height: 84, borderRadius: 28, background: "var(--s2)", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--b2)", boxShadow: "0 20px 40px rgba(0,0,0,.3)", marginBottom: 20 }}>
          <Bi name="file-earmark-richtext-fill" size={38} style={{ color: "var(--ac)" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--disp)", marginBottom: 10, letterSpacing: -.4 }}>
          {t.exportHeading} — {templateLabel}
        </h2>
        <p style={{ fontSize: 14, color: "var(--tx3)", lineHeight: 1.7 }}>{t.exportChoose}</p>
        {status === "done"  && <div style={{ marginTop: 12, color: "#22c55e", fontWeight: 700, fontSize: 13 }}>✓ {statusMsg}</div>}
        {status === "error" && <div style={{ marginTop: 12, color: "#ef4444", fontWeight: 700, fontSize: 13 }}>✗ {statusMsg}</div>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={handlePdf} className="btn-primary full" style={{ padding: "16px 28px", fontSize: 15, background: "linear-gradient(135deg,#6271f5,#8b97ff)" }}>
          <Bi name="file-earmark-pdf-fill" size={17} /> {t.downloadPdf}
        </button>
        <button onClick={handleDocx} className="btn-primary full" style={{ padding: "16px 28px", fontSize: 15, background: "linear-gradient(135deg,#2563EB,#60a5fa)" }}>
          <Bi name="file-earmark-word-fill" size={17} /> {t.downloadDocx}
        </button>

        <div style={{ height: 1, background: "var(--b2)", margin: "4px 0" }} />

        <button onClick={handleHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
          <Bi name="box-arrow-up-right" size={15} /> {t.openHtml}
        </button>
        <button onClick={handleDownloadHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
          <Bi name="download" size={15} /> {t.downloadHtml}
        </button>
      </div>

      <div style={{ marginTop: 36, padding: "22px 24px", background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--b2)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Bi name="info-circle-fill" size={12} style={{ color: "var(--ac)" }} /> {t.tips}
        </div>
        {[
          ["file-earmark-pdf-fill",  t.tipPdf],
          ["file-earmark-word-fill", t.tipDocx],
          ["printer-fill",           t.tipHtml],
        ].map(([icon, text], i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
            <Bi name={icon} size={13} style={{ color: "var(--ac)", marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--tx2)", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

    </div>
  );
}