import React from "react";
import { CustomTables } from "./CustomTables";
import { useLang } from "../contexts/LangContext";

export function BugsPreview({ config }) {
  const { t } = useLang();
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevColors = {
    ALTA:  `#${config.cores.altaSev}`,
    MÉDIA: `#${config.cores.mediaSev}`,
    BAIXA: `#${config.cores.baixaSev}`,
  };

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div data-anchor="sec:info" style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>{t.doc_bugs_overline}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Relatório"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || ""}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>{t.doc_bugs_fieldAuthor}:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>{t.doc_bugs_fieldVersion}:</strong> {config.versao}</span>
          <span><strong style={{ color: "#555" }}>{t.doc_bugs_fieldFormat}:</strong> {config.formato}</span>
        </div>
      </div>

      {config.resumoExecutivo.some(v => v.trim()) && (
        <div data-anchor="sec:resumoExecutivo" style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_execSummary}</div>
          </div>
          {config.resumoExecutivo.filter(v => v.trim()).map((v, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{v}</p>)}
        </div>
      )}

      <CustomTables tabelas={config.tabelas} primary={primary} label={t.doc_common_tables} />

      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_problemsTable}</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", t.doc_bugs_thProblem, t.doc_bugs_thSeverity, t.doc_bugs_thResolution].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700, width: i === 0 ? 38 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.problemas.map((p, i) => {
                const c = sevColors[p.severity] || sevColors.ALTA;
                return (
                  <tr key={p.id} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
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

      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }} data-anchor="sec:problemas">
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_problemsDetail}</div>
          </div>
          {config.problemas.map((p, i) => {
            const c = sevColors[p.severity] || sevColors.ALTA;
            const d = p.detalhe || {};
            return (
              <div key={p.id} data-anchor={`item:${p.id}`} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || t.noTitle}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.severity}</span>
                </div>
                {p.resumo?.trim() && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldDesc}</div><p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{p.resumo}</p></div>}
                {p.comoReproduzir?.trim() && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldHowToReproduce}</div><p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{p.comoReproduzir}</p></div>}
                {d.ondeOcorre?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldWhere}</div>{d.ondeOcorre.filter(v => v.trim()).map((v, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{v}</p>)}</div>}
                {d.codigoOnde?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldCode}</div>{d.codigoOnde.filter(v => v.trim()).map((v, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{v}</pre>)}</div>}
                {d.porqueProblema?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldWhy}</div>{d.porqueProblema.filter(v => v.trim()).map((v, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{v}</p>)}</div>}
                {d.textoResolucao?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldResText}</div>{d.textoResolucao.filter(v => v.trim()).map((v, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{v}</p>)}</div>}
                {d.codigoResolucao?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_fieldResCode}</div>{d.codigoResolucao.filter(v => v.trim()).map((v, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{v}</pre>)}</div>}
                {d.testesPassam?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#22c55e", marginBottom: 6 }}>{t.doc_bugs_fieldTestsPass}</div>{d.testesPassam.filter(v => v.trim()).map((v, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: "#86efac", padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all", borderLeft: "3px solid #22c55e" }}>{v}</pre>)}</div>}
              </div>
            );
          })}
        </div>
      )}

      {(config.testes || []).length > 0 && (
        <div data-anchor="sec:testes" style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: "#22c55e", borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_testsSection}</div>
          </div>
          {config.testes.map((ts, i) => (
            <div key={ts.id} data-anchor={`item:${ts.id}`} style={{ marginBottom: 32, borderLeft: "4px solid #22c55e", paddingLeft: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", flex: 1 }}>{ts.titulo || t.bugTestNoTitle}</div>
                <span style={{ background: "#22c55e22", color: "#16a34a", padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>PASS</span>
              </div>
              {ts.descricao?.trim() && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_testFieldWhat}</div><p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{ts.descricao}</p></div>}
              {ts.como?.trim() && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_bugs_testFieldHow}</div><p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{ts.como}</p></div>}
              {ts.codigo?.some(v => v.trim()) && <div>{ts.codigo.filter(v => v.trim()).map((v, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: "#86efac", padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all", borderLeft: "3px solid #22c55e" }}>{v}</pre>)}</div>}
            </div>
          ))}
        </div>
      )}

      {config.conclusao.some(v => v.trim()) && (
        <div data-anchor="sec:conclusao" style={{ padding: "38px 48px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.baixaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_conclusion}</div>
          </div>
          {config.conclusao.filter(v => v.trim()).map((v, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{v}</p>)}
        </div>
      )}

      <div style={{ padding: "24px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>{t.doc_common_footerTechReport} — {config.titulo || "Documento"}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}
