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

// ─── TEMPLATE DEFINITIONS ────────────────────────────────────────────────────
const TEMPLATES = {
  bugs: {
    id: "bugs",
    label: "Relatório de Bugs",
    icon: "bug-fill",
    description: "Vulnerabilidades e achados técnicos de segurança",
    accent: "#6271f5",
    accentBg: "rgba(98,113,245,0.12)",
  },
  study: {
    id: "study",
    label: "Relatório de Estudo",
    icon: "journal-bookmark-fill",
    description: "Registro de aprendizado, conceitos e práticas de um tema",
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.12)",
  },
  changelog: {
    id: "changelog",
    label: "Changelog / Mudanças",
    icon: "git-commit-fill",
    description: "Registro de alterações, refatorações e melhorias de código",
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.12)",
  },
};

// ─── STUDY TEMPLATE CONFIG ───────────────────────────────────────────────────
const initialStudyConfig = {
  template: "study",
  formato: "ABNT",
  cores: { primaria: "1F3864", secundaria: "2E75B6", concept: "f59e0b", practice: "10b981", summary: "6366f1", codeBg: "1E1E1E", codeText: "D4D4D4" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  introducao: [""], topicos: [], conclusao: [""],
};

const emptyStudyTopic = () => ({
  id: Date.now() + Math.random(), titulo: "", tipo: "CONCEITO", resumo: "",
  detalhe: { explicacao: [""], exemplos: [""], codigo: [""] },
});

const STUDY_TYPES = {
  CONCEITO: { border: "#f59e0b", text: "#f59e0b", bg: "rgba(245,158,11,0.07)", icon: "lightbulb-fill" },
  PRÁTICA:  { border: "#10b981", text: "#10b981", bg: "rgba(16,185,129,0.07)", icon: "code-square" },
  RESUMO:   { border: "#6366f1", text: "#6366f1", bg: "rgba(99,102,241,0.07)", icon: "text-paragraph" },
};

// ─── BUGS TEMPLATE CONFIG ────────────────────────────────────────────────────
const initialBugsConfig = {
  template: "bugs",
  formato: "ABNT",
  cores: { primaria: "1F3864", secundaria: "2E75B6", altaSev: "C00000", mediaSev: "C55A11", baixaSev: "375623", codeBg: "1E1E1E", codeText: "D4D4D4" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  resumoExecutivo: [""], problemas: [], conclusao: [""],
};

const emptyBugProblem = () => ({
  id: Date.now() + Math.random(), titulo: "", severity: "ALTA", resumo: "", resolucao: "",
  detalhe: { ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""], textoResolucao: [""], codigoResolucao: [""] },
});

const SEV = {
  ALTA:  { border: "#C00000", text: "#C00000", bg: "rgba(192,0,0,0.07)" },
  MÉDIA: { border: "#C55A11", text: "#C55A11", bg: "rgba(197,90,17,0.07)" },
  BAIXA: { border: "#375623", text: "#375623", bg: "rgba(55,86,35,0.07)" },
};

// ─── CHANGELOG TEMPLATE CONFIG ───────────────────────────────────────────────
const initialChangelogConfig = {
  template: "changelog",
  formato: "ABNT",
  cores: { primaria: "0F4C35", secundaria: "10B981", breaking: "DC2626", feat: "2563EB", fix: "D97706", refactor: "7C3AED", perf: "0891B2", style: "DB2777", chore: "64748B", codeBg: "0D1117", codeText: "E6EDF3" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  projeto: "", repositorio: "", dataInicio: "", dataFim: "",
  descricao: [""],
  mudancas: [],
  resumo: [""],
};

const CHANGE_TYPES = {
  feat:      { label: "Feature",    color: "#2563EB", bg: "rgba(37,99,235,0.12)",   icon: "stars" },
  fix:       { label: "Fix",        color: "#D97706", bg: "rgba(217,119,6,0.12)",   icon: "bug" },
  breaking:  { label: "Breaking",   color: "#DC2626", bg: "rgba(220,38,38,0.12)",   icon: "exclamation-triangle-fill" },
  refactor:  { label: "Refactor",   color: "#7C3AED", bg: "rgba(124,58,237,0.12)",  icon: "arrow-repeat" },
  perf:      { label: "Perf",       color: "#0891B2", bg: "rgba(8,145,178,0.12)",   icon: "lightning-charge-fill" },
  style:     { label: "Style",      color: "#DB2777", bg: "rgba(219,39,119,0.12)",  icon: "brush-fill" },
  chore:     { label: "Chore",      color: "#64748B", bg: "rgba(100,116,139,0.12)", icon: "tools" },
};

const emptyChange = () => ({
  id: Date.now() + Math.random(),
  tipo: "feat",
  titulo: "",
  arquivo: "",
  descricao: "",
  motivacao: "",
  impacto: "",
  codigoAntes: "",
  codigoDepois: "",
  notas: "",
});

// ─── SHARED CSS ──────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap');
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
  .app-shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .app-header { display: flex; align-items: center; gap: 18px; padding: 0 28px; height: 62px; background: var(--bg2); border-bottom: 1px solid var(--b2); flex-shrink: 0; }
  .app-body { display: flex; flex: 1; overflow: hidden; }
  .pane-editor { min-width: 280px; max-width: 75%; border-right: none; overflow-y: auto; flex-shrink: 0; }
  .editor-inner { padding: 36px 36px 80px; }
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
  .pane-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg3); }
  .right-tabs { display: flex; background: var(--bg2); border-bottom: 1px solid var(--b2); flex-shrink: 0; }
  .right-tab { flex: 1; padding: 16px; font-size: 13px; font-weight: 600; color: var(--tx3); background: transparent; border: none; border-bottom: 2.5px solid transparent; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .15s; }
  .right-tab.active { color: var(--ac); border-bottom-color: var(--ac); background: rgba(98,113,245,.05); }
  .right-tab:hover:not(.active) { color: var(--tx2); background: var(--b1); }
  .right-body { flex: 1; overflow: hidden; }
  .right-body.scrollable { overflow-y: auto; }
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
  }
  .mob-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg2); border-top: 1px solid var(--b2); z-index: 200; padding: 8px 0 max(8px, env(safe-area-inset-bottom)); }
  .mob-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; padding: 6px 0; font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
  .json-modal-backdrop { position: fixed; inset: 0; background: rgba(8,10,20,0.82); z-index: 500; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); padding: 20px; }
  .json-modal { background: var(--bg2); border: 1px solid var(--b2); border-radius: 20px; width: 100%; max-width: 680px; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.7); animation: fadeUp .2s ease; }
  .json-modal-header { display: flex; align-items: center; gap: 14px; padding: 22px 26px; border-bottom: 1px solid var(--b1); flex-shrink: 0; }
  .json-modal-body { flex: 1; overflow-y: auto; padding: 24px 26px; }
  .json-modal-footer { padding: 18px 26px; border-top: 1px solid var(--b1); display: flex; gap: 10px; flex-shrink: 0; }
  .json-textarea { width: 100%; min-height: 260px; resize: vertical; font-family: var(--mono); font-size: 12.5px; line-height: 1.7; padding: 16px 18px; border-radius: var(--r-sm); background: #0d1117; color: #e6edf3; border: 1.5px solid var(--b2); transition: border-color .18s, box-shadow .18s; }
  .json-textarea:focus { border-color: var(--ac); box-shadow: 0 0 0 3px var(--glow); outline: none; }
  .json-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.35); border-radius: var(--r-sm); padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-top: 14px; display: flex; align-items: flex-start; gap: 10px; }
  .json-success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.35); border-radius: var(--r-sm); padding: 12px 16px; font-size: 13px; color: #86efac; margin-top: 14px; display: flex; align-items: center; gap: 10px; }
  .export-overlay { position: fixed; inset: 0; background: rgba(12,14,24,0.85); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; backdrop-filter: blur(6px); }
  .export-spinner { width: 52px; height: 52px; border: 3px solid var(--b2); border-top-color: var(--ac); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Template selector modal */
  .tmpl-modal-backdrop { position: fixed; inset: 0; background: rgba(8,10,20,0.9); z-index: 600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(12px); padding: 20px; }
  .tmpl-modal { background: var(--bg2); border: 1px solid var(--b2); border-radius: 24px; width: 100%; max-width: 640px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: fadeUp .25s ease; }
  .tmpl-card { border: 2px solid var(--b2); border-radius: 16px; padding: 24px; cursor: pointer; transition: all .2s; background: var(--bg3); position: relative; overflow: hidden; }
  .tmpl-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
  .tmpl-card.active { border-color: var(--ac); background: rgba(98,113,245,0.06); }
  .tmpl-card-glow { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%; opacity: 0.07; pointer-events: none; }

  /* Changelog specific */
  .change-type-pill { padding: 3px 11px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: .8px; display: inline-flex; align-items: center; gap: 5px; }
  .diff-block { position: relative; }
  .diff-line-before { background: rgba(220,38,38,0.12); border-left: 3px solid #DC2626; }
  .diff-line-after  { background: rgba(16,185,129,0.12); border-left: 3px solid #10B981; }
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

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

// ─── BUGS COMPONENTS ─────────────────────────────────────────────────────────

function BugProblemCard({ prob, idx, onChange, onRemove }) {
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

// ─── CHANGELOG COMPONENTS ────────────────────────────────────────────────────

function ChangeCard({ change, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const isMob = useIsMobile();
  const t = CHANGE_TYPES[change.tipo] || CHANGE_TYPES.feat;
  const upd = (f, v) => onChange({ ...change, [f]: v });

  return (
    <div className="card anim" style={{ border: `1px solid ${open ? t.color + "70" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? t.bg : "transparent", transition: "background .2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bi name={t.icon} size={14} style={{ color: "#fff" }} />
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
        {/* Tipo selector com SVG badges */}
        <div style={{ marginBottom: 20 }}>
          <label className="lbl">Tipo de Mudança</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(CHANGE_TYPES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => upd("tipo", k)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                  border: `2px solid ${change.tipo === k ? v.color : "var(--b2)"}`,
                  background: change.tipo === k ? v.bg : "var(--bg2)",
                  color: change.tipo === k ? v.color : "var(--tx3)",
                  fontWeight: 700, fontSize: 13, transition: "all .15s",
                }}
              >
                <svg viewBox="0 0 14 14" width="14" height="14" style={{ flexShrink: 0 }}>
                  {k === "feat"     && <polygon points="7,1 9,5 14,5.5 10.5,9 11.5,14 7,11.5 2.5,14 3.5,9 0,5.5 5,5" fill={change.tipo === k ? v.color : "var(--tx3)"} />}
                  {k === "fix"      && <><circle cx="7" cy="7" r="5.5" fill="none" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="5" y1="5" x2="9" y2="9" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="9" y1="5" x2="5" y2="9" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/></>}
                  {k === "breaking" && <><polygon points="7,1 13,13 1,13" fill="none" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="7" y1="5" x2="7" y2="9" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><circle cx="7" cy="11.5" r="1" fill={change.tipo === k ? v.color : "var(--tx3)"}/></>}
                  {k === "refactor" && <><path d="M2,7 Q7,2 12,7 Q7,12 2,7" fill="none" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><polyline points="10,4 13,7 10,10" fill="none" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/></>}
                  {k === "perf"     && <><polyline points="1,11 5,7 8,9 13,3" fill="none" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><circle cx="13" cy="3" r="1.5" fill={change.tipo === k ? v.color : "var(--tx3)"}/></>}
                  {k === "style"    && <><circle cx="7" cy="7" r="5" fill={change.tipo === k ? v.color : "var(--tx3)"} opacity="0.25"/><circle cx="7" cy="7" r="2.5" fill={change.tipo === k ? v.color : "var(--tx3)"}/></>}
                  {k === "chore"    && <><circle cx="7" cy="7" r="5" fill="none" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="7" y1="2" x2="7" y2="4.5" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="7" y1="9.5" x2="7" y2="12" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="2" y1="7" x2="4.5" y2="7" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/><line x1="9.5" y1="7" x2="12" y2="7" stroke={change.tipo === k ? v.color : "var(--tx3)"} strokeWidth="2"/></>}
                </svg>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr", gap: 16, marginBottom: 18 }}>
          <div><label className="lbl">Título da mudança</label><input className="inp" value={change.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: Refatorar sistema de autenticação JWT" /></div>
        </div>
        <div style={{ marginBottom: 18 }}><label className="lbl">Arquivo(s) modificado(s)</label><input className="inp" value={change.arquivo} onChange={e => upd("arquivo", e.target.value)} placeholder="src/auth/jwt.service.ts, src/middleware/auth.ts" /></div>
        <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div><label className="lbl">Descrição da mudança</label><textarea className="inp" rows={3} value={change.descricao} onChange={e => upd("descricao", e.target.value)} placeholder="O que foi alterado e como..." /></div>
          <div><label className="lbl">Motivação / Contexto</label><textarea className="inp" rows={3} value={change.motivacao} onChange={e => upd("motivacao", e.target.value)} placeholder="Por que essa mudança foi necessária..." /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div><label className="lbl">Impacto esperado</label><textarea className="inp" rows={2} value={change.impacto} onChange={e => upd("impacto", e.target.value)} placeholder="Ex: Redução de 40% no tempo de resposta..." /></div>
          <div><label className="lbl">Notas adicionais</label><textarea className="inp" rows={2} value={change.notas} onChange={e => upd("notas", e.target.value)} placeholder="Dependências, cuidados, side effects..." /></div>
        </div>
        <div className="div" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Bi name="code-slash" size={14} style={{ color: "var(--tx3)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--tx3)", letterSpacing: 1.1, textTransform: "uppercase" }}>Diff de Código</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16 }}>
          <div>
            <label className="lbl" style={{ color: "#DC2626" }}>⊟ Código antes (removido)</label>
            <textarea className="inp" rows={6} value={change.codigoAntes} onChange={e => upd("codigoAntes", e.target.value)} placeholder={"// código original\nconst token = jwt.sign(payload)"} style={{ fontFamily: "var(--mono)", fontSize: 12, background: "rgba(220,38,38,0.05)", borderColor: "rgba(220,38,38,0.25)" }} />
          </div>
          <div>
            <label className="lbl" style={{ color: "#10B981" }}>⊞ Código depois (adicionado)</label>
            <textarea className="inp" rows={6} value={change.codigoDepois} onChange={e => upd("codigoDepois", e.target.value)} placeholder={"// código novo\nconst token = await jwtService.sign(payload)"} style={{ fontFamily: "var(--mono)", fontSize: 12, background: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.25)" }} />
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

// ─── CHANGELOG PREVIEW ───────────────────────────────────────────────────────

function ChangelogPreview({ config }) {
  const primary = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = {
    feat:     `#${config.cores.feat}`,
    fix:      `#${config.cores.fix}`,
    breaking: `#${config.cores.breaking}`,
    refactor: `#${config.cores.refactor}`,
    perf:     `#${config.cores.perf}`,
    style:    `#${config.cores.style || "DB2777"}`,
    chore:    `#${config.cores.chore}`,
  };

  const grouped = {};
  config.mudancas.forEach(m => {
    if (!grouped[m.tipo]) grouped[m.tipo] = [];
    grouped[m.tipo].push(m);
  });

  const typeOrder = ["breaking","feat","fix","refactor","perf","style","chore"];

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div style={{ padding: "48px 48px 36px", background: `linear-gradient(160deg, #0F4C3508, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 24 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 80, maxWidth: 280, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>CHANGELOG — REGISTRO DE MUDANÇAS</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 10, fontFamily: "Georgia, serif" }}>{config.titulo || "Changelog do Projeto"}</div>
        <div style={{ fontSize: 14, color: "#10B981", fontWeight: 600, paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid #10B98130` }}>{config.subtitulo || "Registro técnico de alterações"}</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "#888" }}>
          {config.projeto && <span><strong style={{ color: "#555" }}>Projeto:</strong> {config.projeto}</span>}
          {config.autor && <span><strong style={{ color: "#555" }}>Autor:</strong> {config.autor}</span>}
          <span><strong style={{ color: "#555" }}>Versão:</strong> {config.versao}</span>
          {config.dataInicio && <span><strong style={{ color: "#555" }}>Período:</strong> {config.dataInicio}{config.dataFim ? ` → ${config.dataFim}` : ""}</span>}
          {config.repositorio && <span><strong style={{ color: "#555" }}>Repo:</strong> {config.repositorio}</span>}
        </div>
      </div>

      {config.mudancas.length > 0 && (
        <div style={{ padding: "28px 48px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {typeOrder.filter(t => grouped[t]?.length > 0).map(t => {
            const info = CHANGE_TYPES[t];
            const c = typeColors[t] || info.color;
            return (
              <span key={t} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${c}18`, color: c, border: `1px solid ${c}40` }}>
                {grouped[t].length} {info.label}
              </span>
            );
          })}
        </div>
      )}

      {config.descricao.some(t => t.trim()) && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Visão Geral</div>
          </div>
          {config.descricao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 12, color: "#333", marginBottom: 10 }}>{t}</p>)}
        </div>
      )}

      {config.mudancas.length > 0 && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: "#10B981", borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Tabela de Mudanças</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", "Tipo", "Mudança", "Arquivo(s)", "Impacto"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 700, width: i === 0 ? 32 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.mudancas.map((m, i) => {
                const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
                const c = typeColors[m.tipo] || info.color;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f9fb" : "#fff" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontWeight: 700, color: "#ccc", fontFamily: "monospace" }}>{i+1}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                      <span style={{ background: `${c}18`, color: c, padding: "2px 9px", borderRadius: 12, fontSize: 10, fontWeight: 800 }}>{info.label}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontWeight: 600, fontSize: 12 }}>{m.titulo || "—"}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontFamily: "monospace", fontSize: 10, color: "#666" }}>{m.arquivo || "—"}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: 11, color: "#444" }}>{m.impacto || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {config.mudancas.length > 0 && (
        <div style={{ padding: "32px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 5, height: 24, background: "#10B981", borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Detalhamento das Mudanças</div>
          </div>
          {typeOrder.filter(t => grouped[t]?.length > 0).map(tipo => {
            const info = CHANGE_TYPES[tipo];
            const c = typeColors[tipo] || info.color;
            return (
              <div key={tipo} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ background: `${c}18`, color: c, padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, border: `1px solid ${c}40` }}>
                    {info.label} ({grouped[tipo].length})
                  </span>
                </div>
                {grouped[tipo].map((m, i) => (
                  <div key={i} style={{ marginBottom: 20, borderLeft: `3px solid ${c}`, paddingLeft: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 }}>{m.titulo || "Sem título"}</div>
                    {m.arquivo && <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666", background: "#f5f5f5", padding: "3px 10px", borderRadius: 5, display: "inline-block", marginBottom: 8 }}>{m.arquivo}</div>}
                    {m.descricao?.trim() && <p style={{ fontSize: 12, color: "#333", marginBottom: 8, lineHeight: 1.7 }}>{m.descricao}</p>}
                    {m.motivacao?.trim() && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Motivação</div>
                        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{m.motivacao}</p>
                      </div>
                    )}
                    {m.impacto?.trim() && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Impacto</div>
                        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{m.impacto}</p>
                      </div>
                    )}
                    {(m.codigoAntes?.trim() || m.codigoDepois?.trim()) && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Diff</div>
                        <div style={{ background: "#0d1117", borderRadius: 8, overflow: "hidden", fontSize: 11, fontFamily: "monospace" }}>
                          {m.codigoAntes?.trim() && m.codigoAntes.split("\n").map((line, li) => (
                            <div key={li} style={{ padding: "2px 14px 2px 10px", background: "rgba(220,38,38,0.12)", borderLeft: "3px solid #DC2626", color: "#fca5a5", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>- {line}</div>
                          ))}
                          {m.codigoDepois?.trim() && m.codigoDepois.split("\n").map((line, li) => (
                            <div key={li} style={{ padding: "2px 14px 2px 10px", background: "rgba(16,185,129,0.12)", borderLeft: "3px solid #10B981", color: "#86efac", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>+ {line}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.notas?.trim() && (
                      <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffbeb", borderLeft: "3px solid #D97706", borderRadius: "0 6px 6px 0" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706" }}>⚠ Nota: </span>
                        <span style={{ fontSize: 11, color: "#555" }}>{m.notas}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {config.resumo.some(t => t.trim()) && (
        <div style={{ padding: "32px 48px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 5, height: 24, background: `#${config.cores.chore}`, borderRadius: 3 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: primary }}>Resumo Final</div>
          </div>
          {config.resumo.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 12, color: "#333", marginBottom: 10 }}>{t}</p>)}
        </div>
      )}

      <div style={{ padding: "20px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>Changelog — {config.titulo || "Documento"} · v{config.versao}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 28, maxWidth: 90, objectFit: "contain", opacity: 0.5 }} />}
      </div>
    </div>
  );
}

// ─── BUGS PREVIEW ─────────────────────────────────────────────────────────────

function BugsPreview({ config }) {
  const primary = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevColors = { ALTA: `#${config.cores.altaSev}`, MÉDIA: `#${config.cores.mediaSev}`, BAIXA: `#${config.cores.baixaSev}` };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
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
            return (
              <div key={i} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || "Sem título"}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.severity}</span>
                </div>
                {p.resumo?.trim() && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Descrição</div><p style={{ fontSize: 12, color: "#333", lineHeight: 1.7 }}>{p.resumo}</p></div>}
                {d.ondeOcorre?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Onde ocorre</div>{d.ondeOcorre.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.codigoOnde?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código onde ocorre</div>{d.codigoOnde.filter(t => t.trim()).map((t, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>)}</div>}
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
      <div style={{ padding: "24px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>Relatório Técnico — {config.titulo || "Documento"}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}

// ─── STUDY COMPONENTS ─────────────────────────────────────────────────────────

function StudyTopicCard({ topic, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const isMob = useIsMobile();
  const typeInfo = STUDY_TYPES[topic.tipo] || STUDY_TYPES.CONCEITO;
  const upd = (f, v) => onChange({ ...topic, [f]: v });
  const updD = (f, v) => onChange({ ...topic, detalhe: { ...topic.detalhe, [f]: v } });
  return (
    <div className="card anim" style={{ border: `1px solid ${open ? typeInfo.border + "90" : "var(--b2)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", cursor: "pointer", userSelect: "none", background: open ? typeInfo.bg : "transparent", transition: "background .2s" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: typeInfo.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bi name={typeInfo.icon} size={14} style={{ color: "#fff" }} />
        </div>
        <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, background: `${typeInfo.border}22`, color: typeInfo.text, flexShrink: 0, letterSpacing: .8, border: `1px solid ${typeInfo.border}40` }}>{topic.tipo}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: topic.titulo ? "var(--tx)" : "var(--tx3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic.titulo || "Sem título"}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" style={{ background: "transparent", border: "none", color: "var(--tx3)" }}><Bi name="trash3" size={13} /></button>
        <span style={{ color: "var(--tx3)", marginLeft: 4 }}><Bi name={open ? "chevron-up" : "chevron-down"} size={14} /></span>
      </div>
      {open && (
        <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 140px", gap: 16, marginBottom: 18 }}>
            <div><label className="lbl">Título do Tópico</label><input className="inp" value={topic.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: Hooks no React" /></div>
            <div><label className="lbl">Tipo</label>
              <select value={topic.tipo} onChange={e => upd("tipo", e.target.value)}
                style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: typeInfo.text, background: "var(--bg2)", border: `1.5px solid ${typeInfo.border}60`, borderRadius: "var(--r-sm)", outline: "none", width: "100%" }}>
                {Object.keys(STUDY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Resumo (tabela)</label><textarea className="inp" rows={2} value={topic.resumo} onChange={e => upd("resumo", e.target.value)} placeholder="Descrição breve do aprendizado..." /></div>
          <div className="div" />
          <ArrayField label="Explicação Detalhada" values={topic.detalhe.explicacao} onChange={v => updD("explicacao", v)} placeholder="Explique o conceito ou o que foi estudado..." />
          <ArrayField label="Exemplos Práticos" values={topic.detalhe.exemplos} onChange={v => updD("exemplos", v)} placeholder="Exemplos de uso ou casos reais..." />
          <ArrayField label="Código de Exemplo" values={topic.detalhe.codigo} onChange={v => updD("codigo", v)} mono placeholder="// exemplo de código" />
        </div>
      )}
    </div>
  );
}

function StudyPreview({ config }) {
  const primary = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = { CONCEITO: `#${config.cores.concept}`, PRÁTICA: `#${config.cores.practice}`, RESUMO: `#${config.cores.summary}` };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, lineHeight: 1.75, color: "#1a1a2e", background: "#fff" }}>
      <div style={{ padding: "56px 48px 42px", background: `linear-gradient(160deg, ${primary}08, transparent)`, borderBottom: `4px solid ${primary}` }}>
        {config.logo && <div style={{ marginBottom: 28 }}><img src={config.logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 350, objectFit: "contain" }} /></div>}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>RELATÓRIO DE ESTUDO — APRENDIZADO TÉCNICO</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: primary, lineHeight: 1.15, marginBottom: 12, fontFamily: "Georgia, serif" }}>{config.titulo || "Título do Estudo"}</div>
        <div style={{ fontSize: 15, color: secondary, fontWeight: 500, paddingBottom: 22, marginBottom: 22, borderBottom: `1px solid ${secondary}30` }}>{config.subtitulo || "Tema ou assunto estudado"}</div>
        <div style={{ display: "flex", gap: 28, fontSize: 12, color: "#888" }}>
          <span><strong style={{ color: "#555" }}>Estudante:</strong> {config.autor || "—"}</span>
          <span><strong style={{ color: "#555" }}>Versão:</strong> {config.versao}</span>
          <span><strong style={{ color: "#555" }}>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
      {config.introducao.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: primary, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Introdução e Objetivos</div>
          </div>
          {config.introducao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}
      {config.topicos.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: typeColors.CONCEITO, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Resumo dos Tópicos</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: primary }}>
                {["#", "Tópico", "Tipo", "Resumo"].map((h, i) => (
                  <th key={h} style={{ color: "#fff", padding: "10px 14px", textAlign: "left", fontWeight: 700, width: i === 0 ? 38 : "auto" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.topicos.map((p, i) => {
                const c = typeColors[p.tipo] || typeColors.CONCEITO;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 700, color: "#bbb", fontFamily: "monospace", fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", fontWeight: 600 }}>{p.titulo || "—"}</td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee" }}>
                      <span style={{ background: `${c}18`, color: c, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>{p.tipo}</span>
                    </td>
                    <td style={{ padding: "9px 14px", borderBottom: "1px solid #eee", color: "#444" }}>{p.resumo || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {config.topicos.length > 0 && (
        <div style={{ padding: "38px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: typeColors.PRÁTICA, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Desenvolvimento do Estudo</div>
          </div>
          {config.topicos.map((p, i) => {
            const c = typeColors[p.tipo] || typeColors.CONCEITO;
            const d = p.detalhe || {};
            return (
              <div key={i} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{p.titulo || "Sem título"}</div>
                  <span style={{ background: `${c}18`, color: c, padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: .5, marginLeft: "auto" }}>{p.tipo}</span>
                </div>
                {d.explicacao?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Explicação</div>{d.explicacao.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.exemplos?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Exemplos / Casos de uso</div>{d.exemplos.filter(t => t.trim()).map((t, j) => <p key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.7, marginBottom: 6 }}>{t}</p>)}</div>}
                {d.codigo?.some(t => t.trim()) && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Código de Exemplo</div>{d.codigo.filter(t => t.trim()).map((t, j) => <pre key={j} style={{ background: `#${config.cores.codeBg}`, color: `#${config.cores.codeText}`, padding: "12px 16px", borderRadius: 8, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{t}</pre>)}</div>}
              </div>
            );
          })}
        </div>
      )}
      {config.conclusao.some(t => t.trim()) && (
        <div style={{ padding: "38px 48px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 5, height: 24, background: typeColors.RESUMO, borderRadius: 3 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: primary }}>Conclusão e Próximos Passos</div>
          </div>
          {config.conclusao.filter(t => t.trim()).map((t, i) => <p key={i} style={{ fontSize: 13, color: "#333", marginBottom: 12 }}>{t}</p>)}
        </div>
      )}
      <div style={{ padding: "24px 48px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#999", fontSize: 11 }}>
        <span>Relatório de Estudo — {config.titulo || "Documento"}</span>
        {config.logo && <img src={config.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", opacity: 0.6 }} />}
      </div>
    </div>
  );
}

// ─── TEMPLATE SELECTOR ────────────────────────────────────────────────────────

function TemplateSelector({ current, onSelect, onClose }) {
  return (
    <div className="tmpl-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tmpl-modal">
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--b1)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--disp)", marginBottom: 6 }}>Escolher Template</div>
          <div style={{ fontSize: 13, color: "var(--tx3)" }}>Selecione o tipo de relatório que deseja criar</div>
        </div>
        <div style={{ padding: "24px 32px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.values(TEMPLATES).map(tmpl => (
            <div
              key={tmpl.id}
              className={`tmpl-card${current === tmpl.id ? " active" : ""}`}
              onClick={() => { onSelect(tmpl.id); onClose(); }}
            >
              <div className="tmpl-card-glow" style={{ background: tmpl.accent }} />
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: tmpl.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${tmpl.accent}30` }}>
                  <Bi name={tmpl.icon} size={26} style={{ color: tmpl.accent }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>{tmpl.label}</div>
                  <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.5 }}>{tmpl.description}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${current === tmpl.id ? tmpl.accent : "var(--b2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {current === tmpl.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: tmpl.accent }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 32px 28px" }}>
          <button onClick={onClose} className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── JSON OUTPUT ─────────────────────────────────────────────────────────────

function JsonOutput({ config }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(config, null, 2);
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

// ─── HTML BUILDERS ────────────────────────────────────────────────────────────

function buildBugsHtml(config) {
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

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${escHtml(config.titulo)||"Relatório Técnico"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#1e2138;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;background:#6271f5;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
.bar-label{font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace}
</style></head><body>
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">Relatório de Bugs</span>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <span class="bar-label">${escHtml(config.formato)} · v${escHtml(config.versao)}</span>
</div>
<div style="padding:56px 48px 42px;background:linear-gradient(160deg,${primary}08,transparent);border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:28px"><img src="${config.logo}" style="max-height:100px;max-width:350px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:14px">RELATÓRIO DE BUGS — ANÁLISE TÉCNICA</div>
  <div style="font-size:30px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:12px;font-family:Georgia,serif">${escHtml(config.titulo)||"Título do Relatório"}</div>
  <div style="font-size:15px;color:${secondary};font-weight:500;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid ${secondary}30">${escHtml(config.subtitulo)||""}</div>
  <div style="display:flex;gap:28px;font-size:12px;color:#888">
    <span><strong style="color:#555">Autor:</strong> ${escHtml(config.autor)||"—"}</span>
    <span><strong style="color:#555">Versão:</strong> ${escHtml(config.versao)}</span>
  </div>
</div>
${config.problemas.length ? `
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
</div>` : ""}
<div style="padding:24px 48px;border-top:1px solid #eee;margin-top:40px;color:#999;font-size:11px">Relatório Técnico — ${escHtml(config.titulo)||"Documento"}</div>
</body></html>`;
}

function buildChangelogHtml(config) {
  const primary = `#${config.cores.primaria}`;
  const escHtml = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const typeColors = { feat: `#${config.cores.feat}`, fix: `#${config.cores.fix}`, breaking: `#${config.cores.breaking}`, refactor: `#${config.cores.refactor}`, perf: `#${config.cores.perf}`, style: `#${config.cores.style || "DB2777"}`, chore: `#${config.cores.chore}` };

  const tableRows = config.mudancas.map((m, i) => {
    const c = typeColors[m.tipo] || "#6271f5";
    const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
    return `<tr style="background:${i%2?"#f8f9fb":"#fff"}">
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;color:#ccc">${i+1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee"><span style="background:${c}18;color:${c};padding:2px 9px;border-radius:12px;font-size:10px;font-weight:800">${info.label}</span></td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escHtml(m.titulo)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:10px;color:#666">${escHtml(m.arquivo)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:11px;color:#444">${escHtml(m.impacto)}</td>
    </tr>`;
  }).join("");

  const grouped = {};
  config.mudancas.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });
  const typeOrder = ["breaking","feat","fix","refactor","perf","style","chore"];

  const detailsHtml = typeOrder.filter(t => grouped[t]?.length).map(tipo => {
    const info = CHANGE_TYPES[tipo];
    const c = typeColors[tipo] || info.color;
    return `<div style="margin-bottom:28px">
      <div style="margin-bottom:14px"><span style="background:${c}18;color:${c};padding:4px 14px;border-radius:20px;font-size:11px;font-weight:800;border:1px solid ${c}40">${info.label} (${grouped[tipo].length})</span></div>
      ${grouped[tipo].map(m => `
        <div style="margin-bottom:20px;border-left:3px solid ${c};padding-left:18px">
          <div style="font-size:14px;font-weight:800;color:#1a1a2e;margin-bottom:6px">${escHtml(m.titulo)}</div>
          ${m.arquivo ? `<div style="font-family:monospace;font-size:10px;color:#666;background:#f5f5f5;padding:3px 10px;border-radius:5px;display:inline-block;margin-bottom:8px">${escHtml(m.arquivo)}</div>` : ""}
          ${m.descricao?.trim() ? `<p style="font-size:12px;color:#333;margin-bottom:8px;line-height:1.7">${escHtml(m.descricao)}</p>` : ""}
          ${(m.codigoAntes?.trim() || m.codigoDepois?.trim()) ? `
          <div style="background:#0d1117;border-radius:8px;overflow:hidden;font-size:11px;font-family:monospace;margin-top:8px">
            ${m.codigoAntes?.trim() ? m.codigoAntes.split("\n").map(l => `<div style="padding:2px 14px 2px 10px;background:rgba(220,38,38,0.12);border-left:3px solid #DC2626;color:#fca5a5;white-space:pre-wrap;word-break:break-all">- ${escHtml(l)}</div>`).join("") : ""}
            ${m.codigoDepois?.trim() ? m.codigoDepois.split("\n").map(l => `<div style="padding:2px 14px 2px 10px;background:rgba(16,185,129,0.12);border-left:3px solid #10B981;color:#86efac;white-space:pre-wrap;word-break:break-all">+ ${escHtml(l)}</div>`).join("") : ""}
          </div>` : ""}
        </div>`).join("")}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>Changelog — ${escHtml(config.titulo)||"Documento"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#0F4C35;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;background:#10B981;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
</style></head><body>
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">Changelog</span>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <span style="font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;font-family:monospace">v${escHtml(config.versao)}</span>
</div>
<div style="padding:48px 48px 36px;background:linear-gradient(160deg,#0F4C3508,transparent);border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:24px"><img src="${config.logo}" style="max-height:80px;max-width:280px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:12px">CHANGELOG — REGISTRO DE MUDANÇAS</div>
  <div style="font-size:28px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:10px;font-family:Georgia,serif">${escHtml(config.titulo)||"Changelog do Projeto"}</div>
  <div style="font-size:14px;color:#10B981;font-weight:600;padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid #10B98130">${escHtml(config.subtitulo)||""}</div>
  <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:12px;color:#888">
    ${config.projeto ? `<span><strong style="color:#555">Projeto:</strong> ${escHtml(config.projeto)}</span>` : ""}
    ${config.autor ? `<span><strong style="color:#555">Autor:</strong> ${escHtml(config.autor)}</span>` : ""}
    <span><strong style="color:#555">Versão:</strong> ${escHtml(config.versao)}</span>
  </div>
</div>
${config.mudancas.length ? `
<div style="padding:32px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:5px;height:24px;background:#10B981;border-radius:3px;display:inline-block"></div>
    <span style="font-size:16px;font-weight:800;color:${primary}">Tabela de Mudanças</span>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:11px">
    <thead><tr style="background:${primary}">
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700;width:32px">#</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">Tipo</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">Mudança</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">Arquivo(s)</th>
      <th style="color:#fff;padding:9px 12px;text-align:left;font-weight:700">Impacto</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>
<div style="padding:32px 48px 0">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <div style="width:5px;height:24px;background:#10B981;border-radius:3px;display:inline-block"></div>
    <span style="font-size:16px;font-weight:800;color:${primary}">Detalhamento</span>
  </div>
  ${detailsHtml}
</div>` : ""}
<div style="padding:20px 48px;border-top:1px solid #eee;margin-top:40px;color:#999;font-size:11px">Changelog — ${escHtml(config.titulo)||"Documento"} · v${escHtml(config.versao)}</div>
</body></html>`;
}

function buildStudyHtml(config) {
  const primary   = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const typeColors = { CONCEITO: `#${config.cores.concept}`, PRÁTICA: `#${config.cores.practice}`, RESUMO: `#${config.cores.summary}` };
  const escHtml = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const topicRows = config.topicos.map((p, i) => {
    const c = typeColors[p.tipo] || typeColors.CONCEITO;
    return `<tr style="background:${i%2?"#f8f8fb":"#fff"}">
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:700;color:#bbb;font-family:monospace">${i+1}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;font-weight:600">${escHtml(p.titulo)}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee"><span style="background:${c}22;color:${c};padding:3px 10px;border-radius:12px;font-size:10px;font-weight:800">${p.tipo}</span></td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;color:#444">${escHtml(p.resumo)}</td>
    </tr>`;
  }).join("");

  const developmentHtml = config.topicos.map((p, i) => {
    const c = typeColors[p.tipo] || typeColors.CONCEITO;
    const d = p.detalhe || {};
    return `<div style="margin-bottom:40px;border-left:4px solid ${c};padding-left:20px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:28px;height:28px;border-radius:7px;background:${c};display:flex;align-items:center;justify-content:center;color:#fff;font-family:monospace;font-weight:800">${i+1}</div>
        <div style="font-size:15px;font-weight:800;color:#1a1a2e">${escHtml(p.titulo)}</div>
        <span style="background:${c}18;color:${c};padding:2px 10px;border-radius:12px;font-size:10px;font-weight:800;margin-left:auto">${p.tipo}</span>
      </div>
      ${d.explicacao?.some(t => t.trim()) ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:6px">Explicação</div>${d.explicacao.filter(t => t.trim()).map(t => `<p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:6px">${escHtml(t)}</p>`).join("")}</div>` : ""}
      ${d.exemplos?.some(t => t.trim()) ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:6px">Exemplos</div>${d.exemplos.filter(t => t.trim()).map(t => `<p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:6px">${escHtml(t)}</p>`).join("")}</div>` : ""}
      ${d.codigo?.some(t => t.trim()) ? `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:6px">Código de Exemplo</div>${d.codigo.filter(t => t.trim()).map(t => `<pre style="background:#${config.cores.codeBg};color:#${config.cores.codeText};padding:12px 16px;border-radius:8px;font-size:11px;font-family:monospace;line-height:1.6;white-space:pre-wrap;word-break:break-all;margin-bottom:8px">${escHtml(t)}</pre>`).join("")}</div>` : ""}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/><title>${escHtml(config.titulo)||"Relatório de Estudo"}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#1a1a2e;background:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}@page{margin:1.5cm}}
.print-bar{background:#1e2138;padding:12px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100}
.print-btn{padding:8px 20px;border:none;border-radius:8px;background:#f59e0b;color:#fff;font-size:13px;font-weight:700;cursor:pointer}
</style></head><body>
<div class="print-bar no-print">
  <span style="color:#fff;font-weight:700;font-size:14px">Relatório de Estudo</span>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</div>
<div style="padding:56px 48px 42px;background:linear-gradient(160deg,${primary}08,transparent);border-bottom:4px solid ${primary}">
  ${config.logo ? `<div style="margin-bottom:28px"><img src="${config.logo}" style="max-height:100px;max-width:350px;object-fit:contain"/></div>` : ""}
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:#aaa;text-transform:uppercase;margin-bottom:14px">RELATÓRIO DE ESTUDO — APRENDIZADO TÉCNICO</div>
  <div style="font-size:30px;font-weight:900;color:${primary};line-height:1.15;margin-bottom:12px;font-family:Georgia,serif">${escHtml(config.titulo)||"Título do Estudo"}</div>
  <div style="font-size:15px;color:${secondary};font-weight:500;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid ${secondary}30">${escHtml(config.subtitulo)||""}</div>
  <div style="display:flex;gap:28px;font-size:12px;color:#888">
    <span><strong style="color:#555">Estudante:</strong> ${escHtml(config.autor)||"—"}</span>
    <span><strong style="color:#555">Versão:</strong> ${escHtml(config.versao)}</span>
  </div>
</div>
${config.introducao.length ? `<div style="padding:38px 48px 0"><div style="display:flex;align-items:center;gap:12px;margin-bottom:18px"><div style="width:5px;height:24px;background:${primary};border-radius:3px"></div><span style="font-size:18px;font-weight:800;color:${primary}">Introdução</span></div>${config.introducao.map(t => `<p style="font-size:13px;color:#333;margin-bottom:12px">${escHtml(t)}</p>`).join("")}</div>` : ""}
${config.topicos.length ? `<div style="padding:38px 48px 0"><div style="display:flex;align-items:center;gap:12px;margin-bottom:18px"><div style="width:5px;height:24px;background:${typeColors.CONCEITO};border-radius:3px"></div><span style="font-size:18px;font-weight:800;color:${primary}">Tópicos</span></div><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:${primary}"><th style="color:#fff;padding:10px 14px;text-align:left">#</th><th style="color:#fff;padding:10px 14px;text-align:left">Tópico</th><th style="color:#fff;padding:10px 14px;text-align:left">Tipo</th><th style="color:#fff;padding:10px 14px;text-align:left">Resumo</th></tr></thead><tbody>${topicRows}</tbody></table></div>` : ""}
<div style="padding:38px 48px 0"><div style="display:flex;align-items:center;gap:12px;margin-bottom:24px"><div style="width:5px;height:24px;background:${typeColors.PRÁTICA};border-radius:3px"></div><span style="font-size:18px;font-weight:800;color:${primary}">Desenvolvimento</span></div>${developmentHtml}</div>
${config.conclusao.length ? `<div style="padding:38px 48px 56px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:18px"><div style="width:5px;height:24px;background:${typeColors.RESUMO};border-radius:3px"></div><span style="font-size:18px;font-weight:800;color:${primary}">Conclusão</span></div>${config.conclusao.map(t => `<p style="font-size:13px;color:#333;margin-bottom:12px">${escHtml(t)}</p>`).join("")}</div>` : ""}
<div style="padding:24px 48px;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-between;color:#999;font-size:11px"><span>Relatório de Estudo — ${escHtml(config.titulo)}</span></div>
</body></html>`;
}

function buildStudyPdfDef(config, logoDataUrl) {
  const primary = pdfColor(config.cores.primaria);
  const secondary = pdfColor(config.cores.secundaria);
  const typeColors = { CONCEITO: pdfColor(config.cores.concept), PRÁTICA: pdfColor(config.cores.practice), RESUMO: pdfColor(config.cores.summary) };
  const codeBg = pdfColor(config.cores.codeBg);
  const codeText = pdfColor(config.cores.codeText);
  const content = [];

  if (logoDataUrl) content.push({ image: logoDataUrl, width: 160, margin: [0, 0, 0, 16] });
  content.push(
    { text: "RELATÓRIO DE ESTUDO — APRENDIZADO TÉCNICO", fontSize: 8, color: "#AAAAAA", bold: true, margin: [0, 0, 0, 10] },
    { text: config.titulo || "Título do Estudo", fontSize: 26, bold: true, color: primary, margin: [0, 0, 0, 8] },
    { text: config.subtitulo || "", fontSize: 13, color: secondary, margin: [0, 0, 0, 16] },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#DDDDDD" }], margin: [0, 0, 0, 12] },
    { columns: [{ text: [{ text: "Estudante: ", bold: true }, { text: config.autor || "—" }], fontSize: 10 }, { text: [{ text: "Versão: ", bold: true }, { text: config.versao || "1.0" }], fontSize: 10 }], margin: [0, 0, 0, 24] },
    { text: "", pageBreak: "after" }
  );

  const intro = (config.introducao || []).filter(t => t.trim());
  if (intro.length) {
    content.push({ text: "Introdução", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] }, ...intro.map(t => ({ text: t, fontSize: 11, margin: [0, 0, 0, 8], lineHeight: 1.5 })), { text: "", margin: [0, 16, 0, 0] });
  }

  if (config.topicos.length) {
    content.push({ text: "Tabela de Tópicos", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] });
    const tableBody = [[{ text: "#", bold: true, color: "#FFFFFF", fillColor: primary }, { text: "Tópico", bold: true, color: "#FFFFFF", fillColor: primary }, { text: "Tipo", bold: true, color: "#FFFFFF", fillColor: primary }, { text: "Resumo", bold: true, color: "#FFFFFF", fillColor: primary }]];
    config.topicos.forEach((p, i) => {
      const fill = i % 2 ? "#F8F8FB" : "#FFFFFF";
      tableBody.push([{ text: String(i+1), fillColor: fill }, { text: p.titulo, bold: true, fillColor: fill }, { text: p.tipo, color: typeColors[p.tipo], bold: true, fillColor: fill }, { text: p.resumo, fillColor: fill }]);
    });
    content.push({ table: { widths: [25, "*", 70, "*"], body: tableBody }, layout: "lightHorizontalLines", margin: [0, 0, 0, 24] }, { text: "", pageBreak: "after" });

    content.push({ text: "Desenvolvimento do Estudo", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 16] });
    config.topicos.forEach((p, i) => {
      const c = typeColors[p.tipo] || typeColors.CONCEITO;
      const stack = [{ columns: [{ text: `${i + 1}. ${p.titulo}`, fontSize: 13, bold: true }, { text: p.tipo, fontSize: 10, bold: true, color: c, alignment: "right" }] }];
      const pushS = (lbl, items) => {
        if (!items?.some(t => t.trim())) return;
        stack.push({ text: lbl, fontSize: 8, bold: true, color: "#999999", margin: [0, 6, 0, 3] });
        items.filter(t => t.trim()).forEach(t => stack.push({ text: t, fontSize: 10, margin: [0, 0, 0, 3], lineHeight: 1.4 }));
      };
      const pushC = (lbl, items) => {
        if (!items?.some(t => t.trim())) return;
        stack.push({ text: lbl, fontSize: 8, bold: true, color: "#999999", margin: [0, 6, 0, 3] });
        items.filter(t => t.trim()).forEach(t => {
            const lines = t.split("\n");
            const tableRows = lines.map(line => ([{
              text: line,
              fontSize: 8.5,
              color: codeText,
              fillColor: codeBg,
              margin: [0, 1, 0, 1],
              preserveLeadingSpaces: true
            }]));
            stack.push({
              table: {
                widths: ['*'],
                body: tableRows
              },
              layout: 'noBorders',
              margin: [0, 0, 0, 4]
            });
            stack.push({ text: "", margin: [0, 0, 0, 4] });
        });
      };
      pushS("EXPLICAÇÃO", p.detalhe.explicacao);
      pushS("EXEMPLOS", p.detalhe.exemplos);
      pushC("CÓDIGO", p.detalhe.codigo);
      content.push({ columns: [{ width: 5, canvas: [{ type: "rect", x: 0, y: 0, w: 5, h: 40, color: c }] }, { width: "*", stack, margin: [10, 0, 0, 0] }], margin: [0, 0, 0, 20] });
    });
  }

  const conc = (config.conclusao || []).filter(t => t.trim());
  if (conc.length) {
    content.push({ text: "", pageBreak: "before" }, { text: "Conclusão", fontSize: 16, bold: true, color: typeColors.RESUMO, margin: [0, 0, 0, 10] }, ...conc.map(t => ({ text: t, fontSize: 11, margin: [0, 0, 0, 8], lineHeight: 1.5 })));
  }

  return { pageSize: config.formato === "ABNT" ? "A4" : "LETTER", pageMargins: [56, 56, 56, 56], content, footer: (cp, pc) => ({ columns: [{ text: `Relatório de Estudo — ${config.titulo}`, fontSize: 9, color: "#999999", margin: [56, 8, 0, 0] }, { text: `${cp}/${pc}`, fontSize: 9, color: "#999999", alignment: "right", margin: [0, 8, 56, 0] }] }), defaultStyle: { font: "Roboto" } };
}

// ─── PDF BUILDER (pdfmake — texto vetorial real, não imagem) ─────────────────

async function loadPdfMake() {
  if (window._pdfMakeReady) return;
  const load = src =>
    new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  await load("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js");
  await load("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js");
  // Assign VFS - vfs_fonts.js may expose it in different ways
  if (window.pdfMake) {
    if (!window.pdfMake.vfs) {
      if (window.pdfFonts?.pdfMake?.vfs) window.pdfMake.vfs = window.pdfFonts.pdfMake.vfs;
      else if (window.pdfFonts?.vfs) window.pdfMake.vfs = window.pdfFonts.vfs;
    }
  }

  // Garante que apenas Roboto (disponível no VFS padrão) está registrado
  // Courier foi removido do uso — blocos de código usam Roboto com estilo visual
  window._pdfMakeReady = true;
}

function pdfColor(hex) {
  return `#${(hex || "000000").replace("#", "").padStart(6, "0")}`;
}

async function logoToDataUrl(logoSrc) {
  if (!logoSrc) return null;
  if (logoSrc.startsWith("data:")) return logoSrc;
  return new Promise(res => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      res(c.toDataURL("image/png"));
    };
    img.onerror = () => res(null);
    img.src = logoSrc;
  });
}

function buildBugsPdfDef(config, logoDataUrl) {
  const primary = pdfColor(config.cores.primaria);
  const secondary = pdfColor(config.cores.secundaria);
  const sevColors = {
    ALTA:  pdfColor(config.cores.altaSev),
    MÉDIA: pdfColor(config.cores.mediaSev),
    BAIXA: pdfColor(config.cores.baixaSev),
  };
  const codeBg   = pdfColor(config.cores.codeBg);
  const codeText = pdfColor(config.cores.codeText);
  const isAbnt = config.formato === "ABNT";
  const content = [];

  // Capa
  if (logoDataUrl) content.push({ image: logoDataUrl, width: 160, margin: [0, 0, 0, 16] });
  content.push(
    { text: "RELATÓRIO DE BUGS — ANÁLISE TÉCNICA", fontSize: 8, color: "#AAAAAA", bold: true, margin: [0, 0, 0, 10] },
    { text: config.titulo || "Título do Relatório", fontSize: 26, bold: true, color: primary, margin: [0, 0, 0, 8] },
    { text: config.subtitulo || "", fontSize: 13, color: secondary, margin: [0, 0, 0, 16] },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#DDDDDD" }], margin: [0, 0, 0, 12] },
    {
      columns: [
        { text: [{ text: "Autor: ", bold: true, color: "#555555" }, { text: config.autor || "—", color: "#888888" }], fontSize: 10 },
        { text: [{ text: "Versão: ", bold: true, color: "#555555" }, { text: config.versao || "1.0", color: "#888888" }], fontSize: 10 },
        { text: [{ text: "Formato: ", bold: true, color: "#555555" }, { text: config.formato, color: "#888888" }], fontSize: 10 },
      ],
      margin: [0, 0, 0, 24],
    },
    { text: "", pageBreak: "after" }
  );

  // Resumo Executivo
  const resumoTextos = (config.resumoExecutivo || []).filter(t => t.trim());
  if (resumoTextos.length > 0) {
    content.push(
      { text: "Resumo Executivo", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] },
      ...resumoTextos.map(t => ({ text: t, fontSize: 11, color: "#333333", margin: [0, 0, 0, 8], lineHeight: 1.5 })),
      { text: "", margin: [0, 16, 0, 0] }
    );
  }

  // Tabela de Problemas
  if (config.problemas.length > 0) {
    content.push({ text: "Tabela de Problemas", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] });
    const tableBody = [
      [
        { text: "#",          bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Problema",   bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Severidade", bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Resolução",  bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
      ],
      ...config.problemas.map((p, i) => {
        const c = sevColors[p.severity] || sevColors.ALTA;
        const fill = i % 2 ? "#F8F8FB" : "#FFFFFF";
        return [
          { text: String(i + 1),  bold: true, color: "#BBBBBB", fillColor: fill, fontSize: 10, margin: [4, 5, 4, 5] },
          { text: p.titulo || "—", bold: true, fillColor: fill, fontSize: 11, margin: [4, 5, 4, 5] },
          { text: p.severity, color: c, bold: true, fillColor: fill, fontSize: 10, margin: [4, 5, 4, 5] },
          { text: p.resolucao || "—", fillColor: fill, fontSize: 10, margin: [4, 5, 4, 5], color: "#444444" },
        ];
      }),
    ];
    content.push({
      table: { widths: [30, "*", 70, "*"], body: tableBody },
      layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#DDDDDD", vLineColor: () => "#DDDDDD" },
      margin: [0, 0, 0, 24],
    }, { text: "", pageBreak: "after" });

    // Detalhamento
    content.push({ text: "Detalhamento dos Problemas", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 16] });
    config.problemas.forEach((p, i) => {
      const c = sevColors[p.severity] || sevColors.ALTA;
      const d = p.detalhe || {};
      const stack = [
        {
          columns: [
            { text: `${i + 1}. ${p.titulo || "Sem título"}`, fontSize: 13, bold: true, color: "#1A1A2E" },
            { text: p.severity, fontSize: 10, bold: true, color: c, alignment: "right" },
          ],
        },
      ];
      if (p.resumo) stack.push({ text: p.resumo, fontSize: 10, color: "#333333", margin: [0, 6, 0, 4], lineHeight: 1.5 });
      const pushSection = (label, items) => {
        if (!items?.some(t => t.trim())) return;
        stack.push({ text: label, fontSize: 8, bold: true, color: "#999999", margin: [0, 6, 0, 3] });
        items.filter(t => t.trim()).forEach(t => stack.push({ text: t, fontSize: 10, color: "#333333", margin: [0, 0, 0, 3], lineHeight: 1.4 }));
      };
      const pushCodeSection = (label, items) => {
        if (!items?.some(t => t.trim())) return;
        stack.push({ text: label, fontSize: 8, bold: true, color: "#999999", margin: [0, 6, 0, 3] });
        items.filter(t => t.trim()).forEach(t => {
          const lines = t.split("\n");
          const tableRows = lines.map(line => ([{
            text: line,
            fontSize: 8.5,
            color: codeText,
            fillColor: codeBg,
            margin: [0, 1, 0, 1],
            preserveLeadingSpaces: true
          }]));
          stack.push({
            table: {
              widths: ['*'],
              body: tableRows
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 4]
          });
          stack.push({ text: "", margin: [0, 0, 0, 4] });
        });
      };
      pushSection("ONDE OCORRE", d.ondeOcorre);
      pushCodeSection("CÓDIGO ONDE OCORRE", d.codigoOnde);
      pushSection("POR QUE É UM PROBLEMA", d.porqueProblema);
      pushSection("EXPLICAÇÃO DE RESOLUÇÃO", d.textoResolucao);
      pushCodeSection("CÓDIGO DE RESOLUÇÃO", d.codigoResolucao);

      content.push({
        columns: [
          { width: 5, canvas: [{ type: "rect", x: 0, y: 0, w: 5, h: 60, color: c }] },
          { width: "*", stack, margin: [10, 0, 0, 0] },
        ],
        margin: [0, 0, 0, 20],
      });
    });
  }

  // Conclusão
  const conclusaoTextos = (config.conclusao || []).filter(t => t.trim());
  if (conclusaoTextos.length > 0) {
    content.push(
      { text: "", pageBreak: "before" },
      { text: "Conclusão", fontSize: 16, bold: true, color: pdfColor(config.cores.baixaSev), margin: [0, 0, 0, 10] },
      ...conclusaoTextos.map(t => ({ text: t, fontSize: 11, color: "#333333", margin: [0, 0, 0, 8], lineHeight: 1.5 }))
    );
  }

  return {
    pageSize: isAbnt ? "A4" : "LETTER",
    pageMargins: [56, 56, 56, 56],
    content,
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `Relatório Técnico — ${config.titulo || "Documento"}`, fontSize: 9, color: "#999999", margin: [56, 8, 0, 0] },
        { text: `${currentPage}/${pageCount}`, fontSize: 9, color: "#999999", alignment: "right", margin: [0, 8, 56, 0] },
      ],
    }),
    defaultStyle: { font: "Roboto", fontSize: 11, color: "#1A1A2E" },

  };
}

// SVG icons for change types in PDF
function changeTypeSvg(tipo, color, size = 14) {
  const shapes = {
    feat:     `<polygon points="7,1 9,5 14,5.5 10.5,9 11.5,14 7,11.5 2.5,14 3.5,9 0,5.5 5,5" fill="${color}"/>`,
    fix:      `<circle cx="7" cy="7" r="6" fill="none" stroke="${color}" stroke-width="2"/><line x1="5" y1="5" x2="9" y2="9" stroke="${color}" stroke-width="2"/><line x1="9" y1="5" x2="5" y2="9" stroke="${color}" stroke-width="2"/>`,
    breaking: `<polygon points="7,1 13,13 1,13" fill="none" stroke="${color}" stroke-width="2"/><line x1="7" y1="5" x2="7" y2="9" stroke="${color}" stroke-width="2"/><circle cx="7" cy="11" r="1" fill="${color}"/>`,
    refactor: `<path d="M3,7 Q7,2 11,7 Q7,12 3,7" fill="none" stroke="${color}" stroke-width="2"/><polyline points="10,4 13,7 10,10" fill="none" stroke="${color}" stroke-width="2"/>`,
    perf:     `<polyline points="1,11 5,7 8,9 13,3" fill="none" stroke="${color}" stroke-width="2"/><circle cx="13" cy="3" r="1.5" fill="${color}"/>`,
    style:    `<circle cx="7" cy="7" r="5" fill="${color}" opacity="0.3"/><circle cx="7" cy="7" r="2.5" fill="${color}"/>`,
    chore:    `<circle cx="7" cy="7" r="5" fill="none" stroke="${color}" stroke-width="2"/><line x1="7" y1="2" x2="7" y2="5" stroke="${color}" stroke-width="2"/><line x1="7" y1="9" x2="7" y2="12" stroke="${color}" stroke-width="2"/><line x1="2" y1="7" x2="5" y2="7" stroke="${color}" stroke-width="2"/><line x1="9" y1="7" x2="12" y2="7" stroke="${color}" stroke-width="2"/>`,
  };
  const shape = shapes[tipo] || shapes.chore;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="${size}" height="${size}">${shape}</svg>`;
}

function buildChangelogPdfDef(config, logoDataUrl) {
  const isAbnt = config.formato === "ABNT";
  const primary = pdfColor(config.cores.primaria);
  const typeColors = {
    feat:     pdfColor(config.cores.feat),
    fix:      pdfColor(config.cores.fix),
    breaking: pdfColor(config.cores.breaking),
    refactor: pdfColor(config.cores.refactor),
    perf:     pdfColor(config.cores.perf),
    style:    pdfColor(config.cores.style || "DB2777"),
    chore:    pdfColor(config.cores.chore),
  };
  const codeBg   = pdfColor(config.cores.codeBg);
  const codeText = pdfColor(config.cores.codeText);
  const typeOrder = ["breaking","feat","fix","refactor","perf","style","chore"];
  const content = [];

  // Capa
  if (logoDataUrl) content.push({ image: logoDataUrl, width: 160, margin: [0, 0, 0, 16] });
  content.push(
    { text: "CHANGELOG — REGISTRO DE MUDANÇAS", fontSize: 8, color: "#AAAAAA", bold: true, margin: [0, 0, 0, 10] },
    { text: config.titulo || "Changelog do Projeto", fontSize: 26, bold: true, color: primary, margin: [0, 0, 0, 8] },
    { text: config.subtitulo || "", fontSize: 13, color: "#10B981", margin: [0, 0, 0, 16] },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#DDDDDD" }], margin: [0, 0, 0, 12] }
  );
  const metaItems = [];
  if (config.projeto) metaItems.push({ text: [{ text: "Projeto: ", bold: true, color: "#555555" }, { text: config.projeto, color: "#888888" }], fontSize: 10 });
  if (config.autor)   metaItems.push({ text: [{ text: "Autor: ",   bold: true, color: "#555555" }, { text: config.autor,   color: "#888888" }], fontSize: 10 });
  metaItems.push({ text: [{ text: "Versão: ", bold: true, color: "#555555" }, { text: config.versao || "1.0", color: "#888888" }], fontSize: 10 });
  if (config.dataInicio) metaItems.push({ text: [{ text: "Período: ", bold: true, color: "#555555" }, { text: config.dataInicio + (config.dataFim ? ` → ${config.dataFim}` : ""), color: "#888888" }], fontSize: 10 });
  content.push({ columns: metaItems, margin: [0, 0, 0, 24] }, { text: "", pageBreak: "after" });

  // Visão Geral
  const descTextos = (config.descricao || []).filter(t => t.trim());
  if (descTextos.length > 0) {
    content.push(
      { text: "Visão Geral", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] },
      ...descTextos.map(t => ({ text: t, fontSize: 11, color: "#333333", margin: [0, 0, 0, 8], lineHeight: 1.5 })),
      { text: "", margin: [0, 16, 0, 0] }
    );
  }

  // Tabela de Mudanças
  if (config.mudancas.length > 0) {
    content.push({ text: "Tabela de Mudanças", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] });
    const tableBody = [
      [
        { text: "#",          bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Tipo",       bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Mudança",    bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Arquivo(s)", bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
        { text: "Impacto",    bold: true, color: "#FFFFFF", fillColor: primary, fontSize: 10, margin: [4, 6, 4, 6] },
      ],
      ...config.mudancas.map((m, i) => {
        const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
        const c = typeColors[m.tipo] || info.color;
        const fill = i % 2 ? "#F8F9FB" : "#FFFFFF";
        return [
          { text: String(i + 1),  bold: true, color: "#BBBBBB", fillColor: fill, fontSize: 9,  margin: [4, 5, 4, 5] },
          { columns: [
              { svg: changeTypeSvg(m.tipo, c, 12), width: 14, margin: [0, 1, 4, 0] },
              { text: info.label, bold: true, color: c, fontSize: 10 },
            ], fillColor: fill, margin: [4, 5, 4, 5] },
          { text: m.titulo || "—", bold: true,                  fillColor: fill, fontSize: 10, margin: [4, 5, 4, 5] },
          { text: m.arquivo || "—",            color: "#666666", fillColor: fill, fontSize: 9,  margin: [4, 5, 4, 5] },
          { text: m.impacto || "—",            color: "#444444", fillColor: fill, fontSize: 9,  margin: [4, 5, 4, 5] },
        ];
      }),
    ];
    content.push(
      { table: { widths: [24, 55, "*", 110, 100], body: tableBody }, layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#DDDDDD", vLineColor: () => "#DDDDDD" }, margin: [0, 0, 0, 24] },
      { text: "", pageBreak: "after" }
    );

    // Detalhamento por tipo
    content.push({ text: "Detalhamento das Mudanças", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 16] });
    const grouped = {};
    config.mudancas.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

    typeOrder.filter(t => grouped[t]?.length > 0).forEach(tipo => {
      const info = CHANGE_TYPES[tipo];
      const c = typeColors[tipo] || info.color;
      content.push({
        columns: [
          { svg: changeTypeSvg(tipo, c, 16), width: 20, margin: [0, 0, 6, 0] },
          { text: `${info.label} (${grouped[tipo].length})`, fontSize: 12, bold: true, color: c },
        ],
        margin: [0, 8, 0, 10],
      });
      grouped[tipo].forEach(m => {
        const stack = [
          { text: m.titulo || "Sem título", fontSize: 12, bold: true, color: "#1A1A2E" },
        ];
        if (m.arquivo) stack.push({ text: m.arquivo, fontSize: 9, color: "#666666", margin: [0, 2, 0, 4] });
        if (m.descricao?.trim()) stack.push({ text: m.descricao, fontSize: 10, color: "#333333", margin: [0, 2, 0, 4], lineHeight: 1.4 });
        if (m.motivacao?.trim()) {
          stack.push({ text: "MOTIVAÇÃO", fontSize: 8, bold: true, color: "#999999", margin: [0, 4, 0, 2] });
          stack.push({ text: m.motivacao, fontSize: 10, color: "#555555", lineHeight: 1.4 });
        }
        if (m.impacto?.trim()) {
          stack.push({ text: "IMPACTO", fontSize: 8, bold: true, color: "#999999", margin: [0, 4, 0, 2] });
          stack.push({ text: m.impacto, fontSize: 10, color: "#555555", lineHeight: 1.4 });
        }
        if (m.codigoAntes?.trim()) {
          stack.push({ text: "ANTES", fontSize: 8, bold: true, color: "#DC2626", margin: [0, 4, 0, 2] });
          const antesRows = m.codigoAntes.split("\n").map(l => ([{
            text: `- ${l}`,
            fontSize: 8.5,
            color: "#FCA5A5",
            fillColor: "#2D0000",
            margin: [0, 1, 0, 1],
            preserveLeadingSpaces: true
          }]));
          stack.push({
            table: {
              widths: ['*'],
              body: antesRows
            },
            layout: 'noBorders',
            margin: [0, 4, 0, 4]
          });
        }
        if (m.codigoDepois?.trim()) {
          stack.push({ text: "DEPOIS", fontSize: 8, bold: true, color: "#10B981", margin: [0, 4, 0, 2] });
          const depoisRows = m.codigoDepois.split("\n").map(l => ([{
            text: `+ ${l}`,
            fontSize: 8.5,
            color: "#86EFAC",
            fillColor: "#002D1A",
            margin: [0, 1, 0, 1],
            preserveLeadingSpaces: true
          }]));
          stack.push({
            table: {
              widths: ['*'],
              body: depoisRows
            },
            layout: 'noBorders',
            margin: [0, 4, 0, 4]
          });
        }
        if (m.notas?.trim()) stack.push({ text: `⚠ Nota: ${m.notas}`, fontSize: 9, color: "#D97706", margin: [0, 4, 0, 0] });

        content.push({
          columns: [
            { width: 4, canvas: [{ type: "rect", x: 0, y: 0, w: 4, h: 60, color: c }] },
            { width: "*", stack, margin: [8, 0, 0, 0] },
          ],
          margin: [0, 0, 0, 16],
        });
      });
    });
  }

  // Resumo Final
  const resumoTextos = (config.resumo || []).filter(t => t.trim());
  if (resumoTextos.length > 0) {
    content.push(
      { text: "", pageBreak: "before" },
      { text: "Resumo Final", fontSize: 16, bold: true, color: primary, margin: [0, 0, 0, 10] },
      ...resumoTextos.map(t => ({ text: t, fontSize: 11, color: "#333333", margin: [0, 0, 0, 8], lineHeight: 1.5 }))
    );
  }

  return {
    pageSize: isAbnt ? "A4" : "LETTER",
    pageMargins: [56, 56, 56, 56],
    content,
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `Changelog — ${config.titulo || "Documento"} · v${config.versao}`, fontSize: 9, color: "#999999", margin: [56, 8, 0, 0] },
        { text: `${currentPage}/${pageCount}`, fontSize: 9, color: "#999999", alignment: "right", margin: [0, 8, 56, 0] },
      ],
    }),
    defaultStyle: { font: "Roboto", fontSize: 11, color: "#1A1A2E" },
    fonts: {
      Roboto: { normal: "Roboto-Regular.ttf", bold: "Roboto-Medium.ttf", italics: "Roboto-Italic.ttf", bolditalics: "Roboto-MediumItalic.ttf" },
    },
  };
}

async function buildAndDownloadPdf(config, onProgress) {
  onProgress("Carregando biblioteca PDF…");
  await loadPdfMake();
  onProgress("Preparando conteúdo…");
  const logoDataUrl = await logoToDataUrl(config.logo);
  onProgress("Gerando PDF vetorial…");
  const buildDef = config.template === "study" ? buildStudyPdfDef : (config.template === "changelog" ? buildChangelogPdfDef : buildBugsPdfDef);
  const docDef = buildDef(config, logoDataUrl);
  const slug = (config.titulo || "relatorio").replace(/\s+/g, "-").toLowerCase();
  return new Promise((resolve, reject) => {
    try {
      window.pdfMake.createPdf(docDef).download(`${slug}.pdf`, () => resolve());
    } catch (e) { reject(e); }
  });
}

// ─── DOCX BUILDER ────────────────────────────────────────────────────────────

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

async function buildAndDownloadDocx(config) {
  const docx = await loadDocxLib();
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, ImageRun, PageBreak
  } = docx;

  const isChangelog = config.template === "changelog";
  const primary = config.cores.primaria;
  const isAbnt = config.formato === "ABNT";
  const pageW = isAbnt ? 11906 : 12240;
  const pageH = isAbnt ? 16838 : 15840;
  const margin = 1440;
  const contentW = pageW - margin * 2;

  const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
  const borders = { top: border, bottom: border, left: border, right: border };

  const h1 = (text, color = primary) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: primary, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 32, color, font: "Arial" })]
  });

  const para = (text, opts = {}) => new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: text || "", size: 22, font: "Arial", color: "333333", ...opts })]
  });

  const subLabel = text => new Paragraph({
    spacing: { before: 120, after: 60 },
    keepNext: true,
    children: [new TextRun({ text: text.toUpperCase(), size: 16, bold: true, color: "999999", font: "Arial" })]
  });

  const codeBlock = text => new Paragraph({
    spacing: { after: 80 },
    shading: { type: ShadingType.CLEAR, fill: config.cores.codeBg },
    indent: { left: 360, right: 360 },
    border: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: "444444", space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "444444", space: 4 },
      left:   { style: BorderStyle.THICK,  size: 8, color: "6271f5", space: 4 },
      right:  { style: BorderStyle.SINGLE, size: 1, color: "444444", space: 4 },
    },
    children: [new TextRun({ text: text || "", size: 18, font: "Courier New", color: config.cores.codeText })]
  });

  const spacer    = () => new Paragraph({ spacing: { after: 160 }, children: [] });
  const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

  // Logo
  let logoData = null;
  if (config.logo?.startsWith("data:image")) {
    try {
      const match = config.logo.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const byteStr = atob(match[2]);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
        logoData = { arr, type: match[1] };
      }
    } catch (e) { /* skip */ }
  }

  const children = [];

  // Capa
  if (logoData) {
    children.push(new Paragraph({
      spacing: { after: 240 },
      children: [new ImageRun({ data: logoData.arr, transformation: { width: 160, height: 80 }, type: logoData.type })]
    }));
  }

  const accentColor = isChangelog ? "10B981" : primary;
  children.push(
    new Paragraph({
      spacing: { before: 360, after: 80 },
      children: [new TextRun({ text: isChangelog ? "CHANGELOG — REGISTRO DE MUDANÇAS" : "RELATÓRIO DE BUGS — ANÁLISE TÉCNICA", size: 16, color: "AAAAAA", font: "Arial", bold: true })]
    }),
    new Paragraph({
      spacing: { after: 160 },
      border: { bottom: { style: BorderStyle.THICK, size: 8, color: accentColor, space: 4 } },
      children: [new TextRun({ text: config.titulo || (isChangelog ? "Changelog do Projeto" : "Título do Relatório"), size: 52, bold: true, color: primary, font: "Arial" })]
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: config.subtitulo || "", size: 26, color: isChangelog ? "10B981" : config.cores.secundaria, font: "Arial" })]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        ...(isChangelog && config.projeto ? [new TextRun({ text: "Projeto: ", bold: true, size: 20, color: "555555", font: "Arial" }), new TextRun({ text: config.projeto + "     ", size: 20, color: "888888", font: "Arial" })] : []),
        new TextRun({ text: "Autor: ",  bold: true, size: 20, color: "555555", font: "Arial" }),
        new TextRun({ text: (config.autor || "—") + "     ", size: 20, color: "888888", font: "Arial" }),
        new TextRun({ text: "Versão: ", bold: true, size: 20, color: "555555", font: "Arial" }),
        new TextRun({ text: config.versao || "1.0", size: 20, color: "888888", font: "Arial" }),
        ...(isChangelog && config.dataInicio ? [new TextRun({ text: "     Período: ", bold: true, size: 20, color: "555555", font: "Arial" }), new TextRun({ text: config.dataInicio + (config.dataFim ? ` → ${config.dataFim}` : ""), size: 20, color: "888888", font: "Arial" })] : []),
      ]
    }),
    pageBreak()
  );

  if (isChangelog) {
    if (config.descricao?.some(t => t.trim())) {
      children.push(h1("Visão Geral", primary));
      config.descricao.filter(t => t.trim()).forEach(t => children.push(para(t)));
      children.push(spacer());
    }

    if (config.mudancas.length > 0) {
      children.push(h1("Tabela de Mudanças", primary));
      const typeColors = { feat: config.cores.feat || "2563EB", fix: config.cores.fix || "D97706", breaking: config.cores.breaking || "DC2626", refactor: config.cores.refactor || "7C3AED", perf: config.cores.perf || "0891B2", style: config.cores.style || "DB2777", chore: config.cores.chore || "64748B" };
      const colW = [500, 1000, 4000, 2000, 1526];
      const headerRow = new TableRow({
        tableHeader: true,
        children: ["#", "Tipo", "Mudança", "Arquivo(s)", "Impacto"].map((h, ci) => new TableCell({
          borders, shading: { type: ShadingType.CLEAR, fill: primary },
          width: { size: colW[ci], type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18, font: "Arial" })] })]
        }))
      });
      const dataRows = config.mudancas.map((m, i) => {
        const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
        const c = typeColors[m.tipo] || info.color.replace("#", "");
        const fill = i % 2 ? "F8F9FB" : "FFFFFF";
        return new TableRow({
          children: [
            new TableCell({ borders, width: { size: colW[0], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), bold: true, size: 16, color: "BBBBBB", font: "Courier New" })] })] }),
            new TableCell({ borders, width: { size: colW[1], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: info.label, bold: true, size: 16, color: c, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: colW[2], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: m.titulo || "—", bold: true, size: 18, color: "1a1a2e", font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: colW[3], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: m.arquivo || "—", size: 16, color: "666666", font: "Courier New" })] })] }),
            new TableCell({ borders, width: { size: colW[4], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: m.impacto || "—", size: 16, color: "444444", font: "Arial" })] })] }),
          ]
        });
      });
      children.push(new Table({ width: { size: contentW, type: WidthType.DXA }, columnWidths: colW, rows: [headerRow, ...dataRows] }), spacer(), pageBreak());

      children.push(h1("Detalhamento das Mudanças", primary));
      config.mudancas.forEach((m, i) => {
        const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
        const c = (typeColors[m.tipo] || info.color.replace("#", ""));
        children.push(
          new Paragraph({
            spacing: { before: 240, after: 100 },
            keepNext: true,
            border: { left: { style: BorderStyle.THICK, size: 12, color: c, space: 8 } },
            indent: { left: 240 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true, size: 26, color: c, font: "Courier New" }),
              new TextRun({ text: m.titulo || "Sem título", bold: true, size: 26, color: "1a1a2e", font: "Arial" }),
              new TextRun({ text: `   [${info.label}]`, bold: true, size: 20, color: c, font: "Arial" }),
            ]
          })
        );
        if (m.arquivo?.trim()) children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: m.arquivo, size: 18, font: "Courier New", color: "666666" })] }));
        if (m.descricao?.trim()) { children.push(subLabel("Descrição")); children.push(para(m.descricao)); }
        if (m.motivacao?.trim()) { children.push(subLabel("Motivação")); children.push(para(m.motivacao)); }
        if (m.impacto?.trim())   { children.push(subLabel("Impacto"));   children.push(para(m.impacto)); }
        if (m.codigoAntes?.trim()) {
          children.push(subLabel("Código antes (removido)"));
          m.codigoAntes.split("\n").forEach(line => children.push(new Paragraph({ spacing: { after: 40 }, shading: { type: ShadingType.CLEAR, fill: "2D0000" }, indent: { left: 360 }, children: [new TextRun({ text: `- ${line}`, size: 18, font: "Courier New", color: "FCA5A5" })] })));
        }
        if (m.codigoDepois?.trim()) {
          children.push(subLabel("Código depois (adicionado)"));
          m.codigoDepois.split("\n").forEach(line => children.push(new Paragraph({ spacing: { after: 40 }, shading: { type: ShadingType.CLEAR, fill: "002D1A" }, indent: { left: 360 }, children: [new TextRun({ text: `+ ${line}`, size: 18, font: "Courier New", color: "86EFAC" })] })));
        }
        if (m.notas?.trim()) { children.push(subLabel("Notas")); children.push(para(m.notas, { color: "D97706" })); }
        children.push(spacer());
        if ((i + 1) % 3 === 0 && i + 1 < config.mudancas.length) children.push(pageBreak());
      });
    }

    if (config.resumo?.some(t => t.trim())) {
      children.push(pageBreak(), h1("Resumo Final", primary));
      config.resumo.filter(t => t.trim()).forEach(t => children.push(para(t)));
    }

  } else {
    // BUGS template
    if (config.resumoExecutivo?.some(t => t.trim())) {
      children.push(h1("Resumo Executivo", primary));
      config.resumoExecutivo.filter(t => t.trim()).forEach(t => children.push(para(t)));
      children.push(spacer());
    }

    if (config.problemas.length > 0) {
      children.push(h1("Tabela de Problemas", primary));
      const sevHex = { ALTA: config.cores.altaSev, MÉDIA: config.cores.mediaSev, BAIXA: config.cores.baixaSev };
      const colW = [600, 4000, 1200, 3226];
      const headerRow = new TableRow({
        tableHeader: true,
        children: ["#", "Problema", "Severidade", "Resolução"].map((h, ci) => new TableCell({
          borders, shading: { type: ShadingType.CLEAR, fill: primary },
          width: { size: colW[ci], type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })]
        }))
      });
      const dataRows = config.problemas.map((p, i) => {
        const c = sevHex[p.severity] || sevHex.ALTA;
        const fill = i % 2 ? "F8F8FB" : "FFFFFF";
        return new TableRow({
          children: [
            new TableCell({ borders, width: { size: colW[0], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), bold: true, color: "BBBBBB", size: 18, font: "Courier New" })] })] }),
            new TableCell({ borders, width: { size: colW[1], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: p.titulo || "—", bold: true, size: 20, font: "Arial", color: "1a1a2e" })] })] }),
            new TableCell({ borders, width: { size: colW[2], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: p.severity, bold: true, size: 18, color: c, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: colW[3], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: p.resolucao || "—", size: 20, font: "Arial", color: "444444" })] })] }),
          ]
        });
      });
      children.push(new Table({ width: { size: contentW, type: WidthType.DXA }, columnWidths: colW, rows: [headerRow, ...dataRows] }), spacer(), pageBreak());

      children.push(h1("Detalhamento dos Problemas", primary));
      config.problemas.forEach((p, i) => {
        const c = sevHex[p.severity] || sevHex.ALTA;
        const d = p.detalhe || {};
        children.push(
          new Paragraph({
            spacing: { before: 240, after: 100 },
            keepNext: true,
            border: { left: { style: BorderStyle.THICK, size: 12, color: c, space: 8 } },
            indent: { left: 240 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true, size: 26, color: c, font: "Courier New" }),
              new TextRun({ text: p.titulo || "Sem título", bold: true, size: 26, color: "1a1a2e", font: "Arial" }),
              new TextRun({ text: `   [${p.severity}]`, bold: true, size: 20, color: c, font: "Arial" }),
            ]
          })
        );
        if (p.resumo?.trim())                              { children.push(subLabel("Descrição"));               children.push(para(p.resumo)); }
        if (d.ondeOcorre?.some(t => t.trim()))             { children.push(subLabel("Onde ocorre"));             d.ondeOcorre.filter(t => t.trim()).forEach(t => children.push(para(t))); }
        if (d.codigoOnde?.some(t => t.trim()))             { children.push(subLabel("Código onde ocorre"));      d.codigoOnde.filter(t => t.trim()).forEach(t => t.split("\n").forEach(l => children.push(codeBlock(l)))); }
        if (d.porqueProblema?.some(t => t.trim()))         { children.push(subLabel("Por que é um problema"));   d.porqueProblema.filter(t => t.trim()).forEach(t => children.push(para(t))); }
        if (d.textoResolucao?.some(t => t.trim()))         { children.push(subLabel("Explicação de resolução")); d.textoResolucao.filter(t => t.trim()).forEach(t => children.push(para(t))); }
        if (d.codigoResolucao?.some(t => t.trim()))        { children.push(subLabel("Código de resolução"));     d.codigoResolucao.filter(t => t.trim()).forEach(t => t.split("\n").forEach(l => children.push(codeBlock(l)))); }
        children.push(spacer());
        if ((i + 1) % 2 === 0 && i + 1 < config.problemas.length) children.push(pageBreak());
      });
    }

    if (config.conclusao?.some(t => t.trim())) {
      children.push(pageBreak(), h1("Conclusão", config.cores.baixaSev || "375623"));
      config.conclusao.filter(t => t.trim()).forEach(t => children.push(para(t)));
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial" }, paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial" }, paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: pageW, height: pageH },
          margin: { top: margin, right: margin, bottom: margin, left: margin }
        }
      },
      footers: {
        default: new docx.Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200 },
            children: [
              new TextRun({ text: (isChangelog ? "Changelog — " : "Relatório — ") + (config.titulo || "Documento"), size: 18, color: "999999" }),
              ...(logoData ? [new TextRun({ text: "  " }), new ImageRun({ data: logoData.arr, transformation: { width: 36, height: 18 }, type: logoData.type })] : [])
            ]
          })]
        })
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(config.titulo || "relatorio").replace(/\s+/g, "-").toLowerCase()}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── EXPORT PANEL ─────────────────────────────────────────────────────────────

function ExportPanel({ config, activeTemplate }) {
  const [exportedHtml, setExportedHtml] = useState(false);
  const [pdfState,  setPdfState]  = useState("idle");
  const [docxState, setDocxState] = useState("idle");
  const [pdfMsg,    setPdfMsg]    = useState("");
  const [overlay,   setOverlay]   = useState(null);

  const isChangelog = config.template === "changelog";
  const buildHtml = activeTemplate === "study" ? buildStudyHtml : (isChangelog ? buildChangelogHtml : buildBugsHtml);
  const items = activeTemplate === "study" ? config.topicos : (isChangelog ? config.mudancas : config.problemas);
  const total = items.length;
  const slug = (config.titulo || "relatorio").replace(/\s+/g, "-").toLowerCase();

  const exportHtml = () => {
    const html = buildHtml(config);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    a.download = `${slug}.html`; a.click();
    setExportedHtml(true);
    setTimeout(() => setExportedHtml(false), 2500);
  };

  const previewHtml = () => {
    const html = buildHtml(config);
    window.open(URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" })), "_blank");
  };

  const exportPdf = async () => {
    setPdfState("loading"); setOverlay("pdf"); setPdfMsg("Preparando…");
    try {
      await buildAndDownloadPdf(config, msg => setPdfMsg(msg));
      setPdfState("done"); setTimeout(() => setPdfState("idle"), 3000);
    } catch (e) {
      console.error(e); setPdfState("error"); setTimeout(() => setPdfState("idle"), 4000);
    } finally { setOverlay(null); setPdfMsg(""); }
  };

  const exportDocx = async () => {
    setDocxState("loading"); setOverlay("docx");
    try {
      await buildAndDownloadDocx(config);
      setDocxState("done"); setTimeout(() => setDocxState("idle"), 3000);
    } catch (e) {
      console.error(e); setDocxState("error"); setTimeout(() => setDocxState("idle"), 4000);
    } finally { setOverlay(null); }
  };

  const exportJson = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], { type: "application/json" }));
    a.download = "report-config.json"; a.click();
  };

  const stateIcon  = s => s === "loading" ? "hourglass-split" : s === "done" ? "check-lg" : s === "error" ? "exclamation-triangle" : "download";
  const stateLabel = (s, label) => s === "loading" ? "Gerando…" : s === "done" ? "Baixado!" : s === "error" ? "Erro!" : label;

  const groupCounts = isChangelog ? Object.entries(
    config.mudancas.reduce((acc, m) => { acc[m.tipo] = (acc[m.tipo] || 0) + 1; return acc; }, {})
  ) : null;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "40px 36px", background: "var(--bg3)", display: "flex", flexDirection: "column", gap: 24 }}>

      {overlay && (
        <div className="export-overlay">
          <div className="export-spinner" />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx)", marginBottom: 8 }}>
              {overlay === "pdf" ? (pdfMsg || "Gerando PDF…") : "Gerando DOCX…"}
            </div>
            <div style={{ fontSize: 13, color: "var(--tx3)" }}>Aguarde, isso pode levar alguns segundos</div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--tx3)", marginBottom: 16 }}>Resumo do Relatório</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--tx)", marginBottom: 6, fontFamily: "var(--disp)" }}>{config.titulo || <span style={{ color: "var(--tx3)", fontStyle: "italic", fontFamily: "var(--fn)", fontWeight: 400 }}>Sem título</span>}</div>
        {config.subtitulo && <div style={{ fontSize: 13, color: "var(--tx2)", marginBottom: 18 }}>{config.subtitulo}</div>}
        <div className="div" style={{ margin: "18px 0" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[["Tipo", TEMPLATES[config.template]?.label], ["Versão", `v${config.versao}`], ["Autor", config.autor || "—"], [isChangelog ? "Total de mudanças" : "Total de problemas", total]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--tx3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)" }}>{v}</div>
            </div>
          ))}
        </div>
        {isChangelog && groupCounts?.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {groupCounts.map(([tipo, count]) => {
              const info = CHANGE_TYPES[tipo] || CHANGE_TYPES.feat;
              return <span key={tipo} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}30` }}>{count} {info.label}</span>;
            })}
          </div>
        )}
      </div>

      {/* PDF */}
      <div className="card" style={{ padding: 28, border: pdfState === "done" ? "1px solid rgba(34,197,94,.3)" : undefined }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="file-earmark-pdf-fill" size={22} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar como PDF</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>
              Gera um <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.pdf</code> com <strong style={{ color: "var(--tx2)" }}>texto vetorial real</strong> — pesquisável, copiável e acessível. Logo inserida como imagem.
            </div>
          </div>
        </div>
        <button onClick={exportPdf} disabled={pdfState === "loading"} className="btn-primary full"
          style={{ background: pdfState === "done" ? "linear-gradient(135deg,#22c55e,#16a34a)" : pdfState === "error" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#ef4444,#dc2626)", opacity: pdfState === "loading" ? 0.7 : 1 }}>
          <Bi name={stateIcon(pdfState)} size={15} />
          {stateLabel(pdfState, "Baixar PDF")}
        </button>
      </div>

      {/* DOCX */}
      <div className="card" style={{ padding: 28, border: docxState === "done" ? "1px solid rgba(34,197,94,.3)" : undefined }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(37,130,235,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="file-earmark-word-fill" size={22} style={{ color: "#2582eb" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar como DOCX (Word)</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>
              Gera um <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.docx</code> editável com <strong style={{ color: "var(--tx2)" }}>tabelas e texto nativos</strong>, blocos de código, diff colorido e logo como imagem.
            </div>
          </div>
        </div>
        <button onClick={exportDocx} disabled={docxState === "loading"} className="btn-primary full"
          style={{ background: docxState === "done" ? "linear-gradient(135deg,#22c55e,#16a34a)" : docxState === "error" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#2582eb,#1d6bc4)", opacity: docxState === "loading" ? 0.7 : 1 }}>
          <Bi name={stateIcon(docxState)} size={15} />
          {stateLabel(docxState, "Baixar DOCX")}
        </button>
      </div>

      {/* HTML */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="file-earmark-code-fill" size={22} style={{ color: "var(--ac)" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar como HTML</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>Arquivo <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.html</code> auto-contido. Use <strong style={{ color: "var(--tx2)" }}>Ctrl+P</strong> no navegador para imprimir.</div>
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

      {/* JSON */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="braces-asterisk" size={22} style={{ color: "#f97316" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>Exportar configuração JSON</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>Salva todos os dados em <code style={{ fontFamily: "var(--mono)", color: "var(--ac2)", fontSize: 12 }}>.json</code> para importação futura.</div>
          </div>
        </div>
        <button onClick={exportJson} className="btn-ghost" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(249,115,22,0.3)", color: "#f97316" }}>
          <Bi name="download" size={14} /> Baixar JSON
        </button>
      </div>

    </div>
  );
}

// ─── JSON IMPORT MODAL ────────────────────────────────────────────────────────

function mergeConfig(base, incoming) {
  const merged = { ...base, ...incoming };
  merged.cores = { ...base.cores, ...(incoming.cores || {}) };
  const template = merged.template;
  if (template === "changelog") {
    if (Array.isArray(merged.mudancas)) {
      merged.mudancas = merged.mudancas.map(m => ({ ...emptyChange(), ...m, id: Date.now() + Math.random() }));
    } else merged.mudancas = [];
    if (!Array.isArray(merged.descricao) || !merged.descricao.length) merged.descricao = [""];
    if (!Array.isArray(merged.resumo)    || !merged.resumo.length)    merged.resumo    = [""];
  } else {
    if (Array.isArray(merged.problemas)) {
      merged.problemas = merged.problemas.map(p => ({
        ...emptyBugProblem(), ...p, id: Date.now() + Math.random(),
        detalhe: { ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""], textoResolucao: [""], codigoResolucao: [""], ...(p.detalhe || {}) },
      }));
    } else merged.problemas = [];
    if (!Array.isArray(merged.resumoExecutivo) || !merged.resumoExecutivo.length) merged.resumoExecutivo = [""];
    if (!Array.isArray(merged.conclusao)       || !merged.conclusao.length)       merged.conclusao       = [""];
  }
  return merged;
}

function JsonImportModal({ onClose, onImport, currentConfig }) {
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
    try { parsed = JSON.parse(trimmed); } catch (e) { setError(`JSON inválido: ${e.message}`); return; }
    if (typeof parsed !== "object" || Array.isArray(parsed)) { setError("O JSON deve ser um objeto."); return; }
    const base = parsed.template === "changelog" ? initialChangelogConfig : initialBugsConfig;
    const merged = mergeConfig(base, parsed);
    setSuccess(true);
    setTimeout(() => { onImport(merged); onClose(); }, 700);
  };

  const handleFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
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
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 2 }}>Cole ou carregue um arquivo exportado anteriormente</div>
          </div>
          <button onClick={onClose} className="btn-icon"><Bi name="x-lg" size={15} /></button>
        </div>
        <div className="json-modal-body">
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <label className="btn-ghost" style={{ cursor: "pointer", fontSize: 12 }}>
              <Bi name="folder2-open" size={13} /> Abrir .json
              <input type="file" accept=".json,application/json" onChange={handleFile} style={{ display: "none" }} />
            </label>
            {text.trim() && <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setText(""); setError(""); setSuccess(false); }}><Bi name="x-circle" size={13} /> Limpar</button>}
            <span style={{ fontSize: 12, color: "var(--tx3)", marginLeft: "auto" }}>{text.trim() ? `${text.length.toLocaleString()} chars` : ""}</span>
          </div>
          <textarea ref={textareaRef} className="json-textarea" value={text} onChange={e => { setText(e.target.value); setError(""); setSuccess(false); }}
            placeholder={`{\n  "template": "changelog",\n  "titulo": "...",\n  "mudancas": []\n}`} spellCheck={false} />
          {error   && <div className="json-error"><Bi name="exclamation-triangle-fill" size={15} style={{ flexShrink: 0 }} /><span>{error}</span></div>}
          {success && <div className="json-success"><Bi name="check-circle-fill" size={15} /><span>Importado com sucesso!</span></div>}
        </div>
        <div className="json-modal-footer">
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Cancelar</button>
          <button onClick={handleImport} disabled={!text.trim() || success} className="btn-primary" style={{ flex: 2, justifyContent: "center", opacity: !text.trim() ? 0.5 : 1 }}>
            <Bi name={success ? "check-lg" : "upload"} size={15} />
            {success ? "Importado!" : "Importar e aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RESIZE HANDLE ────────────────────────────────────────────────────────────

function ResizeHandle({ onResize }) {
  const [dragging, setDragging] = useState(false);
  const onMouseDown = e => {
    e.preventDefault(); setDragging(true);
    const onMove = ev => onResize(ev.clientX);
    const onUp = () => { setDragging(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  return <div className={`resize-handle${dragging ? " dragging" : ""}`} onMouseDown={onMouseDown} />;
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function Stats({ config }) {
  if (config.template === "study") {
    const total = config.topicos.length;
    if (total === 0) return <span style={{ fontSize: 13, color: "var(--tx3)" }}>Sem tópicos</span>;
    const grouped = config.topicos.reduce((acc, m) => { acc[m.tipo] = (acc[m.tipo] || 0) + 1; return acc; }, {});
    return (
      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
        {Object.keys(STUDY_TYPES).filter(t => grouped[t]).map(t => {
          const info = STUDY_TYPES[t];
          return <span key={t} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${info.border}18`, color: info.text, border: `1px solid ${info.border}30` }}>{grouped[t]} {t}</span>;
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
        {["breaking","feat","fix","refactor"].filter(t => grouped[t]).map(t => {
          const info = CHANGE_TYPES[t];
          return <span key={t} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}30` }}>{grouped[t]} {info.label}</span>;
        })}
      </div>
    );
  }
  const total = config.problemas.length;
  if (total === 0) return <span style={{ fontSize: 13, color: "var(--tx3)" }}>Sem problemas</span>;
  const alta  = config.problemas.filter(p => p.severity === "ALTA").length;
  const media = config.problemas.filter(p => p.severity === "MÉDIA").length;
  const baixa = config.problemas.filter(p => p.severity === "BAIXA").length;
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
      {alta  > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(192,0,0,.15)",   color: "#ff8080", border: "1px solid rgba(192,0,0,.3)"   }}>{alta}  Alta</span>}
      {media > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(197,90,17,.15)", color: "#ffa060", border: "1px solid rgba(197,90,17,.3)" }}>{media} Média</span>}
      {baixa > 0 && <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "rgba(55,86,35,.15)",  color: "#86efac", border: "1px solid rgba(55,86,35,.3)"  }}>{baixa} Baixa</span>}
    </div>
  );
}

import { useEffect as useEff } from "react";
function StudyEditor({ config, setConfig }) {
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addTopic    = () => setConfig(c => ({ ...c, topicos: [...c.topicos, emptyStudyTopic()] }));
  const updateTopic = (id, p) => setConfig(c => ({ ...c, topicos: c.topicos.map(x => x.id === id ? p : x) }));
  const removeTopic = id      => setConfig(c => ({ ...c, topicos: c.topicos.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-text" size={22} />} title="Informações do Estudo" subtitle="Metadados do relatório de aprendizado" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">Formato</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA</option></select></div>
            <div><label className="lbl">Versão</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Título</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Estudo de React Hooks e Context API" /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo / Tema</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Desenvolvimento Frontend Moderno" /></div>
          <div style={{ marginBottom: 22 }}><label className="lbl">Estudante / Autor</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Seu nome" /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["concept","Conceito"],["practice","Prática"],["summary","Resumo"],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="info-circle" size={22} />} title="Introdução" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.introducao} onChange={v => upd("introducao", v)} placeholder="Objetivos do estudo e contexto..." />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-bookmark-fill" size={22} />} title="Tópicos de Estudo" subtitle="Conceitos e práticas aprendidas" badge={config.topicos.length} />
        {config.topicos.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="journal-plus" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhum tópico cadastrado</div>
            <button onClick={addTopic} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> Adicionar Tópico</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.topicos.map((topic, i) => (
              <StudyTopicCard key={topic.id} topic={topic} idx={i} onChange={p => updateTopic(topic.id, p)} onRemove={() => removeTopic(topic.id)} />
            ))}
            <button onClick={addTopic} className="btn-primary full" style={{ marginTop: 4 }}><Bi name="plus-circle-fill" size={16} /> Adicionar Tópico</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Conclusão" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder="Resumo do aprendizado e próximos passos..." />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EDITOR PANELS ───────────────────────────────────────────────────────

function BugsEditor({ config, setConfig }) {
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addProblem    = () => setConfig(c => ({ ...c, problemas: [...c.problemas, emptyBugProblem()] }));
  const updateProblem = (id, p) => setConfig(c => ({ ...c, problemas: c.problemas.map(x => x.id === id ? p : x) }));
  const removeProblem = id      => setConfig(c => ({ ...c, problemas: c.problemas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="file-earmark-text" size={22} />} title="Informações Gerais" subtitle="Metadados e identidade do relatório" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">Formato</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA</option></select></div>
            <div><label className="lbl">Versão</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Título</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Análise de Segurança — API de Pagamentos" /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Escopo do sistema analisado" /></div>
          <div style={{ marginBottom: 22 }}><label className="lbl">Autor / Equipe</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Nome do autor" /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["altaSev","Alta Sev."],["mediaSev","Média Sev."],["baixaSev","Baixa Sev."],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-richtext" size={22} />} title="Resumo Executivo" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumoExecutivo} onChange={v => upd("resumoExecutivo", v)} placeholder="Contexto e objetivo da análise..." />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="bug-fill" size={22} />} title="Problemas" subtitle="Vulnerabilidades e achados" badge={config.problemas.length} />
        {config.problemas.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="shield-exclamation" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhum problema cadastrado</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>Adicione a primeira vulnerabilidade</div>
            <button onClick={addProblem} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> Adicionar Problema</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.problemas.map((prob, i) => (
              <BugProblemCard key={prob.id} prob={prob} idx={i} onChange={p => updateProblem(prob.id, p)} onRemove={() => removeProblem(prob.id)} />
            ))}
            <button onClick={addProblem} className="btn-primary full" style={{ marginTop: 4 }}><Bi name="plus-circle-fill" size={16} /> Adicionar Problema</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Conclusão" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder="Conclusão e próximos passos..." />
        </div>
      </div>
    </div>
  );
}

function ChangelogEditor({ config, setConfig }) {
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addChange    = () => setConfig(c => ({ ...c, mudancas: [...c.mudancas, emptyChange()] }));
  const updateChange = (id, m) => setConfig(c => ({ ...c, mudancas: c.mudancas.map(x => x.id === id ? m : x) }));
  const removeChange = id      => setConfig(c => ({ ...c, mudancas: c.mudancas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="git-commit-fill" size={22} />} title="Informações do Changelog" subtitle="Metadados do registro de mudanças" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">Formato</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA</option></select></div>
            <div><label className="lbl">Versão do Release</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="2.4.1" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Título</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Changelog v2.4 — Refatoração do core" /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo / Descrição curta</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Melhorias de performance e refatoração do módulo de auth" /></div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div><label className="lbl">Projeto / Serviço</label><input className="inp" value={config.projeto} onChange={e => upd("projeto", e.target.value)} placeholder="api-gateway, frontend-web..." /></div>
            <div><label className="lbl">Repositório</label><input className="inp" value={config.repositorio} onChange={e => upd("repositorio", e.target.value)} placeholder="github.com/org/repo" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 22 }}>
            <div><label className="lbl">Data inicial</label><input className="inp" type="date" value={config.dataInicio} onChange={e => upd("dataInicio", e.target.value)} /></div>
            <div><label className="lbl">Data final</label><input className="inp" type="date" value={config.dataFim} onChange={e => upd("dataFim", e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 22 }}><label className="lbl">Autor / Equipe</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Nome do autor ou equipe" /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["breaking","Breaking"],["feat","Feature"],["fix","Fix"],["refactor","Refactor"],["perf","Perf"],["style","Style"],["chore","Chore"],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="textarea-t" size={22} />} title="Visão Geral" subtitle="Contexto e descrição geral das mudanças" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.descricao} onChange={v => upd("descricao", v)} placeholder="Descreva o contexto desta versão..." />
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="git-commit-fill" size={22} />} title="Mudanças" subtitle="Alterações, refatorações e melhorias" badge={config.mudancas.length} />
        {config.mudancas.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="code-slash" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhuma mudança cadastrada</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>Documente a primeira alteração do código</div>
            <button onClick={addChange} className="btn-primary" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Bi name="plus-circle-fill" size={16} /> Adicionar Mudança
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.mudancas.map((change, i) => (
              <ChangeCard key={change.id} change={change} idx={i} onChange={m => updateChange(change.id, m)} onRemove={() => removeChange(change.id)} />
            ))}
            <button onClick={addChange} className="btn-primary full" style={{ marginTop: 4, background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Bi name="plus-circle-fill" size={16} /> Adicionar Mudança
            </button>
          </div>
        )}
      </div>

      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Resumo Final" subtitle="Considerações e observações finais" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumo} onChange={v => upd("resumo", v)} placeholder="Observações e próximos passos..." />
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTemplate, setActiveTemplate] = useState("bugs");
  const [studyConfig, setStudyConfig] = useState(initialStudyConfig);
  const [bugsConfig, setBugsConfig] = useState(initialBugsConfig);
  const [changelogConfig, setChangelogConfig] = useState(initialChangelogConfig);
  const [rightTab, setRightTab] = useState("preview");
  const [mobTab, setMobTab] = useState("editor");
  const [editorWidth, setEditorWidth] = useState(48);
  const [showImport, setShowImport] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const bodyRef = useRef(null);
  const isMobile = useIsMobile();

  const config = activeTemplate === "study" ? studyConfig : (activeTemplate === "changelog" ? changelogConfig : bugsConfig);
  const setConfig = activeTemplate === "study" ? setStudyConfig : (activeTemplate === "changelog" ? setChangelogConfig : setBugsConfig);

  const handleResize = useCallback(clientX => {
    if (!bodyRef.current) return;
    const rect = bodyRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setEditorWidth(Math.min(75, Math.max(20, pct)));
  }, []);

  const handleSelectTemplate = id => {
    setActiveTemplate(id);
    setRightTab("preview");
  };

  const tmpl = TEMPLATES[activeTemplate];
  const isChangelog = activeTemplate === "changelog";

  return (
    <div className="app-shell">
      <style>{CSS}</style>

      {showTemplateSelector && (
        <TemplateSelector current={activeTemplate} onSelect={handleSelectTemplate} onClose={() => setShowTemplateSelector(false)} />
      )}
      {showImport && (
        <JsonImportModal
          onClose={() => setShowImport(false)}
          onImport={merged => {
            const t = merged.template || "bugs";
            setActiveTemplate(t);
            if (t === "study") setStudyConfig(merged); else if (t === "changelog") setChangelogConfig(merged);
            else setBugsConfig(merged);
          }}
          currentConfig={config}
        />
      )}

      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${tmpl.accent}, ${tmpl.accent}cc)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${tmpl.accent}44`, transition: "all .3s" }}>
            <Bi name={tmpl.icon} size={20} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: -.4, fontFamily: "var(--disp)", lineHeight: 1.1 }}>ReportGen</div>
            <div style={{ fontSize: 10, color: "var(--tx3)", letterSpacing: .8, textTransform: "uppercase" }}>Security Report Builder</div>
          </div>
        </div>

        <button
          onClick={() => setShowTemplateSelector(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 16px",
            background: tmpl.accentBg, border: `1.5px solid ${tmpl.accent}50`,
            borderRadius: "var(--r-sm)", cursor: "pointer", transition: "all .2s",
            color: tmpl.accent, fontWeight: 700, fontSize: 13,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = tmpl.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = `${tmpl.accent}50`}
        >
          <Bi name={tmpl.icon} size={14} />
          <span style={{ display: isMobile ? "none" : "inline" }}>{tmpl.label}</span>
          <Bi name="chevron-expand" size={12} style={{ opacity: 0.6 }} />
        </button>

        <div style={{ width: 1, height: 30, background: "var(--b2)" }} />
        <Stats config={config} />

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowImport(true)} className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px", gap: 6 }}>
            <Bi name="upload" size={13} />
            <span style={{ display: isMobile ? "none" : "inline" }}>Importar JSON</span>
          </button>
          <span style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)", background: "var(--surf)", padding: "4px 10px", borderRadius: 7, border: "1px solid var(--b2)" }}>v{config.versao}</span>
        </div>
      </header>

      <div className="app-body" ref={bodyRef}>
        <div className={`pane-editor${mobTab === "editor" ? " mob-active" : ""}`} style={{ width: `${editorWidth}%` }}>
          {activeTemplate === "study" ? <StudyEditor config={studyConfig} setConfig={setStudyConfig} /> : (isChangelog ? <ChangelogEditor config={changelogConfig} setConfig={setChangelogConfig} /> : <BugsEditor config={bugsConfig} setConfig={setBugsConfig} />)}
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
                    <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)" }}>
                      preview — {tmpl.label} · {config.formato}
                    </div>
                  </div>
                  <div style={{ background: "#fff" }}>
                    {activeTemplate === "study"
                      ? <StudyPreview config={config} />
                      : isChangelog
                        ? <ChangelogPreview config={config} />
                        : <BugsPreview config={config} />}
                  </div>
                </div>
              </div>
            )}
            {rightTab === "json"   && <div style={{ height: "100%" }}><JsonOutput config={config} /></div>}
            {rightTab === "export" && <ExportPanel config={config} activeTemplate={activeTemplate} />}
          </div>
        </div>
      </div>

      <nav className="mob-nav">
        {[["editor","pencil-fill","Editor"],["preview","eye-fill","Preview"],["json","braces","JSON"],["export","box-arrow-up","Exportar"]].map(([id, icon, label]) => (
          <button key={id} className="mob-tab" onClick={() => { setMobTab(id); if (id !== "editor") setRightTab(id); }}
            style={{ color: mobTab === id ? tmpl.accent : "var(--tx3)" }}>
            <Bi name={icon} size={22} />{label}
          </button>
        ))}
      </nav>
    </div>
  );
}