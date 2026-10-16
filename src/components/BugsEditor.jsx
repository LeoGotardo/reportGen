import React, { useCallback } from "react";
import { Bi } from "./Bi";
import { ArrayField, ColorField, DateField, DragList, LogoField, SectionHeader } from "./UI";
import { BugProblemCard } from "./BugProblemCard";
import { BugTestCard } from "./BugTestCard";
import { TableCard } from "./TableComponents";
import { TestSuiteSection } from "./TestSuiteSection";
import { useIsMobile } from "../hooks/useIsMobile";
import { emptyBugProblem, emptyBugTest, emptyTable } from "../constants/initialConfigs";
import { useLang } from "../contexts/lang";

export function BugsEditor({ config, setConfig }) {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addProblem      = () => setConfig(c => ({ ...c, problemas: [...c.problemas, emptyBugProblem()] }));
  const updateProblem   = (id, p) => setConfig(c => ({ ...c, problemas: c.problemas.map(x => x.id === id ? p : x) }));
  const removeProblem   = id      => setConfig(c => ({ ...c, problemas: c.problemas.filter(x => x.id !== id) }));
  const reorderProblems = arr     => setConfig(c => ({ ...c, problemas: arr }));
  const addTest      = () => setConfig(c => ({ ...c, testes: [...(c.testes || []), emptyBugTest()] }));
  const updateTest   = (id, ts) => setConfig(c => ({ ...c, testes: c.testes.map(x => x.id === id ? ts : x) }));
  const removeTest   = id      => setConfig(c => ({ ...c, testes: c.testes.filter(x => x.id !== id) }));
  const reorderTests = arr     => setConfig(c => ({ ...c, testes: arr }));
  const addTable      = () => setConfig(c => ({ ...c, tabelas: [...(c.tabelas || []), emptyTable()] }));
  const updateTable   = (id, tbl) => setConfig(c => ({ ...c, tabelas: c.tabelas.map(x => x.id === id ? tbl : x) }));
  const removeTable   = id      => setConfig(c => ({ ...c, tabelas: c.tabelas.filter(x => x.id !== id) }));
  const reorderTables = arr     => setConfig(c => ({ ...c, tabelas: arr }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="file-earmark-text" size={22} />} title={t.bugsInfoSection} subtitle={t.bugsInfoDesc} anchor="sec:info" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">{t.formatLabel}</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">{t.formatAbnt}</option><option value="CARTA">{t.formatLetter}</option></select></div>
            <div><label className="lbl">{t.versionLabel}</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.titleLabel}</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.bugsTitlePh} /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.bugsSubtitleLabel}</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder={t.bugsSubtitlePh} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 22 }}>
            <div><label className="lbl">{t.bugsAuthorLabel}</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder={t.bugsAuthorPh} /></div>
            <DateField label={t.dateLabel} value={config.data} onChange={v => upd("data", v)} required />
          </div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title={t.colorsSection} subtitle={t.colorsDesc} />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["altaSev","Alta Sev."],["mediaSev","Média Sev."],["baixaSev","Baixa Sev."],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-richtext" size={22} />} title={t.bugsExecSummary} anchor="sec:resumoExecutivo" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumoExecutivo} onChange={v => upd("resumoExecutivo", v)} placeholder={t.bugsExecSummaryPh} rows={8} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="table" size={22} />} title={t.tablesSection} subtitle={t.tablesSectionDesc} badge={(config.tabelas || []).length} anchor="sec:tabelas" />
        {(config.tabelas || []).length === 0 ? (
          <div className="card" style={{ padding: "40px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 16 }}>{t.noTables}</div>
            <button onClick={addTable} className="btn-ghost"><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        ) : (
          <>
            <DragList
              items={config.tabelas || []}
              onReorder={reorderTables}
              renderItem={(tbl, i, dragHandleProps) => (
                <TableCard table={tbl} idx={i} onChange={updated => updateTable(tbl.id, updated)} onRemove={() => removeTable(tbl.id)} dragHandleProps={dragHandleProps} />
              )}
            />
            <button onClick={addTable} className="btn-ghost" style={{ marginTop: 14 }}><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </>
        )}
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="bug-fill" size={22} />} title={t.bugsProblems} subtitle={t.bugsProblemsDesc} badge={config.problemas.length} anchor="sec:problemas" />
        {config.problemas.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="shield-exclamation" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>{t.noBugs}</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>{t.noBugsDesc}</div>
            <button onClick={addProblem} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> {t.addProblem}</button>
          </div>
        ) : (
          <>
            <DragList
              items={config.problemas}
              onReorder={reorderProblems}
              renderItem={(prob, i, dragHandleProps) => (
                <BugProblemCard prob={prob} idx={i} onChange={p => updateProblem(prob.id, p)} onRemove={() => removeProblem(prob.id)} dragHandleProps={dragHandleProps} />
              )}
            />
            <button onClick={addProblem} className="btn-primary full" style={{ marginTop: 14 }}><Bi name="plus-circle-fill" size={16} /> {t.addProblem}</button>
          </>
        )}
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="check2-all" size={22} />} title={t.bugTestsSection} subtitle={t.bugTestsSectionDesc} badge={(config.testes || []).length} anchor="sec:testes" />
        {(config.testes || []).length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed #22c55e40" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "#22c55e12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="check2-square" size={32} style={{ color: "#22c55e" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>{t.noTests}</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>{t.noTestsDesc}</div>
            <button onClick={addTest} className="btn-primary" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}><Bi name="plus-circle-fill" size={16} /> {t.addTest}</button>
          </div>
        ) : (
          <>
            <DragList
              items={config.testes || []}
              onReorder={reorderTests}
              renderItem={(ts, i, dragHandleProps) => (
                <BugTestCard test={ts} idx={i} onChange={p => updateTest(ts.id, p)} onRemove={() => removeTest(ts.id)} dragHandleProps={dragHandleProps} />
              )}
            />
            <button onClick={addTest} className="btn-primary full" style={{ marginTop: 14, background: "linear-gradient(135deg,#22c55e,#16a34a)" }}><Bi name="plus-circle-fill" size={16} /> {t.addTest}</button>
          </>
        )}
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="list-check" size={22} />} title={t.suiteSection} subtitle={t.suiteSectionDesc} badge={(config.suiteTestes || []).length} anchor="sec:suiteTestes" />
        <TestSuiteSection rows={config.suiteTestes || []} onChange={v => upd("suiteTestes", v)} />
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title={t.bugConclusion} anchor="sec:conclusao" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder={t.bugConclusionPh} rows={8} />
        </div>
      </div>
    </div>
  );
}
