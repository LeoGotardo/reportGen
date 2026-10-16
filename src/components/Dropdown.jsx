import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bi } from "./Bi";

function OptionLabel({ option }) {
  if (option.color) return <span className="dd-pill" style={{ color: option.color, background: option.bg }}>{option.label}</span>;
  return (
    <span className="dd-label">
      {option.icon && <Bi name={option.icon} size={13} style={{ color: "var(--tx3)", flexShrink: 0 }} />}
      <span className="dd-label-text">{option.label}</span>
    </span>
  );
}

/**
 * Dropdown no padrão "select-only combobox": foco fica no botão, setas navegam, Enter escolhe.
 * O menu vai para um portal (no <body>, ou no diálogo em volta) com position: fixed — não é
 * cortado pelo overflow de tabelas e cards.
 *
 * options: [{ value, label, color?, bg?, icon? }]
 * renderButton(selected, open): conteúdo do botão (padrão: opção selecionada + chevron).
 */
export function Dropdown({ value, options, onChange, ariaLabel, title, placeholder = "—", className = "", renderButton, align = "start" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [container, setContainer] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId();

  const selectedIdx = options.findIndex(o => o.value === value);
  const selected = options[selectedIdx];

  const openMenu = () => {
    // Dentro de um diálogo aria-modal o menu precisa ficar no próprio diálogo: o que está
    // fora dele é tratado como inerte por leitores de tela.
    setContainer(btnRef.current?.closest('[role="dialog"]') ?? document.body);
    setActive(Math.max(0, selectedIdx));
    setOpen(true);
  };
  const close = () => { setOpen(false); btnRef.current?.focus(); };
  const choose = i => {
    const option = options[i];
    if (!option) return;
    close();
    if (option.value !== value) onChange(option.value);
  };

  // Abaixo do botão; acima se não couber. Mesma largura mínima do botão, sempre dentro da tela.
  const place = useCallback(() => {
    const btn = btnRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;
    const r = btn.getBoundingClientRect();
    menu.style.minWidth = `${r.width}px`;
    const { offsetHeight: mh, offsetWidth: mw } = menu;
    const below = window.innerHeight - r.bottom;
    const top = mh + 8 > below && r.top > below ? r.top - mh - 4 : r.bottom + 4;
    const left = align === "end" ? r.right - mw : r.left;
    menu.style.top = `${Math.max(8, top)}px`;
    menu.style.left = `${Math.max(8, Math.min(left, window.innerWidth - mw - 8))}px`;
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    let frame = 0;
    // capture: quem rola é o painel do editor/modal, não a janela
    const onMove = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
    const onPointerDown = e => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) menuRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = e => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openMenu(); }
      return;
    }
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive(a => Math.min(last, a + 1)); break;
      case "ArrowUp":   e.preventDefault(); setActive(a => Math.max(0, a - 1)); break;
      case "Home":      e.preventDefault(); setActive(0); break;
      case "End":       e.preventDefault(); setActive(last); break;
      case "Enter":
      case " ":         e.preventDefault(); choose(active); break;
      // stopPropagation: senão o Esc também fecha o modal em volta
      case "Escape":    e.preventDefault(); e.stopPropagation(); close(); break;
      case "Tab":       setOpen(false); break;
      default: break;
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        role="combobox"
        className={`dd-btn ${className}`.trim()}
        aria-label={ariaLabel}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
        onClick={e => { e.stopPropagation(); if (open) setOpen(false); else openMenu(); }}
        onKeyDown={onKeyDown}
      >
        {renderButton ? renderButton(selected, open) : (
          <>
            <span className="dd-value">{selected ? <OptionLabel option={selected} /> : placeholder}</span>
            <Bi name="chevron-down" size={11} style={{ color: "var(--tx3)", flexShrink: 0, transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }} />
          </>
        )}
      </button>
      {open && container && createPortal(
        // Eventos de portal sobem pela árvore React: sem o stopPropagation, escolher uma opção
        // também "clicaria" no card/linha onde o dropdown está.
        <div ref={menuRef} id={id} role="listbox" aria-label={ariaLabel} className="dd-menu"
          onClick={e => e.stopPropagation()} onMouseDown={e => e.preventDefault()}>
          {options.map((option, i) => (
            <div
              key={String(option.value)}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === selectedIdx}
              data-idx={i}
              className={`dd-option${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <OptionLabel option={option} />
              {i === selectedIdx && <Bi name="check-lg" size={13} style={{ marginLeft: "auto", color: "var(--ac)", flexShrink: 0 }} />}
            </div>
          ))}
        </div>,
        container,
      )}
    </>
  );
}
