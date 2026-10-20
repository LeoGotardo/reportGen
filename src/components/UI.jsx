import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const DRAG_THRESHOLD = 4; // px até virar arraste: clique simples na alça não faz nada
const EDGE = 70;          // px a partir da borda do painel onde a rolagem automática começa
const MAX_SPEED = 24;     // px por frame com o ponteiro colado na borda (ou fora dela)

function scrollParent(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return document.scrollingElement;
}

const LIST_PAD = 24;      // a rolagem automática para quando o início/fim da lista fica esta distância da borda

function visibleBounds(scroller) {
  const r = scroller === document.scrollingElement ? { top: 0, bottom: innerHeight } : scroller.getBoundingClientRect();
  return { top: Math.max(r.top, 0), bottom: Math.min(r.bottom, innerHeight) };
}

/**
 * px a rolar neste frame: cresce conforme o ponteiro entra na borda de cima/baixo do painel. Para quando
 * o início/fim da lista já está visível — senão o painel seguiria até o fim do formulário e o card sumiria.
 */
function edgeSpeed(scroller, y, list) {
  const { top, bottom } = visibleBounds(scroller);
  const zone = Math.min(EDGE, (bottom - top) / 4);
  const depth = y < top + zone ? y - (top + zone) : y > bottom - zone ? y - (bottom - zone) : 0;
  if (!depth) return 0;
  const v = Math.max(1, Math.round(MAX_SPEED * Math.min(1, Math.abs(depth) / zone))); // scrollTop fracionário arredondaria para 0
  const lr = list.getBoundingClientRect();
  return depth > 0
    ? Math.min(v, Math.max(0, Math.ceil(lr.bottom - (bottom - LIST_PAD))))
    : -Math.min(v, Math.max(0, Math.ceil(top + LIST_PAD - lr.top)));
}

// Um ponteiro arrasta um card por vez, em qualquer lista.
let activeDrag = null;

/**
 * Começa (no pointerdown da alça) o arraste de um item do DragList. Fora do componente: o estado do
 * arraste muda a cada frame e não deve passar pelo React — só o alvo e o item arrastado viram state.
 */
function startDrag(e, { items, onReorder, setDragging, setDragOver }) {
  if (e.button !== 0 || activeDrag) return;
  const handle = e.currentTarget;
  const el = handle.closest("[data-drag-item]");
  const list = el?.parentElement;
  const i = list ? [...list.children].indexOf(el) : -1;
  if (i < 0) return;
  e.preventDefault(); // sem seleção de texto nem foco saindo do campo atual
  const scroller = scrollParent(el);
  // O card só anda dentro da lista: translate além do fim aumentaria a área rolável do painel
  // e a rolagem automática nunca chegaria ao fim.
  const lr = list.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const minTy = lr.top - er.top;
  const maxTy = lr.bottom - er.bottom;
  const d = { owner: setDragging, i, y: e.clientY, startX: e.clientX, startY: e.clientY, startScroll: scroller.scrollTop, over: i, started: false, raf: 0 };
  activeDrag = d;
  try { handle.setPointerCapture(e.pointerId); } catch { /* ponteiro já liberado */ }

  // Alvo = item sob o ponteiro. O item arrastado conta pela posição original (sem o translate).
  const hitTest = ty => {
    const kids = [...list.children];
    const slot = j => {
      const r = kids[j].getBoundingClientRect();
      const off = j === i ? ty : 0;
      return { top: r.top - off, bottom: r.bottom - off };
    };
    if (d.y < slot(0).top) return 0;
    if (d.y > slot(kids.length - 1).bottom) return kids.length - 1;
    for (let j = 0; j < kids.length; j++) {
      const s = slot(j);
      if (d.y >= s.top && d.y <= s.bottom) return j;
    }
    return d.over; // no vão entre dois cards: mantém o alvo anterior
  };

  // Reposiciona o card sob o ponteiro e recalcula o alvo.
  const update = () => {
    const ty = Math.min(maxTy, Math.max(minTy, d.y - d.startY + (scroller.scrollTop - d.startScroll)));
    el.style.transform = `translateY(${ty}px)`;
    const over = hitTest(ty);
    if (over !== d.over) { d.over = over; setDragOver(over); }
  };
  // A cada frame, não só no pointermove: a rolagem (automática ou pela roda do mouse) move o
  // conteúdo com o ponteiro parado.
  const tick = () => {
    const v = edgeSpeed(scroller, d.y, list);
    if (v) scroller.scrollTop += v;
    update();
    d.raf = requestAnimationFrame(tick);
  };

  const onMove = ev => {
    d.y = ev.clientY;
    if (d.started || Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY) < DRAG_THRESHOLD) return;
    d.started = true;
    document.body.classList.add("drag-sorting");
    setDragging(i);
    setDragOver(i);
    d.raf = requestAnimationFrame(tick);
  };
  const onUp = ev => { d.y = ev.clientY; d.stop(true); };
  const onCancel = () => d.stop(false);
  const onKey = ev => { if (ev.key === "Escape") d.stop(false); };

  d.stop = drop => {
    if (activeDrag !== d) return;
    activeDrag = null;
    cancelAnimationFrame(d.raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    window.removeEventListener("keydown", onKey);
    if (!d.started) return;
    if (drop) update(); // soltar no mesmo frame do último movimento: alvo ainda não recalculado
    document.body.classList.remove("drag-sorting");
    el.style.transform = "";
    if (drop && d.over !== i && items.length === list.children.length) {
      const next = [...items];
      const [moved] = next.splice(i, 1);
      next.splice(d.over, 0, moved);
      onReorder(next);
    }
    setDragging(null);
    setDragOver(null);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("keydown", onKey);
}

// Arraste por pointer events, não drag nativo do HTML5: no drag nativo a roda do mouse não rola
// (Linux) e a rolagem automática na borda é mínima, então não dava para levar um card além da tela.
// Aqui o card segue o ponteiro, a borda do painel rola sozinha e a roda continua funcionando.
export function DragList({ items, onReorder, renderItem }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  useEffect(() => () => { if (activeDrag?.owner === setDragging) activeDrag.stop(false); }, []);

  // Só a alça inicia o arraste: clicar/arrastar dentro dos inputs continua selecionando texto.
  const handleProps = {
    className: "drag-handle",
    onPointerDown: e => startDrag(e, { items, onReorder, setDragging, setDragOver }),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          data-drag-item=""
          style={{
            position: "relative",
            zIndex: dragging === i ? 20 : "auto",
            opacity: dragging === i ? 0.92 : 1,
            boxShadow: dragging === i ? "0 18px 44px rgba(0,0,0,.45)" : "none",
            transition: "opacity .15s, box-shadow .15s",
            borderRadius: "var(--r)",
            outline: dragOver === i && dragging !== i ? "2px solid var(--ac)" : "none",
            outlineOffset: 2,
          }}
        >
          {renderItem(item, i, handleProps)}
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
