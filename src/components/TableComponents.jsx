import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bi } from "./Bi";
import { GoToPreview } from "./UI";
import { useLang } from "../contexts/lang";
import { gridIsSingleCell, parseTsv, pasteGridIntoTable, readClipboardGrid, trimEmptyRows } from "../utils/parseClipboardTable";

/**
 * Iguala a altura de todas as células editáveis (.row-fill) da linha à da mais alta.
 * Em JS porque o truque CSS (td height: 1px + height: 100%) não funciona no Firefox.
 */
function syncRowHeight(tr) {
  if (!tr) return;
  const cells = [...tr.querySelectorAll(".row-fill")];
  const max = Math.max(0, ...cells.map(c => parseFloat(c.style.minHeight) || 0));
  if (max) cells.forEach(c => { c.style.height = `${max}px`; });
}

/**
 * Textarea que cresce com o conteúdo — Enter quebra linha, como no resumo executivo.
 * A altura do próprio conteúdo vira min-height; a linha toda assume a maior (syncRowHeight).
 */
function fitHeight(el) {
  // Limpa antes de medir: com min-height/height antigos a célula nunca encolheria.
  el.style.minHeight = "";
  el.style.height = "auto";
  el.style.minHeight = `${el.scrollHeight}px`;
  el.style.height = "";
  syncRowHeight(el.closest("tr"));
}

export function CellTextarea({ value, onChange, onPaste, placeholder, singleLine = false, className = "" }) {
  const ref = useRef(null);
  useLayoutEffect(() => { if (ref.current) fitHeight(ref.current); }, [value]);

  // Largura muda (nova coluna, resize do painel, rotação) → texto re-quebra, refaz a altura.
  // Só largura: a altura muda sempre que a linha é sincronizada e refazer aí entraria em loop.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = el.offsetWidth;
    let frame = 0;
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitHeight(el));
    });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return (
    <textarea ref={ref} rows={1} className={`tbl-cell row-fill ${className}`.trim()} value={value} placeholder={placeholder}
      spellCheck={singleLine ? false : undefined}
      onChange={e => onChange(singleLine ? e.target.value.replace(/\s*\r?\n\s*/g, " ") : e.target.value)}
      onKeyDown={singleLine ? e => { if (e.key === "Enter") e.preventDefault(); } : undefined}
      onPaste={onPaste} />
  );
}

/** Insere texto no cursor mantendo o histórico de desfazer (Ctrl+Z) do navegador. */
function insertAtCursor(el, text, fallback) {
  el.focus();
  if (document.execCommand?.("insertText", false, text)) return;
  const { selectionStart: s, selectionEnd: e, value } = el;
  fallback(value.slice(0, s) + text + value.slice(e));
}

