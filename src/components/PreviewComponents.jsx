import React from "react";
import { CHANGE_TYPES } from "../constants/templates";

// Fix #5: BugsPreview — restored to original structure (table + separate detail blocks)
export function BugsPreview({ config }) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevColors = {
    ALTA:  `#${config.cores.altaSev}`,
    MÉDIA: `#${config.cores.mediaSev}`,
    BAIXA: `#${config.cores.baixaSev}`,
  };

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      {/* Header */}
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>RELATÓRIO DE BUGS — ANÁLISE TÉCNICA</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Relatório"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || ""}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>Autor:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>Versão:</strong> {config.versao}</span>
          <span><strong style={{ color: "#555" }}>Formato:</strong> {config.formato}</span>
        </div>
      </div>

      {/* Resumo Executivo */}
      {config.resumoExecutivo.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Resumo Executivo</div>
          </div>
          {config.resumoExecutivo.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}

      {/* Tabela */}
      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Tabela de Problemas</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", "Problema", "Severidade", "Resolução"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700, width: i === 0 ? 38 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.problemas.map((p, i) => {
                const c = sevColors[p.severity] || sevColors.ALTA;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 700, color: "#bbb", fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 600 }}>{p.titulo || "—"}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee" }}>
                      <span style={{ background: `${c}18`, color: c, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>{p.severity}</span>
                    </td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", color: "#444" }}>{p.resolucao || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalhamento */}
      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Detalhamento dos Problemas</div>
          </div>
          {config.problemas.map((p, i) => {
            const c = sevColors[p.severity] || sevColors.ALTA;
            const d = p.detalhe || {};
            return (
              <div key={i} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || "Sem título"}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.severity}</span>
                </div>
                {p.resumo?.trim() && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Descrição</div><p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{p.resumo}</p></div>}
                {d.ondeOcorre?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Onde ocorre</div>{d.ondeOcorre.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.codigoOnde?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código onde ocorre</div>{d.codigoOnde.filter(t => t.trim()).map((t, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>)}</div>}
                {d.porqueProblema?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Por que é um problema</div>{d.porqueProblema.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.textoResolucao?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Explicação de resolução</div>{d.textoResolucao.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.codigoResolucao?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código de resolução</div>{d.codigoResolucao.filter(t => t.trim()).map((t, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>)}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Conclusão */}
      {config.conclusao.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.baixaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Conclusão</div>
          </div>
          {config.conclusao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}

      <div style={{ padding: "24px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>Relatório Técnico — {config.titulo || "Documento"}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}

// Fix #6: StudyPreview — restored to original white-header gradient style
export function StudyPreview({ config }) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = {
    CONCEITO: `#${config.cores.concept}`,
    PRÁTICA:  `#${config.cores.practice}`,
    RESUMO:   `#${config.cores.summary}`,
  };

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>RELATÓRIO DE ESTUDO — APRENDIZADO TÉCNICO</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Estudo"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || "Tema ou assunto estudado"}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>Estudante:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>Versão:</strong> {config.versao}</span>
          <span><strong style={{ color: "#555" }}>Data:</strong> {new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      {config.introducao.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Introdução e Objetivos</div>
          </div>
          {config.introducao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}

      {config.topicos.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: typeColors.CONCEITO, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Resumo dos Tópicos</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", "Tópico", "Tipo", "Resumo"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700, width: i === 0 ? 38 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.topicos.map((p, i) => {
                const c = typeColors[p.tipo] || typeColors.CONCEITO;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 700, color: "#bbb", fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 600 }}>{p.titulo || "—"}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee" }}>
                      <span style={{ background: `${c}18`, color: c, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>{p.tipo}</span>
                    </td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", color: "#444" }}>{p.resumo || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {config.topicos.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: typeColors.PRÁTICA, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Desenvolvimento do Estudo</div>
          </div>
          {config.topicos.map((p, i) => {
            const c = typeColors[p.tipo] || typeColors.CONCEITO;
            const d = p.detalhe || {};
            return (
              <div key={i} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || "Sem título"}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.tipo}</span>
                </div>
                {d.explicacao?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Explicação</div>{d.explicacao.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.exemplos?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Exemplos / Casos de uso</div>{d.exemplos.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.codigo?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código de Exemplo</div>{d.codigo.filter(t => t.trim()).map((t, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>)}</div>}
              </div>
            );
          })}
        </div>
      )}

      {config.conclusao.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: typeColors.RESUMO, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Conclusão e Próximos Passos</div>
          </div>
          {config.conclusao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}

      <div style={{ padding: "24px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>Relatório de Estudo — {config.titulo || "Documento"}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}

export function ChangelogPreview({ config }) {
  const primary = `#${config.cores.primaria}`;
  const typeColors = {
    feat:     `#${config.cores.feat}`,
    fix:      `#${config.cores.fix}`,
    breaking: `#${config.cores.breaking}`,
    refactor: `#${config.cores.refactor}`,
    perf:     `#${config.cores.perf}`,
    style:    `#${config.cores.style || "DB2777"}`,
    chore:    `#${config.cores.chore}`,
  };

  const grouped = {};
  config.mudancas.forEach(m => {
    if (!grouped[m.tipo]) grouped[m.tipo] = [];
    grouped[m.tipo].push(m);
  });
  const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div style={{ padding: "48px 48px 36px", borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 24 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 80, maxWidth: 280, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>CHANGELOG — REGISTRO DE MUDANÇAS</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 10, fontFamily: "Georgia, serif" }}>{config.titulo || "Changelog do Projeto"}</div>
        <div style={{ fontSize: 14, color: `#${config.cores.secundaria}`, fontWeight: 600, paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid #${config.cores.secundaria}30` }}>{config.subtitulo || "Registro técnico de alterações"}</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "#888" }}>
          {config.projeto && <span><strong style={{ color: "#555" }}>Projeto:</strong> {config.projeto}</span>}
          {config.autor && <span><strong style={{ color: "#555" }}>Autor:</strong> {config.autor}</span>}
          <span><strong style={{ color: "#555" }}>Versão:</strong> {config.versao}</span>
          {config.dataInicio && <span><strong style={{ color: "#555" }}>Período:</strong> {config.dataInicio}{config.dataFim ? ` → ${config.dataFim}` : ""}</span>}
          {config.repositorio && <span><strong style={{ color: "#555" }}>Repo:</strong> {config.repositorio}</span>}
        </div>
      </div>

      {config.mudancas.length > 0 && (
        <div style={{ padding: "28px 48px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {typeOrder.filter(t => grouped[t]?.length > 0).map(t => {
            const info = CHANGE_TYPES[t];
            const c = typeColors[t] || info.color;
            return (
              <span key={t} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${c}18`, color: c, border: `1px solid ${c}40` }}>
                {grouped[t].length} {info.label}
              </span>
            );
          })}
        </div>
      )}

      {config.descricao.some(t => t.trim()) && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Visão Geral</div>
          </div>
          {config.descricao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 12, color: "#333", marginBottom: 10 }}>{t}</p>)}
        </div>
      )}

      {config.mudancas.length > 0 && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.secundaria}`, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Tabela de Mudanças</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", "Tipo", "Mudança", "Arquivo(s)", "Impacto"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 700, width: i === 0 ? 32 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.mudancas.map((m, i) => {
                const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
                const c = typeColors[m.tipo] || info.color;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f9fb" : "#fff" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontWeight: 700, color: "#ccc", fontFamily: "monospace" }}>{i + 1}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                      <span style={{ background: `${c}18`, color: c, padding: "2px 9px", borderRadius: 12, fontSize: 10, fontWeight: 800 }}>{info.label}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontWeight: 600, fontSize: 12 }}>{m.titulo || "—"}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontFamily: "monospace", fontSize: 10, color: "#666" }}>{m.arquivo || "—"}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: 11, color: "#444" }}>{m.impacto || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {config.mudancas.length > 0 && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.secundaria}`, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Detalhamento das Mudanças</div>
          </div>
          {typeOrder.filter(t => grouped[t]?.length > 0).map(tipo => {
            const info = CHANGE_TYPES[tipo];
            const c = typeColors[tipo] || info.color;
            return (
              <div key={tipo} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ background: `${c}18`, color: c, padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, border: `1px solid ${c}40` }}>
                    {info.label} ({grouped[tipo].length})
                  </span>
                </div>
                {grouped[tipo].map((m, i) => (
                  <div key={i} style={{ marginBottom: 20, borderLeft: `3px solid ${c}`, paddingLeft: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 }}>{m.titulo || "Sem título"}</div>
                    {m.arquivo && <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666", background: "#f5f5f5", padding: "3px 10px", borderRadius: 5, display: "inline-block", marginBottom: 8 }}>{m.arquivo}</div>}
                    {m.descricao?.trim() && <p style={{ fontSize: 12, color: "#333", marginBottom: 8, lineHeight: 1.7 }}>{m.descricao}</p>}
                    {m.motivacao?.trim() && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Motivação</div><p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{m.motivacao}</p></div>}
                    {m.impacto?.trim() && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Impacto</div><p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{m.impacto}</p></div>}
                    {(m.codigoAntes?.trim() || m.codigoDepois?.trim()) && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Diff</div>
                        <div style={{ background: "#0d1117", borderRadius: 8, overflow: "hidden", fontSize: 11, fontFamily: "monospace" }}>
                          {m.codigoAntes?.trim() && m.codigoAntes.split("\n").map((line, li) => (
                            <div key={li} style={{ padding: "2px 14px 2px 10px", background: "rgba(220,38,38,0.12)", borderLeft: "3px solid #DC2626", color: "#fca5a5", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>- {line}</div>
                          ))}
                          {m.codigoDepois?.trim() && m.codigoDepois.split("\n").map((line, li) => (
                            <div key={li} style={{ padding: "2px 14px 2px 10px", background: "rgba(16,185,129,0.12)", borderLeft: "3px solid #10B981", color: "#86efac", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>+ {line}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.notas?.trim() && <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffbeb", borderLeft: "3px solid #D97706", borderRadius: "0 6px 6px 0" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#D97706" }}>⚠ Nota: </span><span style={{ fontSize: 11, color: "#555" }}>{m.notas}</span></div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {config.resumo.some(t => t.trim()) && (
        <div style={{ padding: "32px 48px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.chore}`, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Resumo Final</div>
          </div>
          {config.resumo.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 12, color: "#333", marginBottom: 10 }}>{t}</p>)}
        </div>
      )}

      <div style={{ padding: "20px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>Changelog — {config.titulo || "Documento"} · v{config.versao}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}