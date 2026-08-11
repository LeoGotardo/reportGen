import React, { useCallback } from "react";
import { Bi } from "./Bi";
import { ArrayField, ColorField, DragList, LogoField, SectionHeader } from "./UI";
import { StudyTopicCard } from "./StudyComponents";
import { TableCard } from "./TableComponents";
import { useIsMobile } from "../hooks/useIsMobile";
import { emptyStudyTopic, emptyTable } from "../constants/initialConfigs";
import { useLang } from "../contexts/LangContext";

export function StudyEditor({ config, setConfig }) {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addTopic      = () => setConfig(c => ({ ...c, topicos: [...c.topicos, emptyStudyTopic()] }));
  const updateTopic   = (id, p) => setConfig(c => ({ ...c, topicos: c.topicos.map(x => x.id === id ? p : x) }));
  const removeTopic   = id      => setConfig(c => ({ ...c, topicos: c.topicos.filter(x => x.id !== id) }));
  const reorderTopics = arr     => setConfig(c => ({ ...c, topicos: arr }));
  const addTable      = () => setConfig(c => ({ ...c, tabelas: [...(c.tabelas || []), emptyTable()] }));
  const updateTable   = (id, tbl) => setConfig(c => ({ ...c, tabelas: c.tabelas.map(x => x.id === id ? tbl : x) }));
  const removeTable   = id      => setConfig(c => ({ ...c, tabelas: c.tabelas.filter(x => x.id !== id) }));
  const reorderTables = arr     => setConfig(c => ({ ...c, tabelas: arr }));

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
          <>
            <DragList
              items={config.topicos}
              onReorder={reorderTopics}
              renderItem={(topic, i, dragHandleProps) => (
                <StudyTopicCard topic={topic} idx={i} onChange={p => updateTopic(topic.id, p)} onRemove={() => removeTopic(topic.id)} dragHandleProps={dragHandleProps} />
              )}
            />
            <button onClick={addTopic} className="btn-primary full" style={{ marginTop: 14 }}><Bi name="plus-circle-fill" size={16} /> {t.addTopic}</button>
          </>
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
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title={t.studyConclusion} />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder={t.studyConclusionPh} rows={8} />
        </div>
      </div>
    </div>
  );
}
