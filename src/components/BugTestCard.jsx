import React, { useState } from "react";
import { Bi } from "./Bi";
import { ArrayField } from "./UI";
import { useLang } from "../contexts/LangContext";

export function BugTestCard({ test, idx, onChange, onRemove, dragHandleProps }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const upd = (f, v) => onChange({ ...test, [f]: v });
  return (
    <div className="card anim" style={{ border: `1px solid ${open ? "#22c55e90" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? "#22c55e0d" : "transparent", transition: "background .2s" }}>
        {dragHandleProps && (
          <div {...dragHandleProps} onClick={e => e.stopPropagation()} style={{ cursor: "grab", color: "var(--tx3)", display: "flex", alignItems: "center", flexShrink: 0, marginLeft: -4 }}>
            <Bi name="grip-vertical" size={16} />
          </div>
        )}
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "var(--mono)" }}>{idx + 1}</span>
        </div>
        <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, background: "#22c55e22", color: "#16a34a", flexShrink: 0, letterSpacing: .8, border: "1px solid #22c55e40" }}>PASS</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: test.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{test.titulo || t.bugTestNoTitle}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}><Bi name="trash3" size={13} /></button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>
      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>
          <div style={{ marginBottom: 18 }}>
            <label className="lbl">{t.bugTestTitleLabel}</label>
            <input className="inp" value={test.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.bugTestTitlePh} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label className="lbl">{t.bugTestDescLabel}</label>
              <textarea className="inp" rows={3} value={test.descricao} onChange={e => upd("descricao", e.target.value)} placeholder={t.bugTestDescPh} />
            </div>
            <div>
              <label className="lbl">{t.bugTestHowLabel}</label>
              <textarea className="inp" rows={3} value={test.como} onChange={e => upd("como", e.target.value)} placeholder={t.bugTestHowPh} />
            </div>
          </div>
          <ArrayField label={t.bugTestCodeLabel} values={test.codigo} onChange={v => upd("codigo", v)} mono placeholder={t.bugTestCodePh} />
        </div>
      )}
    </div>
  );
}
