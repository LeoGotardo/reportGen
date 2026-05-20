import React, { useState } from "react";
import { Bi } from "./Bi";
import { useAssets } from "../contexts/AssetsContext";
import { useLang } from "../contexts/LangContext";

export function PaletteBar({ config, setConfig }) {
  const { assets, addPalette } = useAssets();
  const { lang }  = useLang();
  const [saving, setSaving]   = useState(false);
  const [name, setName]       = useState("");
  const [open, setOpen]       = useState(false);

  const pt = s => lang === "en" ? s[1] : s[0];

  const save = () => {
    if (!name.trim()) return;
    addPalette(name.trim(), { ...config.cores });
    setName(""); setSaving(false);
  };

  const apply = pal => {
    setConfig(c => ({ ...c, cores: { ...c.cores, ...pal.colors } }));
    setOpen(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {/* Save current */}
      {saving ? (
        <>
          <input
            className="inp" autoFocus value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setSaving(false); setName(""); } }}
            placeholder={pt(["Nome da paleta", "Palette name"])}
            style={{ padding: "7px 12px", fontSize: 12, width: 180, flex: "none" }}
          />
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 12 }} onClick={save} disabled={!name.trim()}>
            <Bi name="floppy-fill" size={12} /> {pt(["Salvar", "Save"])}
          </button>
          <button className="btn-ghost" style={{ padding: "8px 10px", fontSize: 12 }} onClick={() => { setSaving(false); setName(""); }}>
            ✕
          </button>
        </>
      ) : (
        <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12, gap: 6 }} onClick={() => setSaving(true)}>
          <Bi name="floppy-fill" size={12} /> {pt(["Salvar paleta", "Save palette"])}
        </button>
      )}

      {/* Apply from library */}
      {assets.palettes.length > 0 && !saving && (
        <div style={{ position: "relative" }}>
          <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12, gap: 6 }} onClick={() => setOpen(o => !o)}>
            <Bi name="brush-fill" size={12} /> {pt(["Aplicar paleta", "Apply palette"])}
            <Bi name={open ? "chevron-up" : "chevron-down"} size={10} />
          </button>
          {open && (
            <div className="anim" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100, background: "var(--bg2)", border: "1px solid var(--b2)", borderRadius: "var(--r-sm)", padding: 6, minWidth: 200, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
              {assets.palettes.map(pal => (
                <button key={pal.id} onClick={() => apply(pal)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", background: "transparent", border: "none", borderRadius: 7, cursor: "pointer", textAlign: "left", transition: "background .12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surf)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", gap: 3 }}>
                    {["primaria", "secundaria", "altaSev", "feat", "concept"].filter(k => pal.colors[k]).slice(0, 4).map(k => (
                      <div key={k} style={{ width: 14, height: 14, borderRadius: 4, background: `#${pal.colors[k]}`, border: "1px solid rgba(0,0,0,0.2)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tx)", flex: 1 }}>{pal.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
