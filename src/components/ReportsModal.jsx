import React, { useEffect, useRef, useState } from "react";
import { Bi } from "./Bi";
import { Dropdown } from "./Dropdown";
import { TEMPLATES } from "../constants/templates";
import { TEMPLATE_IDS } from "../hooks/useReports";
import { useLang } from "../contexts/lang";

const ITEM_FIELD = { bugs: "problemas", study: "topicos", changelog: "mudancas" };
const DRAG_TYPE = "application/x-reportgen-report";
const NEW_FOLDER = "__new__";

function relativeTime(ts, lang, justNow) {
  const secs = Math.round((ts - Date.now()) / 1000);
  if (Math.abs(secs) < 45) return justNow;
  const rtf = new Intl.RelativeTimeFormat(lang === "pt" ? "pt-BR" : "en", { numeric: "auto" });
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  const [unit, size] = units.find(([, s]) => Math.abs(secs) >= s) ?? units[units.length - 1];
  return rtf.format(Math.round(secs / size), unit);
}

export function ReportsModal({
  reports, active, activeTemplate, folders, membership,
  onOpen, onCreate, onDuplicate, onDelete, onRename,
  onCreateFolder, onRenameFolder, onDeleteFolder, onMove, onClose,
}) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState(activeTemplate);
  const [filter, setFilter] = useState("all"); // "all" | "none" | folderId
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // renomeando relatório: { id, value }
  const [folderEdit, setFolderEdit] = useState(null); // criando/renomeando pasta: { id: folderId | NEW_FOLDER, value }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmFolderDelete, setConfirmFolderDelete] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);
  // Enter (ou Esc) desmonta o input e o navegador pode disparar um blur logo depois:
  // sem essa trava, uma pasta nova seria criada duas vezes.
  const folderDoneRef = useRef(false);

  // Esc fecha o modal — exceto durante uma renomeação, onde Esc só cancela a edição.
  const busy = Boolean(editing || folderEdit);
  useEffect(() => {
    if (busy) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const tmpl = TEMPLATES[tab];
  const folderOf = r => membership[r.id] ?? null;
  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name, lang === "pt" ? "pt-BR" : "en"));
  const folderName = id => folders.find(f => f.id === id)?.name;
  const currentFolder = filter !== "all" && filter !== "none" ? folders.find(f => f.id === filter) : null;

  const own = reports.filter(r => r.template === tab).sort((a, b) => b.updatedAt - a.updatedAt);
  const inFilter = r => filter === "all" || (filter === "none" ? !folderOf(r) : folderOf(r) === filter);
  const q = query.trim().toLowerCase();
  const visible = own.filter(r => inFilter(r) && (!q || (r.config.titulo || t.untitledReport).toLowerCase().includes(q)));
  const countIn = id => own.filter(r => (id === "all" ? true : id === "none" ? !folderOf(r) : folderOf(r) === id)).length;

  const uniqueFolderName = () => {
    const names = new Set(folders.map(f => f.name));
    if (!names.has(t.folderNameDefault)) return t.folderNameDefault;
    let n = 2;
    while (names.has(`${t.folderNameDefault} ${n}`)) n++;
    return `${t.folderNameDefault} ${n}`;
  };

  const commitRename = () => {
    if (editing) onRename(editing.id, editing.value.trim());
    setEditing(null);
  };

  const startFolderEdit = edit => { folderDoneRef.current = false; setFolderEdit(edit); };

  const commitFolder = () => {
    if (!folderEdit || folderDoneRef.current) return;
    folderDoneRef.current = true;
    const name = folderEdit.value.trim();
    if (folderEdit.id === NEW_FOLDER) {
      if (name) setFilter(onCreateFolder(name));
    } else if (name) {
      onRenameFolder(folderEdit.id, name);
    }
    setFolderEdit(null);
  };

  const selectFilter = id => { setFilter(id); setConfirmFolderDelete(false); setConfirmDelete(null); };

  const moveTo = (reportId, value) => {
    if (value === NEW_FOLDER) {
      // Cria a pasta já com o relatório dentro e abre o nome para edição.
      const name = uniqueFolderName();
      const id = onCreateFolder(name);
      onMove(reportId, id);
      startFolderEdit({ id, value: name });
      return;
    }
    onMove(reportId, value || null);
  };

  const open = id => { onOpen(id); onClose(); };

  // Arrastar um relatório até uma pasta (ou "Sem pasta"). Pelo teclado/toque: menu "Mover para pasta".
  const dropProps = id => ({
    onDragOver: e => {
      if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dropTarget !== id) setDropTarget(id);
    },
    onDragLeave: () => setDropTarget(d => (d === id ? null : d)),
    onDrop: e => {
      const reportId = e.dataTransfer.getData(DRAG_TYPE);
      setDropTarget(null);
      if (!reportId) return;
      e.preventDefault();
      onMove(reportId, id === "none" ? null : id);
    },
  });

  const chip = (id, icon, label, count, droppable) => {
    const on = filter === id;
    return (
      <button key={id} type="button" className={`folder-chip${on ? " active" : ""}${dropTarget === id ? " drop" : ""}`}
        aria-pressed={on} onClick={() => selectFilter(id)} {...(droppable ? dropProps(id) : {})}>
        <Bi name={icon} size={12} />
        <span className="folder-chip-name">{label}</span>
        <span className="reports-tab-count">{count}</span>
      </button>
    );
  };

  const folderInput = (
    <input className="inp folder-name-inp" autoFocus value={folderEdit?.value ?? ""} placeholder={t.folderNamePh}
      aria-label={t.folderNamePh}
      onChange={e => setFolderEdit(f => ({ ...f, value: e.target.value }))}
      onBlur={commitFolder}
      onKeyDown={e => {
        if (e.key === "Enter") commitFolder();
        if (e.key === "Escape") { folderDoneRef.current = true; setFolderEdit(null); }
      }} />
  );

  const moveOptions = [
    { value: "", label: t.foldersNone, icon: "inbox" },
    ...sortedFolders.map(f => ({ value: f.id, label: f.name, icon: "folder" })),
    { value: NEW_FOLDER, label: t.folderNewFromMenu, icon: "folder-plus" },
  ];

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

        <div className="folder-bar" role="toolbar" aria-label={t.foldersLabel}>
          {chip("all", "collection", t.foldersAll, countIn("all"), false)}
          {chip("none", "inbox", t.foldersNone, countIn("none"), true)}
          {sortedFolders.map(f => (
            <React.Fragment key={f.id}>
              {folderEdit?.id === f.id ? folderInput : chip(f.id, filter === f.id ? "folder2-open" : "folder", f.name, countIn(f.id), true)}
            </React.Fragment>
          ))}
          {folderEdit?.id === NEW_FOLDER ? folderInput : (
            <button type="button" className="folder-chip add" onClick={() => startFolderEdit({ id: NEW_FOLDER, value: "" })}>
              <Bi name="folder-plus" size={12} /> {t.folderNew}
            </button>
          )}
        </div>

        <div className="reports-toolbar">
          {currentFolder && !folderEdit && (
            confirmFolderDelete ? (
              <div className="folder-actions">
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{t.folderDeleteConfirm.replace("{name}", currentFolder.name)}</span>
                <button className="btn-ghost report-confirm-yes" onClick={() => { onDeleteFolder(currentFolder.id); setFilter("none"); setConfirmFolderDelete(false); }}>{t.reportDeleteYes}</button>
                <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setConfirmFolderDelete(false)}>{t.reportDeleteNo}</button>
              </div>
            ) : (
              <div className="folder-actions">
                <button className="btn-ghost folder-action" onClick={() => startFolderEdit({ id: currentFolder.id, value: currentFolder.name })}>
                  <Bi name="pencil" size={11} /> {t.folderRename}
                </button>
                <button className="btn-ghost folder-action danger" onClick={() => setConfirmFolderDelete(true)}>
                  <Bi name="trash3" size={11} /> {t.folderDelete}
                </button>
              </div>
            )
          )}
          {own.length > 4 && (
            <div className="reports-search">
              <Bi name="search" size={12} style={{ color: "var(--tx3)" }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.reportSearchPh} aria-label={t.reportSearchPh} />
            </div>
          )}
          <button className="btn-primary" style={{ marginLeft: "auto", padding: "9px 18px", fontSize: 13, background: `linear-gradient(135deg, ${tmpl.accent}, ${tmpl.accent}cc)` }}
            onClick={() => { onCreate(tab, currentFolder?.id ?? null); onClose(); }}>
            <Bi name="plus-lg" size={13} /> {t.newReport}
          </button>
        </div>

        <div className="json-modal-body reports-list">
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, fontSize: 13, color: "var(--tx3)" }}>
              {q || filter === "all" ? t.reportNoMatch : t.folderEmpty}
            </div>
          )}
          {visible.map(r => {
            const isActive = active[r.template] === r.id;
            const isEditing = editing?.id === r.id;
            const title = r.config.titulo?.trim();
            const n = r.config[ITEM_FIELD[r.template]]?.length ?? 0;
            const fid = folderOf(r);
            return (
              <div key={r.id} className={`report-row${isActive ? " active" : ""}`}
                style={isActive ? { borderColor: `${tmpl.accent}70` } : undefined}
                // Sem draggable durante a renomeação: input dentro de elemento arrastável não deixa selecionar texto.
                draggable={!isEditing}
                onDragStart={e => { e.dataTransfer.setData(DRAG_TYPE, r.id); e.dataTransfer.effectAllowed = "move"; }}
                onDragEnd={() => setDropTarget(null)}
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
                    {filter === "all" && fid && <><Bi name="folder" size={10} /> {folderName(fid)}{" · "}</>}
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
                    <Dropdown className="report-move" value={fid ?? ""} options={moveOptions} align="end"
                      onChange={v => moveTo(r.id, v)} ariaLabel={t.folderMoveTo} title={t.folderMoveTo}
                      renderButton={() => <Bi name="folder-symlink" size={12} />} />
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
