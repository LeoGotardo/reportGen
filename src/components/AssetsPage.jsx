import React, { useState, useRef } from "react";
import { Bi } from "./Bi";
import { useAssets } from "../contexts/AssetsContext";
import { useLang } from "../contexts/LangContext";

const SNIPPET_CATEGORIES = ["intro", "summary", "conclusion", "other"];

const catColor = { intro: "#6271f5", summary: "#10b981", conclusion: "#f59e0b", other: "#8890bc" };

function s(lang, pt, en) { return lang === "en" ? en : pt; }

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 40px", color: "var(--tx3)" }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid var(--b2)" }}>
        <Bi name={icon} size={30} style={{ color: "var(--tx3)" }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tx2)", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
    </div>
  );
}

function ColorSwatches({ colors }) {
  const keys = ["primaria", "secundaria", "altaSev", "mediaSev", "baixaSev", "concept", "practice", "feat", "fix", "breaking"];
  const present = keys.filter(k => colors[k]);
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {present.slice(0, 8).map(k => (
        <div key={k} style={{ width: 18, height: 18, borderRadius: 5, background: `#${colors[k]}`, border: "1px solid rgba(0,0,0,0.2)", flexShrink: 0 }} title={`#${colors[k]}`} />
      ))}
    </div>
  );
}

// ─── Logos tab ────────────────────────────────────────────────────────────────

