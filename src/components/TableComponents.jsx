import React, { useState } from "react";
import { Bi } from "./Bi";
import { useLang } from "../contexts/LangContext";

export function TableCard({ table, idx, onChange, onRemove }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const upd = (f, v) => onChange({ ...table, [f]: v });

  const setHeader = (ci, val) => {
    const h = [...table.cabecalhos];
    h[ci] = val;
    upd("cabecalhos", h);
  };

  const addCol = () => {
    upd("cabecalhos", [...table.cabecalhos, `Coluna ${table.cabecalhos.length + 1}`]);
    onChange({ ...table, cabecalhos: [...table.cabecalhos, `Coluna ${table.cabecalhos.length + 1}`], linhas: table.linhas.map(r => [...r, ""]) });
  };

  const removeCol = ci => {
    if (table.cabecalhos.length <= 1) return;
    onChange({
      ...table,
      cabecalhos: table.cabecalhos.filter((_, i) => i !== ci),
      linhas: table.linhas.map(r => r.filter((_, i) => i !== ci)),
    });
  };

  const setCell = (ri, ci, val) => {
    const linhas = table.linhas.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    upd("linhas", linhas);
  };

  const addRow = () => upd("linhas", [...table.linhas, Array(table.cabecalhos.length).fill("")]);

  const removeRow = ri => upd("linhas", table.linhas.filter((_, i) => i !== ri));

  return (
    <div className="card anim" style={{ border: `1px solid ${open ? "var(--ac)70" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? "rgba(98,113,245,0.05)" : "transparent", transition: "background .2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bi name="table" size={15} style={{ color: "#fff" }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--tx3)", letterSpacing: .8, fontFamily: "var(--mono)", flexShrink: 0 }}>T{idx + 1}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: table.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {table.titulo || t.noTitle}
        </span>
        <span style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--mono)", background: "var(--s2)", padding: "2px 8px", borderRadius: 6 }}>
          {table.cabecalhos.length} col · {table.linhas.length} lin
        </span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}>
          <Bi name="trash3" size={13} />
        </button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>

      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>
          <div style={{ marginBottom: 20 }}>
            <label className="lbl">{t.tableTitle}</label>
            <input className="inp" value={table.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: Comparativo de vulnerabilidades" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label className="lbl" style={{ marginBottom: 0 }}>{t.tableColumns}</label>
              <button onClick={addCol} className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px", gap: 5 }}>
                <Bi name="plus-lg" size={11} /> {t.addColumnBtn}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {table.cabecalhos.map((h, ci) => (
                <div key={ci} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: "1.5px solid var(--b2)", borderRadius: "var(--r-sm)", padding: "6px 10px", minWidth: 120 }}>
                  <input
                    value={h}
                    onChange={e => setHeader(ci, e.target.value)}
                    style={{ background: "transparent", border: "none", color: "var(--tx)", fontSize: 13, fontWeight: 600, width: "100%", padding: 0, boxShadow: "none" }}
                    placeholder={`Col ${ci + 1}`}
                  />
                  {table.cabecalhos.length > 1 && (
                    <button onClick={() => removeCol(ci)} style={{ background: "none", border: "none", color: "var(--tx3)", padding: 0, cursor: "pointer", flexShrink: 0 }}>
                      <Bi name="x" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label className="lbl" style={{ marginBottom: 0 }}>{t.tableRows}</label>
              <button onClick={addRow} className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px", gap: 5 }}>
                <Bi name="plus-lg" size={11} /> {t.addRowBtn}
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {table.cabecalhos.map((h, ci) => (
                      <th key={ci} style={{ padding: "8px 10px", background: "var(--s2)", color: "var(--tx2)", fontWeight: 700, fontSize: 11, textAlign: "left", border: "1px solid var(--b2)", letterSpacing: .5, textTransform: "uppercase" }}>
                        {h || `Col ${ci + 1}`}
                      </th>
                    ))}
                    <th style={{ width: 36, background: "var(--s2)", border: "1px solid var(--b2)" }} />
                  </tr>
                </thead>
                <tbody>
                  {table.linhas.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ border: "1px solid var(--b2)", padding: 0 }}>
                          <input
                            value={cell}
                            onChange={e => setCell(ri, ci, e.target.value)}
                            style={{ width: "100%", background: "transparent", border: "none", color: "var(--tx)", fontSize: 13, padding: "8px 10px", boxShadow: "none", borderRadius: 0 }}
                            placeholder="—"
                          />
                        </td>
                      ))}
                      <td style={{ border: "1px solid var(--b2)", textAlign: "center", width: 36 }}>
                        <button onClick={() => removeRow(ri)} style={{ background: "none", border: "none", color: "var(--tx3)", cursor: "pointer", padding: "4px 6px" }}>
                          <Bi name="trash3" size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {table.linhas.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--tx3)", fontSize: 13 }}>
                {t.noRows}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
