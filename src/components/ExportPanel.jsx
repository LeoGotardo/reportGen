import React, { useState } from "react";
import { Bi } from "./Bi";
import { buildBugsHtml, buildStudyHtml, buildChangelogHtml } from "../utils/exportUtils";

export function ExportPanel({ config, activeTemplate }) {
  const [exporting, setExporting] = useState(false);
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const html = activeTemplate === "study" ? buildStudyHtml(config) : (activeTemplate === "changelog" ? buildChangelogHtml(config) : buildBugsHtml(config));
      const win = window.open("", "_blank");
      win.document.write(html); win.document.close();
      setExporting(false);
    }, 800);
  };

  const copyHtml = () => {
    const html = activeTemplate === "study" ? buildStudyHtml(config) : (activeTemplate === "changelog" ? buildChangelogHtml(config) : buildBugsHtml(config));
    navigator.clipboard.writeText(html);
    alert("HTML copiado para a área de transferência!");
  };

  return (
    <div style={{ padding: "44px 40px", textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
      {exporting && (
        <div className="export-overlay">
          <div className="export-spinner" />
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--disp)" }}>Gerando Relatório...</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Preparando assets e renderizando HTML</div>
        </div>
      )}
      <div style={{ width: 84, height: 84, borderRadius: 28, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", border: "1px solid var(--b2)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <Bi name="file-earmark-pdf-fill" size={38} style={{ color: "var(--ac)" }} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--disp)", marginBottom: 12, letterSpacing: -.5 }}>Pronto para exportar?</h2>
      <p style={{ fontSize: 15, color: "var(--tx3)", lineHeight: 1.6, marginBottom: 36 }}>O relatório será gerado em formato HTML otimizado para impressão. Você poderá salvar como PDF diretamente do navegador.</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={handleExport} className="btn-primary full" style={{ padding: "16px 32px", fontSize: 15 }}>
          <Bi name="printer-fill" size={18} /> Gerar Relatório e Imprimir
        </button>
        <button onClick={copyHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "14px 20px" }}>
          <Bi name="code-slash" size={16} /> Copiar Código HTML
        </button>
      </div>

      <div style={{ marginTop: 44, padding: "24px", background: "var(--bg2)", borderRadius: 18, border: "1px solid var(--b2)", textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Bi name="info-circle-fill" size={12} /> Dicas de Impressão
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Use o atalho Ctrl+P (ou Cmd+P) na nova aba",
            "Marque 'Gráficos de Segundo Plano' nas opções",
            "Remova 'Cabeçalhos e Rodapés' do navegador",
            "Defina as margens como 'Nenhuma' ou 'Padrão'"
          ].map((t, i) => (
            <li key={i} style={{ fontSize: 12, color: "var(--tx2)", display: "flex", gap: 10 }}>
              <span style={{ color: "var(--ac)", fontWeight: 800 }}>{i+1}.</span> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
