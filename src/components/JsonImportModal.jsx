import React, { useState } from "react";
import { Bi } from "./Bi";

export function JsonImportModal({ onClose, onImport, currentConfig }) {
  const [json, setJson] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.template) throw new Error("JSON inválido: falta campo 'template'");
      const merged = { ...currentConfig, ...parsed };
      setSuccess(true);
      setTimeout(() => { onImport(merged); onClose(); }, 1000);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="json-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="json-modal">
        <div className="json-modal-header">
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="upload" size={20} style={{ color: "var(--ac)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--disp)", color: "var(--tx)" }}>Importar Configuração</div>
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 2 }}>Cole o conteúdo JSON do seu relatório anterior</div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: "transparent", border: "none" }}><Bi name="x-lg" size={18} /></button>
        </div>
        <div className="json-modal-body">
          <textarea
            className="json-textarea"
            value={json}
            onChange={e => { setJson(e.target.value); setError(null); }}
            placeholder='{ "template": "bugs", "titulo": "Relatório de Exemplo", ... }'
          />
          {error && <div className="json-error"><Bi name="exclamation-circle-fill" size={14} /> {error}</div>}
          {success && <div className="json-success"><Bi name="check-circle-fill" size={14} /> Configuração importada com sucesso!</div>}
        </div>
        <div className="json-modal-footer">
          <button onClick={onClose} className="btn-ghost" style={{ padding: "12px 24px" }}>Cancelar</button>
          <button onClick={handleImport} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "12px 24px" }}>
            <Bi name="cloud-upload-fill" size={16} /> Carregar Configuração
          </button>
        </div>
      </div>
    </div>
  );
}
