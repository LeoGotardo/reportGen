import React from "react";
import { parseBlocks, parseMarkdown } from "../utils/markdown";

const CODE = { background: "#f0f0f3", color: "#c7254e", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace", fontSize: ".92em" };
// Mesmo visual de CustomTables; a cor vem de --md-primary, definida na raiz do preview.
const TH = { color: "#fff", padding: "9px 14px", textAlign: "left", fontWeight: 700, background: "var(--md-primary, #1F3864)" };
const TD = { padding: "8px 14px", borderBottom: "1px solid #eee", color: "#333", verticalAlign: "top" };

function Inline({ text }) {
  return (
    <span style={{ whiteSpace: "pre-line" }}>
      {parseMarkdown(text).map((tok, i) =>
        tok.bold   ? <strong key={i}>{tok.text}</strong> :
        tok.italic ? <em key={i}>{tok.text}</em> :
        tok.code   ? <code key={i} style={CODE}>{tok.text}</code> :
        tok.href   ? <a key={i} href={tok.href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>{tok.text}</a> :
                     tok.text)}
    </span>
  );
}

/**
 * Prosa com markdown (ver utils/markdown.js); quebras de linha do campo viram linhas.
 * Tabelas são bloco: o container não pode ser <p>. `inline` (célula de tabela) ignora tabelas.
 */
export function Md({ text, inline = false }) {
  if (inline) return <Inline text={text} />;
  return parseBlocks(text).map((b, i) => !b.head ? <Inline key={i} text={b.text} /> : (
    <table key={i} style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, margin: "8px 0 12px" }}>
      <thead><tr>{b.head.map((h, ci) => <th key={ci} style={TH}><Inline text={h} /></th>)}</tr></thead>
      <tbody>
        {b.rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 ? "#f8f8fb" : "#fff" }}>
            {row.map((cell, ci) => <td key={ci} style={TD}><Inline text={cell} /></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  ));
}
