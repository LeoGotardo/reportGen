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

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.values(TEMPLATES).map(tmpl => {
            const active = current === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={`tmpl-card${active ? " active" : ""}`}
                onClick={() => { onSelect(tmpl.id); onClose(); }}
              >
                <div className="tmpl-card-glow" style={{ background: tmpl.accent }} />
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: tmpl.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${tmpl.accent}30` }}>
                    <Bi name={tmpl.icon} size={24} style={{ color: tmpl.accent }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--tx)", marginBottom: 4 }}>{t[`tmpl_${tmpl.id}_label`]}</div>
                    <div style={{ fontSize: 12, color: "var(--tx3)", lineHeight: 1.4 }}>{t[`tmpl_${tmpl.id}_desc`]}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${active ? tmpl.accent : "var(--b2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {active && <div style={{ width: 9, height: 9, borderRadius: "50%", background: tmpl.accent }} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--b1)" }}>
          <button onClick={onClose} className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
