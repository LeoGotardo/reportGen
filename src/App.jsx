import { useState, useCallback } from "react";

// Bootstrap Icons via CDN — injetado uma vez no <head>
if (!document.getElementById("bi-css")) {
  const link = document.createElement("link");
  link.id   = "bi-css";
  link.rel  = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
  document.head.appendChild(link);
}

function Bi({ name, size = 16, style: s = {} }) {
  return <i className={`bi bi-${name}`} style={{ fontSize: size, lineHeight: 1, ...s }} />;
}

const initialConfig = {
  formato: "ABNT",
  cores: {
    primaria: "1F3864",
    secundaria: "2E75B6",
    altaSev: "C00000",
    mediaSev: "C55A11",
    baixaSev: "375623",
    codeBg: "1E1E1E",
    codeText: "D4D4D4",
  },
  logo: null,
  logoNome: "",
  titulo: "",
  subtitulo: "",
  autor: "",
  versao: "1.0",
  resumoExecutivo: [""],
  problemas: [],
  conclusao: [""],
};

const emptyProblem = () => ({
  id: Date.now(),
  titulo: "",
  severity: "ALTA",
  resumo: "",
  resolucao: "",
  detalhe: {
    ondeOcorre: [""],
    codigoOnde: [""],
    porqueProblema: [""],
    textoResolucao: [""],
    codigoResolucao: [""],
  },
});

const SEV_STYLES = {
  ALTA:  { bg: "#fff0f0", border: "#C00000", text: "#C00000", dot: "#C00000" },
  MÉDIA: { bg: "#fff7f0", border: "#C55A11", text: "#C55A11", dot: "#C55A11" },
  BAIXA: { bg: "#f0fff4", border: "#375623", text: "#375623", dot: "#375623" },
};

// ─── Components ──────────────────────────────────────────────────────────────

