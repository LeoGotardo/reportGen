import React from "react";
import { Bi } from "./Bi";
import { TEMPLATES } from "../constants/templates";
import { useLang } from "../contexts/LangContext";

export function TemplateSelector({ current, onSelect, onClose }) {
  const { t } = useLang();
  return (
    <div className="tmpl-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tmpl-modal">
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--b1)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--disp)", marginBottom: 6 }}>{t.chooseTemplate}</div>
          <div style={{ fontSize: 13, color: "var(--tx3)" }}>{t.chooseTemplateSub}</div>
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
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>{t[`tmpl_${tmpl.id}_label`]}</div>
                  <div style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.5 }}>{t[`tmpl_${tmpl.id}_desc`]}</div>
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
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
