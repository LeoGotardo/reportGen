import React, { useState } from "react";
import { Bi } from "./Bi";
import { useLang } from "../contexts/lang";
import reportSchema from "../../report-schema.json";

export function JsonOutput({ config }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);
  const json = JSON.stringify(config, null, 2);
  const copy = () => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(reportSchema, null, 2));
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2000);
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = "report-config.json"; a.click();
  };
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0d1117" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 22px", borderBottom: "1px solid #30363d", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#8b949e", marginLeft: 4 }}>report-config.json</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={copy} style={{ padding: "7px 16px", border: "1px solid #30363d", borderRadius: 7, fontSize: 12, fontWeight: 600, background: copied ? "rgba(34,197,94,.15)" : "#161b22", color: copied ? "#22c55e" : "#8b949e", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--fn)" }}>
            <Bi name={copied ? "check-lg" : "clipboard"} size={12} /> {copied ? t.copied : t.copy}
          </button>
          <button onClick={copySchema} title={t.copySchemaHint} style={{ padding: "7px 16px", border: "1px solid #30363d", borderRadius: 7, fontSize: 12, fontWeight: 600, background: schemaCopied ? "rgba(34,197,94,.15)" : "#161b22", color: schemaCopied ? "#22c55e" : "#8b949e", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--fn)" }}>
            <Bi name={schemaCopied ? "check-lg" : "stars"} size={12} /> {schemaCopied ? t.copied : t.copySchema}
          </button>
          <button onClick={download} style={{ padding: "7px 16px", border: "1px solid #30363d", borderRadius: 7, fontSize: 12, fontWeight: 600, background: "#161b22", color: "#8b949e", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--fn)" }}>
            <Bi name="download" size={12} /> {t.download}
          </button>
        </div>
      </div>
      <pre style={{ flex: 1, margin: 0, padding: "22px 26px", overflowY: "auto", fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.7, color: "#e6edf3", background: "#0d1117" }}>{json}</pre>
    </div>
  );
}
