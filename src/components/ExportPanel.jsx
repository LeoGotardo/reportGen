import React, { useState } from "react";
import { Bi } from "./Bi";
import { buildBugsHtml, buildStudyHtml, buildChangelogHtml } from "../utils/exportUtils";
import { CHANGE_TYPES } from "../constants/templates";

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

function bugsPdf(config, logo) {
  const primary = h(config.cores.primaria);
  const sevC = { ALTA: h(config.cores.altaSev), MÉDIA: h(config.cores.mediaSev), BAIXA: h(config.cores.baixaSev) };
  const c = [];

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: "RELATÓRIO DE BUGS — ANÁLISE TÉCNICA", style: "over" });
  c.push({ text: config.titulo || "Relatório", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: `Autor: ${config.autor || "—"}  |  Versão: ${config.versao}  |  ${config.formato}`, style: "meta" });
  c.push(rule(primary));

  if (config.resumoExecutivo?.some(t => t.trim())) {
    c.push({ text: "Resumo Executivo", style: "h2", color: primary });
    config.resumoExecutivo.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" }));
  }

  if (config.problemas?.length) {
    c.push({ text: "Tabela de Problemas", style: "h2", color: primary });
    c.push({
      table: {
        headerRows: 1, widths: [30, "*", 65, "*"],
        body: [
          ["#", "Problema", "Severidade", "Resolução"].map(t => ({ text: t, style: "th" })),
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

    c.push({ text: "Detalhamento", style: "h2", color: primary });
    config.problemas.forEach((p, i) => {
      const sc = sevC[p.severity] || sevC.ALTA;
      const d = p.detalhe || {};
      c.push({ text: `${i + 1}. ${p.titulo}`, bold: true, fontSize: 13, color: primary, margin: [0, 12, 0, 2] });
      c.push({ text: p.severity, bold: true, color: sc, fontSize: 10, margin: [0, 0, 0, 6] });
      if (p.resumo) c.push({ text: p.resumo, style: "body" });
      const sec  = (l, arr) => { if (arr?.some(t => t.trim())) { c.push({ text: l, style: "lbl" }); arr.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" })); } };
      const csec = (l, arr) => { if (arr?.some(t => t.trim())) { c.push({ text: l, style: "lbl" }); arr.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "code" })); } };
      sec("ONDE OCORRE", d.ondeOcorre);
      csec("CÓDIGO", d.codigoOnde);
      sec("IMPACTO", d.porqueProblema);
      sec("RESOLUÇÃO", d.textoResolucao);
      csec("CÓDIGO CORRIGIDO", d.codigoResolucao);
    });
  }

  if (config.conclusao?.some(t => t.trim())) {
    c.push({ text: "Conclusão", style: "h2", color: primary });
    config.conclusao.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}

// ─── PDF — Changelog ─────────────────────────────────────────────────────────

function changelogPdf(config, logo) {
  const primary = h(config.cores.primaria);
  const c = [];
  const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];
  const grouped = {};
  config.mudancas?.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: "CHANGELOG — REGISTRO DE MUDANÇAS", style: "over" });
  c.push({ text: config.titulo || "Changelog", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: [config.projeto && `Projeto: ${config.projeto}`, config.autor && `Autor: ${config.autor}`, `Versão: ${config.versao}`].filter(Boolean).join("  |  "), style: "meta" });
  c.push(rule(primary));

  if (config.descricao?.some(t => t.trim())) {
    c.push({ text: "Visão Geral", style: "h2", color: primary });
    config.descricao.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" }));
  }

  if (config.mudancas?.length) {
    c.push({ text: "Tabela de Mudanças", style: "h2", color: primary });
    c.push({
      table: {
        headerRows: 1, widths: [25, 55, "*", 100, 70],
        body: [
          ["#", "Tipo", "Mudança", "Arquivo(s)", "Impacto"].map(t => ({ text: t, style: "th" })),
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

    c.push({ text: "Detalhamento", style: "h2", color: primary });
    typeOrder.filter(t => grouped[t]?.length).forEach(tipo => {
      const info = CHANGE_TYPES[tipo];
      c.push({ text: `${info.label} (${grouped[tipo].length})`, bold: true, color: info.color, margin: [0, 10, 0, 6] });
      grouped[tipo].forEach(m => {
        c.push({ text: m.titulo, bold: true, fontSize: 12, margin: [0, 4, 0, 2] });
        if (m.arquivo)             c.push({ text: m.arquivo, style: "code", fontSize: 9 });
        if (m.descricao?.trim())   c.push({ text: m.descricao, style: "body" });
        if (m.motivacao?.trim())   c.push({ text: `Motivação: ${m.motivacao}`, style: "body", italics: true });
        if (m.impacto?.trim())     c.push({ text: `Impacto: ${m.impacto}`, style: "body", italics: true });
        if (m.codigoAntes?.trim()) c.push({ text: `ANTES:\n${m.codigoAntes}`, style: "code" });
        if (m.codigoDepois?.trim())c.push({ text: `DEPOIS:\n${m.codigoDepois}`, style: "code" });
        if (m.notas?.trim())       c.push({ text: `⚠ ${m.notas}`, style: "body", color: "#D97706" });
      });
    });
  }

  if (config.resumo?.some(t => t.trim())) {
    c.push({ text: "Resumo Final", style: "h2", color: primary });
    config.resumo.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}

// ─── PDF — Study ─────────────────────────────────────────────────────────────

function studyPdf(config, logo) {
  const primary = h(config.cores.primaria);
  const tC = { CONCEITO: h(config.cores.concept), PRÁTICA: h(config.cores.practice), RESUMO: h(config.cores.summary) };
  const c = [];

  if (logo) c.push({ image: logo, width: 120, margin: [0, 0, 0, 16] });
  c.push({ text: "RELATÓRIO DE ESTUDO — APRENDIZADO TÉCNICO", style: "over" });
  c.push({ text: config.titulo || "Estudo", style: "h1", color: primary });
  if (config.subtitulo) c.push({ text: config.subtitulo, style: "sub", color: h(config.cores.secundaria) });
  c.push({ text: `Estudante: ${config.autor || "—"}  |  Versão: ${config.versao}`, style: "meta" });
  c.push(rule(primary));

  if (config.introducao?.some(t => t.trim())) {
    c.push({ text: "Introdução", style: "h2", color: primary });
    config.introducao.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" }));
  }

  if (config.topicos?.length) {
    c.push({ text: "Resumo dos Tópicos", style: "h2", color: primary });
    c.push({
      table: {
        headerRows: 1, widths: [25, "*", 65, "*"],
        body: [
          ["#", "Tópico", "Tipo", "Resumo"].map(t => ({ text: t, style: "th" })),
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

    c.push({ text: "Desenvolvimento", style: "h2", color: primary });
    config.topicos.forEach((p, i) => {
      const tc = tC[p.tipo] || tC.CONCEITO;
      const d = p.detalhe || {};
      c.push({ text: `${i + 1}. ${p.titulo}`, bold: true, fontSize: 13, color: primary, margin: [0, 12, 0, 2] });
      c.push({ text: p.tipo, bold: true, color: tc, fontSize: 10, margin: [0, 0, 0, 6] });
      if (d.explicacao?.some(t => t.trim())) { c.push({ text: "EXPLICAÇÃO", style: "lbl" }); d.explicacao.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" })); }
      if (d.exemplos?.some(t => t.trim()))   { c.push({ text: "EXEMPLOS", style: "lbl" }); d.exemplos.filter(t => t.trim()).forEach(t => c.push({ text: `• ${t}`, style: "body" })); }
      if (d.codigo?.some(t => t.trim()))     { c.push({ text: "CÓDIGO", style: "lbl" }); d.codigo.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "code" })); }
    });
  }

  if (config.conclusao?.some(t => t.trim())) {
    c.push({ text: "Conclusão", style: "h2", color: primary });
    config.conclusao.filter(t => t.trim()).forEach(t => c.push({ text: t, style: "body" }));
  }

  return { content: c, styles: pdfStyles(primary), defaultStyle: { font: "Roboto" }, pageSize: config.formato === "CARTA" ? "LETTER" : "A4", pageMargins: [56, 48, 56, 48] };
}

// ─── DOCX builder ────────────────────────────────────────────────────────────

async function buildDocxBlob(config, activeTemplate) {
  const docx = await getDocx();
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

  const H1  = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1 });
  const H2  = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2 });
  const P   = t => new Paragraph({ children: [new TextRun({ text: String(t || ""), size: 22 })] });
  const Lbl = t => new Paragraph({ children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 16, color: "999999" })] });
  const Code= t => new Paragraph({ children: [new TextRun({ text: String(t || ""), font: "Courier New", size: 18 })] });
  const Br  = () => new Paragraph({ text: "" });

  const ch = [];
  ch.push(H1(config.titulo || "Relatório"));
  if (config.subtitulo) ch.push(P(config.subtitulo));
  ch.push(P(`Autor: ${config.autor || "—"}  |  Versão: ${config.versao}`));
  ch.push(Br());

  if (activeTemplate === "bugs") {
    config.resumoExecutivo?.filter(t => t.trim()).forEach(t => ch.push(P(t)));
    ch.push(Br());
    config.problemas?.forEach((p, i) => {
      ch.push(H2(`${i + 1}. ${p.titulo} [${p.severity}]`));
      if (p.resumo) ch.push(P(p.resumo));
      const d = p.detalhe || {};
      if (d.ondeOcorre?.some(t => t.trim()))      { ch.push(Lbl("Onde ocorre")); d.ondeOcorre.filter(t => t.trim()).forEach(t => ch.push(P(t))); }
      if (d.codigoOnde?.some(t => t.trim()))      { ch.push(Lbl("Código")); d.codigoOnde.filter(t => t.trim()).forEach(t => ch.push(Code(t))); }
      if (d.porqueProblema?.some(t => t.trim()))  { ch.push(Lbl("Impacto")); d.porqueProblema.filter(t => t.trim()).forEach(t => ch.push(P(t))); }
      if (d.textoResolucao?.some(t => t.trim()))  { ch.push(Lbl("Resolução")); d.textoResolucao.filter(t => t.trim()).forEach(t => ch.push(P(t))); }
      if (d.codigoResolucao?.some(t => t.trim())) { ch.push(Lbl("Código corrigido")); d.codigoResolucao.filter(t => t.trim()).forEach(t => ch.push(Code(t))); }
      ch.push(Br());
    });
    config.conclusao?.filter(t => t.trim()).forEach(t => ch.push(P(t)));
  }

  if (activeTemplate === "changelog") {
    config.descricao?.filter(t => t.trim()).forEach(t => ch.push(P(t)));
    ch.push(Br());
    config.mudancas?.forEach((m, i) => {
      const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
      ch.push(H2(`${i + 1}. [${info.label}] ${m.titulo}`));
      if (m.arquivo)             ch.push(P(`Arquivo: ${m.arquivo}`));
      if (m.descricao?.trim())   ch.push(P(m.descricao));
      if (m.motivacao?.trim())   ch.push(P(`Motivação: ${m.motivacao}`));
      if (m.impacto?.trim())     ch.push(P(`Impacto: ${m.impacto}`));
      if (m.codigoAntes?.trim()) { ch.push(Lbl("Antes")); ch.push(Code(m.codigoAntes)); }
      if (m.codigoDepois?.trim()){ ch.push(Lbl("Depois")); ch.push(Code(m.codigoDepois)); }
      if (m.notas?.trim())       ch.push(P(`⚠ Nota: ${m.notas}`));
      ch.push(Br());
    });
    config.resumo?.filter(t => t.trim()).forEach(t => ch.push(P(t)));
  }

  if (activeTemplate === "study") {
    config.introducao?.filter(t => t.trim()).forEach(t => ch.push(P(t)));
    ch.push(Br());
    config.topicos?.forEach((tp, i) => {
      ch.push(H2(`${i + 1}. [${tp.tipo}] ${tp.titulo}`));
      if (tp.resumo) ch.push(P(tp.resumo));
      const d = tp.detalhe || {};
      if (d.explicacao?.some(t => t.trim())) { ch.push(Lbl("Explicação")); d.explicacao.filter(t => t.trim()).forEach(t => ch.push(P(t))); }
      if (d.exemplos?.some(t => t.trim()))   { ch.push(Lbl("Exemplos")); d.exemplos.filter(t => t.trim()).forEach(t => ch.push(P(`• ${t}`))); }
      if (d.codigo?.some(t => t.trim()))     { ch.push(Lbl("Código")); d.codigo.filter(t => t.trim()).forEach(t => ch.push(Code(t))); }
      ch.push(Br());
    });
    config.conclusao?.filter(t => t.trim()).forEach(t => ch.push(P(t)));
  }

  return await Packer.toBlob(new Document({ sections: [{ children: ch }] }));
}

