import React, { useState } from "react";
import { Bi } from "./Bi";
import { buildBugsHtml, buildStudyHtml, buildChangelogHtml } from "../utils/exportUtils";
import { getPdfMake } from "../utils/cdnLoaders";
import { logoToDataUrl, bugsPdf, changelogPdf, studyPdf } from "../utils/pdfBuilders";
import { buildDocxBlob } from "../utils/buildDocxBlob";
import { useLang } from "../contexts/lang";

export function ExportPanel({ config, activeTemplate }) {
  const { t } = useLang();
  const [status, setStatus]       = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const getHtml = () =>
    activeTemplate === "study"     ? buildStudyHtml(config, t) :
    activeTemplate === "changelog" ? buildChangelogHtml(config, t) :
                                     buildBugsHtml(config, t);

  const run = async (label, fn) => {
    setStatus("loading"); setStatusMsg(label);
    try {
      await fn();
      setStatus("done"); setStatusMsg(t.done);
      setTimeout(() => setStatus(null), 2200);
    } catch (e) {
      console.error(e);
      setStatus("error"); setStatusMsg(e.message || t.unexpectedError);
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const handlePdf = () => run(t.loadingPdfmake, async () => {
    const pm = await getPdfMake();
    setStatusMsg(t.generatingPdf);
    const logo = await logoToDataUrl(config.logo);
    const def  =
      activeTemplate === "study"     ? studyPdf(config, logo, t) :
      activeTemplate === "changelog" ? changelogPdf(config, logo, t) :
                                       bugsPdf(config, logo, t);
    pm.createPdf(def).download(`relatorio-${activeTemplate}-v${config.versao || "1"}.pdf`);
  });

  const handleDocx = () => run(t.loadingDocx, async () => {
    setStatusMsg(t.generatingDocx);
    const blob = await buildDocxBlob(config, activeTemplate, t);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${activeTemplate}-v${config.versao || "1"}.docx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  const handleHtml = () => run(t.opening, async () => {
    const w = window.open("", "_blank");
    if (!w) throw new Error(t.popupBlocked);
    const blob = new Blob([getHtml()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    w.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });

  const handleDownloadHtml = () => run(t.preparingHtml, async () => {
    const blob = new Blob([getHtml()], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-${activeTemplate}-v${config.versao || "1"}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  const templateLabel = t[`tmpl_${activeTemplate}_label`] || activeTemplate;

  return (
    <div style={{ padding: "44px 40px", maxWidth: 520, margin: "0 auto" }}>

      {status === "loading" && (
        <div className="export-overlay">
          <div className="export-spinner" />
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--disp)" }}>{statusMsg}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>{t.waitMsg}</div>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 84, height: 84, borderRadius: 28, background: "var(--s2)", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--b2)", boxShadow: "0 20px 40px rgba(0,0,0,.3)", marginBottom: 20 }}>
          <Bi name="file-earmark-richtext-fill" size={38} style={{ color: "var(--ac)" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--disp)", marginBottom: 10, letterSpacing: -.4 }}>
          {t.exportHeading} — {templateLabel}
        </h2>
        <p style={{ fontSize: 14, color: "var(--tx3)", lineHeight: 1.7 }}>{t.exportChoose}</p>
        {status === "done"  && <div style={{ marginTop: 12, color: "#22c55e", fontWeight: 700, fontSize: 13 }}>✓ {statusMsg}</div>}
        {status === "error" && <div style={{ marginTop: 12, color: "#ef4444", fontWeight: 700, fontSize: 13 }}>✗ {statusMsg}</div>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={handlePdf} className="btn-primary full" style={{ padding: "16px 28px", fontSize: 15, background: "linear-gradient(135deg,#6271f5,#8b97ff)" }}>
          <Bi name="file-earmark-pdf-fill" size={17} /> {t.downloadPdf}
        </button>
        <button onClick={handleDocx} className="btn-primary full" style={{ padding: "16px 28px", fontSize: 15, background: "linear-gradient(135deg,#2563EB,#60a5fa)" }}>
          <Bi name="file-earmark-word-fill" size={17} /> {t.downloadDocx}
        </button>

        <div style={{ height: 1, background: "var(--b2)", margin: "4px 0" }} />

        <button onClick={handleHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
          <Bi name="box-arrow-up-right" size={15} /> {t.openHtml}
        </button>
        <button onClick={handleDownloadHtml} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
          <Bi name="download" size={15} /> {t.downloadHtml}
        </button>
      </div>

      <div style={{ marginTop: 36, padding: "22px 24px", background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--b2)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Bi name="info-circle-fill" size={12} style={{ color: "var(--ac)" }} /> {t.tips}
        </div>
        {[
          ["file-earmark-pdf-fill",  t.tipPdf],
          ["file-earmark-word-fill", t.tipDocx],
          ["printer-fill",           t.tipHtml],
        ].map(([icon, text], i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
            <Bi name={icon} size={13} style={{ color: "var(--ac)", marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--tx2)", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: "var(--tx3)" }}>
        {t.madeWith}{" "}
        <a
          href="https://leogotardo.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--ac)", fontWeight: 700, textDecoration: "none" }}
        >
          Leo Gotardo
        </a>
      </div>

    </div>
  );
}
