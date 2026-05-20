import React from "react";
import { CHANGE_TYPES } from "../constants/templates";
import { CustomTables } from "./CustomTables";
import { useLang } from "../contexts/LangContext";

export function ChangelogPreview({ config }) {
  const { t } = useLang();
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
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>{t.doc_changelog_overline}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 10, fontFamily: "Georgia, serif" }}>{config.titulo || "Changelog do Projeto"}</div>
        <div style={{ fontSize: 14, color: `#${config.cores.secundaria}`, fontWeight: 600, paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid #${config.cores.secundaria}30` }}>{config.subtitulo || "Registro técnico de alterações"}</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "#888" }}>
          {config.projeto && <span><strong style={{ color: "#555" }}>{t.doc_changelog_fieldProject}:</strong> {config.projeto}</span>}
          {config.autor && <span><strong style={{ color: "#555" }}>{t.doc_changelog_fieldAuthor}:</strong> {config.autor}</span>}
          <span><strong style={{ color: "#555" }}>{t.doc_changelog_fieldVersion}:</strong> {config.versao}</span>
          {config.dataInicio && <span><strong style={{ color: "#555" }}>{t.doc_changelog_fieldPeriod}:</strong> {config.dataInicio}{config.dataFim ? ` → ${config.dataFim}` : ""}</span>}
          {config.repositorio && <span><strong style={{ color: "#555" }}>{t.doc_changelog_fieldRepo}:</strong> {config.repositorio}</span>}
        </div>
      </div>

      {config.mudancas.length > 0 && (
        <div style={{ padding: "28px 48px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {typeOrder.filter(tp => grouped[tp]?.length > 0).map(tp => {
            const info = CHANGE_TYPES[tp];
            const c = typeColors[tp] || info.color;
            return (
              <span key={tp} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${c}18`, color: c, border: `1px solid ${c}40` }}>
                {grouped[tp].length} {info.label}
              </span>
            );
          })}
        </div>
      )}

      {config.descricao.some(v => v.trim()) && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>{t.doc_changelog_overview}</div>
          </div>
          {config.descricao.filter(v => v.trim()).map((v, i) => <p key={i} style={{ fontSize: 12, color: "#333", marginBottom: 10 }}>{v}</p>)}
        </div>
      )}

      {config.mudancas.length > 0 && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.secundaria}`, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>{t.doc_changelog_table}</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", t.doc_changelog_thType, t.doc_changelog_thChange, t.doc_changelog_thFile, t.doc_changelog_thImpact].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 700, width: i === 0 ? 32 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.mudancas.map((m, i) => {
                const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
                const c = typeColors[m.tipo] || info.color;
                return (
                  <tr key={m.id} style={{ background: i % 2 ? "#f8f9fb" : "#fff" }}>
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
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>{t.doc_changelog_detail}</div>
          </div>
          {typeOrder.filter(tp => grouped[tp]?.length > 0).map(tipo => {
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
                  <div key={m.id} style={{ marginBottom: 20, borderLeft: `3px solid ${c}`, paddingLeft: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 }}>{m.titulo || t.noTitle}</div>
                    {m.arquivo && <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666", background: "#f5f5f5", padding: "3px 10px", borderRadius: 5, display: "inline-block", marginBottom: 8 }}>{m.arquivo}</div>}
                    {m.descricao?.trim() && <p style={{ fontSize: 12, color: "#333", marginBottom: 8, lineHeight: 1.7 }}>{m.descricao}</p>}
                    {m.motivacao?.trim() && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>{t.doc_changelog_fieldMotiv}</div><p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{m.motivacao}</p></div>}
                    {m.impacto?.trim() && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>{t.doc_changelog_fieldImpact}</div><p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{m.impacto}</p></div>}
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
                    {m.notas?.trim() && <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffbeb", borderLeft: "3px solid #D97706", borderRadius: "0 6px 6px 0" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#D97706" }}>{t.doc_docx_notePrefix}</span><span style={{ fontSize: 11, color: "#555" }}>{m.notas}</span></div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <CustomTables tabelas={config.tabelas} primary={primary} label={t.doc_common_tables} />

      {config.resumo.some(v => v.trim()) && (
        <div style={{ padding: "32px 48px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.chore}`, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>{t.doc_changelog_summary}</div>
          </div>
          {config.resumo.filter(v => v.trim()).map((v, i) => <p key={i} style={{ fontSize: 12, color: "#333", marginBottom: 10 }}>{v}</p>)}
        </div>
      )}

      <div style={{ padding: "20px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>{t.doc_common_footerChangelog} — {config.titulo || "Documento"} · v{config.versao}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}
