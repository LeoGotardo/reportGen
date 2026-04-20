import { getT } from "../i18n/index.js";

const esc = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PRINT_BAR = (label, btnColor, formato, versao, printBtn) => `
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">${label}</span>
  <button class="print-btn" style="background:${btnColor}" onclick="window.print()">🖨️ ${printBtn}</button>
  <span class="bar-label">${esc(formato)} · v${esc(versao)}</span>
</div>`;

const BASE_STYLE = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#1e2138;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
.bar-label{font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace}`;

// ─── SHARED ──────────────────────────────────────────────────────────────────
function buildCustomTablesHtml(tabelas, primary, label) {
  if (!tabelas?.length) return "";
  const rows = tabelas.map(t => `
    <div style="margin-bottom:32px;page-break-inside:avoid">
      ${t.titulo?.trim() ? `<div style="font-size:13px;font-weight:700;color:#333;margin-bottom:10px">${esc(t.titulo)}</div>` : ""}
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:${primary}">
          ${t.cabecalhos.map(h => `<th style="color:#fff;padding:9px 14px;text-align:left;font-weight:700">${esc(h)}</th>`).join("")}
        </tr></thead>
        <tbody>
          ${t.linhas.map((row, ri) => `<tr style="background:${ri % 2 ? "#f8f8fb" : "#fff"}">${row.map(cell => `<td style="padding:8px 14px;border-bottom:1px solid #eee;color:#333">${esc(cell) || "—"}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>`).join("");
  return `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${primary};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${label}</div>
  </div>
  ${rows}
</div>`;
}

// ─── BUGS ────────────────────────────────────────────────────────────────────
export function buildBugsHtml(config, tObj) {
  const t = tObj || getT("pt");
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevC = {
    ALTA:  `#${config.cores.altaSev}`,
    MÉDIA: `#${config.cores.mediaSev}`,
    BAIXA: `#${config.cores.baixaSev}`,
  };
  const codeBg   = `#${config.cores.codeBg}`;
  const codeTxt  = `#${config.cores.codeText}`;

  const tableRows = config.problemas.map((p, i) => {
    const c = sevC[p.severity] || sevC.ALTA;
    return `<tr style="background:${i % 2 ? "#f8f8fb" : "#fff"}">
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:700;color:#bbb;font-family:monospace;font-size:11px">${i + 1}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:600">${esc(p.titulo)}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee"><span style="background:${c}18;color:${c};padding:3px 10px;border-radius:12px;font-size:10px;font-weight:800">${esc(p.severity)}</span></td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;color:#444">${esc(p.resolucao)}</td>
    </tr>`;
  }).join("");

  const details = config.problemas.map((p, i) => {
    const c = sevC[p.severity] || sevC.ALTA;
    const d = p.detalhe || {};
    const field = (label, items) => items?.some(v => v.trim())
      ? `<div style="margin-bottom:14px">
           <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${label}</div>
           ${items.filter(v => v.trim()).map(v => `<p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:6px">${esc(v)}</p>`).join("")}
         </div>` : "";
    const code = (label, items) => items?.some(v => v.trim())
      ? `<div style="margin-bottom:14px">
           <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${label}</div>
           ${items.filter(v => v.trim()).map(v => `<pre style="background:${codeBg};color:${codeTxt};padding:12px 16px;border-radius:8px;font-size:11px;font-family:monospace;line-height:1.6;overflow-x:auto;margin-bottom:8px;white-space:pre-wrap;word-break:break-all">${esc(v)}</pre>`).join("")}
         </div>` : "";
    return `
    <div style="margin-bottom:40px;border-left:4px solid ${c};padding-left:20px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:28px;height:28px;border-radius:7px;background:${c};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-size:11px;font-weight:800;color:#fff;font-family:monospace">${i + 1}</span>
        </div>
        <div style="font-size:15px;font-weight:800;color:#1a1a2e;flex:1">${esc(p.titulo)}</div>
        <span style="background:${c}18;color:${c};padding:2px 10px;border-radius:12px;font-size:10px;font-weight:800">${esc(p.severity)}</span>
      </div>
      ${p.resumo?.trim() ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${t.doc_bugs_fieldDesc}</div><p style="font-size:12px;color:#333;line-height:1.7">${esc(p.resumo)}</p></div>` : ""}
      ${field(t.doc_bugs_fieldWhere, d.ondeOcorre)}
      ${code(t.doc_bugs_fieldCode, d.codigoOnde)}
      ${field(t.doc_bugs_fieldWhy, d.porqueProblema)}
      ${field(t.doc_bugs_fieldResText, d.textoResolucao)}
      ${code(t.doc_bugs_fieldResCode, d.codigoResolucao)}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${esc(config.titulo) || t.doc_common_footerTechReport}</title>
<style>${BASE_STYLE}</style></head><body>
${PRINT_BAR(t.doc_common_footerTechReport, "#6271f5", config.formato, config.versao, t.doc_common_printBtn)}
<div style="padding:56px 48px 42px;background:linear-gradient(160deg,${primary}08,transparent);border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:28px"><img src="${config.logo}" style="max-height:100px;max-width:350px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:14px">${t.doc_bugs_overline}</div>
  <div style="font-size:30px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:12px;font-family:Georgia,serif">${esc(config.titulo) || "Título do Relatório"}</div>
  <div style="font-size:15px;color:${secondary};font-weight:500;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid ${secondary}30">${esc(config.subtitulo)}</div>
  <div style="display:flex;gap:28px;font-size:12px;color:#888">
    <span><strong style="color:#555">${t.doc_bugs_fieldAuthor}:</strong> ${esc(config.autor) || "—"}</span>
    <span><strong style="color:#555">${t.doc_bugs_fieldVersion}:</strong> ${esc(config.versao)}</span>
    <span><strong style="color:#555">${t.doc_bugs_fieldFormat}:</strong> ${esc(config.formato)}</span>
  </div>
</div>

${config.resumoExecutivo.some(v => v.trim()) ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${primary};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_bugs_execSummary}</div>
  </div>
  ${config.resumoExecutivo.filter(v => v.trim()).map(v => `<p style="font-size:13px;color:#333;margin-bottom:12px">${esc(v)}</p>`).join("")}
</div>` : ""}

${config.problemas.length ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${sevC.ALTA};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_bugs_problemsTable}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:${primary}">
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:38px">#</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">${t.doc_bugs_thProblem}</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:100px">${t.doc_bugs_thSeverity}</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">${t.doc_bugs_thResolution}</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>` : ""}

${config.problemas.length ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
    <div style="width:5px;height:24px;background:${sevC.ALTA};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_bugs_problemsDetail}</div>
  </div>
  ${details}
</div>` : ""}

${buildCustomTablesHtml(config.tabelas, primary, t.doc_common_tables)}

${config.conclusao.some(v => v.trim()) ? `
<div style="padding:38px 48px 56px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:#${config.cores.baixaSev};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_bugs_conclusion}</div>
  </div>
  ${config.conclusao.filter(v => v.trim()).map(v => `<p style="font-size:13px;color:#333;margin-bottom:12px">${esc(v)}</p>`).join("")}
</div>` : ""}

<div style="padding:24px 48px;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-between;color:#999;font-size:11px">
  <span>${t.doc_common_footerTechReport} — ${esc(config.titulo) || "Documento"}</span>
  ${config.logo ? `<img src="${config.logo}" style="max-height:32px;max-width:100px;object-fit:contain;opacity:0.6"/>` : ""}
</div>
</body></html>`;
}

// ─── STUDY ───────────────────────────────────────────────────────────────────
export function buildStudyHtml(config, tObj) {
  const t = tObj || getT("pt");
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = {
    CONCEITO: `#${config.cores.concept}`,
    PRÁTICA:  `#${config.cores.practice}`,
    RESUMO:   `#${config.cores.summary}`,
  };
  const codeBg  = `#${config.cores.codeBg}`;
  const codeTxt = `#${config.cores.codeText}`;

  const tableRows = config.topicos.map((p, i) => {
    const c = typeColors[p.tipo] || typeColors.CONCEITO;
    return `<tr style="background:${i % 2 ? "#f8f8fb" : "#fff"}">
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:700;color:#bbb;font-family:monospace;font-size:11px">${i + 1}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:600">${esc(p.titulo)}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee"><span style="background:${c}18;color:${c};padding:3px 10px;border-radius:12px;font-size:10px;font-weight:800">${esc(p.tipo)}</span></td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;color:#444">${esc(p.resumo)}</td>
    </tr>`;
  }).join("");

  const details = config.topicos.map((p, i) => {
    const c = typeColors[p.tipo] || typeColors.CONCEITO;
    const d = p.detalhe || {};
    return `
    <div style="margin-bottom:40px;border-left:4px solid ${c};padding-left:20px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:28px;height:28px;border-radius:7px;background:${c};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-size:11px;font-weight:800;color:#fff;font-family:monospace">${i + 1}</span>
        </div>
        <div style="font-size:15px;font-weight:800;color:#1a1a2e;flex:1">${esc(p.titulo)}</div>
        <span style="background:${c}18;color:${c};padding:2px 10px;border-radius:12px;font-size:10px;font-weight:800">${esc(p.tipo)}</span>
      </div>
      ${d.explicacao?.some(v => v.trim()) ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${t.doc_study_fieldExplanation}</div>${d.explicacao.filter(v => v.trim()).map(v => `<p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:6px">${esc(v)}</p>`).join("")}</div>` : ""}
      ${d.exemplos?.some(v => v.trim()) ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${t.doc_study_fieldExamples}</div>${d.exemplos.filter(v => v.trim()).map(v => `<p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:6px">${esc(v)}</p>`).join("")}</div>` : ""}
      ${d.codigo?.some(v => v.trim()) ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${t.doc_study_fieldCode}</div>${d.codigo.filter(v => v.trim()).map(v => `<pre style="background:${codeBg};color:${codeTxt};padding:12px 16px;border-radius:8px;font-size:11px;font-family:monospace;line-height:1.6;overflow-x:auto;margin-bottom:8px;white-space:pre-wrap;word-break:break-all">${esc(v)}</pre>`).join("")}</div>` : ""}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${esc(config.titulo) || t.doc_common_footerStudy}</title>
<style>${BASE_STYLE}</style></head><body>
${PRINT_BAR(t.doc_common_footerStudy, "#f59e0b", config.formato, config.versao, t.doc_common_printBtn)}
<div style="padding:56px 48px 42px;background:linear-gradient(160deg,${primary}08,transparent);border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:28px"><img src="${config.logo}" style="max-height:100px;max-width:350px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:14px">${t.doc_study_overline}</div>
  <div style="font-size:30px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:12px;font-family:Georgia,serif">${esc(config.titulo) || "Título do Estudo"}</div>
  <div style="font-size:15px;color:${secondary};font-weight:500;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid ${secondary}30">${esc(config.subtitulo) || "Tema ou assunto estudado"}</div>
  <div style="display:flex;gap:28px;font-size:12px;color:#888">
    <span><strong style="color:#555">${t.doc_study_fieldStudent}:</strong> ${esc(config.autor) || "—"}</span>
    <span><strong style="color:#555">${t.doc_study_fieldVersion}:</strong> ${esc(config.versao)}</span>
  </div>
</div>

${config.introducao.some(v => v.trim()) ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${primary};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_study_intro}</div>
  </div>
  ${config.introducao.filter(v => v.trim()).map(v => `<p style="font-size:13px;color:#333;margin-bottom:12px">${esc(v)}</p>`).join("")}
</div>` : ""}

${config.topicos.length ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${typeColors.CONCEITO};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_study_topicsTable}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:${primary}">
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:38px">#</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">${t.doc_study_thTopic}</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:100px">${t.doc_study_thType}</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">${t.doc_study_thSummary}</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>` : ""}

${config.topicos.length ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
    <div style="width:5px;height:24px;background:${typeColors.PRÁTICA};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_study_topicsDetail}</div>
  </div>
  ${details}
</div>` : ""}

${buildCustomTablesHtml(config.tabelas, primary, t.doc_common_tables)}

${config.conclusao.some(v => v.trim()) ? `
<div style="padding:38px 48px 56px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${typeColors.RESUMO};border-radius:3px"></div>
    <div style="font-size:18px;font-weight:800;color:${primary}">${t.doc_study_conclusion}</div>
  </div>
  ${config.conclusao.filter(v => v.trim()).map(v => `<p style="font-size:13px;color:#333;margin-bottom:12px">${esc(v)}</p>`).join("")}
</div>` : ""}

<div style="padding:24px 48px;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-between;color:#999;font-size:11px">
  <span>${t.doc_common_footerStudy} — ${esc(config.titulo) || "Documento"}</span>
  ${config.logo ? `<img src="${config.logo}" style="max-height:32px;max-width:100px;object-fit:contain;opacity:0.6"/>` : ""}
</div>
</body></html>`;
}

// ─── CHANGELOG ───────────────────────────────────────────────────────────────
export function buildChangelogHtml(config, tObj) {
  const t = tObj || getT("pt");
  const primary  = `#${config.cores.primaria}`;
  const typeColors = {
    feat:     `#${config.cores.feat}`,
    fix:      `#${config.cores.fix}`,
    breaking: `#${config.cores.breaking}`,
    refactor: `#${config.cores.refactor}`,
    perf:     `#${config.cores.perf}`,
    style:    `#${config.cores.style || "DB2777"}`,
    chore:    `#${config.cores.chore}`,
  };
  const LABELS = { feat: "Feature", fix: "Fix", breaking: "Breaking", refactor: "Refactor", perf: "Perf", style: "Style", chore: "Chore" };
  const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];

  const grouped = {};
  config.mudancas.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

  const tableRows = config.mudancas.map((m, i) => {
    const c = typeColors[m.tipo] || typeColors.feat;
    const label = LABELS[m.tipo] || m.tipo;
    return `<tr style="background:${i % 2 ? "#f8f9fb" : "#fff"}">
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700;color:#ccc;font-family:monospace">${i + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee"><span style="background:${c}18;color:${c};padding:2px 9px;border-radius:12px;font-size:10px;font-weight:800">${label}</span></td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;font-size:12px">${esc(m.titulo)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:10px;color:#666">${esc(m.arquivo)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:11px;color:#444">${esc(m.impacto)}</td>
    </tr>`;
  }).join("");

  const detailBlocks = typeOrder.filter(tp => grouped[tp]?.length).map(tipo => {
    const c = typeColors[tipo] || "#888";
    const label = LABELS[tipo] || tipo;
    return `
    <div style="margin-bottom:28px">
      <div style="margin-bottom:14px">
        <span style="background:${c}18;color:${c};padding:4px 14px;border-radius:20px;font-size:11px;font-weight:800;border:1px solid ${c}40">
          ${label} (${grouped[tipo].length})
        </span>
      </div>
      ${grouped[tipo].map(m => `
      <div style="margin-bottom:20px;border-left:3px solid ${c};padding-left:18px">
        <div style="font-size:14px;font-weight:800;color:#1a1a2e;margin-bottom:6px">${esc(m.titulo)}</div>
        ${m.arquivo ? `<div style="font-family:monospace;font-size:10px;color:#666;background:#f5f5f5;padding:3px 10px;border-radius:5px;display:inline-block;margin-bottom:8px">${esc(m.arquivo)}</div>` : ""}
        ${m.descricao?.trim() ? `<p style="font-size:12px;color:#333;margin-bottom:8px;line-height:1.7">${esc(m.descricao)}</p>` : ""}
        ${m.motivacao?.trim() ? `<div style="margin-bottom:8px"><div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:4px">${t.doc_changelog_fieldMotiv}</div><p style="font-size:12px;color:#555;line-height:1.6">${esc(m.motivacao)}</p></div>` : ""}
        ${m.impacto?.trim() ? `<div style="margin-bottom:8px"><div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:4px">${t.doc_changelog_fieldImpact}</div><p style="font-size:12px;color:#555;line-height:1.6">${esc(m.impacto)}</p></div>` : ""}
        ${(m.codigoAntes?.trim() || m.codigoDepois?.trim()) ? `
          <div style="margin-top:10px">
            <div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">Diff</div>
            <div style="background:#0d1117;border-radius:8px;overflow:hidden;font-size:11px;font-family:monospace">
              ${m.codigoAntes?.trim() ? m.codigoAntes.split("\n").map(line => `<div style="padding:2px 14px 2px 10px;background:rgba(220,38,38,0.12);border-left:3px solid #DC2626;color:#fca5a5;white-space:pre-wrap;word-break:break-all">- ${esc(line)}</div>`).join("") : ""}
              ${m.codigoDepois?.trim() ? m.codigoDepois.split("\n").map(line => `<div style="padding:2px 14px 2px 10px;background:rgba(16,185,129,0.12);border-left:3px solid #10B981;color:#86efac;white-space:pre-wrap;word-break:break-all">+ ${esc(line)}</div>`).join("") : ""}
            </div>
          </div>` : ""}
        ${m.notas?.trim() ? `<div style="margin-top:8px;padding:8px 12px;background:#fffbeb;border-left:3px solid #D97706;border-radius:0 6px 6px 0"><span style="font-size:10px;font-weight:700;color:#D97706">${t.doc_docx_notePrefix}</span><span style="font-size:11px;color:#555">${esc(m.notas)}</span></div>` : ""}
      </div>`).join("")}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${esc(config.titulo) || t.doc_common_footerChangelog}</title>
<style>${BASE_STYLE}</style></head><body>
${PRINT_BAR(t.doc_common_footerChangelog, "#10b981", config.formato, config.versao, t.doc_common_printBtn)}
<div style="padding:48px 48px 36px;border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:24px"><img src="${config.logo}" style="max-height:80px;max-width:280px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:12px">${t.doc_changelog_overline}</div>
  <div style="font-size:28px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:10px;font-family:Georgia,serif">${esc(config.titulo) || "Changelog do Projeto"}</div>
  <div style="font-size:14px;color:#${config.cores.secundaria};font-weight:600;padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid #${config.cores.secundaria}30">${esc(config.subtitulo) || "Registro técnico de alterações"}</div>
  <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:12px;color:#888">
    ${config.projeto     ? `<span><strong style="color:#555">${t.doc_changelog_fieldProject}:</strong> ${esc(config.projeto)}</span>` : ""}
    ${config.autor       ? `<span><strong style="color:#555">${t.doc_changelog_fieldAuthor}:</strong> ${esc(config.autor)}</span>` : ""}
    <span><strong style="color:#555">${t.doc_changelog_fieldVersion}:</strong> ${esc(config.versao)}</span>
    ${config.dataInicio  ? `<span><strong style="color:#555">${t.doc_changelog_fieldPeriod}:</strong> ${esc(config.dataInicio)}${config.dataFim ? ` → ${esc(config.dataFim)}` : ""}</span>` : ""}
    ${config.repositorio ? `<span><strong style="color:#555">${t.doc_changelog_fieldRepo}:</strong> ${esc(config.repositorio)}</span>` : ""}
  </div>
</div>

${config.mudancas.length ? `
<div style="padding:28px 48px 0;display:flex;gap:10px;flex-wrap:wrap">
  ${typeOrder.filter(tp => grouped[tp]?.length).map(tp => {
    const c = typeColors[tp]; const label = LABELS[tp];
    return `<span style="padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:${c}18;color:${c};border:1px solid ${c}40">${grouped[tp].length} ${label}</span>`;
  }).join("")}
</div>` : ""}

${config.descricao.some(v => v.trim()) ? `
<div style="padding:32px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:5px;height:24px;background:${primary};border-radius:3px"></div>
    <div style="font-size:16px;font-weight:800;color:${primary}">${t.doc_changelog_overview}</div>
  </div>
  ${config.descricao.filter(v => v.trim()).map(v => `<p style="font-size:12px;color:#333;margin-bottom:10px">${esc(v)}</p>`).join("")}
</div>` : ""}

${config.mudancas.length ? `
<div style="padding:32px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:5px;height:24px;background:#${config.cores.secundaria};border-radius:3px"></div>
    <div style="font-size:16px;font-weight:800;color:${primary}">${t.doc_changelog_table}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:11px">
    <thead><tr style="background:${primary}">
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700;width:32px">#</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">${t.doc_changelog_thType}</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">${t.doc_changelog_thChange}</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">${t.doc_changelog_thFile}</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">${t.doc_changelog_thImpact}</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>
<div style="padding:32px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <div style="width:5px;height:24px;background:#${config.cores.secundaria};border-radius:3px"></div>
    <div style="font-size:16px;font-weight:800;color:${primary}">${t.doc_changelog_detail}</div>
  </div>
  ${detailBlocks}
</div>` : ""}

${buildCustomTablesHtml(config.tabelas, primary, t.doc_common_tables)}

${config.resumo.some(v => v.trim()) ? `
<div style="padding:32px 48px 48px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:5px;height:24px;background:#${config.cores.chore};border-radius:3px"></div>
    <div style="font-size:16px;font-weight:800;color:${primary}">${t.doc_changelog_summary}</div>
  </div>
  ${config.resumo.filter(v => v.trim()).map(v => `<p style="font-size:12px;color:#333;margin-bottom:10px">${esc(v)}</p>`).join("")}
</div>` : ""}

<div style="padding:20px 48px;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-between;color:#999;font-size:11px">
  <span>${t.doc_common_footerChangelog} — ${esc(config.titulo) || "Documento"} · v${esc(config.versao)}</span>
  ${config.logo ? `<img src="${config.logo}" style="max-height:32px;max-width:100px;object-fit:contain;opacity:0.6"/>` : ""}
</div>
</body></html>`;
}