function ArrayField({ label, values, onChange, mono = false }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {values.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <textarea
            value={v}
            onChange={e => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            rows={mono ? 2 : 3}
            style={{ ...styles.input, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit", fontSize: mono ? 12 : 13, flex: 1, resize: "vertical" }}
          />
          <button
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            style={styles.iconBtn}
            title="Remover"
          ><Bi name="x-lg" size={12} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...values, ""])} style={styles.addBtn}>
        <Bi name="plus-lg" size={12} /> Adicionar linha
      </button>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ ...styles.label, marginBottom: 2 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          value={`#${value}`}
          onChange={e => onChange(e.target.value.replace("#", ""))}
          style={{ width: 36, height: 36, border: "none", borderRadius: 8, cursor: "pointer", background: "none" }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.replace("#", "").toUpperCase())}
          maxLength={6}
          style={{ ...styles.input, width: 80, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
        />
      </div>
    </div>
  );
}

function ProblemCard({ prob, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const sev = SEV_STYLES[prob.severity] || SEV_STYLES.ALTA;

  const upd = (field, val) => onChange({ ...prob, [field]: val });
  const updDetail = (field, val) => onChange({ ...prob, detalhe: { ...prob.detalhe, [field]: val } });

  return (
    <div style={{ border: `1.5px solid ${sev.border}`, borderRadius: 14, marginBottom: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: sev.bg, cursor: "pointer", userSelect: "none" }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: sev.text, background: sev.border, color: "#fff", padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
          #{idx + 1}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: sev.text, flexShrink: 0 }}>
          {prob.severity}
        </span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {prob.titulo || <em style={{ color: "#aaa", fontWeight: 400 }}>Sem título</em>}
        </span>
        <span style={{ fontSize: 14, color: sev.text, marginLeft: "auto" }}>{open ? <Bi name="chevron-up" /> : <Bi name="chevron-down" />}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ ...styles.iconBtn, color: "#888", border: "none", background: "transparent" }} title="Remover problema"><Bi name="trash3" size={13} /></button>
      </div>

      {open && (
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
            <div>
              <label style={styles.label}>Título</label>
              <input style={styles.input} value={prob.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: SQL Injection em endpoint de login" />
            </div>
            <div>
              <label style={styles.label}>Severidade</label>
              <select style={{ ...styles.input, width: 110, color: sev.text, fontWeight: 700 }} value={prob.severity} onChange={e => upd("severity", e.target.value)}>
                <option value="ALTA">ALTA</option>
                <option value="MÉDIA">MÉDIA</option>
                <option value="BAIXA">BAIXA</option>
              </select>
            </div>
          </div>

          <label style={styles.label}>Resumo (para tabela)</label>
          <textarea style={{ ...styles.input, resize: "vertical" }} rows={2} value={prob.resumo} onChange={e => upd("resumo", e.target.value)} placeholder="Descrição breve do problema" />

          <label style={styles.label}>Resolução (para tabela)</label>
          <textarea style={{ ...styles.input, resize: "vertical" }} rows={2} value={prob.resolucao} onChange={e => upd("resolucao", e.target.value)} placeholder="Ação de resolução resumida" />

          <div style={{ height: 1, background: "#f0f0f0", margin: "12px 0" }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Detalhamento</p>

          <ArrayField label="Onde ocorre" values={prob.detalhe.ondeOcorre} onChange={v => updDetail("ondeOcorre", v)} />
          <ArrayField label="Código onde ocorre" values={prob.detalhe.codigoOnde} onChange={v => updDetail("codigoOnde", v)} mono />
          <ArrayField label="Por que é um problema" values={prob.detalhe.porqueProblema} onChange={v => updDetail("porqueProblema", v)} />
          <ArrayField label="Texto de resolução" values={prob.detalhe.textoResolucao} onChange={v => updDetail("textoResolucao", v)} />
          <ArrayField label="Código de resolução" values={prob.detalhe.codigoResolucao} onChange={v => updDetail("codigoResolucao", v)} mono />
        </div>
      )}
    </div>
  );
}

function LogoField({ value, nome, onChange }) {
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target.result, file.name);
    reader.readAsDataURL(file);
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ gridColumn: "1/-1" }}>
      <label style={styles.label}>Logo da Empresa</label>

      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#fafafe", border: "1.5px solid #e0e0e8", borderRadius: 10 }}>
          <img src={value} alt="Logo" style={{ height: 48, maxWidth: 120, objectFit: "contain", borderRadius: 4 }} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Imagem carregada com sucesso</div>
          </div>
          <button
            onClick={() => onChange(null, "")}
            style={{ ...styles.iconBtn, color: "#C00000", borderColor: "#fcc" }}
            title="Remover logo"
          >
            <Bi name="trash3" size={13} />
          </button>
          <label style={{ ...styles.iconBtn, cursor: "pointer", color: "#2E75B6", borderColor: "#bee" }} title="Trocar imagem">
            <Bi name="arrow-repeat" size={13} />
            <input type="file" accept="image/*" onChange={onInputChange} style={{ display: "none" }} />
          </label>
        </div>
      ) : (
        <label
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "28px 20px", cursor: "pointer",
            border: `2px dashed ${drag ? "#2E75B6" : "#d0d0e0"}`,
            borderRadius: 10, background: drag ? "#f0f6ff" : "#fafafe",
            transition: "all 0.15s",
          }}
        >
          <Bi name="image" size={28} style={{ color: drag ? "#2E75B6" : "#bbb" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: drag ? "#2E75B6" : "#888" }}>
            Arraste uma imagem ou <span style={{ color: "#2E75B6", textDecoration: "underline" }}>clique para selecionar</span>
          </div>
          <div style={{ fontSize: 11, color: "#bbb" }}>PNG, JPG, SVG, WEBP — recomendado fundo transparente</div>
          <input type="file" accept="image/*" onChange={onInputChange} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );
}

