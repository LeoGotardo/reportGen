import React from "react";

export function CustomTables({ tabelas, primary, label }) {
  if (!tabelas?.length) return null;
  return (
    <div data-anchor="sec:tabelas" style={{ padding: "38px 48px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>{label}</div>
      </div>
      {tabelas.map((t, ti) => (
        <div key={t.id ?? ti} data-anchor={t.id ? `item:${t.id}` : undefined} style={{ marginBottom: 32 }}>
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
                    <td key={ci} style={{ padding: "8px 14px", borderBottom: "1px solid #eee", color: "#333", whiteSpace: "pre-wrap", verticalAlign: "top" }}>{cell || "—"}</td>
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
