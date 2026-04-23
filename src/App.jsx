import React, { useState, useCallback, useRef, useEffect } from "react";

// Components
import { Bi } from "./components/Bi";
import { TemplateSelector } from "./components/TemplateSelector";
import { JsonImportModal } from "./components/JsonImportModal";
import { JsonOutput } from "./components/JsonOutput";
import { ExportPanel } from "./components/ExportPanel";
import { ResizeHandle, Stats } from "./components/LayoutComponents";
import { BugsEditor, ChangelogEditor, StudyEditor } from "./components/Editors";
import { BugsPreview, ChangelogPreview, StudyPreview } from "./components/PreviewComponents";

// Hooks
import { useIsMobile } from "./hooks/useIsMobile";
import { useLang } from "./contexts/LangContext";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

// Constants
import { TEMPLATES } from "./constants/templates";
import { initialBugsConfig, initialChangelogConfig, initialStudyConfig } from "./constants/initialConfigs";

// Fix #10: Bootstrap Icons CDN injected once on mount.
function useBootstrapIcons() {
  useEffect(() => {
    if (document.getElementById("bi-css")) return;
    const link = document.createElement("link");
    link.id   = "bi-css";
    link.rel  = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    document.head.appendChild(link);
  }, []);
}

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
  input:focus, textarea:focus, select:focus { border-color: var(--ac); box-shadow: 0 0 0 3px var(--glow); }
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
  .resize-handle { width: 5px; flex-shrink: 0; background: var(--b1); cursor: col-resize; position: relative; transition: background .15s; border-left: 1px solid var(--b2); border-right: 1px solid var(--b2); }
  .resize-handle:hover, .resize-handle.dragging { background: var(--ac); border-color: var(--ac); }
  .resize-handle::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 3px; height: 40px; border-radius: 99px; background: var(--b2); transition: background .15s; }
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
    .pane-right.mob-active { display: flex; flex: 1; }
    .app-header { padding: 0 18px; }
    .inp { padding: 14px 16px !important; font-size: 16px !important; }
    textarea.inp { min-height: 96px !important; }
    .btn-ghost { padding: 12px 20px !important; font-size: 14px !important; }
    .btn-primary { padding: 15px 28px !important; font-size: 15px !important; }
    .btn-icon { width: 42px !important; height: 42px !important; }
    .sec-title { font-size: 24px !important; }
    .editor-inner { padding: 24px 18px 100px !important; }
  }
  .mob-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg2); border-top: 1px solid var(--b2); z-index: 200; padding: 8px 0 max(8px, env(safe-area-inset-bottom)); }
  @media (max-width: 860px) { .mob-nav { display: flex; } }
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
  .tmpl-modal-backdrop { position: fixed; inset: 0; background: rgba(8,10,20,0.9); z-index: 600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(12px); padding: 20px; }
  .tmpl-modal { background: var(--bg2); border: 1px solid var(--b2); border-radius: 24px; width: 100%; max-width: 640px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: fadeUp .25s ease; }
  .tmpl-card { border: 2px solid var(--b2); border-radius: 16px; padding: 24px; cursor: pointer; transition: all .2s; background: var(--bg3); position: relative; overflow: hidden; }
  .tmpl-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
  .tmpl-card.active { border-color: var(--ac); background: rgba(98,113,245,0.06); }
  .tmpl-card-glow { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%; opacity: 0.07; pointer-events: none; }
