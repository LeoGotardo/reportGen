import React, { useState } from "react";
import { Bi } from "./Bi";
import { useIsMobile } from "../hooks/useIsMobile";
import { CHANGE_TYPES } from "../constants/templates";

function TypeIcon({ type, color }) {
  const s = { flexShrink: 0 };
  if (type === "feat")     return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><polygon points="7,1 9,5 14,5.5 10.5,9 11.5,14 7,11.5 2.5,14 3.5,9 0,5.5 5,5" style={{ fill: color }}/></svg>;
  if (type === "fix")      return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="2"/><line x1="5" y1="5" x2="9" y2="9" stroke={color} strokeWidth="2"/><line x1="9" y1="5" x2="5" y2="9" stroke={color} strokeWidth="2"/></svg>;
  if (type === "breaking") return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><polygon points="7,1 13,13 1,13" fill="none" stroke={color} strokeWidth="2"/><line x1="7" y1="5" x2="7" y2="9" stroke={color} strokeWidth="2"/><circle cx="7" cy="11.5" r="1" style={{ fill: color }}/></svg>;
  if (type === "refactor") return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><path d="M2,7 Q7,2 12,7 Q7,12 2,7" fill="none" stroke={color} strokeWidth="2"/><polyline points="10,4 13,7 10,10" fill="none" stroke={color} strokeWidth="2"/></svg>;
  if (type === "perf")     return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><polyline points="1,11 5,7 8,9 13,3" fill="none" stroke={color} strokeWidth="2"/><circle cx="13" cy="3" r="1.5" style={{ fill: color }}/></svg>;
  if (type === "style")    return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><circle cx="7" cy="7" r="5" style={{ fill: color }} opacity="0.25"/><circle cx="7" cy="7" r="2.5" style={{ fill: color }}/></svg>;
  if (type === "chore")    return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><circle cx="7" cy="7" r="5" fill="none" stroke={color} strokeWidth="2"/><line x1="7" y1="2" x2="7" y2="4.5" stroke={color} strokeWidth="2"/><line x1="7" y1="9.5" x2="7" y2="12" stroke={color} strokeWidth="2"/><line x1="2" y1="7" x2="4.5" y2="7" stroke={color} strokeWidth="2"/><line x1="9.5" y1="7" x2="12" y2="7" stroke={color} strokeWidth="2"/></svg>;
  return <svg viewBox="0 0 14 14" width="14" height="14" style={s}><circle cx="7" cy="7" r="5" style={{ fill: color }} opacity="0.5"/></svg>;
}

export function ChangeCard({ change, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const isMob = useIsMobile();
  const t = CHANGE_TYPES[change.tipo] || CHANGE_TYPES.feat;
  const upd = (f, v) => onChange({ ...change, [f]: v });

  return (
    <div className="card anim" style={{ border: `1px solid ${open ? t.color + "70" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? t.bg : "transparent", transition: "background .2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <TypeIcon type={change.tipo} color="#fff" />
        </div>
        <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 10, fontWeight: 800, background: `${t.color}22`, color: t.color, flexShrink: 0, letterSpacing: .8, border: `1px solid ${t.color}40` }}>{t.label}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: change.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{change.titulo || "Sem título"}</span>
        {change.arquivo && (
          <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--tx3)", background: "var(--s2)", padding: "3px 9px", borderRadius: 6, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{change.arquivo}</span>
        )}
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}><Bi name="trash3" size={13} /></button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>

      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>

          <div style={{ marginBottom: 20 }}>
            <label className="lbl">Tipo de Mudança</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.entries(CHANGE_TYPES).map(([k, v]) => {
                const active = change.tipo === k;
                const iconColor = active ? v.color : "var(--tx3)";
                return (
                  <button
                    key={k}
                    onClick={() => upd("tipo", k)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                      border: `2px solid ${active ? v.color : "var(--b2)"}`,
                      background: active ? v.bg : "var(--bg2)",
                      color: active ? v.color : "var(--tx3)",
                      fontWeight: 700, fontSize: 13, transition: "all .15s",
                    }}
                  >
                    <TypeIcon type={k} color={iconColor} />
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="lbl">Título da mudança</label>
            <input className="inp" value={change.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: Refatorar sistema de autenticação JWT" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="lbl">Arquivo(s) modificado(s)</label>
            <input className="inp" value={change.arquivo} onChange={e => upd("arquivo", e.target.value)} placeholder="src/auth/jwt.service.ts, src/middleware/auth.ts" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label className="lbl">Descrição da mudança</label>
              <textarea className="inp" rows={3} value={change.descricao} onChange={e => upd("descricao", e.target.value)} placeholder="O que foi alterado e como..." />
            </div>
            <div>
              <label className="lbl">Motivação / Contexto</label>
              <textarea className="inp" rows={3} value={change.motivacao} onChange={e => upd("motivacao", e.target.value)} placeholder="Por que essa mudança foi feita..." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label className="lbl">Impacto técnico</label>
              <textarea className="inp" rows={3} value={change.impacto} onChange={e => upd("impacto", e.target.value)} placeholder="Como isso afeta o sistema..." />
            </div>
            <div>
              <label className="lbl">Notas adicionais</label>
              <textarea className="inp" rows={3} value={change.notas} onChange={e => upd("notas", e.target.value)} placeholder="Observações importantes..." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
            <div>
              <label className="lbl">Código ANTES (opcional)</label>
              <textarea className="inp" rows={5} value={change.codigoAntes} onChange={e => upd("codigoAntes", e.target.value)}
                style={{ fontFamily: "var(--mono)", fontSize: 12 }} placeholder="// trecho antigo" />
            </div>
            <div>
              <label className="lbl">Código DEPOIS (opcional)</label>
              <textarea className="inp" rows={5} value={change.codigoDepois} onChange={e => upd("codigoDepois", e.target.value)}
                style={{ fontFamily: "var(--mono)", fontSize: 12 }} placeholder="// trecho novo" />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}