function Section({ title, icon, children, accent = "#1F3864" }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid ${accent}20` }}>
        <span style={{ fontSize: 16, color: accent }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: accent, letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Preview Panel ─────────────────────────────────────────────────────────

function Preview({ config }) {
  const primary = `#${config.cores.primaria}`;
  const secondary = `#${config.cores.secundaria}`;
  const sevs = { ALTA: `#${config.cores.altaSev}`, MÉDIA: `#${config.cores.mediaSev}`, BAIXA: `#${config.cores.baixaSev}` };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12, lineHeight: 1.6, color: "#222", height: "100%", overflow: "auto" }}>
      {/* Capa */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px", borderBottom: `3px solid ${primary}20` }}>
        {config.logo && (
          <div style={{ marginBottom: 20 }}>
            <img src={config.logo} alt="Logo" style={{ maxHeight: 64, maxWidth: 200, objectFit: "contain" }} />
          </div>
        )}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>RELATÓRIO TÉCNICO</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: primary, lineHeight: 1.2, marginBottom: 8 }}>
          {config.titulo || "Título do Relatório"}
        </div>
        <div style={{ fontSize: 12, color: secondary, marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${secondary}` }}>
          {config.subtitulo || "Descrição do escopo"}
        </div>
        <div style={{ fontSize: 10, color: "#888" }}>{config.autor || "Autor"} · v{config.versao}</div>
      </div>

      {/* Resumo */}
      {config.resumoExecutivo.some(t => t) && (
        <div style={{ padding: "24px 24px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: primary, marginBottom: 8 }}>1. Resumo Executivo</div>
          {config.resumoExecutivo.filter(t => t).map((t, i) => (
            <p key={i} style={{ fontSize: 11, marginBottom: 8, color: "#333" }}>{t}</p>
          ))}
        </div>
      )}

      {/* Tabela */}
      {config.problemas.length > 0 && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: primary, marginBottom: 12 }}>2. Tabela de Problemas</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr>
                {["Problema", "Severidade", "Resolução"].map(h => (
                  <th key={h} style={{ background: primary, color: "#fff", padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.problemas.map((p, i) => {
                const c = sevs[p.severity] || sevs.ALTA;
                return (
                  <tr key={i} style={{ background: i % 2 ? "#f8f8fb" : "#fff" }}>
                    <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee", fontWeight: 600 }}>{p.titulo || "—"}</td>
                    <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee", fontWeight: 700, color: c }}>{p.severity}</td>
                    <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee", color: "#444" }}>{p.resolucao || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Conclusão */}
      {config.conclusao.some(t => t) && (
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: primary, marginBottom: 8 }}>4. Conclusão</div>
          {config.conclusao.filter(t => t).map((t, i) => (
            <p key={i} style={{ fontSize: 11, marginBottom: 8, color: "#333" }}>{t}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── JSON Output ─────────────────────────────────────────────────────────────

function JsonOutput({ config }) {
  const [copied, setCopied] = useState(false);

  const exportConfig = { ...config };
  delete exportConfig._instrucoes;
  // logo em base64 é mantido no JSON — pode ser grande dependendo da imagem
  exportConfig.problemas = config.problemas.map((p, i) => ({ ...p, id: i + 1 }));

  const json = JSON.stringify(exportConfig, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#1e1e2e", borderBottom: "1px solid #333" }}>
        <div style={{ flex: 1, fontSize: 12, color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>config.json</div>
        <button onClick={copy} style={{ ...styles.actionBtn, background: copied ? "#375623" : "#2E75B6", display: "flex", alignItems: "center", gap: 5 }}>
          <Bi name={copied ? "check-lg" : "clipboard"} size={12} /> {copied ? "Copiado" : "Copiar"}
        </button>
        <button onClick={download} style={{ ...styles.actionBtn, background: "#1F3864", display: "flex", alignItems: "center", gap: 5 }}>
          <Bi name="download" size={12} /> Baixar
        </button>
      </div>
      <pre style={{ flex: 1, margin: 0, padding: "16px", background: "#1e1e2e", color: "#d4d4d4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", overflow: "auto", lineHeight: 1.6 }}>
        {json}
      </pre>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [config, setConfig] = useState(initialConfig);
  const [tab, setTab] = useState("editor"); // editor | preview | json

  const upd = useCallback((field, val) => setConfig(c => ({ ...c, [field]: val })), []);
  const updCore = useCallback((field, val) => setConfig(c => ({ ...c, cores: { ...c.cores, [field]: val } })), []);
  const updLogo = useCallback((dataUrl, nome) => setConfig(c => ({ ...c, logo: dataUrl, logoNome: nome })), []);

  const addProblem = () => setConfig(c => ({ ...c, problemas: [...c.problemas, emptyProblem()] }));

  const updateProblem = (id, newProb) =>
    setConfig(c => ({ ...c, problemas: c.problemas.map(p => p.id === id ? newProb : p) }));

  const removeProblem = (id) =>
    setConfig(c => ({ ...c, problemas: c.problemas.filter(p => p.id !== id) }));

  const totalProbs = config.problemas.length;
  const altaCount = config.problemas.filter(p => p.severity === "ALTA").length;
  const mediaCount = config.problemas.filter(p => p.severity === "MÉDIA").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Outfit', 'Segoe UI', sans-serif", background: "#f4f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        input, textarea, select { outline: none; }
        input:focus, textarea:focus, select:focus { border-color: #2E75B6 !important; box-shadow: 0 0 0 3px rgba(46,117,182,0.12); }
        button { cursor: pointer; font-family: inherit; }
      `}</style>

      {/* Top Bar */}
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 24px", height: 58, background: "#1F3864", color: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.18)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2E75B6, #4db8ff)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bi name="file-earmark-text-fill" size={17} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.3 }}>ReportGen</div>
            <div style={{ fontSize: 10, color: "#8eb8e8", letterSpacing: 0.5 }}>Gerador de Relatórios Técnicos</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginLeft: 24, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 4 }}>
          {[
          ["editor",  <><Bi name="pencil-fill" size={12} /> Editor</>],
          ["preview", <><Bi name="eye-fill" size={12} /> Preview</>],
          ["json",    <><Bi name="braces" size={12} /> JSON</>],
        ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "6px 16px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 600,
                background: tab === id ? "#2E75B6" : "transparent",
                color: tab === id ? "#fff" : "rgba(255,255,255,0.6)",
                transition: "all 0.15s",
              }}
            >{label}</button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
          {totalProbs > 0 && (
            <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
              {altaCount > 0 && <span style={{ background: "#C0000022", color: "#ff8080", border: "1px solid #C00000", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{altaCount} Alta</span>}
              {mediaCount > 0 && <span style={{ background: "#C55A1122", color: "#ffa060", border: "1px solid #C55A11", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{mediaCount} Média</span>}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#8eb8e8" }}>{config.formato} • {totalProbs} problema{totalProbs !== 1 ? "s" : ""}</div>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* EDITOR */}
        {tab === "editor" && (
          <div style={{ flex: 1, overflow: "auto", padding: "28px 32px", maxWidth: 820, margin: "0 auto" }}>

            <Section title="Configurações Gerais" icon={<Bi name="gear-fill" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={styles.label}>Formato de Página</label>
                  <select style={styles.input} value={config.formato} onChange={e => upd("formato", e.target.value)}>
                    <option value="ABNT">ABNT (A4)</option>
                    <option value="CARTA">CARTA (US Letter)</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Versão</label>
                  <input style={styles.input} value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={styles.label}>Título do Relatório</label>
                  <input style={styles.input} value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Ex: Análise de Segurança — API de Pagamentos" />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={styles.label}>Subtítulo / Escopo</label>
                  <input style={styles.input} value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Descrição breve do sistema analisado" />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={styles.label}>Autor / Equipe</label>
                  <input style={styles.input} value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Nome do autor ou equipe responsável" />
                </div>
                <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
              </div>
            </Section>

            <Section title="Paleta de Cores" icon={<Bi name="palette-fill" />} accent="#2E75B6">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
                {[
                  ["primaria",   "Primária"],
                  ["secundaria", "Secundária"],
                  ["altaSev",    "Alta Sev."],
                  ["mediaSev",   "Média Sev."],
                  ["baixaSev",   "Baixa Sev."],
                  ["codeBg",     "Código BG"],
                  ["codeText",   "Código Texto"],
                ].map(([k, label]) => (
                  <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
                ))}
              </div>
            </Section>

            <Section title="Resumo Executivo" icon={<Bi name="journal-text" />}>
              <ArrayField values={config.resumoExecutivo} onChange={v => upd("resumoExecutivo", v)} />
            </Section>

            <Section title="Problemas" icon={<Bi name="bug-fill" />} accent="#C00000">
              {config.problemas.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 24px", background: "#fff", borderRadius: 12, border: "2px dashed #ddd", marginBottom: 16 }}>
                  <Bi name="bug" size={32} style={{ color: "#ccc", display: "block", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 13, color: "#999" }}>Nenhum problema cadastrado ainda.</div>
                </div>
              )}
              {config.problemas.map((prob, i) => (
                <ProblemCard
                  key={prob.id}
                  prob={prob}
                  idx={i}
                  onChange={p => updateProblem(prob.id, p)}
                  onRemove={() => removeProblem(prob.id)}
                />
              ))}
              <button onClick={addProblem} style={{ ...styles.primaryBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Bi name="plus-circle-fill" size={15} /> Adicionar Problema
              </button>
            </Section>

            <Section title="Conclusão" icon={<Bi name="check-circle-fill" />}>
              <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} />
            </Section>
          </div>
        )}

        {/* PREVIEW */}
        {tab === "preview" && (
          <div style={{ flex: 1, overflow: "auto", padding: 32, background: "#e8e8f0" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 4, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", minHeight: 800, overflow: "hidden" }}>
              <Preview config={config} />
            </div>
          </div>
        )}

        {/* JSON */}
        {tab === "json" && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <JsonOutput config={config} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Base Styles ─────────────────────────────────────────────────────────────

const styles = {
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #e0e0e8",
    borderRadius: 9,
    fontSize: 13,
    color: "#1a1a2e",
    background: "#fafafe",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
  },
  iconBtn: {
    width: 32,
    height: 32,
    border: "1.5px solid #e0e0e8",
    borderRadius: 8,
    background: "#fff",
    fontSize: 12,
    color: "#999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.1s",
  },
  addBtn: {
    padding: "7px 14px",
    border: "1.5px dashed #2E75B6",
    borderRadius: 8,
    background: "transparent",
    color: "#2E75B6",
    fontSize: 12,
    fontWeight: 600,
    transition: "background 0.15s",
  },
  primaryBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #1F3864, #2E75B6)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.5,
    boxShadow: "0 4px 14px rgba(31,56,100,0.25)",
  },
  actionBtn: {
    padding: "6px 14px",
    border: "none",
    borderRadius: 7,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
};