import React, { useCallback } from "react";
import { Bi } from "./Bi";
import { ArrayField, ColorField, LogoField, SectionHeader } from "./UI";
import { BugProblemCard, BugTestCard } from "./BugsComponents";
import { ChangeCard } from "./ChangelogComponents";
import { StudyTopicCard } from "./StudyComponents";
import { TableCard } from "./TableComponents";
import { useIsMobile } from "../hooks/useIsMobile";
import { emptyBugProblem, emptyBugTest, emptyChange, emptyStudyTopic, emptyTable } from "../constants/initialConfigs";
import { useLang } from "../contexts/LangContext";

export function StudyEditor({ config, setConfig }) {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addTopic    = () => setConfig(c => ({ ...c, topicos: [...c.topicos, emptyStudyTopic()] }));
  const updateTopic = (id, p) => setConfig(c => ({ ...c, topicos: c.topicos.map(x => x.id === id ? p : x) }));
  const removeTopic = id      => setConfig(c => ({ ...c, topicos: c.topicos.filter(x => x.id !== id) }));
  const addTable    = () => setConfig(c => ({ ...c, tabelas: [...(c.tabelas || []), emptyTable()] }));
  const updateTable = (id, tbl) => setConfig(c => ({ ...c, tabelas: c.tabelas.map(x => x.id === id ? tbl : x) }));
  const removeTable = id      => setConfig(c => ({ ...c, tabelas: c.tabelas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-text" size={22} />} title={t.studyInfoSection} subtitle={t.studyInfoDesc} />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">{t.formatLabel}</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">{t.formatAbnt}</option><option value="CARTA">{t.formatLetter}</option></select></div>
            <div><label className="lbl">{t.versionLabel}</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.titleLabel}</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.studyTitlePh} /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.studySubtitleLabel}</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder={t.studySubtitlePh} /></div>
          <div style={{ marginBottom: 22 }}><label className="lbl">{t.studyAuthorLabel}</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder={t.studyAuthorPh} /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title={t.colorsSection} subtitle={t.colorsDesc} />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["concept","Conceito"],["practice","Prática"],["summary","Resumo"],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="info-circle" size={22} />} title={t.studyIntro} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.introducao} onChange={v => upd("introducao", v)} placeholder={t.studyIntroPh} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-bookmark-fill" size={22} />} title={t.studyTopics} subtitle={t.studyTopicsDesc} badge={config.topicos.length} />
        {config.topicos.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="journal-plus" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>{t.noTopics}</div>
            <button onClick={addTopic} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> {t.addTopic}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.topicos.map((topic, i) => (
              <StudyTopicCard key={topic.id} topic={topic} idx={i} onChange={p => updateTopic(topic.id, p)} onRemove={() => removeTopic(topic.id)} />
            ))}
            <button onClick={addTopic} className="btn-primary full" style={{ marginTop: 4 }}><Bi name="plus-circle-fill" size={16} /> {t.addTopic}</button>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="table" size={22} />} title={t.tablesSection} subtitle={t.tablesSectionDesc} badge={(config.tabelas || []).length} />
        {(config.tabelas || []).length === 0 ? (
          <div className="card" style={{ padding: "40px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 16 }}>{t.noTables}</div>
            <button onClick={addTable} className="btn-ghost"><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(config.tabelas || []).map((tbl, i) => (
              <TableCard key={tbl.id} table={tbl} idx={i} onChange={updated => updateTable(tbl.id, updated)} onRemove={() => removeTable(tbl.id)} />
            ))}
            <button onClick={addTable} className="btn-ghost" style={{ marginTop: 4 }}><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title={t.studyConclusion} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder={t.studyConclusionPh} />
        </div>
      </div>
    </div>
  );
}

export function BugsEditor({ config, setConfig }) {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addProblem    = () => setConfig(c => ({ ...c, problemas: [...c.problemas, emptyBugProblem()] }));
  const updateProblem = (id, p) => setConfig(c => ({ ...c, problemas: c.problemas.map(x => x.id === id ? p : x) }));
  const removeProblem = id      => setConfig(c => ({ ...c, problemas: c.problemas.filter(x => x.id !== id) }));
  const addTest    = () => setConfig(c => ({ ...c, testes: [...(c.testes || []), emptyBugTest()] }));
  const updateTest = (id, ts) => setConfig(c => ({ ...c, testes: c.testes.map(x => x.id === id ? ts : x) }));
  const removeTest = id      => setConfig(c => ({ ...c, testes: c.testes.filter(x => x.id !== id) }));
  const addTable    = () => setConfig(c => ({ ...c, tabelas: [...(c.tabelas || []), emptyTable()] }));
  const updateTable = (id, tbl) => setConfig(c => ({ ...c, tabelas: c.tabelas.map(x => x.id === id ? tbl : x) }));
  const removeTable = id      => setConfig(c => ({ ...c, tabelas: c.tabelas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="file-earmark-text" size={22} />} title={t.bugsInfoSection} subtitle={t.bugsInfoDesc} />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">{t.formatLabel}</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">{t.formatAbnt}</option><option value="CARTA">{t.formatLetter}</option></select></div>
            <div><label className="lbl">{t.versionLabel}</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.titleLabel}</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.bugsTitlePh} /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.bugsSubtitleLabel}</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder={t.bugsSubtitlePh} /></div>
          <div style={{ marginBottom: 22 }}><label className="lbl">{t.bugsAuthorLabel}</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder={t.bugsAuthorPh} /></div>
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
        <SectionHeader icon={<Bi name="journal-richtext" size={22} />} title={t.bugsExecSummary} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumoExecutivo} onChange={v => upd("resumoExecutivo", v)} placeholder={t.bugsExecSummaryPh} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="table" size={22} />} title={t.tablesSection} subtitle={t.tablesSectionDesc} badge={(config.tabelas || []).length} />
        {(config.tabelas || []).length === 0 ? (
          <div className="card" style={{ padding: "40px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 16 }}>{t.noTables}</div>
            <button onClick={addTable} className="btn-ghost"><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(config.tabelas || []).map((tbl, i) => (
              <TableCard key={tbl.id} table={tbl} idx={i} onChange={updated => updateTable(tbl.id, updated)} onRemove={() => removeTable(tbl.id)} />
            ))}
            <button onClick={addTable} className="btn-ghost" style={{ marginTop: 4 }}><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="bug-fill" size={22} />} title={t.bugsProblems} subtitle={t.bugsProblemsDesc} badge={config.problemas.length} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.problemas.map((prob, i) => (
              <BugProblemCard key={prob.id} prob={prob} idx={i} onChange={p => updateProblem(prob.id, p)} onRemove={() => removeProblem(prob.id)} />
            ))}
            <button onClick={addProblem} className="btn-primary full" style={{ marginTop: 4 }}><Bi name="plus-circle-fill" size={16} /> {t.addProblem}</button>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="check2-all" size={22} />} title={t.bugTestsSection} subtitle={t.bugTestsSectionDesc} badge={(config.testes || []).length} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(config.testes || []).map((ts, i) => (
              <BugTestCard key={ts.id} test={ts} idx={i} onChange={p => updateTest(ts.id, p)} onRemove={() => removeTest(ts.id)} />
            ))}
            <button onClick={addTest} className="btn-primary full" style={{ marginTop: 4, background: "linear-gradient(135deg,#22c55e,#16a34a)" }}><Bi name="plus-circle-fill" size={16} /> {t.addTest}</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title={t.bugConclusion} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder={t.bugConclusionPh} />
        </div>
      </div>
    </div>
  );
}

