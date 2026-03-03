import React, { useState, useRef, useEffect } from "react";
import { Bi } from "./Bi";
import { initialBugsConfig, initialChangelogConfig, initialStudyConfig, emptyBugProblem, emptyChange, emptyStudyTopic } from "../constants/initialConfigs";

// Fix #2: Proper mergeConfig that normalises arrays, re-assigns IDs,
// and guarantees the nested `detalhe` structure on every item.
function mergeConfig(incoming) {
  const template = incoming.template || "bugs";
  const base =
    template === "changelog" ? initialChangelogConfig :
    template === "study"     ? initialStudyConfig     :
                               initialBugsConfig;

  const merged = { ...base, ...incoming };
  merged.cores = { ...base.cores, ...(incoming.cores || {}) };

  if (template === "changelog") {
    merged.mudancas = Array.isArray(incoming.mudancas)
      ? incoming.mudancas.map(m => ({ ...emptyChange(), ...m, id: Date.now() + Math.random() }))
      : [];
    if (!Array.isArray(merged.descricao) || !merged.descricao.length) merged.descricao = [""];
    if (!Array.isArray(merged.resumo)    || !merged.resumo.length)    merged.resumo    = [""];
  } else if (template === "study") {
    merged.topicos = Array.isArray(incoming.topicos)
      ? incoming.topicos.map(t => ({
          ...emptyStudyTopic(), ...t, id: Date.now() + Math.random(),
          detalhe: { explicacao: [""], exemplos: [""], codigo: [""], ...(t.detalhe || {}) },
        }))
      : [];
    if (!Array.isArray(merged.introducao) || !merged.introducao.length) merged.introducao = [""];
    if (!Array.isArray(merged.conclusao)  || !merged.conclusao.length)  merged.conclusao  = [""];
  } else {
    merged.problemas = Array.isArray(incoming.problemas)
      ? incoming.problemas.map(p => ({
          ...emptyBugProblem(), ...p, id: Date.now() + Math.random(),
          detalhe: {
            ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""],
            textoResolucao: [""], codigoResolucao: [""],
            ...(p.detalhe || {}),
          },
        }))
      : [];
    if (!Array.isArray(merged.resumoExecutivo) || !merged.resumoExecutivo.length) merged.resumoExecutivo = [""];
    if (!Array.isArray(merged.conclusao)       || !merged.conclusao.length)       merged.conclusao       = [""];
  }

  return merged;
}

export function JsonImportModal({ onClose, onImport }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleImport = () => {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) { setError("Cole um JSON válido no campo acima."); return; }
    let parsed;
    try { parsed = JSON.parse(trimmed); } catch (e) { setError(`JSON inválido: ${e.message}`); return; }
    if (typeof parsed !== "object" || Array.isArray(parsed)) { setError("O JSON deve ser um objeto."); return; }
    const merged = mergeConfig(parsed);
    setSuccess(true);
    setTimeout(() => { onImport(merged); onClose(); }, 700);
  };

  const handleFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="json-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="json-modal">
        <div className="json-modal-header">
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(249,115,22,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bi name="braces-asterisk" size={20} style={{ color: "#f97316" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>Importar JSON</div>
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 2 }}>Cole ou carregue um arquivo exportado anteriormente</div>
          </div>
          <button onClick={onClose} className="btn-icon"><Bi name="x-lg" size={15} /></button>
        </div>

        <div className="json-modal-body">
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <label className="btn-ghost" style={{ cursor: "pointer", fontSize: 12 }}>
              <Bi name="folder2-open" size={13} /> Abrir .json
              <input type="file" accept=".json,application/json" onChange={handleFile} style={{ display: "none" }} />
            </label>
            {text.trim() && (
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setText(""); setError(""); setSuccess(false); }}>
                <Bi name="x-circle" size={13} /> Limpar
              </button>
            )}
            <span style={{ fontSize: 12, color: "var(--tx3)", marginLeft: "auto" }}>{text.trim() ? `${text.length.toLocaleString()} chars` : ""}</span>
          </div>
          <textarea
            ref={textareaRef}
            className="json-textarea"
            value={text}
            onChange={e => { setText(e.target.value); setError(""); setSuccess(false); }}
            placeholder={`{\n  "template": "changelog",\n  "titulo": "...",\n  "mudancas": []\n}`}
            spellCheck={false}
          />
          {error   && <div className="json-error"><Bi name="exclamation-triangle-fill" size={15} style={{ flexShrink: 0 }} /><span>{error}</span></div>}
          {success && <div className="json-success"><Bi name="check-circle-fill" size={15} /><span>Importado com sucesso!</span></div>}
        </div>

        <div className="json-modal-footer">
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Cancelar</button>
          <button
            onClick={handleImport}
            disabled={!text.trim() || success}
            className="btn-primary"
            style={{ flex: 2, justifyContent: "center", opacity: !text.trim() ? 0.5 : 1 }}
          >
            <Bi name={success ? "check-lg" : "upload"} size={15} />
            {success ? "Importado!" : "Importar e aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}