function LogosTab({ config, setConfig, lang }) {
  const { assets, addLogo, removeLogo } = useAssets();
  const [name, setName]   = useState("");
  const [preview, setPreview] = useState(null);
  const [drag, setDrag]   = useState(false);
  const fileRef = useRef(null);

  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    if (f.size > 512 * 1024) { alert(s(lang, "Imagem muito grande (máx 512 KB)", "Image too large (max 512 KB)")); return; }
    const r = new FileReader();
    r.onload = e => { setPreview(e.target.result); setName(n => n || f.name.replace(/\.[^.]+$/, "")); };
    r.readAsDataURL(f);
  };

  const save = () => {
    if (!preview || !name.trim()) return;
    addLogo(name.trim(), preview);
    setName(""); setPreview(null);
  };

  const useLogo = logo => {
    if (setConfig) setConfig(c => ({ ...c, logo: logo.dataUrl, logoNome: logo.name }));
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      {/* Upload zone */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--tx3)", marginBottom: 14 }}>
          {s(lang, "Adicionar logo à biblioteca", "Add logo to library")}
        </div>
        {preview ? (
          <div className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
            <img src={preview} alt="preview" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 10, background: "var(--bg2)", padding: 4, border: "1px solid var(--b2)" }} />
            <div style={{ flex: 1 }}>
              <input
                className="inp" value={name}
                onChange={e => setName(e.target.value)}
                placeholder={s(lang, "Nome da logo", "Logo name")}
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={save} disabled={!name.trim()}>
                  <Bi name="floppy-fill" size={13} /> {s(lang, "Salvar", "Save")}
                </button>
                <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => { setPreview(null); setName(""); }}>
                  {s(lang, "Cancelar", "Cancel")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "36px 24px",
              cursor: "pointer", border: `2px dashed ${drag ? "var(--ac)" : "var(--b2)"}`,
              borderRadius: "var(--r)", background: drag ? "rgba(98,113,245,.07)" : "var(--bg2)", transition: "all .2s",
            }}
          >
            <Bi name="cloud-arrow-up" size={28} style={{ color: drag ? "var(--ac)" : "var(--tx3)" }} />
            <span style={{ fontSize: 13, color: drag ? "var(--ac)" : "var(--tx2)", fontWeight: 600 }}>
              {s(lang, "Arraste ou clique para enviar", "Drag or click to upload")}
            </span>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
          </label>
        )}
      </div>

      {/* Library grid */}
      {assets.logos.length === 0 ? (
        <EmptyState icon="images" title={s(lang, "Nenhuma logo salva", "No logos saved")} sub={s(lang, "Faça upload para adicionar à biblioteca", "Upload to add to library")} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {assets.logos.map(logo => (
            <div key={logo.id} className="card" style={{ padding: "16px 18px" }}>
              <div style={{ width: "100%", height: 80, background: "var(--bg2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden", border: "1px solid var(--b1)" }}>
                <img src={logo.dataUrl} alt={logo.name} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{logo.name}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "7px 10px", fontSize: 12 }} onClick={() => useLogo(logo)}>
                  <Bi name="check2-circle" size={13} /> {s(lang, "Usar", "Use")}
                </button>
                <button className="btn-icon" style={{ borderColor: "rgba(239,68,68,.3)", color: "#ef4444" }} onClick={() => removeLogo(logo.id)}>
                  <Bi name="trash3" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Palettes tab ─────────────────────────────────────────────────────────────

function PalettesTab({ config, setConfig, lang }) {
  const { assets, addPalette, removePalette } = useAssets();
  const [saving, setSaving] = useState(false);
  const [palName, setPalName] = useState("");

  const saveCurrent = () => {
    if (!palName.trim()) return;
    addPalette(palName.trim(), { ...config.cores });
    setPalName(""); setSaving(false);
  };

  const applyPalette = pal => {
    if (setConfig) setConfig(c => ({ ...c, cores: { ...c.cores, ...pal.colors } }));
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      {/* Save current */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 12 }}>
        {saving ? (
          <>
            <input
              className="inp" autoFocus value={palName}
              onChange={e => setPalName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") saveCurrent(); if (e.key === "Escape") setSaving(false); }}
              placeholder={s(lang, "Nome da paleta", "Palette name")}
              style={{ flex: 1, maxWidth: 260 }}
            />
            <button className="btn-primary" style={{ padding: "11px 18px", fontSize: 13 }} onClick={saveCurrent} disabled={!palName.trim()}>
              <Bi name="floppy-fill" size={13} /> {s(lang, "Salvar", "Save")}
            </button>
            <button className="btn-ghost" style={{ padding: "11px 14px", fontSize: 13 }} onClick={() => { setSaving(false); setPalName(""); }}>
              {s(lang, "Cancelar", "Cancel")}
            </button>
          </>
        ) : (
          <button className="btn-ghost" onClick={() => setSaving(true)}>
            <Bi name="floppy-fill" size={14} /> {s(lang, "Salvar cores atuais como paleta", "Save current colors as palette")}
          </button>
        )}
      </div>

      {assets.palettes.length === 0 ? (
        <EmptyState icon="palette2" title={s(lang, "Nenhuma paleta salva", "No palettes saved")} sub={s(lang, "Salve as cores atuais para reutilizar", "Save current colors to reuse later")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assets.palettes.map(pal => (
            <div key={pal.id} className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", marginBottom: 8 }}>{pal.name}</div>
                <ColorSwatches colors={pal.colors} />
              </div>
              <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }} onClick={() => applyPalette(pal)}>
                <Bi name="brush-fill" size={13} /> {s(lang, "Aplicar", "Apply")}
              </button>
              <button className="btn-icon" style={{ borderColor: "rgba(239,68,68,.3)", color: "#ef4444", flexShrink: 0 }} onClick={() => removePalette(pal.id)}>
                <Bi name="trash3" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Snippets tab ─────────────────────────────────────────────────────────────

function SnippetsTab({ lang }) {
  const { assets, addSnippet, removeSnippet } = useAssets();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", category: "other", text: "" });
  const [copied, setCopied] = useState(null);

  const save = () => {
    if (!form.name.trim() || !form.text.trim()) return;
    addSnippet(form.name.trim(), form.category, form.text.trim());
    setForm({ name: "", category: "other", text: "" }); setAdding(false);
  };

  const copy = (id, text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const catLabel = { intro: "Intro", summary: s(lang, "Resumo", "Summary"), conclusion: s(lang, "Conclusão", "Conclusion"), other: s(lang, "Outro", "Other") };

  return (
    <div style={{ padding: "32px 36px" }}>
      {/* Add button */}
      <div style={{ marginBottom: 32 }}>
        {adding ? (
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label className="lbl">{s(lang, "Nome", "Name")}</label>
                <input className="inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={s(lang, "Nome do trecho", "Snippet name")} />
              </div>
              <div>
                <label className="lbl">{s(lang, "Categoria", "Category")}</label>
                <select className="inp" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {SNIPPET_CATEGORIES.map(c => <option key={c} value={c}>{catLabel[c]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">{s(lang, "Texto", "Text")}</label>
              <textarea className="inp" rows={4} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder={s(lang, "Escreva o trecho reutilizável...", "Write the reusable text snippet...")} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }} onClick={save} disabled={!form.name.trim() || !form.text.trim()}>
                <Bi name="floppy-fill" size={13} /> {s(lang, "Salvar trecho", "Save snippet")}
              </button>
              <button className="btn-ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => { setAdding(false); setForm({ name: "", category: "other", text: "" }); }}>
                {s(lang, "Cancelar", "Cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-ghost" onClick={() => setAdding(true)}>
            <Bi name="plus-lg" size={14} /> {s(lang, "Adicionar trecho", "Add snippet")}
          </button>
        )}
      </div>

      {assets.snippets.length === 0 ? (
        <EmptyState icon="blockquote-left" title={s(lang, "Nenhum trecho salvo", "No snippets saved")} sub={s(lang, "Salve textos reutilizáveis para usar nos relatórios", "Save reusable texts to use in your reports")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assets.snippets.map(sn => (
            <div key={sn.id} className="card" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tx)", flex: 1 }}>{sn.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: `${catColor[sn.category]}22`, color: catColor[sn.category], border: `1px solid ${catColor[sn.category]}40` }}>
                  {catLabel[sn.category]}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--tx2)", lineHeight: 1.6, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {sn.text}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-ghost"
                  style={{ padding: "7px 14px", fontSize: 12, color: copied === sn.id ? "#22c55e" : undefined, borderColor: copied === sn.id ? "#22c55e50" : undefined }}
                  onClick={() => copy(sn.id, sn.text)}
                >
                  <Bi name={copied === sn.id ? "check2" : "clipboard"} size={13} />
                  {copied === sn.id ? s(lang, "Copiado!", "Copied!") : s(lang, "Copiar", "Copy")}
                </button>
                <button className="btn-icon" style={{ borderColor: "rgba(239,68,68,.3)", color: "#ef4444" }} onClick={() => removeSnippet(sn.id)}>
                  <Bi name="trash3" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AssetsPage({ config, setConfig }) {
  const { assets } = useAssets();
  const { lang }   = useLang();
  const [tab, setTab] = useState("logos");

  const tabs = [
    { id: "logos",    icon: "images",          label: s(lang, "Logos",    "Logos"),    count: assets.logos.length },
    { id: "palettes", icon: "palette2",        label: s(lang, "Paletas",  "Palettes"), count: assets.palettes.length },
    { id: "snippets", icon: "blockquote-left", label: s(lang, "Trechos",  "Snippets"), count: assets.snippets.length },
  ];

  return (
    <div style={{ padding: "36px 40px 56px", maxWidth: 780, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--b2)" }}>
            <Bi name="collection-fill" size={22} style={{ color: "var(--ac)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--disp)", letterSpacing: -.4, marginBottom: 4 }}>
              {s(lang, "Biblioteca de Assets", "Assets Library")}
            </h2>
            <p style={{ fontSize: 13, color: "var(--tx3)" }}>
              {s(lang, "Logos, paletas e trechos reutilizáveis para todos os relatórios", "Logos, palettes and reusable snippets across all reports")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg2)", padding: 4, borderRadius: 12, border: "1px solid var(--b2)", marginBottom: 28 }}>
        {tabs.map(({ id, icon, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700,
              background: tab === id ? "var(--surf)" : "transparent",
              color: tab === id ? "var(--tx)" : "var(--tx3)",
              border: tab === id ? "1px solid var(--b2)" : "1px solid transparent",
              boxShadow: tab === id ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              transition: "all .15s",
            }}
          >
            <Bi name={icon} size={14} />
            {label}
            {count > 0 && (
              <span style={{ fontSize: 10, fontWeight: 800, background: "var(--glow)", color: "var(--ac)", padding: "1px 8px", borderRadius: 20, fontFamily: "var(--mono)" }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card" style={{ overflow: "hidden" }}>
        {tab === "logos"    && <LogosTab    config={config} setConfig={setConfig} lang={lang} />}
        {tab === "palettes" && <PalettesTab config={config} setConfig={setConfig} lang={lang} />}
        {tab === "snippets" && <SnippetsTab lang={lang} />}
      </div>
    </div>
  );
}
