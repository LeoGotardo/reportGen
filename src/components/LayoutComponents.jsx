import React, { useState } from "react";
import { Bi } from "./Bi";
import { CHANGE_TYPES, SEV, STUDY_TYPES } from "../constants/templates";

// Fix #3: ResizeHandle — onMouseDown registers listeners on window directly
// and cleans them up in the same closure, avoiding the useEffect memory leak.
export function ResizeHandle({ onResize }) {
  const [dragging, setDragging] = useState(false);

  const onMouseDown = e => {
    e.preventDefault();
    setDragging(true);
    const onMove = ev => onResize(ev.clientX);
    const onUp   = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className={`resize-handle${dragging ? " dragging" : ""}`}
      onMouseDown={onMouseDown}
    />
  );
}

// Fix #4: Stats — restored full colored pills per severity / change type
export function Stats({ config }) {
  if (config.template === "study") {
    const total = config.topicos.length;
    if (total === 0) return <span style={{ fontSize: 13, color: "var(--tx3)" }}>Sem tópicos</span>;
    const grouped = config.topicos.reduce((acc, m) => { acc[m.tipo] = (acc[m.tipo] || 0) + 1; return acc; }, {});
    return (
      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
        {Object.keys(STUDY_TYPES).filter(t => grouped[t]).map(t => {
          const info = STUDY_TYPES[t];
          return (
            <span key={t} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${info.border}18`, color: info.text, border: `1px solid ${info.border}30` }}>
              {grouped[t]} {t}
            </span>
          );
        })}
      </div>
    );
  }

  if (config.template === "changelog") {
    const total = config.mudancas.length;
    if (total === 0) return <span style={{ fontSize: 13, color: "var(--tx3)" }}>Sem mudanças</span>;
    const grouped = config.mudancas.reduce((acc, m) => { acc[m.tipo] = (acc[m.tipo] || 0) + 1; return acc; }, {});
    return (
      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
        {["breaking", "feat", "fix", "refactor"].filter(t => grouped[t]).map(t => {
          const info = CHANGE_TYPES[t];
          return (
            <span key={t} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}30` }}>
              {grouped[t]} {info.label}
            </span>
          );
        })}
      </div>
    );
  }

  // bugs
  const total = config.problemas.length;
  if (total === 0) return <span style={{ fontSize: 13, color: "var(--tx3)" }}>Sem problemas</span>;
  const alta  = config.problemas.filter(p => p.severity === "ALTA").length;
  const media = config.problemas.filter(p => p.severity === "MÉDIA").length;
  const baixa = config.problemas.filter(p => p.severity === "BAIXA").length;
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
      {alta  > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(192,0,0,.15)",   color: "#ff8080", border: "1px solid rgba(192,0,0,.3)"   }}>{alta} Alta</span>}
      {media > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(197,90,17,.15)", color: "#ffa060", border: "1px solid rgba(197,90,17,.3)" }}>{media} Média</span>}
      {baixa > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(55,86,35,.15)",  color: "#86efac", border: "1px solid rgba(55,86,35,.3)"  }}>{baixa} Baixa</span>}
    </div>
  );
}