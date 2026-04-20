import React, { useState } from "react";
import { Bi } from "./Bi";
import { ArrayField } from "./UI";
import { useIsMobile } from "../hooks/useIsMobile";
import { SEV } from "../constants/templates";
import { useLang } from "../contexts/LangContext";

export function BugProblemCard({ prob, idx, onChange, onRemove }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const isMob = useIsMobile();
  const sev = SEV[prob.severity] || SEV.ALTA;
  const upd = (f, v) => onChange({ ...prob, [f]: v });
  const updD = (f, v) => onChange({ ...prob, detalhe: { ...prob.detalhe, [f]: v } });
  return (
    <div className="card anim" style={{ border: `1px solid ${open ? sev.border + "90" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? sev.bg : "transparent", transition: "background .2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: sev.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "var(--mono)" }}>{idx + 1}</span>
        </div>
        <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, background: `${sev.border}22`, color: sev.text, flexShrink: 0, letterSpacing: .8, border: `1px solid ${sev.border}40` }}>{prob.severity}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: prob.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prob.titulo || t.noTitle}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}><Bi name="trash3" size={13} /></button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>
      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 140px", gap: 16, marginBottom: 18 }}>
            <div><label className="lbl">{t.bugTitleLabel}</label><input className="inp" value={prob.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.bugTitlePh} /></div>
            <div><label className="lbl">{t.bugSeverityLabel}</label>
              <select value={prob.severity} onChange={e => upd("severity", e.target.value)}
                style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: sev.text, background: "var(--bg2)", border: `1.5px solid ${sev.border}60`, borderRadius: "var(--r-sm)", outline: "none", width: "100%" }}>
                <option value="ALTA">ALTA</option><option value="MÉDIA">MÉDIA</option><option value="BAIXA">BAIXA</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div><label className="lbl">{t.bugSummaryLabel}</label><textarea className="inp" rows={3} value={prob.resumo} onChange={e => upd("resumo", e.target.value)} placeholder={t.bugSummaryPh} /></div>
            <div><label className="lbl">{t.bugResolutionLabel}</label><textarea className="inp" rows={3} value={prob.resolucao} onChange={e => upd("resolucao", e.target.value)} placeholder={t.bugResolutionPh} /></div>
          </div>
          <div className="div" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Bi name="list-nested" size={14} style={{ color: "var(--tx3)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--tx3)", letterSpacing: 1.1, textTransform: "uppercase" }}>{t.bugDetailSection}</span>
          </div>
          <ArrayField label={t.bugWhereOccurs} values={prob.detalhe.ondeOcorre} onChange={v => updD("ondeOcorre", v)} placeholder={t.bugWhereOccursPh} />
          <ArrayField label={t.bugCodeWhere} values={prob.detalhe.codigoOnde} onChange={v => updD("codigoOnde", v)} mono placeholder={t.bugCodeWherePh} />
          <ArrayField label={t.bugWhyProblem} values={prob.detalhe.porqueProblema} onChange={v => updD("porqueProblema", v)} placeholder={t.bugWhyPh} />
          <ArrayField label={t.bugResolutionText} values={prob.detalhe.textoResolucao} onChange={v => updD("textoResolucao", v)} placeholder={t.bugResolutionTextPh} />
          <ArrayField label={t.bugCodeFix} values={prob.detalhe.codigoResolucao} onChange={v => updD("codigoResolucao", v)} mono placeholder={t.bugCodeFixPh} />
        </div>
      )}
    </div>
  );
}
