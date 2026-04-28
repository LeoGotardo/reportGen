import React from "react";
import { CHANGE_TYPES } from "../constants/templates";
import { useLang } from "../contexts/LangContext";

function CustomTables({ tabelas, primary, label }) {
  if (!tabelas?.length) return null;
  return (
    <div style={{ padding: "38px 48px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{label}</div>
      </div>
      {tabelas.map((t, ti) => (
        <div key={ti} style={{ marginBottom: 32 }}>
          {t.titulo && <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>{t.titulo}</div>}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {t.cabecalhos.map((h, ci) => (
                  <th key={ci} style={{ color: "#fff", padding: "9px 14px", textAlign: "left", fontWeight: 700 }}>{h || `Col ${ci + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.linhas.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 ? "#f8f8fb" : "#fff" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "8px 14px", borderBottom: "1px solid #eee", color: "#333" }}>{cell || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

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
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
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
        <div style={{ padding: "38px 48px 0" }}>
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

      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_problemsDetail}</div>
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
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: "#22c55e", borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_bugs_testsSection}</div>
          </div>
          {config.testes.map((ts, i) => (
            <div key={i} style={{ marginBottom: 32, borderLeft: "4px solid #22c55e", paddingLeft: 20 }}>
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
        <div style={{ padding: "38px 48px 56px" }}>
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
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>{t.doc_study_overline}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Estudo"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || "Tema ou assunto estudado"}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>{t.doc_study_fieldStudent}:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>{t.doc_study_fieldVersion}:</strong> {config.versao}</span>
          <span><strong style={{ color: "#555" }}>Data:</strong> {new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      {config.introducao.some(v => v.trim()) && (
        <div style={{ padding: "38px 48px 0" }}>
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
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{t.doc_study_topicsDetail}</div>
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
        <div style={{ padding: "38px 48px 56px" }}>
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
                  <div key={i} style={{ marginBottom: 20, borderLeft: `3px solid ${c}`, paddingLeft: 18 }}>
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
