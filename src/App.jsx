import { useState, useCallback, useRef, useEffect } from "react";

if (!document.getElementById("bi-css")) {
  const link = document.createElement("link");
  link.id = "bi-css"; link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
  document.head.appendChild(link);
}

function Bi({ name, size = 16, style: s = {} }) {
  return <i className={`bi bi-${name}`} style={{ fontSize: size, lineHeight: 1, ...s }} />;
}
function useIsMobile(bp = 860) {
  const [mob, setMob] = useState(() => window.innerWidth <= bp);
  useEffect(() => {
    const h = () => setMob(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return mob;
}

const initialConfig = {
  formato: "ABNT",
  cores: { primaria: "1F3864", secundaria: "2E75B6", altaSev: "C00000", mediaSev: "C55A11", baixaSev: "375623", codeBg: "1E1E1E", codeText: "D4D4D4" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  resumoExecutivo: [""], problemas: [], conclusao: [""],
};

const emptyProblem = () => ({
  id: Date.now() + Math.random(), titulo: "", severity: "ALTA", resumo: "", resolucao: "",
  detalhe: { ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""], textoResolucao: [""], codigoResolucao: [""] },
});

const SEV = {
  ALTA:  { border: "#C00000", text: "#C00000", bg: "rgba(192,0,0,0.07)" },
  MÉDIA: { border: "#C55A11", text: "#C55A11", bg: "rgba(197,90,17,0.07)" },
  BAIXA: { border: "#375623", text: "#375623", bg: "rgba(55,86,35,0.07)" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:   #0c0e18;
    --bg2:  #131525;
    --bg3:  #181a2e;
    --surf: #1e2138;
    --s2:   #252944;
    --b1:   rgba(255,255,255,0.06);
    --b2:   rgba(255,255,255,0.11);
    --tx:   #dde1f5;
    --tx2:  #8890bc;
    --tx3:  #525880;
    --ac:   #6271f5;
    --ac2:  #8b97ff;
    --glow: rgba(98,113,245,0.28);
    --fn:   'Plus Jakarta Sans', sans-serif;
    --mono: 'IBM Plex Mono', monospace;
    --disp: 'Syne', sans-serif;
    --r:    13px;
    --r-sm: 9px;
  }
  html, body, #root { height: 100%; overflow: hidden; }
  body { font-family: var(--fn); background: var(--bg); color: var(--tx); }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--s2); border-radius: 99px; }

  input, textarea, select {
    outline: none; font-family: var(--fn); color: var(--tx);
    background: var(--bg2); border: 1.5px solid var(--b2);
    border-radius: var(--r-sm); transition: border-color .18s, box-shadow .18s;
    font-size: 14px;
  }
  input:focus, textarea:focus, select:focus {
    border-color: var(--ac); box-shadow: 0 0 0 3px var(--glow);
  }
  input::placeholder, textarea::placeholder { color: var(--tx3); }
  select option { background: var(--bg2); }
  button { cursor: pointer; font-family: var(--fn); transition: all .15s; border: none; }
  button:active { transform: scale(.97); }

  .lbl { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--tx3); margin-bottom: 7px; }
  .inp { width: 100%; padding: 11px 15px; font-size: 14px; line-height: 1.5; }
  textarea.inp { resize: vertical; min-height: 78px; }

  .card { background: var(--surf); border: 1px solid var(--b2); border-radius: var(--r); }

  .btn-ghost { padding: 9px 18px; border: 1.5px solid var(--b2); border-radius: var(--r-sm); background: transparent; color: var(--tx2); font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 7px; }
  .btn-ghost:hover { border-color: var(--ac); color: var(--ac); background: var(--glow); }

  .btn-primary { padding: 13px 26px; border-radius: var(--r-sm); background: linear-gradient(135deg, var(--ac), var(--ac2)); color: #fff; font-size: 14px; font-weight: 700; box-shadow: 0 4px 20px var(--glow); display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 28px var(--glow); }
  .btn-primary.full { width: 100%; justify-content: center; }

  .btn-icon { width: 36px; height: 36px; border: 1.5px solid var(--b2); border-radius: var(--r-sm); background: var(--surf); color: var(--tx3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .btn-icon:hover { border-color: var(--ac); color: var(--ac); background: var(--glow); }

  .div { height: 1px; background: var(--b1); margin: 24px 0; }
  .sec-title { font-family: var(--disp); font-size: 21px; font-weight: 800; color: var(--tx); letter-spacing: -.3px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .anim { animation: fadeUp .22s ease; }

  /* ── LAYOUT ── */
  .app-shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .app-header { display: flex; align-items: center; gap: 18px; padding: 0 28px; height: 62px; background: var(--bg2); border-bottom: 1px solid var(--b2); flex-shrink: 0; }
  .app-body { display: flex; flex: 1; overflow: hidden; }

  /* Left pane = editor */
  .pane-editor { min-width: 280px; max-width: 75%; border-right: none; overflow-y: auto; flex-shrink: 0; }
  .editor-inner { padding: 36px 36px 80px; }

  /* Resize handle */
  .resize-handle {
    width: 5px; flex-shrink: 0; background: var(--b1);
    cursor: col-resize; position: relative; transition: background .15s;
    border-left: 1px solid var(--b2); border-right: 1px solid var(--b2);
  }
  .resize-handle:hover, .resize-handle.dragging { background: var(--ac); border-color: var(--ac); }
  .resize-handle::after {
    content: ''; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 3px; height: 40px; border-radius: 99px;
    background: var(--b2); transition: background .15s;
  }
  .resize-handle:hover::after, .resize-handle.dragging::after { background: var(--ac2); }
  @media (max-width: 860px) { .resize-handle { display: none; } }

  /* Right pane = preview + json */
  .pane-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg3); }
  .right-tabs { display: flex; background: var(--bg2); border-bottom: 1px solid var(--b2); flex-shrink: 0; }
  .right-tab { flex: 1; padding: 16px; font-size: 13px; font-weight: 600; color: var(--tx3); background: transparent; border: none; border-bottom: 2.5px solid transparent; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .15s; }
  .right-tab.active { color: var(--ac); border-bottom-color: var(--ac); background: rgba(98,113,245,.05); }
  .right-tab:hover:not(.active) { color: var(--tx2); background: var(--b1); }
  .right-body { flex: 1; overflow: hidden; }
  .right-body.scrollable { overflow-y: auto; }

  /* Mobile overrides */
  @media (max-width: 860px) {
    .pane-editor { width: 100% !important; min-width: 0; border-right: none; display: none; }
    .pane-editor.mob-active { display: block; }
    .pane-right { display: none; }
    .pane-right.mob-active { display: flex; }
    .mob-nav { display: flex !important; }

    .lbl { font-size: 12px !important; margin-bottom: 8px !important; }
    .inp { padding: 14px 16px !important; font-size: 16px !important; }
    textarea.inp { min-height: 96px !important; }
    .btn-ghost { padding: 12px 20px !important; font-size: 14px !important; }
    .btn-primary { padding: 15px 28px !important; font-size: 15px !important; }
    .btn-icon { width: 42px !important; height: 42px !important; }
    .sec-title { font-size: 24px !important; }
    .editor-inner { padding: 24px 18px 100px !important; }

    /* Collapse multi-column grids to single column */
    .card > div[style], .card > div > div[style] { grid-template-columns: 1fr !important; }
  }
  .mob-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg2); border-top: 1px solid var(--b2); z-index: 200; padding: 8px 0 max(8px, env(safe-area-inset-bottom)); }
  .mob-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; padding: 6px 0; font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }

  /* JSON import modal */
  .json-modal-backdrop {
    position: fixed; inset: 0; background: rgba(8,10,20,0.82);
    z-index: 500; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px); padding: 20px;
  }
  .json-modal {
    background: var(--bg2); border: 1px solid var(--b2); border-radius: 20px;
    width: 100%; max-width: 680px; max-height: 88vh;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7);
    animation: fadeUp .2s ease;
  }
  .json-modal-header {
    display: flex; align-items: center; gap: 14px; padding: 22px 26px;
    border-bottom: 1px solid var(--b1); flex-shrink: 0;
  }
  .json-modal-body { flex: 1; overflow-y: auto; padding: 24px 26px; }
  .json-modal-footer { padding: 18px 26px; border-top: 1px solid var(--b1); display: flex; gap: 10px; flex-shrink: 0; }
  .json-textarea {
    width: 100%; min-height: 260px; resize: vertical;
    font-family: var(--mono); font-size: 12.5px; line-height: 1.7;
    padding: 16px 18px; border-radius: var(--r-sm);
    background: #0d1117; color: #e6edf3;
    border: 1.5px solid var(--b2); transition: border-color .18s, box-shadow .18s;
  }
  .json-textarea:focus { border-color: var(--ac); box-shadow: 0 0 0 3px var(--glow); outline: none; }
  .json-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.35); border-radius: var(--r-sm); padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-top: 14px; display: flex; align-items: flex-start; gap: 10px; }
  .json-success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.35); border-radius: var(--r-sm); padding: 12px 16px; font-size: 13px; color: #86efac; margin-top: 14px; display: flex; align-items: center; gap: 10px; }

  /* Export progress overlay */
  .export-overlay {
    position: fixed; inset: 0; background: rgba(12,14,24,0.85); z-index: 999;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;
    backdrop-filter: blur(6px);
  }
  .export-spinner {
    width: 52px; height: 52px; border: 3px solid var(--b2); border-top-color: var(--ac);
    border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─────────────────────────────────────────────────────────────────────────────

function ArrayField({ label, values, onChange, mono = false, placeholder = "" }) {
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

function ColorField({ label, value, onChange }) {
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

function LogoField({ value, nome, onChange }) {
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

function SectionHeader({ icon, title, subtitle, badge }) {
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

function ProblemCard({ prob, idx, onChange, onRemove }) {
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

function Preview({ config }) {
  const primary = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevColors = { ALTA: `#${config.cores.altaSev}`, MÉDIA: `#${config.cores.mediaSev}`, BAIXA: `#${config.cores.baixaSev}` };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 66, maxWidth: 200, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>RELATÓRIO DE BUGS — ANÁLISE TÉCNICA</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Relatório"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || "Escopo do sistema analisado"}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>Autor:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>Versão:</strong> {config.versao}</span>
          <span><strong style={{ color: "#555" }}>Formato:</strong> {config.formato}</span>
        </div>
      </div>
      {config.resumoExecutivo.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Resumo Executivo</div>
          </div>
          {config.resumoExecutivo.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}
      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Tabela de Problemas</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", "Problema", "Severidade", "Resolução"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700, width: i === 0 ? 38 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.problemas.map((p, i) => {
                const c = sevColors[p.severity] || sevColors.ALTA;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 700, color: "#bbb", fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 600 }}>{p.titulo || "—"}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee" }}>
                      <span style={{ background: `${c}18`, color: c, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>{p.severity}</span>
                    </td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", color: "#444" }}>{p.resolucao || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {config.problemas.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.altaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Detalhamento dos Problemas</div>
          </div>
          {config.problemas.map((p, i) => {
            const c = sevColors[p.severity] || sevColors.ALTA;
            const d = p.detalhe || {};
            const hasOnde     = d.ondeOcorre?.some(t => t.trim());
            const hasCodOnde  = d.codigoOnde?.some(t => t.trim());
            const hasPorque   = d.porqueProblema?.some(t => t.trim());
            const hasTextoRes = d.textoResolucao?.some(t => t.trim());
            const hasCodRes   = d.codigoResolucao?.some(t => t.trim());
            return (
              <div key={i} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || "Sem título"}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.severity}</span>
                </div>
                {p.resumo?.trim() && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Descrição</div>
                    <p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{p.resumo}</p>
                  </div>
                )}
                {hasOnde && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Onde ocorre</div>
                    {d.ondeOcorre.filter(t => t.trim()).map((t, j) => (
                      <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>
                    ))}
                  </div>
                )}
                {hasCodOnde && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código onde ocorre</div>
                    {d.codigoOnde.filter(t => t.trim()).map((t, j) => (
                      <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>
                    ))}
                  </div>
                )}
                {hasPorque && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Por que é um problema</div>
                    {d.porqueProblema.filter(t => t.trim()).map((t, j) => (
                      <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>
                    ))}
                  </div>
                )}
                {hasTextoRes && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Explicação de resolução</div>
                    {d.textoResolucao.filter(t => t.trim()).map((t, j) => (
                      <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>
                    ))}
                  </div>
                )}
                {hasCodRes && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código de resolução</div>
                    {d.codigoResolucao.filter(t => t.trim()).map((t, j) => (
                      <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {config.conclusao.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.baixaSev}`, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Conclusão</div>
          </div>
          {config.conclusao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}
    </div>
  );
}

function JsonOutput({ config }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify({ ...config, problemas: config.problemas.map((p, i) => ({ ...p, id: i + 1 })) }, null, 2);
  const copy = () => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = "report-config.json"; a.click();
  };
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0d1117" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 22px", borderBottom: "1px solid #30363d", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#8b949e", marginLeft: 4 }}>report-config.json</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={copy} style={{ padding: "7px 16px", border: "1px solid #30363d", borderRadius: 7, fontSize: 12, fontWeight: 600, background: copied ? "rgba(34,197,94,.15)" : "#161b22", color: copied ? "#22c55e" : "#8b949e", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--fn)" }}>
            <Bi name={copied ? "check-lg" : "clipboard"} size={12} /> {copied ? "Copiado!" : "Copiar"}
          </button>
          <button onClick={download} style={{ padding: "7px 16px", border: "1px solid #30363d", borderRadius: 7, fontSize: 12, fontWeight: 600, background: "#161b22", color: "#8b949e", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--fn)" }}>
            <Bi name="download" size={12} /> Baixar
          </button>
        </div>
      </div>
      <pre style={{ flex: 1, margin: 0, padding: "22px 26px", overflowY: "auto", fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.7, color: "#e6edf3", background: "#0d1117" }}>{json}</pre>
    </div>
  );
}

// ── HTML builder ──────────────────────────────────────────────────────────────
function buildHtml(config) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevColors = { ALTA: `#${config.cores.altaSev}`, MÉDIA: `#${config.cores.mediaSev}`, BAIXA: `#${config.cores.baixaSev}` };
  const escHtml = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const problemRows = config.problemas.map((p, i) => {
    const c = sevColors[p.severity] || sevColors.ALTA;
    return `<tr style="background:${i%2?"#f8f8fb":"#fff"}">
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:700;color:#bbb;font-family:monospace">${i+1}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:600">${escHtml(p.titulo)}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee"><span style="background:${c}22;color:${c};padding:3px 10px;border-radius:12px;font-size:10px;font-weight:800">${p.severity}</span></td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;color:#444">${escHtml(p.resolucao)}</td>
    </tr>`;
  }).join("");

  const problemDetails = config.problemas.map((p, i) => {
    const c = sevColors[p.severity] || sevColors.ALTA;
    const d = p.detalhe || {};
    const sub = (label, items) => items?.some(t=>t.trim()) ? `
      <div style="margin-bottom:14px">
        <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${label}</div>
        ${items.filter(t=>t.trim()).map(t=>`<p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:6px">${escHtml(t)}</p>`).join("")}
      </div>` : "";
    const subCode = (label, items) => items?.some(t=>t.trim()) ? `
      <div style="margin-bottom:14px">
        <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">${label}</div>
        ${items.filter(t=>t.trim()).map(t=>`<pre style="background:#${config.cores.codeBg};color:#${config.cores.codeText};padding:12px 16px;border-radius:8px;font-size:11px;font-family:monospace;line-height:1.6;overflow-x:auto;margin-bottom:8px;white-space:pre-wrap;word-break:break-all">${escHtml(t)}</pre>`).join("")}
      </div>` : "";
    return `
    <div style="margin-bottom:40px;border-left:4px solid ${c};padding-left:20px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:28px;height:28px;border-radius:7px;background:${c};display:inline-flex;align-items:center;justify-content:center">
          <span style="font-size:11px;font-weight:800;color:#fff;font-family:monospace">${i+1}</span>
        </div>
        <span style="font-size:15px;font-weight:800;color:#1a1a2e">${escHtml(p.titulo)}</span>
        <span style="background:${c}22;color:${c};padding:2px 10px;border-radius:12px;font-size:10px;font-weight:800;margin-left:auto">${p.severity}</span>
      </div>
      ${p.resumo?.trim() ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin-bottom:6px">Descrição</div><p style="font-size:12px;color:#333;line-height:1.7">${escHtml(p.resumo)}</p></div>` : ""}
      ${sub("Onde ocorre", d.ondeOcorre)}
      ${subCode("Código onde ocorre", d.codigoOnde)}
      ${sub("Por que é um problema", d.porqueProblema)}
      ${sub("Explicação de resolução", d.textoResolucao)}
      ${subCode("Código de resolução", d.codigoResolucao)}
    </div>`;
  }).join("");

  const logoHtml = config.logo ? `<div style="margin-bottom:28px"><img src="${config.logo}" style="max-height:64px;max-width:200px;object-fit:contain" /></div>` : "";
  const resumoHtml = config.resumoExecutivo.some(t=>t.trim()) ? `
    <div style="padding:38px 48px 0">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
        <div style="width:5px;height:24px;background:${primary};border-radius:3px;display:inline-block"></div>
        <span style="font-size:18px;font-weight:800;color:${primary}">Resumo Executivo</span>
      </div>
      ${config.resumoExecutivo.filter(t=>t.trim()).map(t=>`<p style="font-size:13px;color:#333;margin-bottom:12px">${escHtml(t)}</p>`).join("")}
    </div>` : "";

  const tabelaHtml = config.problemas.length ? `
    <div style="padding:38px 48px 0">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
        <div style="width:5px;height:24px;background:${sevColors.ALTA};border-radius:3px;display:inline-block"></div>
        <span style="font-size:18px;font-weight:800;color:${primary}">Tabela de Problemas</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:${primary}">
          <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700;width:38px">#</th>
          <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">Problema</th>
          <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">Severidade</th>
          <th style="color:#fff;padding:10px 14px;text-align:left;font-weight:700">Resolução</th>
        </tr></thead>
        <tbody>${problemRows}</tbody>
      </table>
    </div>` : "";

  const detalhesHtml = config.problemas.length ? `
    <div style="padding:38px 48px 0">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div style="width:5px;height:24px;background:${sevColors.ALTA};border-radius:3px;display:inline-block"></div>
        <span style="font-size:18px;font-weight:800;color:${primary}">Detalhamento dos Problemas</span>
      </div>
      ${problemDetails}
    </div>` : "";

  const conclusaoHtml = config.conclusao.some(t=>t.trim()) ? `
    <div style="padding:38px 48px 56px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
        <div style="width:5px;height:24px;background:${sevColors.BAIXA||"#375623"};border-radius:3px;display:inline-block"></div>
        <span style="font-size:18px;font-weight:800;color:${primary}">Conclusão</span>
      </div>
      ${config.conclusao.filter(t=>t.trim()).map(t=>`<p style="font-size:13px;color:#333;margin-bottom:12px">${escHtml(t)}</p>`).join("")}
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escHtml(config.titulo) || "Relatório Técnico"}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .no-print{display:none!important}
      @page{margin:1.5cm}
    }
    .print-bar{background:#1e2138;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
    .print-btn{padding:8px 20px;border:none;border-radius:8px;background:#6271f5;color:#fff;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
    .print-btn:hover{filter:brightness(1.1)}
    .save-btn{padding:8px 20px;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:transparent;color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;cursor:pointer}
    .bar-label{font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace}
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <svg width="18" height="18" fill="#6271f5" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
    <span style="color:#fff;font-weight:700;font-size:14px;font-family:Arial">Relatório Técnico</span>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
    <span class="bar-label">${escHtml(config.formato)} · v${escHtml(config.versao)}</span>
  </div>
  <div style="padding:56px 48px 42px;background:linear-gradient(160deg,${primary}08,transparent);border-bottom:4px solid ${primary}">
    ${logoHtml}
    <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:14px">RELATÓRIO DE BUGS — ANÁLISE TÉCNICA</div>
    <div style="font-size:30px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:12px;font-family:Georgia,serif">${escHtml(config.titulo) || "Título do Relatório"}</div>
    <div style="font-size:15px;color:${secondary};font-weight:500;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid ${secondary}30">${escHtml(config.subtitulo) || "Escopo do sistema analisado"}</div>
    <div style="display:flex;gap:28px;font-size:12px;color:#888">
      <span><strong style="color:#555">Autor:</strong> ${escHtml(config.autor) || "—"}</span>
      <span><strong style="color:#555">Versão:</strong> ${escHtml(config.versao)}</span>
      <span><strong style="color:#555">Formato:</strong> ${escHtml(config.formato)}</span>
    </div>
  </div>
  ${resumoHtml}
  ${tabelaHtml}
  ${detalhesHtml}
  ${conclusaoHtml}
</body>
</html>`;
}

// ── DOCX Builder (client-side via docx library) ───────────────────────────────
async function loadDocxLib() {
  if (window.docx) return window.docx;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/docx@9.0.2/build/index.umd.js";
    s.onload = () => resolve(window.docx);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function buildDocx(config) {
  const docx = await loadDocxLib();
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, PageBreak, LevelFormat, ImageRun
  } = docx;

  const primary   = config.cores.primaria;
  const secondary = config.cores.secundaria;
  const sevHex = { ALTA: config.cores.altaSev, MÉDIA: config.cores.mediaSev, BAIXA: config.cores.baixaSev };
  const sevLabel = { ALTA: "ALTA", MÉDIA: "MÉDIA", BAIXA: "BAIXA" };

  const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  // Page width for A4: 11906 DXA, margins 1440 each side → content = 9026
  const contentW = 9026;

  const heading = (text, level, color = primary) => new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    border: level === HeadingLevel.HEADING_1 ? {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: primary, space: 4 }
    } : undefined,
    children: [new TextRun({ text, bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : 26, color, font: "Arial" })]
  });

  const para = (text, options = {}) => new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: text || "", size: 22, font: "Arial", color: "333333", ...options })]
  });

  const subLabel = (text) => new Paragraph({
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: text.toUpperCase(), size: 16, bold: true, color: "999999", font: "Arial" })]
  });

  const codeBlock = (text) => new Paragraph({
    spacing: { after: 120 },
    shading: { type: ShadingType.CLEAR, fill: config.cores.codeBg },
    indent: { left: 360, right: 360 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "444444", space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "444444", space: 4 },
      left: { style: BorderStyle.THICK, size: 8, color: "6271f5", space: 4 },
      right: { style: BorderStyle.SINGLE, size: 1, color: "444444", space: 4 },
    },
    children: [new TextRun({ text: text || "", size: 18, font: "Courier New", color: config.cores.codeText })]
  });

  const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] });

  // Cover section
  const coverChildren = [];

  // Logo (if available)
  if (config.logo && config.logo.startsWith("data:image")) {
    try {
      const match = config.logo.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const imgType = match[1];
        const imgData = match[2];
        const byteStr = atob(imgData);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
        coverChildren.push(new Paragraph({
          spacing: { after: 200 },
          children: [new ImageRun({ data: arr, transformation: { width: 120, height: 60 }, type: imgType })]
        }));
      }
    } catch(e) { /* skip logo if error */ }
  }

  coverChildren.push(
    new Paragraph({
      spacing: { before: 480, after: 80 },
      children: [new TextRun({ text: "RELATÓRIO DE BUGS — ANÁLISE TÉCNICA", size: 16, color: "AAAAAA", font: "Arial", bold: true })]
    }),
    new Paragraph({
      spacing: { after: 160 },
      border: { bottom: { style: BorderStyle.THICK, size: 8, color: primary, space: 4 } },
      children: [new TextRun({ text: config.titulo || "Título do Relatório", size: 52, bold: true, color: primary, font: "Arial" })]
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: config.subtitulo || "Escopo do sistema analisado", size: 26, color: secondary, font: "Arial" })]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Autor: ", bold: true, size: 20, color: "555555", font: "Arial" }),
        new TextRun({ text: config.autor || "—", size: 20, color: "888888", font: "Arial" }),
        new TextRun({ text: "     Versão: ", bold: true, size: 20, color: "555555", font: "Arial" }),
        new TextRun({ text: config.versao || "1.0", size: 20, color: "888888", font: "Arial" }),
        new TextRun({ text: "     Formato: ", bold: true, size: 20, color: "555555", font: "Arial" }),
        new TextRun({ text: config.formato || "ABNT", size: 20, color: "888888", font: "Arial" }),
      ]
    })
  );

  const children = [...coverChildren, spacer()];

  // Resumo Executivo
  if (config.resumoExecutivo.some(t => t.trim())) {
    children.push(heading("Resumo Executivo", HeadingLevel.HEADING_1, primary));
    config.resumoExecutivo.filter(t => t.trim()).forEach(t => children.push(para(t)));
    children.push(spacer());
  }

  // Tabela de Problemas
  if (config.problemas.length > 0) {
    children.push(heading("Tabela de Problemas", HeadingLevel.HEADING_1, primary));

    const headerRow = new TableRow({
      tableHeader: true,
      children: ["#", "Problema", "Severidade", "Resolução"].map((h, ci) => new TableCell({
        borders,
        shading: { type: ShadingType.CLEAR, fill: primary },
        width: { size: [600, 4000, 1200, 3226][ci], type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })]
      }))
    });

    const dataRows = config.problemas.map((p, i) => new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 600, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i % 2 ? "F8F8FB" : "FFFFFF" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: String(i+1), bold: true, color: "BBBBBB", size: 18, font: "Courier New" })] })]
        }),
        new TableCell({
          borders, width: { size: 4000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i % 2 ? "F8F8FB" : "FFFFFF" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: p.titulo || "—", bold: true, size: 20, font: "Arial", color: "1a1a2e" })] })]
        }),
        new TableCell({
          borders, width: { size: 1200, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i % 2 ? "F8F8FB" : "FFFFFF" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: sevLabel[p.severity] || p.severity, bold: true, size: 18, color: sevHex[p.severity] || sevHex.ALTA, font: "Arial" })] })]
        }),
        new TableCell({
          borders, width: { size: 3226, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i % 2 ? "F8F8FB" : "FFFFFF" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: p.resolucao || "—", size: 20, font: "Arial", color: "444444" })] })]
        }),
      ]
    }));

    children.push(new Table({
      width: { size: contentW, type: WidthType.DXA },
      columnWidths: [600, 4000, 1200, 3226],
      rows: [headerRow, ...dataRows]
    }), spacer());
  }

  // Detalhamento
  if (config.problemas.length > 0) {
    children.push(heading("Detalhamento dos Problemas", HeadingLevel.HEADING_1, primary));

    config.problemas.forEach((p, i) => {
      const c = sevHex[p.severity] || sevHex.ALTA;
      const d = p.detalhe || {};

      children.push(
        new Paragraph({
          spacing: { before: 280, after: 100 },
          border: { left: { style: BorderStyle.THICK, size: 12, color: c, space: 8 } },
          indent: { left: 240 },
          children: [
            new TextRun({ text: `${i+1}. `, bold: true, size: 26, color: c, font: "Courier New" }),
            new TextRun({ text: p.titulo || "Sem título", bold: true, size: 26, color: "1a1a2e", font: "Arial" }),
            new TextRun({ text: `   [${sevLabel[p.severity] || p.severity}]`, bold: true, size: 20, color: c, font: "Arial" }),
          ]
        })
      );

      if (p.resumo?.trim()) {
        children.push(subLabel("Descrição"), para(p.resumo));
      }
      if (d.ondeOcorre?.some(t => t.trim())) {
        children.push(subLabel("Onde ocorre"));
        d.ondeOcorre.filter(t => t.trim()).forEach(t => children.push(para(t)));
      }
      if (d.codigoOnde?.some(t => t.trim())) {
        children.push(subLabel("Código onde ocorre"));
        d.codigoOnde.filter(t => t.trim()).forEach(t => {
          t.split("\n").forEach(line => children.push(codeBlock(line)));
        });
      }
      if (d.porqueProblema?.some(t => t.trim())) {
        children.push(subLabel("Por que é um problema"));
        d.porqueProblema.filter(t => t.trim()).forEach(t => children.push(para(t)));
      }
      if (d.textoResolucao?.some(t => t.trim())) {
        children.push(subLabel("Explicação de resolução"));
        d.textoResolucao.filter(t => t.trim()).forEach(t => children.push(para(t)));
      }
      if (d.codigoResolucao?.some(t => t.trim())) {
        children.push(subLabel("Código de resolução"));
        d.codigoResolucao.filter(t => t.trim()).forEach(t => {
          t.split("\n").forEach(line => children.push(codeBlock(line)));
        });
      }
      children.push(spacer());
    });
  }

  // Conclusão
  if (config.conclusao.some(t => t.trim())) {
    children.push(heading("Conclusão", HeadingLevel.HEADING_1, config.cores.baixaSev));
    config.conclusao.filter(t => t.trim()).forEach(t => children.push(para(t)));
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children
    }]
  });

  return await Packer.toBlob(doc);
}

// ── PDF Builder (via jsPDF + html2canvas, rendered in hidden iframe) ──────────
async function loadPdfLibs() {
  const load = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  await load("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
}

async function buildPdf(config, onProgress) {
  await loadPdfLibs();
  const { jsPDF } = window.jspdf;

  // Render the HTML into a hidden iframe so we get accurate layout
  onProgress("Renderizando documento…");
  const html = buildHtml(config);

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;height:auto;border:none;visibility:hidden";
  document.body.appendChild(iframe);

  await new Promise(res => {
    iframe.onload = res;
    iframe.srcdoc = html;
  });

  // Wait for fonts/images to settle
  await new Promise(res => setTimeout(res, 800));

  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  // Hide the print bar
  const bar = iDoc.querySelector(".print-bar");
  if (bar) bar.style.display = "none";

  const body = iDoc.body;
  body.style.width = "794px";

  onProgress("Capturando páginas…");

  const canvas = await window.html2canvas(body, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    width: 794,
    windowWidth: 794,
  });

  document.body.removeChild(iframe);

  onProgress("Gerando PDF…");

  const isAbnt = config.formato === "ABNT";
  const pageW = isAbnt ? 210 : 215.9;
  const pageH = isAbnt ? 297 : 279.4;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: isAbnt ? "a4" : "letter" });

  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let posY = 0;
  let page = 0;

  while (posY < imgH) {
    if (page > 0) pdf.addPage();
    // Crop canvas for this page
    const srcY = (posY / imgH) * canvas.height;
    const srcH = Math.min((pageH / imgH) * canvas.height, canvas.height - srcY);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = srcH;
    const ctx = pageCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

    const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
    const sliceH = (srcH / canvas.height) * imgH;
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, sliceH);

    posY += pageH;
    page++;
  }

  return pdf;
}

// ── Export Panel ──────────────────────────────────────────────────────────────
function ExportPanel({ config }) {
  const [exportedHtml, setExportedHtml] = useState(false);
  const [docxState, setDocxState] = useState("idle"); // idle | loading | done | error
  const [pdfState, setPdfState] = useState("idle");
  const [pdfProgress, setPdfProgress] = useState("");
  const [overlay, setOverlay] = useState(null); // null | "docx" | "pdf"

  const exportHtml = () => {
    const html = buildHtml(config);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${(config.titulo || "relatorio").replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedHtml(true);
    setTimeout(() => setExportedHtml(false), 2500);
  };

  const previewHtml = () => {
    const html = buildHtml(config);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const exportDocx = async () => {
    setDocxState("loading");
    setOverlay("docx");
    try {
      const blob = await buildDocx(config);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `${(config.titulo || "relatorio").replace(/\s+/g, "-").toLowerCase()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setDocxState("done");
      setTimeout(() => setDocxState("idle"), 3000);
    } catch (e) {
      console.error(e);
      setDocxState("error");
      setTimeout(() => setDocxState("idle"), 4000);
    } finally {
      setOverlay(null);
    }
  };

  const exportPdf = async () => {
    setPdfState("loading");
    setOverlay("pdf");
    try {
      const pdf = await buildPdf(config, msg => setPdfProgress(msg));
      pdf.save(`${(config.titulo || "relatorio").replace(/\s+/g, "-").toLowerCase()}.pdf`);
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 3000);
    } catch (e) {
      console.error(e);
      setPdfState("error");
      setTimeout(() => setPdfState("idle"), 4000);
    } finally {
      setOverlay(null);
      setPdfProgress("");
    }
  };

  const exportJson = () => {
    const json = JSON.stringify({ ...config, problemas: config.problemas.map((p, i) => ({ ...p, id: i + 1 })) }, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = "report-config.json"; a.click();
  };

  const total = config.problemas.length;
  const alta  = config.problemas.filter(p => p.severity === "ALTA").length;
  const media = config.problemas.filter(p => p.severity === "MÉDIA").length;
  const baixa = config.problemas.filter(p => p.severity === "BAIXA").length;

  const stateIcon = (s) => s === "loading" ? "hourglass-split" : s === "done" ? "check-lg" : s === "error" ? "exclamation-triangle" : "download";
  const stateColor = (s) => s === "done" ? "#22c55e" : s === "error" ? "#ef4444" : undefined;
  const stateLabel = (s, label) => s === "loading" ? "Gerando…" : s === "done" ? "Baixado!" : s === "error" ? "Erro!" : label;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "40px 36px", background: "var(--bg3)", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Loading overlay */}
      {overlay && (
        <div className="export-overlay">
          <div className="export-spinner" />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx)", marginBottom: 8 }}>
              {overlay === "docx" ? "Gerando DOCX…" : pdfProgress || "Gerando PDF…"}
            </div>
            <div style={{ fontSize: 13, color: "var(--tx3)" }}>Aguarde, isso pode levar alguns segundos</div>
          </div>
        </div>
      )}

      {/* Summary card */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--tx3)", marginBottom: 16 }}>Resumo do Relatório</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--tx)", marginBottom: 6, fontFamily: "var(--disp)" }}>{config.titulo || <span style={{ color: "var(--tx3)", fontStyle: "italic", fontFamily: "var(--fn)", fontWeight: 400 }}>Sem título</span>}</div>
        {config.subtitulo && <div style={{ fontSize: 13, color: "var(--tx2)", marginBottom: 18 }}>{config.subtitulo}</div>}
        <div className="div" style={{ margin: "18px 0" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            ["Formato", config.formato],
            ["Versão",  `v${config.versao}`],
            ["Autor",   config.autor || "—"],
            ["Total de problemas", total],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--tx3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)" }}>{v}</div>
            </div>
          ))}
        </div>
        {total > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {alta  > 0 && <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(192,0,0,.15)",  color: "#ff8080", border: "1px solid rgba(192,0,0,.3)"  }}>{alta} Alta</span>}
            {media > 0 && <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(197,90,17,.15)", color: "#ffa060", border: "1px solid rgba(197,90,17,.3)" }}>{media} Média</span>}
            {baixa > 0 && <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(55,86,35,.15)",  color: "#86efac", border: "1px solid rgba(55,86,35,.3)"  }}>{baixa} Baixa</span>}
          </div>
        )}
      </div>

      {/* PDF Export */}
      <div className="card" style={{ padding: 28, border: pdfState === "done" ? "1px solid rgba(34,197,94,.3)" : undefined }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="file-earmark-pdf-fill" size={22} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar como PDF</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>
              Gera um <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.pdf</code> diretamente, com layout fiel ao preview. Inclui todas as seções, tabelas e blocos de código.
            </div>
          </div>
        </div>
        <button
          onClick={exportPdf}
          disabled={pdfState === "loading"}
          className="btn-primary full"
          style={{
            background: pdfState === "done"
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : pdfState === "error"
              ? "linear-gradient(135deg,#ef4444,#dc2626)"
              : "linear-gradient(135deg,#ef4444,#dc2626)",
            opacity: pdfState === "loading" ? 0.7 : 1,
          }}
        >
          <Bi name={stateIcon(pdfState)} size={15} />
          {stateLabel(pdfState, "Baixar PDF")}
        </button>
      </div>

      {/* DOCX Export */}
      <div className="card" style={{ padding: 28, border: docxState === "done" ? "1px solid rgba(34,197,94,.3)" : undefined }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(37,130,235,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="file-earmark-word-fill" size={22} style={{ color: "#2582eb" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar como DOCX (Word)</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>
              Gera um <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.docx</code> editável para Microsoft Word ou Google Docs. Inclui tabela de problemas, detalhamento e blocos de código formatados.
            </div>
          </div>
        </div>
        <button
          onClick={exportDocx}
          disabled={docxState === "loading"}
          className="btn-primary full"
          style={{
            background: docxState === "done"
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : docxState === "error"
              ? "linear-gradient(135deg,#ef4444,#dc2626)"
              : "linear-gradient(135deg,#2582eb,#1d6bc4)",
            opacity: docxState === "loading" ? 0.7 : 1,
          }}
        >
          <Bi name={stateIcon(docxState)} size={15} />
          {stateLabel(docxState, "Baixar DOCX")}
        </button>
      </div>

      {/* HTML Export */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="file-earmark-code-fill" size={22} style={{ color: "var(--ac)" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar como HTML</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>Gera um arquivo <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.html</code> auto-contido. Abra no navegador e use <strong style={{ color: "var(--tx2)" }}>Ctrl+P</strong> para salvar como PDF.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={exportHtml} className="btn-primary" style={{ flex: 1, justifyContent: "center", background: exportedHtml ? "linear-gradient(135deg,#22c55e,#16a34a)" : undefined }}>
            <Bi name={exportedHtml ? "check-lg" : "download"} size={15} />
            {exportedHtml ? "Baixado!" : "Baixar HTML"}
          </button>
          <button onClick={previewHtml} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
            <Bi name="box-arrow-up-right" size={14} /> Abrir preview
          </button>
        </div>
      </div>

      {/* JSON Export */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="braces-asterisk" size={22} style={{ color: "#f97316" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar configuração JSON</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>Salva todos os dados do relatório em <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.json</code> para importação futura ou integração com outras ferramentas.</div>
          </div>
        </div>
        <button onClick={exportJson} className="btn-ghost" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(249,115,22,0.3)", color: "#f97316" }}>
          <Bi name="download" size={14} /> Baixar JSON
        </button>
      </div>

    </div>
  );
}

// ── JSON Import Modal ─────────────────────────────────────────────────────────
function mergeConfig(base, incoming) {
  // Ensure all required keys exist, merge deeply
  const merged = { ...base, ...incoming };
  merged.cores = { ...base.cores, ...(incoming.cores || {}) };
  // Normalise problems: ensure each has an id + full detalhe shape
  if (Array.isArray(merged.problemas)) {
    merged.problemas = merged.problemas.map(p => ({
      ...emptyProblem(),
      ...p,
      id: Date.now() + Math.random(),
      detalhe: {
        ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""],
        textoResolucao: [""], codigoResolucao: [""],
        ...(p.detalhe || {}),
      },
    }));
  } else {
    merged.problemas = [];
  }
  if (!Array.isArray(merged.resumoExecutivo) || merged.resumoExecutivo.length === 0) merged.resumoExecutivo = [""];
  if (!Array.isArray(merged.conclusao) || merged.conclusao.length === 0) merged.conclusao = [""];
  return merged;
}

function JsonImportModal({ onClose, onImport }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleImport = () => {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) { setError("Cole um JSON válido no campo acima."); return; }
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      setError(`JSON inválido: ${e.message}`);
      return;
    }
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      setError("O JSON deve ser um objeto (não um array).");
      return;
    }
    const merged = mergeConfig(initialConfig, parsed);
    setSuccess(true);
    setTimeout(() => { onImport(merged); onClose(); }, 700);
  };

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="json-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="json-modal">
        <div className="json-modal-header">
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(249,115,22,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="braces-asterisk" size={20} style={{ color: "#f97316" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>Importar JSON</div>
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 2 }}>Cole ou carregue um arquivo de configuração exportado anteriormente</div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ flexShrink: 0 }}><Bi name="x-lg" size={15} /></button>
        </div>

        <div className="json-modal-body">
          {/* Drop zone / file picker */}
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <label className="btn-ghost" style={{ cursor: "pointer", fontSize: 12 }}>
              <Bi name="folder2-open" size={13} /> Abrir arquivo .json
              <input type="file" accept=".json,application/json" onChange={handleFile} style={{ display: "none" }} />
            </label>
            {text.trim() && (
              <button className="btn-ghost" style={{ fontSize: 12, color: "var(--tx3)" }} onClick={() => { setText(""); setError(""); setSuccess(false); }}>
                <Bi name="x-circle" size={13} /> Limpar
              </button>
            )}
            <span style={{ fontSize: 12, color: "var(--tx3)", marginLeft: "auto" }}>
              {text.trim() ? `${text.length.toLocaleString()} chars` : ""}
            </span>
          </div>

          <textarea
            ref={textareaRef}
            className="json-textarea"
            value={text}
            onChange={e => { setText(e.target.value); setError(""); setSuccess(false); }}
            placeholder={`Cole aqui o JSON exportado. Exemplo:\n{\n  "titulo": "Análise de Segurança",\n  "autor": "Equipe Red Team",\n  "versao": "2.0",\n  "problemas": [\n    {\n      "titulo": "SQL Injection",\n      "severity": "ALTA",\n      "resumo": "...",\n      "resolucao": "..."\n    }\n  ]\n}`}
            spellCheck={false}
          />

          {error && (
            <div className="json-error">
              <Bi name="exclamation-triangle-fill" size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="json-success">
              <Bi name="check-circle-fill" size={15} style={{ flexShrink: 0 }} />
              <span>JSON importado com sucesso! Aplicando…</span>
            </div>
          )}

          {/* Schema hint */}
          <div style={{ marginTop: 18, padding: "14px 16px", background: "var(--bg3)", borderRadius: "var(--r-sm)", border: "1px solid var(--b1)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Campos aceitos</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["titulo","subtitulo","autor","versao","formato","logo","cores","resumoExecutivo","problemas","conclusao"].map(k => (
                <code key={k} style={{ fontSize: 11, fontFamily: "var(--mono)", background: "var(--surf)", color: "var(--ac2)", padding: "3px 9px", borderRadius: 6, border: "1px solid var(--b2)" }}>{k}</code>
              ))}
            </div>
          </div>
        </div>

        <div className="json-modal-footer">
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Cancelar</button>
          <button
            onClick={handleImport}
            disabled={!text.trim() || success}
            className="btn-primary"
            style={{ flex: 2, justifyContent: "center", opacity: !text.trim() ? 0.5 : 1 }}
          >
            <Bi name={success ? "check-lg" : "upload"} size={15} />
            {success ? "Importado!" : "Importar e aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stats({ config }) {
  const total = config.problemas.length;
  if (total === 0) return <span style={{ fontSize: 13, color: "var(--tx3)" }}>Sem problemas</span>;
  const alta = config.problemas.filter(p => p.severity === "ALTA").length;
  const media = config.problemas.filter(p => p.severity === "MÉDIA").length;
  const baixa = config.problemas.filter(p => p.severity === "BAIXA").length;
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
      {alta > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(192,0,0,.15)", color: "#ff8080", border: "1px solid rgba(192,0,0,.3)" }}>{alta} Alta</span>}
      {media > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(197,90,17,.15)", color: "#ffa060", border: "1px solid rgba(197,90,17,.3)" }}>{media} Média</span>}
      {baixa > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(55,86,35,.15)", color: "#86efac", border: "1px solid rgba(55,86,35,.3)" }}>{baixa} Baixa</span>}
    </div>
  );
}

function ResizeHandle({ onResize }) {
  const [dragging, setDragging] = useState(false);
  const onMouseDown = e => {
    e.preventDefault();
    setDragging(true);
    const onMove = ev => onResize(ev.clientX);
    const onUp   = ()  => { setDragging(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  return (
    <div className={`resize-handle${dragging ? " dragging" : ""}`} onMouseDown={onMouseDown} title="Arrastar para redimensionar" />
  );
}

export default function App() {
  const [config, setConfig] = useState(initialConfig);
  const [rightTab, setRightTab] = useState("preview");
  const [mobTab, setMobTab] = useState("editor");
  const [editorWidth, setEditorWidth] = useState(48);
  const [showImport, setShowImport] = useState(false);
  const bodyRef = useRef(null);
  const isMobile = useIsMobile();

  const handleResize = useCallback(clientX => {
    if (!bodyRef.current) return;
    const rect = bodyRef.current.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    setEditorWidth(Math.min(75, Math.max(20, pct)));
  }, []);

  const upd = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), []);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), []);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), []);
  const addProblem = () => setConfig(c => ({ ...c, problemas: [...c.problemas, emptyProblem()] }));
  const updateProblem = (id, p) => setConfig(c => ({ ...c, problemas: c.problemas.map(x => x.id === id ? p : x) }));
  const removeProblem = id => setConfig(c => ({ ...c, problemas: c.problemas.filter(x => x.id !== id) }));

  return (
    <div className="app-shell">
      <style>{CSS}</style>

      {showImport && (
        <JsonImportModal
          onClose={() => setShowImport(false)}
          onImport={merged => setConfig(merged)}
        />
      )}

      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, var(--ac), var(--ac2))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px var(--glow)" }}>
            <Bi name="shield-check" size={20} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: -.4, fontFamily: "var(--disp)", lineHeight: 1.1 }}>ReportGen</div>
            <div style={{ fontSize: 10, color: "var(--tx3)", letterSpacing: .8, textTransform: "uppercase" }}>Security Report Builder</div>
          </div>
        </div>

        <div style={{ width: 1, height: 30, background: "var(--b2)", margin: "0 6px" }} />
        <Stats config={config} />

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowImport(true)}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "7px 14px", gap: 6 }}
            title="Importar JSON"
          >
            <Bi name="upload" size={13} />
            <span style={{ display: isMobile ? "none" : "inline" }}>Importar JSON</span>
          </button>
          <span style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)", background: "var(--surf)", padding: "4px 10px", borderRadius: 7, border: "1px solid var(--b2)" }}>{config.formato}</span>
          <span style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)", background: "var(--surf)", padding: "4px 10px", borderRadius: 7, border: "1px solid var(--b2)" }}>v{config.versao}</span>
        </div>
      </header>

      <div className="app-body" ref={bodyRef}>

        <div className={`pane-editor${mobTab === "editor" ? " mob-active" : ""}`} style={{ width: `${editorWidth}%` }}>
          <div className="editor-inner">

            <div style={{ marginBottom: 48 }}>
              <SectionHeader icon={<Bi name="file-earmark-text" size={22} />} title="Informações Gerais" subtitle="Metadados e identidade do relatório" />
              <div className="card" style={{ padding: 30 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
                  <div><label className="lbl">Formato de Página</label>
                    <select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}>
                      <option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA (US Letter)</option>
                    </select>
                  </div>
                  <div><label className="lbl">Versão</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
                </div>
                <div style={{ marginBottom: 18 }}><label className="lbl">Título do Relatório</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: Análise de Segurança — API de Pagamentos" /></div>
                <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo / Escopo</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Breve descrição do sistema analisado" /></div>
                <div style={{ marginBottom: 22 }}><label className="lbl">Autor / Equipe</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Nome do autor ou equipe" /></div>
                <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual do documento final" />
              <div className="card" style={{ padding: 30 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
                  {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["altaSev","Alta Sev."],["mediaSev","Média Sev."],["baixaSev","Baixa Sev."],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
                    <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <SectionHeader icon={<Bi name="journal-richtext" size={22} />} title="Resumo Executivo" subtitle="Visão geral para stakeholders não-técnicos" />
              <div className="card" style={{ padding: 30 }}>
                <ArrayField values={config.resumoExecutivo} onChange={v => upd("resumoExecutivo", v)} placeholder="Descreva o contexto e objetivo da análise..." />
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <SectionHeader icon={<Bi name="bug-fill" size={22} />} title="Problemas" subtitle="Vulnerabilidades e achados técnicos" badge={config.problemas.length} />
              {config.problemas.length === 0 ? (
                <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <Bi name="shield-exclamation" size={32} style={{ color: "var(--tx3)" }} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhum problema cadastrado</div>
                  <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>Adicione a primeira vulnerabilidade ao relatório</div>
                  <button onClick={addProblem} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> Adicionar Primeiro Problema</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {config.problemas.map((prob, i) => (
                    <ProblemCard key={prob.id} prob={prob} idx={i} onChange={p => updateProblem(prob.id, p)} onRemove={() => removeProblem(prob.id)} />
                  ))}
                  <button onClick={addProblem} className="btn-primary full" style={{ marginTop: 4 }}>
                    <Bi name="plus-circle-fill" size={16} /> Adicionar Problema
                  </button>
                </div>
              )}
            </div>

            <div>
              <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Conclusão" subtitle="Considerações finais e recomendações" />
              <div className="card" style={{ padding: 30 }}>
                <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder="Conclusão e próximos passos..." />
              </div>
            </div>

          </div>
        </div>

        <ResizeHandle onResize={handleResize} />

        <div className={`pane-right${mobTab !== "editor" ? " mob-active" : ""}`}>
          <div className="right-tabs">
            {[["preview","eye-fill","Preview"],["json","braces-asterisk","JSON"],["export","box-arrow-up","Exportar"]].map(([id, icon, label]) => (
              <button key={id} className={`right-tab${rightTab === id ? " active" : ""}`} onClick={() => setRightTab(id)}>
                <Bi name={icon} size={15} /> {label}
              </button>
            ))}
          </div>
          <div className={`right-body${(rightTab === "preview" || rightTab === "export") ? " scrollable" : ""}`} style={{ background: rightTab === "preview" ? "var(--bg3)" : rightTab === "export" ? "var(--bg3)" : "#0d1117" }}>
            {rightTab === "preview" && (
              <div style={{ padding: "32px 36px 56px" }}>
                <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)" }}>
                  <div style={{ background: "var(--s2)", padding: "13px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--b1)" }}>
                    <div style={{ display: "flex", gap: 7 }}>
                      {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
                    </div>
                    <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)" }}>preview — {config.formato}</div>
                  </div>
                  <div style={{ background: "#fff" }}><Preview config={config} /></div>
                </div>
              </div>
            )}
            {rightTab === "json" && (
              <div style={{ height: "100%" }}><JsonOutput config={config} /></div>
            )}
            {rightTab === "export" && <ExportPanel config={config} />}
          </div>
        </div>
      </div>

      <nav className="mob-nav">
        {[["editor","pencil-fill","Editor"],["preview","eye-fill","Preview"],["json","braces","JSON"],["export","box-arrow-up","Exportar"]].map(([id, icon, label]) => (
          <button key={id} className="mob-tab" onClick={() => { setMobTab(id); if (id !== "editor") setRightTab(id); }}
            style={{ color: mobTab === id ? "var(--ac)" : "var(--tx3)" }}>
            <Bi name={icon} size={22} />{label}
          </button>
        ))}
      </nav>
    </div>
  );
}