`;

export default function App() {
  useBootstrapIcons();
  const { t, lang, setLang } = useLang();

  const [activeTemplate, setActiveTemplate] = useLocalStorageState("rg_activeTemplate", "bugs");
  const [studyConfig,     setStudyConfig]     = useLocalStorageState("rg_studyConfig",     initialStudyConfig);
  const [bugsConfig,      setBugsConfig]      = useLocalStorageState("rg_bugsConfig",      initialBugsConfig);
  const [changelogConfig, setChangelogConfig] = useLocalStorageState("rg_changelogConfig", initialChangelogConfig);
  const [rightTab,  setRightTab]  = useState("preview");
  const [mobTab,    setMobTab]    = useState("editor");
  const [editorWidth, setEditorWidth] = useState(48);
  const [showImport,   setShowImport]   = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const bodyRef  = useRef(null);
  const isMobile = useIsMobile();

  const config =
    activeTemplate === "study"     ? studyConfig :
    activeTemplate === "changelog" ? changelogConfig :
                                     bugsConfig;

  const setConfig =
    activeTemplate === "study"     ? setStudyConfig :
    activeTemplate === "changelog" ? setChangelogConfig :
                                     setBugsConfig;

  const handleResize = useCallback(clientX => {
    if (!bodyRef.current) return;
    const rect = bodyRef.current.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    setEditorWidth(Math.min(75, Math.max(20, pct)));
  }, []);

  const handleSelectTemplate = id => {
    setActiveTemplate(id);
    setRightTab("preview");
  };

  const handleClearReport = () => {
    if      (activeTemplate === "study")     setStudyConfig(initialStudyConfig);
    else if (activeTemplate === "changelog") setChangelogConfig(initialChangelogConfig);
    else                                     setBugsConfig(initialBugsConfig);
    setShowClearConfirm(false);
  };

  const handleImport = merged => {
    const t = merged.template || "bugs";
    setActiveTemplate(t);
    if      (t === "study")     setStudyConfig(merged);
    else if (t === "changelog") setChangelogConfig(merged);
    else                        setBugsConfig(merged);
  };

  const tmpl = TEMPLATES[activeTemplate];

  const EditorComponent  =
    activeTemplate === "study"     ? StudyEditor     :
    activeTemplate === "changelog" ? ChangelogEditor :
                                     BugsEditor;

  const PreviewComponent =
    activeTemplate === "study"     ? StudyPreview     :
    activeTemplate === "changelog" ? ChangelogPreview :
                                     BugsPreview;

  const rightBodyClass = `right-body${(rightTab === "preview" || rightTab === "export") ? " scrollable" : ""}`;

  return (
    <div className="app-shell">
      <style>{CSS}</style>

      {showTemplateSelector && (
        <TemplateSelector
          current={activeTemplate}
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      {showImport && (
        <JsonImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      )}

      {showClearConfirm && (
        <div className="json-modal-backdrop" onClick={() => setShowClearConfirm(false)}>
          <div className="json-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="json-modal-header">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bi name="trash3-fill" size={17} style={{ color: "#f87171" }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{t.clearConfirmTitle}</div>
                <div style={{ fontSize: 12, color: "var(--tx2)", marginTop: 3 }}>{t.clearConfirmMsg}</div>
              </div>
            </div>
            <div className="json-modal-footer" style={{ justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setShowClearConfirm(false)}>{t.clearConfirmNo}</button>
              <button
                onClick={handleClearReport}
                style={{ padding: "9px 20px", borderRadius: "var(--r-sm)", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7 }}
              >
                <Bi name="trash3-fill" size={13} />
                {t.clearConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        {/* Logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${tmpl.accent}, ${tmpl.accent}cc)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${tmpl.accent}44`, transition: "all .3s",
          }}>
            <Bi name={tmpl.icon} size={20} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: -.4, fontFamily: "var(--disp)", lineHeight: 1.1 }}>ReportGen</div>
            <div style={{ fontSize: 10, color: "var(--tx3)", letterSpacing: .8, textTransform: "uppercase" }}>{t.appSubtitle}</div>
          </div>
        </div>

        {/* Template switcher */}
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
          <span style={{ display: isMobile ? "none" : "inline" }}>{t[`tmpl_${activeTemplate}_label`]}</span>
          <Bi name="chevron-expand" size={12} style={{ opacity: 0.6 }} />
        </button>

        <div style={{ width: 1, height: 30, background: "var(--b2)" }} />

        {/* Fix #4: Stats with colored pills */}
        <Stats config={config} />

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            className="btn-ghost"
            style={{ fontSize: 11, padding: "6px 11px", fontFamily: "var(--mono)", fontWeight: 800 }}
            title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
          >
            {lang === "pt" ? "EN" : "PT"}
          </button>
          <button onClick={() => setShowImport(true)} className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px", gap: 6 }}>
            <Bi name="upload" size={13} />
            <span style={{ display: isMobile ? "none" : "inline" }}>{t.importJson}</span>
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "7px 14px", gap: 6, borderColor: "rgba(239,68,68,.3)", color: "#f87171" }}
            title={t.clearReport}
          >
            <Bi name="trash3" size={13} />
            <span style={{ display: isMobile ? "none" : "inline" }}>{t.clearReport}</span>
          </button>
          <span style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)", background: "var(--surf)", padding: "4px 10px", borderRadius: 7, border: "1px solid var(--b2)" }}>
            v{config.versao}
          </span>
        </div>
      </header>

      <div className="app-body" ref={bodyRef}>
        {/* Editor pane */}
        <div
          className={`pane-editor${mobTab === "editor" ? " mob-active" : ""}`}
          style={{ width: `${editorWidth}%` }}
        >
          <EditorComponent config={config} setConfig={setConfig} />
        </div>

        <ResizeHandle onResize={handleResize} />

        {/* Right pane */}
        <div className={`pane-right${mobTab !== "editor" ? " mob-active" : ""}`}>
          <div className="right-tabs">
            {[
              ["preview", "eye-fill",        t.tabPreview],
              ["json",    "braces-asterisk", t.tabJson],
              ["export",  "box-arrow-up",    t.tabExport],
            ].map(([id, icon, label]) => (
              <button
                key={id}
                className={`right-tab${rightTab === id ? " active" : ""}`}
                onClick={() => setRightTab(id)}
              >
                <Bi name={icon} size={15} /> {label}
              </button>
            ))}
          </div>

          <div
            className={rightBodyClass}
            style={{
              background:
                rightTab === "json" ? "#0d1117" : "var(--bg3)",
            }}
          >
            {rightTab === "preview" && (
              <div style={{ padding: "32px 36px 56px" }}>
                <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)" }}>
                  {/* Fake browser chrome */}
                  <div style={{ background: "var(--s2)", padding: "13px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--b1)" }}>
                    <div style={{ display: "flex", gap: 7 }}>
                      {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                        <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--tx3)", fontFamily: "var(--mono)" }}>
                      preview — {t[`tmpl_${activeTemplate}_label`]} · {config.formato}
                    </div>
                  </div>
                  <div style={{ background: "#fff" }}>
                    <PreviewComponent config={config} />
                  </div>
                </div>
              </div>
            )}

            {rightTab === "json" && (
              <div style={{ height: "100%" }}>
                <JsonOutput config={config} />
              </div>
            )}

            {rightTab === "export" && (
              <ExportPanel config={config} activeTemplate={activeTemplate} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="mob-nav">
        {[
          ["editor",  "pencil-fill", t.navEditor],
          ["preview", "eye-fill",    t.navPreview],
          ["json",    "braces",      t.navJson],
          ["export",  "box-arrow-up",t.navExport],
        ].map(([id, icon, label]) => (
          <button
            key={id}
            className="mob-tab"
            onClick={() => { setMobTab(id); if (id !== "editor") setRightTab(id); }}
            style={{ color: mobTab === id ? tmpl.accent : "var(--tx3)" }}
          >
            <Bi name={icon} size={22} />{label}
          </button>
        ))}
      </nav>
    </div>
  );
}