const escHtml = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

export function buildBugsHtml(config) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevColors = { ALTA: `#${config.cores.altaSev}`, MÉDIA: `#${config.cores.mediaSev}`, BAIXA: `#${config.cores.baixaSev}` };

  const problemRows = config.problemas.map((p, i) => {
    const c = sevColors[p.severity] || sevColors.ALTA;
    return `<tr style="background:${i%2?"#f8f8fb":"#fff"}">
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:700;color:#bbb;font-family:monospace">${i+1}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:600">${escHtml(p.titulo)}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee"><span style="background:${c}22;color:${c};padding:3px 10px;border-radius:12px;font-size:10px;font-weight:800">${p.severity}</span></td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;color:#444">${escHtml(p.resolucao)}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${escHtml(config.titulo)||"Relatório Técnico"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#1e2138;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;background:#6271f5;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
.bar-label{font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace}
</style></head><body>
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">Relatório de Bugs</span>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <span class="bar-label">${escHtml(config.formato)} · v${escHtml(config.versao)}</span>
</div>
<div style="padding:56px 48px 42px;background:linear-gradient(160deg,${primary}08,transparent);border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:28px"><img src="${config.logo}" style="max-height:100px;max-width:350px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:14px">RELATÓRIO DE BUGS — ANÁLISE TÉCNICA</div>
  <div style="font-size:30px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:12px;font-family:Georgia,serif">${escHtml(config.titulo)||"Título do Relatório"}</div>
  <div style="font-size:15px;color:${secondary};font-weight:500;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid ${secondary}30">${escHtml(config.subtitulo)||""}</div>
  <div style="display:flex;gap:28px;font-size:12px;color:#888">
    <span><strong style="color:#555">Autor:</strong> ${escHtml(config.autor)||"—"}</span>
    <span><strong style="color:#555">Versão:</strong> ${escHtml(config.versao)}</span>
  </div>
</div>
${config.problemas.length ? `
<div style="padding:38px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div style="width:5px;height:24px;background:${sevColors.ALTA};border-radius:3px;display:inline-block"></div>
    <span style="font-size:18px;font-weight:800;color:${primary}">Tabela de Problemas</span>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:${primary}">
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:38px">#</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">Problema</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:100px">Severidade</th>
      <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">Resolução Sugerida</th>
    </tr></thead>
    <tbody>${problemRows}</tbody>
  </table>
</div>` : ""}
<div style="padding:48px">
  ${config.resumoExecutivo.some(t => t.trim()) ? `
    <div style="margin-bottom:42px">
      <div style="font-size:18px;font-weight:800;color:${primary};margin-bottom:16px;border-left:5px solid ${secondary};padding-left:15px">Resumo Executivo</div>
      ${config.resumoExecutivo.filter(t => t.trim()).map(t => `<p style="margin-bottom:12px;color:#333">${escHtml(t)}</p>`).join("")}
    </div>` : ""}
  ${config.problemas.map((p, i) => {
    const c = sevColors[p.severity] || sevColors.ALTA;
    return `
    <div style="margin-bottom:56px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;border-bottom:2px solid #eee;padding-bottom:10px">
        <div style="width:32px;height:32px;background:${primary};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${i+1}</div>
        <div style="font-size:20px;font-weight:800;color:${primary};flex:1">${escHtml(p.titulo)}</div>
        <span style="background:${c};color:#fff;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:800">${p.severity}</span>
      </div>
      <div style="background:#f9f9fb;border-radius:12px;padding:24px;border:1px solid #eee;margin-bottom:24px">
        <div style="font-size:11px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Resumo do Problema</div>
        <div style="font-size:14px;color:#444;line-height:1.7">${escHtml(p.resumo)}</div>
      </div>
      <div style="margin-bottom:28px">
        <div style="font-size:13px;font-weight:800;color:${primary};margin-bottom:14px;display:flex;align-items:center;gap:8px">🔍 Detalhamento Técnico</div>
        ${p.detalhe.ondeOcorre.some(t => t.trim()) ? `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:5px">Onde ocorre</div>${p.detalhe.ondeOcorre.filter(t => t.trim()).map(t => `<div style="font-size:12px;color:#555;padding:4px 0">• ${escHtml(t)}</div>`).join("")}</div>` : ""}
        ${p.detalhe.codigoOnde.some(t => t.trim()) ? `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:5px">Trecho de código</div>${p.detalhe.codigoOnde.filter(t => t.trim()).map(t => `<pre style="background:#1e1e1e;color:#d4d4d4;padding:14px;border-radius:8px;font-size:11px;font-family:monospace;overflow-x:auto;margin-top:6px">${escHtml(t)}</pre>`).join("")}</div>` : ""}
        ${p.detalhe.porqueProblema.some(t => t.trim()) ? `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:5px">Impacto e Risco</div>${p.detalhe.porqueProblema.filter(t => t.trim()).map(t => `<div style="font-size:12px;color:#d00;background:#fff5f5;padding:8px 12px;border-radius:6px;margin-top:4px;border-left:3px solid #d00">${escHtml(t)}</div>`).join("")}</div>` : ""}
      </div>
      <div style="background:${primary}08;border-radius:12px;padding:24px;border:1px solid ${primary}15">
        <div style="font-size:13px;font-weight:800;color:${primary};margin-bottom:14px;display:flex;align-items:center;gap:8px">✅ Resolução Recomendada</div>
        ${p.detalhe.textoResolucao.some(t => t.trim()) ? `<div style="margin-bottom:16px">${p.detalhe.textoResolucao.filter(t => t.trim()).map(t => `<p style="font-size:12px;color:#444;margin-bottom:8px">${escHtml(t)}</p>`).join("")}</div>` : ""}
        ${p.detalhe.codigoResolucao.some(t => t.trim()) ? `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:5px">Exemplo de Correção</div>${p.detalhe.codigoResolucao.filter(t => t.trim()).map(t => `<pre style="background:#1e1e1e;color:#d4d4d4;padding:14px;border-radius:8px;font-size:11px;font-family:monospace;overflow-x:auto;margin-top:6px">${escHtml(t)}</pre>`).join("")}</div>` : ""}
      </div>
    </div>`;
  }).join("")}
  ${config.conclusao.some(t => t.trim()) ? `
    <div style="margin-top:64px;padding-top:32px;border-top:2px solid #eee">
      <div style="font-size:18px;font-weight:800;color:${primary};margin-bottom:16px">Conclusão</div>
      ${config.conclusao.filter(t => t.trim()).map(t => `<p style="margin-bottom:12px;color:#333">${escHtml(t)}</p>`).join("")}
    </div>` : ""}
</div>
<div style="padding:42px 48px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;color:#aaa;font-size:11px">
  <span>Gerado por ReportGen — Relatório Técnico de Segurança</span>
  ${config.logo ? `<img src="${config.logo}" style="max-height:30px;opacity:0.5"/>` : ""}
</div>
</body></html>`;
}

export function buildStudyHtml(config) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = { CONCEITO: `#${config.cores.concept}`, PRÁTICA: `#${config.cores.practice}`, RESUMO: `#${config.cores.summary}` };
  const escHtml = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${escHtml(config.titulo)||"Relatório de Estudo"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#1e2138;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;background:#f59e0b;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
.bar-label{font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace}
</style></head><body>
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">Relatório de Estudo</span>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <span class="bar-label">${escHtml(config.formato)} · v${escHtml(config.versao)}</span>
</div>
<div style="padding:64px 48px;background:${primary};color:#fff">
  ${config.logo ? `<div style="margin-bottom:32px"><img src="${config.logo}" style="max-height:80px;max-width:300px;object-fit:contain;filter:brightness(0) invert(1)"/></div>` : ""}
  <div style="font-size:11px;font-weight:700;letter-spacing:4px;color:${secondary};text-transform:uppercase;margin-bottom:16px">DOCUMENTAÇÃO DE APRENDIZADO</div>
  <div style="font-size:36px;font-weight:900;line-height:1.1;margin-bottom:16px;font-family:Georgia,serif">${escHtml(config.titulo)||"Título do Estudo"}</div>
  <div style="font-size:18px;opacity:0.9;font-weight:400;max-width:700px;margin-bottom:32px">${escHtml(config.subtitulo)||""}</div>
  <div style="display:flex;gap:32px;font-size:13px;opacity:0.8">
    <span><strong>Autor:</strong> ${escHtml(config.autor)||"—"}</span>
    <span><strong>Versão:</strong> ${escHtml(config.versao)}</span>
  </div>
</div>
<div style="padding:48px">
  ${config.introducao.some(t => t.trim()) ? `
    <div style="margin-bottom:48px">
      <div style="font-size:20px;font-weight:800;color:${primary};margin-bottom:18px;display:flex;align-items:center;gap:10px">
        <div style="width:12px;height:12px;background:${secondary};border-radius:3px"></div> Introdução
      </div>
      ${config.introducao.filter(t => t.trim()).map(t => `<p style="margin-bottom:14px;color:#333;font-size:14px;line-height:1.8">${escHtml(t)}</p>`).join("")}
    </div>` : ""}
  ${config.topicos.map((p, i) => {
    const c = typeColors[p.tipo] || typeColors.CONCEITO;
    return `
    <div style="margin-bottom:64px;page-break-inside:avoid">
      <div style="display:flex;align-items:flex-start;gap:18px;margin-bottom:24px">
        <div style="width:40px;height:40px;background:${c};color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0">${i+1}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
            <span style="font-size:10px;font-weight:800;color:${c};background:${c}15;padding:2px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;border:1px solid ${c}30">${p.tipo}</span>
          </div>
          <div style="font-size:24px;font-weight:800;color:${primary}">${escHtml(p.titulo)}</div>
        </div>
      </div>
      <div style="font-size:15px;color:#555;font-style:italic;margin-bottom:28px;padding-left:58px;line-height:1.6">${escHtml(p.resumo)}</div>
      <div style="padding-left:58px">
        ${p.detalhe.explicacao.some(t => t.trim()) ? `<div style="margin-bottom:24px">${p.detalhe.explicacao.filter(t => t.trim()).map(t => `<p style="font-size:14px;color:#333;margin-bottom:12px;line-height:1.8">${escHtml(t)}</p>`).join("")}</div>` : ""}
        ${p.detalhe.exemplos.some(t => t.trim()) ? `
          <div style="background:#f8f9fa;border-radius:12px;padding:20px;border-left:4px solid ${c};margin-bottom:24px">
            <div style="font-size:11px;font-weight:800;color:${c};text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Exemplos / Casos de Uso</div>
            ${p.detalhe.exemplos.filter(t => t.trim()).map(t => `<p style="font-size:13px;color:#444;margin-bottom:8px">• ${escHtml(t)}</p>`).join("")}
          </div>` : ""}
        ${p.detalhe.codigo.some(t => t.trim()) ? `
          <div style="margin-bottom:24px">
            <div style="font-size:11px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Código de Exemplo</div>
            ${p.detalhe.codigo.filter(t => t.trim()).map(t => `<pre style="background:#1e1e1e;color:#d4d4d4;padding:18px;border-radius:10px;font-size:12px;font-family:monospace;overflow-x:auto;line-height:1.6">${escHtml(t)}</pre>`).join("")}
          </div>` : ""}
      </div>
    </div>`;
  }).join("")}
  ${config.conclusao.some(t => t.trim()) ? `
    <div style="margin-top:48px;padding:32px;background:#f0f4f8;border-radius:16px">
      <div style="font-size:20px;font-weight:800;color:${primary};margin-bottom:16px">Conclusão e Próximos Passos</div>
      ${config.conclusao.filter(t => t.trim()).map(t => `<p style="margin-bottom:12px;color:#333;line-height:1.8">${escHtml(t)}</p>`).join("")}
    </div>` : ""}
</div>
<div style="padding:48px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;color:#aaa;font-size:12px">
  <span>Gerado por ReportGen — Documentação de Estudos</span>
  ${config.logo ? `<img src="${config.logo}" style="max-height:35px;opacity:0.4"/>` : ""}
</div>
</body></html>`;
}

export function buildChangelogHtml(config) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const escHtml = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const types = {
    feat: { label: "Feature", color: "#2563EB" },
    fix: { label: "Fix", color: "#D97706" },
    breaking: { label: "Breaking", color: "#DC2626" },
    refactor: { label: "Refactor", color: "#7C3AED" },
    perf: { label: "Perf", color: "#0891B2" },
    style: { label: "Style", color: "#DB2777" },
    chore: { label: "Chore", color: "#64748B" }
  };

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${escHtml(config.titulo)||"Changelog"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#0f172a;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;background:#10b981;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
.bar-label{font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace}
.tag{display:inline-flex;align-items:center;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:32px;page-break-inside:avoid}
.code-block{background:#0d1117;color:#e6edf3;padding:16px;border-radius:8px;font-family:monospace;font-size:12px;overflow-x:auto;margin-top:12px;white-space:pre-wrap}
.diff-del{background:rgba(220,38,38,0.1);border-left:3px solid #dc2626;padding:12px;margin-bottom:8px}
.diff-add{background:rgba(16,185,129,0.1);border-left:3px solid #10b981;padding:12px}
</style></head><body>
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">Changelog Report</span>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <span class="bar-label">${escHtml(config.formato)} · v${escHtml(config.versao)}</span>
</div>
<div style="padding:60px 48px;background:linear-gradient(135deg,${primary},${secondary});color:#fff">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;opacity:0.8;margin-bottom:12px">Release Notes</div>
      <div style="font-size:36px;font-weight:900;margin-bottom:8px">${escHtml(config.titulo)||"Changelog"}</div>
      <div style="font-size:18px;opacity:0.9;margin-bottom:24px">${escHtml(config.subtitulo)||""}</div>
    </div>
    ${config.logo ? `<img src="${config.logo}" style="max-height:70px;max-width:200px;object-fit:contain;filter:brightness(0) invert(1)"/>` : ""}
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.2)">
    <div><div style="font-size:11px;opacity:0.7;text-transform:uppercase">Versão</div><div style="font-weight:700">v${escHtml(config.versao)}</div></div>
    <div><div style="font-size:11px;opacity:0.7;text-transform:uppercase">Projeto</div><div style="font-weight:700">${escHtml(config.projeto)||"—"}</div></div>
    <div><div style="font-size:11px;opacity:0.7;text-transform:uppercase">Data</div><div style="font-weight:700">${escHtml(config.dataInicio)} — ${escHtml(config.dataFim)}</div></div>
    <div><div style="font-size:11px;opacity:0.7;text-transform:uppercase">Autor</div><div style="font-weight:700">${escHtml(config.autor)||"—"}</div></div>
  </div>
</div>
<div style="padding:48px">
  ${config.descricao.some(t => t.trim()) ? `
    <div style="margin-bottom:48px">
      <div style="font-size:20px;font-weight:800;color:${primary};margin-bottom:16px">Visão Geral</div>
      ${config.descricao.filter(t => t.trim()).map(t => `<p style="margin-bottom:12px;color:#4b5563;font-size:15px">${escHtml(t)}</p>`).join("")}
    </div>` : ""}
  
  <div style="font-size:20px;font-weight:800;color:${primary};margin-bottom:24px">Mudanças Detalhadas</div>
  ${config.mudancas.map((m, i) => {
    const t = types[m.tipo] || types.feat;
    return `
    <div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span class="tag" style="background:${t.color}15;color:${t.color};border:1px solid ${t.color}30">${t.label}</span>
        <span style="font-size:18px;font-weight:700;color:#111827">${escHtml(m.titulo)}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px">
        <div>
          <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">Arquivo / Módulo</div>
          <div style="font-family:monospace;font-size:13px;color:${primary}">${escHtml(m.arquivo)||"—"}</div>
        </div>
      </div>
      <div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:8px">Descrição e Impacto</div>
        <p style="color:#4b5563;margin-bottom:12px">${escHtml(m.descricao)}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:13px">
          ${m.motivacao ? `<div><strong style="color:#111827">Motivação:</strong> ${escHtml(m.motivacao)}</div>` : ""}
          ${m.impacto ? `<div><strong style="color:#111827">Impacto:</strong> ${escHtml(m.impacto)}</div>` : ""}
        </div>
      </div>
      ${(m.codigoAntes || m.codigoDepois) ? `
        <div style="margin-top:20px">
          <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:8px">Alterações de Código</div>
          ${m.codigoAntes ? `<div class="diff-del"><div style="font-size:10px;font-weight:800;color:#dc2626;margin-bottom:4px">ANTES</div><pre style="font-family:monospace;font-size:12px;margin:0">${escHtml(m.codigoAntes)}</pre></div>` : ""}
          ${m.codigoDepois ? `<div class="diff-add"><div style="font-size:10px;font-weight:800;color:#10b981;margin-bottom:4px">DEPOIS</div><pre style="font-family:monospace;font-size:12px;margin:0">${escHtml(m.codigoDepois)}</pre></div>` : ""}
        </div>` : ""}
      ${m.notas ? `<div style="margin-top:16px;padding-top:16px;border-top:1px dashed #e5e7eb;font-size:13px;color:#6b7280"><strong>Nota:</strong> ${escHtml(m.notas)}</div>` : ""}
    </div>`;
  }).join("")}

  ${config.resumo.some(t => t.trim()) ? `
    <div style="margin-top:48px;padding:32px;background:#f9fafb;border-radius:16px;border:1px solid #f3f4f6">
      <div style="font-size:20px;font-weight:800;color:${primary};margin-bottom:16px">Resumo Final</div>
      ${config.resumo.filter(t => t.trim()).map(t => `<p style="margin-bottom:12px;color:#4b5563;line-height:1.7">${escHtml(t)}</p>`).join("")}
    </div>` : ""}
</div>
<div style="padding:48px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;color:#9ca3af;font-size:12px">
  <div>Gerado em ${new Date().toLocaleDateString('pt-BR')} por ReportGen</div>
  ${config.repositorio ? `<div style="font-family:monospace">${escHtml(config.repositorio)}</div>` : ""}
</div>
</body></html>`;
}
