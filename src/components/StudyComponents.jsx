import React, { useState } from "react";
import { Bi } from "./Bi";
import { ArrayField } from "./UI";
import { useIsMobile } from "../hooks/useIsMobile";
import { STUDY_TYPES } from "../constants/templates";
import { useLang } from "../contexts/LangContext";

export function StudyTopicCard({ topic, onChange, onRemove }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const isMob = useIsMobile();
  const type = STUDY_TYPES[topic.tipo] || STUDY_TYPES.CONCEITO;
  const upd = (f, v) => onChange({ ...topic, [f]: v });
  const updD = (f, v) => onChange({ ...topic, detalhe: { ...topic.detalhe, [f]: v } });

  return (
    <div className="card anim" style={{ border: `1px solid ${open ? type.border + "90" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? type.bg : "transparent", transition: "background .2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: type.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bi name={type.icon} size={14} style={{ color: "#fff" }} />
        </div>
        <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, background: `${type.border}22`, color: type.text, flexShrink: 0, letterSpacing: .8, border: `1px solid ${type.border}40` }}>{topic.tipo}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: topic.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic.titulo || t.noTitle}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}><Bi name="trash3" size={13} /></button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>
      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 160px", gap: 16, marginBottom: 18 }}>
            <div><label className="lbl">{t.topicTitleLabel}</label><input className="inp" value={topic.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.topicTitlePh} /></div>
            <div><label className="lbl">{t.topicTypeLabel}</label>
              <select value={topic.tipo} onChange={e => upd("tipo", e.target.value)}
                style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: type.text, background: "var(--bg2)", border: `1.5px solid ${type.border}60`, borderRadius: "var(--r-sm)", outline: "none", width: "100%" }}>
                {Object.keys(STUDY_TYPES).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.topicSummaryLabel}</label><textarea className="inp" rows={2} value={topic.resumo} onChange={e => upd("resumo", e.target.value)} placeholder={t.topicSummaryPh} /></div>
          <div className="div" />
          <ArrayField label={t.topicExplanation} values={topic.detalhe.explicacao} onChange={v => updD("explicacao", v)} placeholder={t.topicExplanationPh} />
          <ArrayField label={t.topicExamples} values={topic.detalhe.exemplos} onChange={v => updD("exemplos", v)} placeholder={t.topicExamplesPh} />
          <ArrayField label={t.topicCode} values={topic.detalhe.codigo} onChange={v => updD("codigo", v)} mono placeholder={t.topicCodePh} />
        </div>
      )}
    </div>
  );
}
