import React, { useState } from "react";
import { Bi } from "./Bi";
import { ArrayField } from "./UI";
import { useIsMobile } from "../hooks/useIsMobile";
import { SEV } from "../constants/templates";

export function BugProblemCard({ prob, idx, onChange, onRemove }) {
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
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: prob.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prob.titulo || "Sem título"}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}><Bi name="trash3" size={13} /></button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>
      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 140px", gap: 16, marginBottom: 18 }}>
            <div><label className="lbl">Título</label><input className="inp" value={prob.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: SQL Injection no endpoint /login" /></div>
            <div><label className="lbl">Severidade</label>
              <select value={prob.severity} onChange={e => upd("severity", e.target.value)}
                style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: sev.text, background: "var(--bg2)", border: `1.5px solid ${sev.border}60`, borderRadius: "var(--r-sm)", outline: "none", width: "100%" }}>
                <option value="ALTA">ALTA</option><option value="MÉDIA">MÉDIA</option><option value="BAIXA">BAIXA</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div><label className="lbl">Resumo (tabela)</label><textarea className="inp" rows={3} value={prob.resumo} onChange={e => upd("resumo", e.target.value)} placeholder="Descrição breve..." /></div>
            <div><label className="lbl">Resolução (tabela)</label><textarea className="inp" rows={3} value={prob.resolucao} onChange={e => upd("resolucao", e.target.value)} placeholder="Ação corretiva..." /></div>
          </div>
          <div className="div" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Bi name="list-nested" size={14} style={{ color: "var(--tx3)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--tx3)", letterSpacing: 1.1, textTransform: "uppercase" }}>Detalhamento técnico</span>
          </div>
          <ArrayField label="Onde ocorre" values={prob.detalhe.ondeOcorre} onChange={v => updD("ondeOcorre", v)} placeholder="Arquivo, função ou endpoint..." />
          <ArrayField label="Código onde ocorre" values={prob.detalhe.codigoOnde} onChange={v => updD("codigoOnde", v)} mono placeholder="// trecho vulnerável" />
          <ArrayField label="Por que é um problema" values={prob.detalhe.porqueProblema} onChange={v => updD("porqueProblema", v)} placeholder="Impacto e risco associado..." />
          <ArrayField label="Explicação de resolução" values={prob.detalhe.textoResolucao} onChange={v => updD("textoResolucao", v)} placeholder="Passos para correção..." />
          <ArrayField label="Código de resolução" values={prob.detalhe.codigoResolucao} onChange={v => updD("codigoResolucao", v)} mono placeholder="// código corrigido" />
        </div>
      )}
    </div>
  );
}