export function ChangelogEditor({ config, setConfig }) {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addChange    = () => setConfig(c => ({ ...c, mudancas: [...c.mudancas, emptyChange()] }));
  const updateChange = (id, m) => setConfig(c => ({ ...c, mudancas: c.mudancas.map(x => x.id === id ? m : x) }));
  const removeChange = id      => setConfig(c => ({ ...c, mudancas: c.mudancas.filter(x => x.id !== id) }));
  const addTable    = () => setConfig(c => ({ ...c, tabelas: [...(c.tabelas || []), emptyTable()] }));
  const updateTable = (id, tbl) => setConfig(c => ({ ...c, tabelas: c.tabelas.map(x => x.id === id ? tbl : x) }));
  const removeTable = id      => setConfig(c => ({ ...c, tabelas: c.tabelas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="git" size={22} />} title={t.changelogInfoSection} subtitle={t.changelogInfoDesc} />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">{t.formatLabel}</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">{t.formatAbnt}</option><option value="CARTA">{t.formatLetter}</option></select></div>
            <div><label className="lbl">{t.versionLabel}</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder={t.changelogVersionPh} /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.titleLabel}</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder={t.changelogTitlePh} /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">{t.changelogSubtitleLabel}</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder={t.changelogSubtitlePh} /></div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div><label className="lbl">{t.changelogProjectLabel}</label><input className="inp" value={config.projeto} onChange={e => upd("projeto", e.target.value)} placeholder={t.changelogProjectPh} /></div>
            <div><label className="lbl">{t.changelogRepoLabel}</label><input className="inp" value={config.repositorio} onChange={e => upd("repositorio", e.target.value)} placeholder={t.changelogRepoPh} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 22 }}>
            <div><label className="lbl">{t.changelogDateStart}</label><input className="inp" type="date" value={config.dataInicio} onChange={e => upd("dataInicio", e.target.value)} /></div>
            <div><label className="lbl">{t.changelogDateEnd}</label><input className="inp" type="date" value={config.dataFim} onChange={e => upd("dataFim", e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 22 }}><label className="lbl">{t.changelogAuthorLabel}</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder={t.changelogAuthorPh} /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title={t.colorsSection} subtitle={t.colorsDesc} />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["breaking","Breaking"],["feat","Feature"],["fix","Fix"],["refactor","Refactor"],["perf","Perf"],["style","Style"],["chore","Chore"],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="textarea-t" size={22} />} title={t.changelogOverview} subtitle={t.changelogOverviewDesc} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.descricao} onChange={v => upd("descricao", v)} placeholder={t.changelogOverviewPh} />
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="git" size={22} />} title={t.changelogChanges} subtitle={t.changelogChangesDesc} badge={config.mudancas.length} />
        {config.mudancas.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="code-slash" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>{t.noChanges}</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>{t.noChangesDesc}</div>
            <button onClick={addChange} className="btn-primary" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Bi name="plus-circle-fill" size={16} /> {t.addChange}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.mudancas.map((change, i) => (
              <ChangeCard key={change.id} change={change} idx={i} onChange={m => updateChange(change.id, m)} onRemove={() => removeChange(change.id)} />
            ))}
            <button onClick={addChange} className="btn-primary full" style={{ marginTop: 4, background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Bi name="plus-circle-fill" size={16} /> {t.addChange}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="table" size={22} />} title={t.tablesSection} subtitle={t.tablesSectionDesc} badge={(config.tabelas || []).length} />
        {(config.tabelas || []).length === 0 ? (
          <div className="card" style={{ padding: "40px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 16 }}>{t.noTables}</div>
            <button onClick={addTable} className="btn-ghost"><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(config.tabelas || []).map((tbl, i) => (
              <TableCard key={tbl.id} table={tbl} idx={i} onChange={updated => updateTable(tbl.id, updated)} onRemove={() => removeTable(tbl.id)} />
            ))}
            <button onClick={addTable} className="btn-ghost" style={{ marginTop: 4 }}><Bi name="plus-lg" size={13} /> {t.addTable}</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title={t.changelogSummary} subtitle={t.changelogSummaryDesc} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumo} onChange={v => upd("resumo", v)} placeholder={t.changelogSummaryPh} />
        </div>
      </div>
    </div>
  );
}
