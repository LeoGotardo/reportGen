import React from "react";
import { CustomTables } from "./CustomTables";
import { useLang } from "../contexts/lang";
import { formatDate } from "../utils/date";

export function StudyPreview({ config }) {
  const { t } = useLang();
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = {
    CONCEITO: `#${config.cores.concept}`,
    PRÁTICA:  `#${config.cores.practice}`,
    RESUMO:   `#${config.cores.summary}`,
  };

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div data-anchor="sec:info" style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>{t.doc_study_overline}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Estudo"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || "Tema ou assunto estudado"}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>{t.doc_study_fieldStudent}:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>{t.doc_study_fieldVersion}:</strong> {config.versao}</span>
          {formatDate(config.data) && <span><strong style={{ color: "#555" }}>{t.doc_common_date}:</strong> {formatDate(config.data)}</span>}
        </div>
      </div>

      {config.introducao.some(v => v.trim()) && (
        <div data-anchor="sec:introducao" style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_study_intro}</div>
          </div>
          {config.introducao.filter(v => v.trim()).map((v, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{v}</p>)}
        </div>
      )}

      {config.topicos.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: typeColors.CONCEITO, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_study_topicsTable}</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", t.doc_study_thTopic, t.doc_study_thType, t.doc_study_thSummary].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700, width: i === 0 ? 38 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.topicos.map((p, i) => {
                const c = typeColors[p.tipo] || typeColors.CONCEITO;
                return (
                  <tr key={p.id} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }} data-anchor="sec:topicos">
            <div style={{ width: 5, height: 24, background: typeColors.PRÁTICA, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_study_topicsDetail}</div>
          </div>
          {config.topicos.map((p, i) => {
            const c = typeColors[p.tipo] || typeColors.CONCEITO;
            const d = p.detalhe || {};
            return (
              <div key={p.id} data-anchor={`item:${p.id}`} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || t.noTitle}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.tipo}</span>
                </div>
                {d.explicacao?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_study_fieldExplanation}</div>{d.explicacao.filter(v => v.trim()).map((v, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{v}</p>)}</div>}
                {d.exemplos?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_study_fieldExamples}</div>{d.exemplos.filter(v => v.trim()).map((v, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{v}</p>)}</div>}
                {d.codigo?.some(v => v.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{t.doc_study_fieldCode}</div>{d.codigo.filter(v => v.trim()).map((v, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{v}</pre>)}</div>}
              </div>
            );
          })}
        </div>
      )}

      <CustomTables tabelas={config.tabelas} primary={primary} label={t.doc_common_tables} />

      {config.conclusao.some(v => v.trim()) && (
        <div data-anchor="sec:conclusao" style={{ padding: "38px 48px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: typeColors.RESUMO, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_study_conclusion}</div>
          </div>
          {config.conclusao.filter(v => v.trim()).map((v, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{v}</p>)}
        </div>
      )}

      <div style={{ padding: "24px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>{t.doc_common_footerStudy} — {config.titulo || "Documento"}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}