export function TableCard({ table, idx, onChange, onRemove, dragHandleProps }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [headerFirst, setHeaderFirst] = useState(true);
  const [notice, setNotice] = useState(null);

  const newColName = n => `${t.addColumnBtn} ${n}`;

  // Qualquer edição manual invalida o "Desfazer" da última colagem.
  const apply = next => { setNotice(null); onChange(next); };
  const upd = (f, v) => apply({ ...table, [f]: v });

  const setHeader = (ci, val) => {
    const h = [...table.cabecalhos];
    h[ci] = val;
    upd("cabecalhos", h);
  };

  const addCol = () => apply({
    ...table,
    cabecalhos: [...table.cabecalhos, newColName(table.cabecalhos.length + 1)],
    linhas: table.linhas.map(r => [...r, ""]),
  });

  const removeCol = ci => {
    if (table.cabecalhos.length <= 1) return;
    apply({
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

  const commitPaste = (base, grid, row, col) => {
    const { table: next, truncated } = pasteGridIntoTable(base, grid, row, col, newColName);
    onChange(next);
    const cols = Math.max(...grid.map(r => r.length));
    const rows = row < 0 ? grid.length - 1 : grid.length;
    const done = t.tablePasteDone.replace("{r}", rows).replace("{c}", cols);
    setNotice({ text: truncated ? `${done} ${t.tablePasteTruncated}` : done, warn: truncated, prev: table });
  };

  // row === -1 → cabeçalho. Texto comum segue o paste nativo do navegador.
  const handleCellPaste = (e, row, col, setValue) => {
    const grid = readClipboardGrid(e.clipboardData);
    if (!grid) return;
    e.preventDefault();
    if (gridIsSingleCell(grid)) { insertAtCursor(e.currentTarget, grid[0][0], setValue); return; }
    commitPaste(table, grid, row, col);
  };

  const handleZonePaste = e => {
    e.preventDefault();
    let grid = readClipboardGrid(e.clipboardData);
    if (!grid) grid = trimEmptyRows(parseTsv(e.clipboardData.getData("text/plain")));
    if (!grid) { setNotice({ text: t.tablePasteEmpty, warn: true }); return; }
    const width = Math.max(...grid.map(r => r.length));
    const base = { ...table, cabecalhos: headerFirst ? [] : table.cabecalhos.slice(0, width), linhas: [] };
    commitPaste(base, grid, headerFirst ? -1 : 0, 0);
  };

  const undoPaste = () => { onChange(notice.prev); setNotice(null); };

  return (
    <div className="card anim" style={{ border: `1px solid ${open ? "var(--ac)70" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? "rgba(98,113,245,0.05)" : "transparent", transition: "background .2s" }}>
        {dragHandleProps && (
          <div {...dragHandleProps} onClick={e => e.stopPropagation()} style={{ cursor: "grab", color: "var(--tx3)", display: "flex", alignItems: "center", flexShrink: 0, marginLeft: -4 }}>
            <Bi name="grip-vertical" size={16} />
          </div>
        )}
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
        <GoToPreview anchor={`item:${table.id}`} compact />
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

          {/* textarea invisível cobre a área toda: clicar e Ctrl+V (ou botão direito → Colar) */}
          <div className="paste-zone" style={{ marginBottom: 20 }}>
            <textarea className="paste-inp" value="" onChange={() => {}} onPaste={handleZonePaste}
              aria-label={t.tablePasteHint} spellCheck={false} />
            <Bi name="clipboard-plus" size={18} style={{ color: "var(--tx3)", flexShrink: 0 }} />
            <span className="paste-hint">{t.tablePasteHint}</span>
            <label className="paste-opt">
              <input type="checkbox" checked={headerFirst} onChange={e => setHeaderFirst(e.target.checked)} />
              {t.tablePasteHeader}
            </label>
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
                    onPaste={e => handleCellPaste(e, -1, ci, v => setHeader(ci, v))}
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
                        <td key={ci} style={{ border: "1px solid var(--b2)", padding: 0, verticalAlign: "top" }}>
                          <CellTextarea
                            value={cell}
                            onChange={v => setCell(ri, ci, v)}
                            onPaste={e => handleCellPaste(e, ri, ci, v => setCell(ri, ci, v))}
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

            {table.linhas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--tx3)", fontSize: 13 }}>
                {t.noRows}
              </div>
            ) : (
              <div style={{ fontSize: 11.5, color: "var(--tx3)", marginTop: 8 }}>{t.tablePasteCellTip}</div>
            )}

            {notice && (
              <div role="status" className={`paste-notice${notice.warn ? " warn" : ""}`}>
                <Bi name={notice.warn ? "exclamation-triangle" : "clipboard-check"} size={13} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{notice.text}</span>
                {notice.prev && (
                  <button onClick={undoPaste} className="btn-ghost" style={{ fontSize: 11, padding: "3px 10px" }}>
                    <Bi name="arrow-counterclockwise" size={11} /> {t.undo}
                  </button>
                )}
                <button onClick={() => setNotice(null)} aria-label="OK" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 2 }}>
                  <Bi name="x" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
