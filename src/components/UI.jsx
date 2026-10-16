import React, { useLayoutEffect, useRef, useState } from "react";
import { Bi } from "./Bi";
import { useLang } from "../contexts/lang";
import { usePreviewNav } from "../contexts/previewNav";
import { formatDate, maskDate, toIsoDate } from "../utils/date";

export function ArrayField({ label, values = [], onChange, mono = false, placeholder = "", rows }) {
  const { t } = useLang();
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
              rows={rows ?? (mono ? 6 : 4)} placeholder={placeholder} className="inp" spellCheck={!mono}
              style={{ fontFamily: mono ? "var(--mono)" : "var(--fn)", fontSize: mono ? 12.5 : 14, flex: 1 }} />
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="btn-icon" style={{ marginTop: 4 }} aria-label={t.removeItem || "Remover"}>
              <Bi name="trash3" size={13} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...values, ""])} className="btn-ghost" style={{ marginTop: 12 }}>
        <Bi name="plus-lg" size={12} /> {t.addLine}
      </button>
    </div>
  );
}

/**
 * Data no padrão dd/mm/aaaa (o valor guardado é ISO AAAA-MM-DD).
 * required: apagar e sair do campo volta para a última data válida em vez de limpar.
 */
export function DateField({ label, value, onChange, required = false }) {
  const { t } = useLang();
  const [draft, setDraft] = useState(null); // texto parcial/inválido enquanto digita
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const caretRef = useRef(null);

  const shown = draft ?? formatDate(value);
  const invalid = draft !== null && draft.length === 10 && !toIsoDate(draft);

  // A máscara reescreve o valor: devolve o cursor para onde o usuário estava digitando.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (caretRef.current == null || el !== document.activeElement) return;
    el.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = null;
  });

  const commit = iso => { setDraft(null); onChange(iso); };

  const handleChange = e => {
    const el = e.target;
    const digitsBefore = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, "").length;
    const masked = maskDate(el.value);
    let pos = 0;
    for (let seen = 0; pos < masked.length && seen < digitsBefore; pos++) if (/\d/.test(masked[pos])) seen++;
    caretRef.current = pos;

    const iso = masked.length === 10 ? toIsoDate(masked) : null;
    if (iso) commit(iso);
    else if (masked === "" && !required) commit("");
    else setDraft(masked);
  };

  // Backspace/Delete encostado numa barra apaga o dígito vizinho (a máscara recriaria a barra).
  const handleKeyDown = e => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end, value: v } = el;
    if (s !== end) return;
    if (e.key === "Backspace" && v[s - 1] === "/") el.setSelectionRange(s - 1, s - 1);
    if (e.key === "Delete" && v[s] === "/") el.setSelectionRange(s + 1, s + 1);
  };

  const openPicker = () => {
    const p = pickerRef.current;
    try { p.showPicker(); } catch { p.focus(); p.click(); }
  };

  return (
    <div>
      {label && <label className="lbl">{label}</label>}
      <div className="date-field">
        <input
          ref={inputRef}
          className={`inp${invalid ? " inp-invalid" : ""}`}
          value={shown}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setDraft(null)}
          placeholder={t.datePh}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          aria-label={label}
          aria-invalid={invalid}
        />
        <button type="button" className="date-pick-btn" onClick={openPicker} title={t.datePick} aria-label={t.datePick}>
          <Bi name="calendar3" size={14} />
        </button>
        <input
          ref={pickerRef}
          type="date"
          className="date-picker-native"
          tabIndex={-1}
          aria-hidden="true"
          value={toIsoDate(value) ?? ""}
          onChange={e => { const iso = toIsoDate(e.target.value); if (iso) commit(iso); }}
        />
      </div>
      {invalid && <div className="field-error">{t.dateInvalid}</div>}
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
  const { t } = useLang();
  const [drag, setDrag] = useState(false);

  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    if (f.size > 512 * 1024) { alert(t.logoTooLarge); return; }
    const r = new FileReader();
    r.onload = e => onChange(e.target.result, f.name);
    r.readAsDataURL(f);
  };

  return (
    <div>
      <label className="lbl">{t.logoLabel}</label>
      {value ? (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src={value} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</div>
            <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <Bi name="check-circle-fill" size={11} /> {t.logoLoaded}
            </div>
          </div>
          <label className="btn-ghost" style={{ cursor: "pointer" }}><Bi name="arrow-repeat" size={13} /> {t.logoChange}<input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} /></label>
          <button className="btn-icon" onClick={() => onChange(null, "")} style={{ borderColor: "rgba(239,68,68,.3)", color: "#ef4444" }}><Bi name="trash3" size={13} /></button>
        </div>
      ) : (
        <>
          <label onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "44px 24px", cursor: "pointer",
              border: `2px dashed ${drag ? "var(--ac)" : "var(--b2)"}`, borderRadius: "var(--r)",
              background: drag ? "rgba(98,113,245,.07)" : "var(--bg2)", transition: "all .2s" }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: drag ? "var(--glow)" : "var(--surf)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
              <Bi name="cloud-arrow-up" size={28} style={{ color: drag ? "var(--ac)" : "var(--tx3)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: drag ? "var(--ac)" : "var(--tx2)" }}>{t.logoDrag}</div>
              <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 5 }}>{t.logoDragSub}</div>
            </div>
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
          </label>
        </>
      )}
    </div>
  );
}

