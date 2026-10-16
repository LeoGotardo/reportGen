import React, { useState, useCallback, useRef } from "react";

// Components
import { Bi } from "./components/Bi";
import { TemplateSelector } from "./components/TemplateSelector";
import { JsonImportModal } from "./components/JsonImportModal";
import { ReportsModal } from "./components/ReportsModal";
import { JsonOutput } from "./components/JsonOutput";
import { ExportPanel } from "./components/ExportPanel";
import { ResizeHandle, Stats } from "./components/LayoutComponents";
import { BugsEditor } from "./components/BugsEditor";
import { StudyEditor } from "./components/StudyEditor";
import { ChangelogEditor } from "./components/ChangelogEditor";
import { BugsPreview } from "./components/BugsPreview";
import { StudyPreview } from "./components/StudyPreview";
import { ChangelogPreview } from "./components/ChangelogPreview";

// Hooks
import { useIsMobile } from "./hooks/useIsMobile";
import { useLang } from "./contexts/lang";
import { useReports, blankConfig } from "./hooks/useReports";
import { PreviewNavContext } from "./contexts/previewNav";

// Constants
import { TEMPLATES } from "./constants/templates";


export default function App() {
  const { t, lang, setLang } = useLang();

  const {
    reports, active, activeTemplate, activeReport, config, setConfig,
    createReport, duplicateReport, deleteReport, openReport, selectTemplate, renameReport,
    saveError, dismissSaveError,
  } = useReports();
  const [rightTab,  setRightTab]  = useState("preview");
  const [mobTab,    setMobTab]    = useState("editor");
  const [editorWidth, setEditorWidth] = useState(48);
  const [showImport,   setShowImport]   = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const bodyRef  = useRef(null);
  const rightBodyRef  = useRef(null);
  const isMobile = useIsMobile();

  const reportCount = reports.filter(r => r.template === activeTemplate).length;

  const handleResize = useCallback(clientX => {
    if (!bodyRef.current) return;
    const rect = bodyRef.current.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    setEditorWidth(Math.min(75, Math.max(20, pct)));
  }, []);

  // Rola o preview até o bloco marcado com data-anchor={anchor}.
  const goToPreview = useCallback(anchor => {
    setRightTab("preview");
    setMobTab("preview");
    // dois frames: o primeiro monta a aba de preview, o segundo já tem layout.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const box = rightBodyRef.current;
      const el  = box?.querySelector(`[data-anchor="${CSS.escape(anchor)}"]`);
      if (!box || !el) return;
      const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 24;
      box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      el.classList.remove("anchor-flash");
      void el.offsetWidth; // reinicia a animação se o mesmo alvo for clicado de novo
      el.classList.add("anchor-flash");
      setTimeout(() => el.classList.remove("anchor-flash"), 1400);
    }));
  }, []);

  const handleSelectTemplate = id => {
    selectTemplate(id);
    setRightTab("preview");
  };

  const handleClearReport = () => {
    setConfig(blankConfig(activeTemplate));
    setShowClearConfirm(false);
  };

  // JSON importado vira um relatório novo — não sobrescreve o aberto.
  const handleImport = merged => {
    createReport(merged.template || "bugs", merged);
    setRightTab("preview");
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

  const rightBodyClass = `right-body${(rightTab === "preview" || rightTab === "export" || rightTab === "assets") ? " scrollable" : ""}`;

  return (
    <PreviewNavContext.Provider value={goToPreview}>
    <div className="app-shell">
      {showTemplateSelector && (
        <TemplateSelector
          current={activeTemplate}
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      {showReports && (
        <ReportsModal
          reports={reports}
          active={active}
          activeTemplate={activeTemplate}
          onOpen={openReport}
          onCreate={template => { createReport(template); setRightTab("preview"); }}
          onDuplicate={id => duplicateReport(id, t.reportCopySuffix)}
          onDelete={deleteReport}
          onRename={renameReport}
          onClose={() => setShowReports(false)}
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
          <div className="hdr-brand-text">
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

        {/* Report switcher: vários relatórios por template */}
        <button
          onClick={() => setShowReports(true)}
          className="btn-ghost report-switcher"
          title={t.manageReports}
          aria-label={t.manageReports}
        >
          <Bi name="files" size={13} />
          {!isMobile && (
            <span className="report-switcher-name" style={config.titulo?.trim() ? undefined : { fontStyle: "italic", color: "var(--tx3)" }}>
              {config.titulo?.trim() || t.untitledReport}
            </span>
          )}
          {reportCount > 1 && <span className="reports-tab-count">{reportCount}</span>}
          <Bi name="chevron-down" size={11} style={{ opacity: 0.6 }} />
        </button>

        {/* Fix #4: Stats with colored pills — some em telas médias pra caber o seletor de relatório */}
        <div className="hdr-stats">
          <div style={{ width: 1, height: 30, background: "var(--b2)" }} />
          <Stats config={config} />
        </div>

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

      {saveError && (
        <div className="save-error" role="alert">
          <Bi name="exclamation-octagon-fill" size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{saveError.kind === "quota" ? t.saveErrorQuota : t.saveErrorUnknown}</span>
          <button onClick={dismissSaveError} aria-label="OK" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 2 }}>
            <Bi name="x-lg" size={12} />
          </button>
        </div>
      )}

      <div className="app-body" ref={bodyRef}>
        {/* Editor pane */}
        <div
          className={`pane-editor${mobTab === "editor" ? " mob-active" : ""}`}
          style={{ width: `${editorWidth}%` }}
        >
          {/* key: remonta ao trocar de relatório — ids de itens se repetem entre relatórios
              (duplicados/importados) e o estado interno dos cards não pode vazar de um pro outro */}
          <EditorComponent key={activeReport.id} config={config} setConfig={setConfig} />
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
            ref={rightBodyRef}
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
                    <PreviewComponent key={activeReport.id} config={config} />
                  </div>
                </div>
              </div>
            )}

            {rightTab === "json" && (
              <div style={{ height: "100%" }}>
                <JsonOutput key={activeReport.id} config={config} />
              </div>
            )}

            {rightTab === "export" && (
              <ExportPanel key={activeReport.id} config={config} activeTemplate={activeTemplate} />
            )}

          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="mob-nav">
        {[
          ["editor",  "pencil-fill",     t.navEditor],
          ["preview", "eye-fill",        t.navPreview],
          ["json",    "braces",          t.navJson],
          ["export",  "box-arrow-up",    t.navExport],
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
    </PreviewNavContext.Provider>
  );
}