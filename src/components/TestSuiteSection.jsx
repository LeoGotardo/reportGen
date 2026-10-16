import React, { useState } from "react";
import { Bi } from "./Bi";
import { CellTextarea } from "./TableComponents";
import { useLang } from "../contexts/lang";
import { emptySuiteTest, SUITE_RESULTS } from "../constants/initialConfigs";
import { nextCodigo, normalizeResult, parseSuiteGrid, serializeSuite, suiteCounts } from "../utils/testSuite";
import { parseTsv, readClipboardGrid, trimEmptyRows } from "../utils/parseClipboardTable";

// Cores no editor (tema escuro).
const RESULT_UI = {
  PASS:     { color: "#22c55e", bg: "rgba(34,197,94,.14)" },
  FAIL:     { color: "#f87171", bg: "rgba(239,68,68,.14)" },
  UNTESTED: { color: "#94a3b8", bg: "rgba(148,163,184,.14)" },
};

/** Grade vinda de um DataTransfer (Ctrl+V) ou adaptador { getData } (clipboard.read). */
const gridFrom = data => readClipboardGrid(data) ?? trimEmptyRows(parseTsv(data.getData("text/plain") || ""));

export function TestSuiteSection({ rows, onChange }) {
  const { t } = useLang();
  const [notice, setNotice] = useState(null);
  const [manualPaste, setManualPaste] = useState(false);

  const resultLabel = v => ({ PASS: "PASS", FAIL: "FAIL", UNTESTED: t.suiteUntested })[normalizeResult(v)];
  const counts = suiteCounts(rows);

  // Edição manual invalida o "Desfazer" da última colagem.
  const apply = next => { setNotice(null); onChange(next); };
  const upd = (id, field, value) => apply(rows.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  const addRow = () => apply([...rows, emptySuiteTest(nextCodigo(rows))]);
  const removeRow = id => apply(rows.filter(r => r.id !== id));

  const copy = () => {
    const { tsv, html } = serializeSuite(rows, [t.suiteColId, t.suiteColTitle, t.suiteColDesc, t.suiteColResult], resultLabel);
    const done = () => setNotice({ text: t.suiteCopied.replace("{n}", rows.length) });
    const fail = () => setNotice({ text: t.suiteCopyFailed, warn: true });
    const plain = () => (navigator.clipboard?.writeText ? navigator.clipboard.writeText(tsv).then(done, fail) : fail());
    try {
      // ClipboardItem montado ainda dentro do clique: o Safari perde o gesto do usuário após um await.
      const item = new ClipboardItem({
        "text/plain": new Blob([tsv], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      });
      navigator.clipboard.write([item]).then(done, plain);
    } catch {
      plain();
    }
  };

  const applyGrid = grid => {
    const { rows: parsed, truncated } = grid ? parseSuiteGrid(grid) : { rows: [] };
    if (!parsed.length) { setNotice({ text: t.suitePasteEmpty, warn: true }); return; }
    onChange(parsed);
    setManualPaste(false);
    const done = t.suitePasted.replace("{n}", parsed.length);
    setNotice({ text: truncated ? `${done} ${t.suitePasteTruncated}` : done, warn: truncated, prev: rows });
  };

  const pasteFromClipboard = async () => {
    try {
      let html = "";
      let text = "";
      if (navigator.clipboard?.read) {
        for (const item of await navigator.clipboard.read()) {
          if (!html && item.types.includes("text/html")) html = await (await item.getType("text/html")).text();
          if (!text && item.types.includes("text/plain")) text = await (await item.getType("text/plain")).text();
        }
      } else {
        text = await navigator.clipboard.readText();
      }
      applyGrid(gridFrom({ getData: k => (k === "text/html" ? html : k === "text/plain" ? text : "") }));
    } catch {
      // Firefox/Safari costumam negar a leitura direta: cai para Ctrl+V numa área de colagem.
      setNotice(null);
      setManualPaste(true);
    }
  };

  const undoPaste = () => { onChange(notice.prev); setNotice(null); };

  const actions = (
    <div className="suite-actions">
      <button className="btn-ghost suite-btn" onClick={copy} disabled={!rows.length} title={t.suiteCopy}>
        <Bi name="clipboard" size={12} /> {t.suiteCopy}
      </button>
      <button className="btn-ghost suite-btn" onClick={pasteFromClipboard} title={t.suitePaste}>
        <Bi name="clipboard-plus" size={12} /> {t.suitePaste}
      </button>
    </div>
  );

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="suite-toolbar">
        <div className="suite-counts">
          {SUITE_RESULTS.map(k => (
            <span key={k} className="suite-chip" style={{ color: RESULT_UI[k].color, background: RESULT_UI[k].bg }}>
              {counts[k]} {resultLabel(k)}
            </span>
          ))}
        </div>
        {actions}
      </div>

      {manualPaste && (
        <div className="paste-zone" style={{ marginBottom: 16 }}>
          <textarea className="paste-inp" value="" onChange={() => {}} autoFocus
            onPaste={e => { e.preventDefault(); applyGrid(gridFrom(e.clipboardData)); }}
            aria-label={t.suitePasteManual} spellCheck={false} />
          <Bi name="clipboard-plus" size={18} style={{ color: "var(--tx3)", flexShrink: 0 }} />
          <span className="paste-hint">{t.suitePasteManual}</span>
          <button className="btn-ghost paste-opt" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setManualPaste(false)}>{t.cancel}</button>
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 12px", border: "2px dashed var(--b2)", borderRadius: "var(--r-sm)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tx2)", marginBottom: 6 }}>{t.suiteEmpty}</div>
          <div style={{ fontSize: 12.5, color: "var(--tx3)", marginBottom: 16 }}>{t.suiteEmptyDesc}</div>
          <button onClick={addRow} className="btn-ghost"><Bi name="plus-lg" size={12} /> {t.suiteAddTest}</button>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="suite-table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>{t.suiteColId}</th>
                  <th>{t.suiteColTitle}</th>
                  <th>{t.suiteColDesc}</th>
                  <th style={{ width: 140 }}>{t.suiteColResult}</th>
                  <th style={{ width: 36 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const res = normalizeResult(r.resultado);
                  return (
                    <tr key={r.id}>
                      <td>
                        <input className="tbl-cell suite-id" value={r.codigo} onChange={e => upd(r.id, "codigo", e.target.value)} placeholder="TC-001" spellCheck={false} />
                      </td>
                      <td><CellTextarea value={r.titulo} onChange={v => upd(r.id, "titulo", v)} placeholder={t.suiteTitlePh} /></td>
                      <td><CellTextarea value={r.descricao} onChange={v => upd(r.id, "descricao", v)} placeholder={t.suiteDescPh} /></td>
                      <td>
                        <select className="suite-result" value={res} onChange={e => upd(r.id, "resultado", e.target.value)}
                          style={{ color: RESULT_UI[res].color, background: RESULT_UI[res].bg }} aria-label={t.suiteColResult}>
                          {SUITE_RESULTS.map(k => <option key={k} value={k}>{resultLabel(k)}</option>)}
                        </select>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button onClick={() => removeRow(r.id)} className="suite-remove" aria-label={t.removeItem || "Remover"}>
                          <Bi name="trash3" size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={addRow} className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}><Bi name="plus-lg" size={11} /> {t.suiteAddTest}</button>
            <span style={{ fontSize: 11.5, color: "var(--tx3)", flex: 1, minWidth: 200 }}>{t.suiteHint}</span>
          </div>
        </>
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
  );
}
