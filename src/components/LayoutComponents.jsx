import React, { useState, useEffect } from "react";
import { Bi } from "./Bi";

export function ResizeHandle({ onResize }) {
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const h = e => { if (dragging) onResize(e.clientX); };
    const u = () => setDragging(false);
    window.addEventListener("mousemove", h); window.addEventListener("mouseup", u);
    return () => { window.removeEventListener("mousemove", h); window.removeEventListener("mouseup", u); };
  }, [dragging, onResize]);
  return <div className={`resize-handle${dragging ? " dragging" : ""}`} onMouseDown={() => setDragging(true)} />;
}

export function Stats({ config }) {
  const isChangelog = config.template === "changelog";
  const isStudy = config.template === "study";
  const count = isChangelog ? config.mudancas.length : (isStudy ? config.topicos.length : config.problemas.length);
  const label = isChangelog ? "Mudanças" : (isStudy ? "Tópicos" : "Bugs");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: 8 }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--tx)", lineHeight: 1.1 }}>{count}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
      </div>
      <div style={{ width: 1, height: 22, background: "var(--b2)" }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--tx)", lineHeight: 1.1 }}>{config.formato}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: .5 }}>Formato</div>
      </div>
    </div>
  );
}