// ─── Component ───────────────────────────────────────────────────────────────

const LABEL = { bugs: "Bugs", changelog: "Changelog", study: "Estudo" };

export function ExportPanel({ config, activeTemplate }) {
  const [status, setStatus]     = useState(null); // null | "loading" | "done" | "error"
  const [statusMsg, setStatusMsg] = useState("");

  const getHtml = () =>
    activeTemplate === "study"     ? buildStudyHtml(config) :
    activeTemplate === "changelog" ? buildChangelogHtml(config) :
                                     buildBugsHtml(config);

  const run = async (label, fn) => {
    setStatus("loading"); setStatusMsg(label);
    try {
      await fn();
      setStatus("done"); setStatusMsg("Concluído!");
      setTimeout(() => setStatus(null), 2200);
    } catch (e) {
      console.error(e);
      setStatus("error"); setStatusMsg(e.message || "Erro inesperado");
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const handlePdf = () => run("Carregando pdfmake...", async () => {
    const pm = await getPdfMake();
    setStatusMsg("Gerando PDF...");
    const logo = await logoToDataUrl(config.logo);
    const def  =
      activeTemplate === "study"     ? studyPdf(config, logo) :
      activeTemplate === "changelog" ? changelogPdf(config, logo) :
                                       bugsPdf(config, logo);
    pm.createPdf(def).download(`relatorio-${activeTemplate}-v${config.versao || "1"}.pdf`);
  });

  const handleDocx = () => run("Carregando docx.js...", async () => {
    setStatusMsg("Gerando DOCX...");
    const blob = await buildDocxBlob(config, activeTemplate);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${activeTemplate}-v${config.versao || "1"}.docx`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  const handleHtml = () => run("Abrindo...", async () => {
    const w = window.open("", "_blank");
    if (!w) throw new Error("Popup bloqueado — habilite popups para este site.");
    w.document.write(getHtml()); w.document.close();
  });

  const handleDownloadHtml = () => run("Preparando HTML...", async () => {
    const blob = new Blob([getHtml()], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${activeTemplate}-v${config.versao || "1"}.html`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  return (
    <div style={{ padding: "44px 40px", maxWidth: 520, margin: "0 auto" }}>

      {/* Loading overlay */}
      {status === "loading" && (
        <div className="export-overlay">
          <div className="export-spinner" />
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--disp)" }}>{statusMsg}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Aguarde...</div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 84, height: 84, borderRadius: 28, background: "var(--s2)", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--b2)", boxShadow: "0 20px 40px rgba(0,0,0,.3)", marginBottom: 20 }}>
          <Bi name="file-earmark-richtext-fill" size={38} style={{ color: "var(--ac)" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--disp)", marginBottom: 10, letterSpacing: -.4 }}>
          Exportar — {LABEL[activeTemplate] || "Relatório"}
        </h2>
        <p style={{ fontSize: 14, color: "var(--tx3)", lineHeight: 1.7 }}>Escolha o formato de exportação.</p>
        {status === "done"  && <div style={{ marginTop: 12, color: "#22c55e", fontWeight: 700, fontSize: 13 }}>✓ {statusMsg}</div>}
        {status === "error" && <div style={{ marginTop: 12, color: "#ef4444", fontWeight: 700, fontSize: 13 }}>✗ {statusMsg}</div>}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={handlePdf} className="btn-primary full" style={{ padding: "16px 28px", fontSize: 15, background: "linear-gradient(135deg,#6271f5,#8b97ff)" }}>
          <Bi name="file-earmark-pdf-fill" size={17} /> Baixar PDF
        </button>
        <button onClick={handleDocx} className="btn-primary full" style={{ padding: "16px 28px", fontSize: 15, background: "linear-gradient(135deg,#2563EB,#60a5fa)" }}>
          <Bi name="file-earmark-word-fill" size={17} /> Baixar DOCX
        </button>

        <div style={{ height: 1, background: "var(--b2)", margin: "4px 0" }} />

        <button onClick={handleHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
          <Bi name="box-arrow-up-right" size={15} /> Abrir HTML (imprimir como PDF)
        </button>
        <button onClick={handleDownloadHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
          <Bi name="download" size={15} /> Baixar arquivo .html
        </button>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 36, padding: "22px 24px", background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--b2)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Bi name="info-circle-fill" size={12} style={{ color: "var(--ac)" }} /> Dicas
        </div>
        {[
          ["file-earmark-pdf-fill",  "PDF via pdfmake — download direto, pronto para envio"],
          ["file-earmark-word-fill", "DOCX via docx.js — editável no Word / LibreOffice"],
          ["printer-fill",           "HTML em nova aba → Ctrl+P → ative 'Gráficos de segundo plano'"],
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