export function DragList({ items, onReorder, renderItem }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const reset = () => {
    setDragging(null);
    setDragOver(null);
  };

  const handleDrop = e => {
    if (dragging === null) return; // drop de texto/arquivo num input: comportamento nativo
    e.preventDefault();
    if (dragOver !== null && dragging !== dragOver) {
      const arr = [...items];
      const [removed] = arr.splice(dragging, 1);
      arr.splice(dragOver, 0, removed);
      onReorder(arr);
    }
    reset();
  };

  // Só a alça é draggable. Com o card inteiro draggable, o navegador trata clicar/arrastar
  // dentro dos inputs como início de drag: não posiciona o cursor nem seleciona texto.
  const handleProps = i => ({
    draggable: true,
    onDragStart: e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ""); // Firefox só inicia o drag se houver dados
      const card = e.currentTarget.closest("[data-drag-item]");
      if (card) {
        const r = card.getBoundingClientRect();
        e.dataTransfer.setDragImage(card, e.clientX - r.left, e.clientY - r.top);
      }
      setDragging(i);
    },
    onDragEnd: reset,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          data-drag-item=""
          onDragOver={e => {
            if (dragging === null) return;
            e.preventDefault();
            if (dragOver !== i) setDragOver(i);
          }}
          onDrop={handleDrop}
          style={{
            opacity: dragging === i ? 0.4 : 1,
            transition: "opacity .15s",
            borderRadius: "var(--r)",
            outline: dragOver === i && dragging !== i ? "2px solid var(--ac)" : "none",
            outlineOffset: 2,
          }}
        >
          {renderItem(item, i, handleProps(i))}
        </div>
      ))}
    </div>
  );
}

export function SectionHeader({ icon, title, subtitle, badge, anchor }) {
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
          {anchor && <GoToPreview anchor={anchor} style={{ marginLeft: "auto" }} />}
        </div>
        {subtitle && <p style={{ fontSize: 13, color: "var(--tx3)", marginTop: 5 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

/** Botão "ir até aqui": rola o preview até o bloco correspondente. */
export function GoToPreview({ anchor, style, compact = false }) {
  const { t } = useLang();
  const goTo = usePreviewNav();
  if (!goTo) return null;
  return (
    <button
      type="button"
      className="btn-goto"
      title={t.goToPreview}
      aria-label={t.goToPreview}
      style={style}
      onClick={e => { e.stopPropagation(); goTo(anchor); }}
    >
      <Bi name="crosshair" size={12} />
      {!compact && <span>{t.goToPreview}</span>}
    </button>
  );
}
