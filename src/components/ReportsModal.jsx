import React, { useEffect, useState } from "react";
import { Bi } from "./Bi";
import { TEMPLATES } from "../constants/templates";
import { TEMPLATE_IDS } from "../hooks/useReports";
import { useLang } from "../contexts/lang";

const ITEM_FIELD = { bugs: "problemas", study: "topicos", changelog: "mudancas" };

function relativeTime(ts, lang, justNow) {
  const secs = Math.round((ts - Date.now()) / 1000);
  if (Math.abs(secs) < 45) return justNow;
  const rtf = new Intl.RelativeTimeFormat(lang === "pt" ? "pt-BR" : "en", { numeric: "auto" });
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  const [unit, size] = units.find(([, s]) => Math.abs(secs) >= s) ?? units[units.length - 1];
  return rtf.format(Math.round(secs / size), unit);
}

export function ReportsModal({ reports, active, activeTemplate, onOpen, onCreate, onDuplicate, onDelete, onRename, onClose }) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState(activeTemplate);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // { id, value }
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Esc fecha o modal — exceto durante a renomeação, onde Esc só cancela a edição.
  useEffect(() => {
    if (editing) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, editing]);

  const tmpl = TEMPLATES[tab];
  const own = reports.filter(r => r.template === tab).sort((a, b) => b.updatedAt - a.updatedAt);
  const q = query.trim().toLowerCase();
  const visible = q ? own.filter(r => (r.config.titulo || t.untitledReport).toLowerCase().includes(q)) : own;

  const commitRename = () => {
    if (editing) onRename(editing.id, editing.value.trim());
    setEditing(null);
  };

  const open = id => { onOpen(id); onClose(); };

  return (
    <div className="json-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="json-modal reports-modal" role="dialog" aria-modal="true" aria-labelledby="reports-title">
        <div className="json-modal-header">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="collection-fill" size={16} style={{ color: "var(--ac)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="reports-title" style={{ fontWeight: 800, fontSize: 15 }}>{t.reportsTitle}</div>
            <div style={{ fontSize: 12, color: "var(--tx2)", marginTop: 3 }}>{t.reportsSubtitle}</div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label={t.cancel}><Bi name="x-lg" size={13} /></button>
        </div>

        <div className="reports-tabs" role="tablist">
          {TEMPLATE_IDS.map(id => {
            const info = TEMPLATES[id];
            const count = reports.filter(r => r.template === id).length;
            const on = tab === id;
            return (
              <button key={id} role="tab" aria-selected={on} title={t[`tmpl_${id}_label`]} className={`reports-tab${on ? " active" : ""}`}
                style={on ? { color: info.accent, borderColor: `${info.accent}80`, background: info.accentBg } : undefined}
                onClick={() => { setTab(id); setQuery(""); setEditing(null); setConfirmDelete(null); }}>
                <Bi name={info.icon} size={13} />
                <span className="reports-tab-label">{t[`tmpl_${id}_label`]}</span>
                <span className="reports-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="reports-toolbar">
          {own.length > 4 && (
            <div className="reports-search">
              <Bi name="search" size={12} style={{ color: "var(--tx3)" }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.reportSearchPh} aria-label={t.reportSearchPh} />
            </div>
          )}
          <button className="btn-primary" style={{ marginLeft: "auto", padding: "9px 18px", fontSize: 13, background: `linear-gradient(135deg, ${tmpl.accent}, ${tmpl.accent}cc)` }}
            onClick={() => { onCreate(tab); onClose(); }}>
            <Bi name="plus-lg" size={13} /> {t.newReport}
          </button>
        </div>

        <div className="json-modal-body reports-list">
          {visible.length === 0 && <div style={{ textAlign: "center", padding: 24, fontSize: 13, color: "var(--tx3)" }}>{t.reportNoMatch}</div>}
          {visible.map(r => {
            const isActive = active[r.template] === r.id;
            const isEditing = editing?.id === r.id;
            const title = r.config.titulo?.trim();
            const n = r.config[ITEM_FIELD[r.template]]?.length ?? 0;
            return (
              <div key={r.id} className={`report-row${isActive ? " active" : ""}`}
                style={isActive ? { borderColor: `${tmpl.accent}70` } : undefined}
                onClick={() => !isEditing && open(r.id)}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: tmpl.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bi name={tmpl.icon} size={15} style={{ color: tmpl.accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <input className="inp" autoFocus value={editing.value} placeholder={t.untitledReport}
                      style={{ padding: "6px 10px", fontSize: 13.5 }}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setEditing({ id: r.id, value: e.target.value })}
                      onBlur={commitRename}
                      onKeyDown={e => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setEditing(null);
                      }} />
                  ) : (
                    <div className="report-title" style={title ? undefined : { color: "var(--tx3)", fontStyle: "italic" }}>{title || t.untitledReport}</div>
                  )}
                  <div className="report-meta">
                    {t.reportEdited.replace("{time}", relativeTime(r.updatedAt, lang, t.justNow))}
                    {" · "}v{r.config.versao || "1.0"}
                    {" · "}{t[`reportItems_${r.template}`].replace("{n}", n)}
                  </div>
                </div>
                {isActive && !isEditing && <span className="report-badge" style={{ color: tmpl.accent, background: tmpl.accentBg }}>{t.reportOpenBadge}</span>}
                {confirmDelete === r.id ? (
                  <div className="report-actions" onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{t.reportDeleteConfirm}</span>
                    <button className="btn-ghost report-confirm-yes" onClick={() => { onDelete(r.id); setConfirmDelete(null); }}>{t.reportDeleteYes}</button>
                    <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setConfirmDelete(null)}>{t.reportDeleteNo}</button>
                  </div>
                ) : !isEditing && (
                  <div className="report-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" title={t.reportRename} aria-label={t.reportRename}
                      onClick={() => { setConfirmDelete(null); setEditing({ id: r.id, value: r.config.titulo || "" }); }}>
                      <Bi name="pencil" size={12} />
                    </button>
                    <button className="btn-icon" title={t.reportDuplicate} aria-label={t.reportDuplicate}
                      onClick={() => onDuplicate(r.id)}>
                      <Bi name="copy" size={12} />
                    </button>
                    <button className="btn-icon report-delete" title={t.reportDelete} aria-label={t.reportDelete}
                      onClick={() => { setEditing(null); setConfirmDelete(r.id); }}>
                      <Bi name="trash3" size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
