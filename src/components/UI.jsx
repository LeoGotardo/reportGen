import React, { useState } from "react";
import { Bi } from "./Bi";

export function ArrayField({ label, values, onChange, mono = false, placeholder = "" }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {label && <label className="lbl">{label}</label>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, marginTop: 12, borderRadius: 8, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--tx3)", fontFamily: "var(--mono)" }}>{i + 1}</span>
            </div>
            <textarea value={v} onChange={e => { const n = [...values]; n[i] = e.target.value; onChange(n); }}
              rows={mono ? 3 : 2} placeholder={placeholder} className="inp"
              style={{ fontFamily: mono ? "var(--mono)" : "var(--fn)", fontSize: mono ? 12.5 : 14, flex: 1 }} />
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="btn-icon" style={{ marginTop: 4 }} title="Remover">
              <Bi name="trash3" size={13} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...values, ""])} className="btn-ghost" style={{ marginTop: 12 }}>
        <Bi name="plus-lg" size={12} /> Adicionar linha
      </button>
    </div>
  );
}

export function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg2)", border: "1.5px solid var(--b2)", borderRadius: "var(--r-sm)", padding: "9px 13px" }}>
        <div style={{ position: "relative", width: 32, height: 32, borderRadius: 7, overflow: "hidden", flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", inset: 0, background: `#${value}` }} />
          <input type="color" value={`#${value}`} onChange={e => onChange(e.target.value.replace("#", "").toUpperCase())}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", border: "none" }} />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--tx3)" }}>#</span>
        <input type="text" value={value} onChange={e => onChange(e.target.value.replace("#", "").toUpperCase())} maxLength={6}
          style={{ flex: 1, background: "transparent", border: "none", fontFamily: "var(--mono)", fontSize: 13, color: "var(--tx)", padding: 0, boxShadow: "none", minWidth: 0 }} />
      </div>
    </div>
  );
}

export function LogoField({ value, nome, onChange }) {
  const [drag, setDrag] = useState(false);
  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => onChange(e.target.result, f.name);
    r.readAsDataURL(f);
  };
  return (
    <div>
      <label className="lbl">Logo da Empresa</label>
      {value ? (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src={value} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</div>
            <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <Bi name="check-circle-fill" size={11} /> Carregado
            </div>
          </div>
          <label className="btn-ghost" style={{ cursor: "pointer" }}><Bi name="arrow-repeat" size={13} /> Trocar<input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} /></label>
          <button className="btn-icon" onClick={() => onChange(null, "")} style={{ borderColor: "rgba(239,68,68,.3)", color: "#ef4444" }}><Bi name="trash3" size={13} /></button>
        </div>
      ) : (
        <label onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "44px 24px", cursor: "pointer",
            border: `2px dashed ${drag ? "var(--ac)" : "var(--b2)"}`, borderRadius: "var(--r)",
            background: drag ? "rgba(98,113,245,.07)" : "var(--bg2)", transition: "all .2s" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: drag ? "var(--glow)" : "var(--surf)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
            <Bi name="cloud-arrow-up" size={28} style={{ color: drag ? "var(--ac)" : "var(--tx3)" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: drag ? "var(--ac)" : "var(--tx2)" }}>Arraste ou <span style={{ color: "var(--ac)", textDecoration: "underline" }}>clique para selecionar</span></div>
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 5 }}>PNG, JPG, SVG, WEBP</div>
          </div>
          <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );
}

export function SectionHeader({ icon, title, subtitle, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
      <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--b2)" }}>
        <span style={{ fontSize: 22, color: "var(--ac)" }}>{icon}</span>
      </div>
      <div style={{ flex: 1, paddingTop: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 className="sec-title">{title}</h2>
          {badge !== undefined && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ac)", background: "var(--glow)", padding: "2px 10px", borderRadius: 20, fontFamily: "var(--mono)" }}>{badge}</span>
          )}
        </div>
        {subtitle && <p style={{ fontSize: 13, color: "var(--tx3)", marginTop: 5 }}>{subtitle}</p>}
      </div>
    </div>
  );
}
